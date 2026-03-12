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

    private function getPresentationLevel($eventName) {
        $eventName = strtolower($eventName ?? '');
        
        if (strpos($eventName, 'international') !== false) {
            return 'international';
        } elseif (strpos($eventName, 'national') !== false) {
            return 'national';
        } elseif (strpos($eventName, 'regional') !== false) {
            return 'regional';
        } elseif (strpos($eventName, 'university') !== false || 
                strpos($eventName, 'in-house') !== false || 
                strpos($eventName, 'symposium') !== false) {
            return 'university';
        }
        
        return 'university';
    }

    private function getAvailableYears() {
        $query = "SELECT DISTINCT YEAR(e.date) as year 
                 FROM researchfile rf
                 INNER JOIN endorsement e ON rf.id = e.senderid
                 WHERE e.status = 'accepted'
                 AND rf.event_id IS NOT NULL
                 AND rf.event_id != 0
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
                        WHERE e.senderid = rf.id 
                        AND e.status = 'accepted'
                    )
                    AND rf.event_id IS NOT NULL
                    AND rf.event_id != 0
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
            error_log("Error in getResearchPapers: " . $e->getMessage());
        }
        
        echo json_encode($this->response);
    }
    public function fetchPresentations() {
        try {
            $cursor = $_POST['cursor'] ?? null;
            $direction = $_POST['direction'] ?? 'next';
            $year = $_POST['year'] ?? null;
            $level = $_POST['level'] ?? null;
            $limit = 15;
            
            // Get accurate stats from the dedicated method
            $stats = $this->getStatsFromResearch();
            
            // Now get the paginated data
            $query = "SELECT 
                        rf.id,
                        rf.author,
                        rf.coauthor,
                        rf.title,
                        rf.category,
                        rf.campus,
                        rf.center,
                        rf.event as university_forum_title,
                        pr.forum_title,
                        pr.venue,
                        pr.presentation_date,
                        pr.forum_type,
                        pr.date_completed as pr_date_completed,
                        e.date as endorsement_date,
                        YEAR(pr.presentation_date) as presentation_year,
                        e.id as endorsement_id
                    FROM researchfile rf
                    INNER JOIN endorsement e ON rf.id = e.senderid
                    LEFT JOIN presentation_research pr ON rf.id = pr.research_id
                    WHERE e.status = 'accepted'
                    AND rf.event_id IS NOT NULL
                    AND rf.event_id != 0";
            
            // Add year filter if provided (only for presentations with dates)
            if ($year) {
                $query .= " AND YEAR(pr.presentation_date) = " . intval($year);
            }
            
            // Add cursor condition based on direction using presentation_date only
            if ($cursor && $direction) {
                // Get the presentation_date of the cursor record
                $cursorQuery = "SELECT pr.presentation_date 
                            FROM researchfile rf
                            INNER JOIN endorsement e ON rf.id = e.senderid
                            LEFT JOIN presentation_research pr ON rf.id = pr.research_id
                            WHERE rf.id = " . intval($cursor) . " 
                            AND e.status = 'accepted'
                            AND pr.presentation_date IS NOT NULL
                            LIMIT 1";
                $cursorResult = $this->con->query($cursorQuery);
                
                if ($cursorResult && $cursorRow = $cursorResult->fetch_assoc()) {
                    $cursorDate = $cursorRow['presentation_date'];
                    
                    if ($direction === 'next') {
                        $query .= " AND pr.presentation_date < '" . $this->con->real_escape_string($cursorDate) . "'";
                    } else {
                        $query .= " AND pr.presentation_date > '" . $this->con->real_escape_string($cursorDate) . "'";
                    }
                }
            }
            
            // Group by to avoid duplicates
            $query .= " GROUP BY rf.id, pr.id";
            
            // Order by presentation_date DESC for newest first (only for those with dates)
            $query .= " ORDER BY pr.presentation_date DESC, rf.id DESC LIMIT " . ($limit + 1);
            
            error_log("Fetch presentations query: " . $query);
            
            $result = $this->con->query($query);
            
            if (!$result) {
                throw new Exception("Query failed: " . $this->con->error);
            }
            
            $presentations = [];
            $hasMore = false;
            $nextCursor = null;
            $prevCursor = null;
            $count = 0;
            $firstId = null;
            $lastId = null;
            
            while ($row = $result->fetch_assoc()) {
                $count++;
                
                if ($count === 1) {
                    $firstId = $row['id'];
                }
                $lastId = $row['id'];
                
                if ($count > $limit) {
                    $hasMore = true;
                    if ($direction === 'next') {
                        $nextCursor = $lastId;
                    } else {
                        $prevCursor = $firstId;
                    }
                    break;
                }
                
                // Parse coauthors for all researchers
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
                
                // Determine which forum title to use and set presentation data
                $forumTitle = '';
                $presentationDate = '—'; // Default to em dash for no date
                $dateCompleted = '—'; // Default to em dash for no completion date
                $venue = '—'; // Default to em dash for no venue
                $forumType = '';
                $presentationLevel = '';
                
                // Check if this is from presentation_research (international/national/regional)
                if (!empty($row['forum_title'])) {
                    // This is from presentation_research table
                    $forumTitle = $row['forum_title'];
                    $presentationDate = !empty($row['presentation_date']) ? date('Y-m-d', strtotime($row['presentation_date'])) : '—';
                    $dateCompleted = !empty($row['pr_date_completed']) ? date('Y-m-d', strtotime($row['pr_date_completed'])) : '—';
                    $venue = !empty($row['venue']) ? $row['venue'] : '—';
                    $forumType = $row['forum_type'] ?? '';
                    $presentationLevel = strtolower($forumType);
                } else {
                    // This is a university presentation from researchfile
                    $forumTitle = $row['university_forum_title'] ?? '';
                    $presentationDate = '—'; // No date for university presentations
                    $venue = '—'; // No venue for university presentations
                    
                    // Check if this is a SYMPOSIUM (has completion date) or IN-House (no completion date)
                    $eventName = strtolower($row['university_forum_title'] ?? '');
                    if (strpos($eventName, 'symposium') !== false) {
                        // Symposium - show completion date from endorsement
                        $dateCompleted = !empty($row['endorsement_date']) ? date('Y-m-d', strtotime($row['endorsement_date'])) : '—';
                    } else {
                        // In-house review or other - no completion date
                        $dateCompleted = '—';
                    }
                    
                    $presentationLevel = 'university';
                }
                
                // Set checkmarks based on level
                $university = ($presentationLevel === 'university') ? '✓' : '—';
                $international = ($presentationLevel === 'international') ? '✓' : '—';
                $national = ($presentationLevel === 'national') ? '✓' : '—';
                $regional = ($presentationLevel === 'regional') ? '✓' : '—';
                
                $presentations[] = [
                    'id' => (int)$row['id'],
                    'research_id' => (int)$row['id'],
                    'endorsement_id' => (int)$row['endorsement_id'],
                    'date_completed' => $dateCompleted, // Only Symposium shows date, In-house shows '—'
                    'title' => $row['title'] ?? '',
                    'forum_title' => $forumTitle,
                    'venue' => $venue, // '—' for university
                    'university' => $university,
                    'international' => $international,
                    'national' => $national,
                    'regional' => $regional,
                    'presentation_date' => $presentationDate, // '—' for university
                    'presentation_type' => $forumType,
                    'presentor' => $row['author'] ?? '',
                    'campus' => $row['campus'] ?? $row['center'] ?? '—',
                    'category' => $row['category'] ?? '—',
                    'year' => $row['presentation_year'] ?? '',
                    'all_researchers' => $allResearchers,
                    'level' => $presentationLevel
                ];
            }
            
            // Apply level filter if provided
            if ($level && !empty($presentations)) {
                $presentations = array_filter($presentations, function($p) use ($level) {
                    return $p['level'] === $level;
                });
                $presentations = array_values($presentations);
            }
            
            // Get available years (only from presentation_research)
            $years = $this->getAvailableYears();
            
            error_log("Found " . count($presentations) . " presentations, total stats: " . json_encode($stats));
            
            $this->response->status = true;
            $this->response->message = 'Presentations fetched successfully';
            $this->response->data = $presentations;
            $this->response->stats = $stats;
            $this->response->years = $years;
            $this->response->pagination = [
                'next_cursor' => $nextCursor,
                'prev_cursor' => $prevCursor,
                'has_more' => $hasMore,
                'total' => $stats['total'],
                'loaded' => count($presentations),
                'first_id' => $firstId,
                'last_id' => $lastId
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
                        INNER JOIN endorsement e ON rf.id = e.senderid
                        LEFT JOIN presentation_research pr ON rf.id = pr.research_id
                        WHERE e.status = 'accepted'
                        AND rf.event_id IS NOT NULL
                        AND rf.event_id != 0";
            
            $totalResult = $this->con->query($totalQuery);
            $totalRow = $totalResult->fetch_assoc();
            $total = (int)($totalRow['total'] ?? 0);
            
            error_log("Total presentations: " . $total);
            
            // Get university count (from researchfile.event)
            $univQuery = "SELECT COUNT(*) as count 
                        FROM researchfile rf
                        INNER JOIN endorsement e ON rf.id = e.senderid
                        WHERE e.status = 'accepted'
                        AND rf.event_id IS NOT NULL
                        AND rf.event_id != 0
                        AND (LOWER(rf.event) LIKE '%university%' 
                            OR LOWER(rf.event) LIKE '%in-house%' 
                            OR LOWER(rf.event) LIKE '%symposium%'
                            OR LOWER(rf.event) LIKE '%colloquium%'
                            OR LOWER(rf.event) LIKE '%conference%'
                            OR LOWER(rf.event) LIKE '%forum%'
                            OR LOWER(rf.event) LIKE '%seminar%'
                            OR LOWER(rf.event) LIKE '%workshop%'
                            OR LOWER(rf.event) LIKE '%review%'
                            OR LOWER(rf.event) NOT LIKE '%international%'
                            AND LOWER(rf.event) NOT LIKE '%national%'
                            AND LOWER(rf.event) NOT LIKE '%regional%')";
            
            $univResult = $this->con->query($univQuery);
            $univRow = $univResult->fetch_assoc();
            $university = (int)($univRow['count'] ?? 0);
            
            // Get international count (from presentation_research.forum_type)
            $intQuery = "SELECT COUNT(*) as count 
                        FROM researchfile rf
                        INNER JOIN endorsement e ON rf.id = e.senderid
                        INNER JOIN presentation_research pr ON rf.id = pr.research_id
                        WHERE e.status = 'accepted'
                        AND rf.event_id IS NOT NULL
                        AND rf.event_id != 0
                        AND LOWER(pr.forum_type) = 'international'";
            
            $intResult = $this->con->query($intQuery);
            $intRow = $intResult->fetch_assoc();
            $international = (int)($intRow['count'] ?? 0);
            
            // Get national count (from presentation_research.forum_type)
            $natQuery = "SELECT COUNT(*) as count 
                        FROM researchfile rf
                        INNER JOIN endorsement e ON rf.id = e.senderid
                        INNER JOIN presentation_research pr ON rf.id = pr.research_id
                        WHERE e.status = 'accepted'
                        AND rf.event_id IS NOT NULL
                        AND rf.event_id != 0
                        AND LOWER(pr.forum_type) = 'national'";
            
            $natResult = $this->con->query($natQuery);
            $natRow = $natResult->fetch_assoc();
            $national = (int)($natRow['count'] ?? 0);
            
            // Get regional count (from presentation_research.forum_type)
            $regQuery = "SELECT COUNT(*) as count 
                        FROM researchfile rf
                        INNER JOIN endorsement e ON rf.id = e.senderid
                        INNER JOIN presentation_research pr ON rf.id = pr.research_id
                        WHERE e.status = 'accepted'
                        AND rf.event_id IS NOT NULL
                        AND rf.event_id != 0
                        AND LOWER(pr.forum_type) = 'regional'";
            
            $regResult = $this->con->query($regQuery);
            $regRow = $regResult->fetch_assoc();
            $regional = (int)($regRow['count'] ?? 0);
            
            // Calculate total from all categories
            $calculatedTotal = $university + $international + $national + $regional;
            
            error_log("University: " . $university);
            error_log("International: " . $international);
            error_log("National: " . $national);
            error_log("Regional: " . $regional);
            error_log("Calculated total: " . $calculatedTotal);
            error_log("Query total: " . $total);
            
            // Use the larger of the two totals to ensure we don't miss any
            $finalTotal = max($total, $calculatedTotal);
            
            $stats = [
                'total' => $finalTotal,
                'university' => $university,
                'international' => $international,
                'national' => $national,
                'regional' => $regional
            ];
            
            error_log("Final stats: " . json_encode($stats));
            
            return $stats;
            
        } catch (Exception $e) {
            error_log("Error in getStatsFromResearch: " . $e->getMessage());
            return [
                'total' => 0,
                'university' => 0,
                'international' => 0,
                'national' => 0,
                'regional' => 0
            ];
        }
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