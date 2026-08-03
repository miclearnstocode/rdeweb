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
        
        if ($eventId === '0' || $eventId === '') {
            $countSql = "
                SELECT COUNT(*) as total
                FROM researchfile
                INNER JOIN endorsement ON endorsement.id = researchfile.endorsementid
                WHERE (endorsement.status = 'accepted' OR researchfile.status = 'accepted')";
            $countStmt = $con->prepare($countSql);
            
            if (!$countStmt) {
                throw new Exception('Prepare count failed: ' . $con->error);
            }
            
            $countStmt->execute();
        } else {
            $countSql = "
                SELECT COUNT(*) as total
                FROM researchfile
                INNER JOIN endorsement ON endorsement.id = researchfile.endorsementid
                INNER JOIN event_list ON researchfile.event = event_list.name
                WHERE (endorsement.status = 'accepted' OR researchfile.status = 'accepted')
                AND event_list.id = ?";
            $countStmt = $con->prepare($countSql);
            
            if (!$countStmt) {
                throw new Exception('Prepare count failed: ' . $con->error);
            }
            
            $countStmt->bind_param('s', $eventId);
            $countStmt->execute();
        }

        $countResult = $countStmt->get_result();
        $countRow = $countResult->fetch_assoc();
        $total = (int)($countRow['total'] ?? 0);
        
        $countResult->free();
        $countStmt->close();

        $res['total'] = $total;
        $res['totalPages'] = $total > 0 ? (int)ceil($total / $limit) : 0;

        if ($total > 0) {
            if ($eventId === '0' || $eventId === '') {
                $sql = "
                    SELECT
                        researchfile.id,
                        researchfile.senderid,
                        researchfile.author,
                        researchfile.title,
                        researchfile.file,
                        researchfile.drive_view_url,
                        researchfile.drive_file_id,
                        researchfile.drive_download_url,
                        researchfile.status,
                        researchfile.category,
                        researchfile.center,
                        endorsement.campus,
                        endorsement.event,
                        endorsement.date,
                        endorsement.id AS endorsId
                    FROM researchfile
                    INNER JOIN endorsement ON endorsement.id = researchfile.endorsementid
                    WHERE (endorsement.status = 'accepted' OR researchfile.status = 'accepted')
                    ORDER BY researchfile.id DESC
                    LIMIT ? OFFSET ?";
                
                $stmt = $con->prepare($sql);
                
                if (!$stmt) {
                    throw new Exception('Prepare data statement failed: ' . $con->error);
                }
                
                $stmt->bind_param('ii', $limit, $offset);
                
            } else {
                $sql = "
                    SELECT
                        researchfile.id,
                        researchfile.senderid,
                        researchfile.author,
                        researchfile.title,
                        researchfile.file,
                        researchfile.drive_view_url,
                        researchfile.drive_file_id,
                        researchfile.drive_download_url,
                        researchfile.status,
                        researchfile.category,
                        researchfile.center,
                        endorsement.campus,
                        endorsement.event,
                        endorsement.date,
                        endorsement.id AS endorsId
                    FROM researchfile
                    INNER JOIN endorsement ON endorsement.id = researchfile.endorsementid
                    INNER JOIN event_list ON researchfile.event = event_list.name
                    WHERE (endorsement.status = 'accepted' OR researchfile.status = 'accepted')
                    AND event_list.id = ?
                    ORDER BY researchfile.id DESC
                    LIMIT ? OFFSET ?";
                
                $stmt = $con->prepare($sql);
                
                if (!$stmt) {
                    throw new Exception('Prepare data statement failed: ' . $con->error);
                }
                
                $stmt->bind_param('sii', $eventId, $limit, $offset);
            }

            $stmt->execute();
            $result = $stmt->get_result();
            
            $data = [];
            
            while ($row = $result->fetch_assoc()) {
                if (!empty($row['drive_view_url'])) {
                    $row['file'] = $row['drive_view_url'];
                } elseif (empty($row['file']) && !empty($row['drive_file_id'])) {
                    $row['file'] = 'https://drive.google.com/file/d/' . $row['drive_file_id'] . '/preview';
                }
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
// Search Documents - no event selection required
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
        
        // Count query
        $countSql = "
            SELECT COUNT(*) as total
            FROM researchfile rf
            INNER JOIN endorsement ON endorsement.id = rf.endorsementid
            WHERE (endorsement.status = 'accepted' OR rf.status = 'accepted')
            {$whereClause}";
        
        $countStmt = $con->prepare($countSql);
        
        if (!$countStmt) {
            throw new Exception('Prepare count failed: ' . $con->error);
        }
        
        if (!empty($params)) {
            $countStmt->bind_param($types, ...$params);
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
            // Data query
            $sql = "
                SELECT
                    rf.id,
                    rf.senderid,
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
                    endorsement.id AS endorsId
                FROM researchfile rf
                INNER JOIN endorsement ON endorsement.id = rf.endorsementid
                WHERE (endorsement.status = 'accepted' OR rf.status = 'accepted')
                {$whereClause}
                ORDER BY rf.id DESC
                LIMIT ? OFFSET ?";
            
            $stmt = $con->prepare($sql);
            
            if (!$stmt) {
                throw new Exception('Prepare data statement failed: ' . $con->error);
            }
            
            // Add limit and offset to params
            $allParams = array_merge($params, [$limit, $offset]);
            $allTypes = $types . "ii";
            
            if (!empty($allParams)) {
                $stmt->bind_param($allTypes, ...$allParams);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            
            $data = [];
            
            while ($row = $result->fetch_assoc()) {
                if (!empty($row['drive_view_url'])) {
                    $row['file'] = $row['drive_view_url'];
                } elseif (empty($row['file']) && !empty($row['drive_file_id'])) {
                    $row['file'] = 'https://drive.google.com/file/d/' . $row['drive_file_id'] . '/preview';
                }
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

// Collect Entries for Evaluators
if(isset($_POST['collectEntries'])){
    $count = 0;
    $response = new stdClass();
    $response->count = 0;
    $response->userType = '';
    $response->categoryCounts = [];
    $response->totalUnique = 0;
    $response->totalDuplicateCount = 0;
    $response->hasDuplicates = false;

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $userId = $_SESSION['userId'] ?? '';
        $centerId = $_SESSION['centerId'] ?? '';
        $eventId = $_SESSION['eventId'] ?? '';
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
        
        $response->userType = $userType;
        
        // Fetch all papers first, then apply duplicate detection
        $allPapers = [];
        
        if ($userType === 'center' && !empty($centerFilter) && !empty($eventId)) {
            // Fetch all papers for this center
            $query = "SELECT 
                        rf.id,
                        rf.title,
                        rf.final_symposium_title,
                        rf.author,
                        rf.coauthor,
                        rf.presenter,
                        rf.category,
                        rf.center,
                        rf.campus,
                        rf.event_id,
                        category.name as category_name
                      FROM researchfile rf
                      LEFT JOIN endorsement ON rf.endorsementid = endorsement.id
                      LEFT JOIN category ON rf.category = category.name
                      LEFT JOIN event_list ON rf.event_id = event_list.id
                      WHERE endorsement.status = 'accepted' 
                      AND rf.center = ? 
                      AND event_list.id = ?";

            $statement = $con->prepare($query);
            if ($statement) {
                $statement->bind_param("ss", $centerFilter, $eventId);
                $statement->execute();
                $result = $statement->get_result();
                
                while ($row = $result->fetch_assoc()) {
                    $allPapers[] = $row;
                }
                
                $result->free();
                $statement->close();
            }
            
        } else if ($userType === 'category' && !empty($categoryIds) && !empty($eventId)) {
            // Fetch all papers for these categories
            $placeholders = implode(',', array_fill(0, count($categoryIds), '?'));
            
            $query = "SELECT 
                        rf.id,
                        rf.title,
                        rf.final_symposium_title,
                        rf.author,
                        rf.coauthor,
                        rf.presenter,
                        rf.category,
                        rf.center,
                        rf.campus,
                        rf.event_id,
                        category.name as category_name
                      FROM researchfile rf
                      LEFT JOIN endorsement ON rf.endorsementid = endorsement.id
                      LEFT JOIN category ON rf.category = category.name
                      LEFT JOIN event_list ON rf.event_id = event_list.id
                      WHERE category.id IN ($placeholders)
                      AND endorsement.status = 'accepted'
                      AND event_list.id = ?";

            $statement = $con->prepare($query);
            if ($statement) {
                $types = str_repeat("i", count($categoryIds)) . "s";
                $params = array_merge($categoryIds, [$eventId]);
                $statement->bind_param($types, ...$params);
                $statement->execute();
                $result = $statement->get_result();
                
                while ($row = $result->fetch_assoc()) {
                    $allPapers[] = $row;
                }
                
                $result->free();
                $statement->close();
            }
            
        } else if ($userType === 'center' && empty($centerFilter)) {
            $centerFromSession = $_SESSION['center'] ?? '';
            if (!empty($centerFromSession) && !empty($eventId)) {
                $query = "SELECT 
                            rf.id,
                            rf.title,
                            rf.final_symposium_title,
                            rf.author,
                            rf.coauthor,
                            rf.presenter,
                            rf.category,
                            rf.center,
                            rf.campus,
                            rf.event_id,
                            category.name as category_name
                          FROM researchfile rf
                          LEFT JOIN endorsement ON rf.endorsementid = endorsement.id
                          LEFT JOIN category ON rf.category = category.name
                          LEFT JOIN event_list ON rf.event_id = event_list.id
                          WHERE endorsement.status = 'accepted' 
                          AND (rf.center = ? OR rf.center LIKE ? OR UPPER(rf.center) = UPPER(?))
                          AND event_list.id = ?";

                $statement = $con->prepare($query);
                if ($statement) {
                    $centerLike = "%$centerFromSession%";
                    $centerUpper = strtoupper($centerFromSession);
                    $statement->bind_param("ssss", $centerFromSession, $centerLike, $centerUpper, $eventId);
                    $statement->execute();
                    $result = $statement->get_result();
                    
                    while ($row = $result->fetch_assoc()) {
                        $allPapers[] = $row;
                    }
                    
                    $result->free();
                    $statement->close();
                }
            }
        }
        
        // --- DUPLICATE DETECTION ---
        $uniquePapers = [];
        $duplicateGroups = [];
        
        // Helper function to get all authors from a paper
        $getAllAuthors = function($paper) {
            $authors = [];
            
            if (!empty($paper['author'])) {
                $cleanedAuthor = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $paper['author']);
                $authorList = array_map('trim', explode(',', $cleanedAuthor));
                $authors = array_merge($authors, $authorList);
            }
            
            if (!empty($paper['presenter'])) {
                $cleanedPresenter = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $paper['presenter']);
                $authors[] = trim($cleanedPresenter);
            }
            
            if (!empty($paper['coauthor'])) {
                $coauthorData = $paper['coauthor'];
                if (is_string($coauthorData)) {
                    if (strpos($coauthorData, '[') === 0) {
                        $coauthorArray = json_decode($coauthorData, true);
                        if (is_array($coauthorArray)) {
                            foreach ($coauthorArray as $coauthor) {
                                $cleaned = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $coauthor);
                                $authors[] = trim($cleaned);
                            }
                        }
                    } else {
                        $coauthorList = array_map('trim', explode(',', $coauthorData));
                        $authors = array_merge($authors, $coauthorList);
                    }
                } else if (is_array($coauthorData)) {
                    foreach ($coauthorData as $coauthor) {
                        $cleaned = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $coauthor);
                        $authors[] = trim($cleaned);
                    }
                }
            }
            
            $authors = array_filter($authors);
            $authors = array_unique($authors);
            return $authors;
        };
        
        // First pass: Group by title similarity and author similarity
        foreach ($allPapers as $paper) {
            $displayTitle = !empty($paper['final_symposium_title']) 
                ? $paper['final_symposium_title'] 
                : $paper['title'];
            
            $isDuplicate = false;
            $duplicateGroupId = null;
            
            // Check against existing unique papers
            foreach ($uniquePapers as $key => $uniquePaper) {
                $uniqueDisplayTitle = !empty($uniquePaper['final_symposium_title']) 
                    ? $uniquePaper['final_symposium_title'] 
                    : $uniquePaper['title'];
                
                // Check if title is similar
                $titleSimilar = isSimilarString($displayTitle, $uniqueDisplayTitle, 75);
                
                if ($titleSimilar) {
                    // Get all authors for both papers
                    $authors1 = $getAllAuthors($paper);
                    $authors2 = $getAllAuthors($uniquePaper);
                    
                    // Check if authors are similar
                    if (areAuthorsSimilar($authors1, $authors2, 70)) {
                        $isDuplicate = true;
                        $duplicateGroupId = $key;
                        break;
                    }
                }
            }
            
            if ($isDuplicate && $duplicateGroupId !== null) {
                // This is a duplicate - add to duplicate group
                if (!isset($duplicateGroups[$duplicateGroupId])) {
                    $duplicateGroups[$duplicateGroupId] = [
                        'original' => $uniquePapers[$duplicateGroupId],
                        'duplicates' => []
                    ];
                }
                $duplicateGroups[$duplicateGroupId]['duplicates'][] = $paper;
            } else {
                // This is a unique paper
                $uniquePapers[] = $paper;
            }
        }
        
        // Count unique papers by category
        $categoryCounts = [];
        foreach ($uniquePapers as $paper) {
            $categoryName = $paper['category'] ?? 'Uncategorized';
            $catId = null;
            
            // Try to find category ID
            if (!empty($categoryIds)) {
                foreach ($categoryIds as $id) {
                    if (isset($categoryNames[$id]) && $categoryNames[$id] === $categoryName) {
                        $catId = $id;
                        break;
                    }
                }
            }
            
            if (!isset($categoryCounts[$categoryName])) {
                $categoryCounts[$categoryName] = [
                    'id' => $catId,
                    'name' => $categoryName,
                    'count' => 0,
                    'paperIds' => []
                ];
            }
            $categoryCounts[$categoryName]['count']++;
            $categoryCounts[$categoryName]['paperIds'][] = $paper['id'];
        }
        
        // Convert to response format
        foreach ($categoryCounts as $categoryName => $catData) {
            if ($catData['id'] !== null) {
                $response->categoryCounts[$catData['id']] = [
                    'id' => $catData['id'],
                    'name' => $catData['name'],
                    'count' => $catData['count'],
                    'paperIds' => $catData['paperIds']
                ];
            }
        }
        
        // Set the total count (only unique papers)
        $totalPapers = count($allPapers);
        $totalUnique = count($uniquePapers);
        $totalDuplicates = $totalPapers - $totalUnique;
        
        error_log("=== DUPLICATE DETECTION RESULTS (collectEntries) ===");
        error_log("Total papers found: $totalPapers");
        error_log("Unique papers: $totalUnique");
        error_log("Duplicate papers removed: $totalDuplicates");
        error_log("Duplicate groups: " . count($duplicateGroups));
        
        $response->count = $totalUnique;
        $response->totalUnique = $totalUnique;
        $response->totalDuplicateCount = $totalDuplicates;
        $response->hasDuplicates = count($duplicateGroups) > 0;
        $response->duplicateGroups = $duplicateGroups;
        $response->allPapers = $allPapers; // Keep original for reference
        $response->uniquePapers = $uniquePapers; // Keep unique for reference
        
        $con->close();
    }

    // Return as JSON
    ob_clean();
    echo json_encode($response);
    exit();
}

// If no action matched, return error
ob_clean();
echo json_encode(['error' => 'Invalid request']);
exit();