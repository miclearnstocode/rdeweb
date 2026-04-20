<?php
ob_start();
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once(__DIR__ . '/../db.php');

header('Content-Type: application/json; charset=utf-8');

class PresentationAPI {
    private $con;
    private $response;
    
    public function __construct($dbConnection) {
        $this->con = $dbConnection;
        $this->response = new stdClass();
        $this->response->status = false;
        $this->response->message = '';
        $this->response->data = [];
        $this->response->stats = [
            'total' => 0,
            'international' => 0,
            'national' => 0,
            'regional' => 0,
            'university' => 0
        ];
        $this->response->years = []; // Available years for filtering
    }

    private function getAvailableYears() {
        $query = "SELECT DISTINCT YEAR(e.date) as year 
                 FROM researchfile rf
                 INNER JOIN endorsement e ON rf.endorsementid = e.id
                 WHERE e.status = 'accepted'
                 AND rf.event_id IS NOT NULL
                 AND e.date IS NOT NULL
                 ORDER BY year DESC";
        
        $result = $this->con->query($query);
        $years = [];
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                if ($row['year']) {
                    $years[] = (int)$row['year'];
                }
            }
        }
        
        return $years;
    }

    public function getResearchPapers() {
        try {
            $query = "SELECT 
                        rf.id,
                        rf.author,
                        rf.presenter,
                        rf.coauthor,
                        rf.title,
                        rf.category,
                        rf.campus,
                        rf.center,
                        rf.event
                    FROM researchfile rf
                    WHERE EXISTS (
                        SELECT 1 
                        FROM endorsement e 
                        WHERE e.id = rf.id 
                        AND e.status = 'accepted'
                    )
                    AND rf.event_id IS NOT NULL
                    ORDER BY rf.title ASC";
            
            $result = $this->con->query($query);
            
            if (!$result) {
                throw new Exception("Query failed: " . $this->con->error);
            }
            
            $papers = [];
            
            while ($row = $result->fetch_assoc()) {
                // Parse coauthor JSON
                $coauthor = $row['coauthor'];
                $coauthors = [];
                
                if (!empty($coauthor) && $coauthor !== 'NULL' && $coauthor !== null) {
                    // Check if it's a JSON array
                    if (is_string($coauthor) && (strpos($coauthor, '[') === 0 || strpos($coauthor, '{') === 0)) {
                        $coauthors = json_decode($coauthor, true);
                        if (!is_array($coauthors)) {
                            $coauthors = [];
                        }
                    } else {
                        // Handle comma-separated list
                        $coauthors = explode(',', $coauthor);
                        $coauthors = array_map('trim', $coauthors);
                        // Filter out 'NULL' values
                        $coauthors = array_filter($coauthors, function($c) {
                            return $c !== 'NULL' && !empty($c);
                        });
                    }
                }
                
                // Build all researchers list
                $allResearchers = [];
                if (!empty($row['author']) && $row['author'] !== 'NULL' && $row['author'] !== null) {
                    $allResearchers[] = $row['author'];
                }
                
                foreach ($coauthors as $co) {
                    if (!empty($co) && $co !== 'NULL' && $co !== null) {
                        $allResearchers[] = $co;
                    }
                }
                
                // Remove duplicates
                $allResearchers = array_values(array_unique($allResearchers));
                
                $papers[] = [
                    'id' => (int)$row['id'],
                    'author' => $row['author'] ?? '',
                    'coauthor' => $coauthors,
                    'all_researchers' => $allResearchers,
                    'title' => $row['title'] ?? '',
                    'category' => $row['category'] ?? '',
                    'campus' => !empty($row['campus']) ? $row['campus'] : ($row['center'] ?? ''),
                    'event' => $row['event'] ?? ''
                ];
            }
            
            $this->response->status = true;
            $this->response->message = 'Research papers fetched successfully';
            $this->response->data = $papers;
            $this->response->count = count($papers);
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
        }
        
        echo json_encode($this->response);
    }
    
    public function fetchPresentations() {
        try {
            $cursor = $_POST['cursor'] ?? null;
            $direction = $_POST['direction'] ?? 'next';
            $year = $_POST['year'] ?? null;
            $level = $_POST['level'] ?? null;
            $search = $_POST['search'] ?? '';
            $limit = 15;
            
            // Get accurate stats from the dedicated method
            $stats = $this->getStatsFromResearch();
            
            // Base query
            $query = "SELECT 
                        e.id as endorsement_id,
                        e.date as endorsement_date,
                        e.status,
                        rf.id as research_id,
                        rf.author,
                        rf.presenter,
                        rf.coauthor,
                        rf.title,
                        rf.category,
                        rf.campus,
                        rf.center,
                        rf.event as event_title,
                        rf.event_id,
                        rf.date_completed
                    FROM endorsement e
                    INNER JOIN researchfile rf ON rf.endorsementid = e.id
                    WHERE e.status = 'accepted'
                    AND rf.event_id IS NOT NULL";

            // Add level filter based on presentation_research
            if (!empty($level)) {
                if ($level === 'university') {
                    // University: No external presentations
                    $query .= " AND NOT EXISTS (
                        SELECT 1 FROM presentation_research pr 
                        WHERE pr.research_id = rf.id
                    )";
                } else {
                    // International/National/Regional: Must have matching presentation
                    $query .= " AND EXISTS (
                        SELECT 1 FROM presentation_research pr 
                        WHERE pr.research_id = rf.id 
                        AND LOWER(pr.forum_type) = '" . $this->con->real_escape_string(strtolower($level)) . "'
                    )";
                }
            }

            // Add search
            if (!empty($search)) {
                $search = $this->con->real_escape_string($search);
                $query .= " AND (
                    rf.title LIKE '%$search%' 
                    OR rf.event LIKE '%$search%'
                    OR rf.author LIKE '%$search%'
                    OR rf.presenter LIKE '%$search%'
                    OR rf.category LIKE '%$search%'
                    OR rf.campus LIKE '%$search%'
                    OR rf.center LIKE '%$search%'
                    OR EXISTS (
                        SELECT 1 FROM presentation_research pr 
                        WHERE pr.research_id = rf.id 
                        AND (
                            pr.forum_title LIKE '%$search%'
                            OR pr.venue LIKE '%$search%'
                            OR pr.presentor LIKE '%$search%'
                            OR pr.forum_type LIKE '%$search%'
                        )
                    )
                )";
            }
            
            // Add year filter
            if ($year) {
                $query .= " AND YEAR(e.date) = " . intval($year);
            }

            // Cursor pagination
            if ($cursor) {
                if ($direction === 'next') {
                    $query .= " AND e.id < " . intval($cursor);
                } else {
                    $query .= " AND e.id > " . intval($cursor);
                }
            }

            // Order by endorsement ID
            if ($direction === 'next') {
                $query .= " ORDER BY e.id DESC";
            } else {
                $query .= " ORDER BY e.id ASC";
            }
            
            $query .= " LIMIT " . ($limit + 1);
            
            error_log("Fetch query with level=" . ($level ?: 'null') . ": " . $query);
            
            $result = $this->con->query($query);
            
            if (!$result) {
                throw new Exception("Query failed: " . $this->con->error);
            }
            
            $allPresentations = [];
            $hasMore = false;
            $nextCursor = null;
            $rows = [];
            
            // Fetch all rows first
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
            
            // Check if we have more records
            if (count($rows) > $limit) {
                $hasMore = true;
                array_pop($rows);
            }
            
            // Process each row
            foreach ($rows as $row) {
                $researchId = $row['research_id'];
                $endorsementId = $row['endorsement_id'];
                
                // Get all external presentations for this research
                $externalQuery = "SELECT 
                                    id as pr_id,
                                    presentor,
                                    forum_title,
                                    venue,
                                    presentation_date,
                                    forum_type,
                                    date_completed as pr_date_completed
                                FROM presentation_research 
                                WHERE research_id = " . intval($researchId);
                
                $externalResult = $this->con->query($externalQuery);
                
                // Initialize arrays - start empty
                $forumTitles = [];
                $venues = [];
                $presentationDates = [];
                $completionDates = [];
                $presentors = [];
                $hasInternational = false;
                $hasNational = false;
                $hasRegional = false;
                
                // Process external presentations
                if ($externalResult) {
                    while ($extRow = $externalResult->fetch_assoc()) {
                        $forumType = strtolower($extRow['forum_type'] ?? '');
                        
                        // Set flags (track what types exist)
                        if ($forumType === 'international') {
                            $hasInternational = true;
                        } else if ($forumType === 'national') {
                            $hasNational = true;
                        } else if ($forumType === 'regional') {
                            $hasRegional = true;
                        }
                        
                        // Determine if this presentation should be included based on filter
                        $includeThisPresentation = false;
                        
                        if (empty($level)) {
                            // ALL filter - include ALL external presentations
                            $includeThisPresentation = true;
                        } else if ($level === 'university') {
                            // UNIVERSITY filter - include NO external presentations
                            $includeThisPresentation = false;
                        } else if ($level === $forumType) {
                            // Specific filter (international/national/regional) - include ONLY matching type
                            $includeThisPresentation = true;
                        }
                        
                        if ($includeThisPresentation) {
                            if (!empty($extRow['forum_title']) && $extRow['forum_title'] !== 'NULL') {
                                $forumTitles[] = $extRow['forum_title'];
                            }
                            if (!empty($extRow['venue']) && $extRow['venue'] !== 'NULL') {
                                $venues[] = $extRow['venue'];
                            }
                            if (!empty($extRow['presentation_date'])) {
                                $presentationDates[] = date('Y-m-d', strtotime($extRow['presentation_date']));
                            }
                            if (!empty($extRow['pr_date_completed'])) {
                                $completionDates[] = date('Y-m-d', strtotime($extRow['pr_date_completed']));
                            }
                            if (!empty($extRow['presentor']) && $extRow['presentor'] !== 'NULL') {
                                $presentors[] = $extRow['presentor'];
                            }
                        }
                    }
                }
                
                // Determine if university data should be included
                $includeUniversityData = false;
                
                if (empty($level)) {
                    // ALL filter - include university data
                    $includeUniversityData = true;
                } else if ($level === 'university') {
                    // UNIVERSITY filter - include university data
                    $includeUniversityData = true;
                } else {
                    // INTERNATIONAL/NATIONAL/REGIONAL filter - NEVER include university data
                    $includeUniversityData = false;
                }
                
                if ($includeUniversityData) {
                    // Add university forum title
                    if (!empty($row['event_title']) && $row['event_title'] !== 'NULL') {
                        $forumTitles[] = $row['event_title'];
                    }
                    
                    // Add presenter from researchfile
                    if (!empty($row['presenter']) && $row['presenter'] !== 'NULL') {
                        $presentors[] = $row['presenter'];
                    }
                    
                    // For symposiums, add endorsement date
                    $eventName = strtolower($row['event_title'] ?? '');
                    $isSymposium = (strpos($eventName, 'symposium') !== false);
                    if ($isSymposium && !empty($row['endorsement_date'])) {
                        $completionDates[] = date('Y-m-d', strtotime($row['endorsement_date']));
                        $presentationDates[] = date('Y-m-d', strtotime($row['endorsement_date']));
                    }
                }
                
                // Parse coauthors for all researchers (always include authors)
                $coauthor = $row['coauthor'];
                $coauthors = [];
                $allResearchers = [];
                
                // Add main author
                if (!empty($row['author']) && $row['author'] !== 'NULL') {
                    $allResearchers[] = $row['author'];
                }
                
                // Parse coauthors
                if (!empty($coauthor) && $coauthor !== 'NULL') {
                    if (is_string($coauthor) && (strpos($coauthor, '[') === 0 || strpos($coauthor, '{') === 0)) {
                        $coauthors = json_decode($coauthor, true);
                        if (is_array($coauthors)) {
                            foreach ($coauthors as $co) {
                                if (!empty($co) && $co !== 'NULL') {
                                    $allResearchers[] = $co;
                                }
                            }
                        }
                    } else {
                        $coauthors = explode(',', $coauthor);
                        foreach ($coauthors as $co) {
                            $co = trim($co);
                            if (!empty($co) && $co !== 'NULL') {
                                $allResearchers[] = $co;
                            }
                        }
                    }
                }
                
                // Remove duplicates
                $allResearchers = array_values(array_unique($allResearchers));
                $presentors = array_values(array_unique($presentors));
                
                // Determine primary level (for display purposes only)
                $primaryLevel = 'university';
                if ($hasInternational) {
                    $primaryLevel = 'international';
                } else if ($hasNational) {
                    $primaryLevel = 'national';
                } else if ($hasRegional) {
                    $primaryLevel = 'regional';
                }
                
                // Remove duplicates from collections
                $forumTitles = array_values(array_unique(array_filter($forumTitles)));
                $venues = array_values(array_unique(array_filter($venues)));
                $presentationDates = array_values(array_unique(array_filter($presentationDates)));
                $completionDates = array_values(array_unique(array_filter($completionDates)));
                
                // Use researchfile.date_completed for the date completed field
                $dateCompleted = !empty($row['date_completed']) ? date('M j, Y', strtotime($row['date_completed'])) : '—';
                
                // Set flags for checkmarks (always show what exists in the database)
                $university = '✓';
                $international = $hasInternational ? '✓' : '—';
                $national = $hasNational ? '✓' : '—';
                $regional = $hasRegional ? '✓' : '—';
                
                // Create a unique ID
                $presentationId = $endorsementId . '_' . $researchId;
                
                $presentation = [
                    'id' => $presentationId,
                    'endorsement_id' => (int)$endorsementId,
                    'research_id' => (int)$researchId,
                    'title' => $row['title'] ?? '',
                    'campus' => $row['campus'] ?? $row['center'] ?? '—',
                    'category' => $row['category'] ?? '—',
                    'all_researchers' => $allResearchers,
                    'presentor' => $presentors,
                    'date_completed' => $dateCompleted,
                    'forum_title' => $forumTitles,
                    'venue' => $venues,
                    'presentation_date' => $presentationDates,
                    'university' => $university,
                    'international' => $international,
                    'national' => $national,
                    'regional' => $regional,
                    'presentation_type' => $primaryLevel,
                    'level' => $primaryLevel,
                    'event_type' => (strpos(strtolower($row['event_title'] ?? ''), 'symposium') !== false) ? 'Symposium' : 'In-House Review'
                ];
                
                // Add to results
                $allPresentations[] = $presentation;
            }
            
            // Set next cursor
            if (!empty($rows)) {
                if ($direction === 'next') {
                    $lastRow = end($rows);
                    $nextCursor = $lastRow['endorsement_id'];
                } else {
                    $firstRow = reset($rows);
                    $nextCursor = $firstRow['endorsement_id'];
                }
            }
            
            // Get available years
            $years = $this->getAvailableYears();
            
            $this->response->status = true;
            $this->response->message = 'Presentations fetched successfully';
            $this->response->data = $allPresentations;
            $this->response->stats = $stats;
            $this->response->years = $years;
            $this->response->pagination = [
                'next_cursor' => $nextCursor,
                'has_more' => $hasMore,
                'total' => $stats['total'],
                'loaded' => count($allPresentations),
                'direction' => $direction
            ];
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
            error_log("Error in fetchPresentations: " . $e->getMessage());
        }
        
        echo json_encode($this->response);
    }

    private function getStatsFromResearch() {
        try {
            // Get total count of ALL presentations (including duplicates)
            $totalQuery = "SELECT COUNT(*) as total 
                        FROM researchfile rf
                        INNER JOIN endorsement e ON rf.endorsementid = e.id
                        LEFT JOIN presentation_research pr ON rf.id = pr.research_id
                        WHERE e.status = 'accepted'
                        AND rf.event_id IS NOT NULL";
            
            $totalResult = $this->con->query($totalQuery);
            $totalRow = $totalResult->fetch_assoc();
            $total = (int)($totalRow['total'] ?? 0);
            
            // Get university count (from researchfile.event)
            $univQuery = "SELECT COUNT(*) as count 
                        FROM researchfile rf
                        INNER JOIN endorsement e ON rf.endorsementid = e.id
                        WHERE e.status = 'accepted'
                        AND rf.event_id IS NOT NULL
                        AND (LOWER(rf.event) LIKE '%university%' 
                            OR LOWER(rf.event) LIKE '%in-house%' 
                            OR LOWER(rf.event) LIKE '%symposium%'
                            OR LOWER(rf.event) NOT LIKE '%international%'
                            AND LOWER(rf.event) NOT LIKE '%national%'
                            AND LOWER(rf.event) NOT LIKE '%regional%')";
            
            $univResult = $this->con->query($univQuery);
            $univRow = $univResult->fetch_assoc();
            $university = (int)($univRow['count'] ?? 0);
            
            // Get international count (from presentation_research.forum_type)
            $intQuery = "SELECT COUNT(*) as count 
                        FROM researchfile rf
                        INNER JOIN endorsement e ON rf.endorsementid = e.id
                        INNER JOIN presentation_research pr ON rf.id = pr.research_id
                        WHERE e.status = 'accepted'
                        AND rf.event_id IS NOT NULL
                        AND LOWER(pr.forum_type) = 'international'";
            
            $intResult = $this->con->query($intQuery);
            $intRow = $intResult->fetch_assoc();
            $international = (int)($intRow['count'] ?? 0);
            
            // Get national count (from presentation_research.forum_type)
            $natQuery = "SELECT COUNT(*) as count 
                        FROM researchfile rf
                        INNER JOIN endorsement e ON rf.endorsementid = e.id
                        INNER JOIN presentation_research pr ON rf.id = pr.research_id
                        WHERE e.status = 'accepted'
                        AND rf.event_id IS NOT NULL
                        AND LOWER(pr.forum_type) = 'national'";
            
            $natResult = $this->con->query($natQuery);
            $natRow = $natResult->fetch_assoc();
            $national = (int)($natRow['count'] ?? 0);
            
            // Get regional count (from presentation_research.forum_type)
            $regQuery = "SELECT COUNT(*) as count 
                        FROM researchfile rf
                        INNER JOIN endorsement e ON rf.endorsementid = e.id
                        INNER JOIN presentation_research pr ON rf.id = pr.research_id
                        WHERE e.status = 'accepted'
                        AND rf.event_id IS NOT NULL
                        AND LOWER(pr.forum_type) = 'regional'";
            
            $regResult = $this->con->query($regQuery);
            $regRow = $regResult->fetch_assoc();
            $regional = (int)($regRow['count'] ?? 0);
            
            // Calculate total from all categories
            $calculatedTotal = $university + $international + $national + $regional;
            
            // Use the larger of the two totals to ensure we don't miss any
            $finalTotal = max($total, $calculatedTotal);
            
            $stats = [
                'total' => $finalTotal,
                'university' => $university,
                'international' => $international,
                'national' => $national,
                'regional' => $regional
            ];
            return $stats;
            
        } catch (Exception $e) {
            return [
                'total' => 0,
                'university' => 0,
                'international' => 0,
                'national' => 0,
                'regional' => 0
            ];
        }
    }
    public function savePresentation() {
        try {
            // Get form data
            $research_id = $_POST['research_id'] ?? 0;
            $presentor = $_POST['presentor'] ?? '';
            $date_completed = $_POST['date_completed'] ?? '';
            $forum_title = $_POST['forum_title'] ?? '';
            $venue = $_POST['venue'] ?? '';
            $forum_type = $_POST['forum_type'] ?? '';
            $presentation_date = $_POST['presentation_date'] ?? '';
            $id = $_POST['id'] ?? 0; // For updates
            
            // Validate required fields
            if (!$research_id || !$presentor || !$date_completed || !$forum_title || !$venue || !$forum_type || !$presentation_date) {
                $this->response->message = 'All fields are required';
                echo json_encode($this->response);
                return;
            }
            
            // Get user_id from session
            $user_id = $_SESSION['user_id'] ?? 1;
            
            // First, check if a presentation already exists for this research_id
            if (!$id) {
                $checkQuery = "SELECT id FROM presentation_research WHERE research_id = ?";
                $checkStmt = $this->con->prepare($checkQuery);
                $checkStmt->bind_param("i", $research_id);
                $checkStmt->execute();
                $checkResult = $checkStmt->get_result();
                
                if ($checkResult->num_rows > 0) {
                    // Presentation already exists, get its ID for update
                    $row = $checkResult->fetch_assoc();
                    $id = $row['id'];
                }
                $checkStmt->close();
            }
            
            if ($id) {
                // Update existing record - INCLUDING presentor field
                $query = "UPDATE presentation_research 
                        SET research_id = ?, 
                            user_id = ?,
                            presentor = ?,
                            date_completed = ?,
                            forum_title = ?,
                            venue = ?,
                            forum_type = ?,
                            presentation_date = ?
                        WHERE id = ?";
                
                $stmt = $this->con->prepare($query);
                if (!$stmt) {
                    throw new Exception("Prepare failed: " . $this->con->error);
                }
                
                // Bind parameters: i=integer, s=string
                // 8 parameters + 1 for WHERE clause = 9 total
                $stmt->bind_param(
                    "iissssssi",  // research_id(i), user_id(i), presentor(s), date_completed(s), forum_title(s), venue(s), forum_type(s), presentation_date(s), id(i)
                    $research_id,
                    $user_id,
                    $presentor,
                    $date_completed,
                    $forum_title,
                    $venue,
                    $forum_type,
                    $presentation_date,
                    $id
                );
            } else {
                // Insert new record - INCLUDING presentor field
                $query = "INSERT INTO presentation_research 
                        (research_id, user_id, presentor, date_completed, forum_title, venue, forum_type, presentation_date)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                
                $stmt = $this->con->prepare($query);
                if (!$stmt) {
                    throw new Exception("Prepare failed: " . $this->con->error);
                }
                
                // Bind parameters: 8 parameters total
                $stmt->bind_param(
                    "iissssss",  // research_id(i), user_id(i), presentor(s), date_completed(s), forum_title(s), venue(s), forum_type(s), presentation_date(s)
                    $research_id,
                    $user_id,
                    $presentor,
                    $date_completed,
                    $forum_title,
                    $venue,
                    $forum_type,
                    $presentation_date
                );
            }
            
            if ($stmt->execute()) {
                $this->response->status = true;
                $this->response->message = $id ? 'Presentation updated successfully' : 'Presentation added successfully';
                $this->response->data = [
                    'id' => $id ?: $stmt->insert_id,
                    'research_id' => $research_id
                ];
                
            } else {
                throw new Exception("Database error: " . $stmt->error);
            }
            
            $stmt->close();
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
        }
        
        echo json_encode($this->response);
    }
    public function searchPresentations() {
        try {
            $cursor = $_POST['cursor'] ?? null;
            $direction = $_POST['direction'] ?? 'next';
            $searchTerm = $_POST['search'] ?? '';
            $year = $_POST['year'] ?? null;
            $level = $_POST['level'] ?? null;
            $limit = 15;
            
            // Get stats (optional - you might want search-specific stats)
            $stats = $this->getStatsFromResearch();
            
            // Base query - using endorsement as primary table (like fetchPresentations)
            $query = "SELECT 
                        e.id as endorsement_id,
                        e.date as endorsement_date,
                        e.status,
                        rf.id as research_id,
                        rf.author,
                        rf.presenter,
                        rf.coauthor,
                        rf.title,
                        rf.category,
                        rf.campus,
                        rf.center,
                        rf.event as event_title,
                        rf.event_id,
                        rf.date_completed
                    FROM endorsement e
                    INNER JOIN researchfile rf ON rf.endorsementid = e.id
                    WHERE e.status = 'accepted'
                    AND rf.event_id IS NOT NULL";
            
            if (!empty($searchTerm)) {
                $searchTerm = $this->con->real_escape_string($searchTerm);
                $query .= " AND (
                    rf.title LIKE '%$searchTerm%' 
                    OR rf.author LIKE '%$searchTerm%'
                    OR rf.presenter LIKE '%$searchTerm%'
                    OR rf.event LIKE '%$searchTerm%'
                    OR rf.category LIKE '%$searchTerm%'
                    OR rf.campus LIKE '%$searchTerm%'
                    OR rf.center LIKE '%$searchTerm%'
                    OR EXISTS (
                        SELECT 1 FROM presentation_research pr 
                        WHERE pr.research_id = rf.id 
                        AND (
                            pr.forum_title LIKE '%$searchTerm%'
                            OR pr.venue LIKE '%$searchTerm%'
                            OR pr.presentor LIKE '%$searchTerm%'
                        )
                    )
                )";
            }
            
            // Add year filter if provided
            if ($year) {
                $query .= " AND YEAR(e.date) = " . intval($year);
            }
            
            // Add level filter if provided
            if ($level) {
                if ($level === 'university') {
                    $query .= " AND NOT EXISTS (
                        SELECT 1 FROM presentation_research pr 
                        WHERE pr.research_id = rf.id
                    )";
                } else {
                    $query .= " AND EXISTS (
                        SELECT 1 FROM presentation_research pr 
                        WHERE pr.research_id = rf.id 
                        AND LOWER(pr.forum_type) = '" . $this->con->real_escape_string(strtolower($level)) . "'
                    )";
                }
            }
            
            // Add cursor condition for pagination
            if ($cursor) {
                if ($direction === 'next') {
                    $query .= " AND e.id < " . intval($cursor);
                } else {
                    $query .= " AND e.id > " . intval($cursor);
                }
            }

            // Order by endorsement ID for consistent pagination
            if ($direction === 'next') {
                $query .= " ORDER BY e.id DESC";
            } else {
                $query .= " ORDER BY e.id ASC";
            }
            
            // Add limit
            $query .= " LIMIT " . ($limit + 1);
            
            error_log("Search query: " . $query);
            
            $result = $this->con->query($query);
            
            if (!$result) {
                throw new Exception("Query failed: " . $this->con->error);
            }
            
            $allPresentations = [];
            $hasMore = false;
            $nextCursor = null;
            $rows = [];
            
            // Fetch all rows first
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
            
            // Check if we have more records
            if (count($rows) > $limit) {
                $hasMore = true;
                array_pop($rows);
            }
            
            // Process each row (exactly like fetchPresentations)
            foreach ($rows as $row) {
                $researchId = $row['research_id'];
                $endorsementId = $row['endorsement_id'];
                
                // Get all external presentations for this research
                $externalQuery = "SELECT 
                                    id as pr_id,
                                    presentor,
                                    forum_title,
                                    venue,
                                    presentation_date,
                                    forum_type,
                                    date_completed as pr_date_completed
                                FROM presentation_research 
                                WHERE research_id = " . intval($researchId);
                
                $externalResult = $this->con->query($externalQuery);
                $allForumTitles = [];
                $allVenues = [];
                $allPresentationDates = [];
                $allCompletionDates = [];
                $allPresentors = [];
                $hasInternational = false;
                $hasNational = false;
                $hasRegional = false;
                
                // Add university forum title
                if (!empty($row['event_title']) && $row['event_title'] !== 'NULL') {
                    $allForumTitles[] = $row['event_title'];
                }
                
                if ($externalResult) {
                    while ($extRow = $externalResult->fetch_assoc()) {
                        // Collect all forum titles
                        if (!empty($extRow['forum_title']) && $extRow['forum_title'] !== 'NULL') {
                            $allForumTitles[] = $extRow['forum_title'];
                        }
                        
                        // Collect all venues
                        if (!empty($extRow['venue']) && $extRow['venue'] !== 'NULL') {
                            $allVenues[] = $extRow['venue'];
                        }
                        
                        // Collect all presentation dates
                        if (!empty($extRow['presentation_date'])) {
                            $allPresentationDates[] = date('Y-m-d', strtotime($extRow['presentation_date']));
                        }
                        
                        // Collect all completion dates
                        if (!empty($extRow['pr_date_completed'])) {
                            $allCompletionDates[] = date('Y-m-d', strtotime($extRow['pr_date_completed']));
                        }
                        
                        // Collect all presentors
                        if (!empty($extRow['presentor']) && $extRow['presentor'] !== 'NULL') {
                            $allPresentors[] = $extRow['presentor'];
                        }
                        
                        // Set flags based on forum type
                        $forumType = strtolower($extRow['forum_type'] ?? '');
                        if ($forumType === 'international') {
                            $hasInternational = true;
                        } else if ($forumType === 'national') {
                            $hasNational = true;
                        } else if ($forumType === 'regional') {
                            $hasRegional = true;
                        }
                    }
                }
                
                // Parse coauthors for all researchers
                $coauthor = $row['coauthor'];
                $coauthors = [];
                $allResearchers = [];
                
                // Add presenter
                if (!empty($row['presenter']) && $row['presenter'] !== 'NULL') {
                    $allResearchers[] = $row['presenter'];
                    $allPresentors[] = $row['presenter'];
                }
                
                // Add main author
                if (!empty($row['author']) && $row['author'] !== 'NULL') {
                    $allResearchers[] = $row['author'];
                }
                
                // Parse coauthors
                if (!empty($coauthor) && $coauthor !== 'NULL') {
                    if (is_string($coauthor) && (strpos($coauthor, '[') === 0 || strpos($coauthor, '{') === 0)) {
                        $coauthors = json_decode($coauthor, true);
                        if (is_array($coauthors)) {
                            foreach ($coauthors as $co) {
                                if (!empty($co) && $co !== 'NULL') {
                                    $allResearchers[] = $co;
                                }
                            }
                        }
                    } else {
                        $coauthors = explode(',', $coauthor);
                        foreach ($coauthors as $co) {
                            $co = trim($co);
                            if (!empty($co) && $co !== 'NULL') {
                                $allResearchers[] = $co;
                            }
                        }
                    }
                }
                
                // Remove duplicates
                $allResearchers = array_values(array_unique($allResearchers));
                $allPresentors = array_values(array_unique($allPresentors));
                
                // Determine if this is a Symposium
                $eventName = strtolower($row['event_title'] ?? '');
                $isSymposium = (strpos($eventName, 'symposium') !== false);
                
                // For symposiums, add endorsement date
                if ($isSymposium) {
                    if (!empty($row['endorsement_date'])) {
                        $allCompletionDates[] = date('Y-m-d', strtotime($row['endorsement_date']));
                        $allPresentationDates[] = date('Y-m-d', strtotime($row['endorsement_date']));
                    }
                }
                
                // Remove duplicates from collections
                $allForumTitles = array_values(array_unique(array_filter($allForumTitles)));
                $allVenues = array_values(array_unique(array_filter($allVenues)));
                $allPresentationDates = array_values(array_unique(array_filter($allPresentationDates)));
                $allCompletionDates = array_values(array_unique(array_filter($allCompletionDates)));
                
                // Use researchfile.date_completed for the date completed field
                $dateCompleted = !empty($row['date_completed']) ? date('M j, Y', strtotime($row['date_completed'])) : '—';
                
                // Set flags
                $university = '✓';
                $international = $hasInternational ? '✓' : '—';
                $national = $hasNational ? '✓' : '—';
                $regional = $hasRegional ? '✓' : '—';
                
                // Determine primary level
                $primaryLevel = 'university';
                if ($hasInternational) {
                    $primaryLevel = 'international';
                } else if ($hasNational) {
                    $primaryLevel = 'national';
                } else if ($hasRegional) {
                    $primaryLevel = 'regional';
                }
                
                // Create unique ID
                $presentationId = $endorsementId . '_' . $researchId;
                
                $presentation = [
                    'id' => $presentationId,
                    'endorsement_id' => (int)$endorsementId,
                    'research_id' => (int)$researchId,
                    'title' => $row['title'] ?? '',
                    'campus' => $row['campus'] ?? $row['center'] ?? '—',
                    'category' => $row['category'] ?? '—',
                    'all_researchers' => $allResearchers,
                    'presentor' => $allPresentors,
                    'date_completed' => $dateCompleted,
                    'forum_title' => $allForumTitles,
                    'venue' => $allVenues,
                    'presentation_date' => $allPresentationDates,
                    'university' => $university,
                    'international' => $international,
                    'national' => $national,
                    'regional' => $regional,
                    'presentation_type' => $primaryLevel,
                    'level' => $primaryLevel,
                    'event_type' => $isSymposium ? 'Symposium' : 'In-House Review'
                ];
                
                $allPresentations[] = $presentation;
            }
            
            // Apply level filter if provided
            if ($level && !empty($allPresentations)) {
                $filteredPresentations = [];
                foreach ($allPresentations as $p) {
                    if ($level === 'university' && $p['level'] === 'university') {
                        $filteredPresentations[] = $p;
                    } else if ($level === 'international' && $p['level'] === 'international') {
                        $filteredPresentations[] = $p;
                    } else if ($level === 'national' && $p['level'] === 'national') {
                        $filteredPresentations[] = $p;
                    } else if ($level === 'regional' && $p['level'] === 'regional') {
                        $filteredPresentations[] = $p;
                    }
                }
                $allPresentations = $filteredPresentations;
            }
            
            // Set next cursor
            if (!empty($rows)) {
                if ($direction === 'next') {
                    $lastRow = end($rows);
                    $nextCursor = $lastRow['endorsement_id'];
                } else {
                    $firstRow = reset($rows);
                    $nextCursor = $firstRow['endorsement_id'];
                }
            }
            
            // Get total count for search results
            $countQuery = "SELECT COUNT(*) as total 
                        FROM endorsement e
                        INNER JOIN researchfile rf ON rf.endorsementid = e.id
                        WHERE e.status = 'accepted'
                        AND rf.event_id IS NOT NULL";
            
            if (!empty($searchTerm)) {
                $searchTerm = $this->con->real_escape_string($searchTerm);
                $countQuery .= " AND (
                    rf.title LIKE '%$searchTerm%' 
                    OR rf.author LIKE '%$searchTerm%'
                    OR rf.presenter LIKE '%$searchTerm%'
                    OR rf.event LIKE '%$searchTerm%'
                    OR rf.category LIKE '%$searchTerm%'
                    OR rf.campus LIKE '%$searchTerm%'
                    OR rf.center LIKE '%$searchTerm%'
                    OR EXISTS (
                        SELECT 1 FROM presentation_research pr 
                        WHERE pr.research_id = rf.id 
                        AND (
                            pr.forum_title LIKE '%$searchTerm%'
                            OR pr.venue LIKE '%$searchTerm%'
                            OR pr.presentor LIKE '%$searchTerm%'
                        )
                    )
                )";
            }
            
            if ($year) {
                $countQuery .= " AND YEAR(e.date) = " . intval($year);
            }
            
            $countResult = $this->con->query($countQuery);
            $countRow = $countResult->fetch_assoc();
            $totalCount = (int)($countRow['total'] ?? 0);
            
            $this->response->status = true;
            $this->response->message = 'Search completed successfully';
            $this->response->data = $allPresentations;
            $this->response->stats = $stats; // Optional: include stats
            $this->response->pagination = [
                'next_cursor' => $nextCursor,
                'has_more' => $hasMore,
                'total' => $totalCount,
                'loaded' => count($allPresentations),
                'direction' => $direction
            ];
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
            error_log("Error in searchPresentations: " . $e->getMessage());
        }
        
        echo json_encode($this->response);
    }

}

// Initialize database connection
$con = new mysqli($host, $username, $pass, $dbName);

if ($con->connect_error) {
    $response = new stdClass();
    $response->status = false;
    $response->message = 'Database connection failed: ' . $con->connect_error;
    echo json_encode($response);
    exit;
}

// Set charset to utf8mb4
$con->set_charset("utf8mb4");

// Create API instance
$api = new PresentationAPI($con);

// Handle different actions based on request
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// For JSON requests, try to get action from JSON body
if (empty($action)) {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input && isset($input['action'])) {
        $action = $input['action'];
    }
}

switch ($action) {
    case 'get_research_papers':
        $api->getResearchPapers();
        break;
        
    case 'fetch':
        $api->fetchPresentations();
        break;
    case 'search_presentations':  // Add this case
        $api->searchPresentations();
        break;
    case 'save':
        $api->savePresentation();
        break;
    default:
        // If no action specified, default to fetch
        if (empty($action)) {
            $api->fetchPresentations();
        } else {
            $response = new stdClass();
            $response->status = false;
            $response->message = 'Invalid action: ' . $action;
            echo json_encode($response);
        }
}