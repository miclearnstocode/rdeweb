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
            'authors_list' => implode(', ', $allResearchers), // Original array, all authors included
            'faculty_researchers' => $facultyResearchers,
            'all_researchers' => $allResearchers // Original array, all authors included
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
    
    private function getUniversityLevelStatus($status) {
        if ($status === 'accepted') {
            return 'waiting for revised proposal';
        }
        return $status;
    }
    
    private function getEvents() {
        $events = [];
        $query = "SELECT id, name, date FROM event_list WHERE status = 0 ORDER BY date DESC";
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
            // Get all events first
            $events = $this->getEvents();
            
            if (empty($events)) {
                $this->response->message = 'No events found';
                echo json_encode($this->response);
                return;
            }
            
            // Get ALL research papers with accepted status, using endorsement date for year
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
                        e.id as endorsement_id,
                        e.status as endorsement_status,
                        e.date as endorsement_date,
                        YEAR(e.date) as endorsement_year
                    FROM endorsement e
                    INNER JOIN researchfile rf ON e.id = rf.endorsementid
                    WHERE e.status = 'accepted'
                    AND rf.event_id IS NOT NULL
                    AND rf.event_id != 0
                    ORDER BY e.date DESC, rf.id ASC";
            
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
            
            // Group papers by endorsement year
            $papersByYear = [];
            
            foreach ($rows as $row) {
                $eventId = $row['event_id'];
                
                if (!isset($events[$eventId])) {
                    continue;
                }
                
                $eventInfo = $events[$eventId];
                $eventType = $this->getEventType($eventInfo['name']);
                
                // Use endorsement year from the query
                $year = $row['endorsement_year'];
                
                // Skip if no year
                if (!$year) {
                    continue;
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
                if ($year == date('Y')) {
                    $stats['thisYear']++;
                }
            }
            
            // Log years found for debugging
            error_log("Years with papers (from endorsement date): " . implode(', ', array_keys($papersByYear)));
            
            // Sort years in descending order
            krsort($papersByYear);
            
            // Process each year separately
            foreach ($papersByYear as $year => $yearPapers) {
                // Sort papers within the year by endorsement date and then by ID
                usort($yearPapers, function($a, $b) {
                    $dateA = $a['row']['endorsement_date'] ?? '';
                    $dateB = $b['row']['endorsement_date'] ?? '';
                    
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
                    $dateStarted = !empty($row['endorsement_date']) ? 
                        date('M j, Y', strtotime($row['endorsement_date'])) : 
                        (!empty($row['accepted_date']) ? date('M j, Y', strtotime($row['accepted_date'])) : '');
                    
                    // Build research entry
                    $researchEntry = [
                        'id' => $row['id'],
                        'endorsement_id' => $row['endorsement_id'],
                        'year' => $year,
                        'paperTrailNo' => $this->generatePaperTrailNo($paperIndex, $year),
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
                        'eventName' => $eventInfo['name'],
                        'endorsement_status' => $row['endorsement_status'],
                        'has_positions' => !empty($paperPositions),
                        'endorsement_date' => $row['endorsement_date']
                    ];
                    
                    // Set appropriate status based on event type and level
                    if ($eventType === 'inhouse') {
                        $researchEntry['inhouseUniversity'] = $this->getUniversityLevelStatus($row['endorsement_status']);
                    } elseif ($eventType === 'symposium') {
                        $researchEntry['symposiumUniversity'] = $this->getUniversityLevelStatus($row['endorsement_status']);
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
        
        //Get single research paper details with academic positions
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
                            e.id as endorsement_id,
                            e.status as endorsement_status
                        FROM researchfile rf
                        INNER JOIN endorsement e ON rf.endorsementid = e.id
                        WHERE rf.id = ? AND e.status = 'accepted'
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
                        'academic_positions' => $academicPositions
                    ];
                    
                    $this->response->status = true;
                    $this->response->data = $paperDetails;
                } else {
                    $this->response->message = 'Research paper not found';
                }
                
            } catch (Exception $e) {
                $this->response->message = 'Error: ' . $e->getMessage();
            }
            
            echo json_encode($this->response);
        }
        
    public function saveAcademicPositions() {
        try {
            // Get input from php://input (for JSON requests)
            $input = json_decode(file_get_contents('php://input'), true);
            
            // If no JSON input, try POST
            if (!$input) {
                $input = $_POST;
            }
            
            $researchId = $input['research_id'] ?? 0;
            $facultyData = $input['faculty_data'] ?? [];
            $duplicateGroupId = $input['duplicate_group_id'] ?? $researchId; // If provided, use this for mapping
            
            // If facultyData is a string (JSON encoded), decode it
            if (is_string($facultyData)) {
                $facultyData = json_decode($facultyData, true);
            }
            
            // Ensure facultyData is an array
            if (!is_array($facultyData)) {
                $facultyData = [];
            }
            
            // Log received data for debugging
            error_log("Research ID: " . $researchId);
            error_log("Duplicate Group ID: " . $duplicateGroupId);
            error_log("Faculty Data received: " . print_r($facultyData, true));
            
            if (!$researchId) {
                $this->response->message = 'Research ID is required';
                echo json_encode($this->response);
                return;
            }
            
            // Filter out entries without faculty_name
            $filteredFacultyData = array_filter($facultyData, function($faculty) {
                return !empty($faculty['faculty_name']);
            });
            
            error_log("Filtered Faculty Data: " . print_r($filteredFacultyData, true));
            
            // Start transaction
            $this->con->begin_transaction();
            
            // Delete existing positions for this research paper
            $deleteQuery = "DELETE FROM academic_position WHERE research_id = ?";
            $deleteStmt = $this->con->prepare($deleteQuery);
            $deleteStmt->bind_param("i", $researchId);
            $deleteStmt->execute();
            $deletedCount = $deleteStmt->affected_rows;
            error_log("Deleted $deletedCount existing records for ID: $researchId");
            $deleteStmt->close();
            
            $insertedCount = 0;
            
            // Insert new positions if there's data
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
            
            // Commit transaction
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
            // Rollback on error
            $this->con->rollback();
            $this->response->message = 'Error: ' . $e->getMessage();
            error_log("Save positions error: " . $e->getMessage());
        }
        
        echo json_encode($this->response);
    }
        
        //Get statistics only
        public function getStatistics() {
            try {
                $stats = [
                    'total' => 0,
                    'inHouseReview' => 0,
                    'symposium' => 0,
                    'thisYear' => 0
                ];
                
                // Get all events first
                $events = $this->getEvents();
                
                if (empty($events)) {
                    $this->response->stats = $stats;
                    echo json_encode($this->response);
                    return;
                }
                
                $query = "SELECT 
                            rf.event_id,
                            COUNT(DISTINCT rf.id) as count
                        FROM researchfile rf
                        INNER JOIN endorsement e ON rf.endorsementid = e.id
                        WHERE e.status = 'accepted' 
                        AND rf.event_id IS NOT NULL 
                        AND rf.event_id != 0
                        GROUP BY rf.event_id";
                
                $result = $this->con->query($query);
                
                while ($row = $result->fetch_assoc()) {
                    $eventId = $row['event_id'];
                    $count = $row['count'];
                    
                    if (isset($events[$eventId])) {
                        $eventInfo = $events[$eventId];
                        $eventType = $this->getEventType($eventInfo['name']);
                        
                        $stats['total'] += $count;
                        
                        if ($eventType === 'inhouse') {
                            $stats['inHouseReview'] += $count;
                        } elseif ($eventType === 'symposium') {
                            $stats['symposium'] += $count;
                        }
                        
                        if ($eventInfo['year'] == date('Y')) {
                            $stats['thisYear'] += $count;
                        }
                    }
                }
                
                $this->response->status = true;
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
        
    case 'save_positions':
        $api->saveAcademicPositions();
        break;
        
    case 'stats':
        $api->getStatistics();
        break;
        
    default:
        // If no action specified, default to fetch
        if (empty($action)) {
            $api->fetchProposedResearch();
        } else {
            $response = new stdClass();
            $response->status = false;
            $response->message = 'Invalid action: ' . $action;
            echo json_encode($response);
        }
}