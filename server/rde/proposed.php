<?php
require_once(__DIR__ . '/../db.php');

// Set header for JSON response
header('Content-Type: application/json');

class ProposedResearchAPI {
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
            'inHouseReview' => 0,
            'symposium' => 0,
            'thisYear' => 0
        ];
    }

    private function getEventYear($eventDate) {
        if (empty($eventDate)) return date('Y');
        return date('Y', strtotime($eventDate));
    }
    
    private function generatePaperTrailNo($index, $year) {
        $sequence = str_pad($index, 2, '0', STR_PAD_LEFT);
        $yearShort = substr($year, -2);
        return $sequence . '-' . $yearShort;
    }
    
    private function parseAuthorsAndFaculty($author, $coauthor) {
        $allResearchers = [];
        
        // Add main author if exists
        if (!empty($author) && $author !== 'NULL' && $author !== null) {
            $allResearchers[] = trim($author);
        }
        
        // Add co-authors if they exist
        if (!empty($coauthor) && $coauthor !== 'NULL' && $coauthor !== null) {
            // Check if coauthor is a JSON array
            if (is_string($coauthor) && (strpos($coauthor, '[') === 0 || strpos($coauthor, '{') === 0)) {
                $coauthors = json_decode($coauthor, true);
                if (is_array($coauthors)) {
                    foreach ($coauthors as $co) {
                        if (!empty($co) && $co !== 'NULL') {
                            $allResearchers[] = trim($co);
                        }
                    }
                }
            } else if (!empty($coauthor)) {
                // Handle comma-separated list
                $coauthorList = explode(',', $coauthor);
                foreach ($coauthorList as $co) {
                    $co = trim($co);
                    if (!empty($co) && $co !== 'NULL') {
                        $allResearchers[] = $co;
                    }
                }
            }
        }
        
        // Remove duplicates and re-index
        $allResearchers = array_values(array_unique($allResearchers));
        
        // Build faculty_researchers string without modifying the original array
        $facultyResearchers = '';
        if (count($allResearchers) > 0) {
            if (count($allResearchers) === 1) {
                $facultyResearchers = $allResearchers[0];
            } else {
                // Create a copy for manipulation
                $temp = $allResearchers;
                $last = array_pop($temp);
                $facultyResearchers = implode(', ', $temp) . ' & ' . $last;
            }
        }
        
        return [
            'authors_list' => implode(', ', $allResearchers),
            'faculty_researchers' => $facultyResearchers,
            'all_researchers' => $allResearchers
        ];
    }
    
    private function getEventType($eventName) {
        $eventName = strtolower($eventName);
        if (strpos($eventName, 'symposium') !== false) {
            return 'symposium';
        } elseif (strpos($eventName, 'in-house') !== false || strpos($eventName, 'inhouse') !== false) {
            return 'inhouse';
        }
        return 'other';
    }
    
    private function getRevisionStatusDisplay($revisionStatus) {
        $statusMap = [
            'revision_pending' => 'Pending Revision',
            'revision_submitted' => 'Revised Submitted',
            'revision_accepted' => 'Revision Accepted',
            'revision_rejected' => 'Revision Rejected'
        ];
        
        return $statusMap[$revisionStatus] ?? $revisionStatus;
    }
    
    private function getEvents() {
        $events = [];
        $query = "SELECT id, name, date FROM event_list ORDER BY date DESC";
        $result = $this->con->query($query);
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $events[$row['id']] = [
                    'name' => $row['name'],
                    'date' => $row['date'],
                    'year' => $this->getEventYear($row['date'])
                ];
            }
        }
        
        return $events;
    }
    
    private function getAcademicPositions($researchIds) {
        if (empty($researchIds)) return [];
        
        $positions = [];
        $ids = implode(',', array_map('intval', $researchIds));
        $query = "SELECT * FROM academic_position WHERE research_id IN ($ids)";
        $result = $this->con->query($query);
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $positions[$row['research_id']][] = [
                    'faculty_name' => $row['faculty_name'],
                    'academic_rank' => $row['academic_rank'],
                    'non_academic_rank' => $row['non_academic_rank'],
                    'job_order' => $row['job_order']
                ];
            }
        }
        
        return $positions;
    }
    
    public function fetchProposedResearch() {
        try {
            // Get all events first for reference
            $events = $this->getEvents();
            
            // Get ALL research papers with accepted status or active events
            $query = "SELECT 
                        rf.id,
                        rf.senderid,
                        rf.event_id,
                        rf.author,
                        rf.coauthor,
                        rf.title,
                        rf.event as event_name,
                        rf.category,
                        rf.campus,
                        rf.center,
                        rf.file,
                        rf.paper_trail_no,
                        rf.revision_status,
                        rf.revised_drive_view_url,
                        rf.revised_drive_download_url,
                        rf.date_started,
                        rf.date_completed,
                        en.id as endorsement_id,
                        en.status as endorsement_status,
                        en.date as endorsement_date,
                        en.event as endorsement_event_name,
                        YEAR(COALESCE(e.date, en.date)) as endorsement_year
                    FROM researchfile rf
                    LEFT JOIN endorsement en ON rf.endorsementid = en.id
                    LEFT JOIN event_list e ON rf.event_id = e.id
                    WHERE en.status = 'accepted' OR e.status = 1
                    ORDER BY COALESCE(e.date, en.date) DESC, rf.id ASC";
            
            $result = $this->con->query($query);
            
            if (!$result) {
                throw new Exception("Query failed: " . $this->con->error);
            }
            
            $researchData = [];
            $stats = [
                'total' => 0,
                'inHouseReview' => 0,
                'symposium' => 0,
                'thisYear' => 0
            ];
            
            // Collect all research IDs to fetch academic positions
            $researchIds = [];
            $rows = [];
            
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
                $researchIds[] = $row['id'];
            }
            
            // Get academic positions for all research papers
            $academicPositions = $this->getAcademicPositions($researchIds);
            
            // Group papers by endorsement year (from endorsement.date)
            $papersByYear = [];
            
            foreach ($rows as $row) {
                // Determine event type from MULTIPLE sources
                // Priority: 1) researchfile.event, 2) endorsement.event, 3) event_list
                $eventType = 'other';
                $eventNameForType = '';
                
                // First check researchfile.event (event_name)
                if (!empty($row['event_name'])) {
                    $eventNameForType = $row['event_name'];
                    $eventType = $this->getEventType($row['event_name']);
                }
                
                // If still 'other', check endorsement.event (endorsement_event_name)
                if ($eventType === 'other' && !empty($row['endorsement_event_name'])) {
                    $eventNameForType = $row['endorsement_event_name'];
                    $eventType = $this->getEventType($row['endorsement_event_name']);
                }
                
                // If still 'other' and event_id exists in event_list, check event_list
                if ($eventType === 'other' && $row['event_id'] && isset($events[$row['event_id']])) {
                    $eventNameForType = $events[$row['event_id']]['name'];
                    $eventType = $this->getEventType($eventNameForType);
                }
                
                // Get year - endorsement_year from SQL should be reliable
                $year = $row['endorsement_year'];
                
                // Fallback: if endorsement_year is null, try to parse endorsement_date
                if (!$year && !empty($row['endorsement_date'])) {
                    $year = (int)date('Y', strtotime($row['endorsement_date']));
                    error_log("Fallback year from endorsement_date for ID {$row['id']}: $year");
                }
                
                // Final fallback: use current year
                if (!$year) {
                    $year = (int)date('Y');
                    error_log("WARNING: No year found for ID {$row['id']}, using current year: $year");
                }
                
                // Build event info
                $eventInfo = [
                    'name' => $eventNameForType ?: $row['event_name'] ?: $row['endorsement_event_name'] ?: '',
                    'date' => $row['endorsement_date'] ?? $row['date_started'] ?? '',
                    'year' => $year
                ];
                
                // If event_id exists in event_list, use that for additional info
                if ($row['event_id'] && isset($events[$row['event_id']])) {
                    $eventInfo['name'] = $eventInfo['name'] ?: $events[$row['event_id']]['name'];
                    $eventInfo['date'] = $eventInfo['date'] ?: $events[$row['event_id']]['date'];
                }
                
                // Group by year
                if (!isset($papersByYear[$year])) {
                    $papersByYear[$year] = [];
                }
                
                $papersByYear[$year][] = [
                    'row' => $row,
                    'eventInfo' => $eventInfo,
                    'eventType' => $eventType,
                    'year' => $year
                ];
                
                // Update stats
                $stats['total']++;
                
                if ($eventType === 'inhouse') {
                    $stats['inHouseReview']++;
                } elseif ($eventType === 'symposium') {
                    $stats['symposium']++;
                }
                
                // Check if this year
                if ($year == (int)date('Y')) {
                    $stats['thisYear']++;
                }
            }
            
            // Sort years in descending order
            krsort($papersByYear);
            
            error_log("Years found: " . implode(', ', array_keys($papersByYear)));
            error_log("Papers per year: " . print_r(array_map('count', $papersByYear), true));
            
            // Process each year separately
            foreach ($papersByYear as $year => $yearPapers) {
                // Sort papers within the year by endorsement date and then by ID
                usort($yearPapers, function($a, $b) {
                    $dateA = $a['row']['endorsement_date'] ?? $a['row']['date_started'] ?? '';
                    $dateB = $b['row']['endorsement_date'] ?? $b['row']['date_started'] ?? '';
                    
                    if ($dateA != $dateB) {
                        return strtotime($dateB) - strtotime($dateA);
                    }
                    return $b['row']['id'] - $a['row']['id'];
                });
                
                // Reset paper index for each year
                $paperIndex = 1;
                
                foreach ($yearPapers as $paperData) {
                    $row = $paperData['row'];
                    $eventType = $paperData['eventType'];
                    $eventInfo = $paperData['eventInfo'];
                    
                    // Parse authors and faculty researchers
                    $parsedAuthors = $this->parseAuthorsAndFaculty($row['author'], $row['coauthor']);
                    
                    $paperPositions = $academicPositions[$row['id']] ?? [];
                    
                    $alignedPositions = [];
                    foreach ($parsedAuthors['all_researchers'] as $researcher) {
                        $found = null;
                        foreach ($paperPositions as $pos) {
                            if ($pos['faculty_name'] === $researcher) {
                                $found = $pos;
                                break;
                            }
                        }
                        
                        $alignedPositions[] = [
                            'academic_rank' => $found['academic_rank'] ?? '—',
                            'non_academic_rank' => $found['non_academic_rank'] ?? '—',
                            'job_order' => $found['job_order'] ?? '—'
                        ];
                    }
                    
                    // Use endorsement date for display
                    $dateStarted = '';
                    if (!empty($row['endorsement_date'])) {
                        $dateStarted = date('M j, Y', strtotime($row['endorsement_date']));
                    } elseif (!empty($row['date_started'])) {
                        $dateStarted = date('M j, Y', strtotime($row['date_started']));
                    }
                    
                    // Get revision status display
                    $revisionStatus = $row['revision_status'] ?? 'revision_pending';
                    $revisionStatusDisplay = $this->getRevisionStatusDisplay($revisionStatus);
                    
                    // Build research entry
                    $researchEntry = [
                        'id' => $row['id'],
                        'endorsement_id' => $row['endorsement_id'],
                        'year' => $year,
                        'paperTrailNo' => !empty($row['paper_trail_no']) ? $row['paper_trail_no'] : $this->generatePaperTrailNo($paperIndex, $year),
                        'campus' => $row['campus'] ?? '',
                        'category' => $row['category'] ?? '',
                        'title' => $row['title'] ?? '',
                        'authors' => $parsedAuthors['authors_list'],
                        'facultyResearcher' => $parsedAuthors['faculty_researchers'],
                        'all_researchers' => $parsedAuthors['all_researchers'],
                        'academic_positions' => $alignedPositions,
                        'inhouseLocal' => '',
                        'inhouseUniversity' => '',
                        'symposiumLocal' => '',
                        'symposiumUniversity' => '',
                        'dateStarted' => $dateStarted,
                        'eventType' => $eventType,
                        'eventName' => $eventInfo['name'] ?? '',
                        'endorsement_status' => $row['endorsement_status'],
                        'revision_status' => $revisionStatus,
                        'revision_status_display' => $revisionStatusDisplay,
                        'revised_drive_view_url' => $row['revised_drive_view_url'] ?? '',
                        'revised_drive_download_url' => $row['revised_drive_download_url'] ?? '',
                        'has_positions' => !empty($paperPositions),
                        'endorsement_date' => $row['endorsement_date'] ?? ''
                    ];
                    
                    // Set status columns based on event type
                    // For the 2026 records (38th University Faculty In-House Review = inhouse)
                    // For the 2024 records (42nd Annual RDE Faculty Symposium = symposium)
                    if ($eventType === 'inhouse') {
                        $researchEntry['inhouseUniversity'] = $revisionStatusDisplay;
                        $researchEntry['symposiumUniversity'] = '';
                    } elseif ($eventType === 'symposium') {
                        $researchEntry['symposiumUniversity'] = $revisionStatusDisplay;
                        $researchEntry['inhouseUniversity'] = '';
                    } else {
                        // For unknown types, try to determine from event name
                        $eventNameLower = strtolower($eventInfo['name'] ?? '');
                        if (strpos($eventNameLower, 'in-house') !== false || strpos($eventNameLower, 'inhouse') !== false) {
                            $researchEntry['inhouseUniversity'] = $revisionStatusDisplay;
                            $researchEntry['symposiumUniversity'] = '';
                        } elseif (strpos($eventNameLower, 'symposium') !== false) {
                            $researchEntry['symposiumUniversity'] = $revisionStatusDisplay;
                            $researchEntry['inhouseUniversity'] = '';
                        } else {
                            // Default: show in both if we can't determine
                            $researchEntry['inhouseUniversity'] = $revisionStatusDisplay;
                            $researchEntry['symposiumUniversity'] = $revisionStatusDisplay;
                        }
                    }
                    
                    $researchData[] = $researchEntry;
                    $paperIndex++;
                }
            }
            
            $this->response->status = true;
            $this->response->message = 'Proposed research fetched successfully';
            $this->response->data = $researchData;
            $this->response->stats = $stats;
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
            error_log("Error in fetchProposedResearch: " . $e->getMessage());
        }
        
        echo json_encode($this->response);
    }
    
    // Get single research paper details with academic positions
    public function getResearchPaper($id) {
        try {
            $query = "SELECT 
                        rf.id,
                        rf.title,
                        rf.author,
                        rf.coauthor,
                        rf.category,
                        rf.campus,
                        rf.center,
                        rf.event_id,
                        rf.revision_status,
                        rf.revised_drive_view_url,
                        rf.revised_drive_download_url,
                        en.id as endorsement_id,
                        en.status as endorsement_status
                    FROM researchfile rf
                    LEFT JOIN endorsement en ON rf.endorsementid = en.id
                    LEFT JOIN event_list e ON rf.event_id = e.id
                    WHERE rf.id = ? AND (en.status = 'accepted' OR e.status = 1)
                    LIMIT 1";
            
            $stmt = $this->con->prepare($query);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($row = $result->fetch_assoc()) {
                // Get event details
                $eventQuery = "SELECT name, date FROM event_list WHERE id = ?";
                $eventStmt = $this->con->prepare($eventQuery);
                $eventStmt->bind_param("i", $row['event_id']);
                $eventStmt->execute();
                $eventResult = $eventStmt->get_result();
                $event = $eventResult->fetch_assoc();
                
                $eventYear = $event ? $this->getEventYear($event['date']) : date('Y');
                $eventType = $event ? $this->getEventType($event['name']) : 'other';
                
                // Parse authors and faculty researchers
                $parsedAuthors = $this->parseAuthorsAndFaculty($row['author'], $row['coauthor']);
                
                // Get academic positions for this research paper
                $positionsQuery = "SELECT * FROM academic_position WHERE research_id = ?";
                $positionsStmt = $this->con->prepare($positionsQuery);
                $positionsStmt->bind_param("i", $id);
                $positionsStmt->execute();
                $positionsResult = $positionsStmt->get_result();
                
                $academicPositions = [];
                while ($position = $positionsResult->fetch_assoc()) {
                    $academicPositions[] = [
                        'faculty_name' => $position['faculty_name'],
                        'academic_rank' => $position['academic_rank'],
                        'non_academic_rank' => $position['non_academic_rank'],
                        'job_order' => $position['job_order']
                    ];
                }
                
                $paperDetails = [
                    'id' => $row['id'],
                    'endorsement_id' => $row['endorsement_id'],
                    'year' => $eventYear,
                    'event_name' => $event ? $event['name'] : '',
                    'event_type' => $eventType,
                    'title' => $row['title'],
                    'author' => $row['author'],
                    'coauthor' => json_decode($row['coauthor'], true),
                    'authors' => $parsedAuthors['authors_list'],
                    'facultyResearcher' => $parsedAuthors['faculty_researchers'],
                    'all_researchers' => $parsedAuthors['all_researchers'],
                    'category' => $row['category'],
                    'campus' => $row['campus'],
                    'center' => $row['center'],
                    'endorsement_status' => $row['endorsement_status'],
                    'revision_status' => $row['revision_status'] ?? 'revision_pending',
                    'revised_drive_view_url' => $row['revised_drive_view_url'] ?? '',
                    'revised_drive_download_url' => $row['revised_drive_download_url'] ?? '',
                    'academic_positions' => $academicPositions
                ];
                
                $this->response->status = true;
                unset($this->response->stats); // Remove stats from single paper response
                $this->response->data = $paperDetails;
            } else {
                $this->response->message = 'Research paper not found';
            }
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
        }
        
        echo json_encode($this->response);
    }
    
    // Get comments for a research paper
    public function getResearchComments() {
        try {
            $researchId = $_POST['research_id'] ?? $_GET['research_id'] ?? 0;
            $eventType = $_POST['event_type'] ?? $_GET['event_type'] ?? '';
            
            if (!$researchId) {
                $this->response->message = 'Research ID is required';
                echo json_encode($this->response);
                return;
            }
            
            $query = "SELECT 
                        comments.title,
                        comments.intro,
                        comments.abstract,
                        comments.objective,
                        comments.methodology,
                        comments.results,
                        comments.recommendation,
                        comments.literature,
                        comments.other,
                        comments.isCommented,
                        evaluator.fullname
                    FROM comments
                    LEFT JOIN evaluator ON evaluator.id = comments.evalid
                    WHERE comments.resid = ?";
            
            $params = [$researchId];
            $types = "i";
            
            // Use eventName for filtering if provided, but make it optional as resid is the primary key
            if (!empty($eventType)) {
                $query .= " AND (comments.eventType = ? OR comments.eventType LIKE ?)";
                $params[] = $eventType;
                $params[] = "%$eventType%";
                $types .= "ss";
            }
            
            $stmt = $this->con->prepare($query);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $comments = [];
            while ($row = $result->fetch_assoc()) {
                $comments[] = [
                    'title' => $row['title'] ?? '',
                    'intro' => $row['intro'] ?? '',
                    'abstract' => $row['abstract'] ?? '',
                    'objective' => $row['objective'] ?? '',
                    'methodology' => $row['methodology'] ?? '',
                    'results' => $row['results'] ?? '',
                    'recommendation' => $row['recommendation'] ?? '',
                    'literature' => $row['literature'] ?? '',
                    'other' => $row['other'] ?? '',
                    'isCommented' => $row['isCommented'] ?? 0,
                    'evaluator_name' => $row['fullname'] ?? ''
                ];
            }
            
            $this->response->status = true;
            unset($this->response->stats); // Remove stats from comments response
            $this->response->data = $comments;
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
        }
        
        echo json_encode($this->response);
    }
    
    // Update revision status
    public function updateRevisionStatus() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                $input = $_POST;
            }
            
            $researchId = $input['research_id'] ?? 0;
            $status = $input['status'] ?? ''; // 'revision_accepted' or 'revision_rejected'
            
            if (!$researchId) {
                $this->response->message = 'Research ID is required';
                echo json_encode($this->response);
                return;
            }
            
            if (!in_array($status, ['revision_accepted', 'revision_rejected'])) {
                $this->response->message = 'Invalid status. Must be revision_accepted or revision_rejected';
                echo json_encode($this->response);
                return;
            }
            
            $updateQuery = "UPDATE researchfile SET revision_status = ?, last_revision_date = NOW() WHERE id = ?";
            $stmt = $this->con->prepare($updateQuery);
            $stmt->bind_param("si", $status, $researchId);
            
            if ($stmt->execute()) {
                $this->response->status = true;
                $this->response->message = 'Revision status updated successfully';
                $this->response->data = [
                    'research_id' => $researchId,
                    'revision_status' => $status,
                    'display_status' => $status === 'revision_accepted' ? 'Revision Accepted' : 'Revision Rejected'
                ];
            } else {
                throw new Exception("Failed to update revision status: " . $stmt->error);
            }
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
            error_log("Update revision status error: " . $e->getMessage());
        }
        
        echo json_encode($this->response);
    }
    
    public function saveAcademicPositions() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                $input = $_POST;
            }
            
            $researchId = $input['research_id'] ?? 0;
            $facultyData = $input['faculty_data'] ?? [];
            $duplicateGroupId = $input['duplicate_group_id'] ?? $researchId;
            
            if (is_string($facultyData)) {
                $facultyData = json_decode($facultyData, true);
            }
            
            if (!is_array($facultyData)) {
                $facultyData = [];
            }
            
            error_log("Research ID: " . $researchId);
            error_log("Duplicate Group ID: " . $duplicateGroupId);
            error_log("Faculty Data received: " . print_r($facultyData, true));
            
            if (!$researchId) {
                $this->response->message = 'Research ID is required';
                echo json_encode($this->response);
                return;
            }
            
            $filteredFacultyData = array_filter($facultyData, function($faculty) {
                return !empty($faculty['faculty_name']);
            });
            
            error_log("Filtered Faculty Data: " . print_r($filteredFacultyData, true));
            
            $this->con->begin_transaction();
            
            $deleteQuery = "DELETE FROM academic_position WHERE research_id = ?";
            $deleteStmt = $this->con->prepare($deleteQuery);
            $deleteStmt->bind_param("i", $researchId);
            $deleteStmt->execute();
            $deletedCount = $deleteStmt->affected_rows;
            error_log("Deleted $deletedCount existing records for ID: $researchId");
            $deleteStmt->close();
            
            $insertedCount = 0;
            
            if (!empty($filteredFacultyData)) {
                $insertQuery = "INSERT INTO academic_position (research_id, faculty_name, academic_rank, non_academic_rank, job_order) VALUES (?, ?, ?, ?, ?)";
                $insertStmt = $this->con->prepare($insertQuery);
                
                foreach ($filteredFacultyData as $faculty) {
                    $facultyName = $faculty['faculty_name'] ?? '';
                    $academicRank = $faculty['academic_rank'] ?? '';
                    $nonAcademicRank = $faculty['non_academic_rank'] ?? '';
                    $jobOrder = $faculty['job_order'] ?? '';
                    
                    error_log("Inserting for ID $researchId: $facultyName, $academicRank, $nonAcademicRank, $jobOrder");
                    
                    $insertStmt->bind_param("issss", $researchId, $facultyName, $academicRank, $nonAcademicRank, $jobOrder);
                    if ($insertStmt->execute()) {
                        $insertedCount++;
                    } else {
                        error_log("Insert error for ID $researchId: " . $insertStmt->error);
                    }
                }
                
                $insertStmt->close();
            }
            
            $this->con->commit();
            
            $this->response->status = true;
            $this->response->message = 'Academic positions saved successfully';
            $this->response->debug = [
                'research_id' => $researchId,
                'duplicate_group_id' => $duplicateGroupId,
                'deleted_count' => $deletedCount,
                'inserted_count' => $insertedCount,
                'received_count' => count($facultyData),
                'filtered_count' => count($filteredFacultyData)
            ];
            
        } catch (Exception $e) {
            $this->con->rollback();
            $this->response->message = 'Error: ' . $e->getMessage();
            error_log("Save positions error: " . $e->getMessage());
        }
        
        echo json_encode($this->response);
    }
    
    // Get statistics only
    public function getStatistics() {
        try {
            $stats = [
                'total' => 0,
                'inHouseReview' => 0,
                'symposium' => 0,
                'thisYear' => 0
            ];
            
            $events = $this->getEvents();
            
            // Count all accepted research, not just those with event_id
            $query = "SELECT 
                        rf.id,
                        rf.event_id,
                        rf.event as event_name,
                        en.date as endorsement_date,
                        e.date as event_date
                    FROM researchfile rf
                    LEFT JOIN endorsement en ON rf.endorsementid = en.id
                    LEFT JOIN event_list e ON rf.event_id = e.id
                    WHERE en.status = 'accepted' OR e.status = 1";
            
            $result = $this->con->query($query);
            
            if ($result) {
                while ($row = $result->fetch_assoc()) {
                    $eventType = 'other';
                    
                    // Determine event type
                    if ($row['event_id'] && isset($events[$row['event_id']])) {
                        $eventType = $this->getEventType($events[$row['event_id']]['name']);
                    } elseif (!empty($row['event_name'])) {
                        $eventType = $this->getEventType($row['event_name']);
                    }
                    
                    $stats['total']++;
                    
                    if ($eventType === 'inhouse') {
                        $stats['inHouseReview']++;
                    } elseif ($eventType === 'symposium') {
                        $stats['symposium']++;
                    }
                    
                    // Check if this year
                    $year = null;
                    if (!empty($row['event_date'])) {
                        $year = date('Y', strtotime($row['event_date']));
                    } elseif (!empty($row['endorsement_date'])) {
                        $year = date('Y', strtotime($row['endorsement_date']));
                    }
                    
                    if ($year == date('Y')) {
                        $stats['thisYear']++;
                    }
                }
            }
            
            $this->response->status = true;
            $this->response->message = 'Statistics fetched successfully';
            $this->response->stats = $stats;
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
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
$api = new ProposedResearchAPI($con);

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
    case 'fetch':
        $api->fetchProposedResearch();
        break;
        
    case 'get':
        $id = $_POST['id'] ?? $_GET['id'] ?? 0;
        if ($id) {
            $api->getResearchPaper($id);
        } else {
            $response = new stdClass();
            $response->status = false;
            $response->message = 'Research paper ID is required';
            echo json_encode($response);
        }
        break;
        
    case 'get_comments':
        $api->getResearchComments();
        break;
        
    case 'update_revision_status':
        $api->updateRevisionStatus();
        break;
        
    case 'save_positions':
        $api->saveAcademicPositions();
        break;
        
    case 'stats':
        $api->getStatistics();
        break;
        
    default:
        if (empty($action)) {
            $api->fetchProposedResearch();
        } else {
            $response = new stdClass();
            $response->status = false;
            $response->message = 'Invalid action: ' . $action;
            echo json_encode($response);
        }
}