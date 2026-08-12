<?php
// Disable error display - critical for JSON responses
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);

// Clear ALL output buffers safely
while (ob_get_level() > 0) {
    ob_end_clean();
}

// Start fresh output buffer
ob_start();

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set JSON header ONCE
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Include database config
require_once(__DIR__ . '/db.php');

// Error handler to catch any PHP errors/warnings/notices
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    return true;
});

// Register shutdown function to catch fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        ob_clean();
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Internal server error', 'details' => $error['message']]);
        exit();
    }
});

/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

function normalizeString($string) {
    // Convert to lowercase
    $string = strtolower($string);
    
    // Remove extra spaces
    $string = preg_replace('/\s+/', ' ', $string);
    
    // Remove special characters but keep letters and numbers
    $string = preg_replace('/[^a-z0-9\s]/', '', $string);
    
    // Trim
    $string = trim($string);
    
    return $string;
}

function isSimilarString($str1, $str2, $threshold = 80) {
    $str1 = normalizeString($str1);
    $str2 = normalizeString($str2);

    if ($str1 === $str2) {
        return true;
    }
    
    // Calculate Levenshtein distance
    $distance = levenshtein($str1, $str2);
    $maxLength = max(strlen($str1), strlen($str2));
    
    if ($maxLength === 0) {
        return true;
    }

    $similarity = (1 - $distance / $maxLength) * 100;
    
    return $similarity >= $threshold;
}

function normalizeAuthorName($name) {
    $name = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $name);
    $name = preg_replace('/\s*(Ph\.?D\.?|MD|DVM|JD|LLB|LLM|RN|CPA|CMA|CFA|PE|Arch|Ed\.?D\.?|DBA|MPH|MS|MA|MBA|MFT|DrPH|PharmD|PT|OT|ECE|MCS|MAED|EDD)\s*/i', '', $name);
    $name = strtolower($name);
    $name = preg_replace('/[^a-z0-9\s]/', '', $name);
    $name = preg_replace('/\s+/', ' ', $name);
    
    return trim($name);
}

function areAuthorsSimilar($authors1, $authors2, $threshold = 80) {
    // Normalize all authors
    $normalized1 = array_map('normalizeAuthorName', $authors1);
    $normalized2 = array_map('normalizeAuthorName', $authors2);
    
    // Sort them
    sort($normalized1);
    sort($normalized2);
    
    // If they have different lengths, they might still be similar
    // Check if one set is a subset of the other (some authors might be missing)
    if (count($normalized1) != count($normalized2)) {
        // Find common authors
        $common = array_intersect($normalized1, $normalized2);
        $minCount = min(count($normalized1), count($normalized2));
        $similarity = (count($common) / $minCount) * 100;
        return $similarity >= $threshold;
    }
    
    // Same length, compare each author
    $matches = 0;
    for ($i = 0; $i < count($normalized1); $i++) {
        if ($normalized1[$i] === $normalized2[$i]) {
            $matches++;
        } elseif (isSimilarString($normalized1[$i], $normalized2[$i], 85)) {
            $matches++;
        }
    }
    
    $similarity = ($matches / count($normalized1)) * 100;
    return $similarity >= $threshold;
}

// Event Registration
if(isset($_POST['eventReg'])){
    $response = new stdClass();
    $response->message = '';
    $response->status = false;
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventName = $_POST['eventName'] ?? '';
        $dateOfPresentation = $_POST['dateOfPresentation'] ?? null;
        
        if (!empty($eventName)) {
            $query = "INSERT INTO event_list (name, status, date) VALUES (?, 1, NOW())";
            $statement = $con->prepare($query);
            
            if ($statement) {
                $statement->bind_param("s", $eventName);
                $status = $statement->execute();
                
                if($status){
                    $response->status = true;
                    $response->message = "Event registered successfully!";
                } else {
                    $response->message = "Database error: " . $statement->error;
                }
                $statement->close();
            }
        } else {
            $response->message = "Event name is required";
        }
        $con->close();
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}

// Get Events for Active Events Listing
if(isset($_POST['getEvent'])){
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT * FROM event_list WHERE event_list.dead_line > CURRENT_TIMESTAMP";
        $result = $con->query($query);
        if ($result) {
            while ($val = $result->fetch_assoc()) {
                $response[] = $val;
            }
            $result->free();
        }
        $con->close();
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}

// Get Event Name by ID
if(isset($_POST['getEventName'])){
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT event_list.name, event_list.date_of_presentation FROM event_list WHERE event_list.id=?";
        $statement = $con->prepare($query);
        if ($statement) {
            $statement->bind_param("s", $_POST['eventId']);
            $statement->execute();
            $result = $statement->get_result();
            while ($row = $result->fetch_assoc()){
                $response[] = $row;
            }
            $result->free();
            $statement->close();
        }
        $con->close();
    }
    ob_clean();
    echo json_encode($response);
    exit();
}

// Get Event List
if(isset($_POST['getEventList'])){
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT event_list.id, event_list.name, event_list.date_of_presentation FROM event_list ORDER BY event_list.name ASC";
        $statement = $con->prepare($query);
        if ($statement) {
            $statement->execute();
            $result = $statement->get_result();
            while ($row = $result->fetch_assoc()){
                $response[] = $row;
            }
            $result->free();
            $statement->close();
        }
        $con->close();
    }
    ob_clean();
    echo json_encode($response);
    exit();
}

// Get Events for Admin Panel
if(isset($_POST['getEventAdmin'])){
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT 
            event_list.id, 
            event_list.name, 
            event_list.dead_line, 
            event_list.status, 
            event_list.date,
            event_list.date_of_presentation,
            score_sheet.id as scID 
            FROM event_list
            LEFT JOIN score_sheet ON event_list.id = score_sheet.event_id
            ORDER BY event_list.dead_line DESC";
        $result = $con->query($query);
        if ($result) {
            while ($val = $result->fetch_assoc()){
                $response[] = $val;
            }
            $result->free();
        }
        $con->close();
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}

// Update Deadline Only
if(isset($_POST['updateDeadline'])){
    $response = new stdClass();
    $response->message = '';
    $response->status = false;

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $newDate = $_POST['newDate'] ?? '';
        $eventId = $_POST['eventId'] ?? '';
        
        if (!empty($newDate) && !empty($eventId)) {
            $query = "UPDATE event_list SET dead_line = ? WHERE id = ?";
            $statement = $con->prepare($query);
            if ($statement) {
                $statement->bind_param("ss", $newDate, $eventId);
                $status = $statement->execute();
                
                if($status){
                    $response->status = true;
                    $response->message = "Deadline updated successfully!";
                } else {
                    $response->message = $statement->error;
                }
                $statement->close();
            }
        } else {
            $response->message = "Missing required fields";
        }
        $con->close();
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}

// Update Presentation Date Only
if(isset($_POST['updatePresentationDate'])){
    $response = new stdClass();
    $response->message = '';
    $response->status = false;

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $presentationDate = $_POST['presentationDate'] ?? '';
        $eventId = $_POST['eventId'] ?? '';
        
        if (!empty($presentationDate) && !empty($eventId)) {
            $query = "UPDATE event_list SET date_of_presentation = ? WHERE id = ?";
            $statement = $con->prepare($query);
            if ($statement) {
                $statement->bind_param("ss", $presentationDate, $eventId);
                $status = $statement->execute();
                
                if($status){
                    $response->status = true;
                    $response->message = "Presentation date updated successfully!";
                } else {
                    $response->message = $statement->error;
                }
                $statement->close();
            }
        } else {
            $response->message = "Missing required fields";
        }
        $con->close();
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}

// Check Event Status
if(isset($_POST['checkDeadLine'])){
    $response = new stdClass();
    $response->status = false;
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT status, dead_line FROM event_list WHERE id = ?";
        $statement = $con->prepare($query);
        if ($statement) {
            $statement->bind_param("s", $_POST['eventId']);
            $statement->execute();
            $result = $statement->get_result();
            $row = $result->fetch_assoc();
            
            if($row){
                $deadline = strtotime($row['dead_line']);
                $now = time();
                $response->status = ($deadline > $now && $row['status'] == 1);
            }
            $result->free();
            $statement->close();
        }
        $con->close();
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}

// Delete Event
if(isset($_POST['deleteEvent'])){
    $response = new stdClass();
    $response->message = '';
    $response->status = false;

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "DELETE FROM event_list WHERE event_list.id=?";
        $statement = $con->prepare($query);
        if ($statement) {
            $statement->bind_param("s", $_POST['eventId']);
            $status = $statement->execute();

            if($status){
                $response->status = true;
                $response->message = "Event deleted successfully!";
            } else {
                $response->message = $statement->error;
            }
            $statement->close();
        }
        $con->close();
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}

// Request Event RDE Documents
if (isset($_POST['requestEventRDE'])) {
    ob_clean();
    
    $eventId = $_POST['eventId'] ?? '0';
    $page = max(1, (int)($_POST['page'] ?? 1));
    $limit = max(1, min(50, (int)($_POST['limit'] ?? 10)));
    $offset = ($page - 1) * $limit; 
    
    $res = [
        'data' => [],
        'hasMore' => false,
        'total' => 0,
        'currentPage' => $page,
        'totalPages' => 0
    ];

    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }

        mysqli_report(MYSQLI_REPORT_OFF);
        $con->set_charset('utf8mb4');
        
        // Get event name to determine which table to query
        $eventName = '';
        $useStudentTable = false;
        
        if ($eventId !== '0' && $eventId !== '') {
            $eventQuery = "SELECT name FROM event_list WHERE id = ?";
            $eventStmt = $con->prepare($eventQuery);
            if ($eventStmt) {
                $eventStmt->bind_param('s', $eventId);
                $eventStmt->execute();
                $eventResult = $eventStmt->get_result();
                if ($eventRow = $eventResult->fetch_assoc()) {
                    $eventName = $eventRow['name'];
                }
                $eventResult->free();
                $eventStmt->close();
            }
        }
        
        // Determine which table to query based on event name
        // Student events contain: "Undergraduate" or "Graduate"
        // Research events contain: "In-House", "Symposium", "Review", or default
        if (!empty($eventName)) {
            $eventNameLower = strtolower($eventName);
            if (strpos($eventNameLower, 'undergraduate') !== false || 
                strpos($eventNameLower, 'graduate') !== false) {
                $useStudentTable = true;
            } else {
                $useStudentTable = false;
            }
        } else {
            // If no event selected or event not found, default to researchfile
            $useStudentTable = false;
        }
        
        // ============================================================
        // COUNT QUERY
        // ============================================================
        $total = 0;
        
        if ($useStudentTable) {
            // Query student_research_papers
            if ($eventId === '0' || $eventId === '') {
                $countSql = "
                    SELECT COUNT(*) as total
                    FROM student_research_papers srp
                    WHERE srp.status = 'accepted'";
                $countStmt = $con->prepare($countSql);
            } else {
                $countSql = "
                    SELECT COUNT(*) as total
                    FROM student_research_papers srp
                    WHERE srp.status = 'accepted'
                    AND srp.event_id = ?";
                $countStmt = $con->prepare($countSql);
            }
            
            if (!$countStmt) {
                throw new Exception('Prepare count failed: ' . $con->error);
            }
            if ($eventId !== '0' && $eventId !== '') {
                $countStmt->bind_param('s', $eventId);
            }
            $countStmt->execute();
            $countResult = $countStmt->get_result();
            $countRow = $countResult->fetch_assoc();
            $total = (int)($countRow['total'] ?? 0);
            $countResult->free();
            $countStmt->close();
            
        } else {
            // Query researchfile (default for faculty/staff)
            if ($eventId === '0' || $eventId === '') {
                $countSql = "
                    SELECT COUNT(*) as total
                    FROM researchfile rf
                    INNER JOIN endorsement ON endorsement.id = rf.endorsementid
                    WHERE (endorsement.status = 'accepted' OR rf.status = 'accepted')";
                $countStmt = $con->prepare($countSql);
            } else {
                $countSql = "
                    SELECT COUNT(*) as total
                    FROM researchfile rf
                    INNER JOIN endorsement ON endorsement.id = rf.endorsementid
                    WHERE (endorsement.status = 'accepted' OR rf.status = 'accepted')
                    AND rf.event = ?";
                $countStmt = $con->prepare($countSql);
            }
            
            if (!$countStmt) {
                throw new Exception('Prepare count failed: ' . $con->error);
            }
            if ($eventId !== '0' && $eventId !== '') {
                $countStmt->bind_param('s', $eventName);
            }
            $countStmt->execute();
            $countResult = $countStmt->get_result();
            $countRow = $countResult->fetch_assoc();
            $total = (int)($countRow['total'] ?? 0);
            $countResult->free();
            $countStmt->close();
        }

        $res['total'] = $total;
        $res['totalPages'] = $total > 0 ? (int)ceil($total / $limit) : 0;

        // ============================================================
        // DATA QUERY
        // ============================================================
        if ($total > 0) {
            $data = [];
            $stmt = null;
            
            if ($useStudentTable) {
                // Query student_research_papers
                if ($eventId === '0' || $eventId === '') {
                    $sql = "
                        SELECT
                            srp.id,
                            srp.author,
                            srp.title,
                            srp.research_file_view_url AS file,
                            srp.research_file_view_url AS drive_view_url,
                            NULL AS drive_file_id,
                            srp.research_file_download_url AS drive_download_url,
                            srp.status,
                            srp.category,
                            NULL AS center,
                            srp.presenter,
                            srp.coauthor,
                            srp.campus,
                            srp.event,
                            NULL AS date,
                            NULL AS endorsId,
                            'student' AS source_type
                        FROM student_research_papers srp
                        WHERE srp.status = 'accepted'
                        ORDER BY srp.id DESC
                        LIMIT ? OFFSET ?";
                    
                    $stmt = $con->prepare($sql);
                    if (!$stmt) {
                        throw new Exception('Prepare data statement failed: ' . $con->error);
                    }
                    $stmt->bind_param('ii', $limit, $offset);
                    
                } else {
                    $sql = "
                        SELECT
                            srp.id,
                            srp.author,
                            srp.title,
                            srp.research_file_view_url AS file,
                            srp.research_file_view_url AS drive_view_url,
                            NULL AS drive_file_id,
                            srp.research_file_download_url AS drive_download_url,
                            srp.status,
                            srp.category,
                            NULL AS center,
                            srp.presenter,
                            srp.coauthor,
                            srp.campus,
                            srp.event,
                            NULL AS date,
                            NULL AS endorsId,
                            'student' AS source_type
                        FROM student_research_papers srp
                        WHERE srp.status = 'accepted'
                        AND srp.event_id = ?
                        ORDER BY srp.id DESC
                        LIMIT ? OFFSET ?";
                    
                    $stmt = $con->prepare($sql);
                    if (!$stmt) {
                        throw new Exception('Prepare data statement failed: ' . $con->error);
                    }
                    $stmt->bind_param('sii', $eventId, $limit, $offset);
                }
                
            } else {
                // Query researchfile (default for faculty/staff)
                if ($eventId === '0' || $eventId === '') {
                    $sql = "
                        SELECT
                            rf.id,
                            rf.senderid,
                            rf.author,
                            rf.title,
                            rf.file,
                            rf.drive_view_url,
                            rf.drive_file_id,
                            rf.drive_download_url,
                            rf.status,
                            rf.category,
                            rf.center,
                            rf.presenter,
                            rf.coauthor,
                            endorsement.campus,
                            endorsement.event,
                            endorsement.date,
                            endorsement.id AS endorsId,
                            'researchfile' AS source_type
                        FROM researchfile rf
                        INNER JOIN endorsement ON endorsement.id = rf.endorsementid
                        WHERE (endorsement.status = 'accepted' OR rf.status = 'accepted')
                        ORDER BY rf.id DESC
                        LIMIT ? OFFSET ?";
                    
                    $stmt = $con->prepare($sql);
                    if (!$stmt) {
                        throw new Exception('Prepare data statement failed: ' . $con->error);
                    }
                    $stmt->bind_param('ii', $limit, $offset);
                    
                } else {
                    $sql = "
                        SELECT
                            rf.id,
                            rf.senderid,
                            rf.author,
                            rf.title,
                            rf.file,
                            rf.drive_view_url,
                            rf.drive_file_id,
                            rf.drive_download_url,
                            rf.status,
                            rf.category,
                            rf.center,
                            rf.presenter,
                            rf.coauthor,
                            endorsement.campus,
                            endorsement.event,
                            endorsement.date,
                            endorsement.id AS endorsId,
                            'researchfile' AS source_type
                        FROM researchfile rf
                        INNER JOIN endorsement ON endorsement.id = rf.endorsementid
                        WHERE (endorsement.status = 'accepted' OR rf.status = 'accepted')
                        AND rf.event = ?
                        ORDER BY rf.id DESC
                        LIMIT ? OFFSET ?";
                    
                    $stmt = $con->prepare($sql);
                    if (!$stmt) {
                        throw new Exception('Prepare data statement failed: ' . $con->error);
                    }
                    $stmt->bind_param('sii', $eventName, $limit, $offset);
                }
            }

            // Check if $stmt was properly initialized
            if ($stmt === null) {
                throw new Exception('No query was prepared. Invalid event type configuration.');
            }

            $stmt->execute();
            $result = $stmt->get_result();
            
            while ($row = $result->fetch_assoc()) {
                // Handle file URL for researchfile entries
                if ($row['source_type'] === 'researchfile') {
                    if (!empty($row['drive_view_url'])) {
                        $row['file'] = $row['drive_view_url'];
                    } elseif (empty($row['file']) && !empty($row['drive_file_id'])) {
                        $row['file'] = 'https://drive.google.com/file/d/' . $row['drive_file_id'] . '/preview';
                    }
                }
                // For student entries, file is already set from research_file_view_url
                
                $data[] = $row;
            }

            $res['data'] = $data;
            $res['hasMore'] = ($page * $limit) < $total;

            $result->free();
            $stmt->close();
        }

        $con->close();

    } catch (Exception $e) {
        error_log("requestEventRDE Error: " . $e->getMessage());
        error_log("Error trace: " . $e->getTraceAsString());
        
        ob_clean();
        echo json_encode([
            'error' => true,
            'message' => $e->getMessage(),
            'data' => [],
            'total' => 0,
            'currentPage' => $page,
            'totalPages' => 0,
            'hasMore' => false
        ]);
        exit;
    }

    ob_clean();
    echo json_encode($res, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Search Documents
if (isset($_POST['searchDocuments'])) {
    ob_clean();
    
    $searchTerm = $_POST['searchTerm'] ?? '';
    $page = max(1, (int)($_POST['page'] ?? 1));
    $limit = max(1, min(50, (int)($_POST['limit'] ?? 10)));
    $offset = ($page - 1) * $limit;
    
    $res = [
        'data' => [],
        'hasMore' => false,
        'total' => 0,
        'currentPage' => $page,
        'totalPages' => 0
    ];
    
    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }
        
        mysqli_report(MYSQLI_REPORT_OFF);
        $con->set_charset('utf8mb4');
        
        // Build search conditions
        $searchConditions = [];
        $params = [];
        $types = "";
        
        if (!empty($searchTerm)) {
            $searchTerm = '%' . $con->real_escape_string($searchTerm) . '%';
            $searchConditions[] = "(rf.title LIKE ? OR rf.final_symposium_title LIKE ? OR rf.author LIKE ? OR rf.presenter LIKE ? OR rf.coauthor LIKE ? OR rf.category LIKE ? OR rf.center LIKE ? OR endorsement.campus LIKE ? OR endorsement.event LIKE ?)";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $types .= "sssssssss";
        }
        
        $whereClause = "";
        if (!empty($searchConditions)) {
            $whereClause = "AND (" . implode(" OR ", $searchConditions) . ")";
        }
        
        // ============================================================
        // COUNT QUERY: Union of researchfile and student_research_papers
        // ============================================================
        $countSql = "
            SELECT COUNT(*) as total FROM (
                SELECT rf.id 
                FROM researchfile rf
                INNER JOIN endorsement ON endorsement.id = rf.endorsementid
                WHERE (endorsement.status = 'accepted' OR rf.status = 'accepted')
                {$whereClause}
                
                UNION ALL
                
                SELECT srp.id 
                FROM student_research_papers srp
                WHERE srp.status = 'accepted'
                {$studentWhereClause}
            ) AS combined";
        
        // Build student search conditions separately
        $studentWhereClause = "";
        $studentParams = [];
        $studentTypes = "";
        
        if (!empty($searchTerm)) {
            $studentWhereClause = "AND (srp.title LIKE ? OR srp.author LIKE ? OR srp.coauthor LIKE ? OR srp.presenter LIKE ? OR srp.category LIKE ? OR srp.campus LIKE ? OR srp.event LIKE ?)";
            $studentParams = [
                $searchTerm, $searchTerm, $searchTerm, 
                $searchTerm, $searchTerm, $searchTerm, $searchTerm
            ];
            $studentTypes = "sssssss";
        }
        
        // Rebuild count query with student search conditions
        $countSql = "
            SELECT COUNT(*) as total FROM (
                SELECT rf.id 
                FROM researchfile rf
                INNER JOIN endorsement ON endorsement.id = rf.endorsementid
                WHERE (endorsement.status = 'accepted' OR rf.status = 'accepted')
                {$whereClause}
                
                UNION ALL
                
                SELECT srp.id 
                FROM student_research_papers srp
                WHERE srp.status = 'accepted'
                {$studentWhereClause}
            ) AS combined";
        
        // For count, we need to combine both sets of parameters
        $allCountParams = array_merge($params, $studentParams);
        $allCountTypes = $types . $studentTypes;
        
        $countStmt = $con->prepare($countSql);
        
        if (!$countStmt) {
            throw new Exception('Prepare count failed: ' . $con->error);
        }
        
        if (!empty($allCountParams)) {
            $countStmt->bind_param($allCountTypes, ...$allCountParams);
        }
        
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $countRow = $countResult->fetch_assoc();
        $total = (int)($countRow['total'] ?? 0);
        
        $countResult->free();
        $countStmt->close();
        
        $res['total'] = $total;
        $res['totalPages'] = $total > 0 ? (int)ceil($total / $limit) : 0;
        
        if ($total > 0) {
            // ============================================================
            // DATA QUERY: Full union with pagination
            // ============================================================
            $sql = "
                SELECT 
                    id,
                    author,
                    title,
                    file,
                    status,
                    category,
                    center,
                    campus,
                    event,
                    date,
                    endorsId,
                    'researchfile' AS source_type,
                    presenter,
                    coauthor
                FROM (
                    SELECT
                        rf.id,
                        rf.author,
                        rf.title,
                        rf.final_symposium_title,
                        rf.file,
                        rf.drive_view_url,
                        rf.drive_file_id,
                        rf.drive_download_url,
                        rf.status,
                        rf.category,
                        rf.center,
                        rf.presenter,
                        rf.coauthor,
                        endorsement.campus,
                        endorsement.event,
                        endorsement.date,
                        endorsement.id AS endorsId,
                        'researchfile' AS source_type,
                        NULL AS event_id
                    FROM researchfile rf
                    INNER JOIN endorsement ON endorsement.id = rf.endorsementid
                    WHERE (endorsement.status = 'accepted' OR rf.status = 'accepted')
                    {$whereClause}
                    
                    UNION ALL
                    
                    SELECT
                        srp.id,
                        srp.author,
                        srp.title,
                        srp.title AS final_symposium_title,
                        srp.research_file_view_url AS file,
                        srp.research_file_view_url AS drive_view_url,
                        NULL AS drive_file_id,
                        srp.research_file_download_url AS drive_download_url,
                        srp.status,
                        srp.category,
                        NULL AS center,
                        srp.presenter,
                        srp.coauthor,
                        srp.campus,
                        srp.event,
                        NULL AS date,
                        NULL AS endorsId,
                        'student' AS source_type,
                        srp.event_id
                    FROM student_research_papers srp
                    WHERE srp.status = 'accepted'
                    {$studentWhereClause}
                ) AS combined_results
                ORDER BY id DESC
                LIMIT ? OFFSET ?";
            
            $stmt = $con->prepare($sql);
            
            if (!$stmt) {
                throw new Exception('Prepare data statement failed: ' . $con->error);
            }
            
            // Combine all parameters with limit and offset
            $allDataParams = array_merge($params, $studentParams, [$limit, $offset]);
            $allDataTypes = $types . $studentTypes . "ii";
            
            if (!empty($allDataParams)) {
                $stmt->bind_param($allDataTypes, ...$allDataParams);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            
            $data = [];
            
            while ($row = $result->fetch_assoc()) {
                // Handle file URL for researchfile entries
                if ($row['source_type'] === 'researchfile') {
                    if (!empty($row['drive_view_url'])) {
                        $row['file'] = $row['drive_view_url'];
                    } elseif (empty($row['file']) && !empty($row['drive_file_id'])) {
                        $row['file'] = 'https://drive.google.com/file/d/' . $row['drive_file_id'] . '/preview';
                    }
                }
                // For student entries, file is already set from research_file_view_url
                
                $data[] = $row;
            }
            
            $res['data'] = $data;
            $res['hasMore'] = ($page * $limit) < $total;
            
            $result->free();
            $stmt->close();
        }
        
        $con->close();
        
    } catch (Exception $e) {
        error_log("searchDocuments Error: " . $e->getMessage());
        error_log("Error trace: " . $e->getTraceAsString());
        
        ob_clean();
        echo json_encode([
            'error' => true,
            'message' => $e->getMessage(),
            'data' => [],
            'total' => 0,
            'currentPage' => $page,
            'totalPages' => 0,
            'hasMore' => false
        ]);
        exit;
    }
    
    ob_clean();
    echo json_encode($res, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if(isset($_POST['collectEntries'])){
    $response = new stdClass();
    $response->count = 0;

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $userId = $_SESSION['userId'] ?? '';
        $centerId = $_SESSION['centerId'] ?? '';
        $eventIds = $_SESSION['eventIds'] ?? [];
        $userType = 'none';
        $centerFilter = '';
        $categoryIds = [];
        $categoryNames = [];
        
        if (!empty($centerId)) {
            $userType = 'center';
            
            $queryCenter = "SELECT name, code FROM center WHERE id = ?";
            $stmtCenter = $con->prepare($queryCenter);
            if ($stmtCenter) {
                $stmtCenter->bind_param("s", $centerId);
                $stmtCenter->execute();
                $resultCenter = $stmtCenter->get_result();
                
                if ($rowCenter = $resultCenter->fetch_assoc()) {
                    $centerFilter = $rowCenter['name'] . " (" . $rowCenter['code'] . ")";
                }
                $resultCenter->free();
                $stmtCenter->close();
            }
            
            if (empty($centerFilter)) {
                $centerFilter = $_SESSION['center'] ?? '';
            }
            
        } else if (!empty($userId)) {
            // Get category IDs and names
            $categoryQuery = "SELECT ec.category_id, c.name 
                             FROM evaluator_categories ec 
                             JOIN category c ON ec.category_id = c.id 
                             WHERE ec.evaluator_id = ?";
            $catStmt = $con->prepare($categoryQuery);
            if ($catStmt) {
                $catStmt->bind_param("i", $userId);
                $catStmt->execute();
                $catResult = $catStmt->get_result();
                
                while ($row = $catResult->fetch_assoc()) {
                    $categoryIds[] = $row['category_id'];
                    $categoryNames[$row['category_id']] = $row['name'];
                }
                $catResult->free();
                $catStmt->close();
                
                if (!empty($categoryIds)) {
                    $userType = 'category';
                }
            }
        }
        
        // If no event IDs, return 0
        if (empty($eventIds)) {
            error_log("No event IDs found");
            $con->close();
            ob_clean();
            echo json_encode($response);
            exit();
        }
        
        // Convert event IDs to integers
        $eventIds = array_map('intval', $eventIds);
        $eventIds = array_filter($eventIds, function($id) {
            return $id > 0;
        });
        $eventIds = array_values($eventIds);
        
        if (empty($eventIds)) {
            error_log("No valid event IDs after filtering");
            $con->close();
            ob_clean();
            echo json_encode($response);
            exit();
        }
        
        $eventPlaceholders = implode(',', array_fill(0, count($eventIds), '?'));
        $totalCount = 0;
        
        // ============================================================
        // COUNT 1: Researchfile papers (faculty/staff)
        // ============================================================
        $rfWhereConditions = [];
        $rfParams = [];
        $rfTypes = "";
        
        // Event filter
        $rfWhereConditions[] = "rf.event_id IN ($eventPlaceholders)";
        foreach ($eventIds as $eid) {
            $rfParams[] = $eid;
            $rfTypes .= "i";
        }
        
        // Category filter
        if ($userType === 'category' && !empty($categoryIds)) {
            $catPlaceholders = implode(',', array_fill(0, count($categoryIds), '?'));
            $rfWhereConditions[] = "rf.category IN (SELECT name FROM category WHERE id IN ($catPlaceholders))";
            foreach ($categoryIds as $cid) {
                $rfParams[] = $cid;
                $rfTypes .= "i";
            }
        } else if ($userType === 'center' && !empty($centerFilter)) {
            $rfWhereConditions[] = "rf.center = ?";
            $rfParams[] = $centerFilter;
            $rfTypes .= "s";
        }
        
        $rfWhereConditions[] = "rf.status = 'accepted'";
        
        $rfWhereClause = !empty($rfWhereConditions) ? "WHERE " . implode(" AND ", $rfWhereConditions) : "";
        
        $rfCountQuery = "SELECT COUNT(DISTINCT rf.id) as count 
                        FROM researchfile rf
                        LEFT JOIN endorsement ON rf.endorsementid = endorsement.id
                        $rfWhereClause";
        
        error_log("Researchfile Count Query: " . $rfCountQuery);
        
        $rfStmt = $con->prepare($rfCountQuery);
        if ($rfStmt) {
            if (!empty($rfParams)) {
                $rfStmt->bind_param($rfTypes, ...$rfParams);
            }
            $rfStmt->execute();
            $rfResult = $rfStmt->get_result();
            
            if ($row = $rfResult->fetch_assoc()) {
                $totalCount += (int)$row['count'];
            }
            $rfStmt->close();
        }
        
        // ============================================================
        // COUNT 2: Student research papers
        // ============================================================
        $srWhereConditions = [];
        $srParams = [];
        $srTypes = "";
        
        // Event filter
        $srWhereConditions[] = "srp.event_id IN ($eventPlaceholders)";
        foreach ($eventIds as $eid) {
            $srParams[] = $eid;
            $srTypes .= "i";
        }
        
        // Category filter (student papers use category name directly)
        if ($userType === 'category' && !empty($categoryNames)) {
            $catNames = array_values($categoryNames);
            $catNamePlaceholders = implode(',', array_fill(0, count($catNames), '?'));
            $srWhereConditions[] = "srp.category IN ($catNamePlaceholders)";
            foreach ($catNames as $catName) {
                $srParams[] = $catName;
                $srTypes .= "s";
            }
        }
        
        // Student papers status - only pending or accepted
        $srWhereConditions[] = "srp.status IN ('pending', 'accepted')";
        
        $srWhereClause = !empty($srWhereConditions) ? "WHERE " . implode(" AND ", $srWhereConditions) : "";
        
        $srCountQuery = "SELECT COUNT(*) as count 
                        FROM student_research_papers srp
                        $srWhereClause";
        
        error_log("Student Count Query: " . $srCountQuery);
        
        $srStmt = $con->prepare($srCountQuery);
        if ($srStmt) {
            if (!empty($srParams)) {
                $srStmt->bind_param($srTypes, ...$srParams);
            }
            $srStmt->execute();
            $srResult = $srStmt->get_result();
            
            if ($row = $srResult->fetch_assoc()) {
                $totalCount += (int)$row['count'];
            }
            $srStmt->close();
        }
        
        $response->count = (int)$totalCount;
        error_log("Total papers count: " . $totalCount);
        
        $con->close();
    }

    // Return as JSON - simplified response
    ob_clean();
    echo json_encode($response);
    exit();
}

// If no action matched, return error
ob_clean();
echo json_encode(['error' => 'Invalid request']);
exit();