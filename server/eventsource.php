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

// Request Event RDE Documents - FIXED VERSION
if (isset($_POST['requestEventRDE'])) {
    ob_clean();
    
    $eventId = $_POST['eventId'] ?? '0';
    $page = max(1, (int)($_POST['page'] ?? 1));
    $limit = max(1, min(50, (int)($_POST['limit'] ?? 10)));
    $offset = ($page - 1) * $limit; // Use OFFSET instead of keyset pagination for simplicity
    
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
        
        // FIXED COUNT query - corrected the WHERE clause syntax
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
            // FIXED DATA query - simplified with OFFSET pagination
            if ($eventId === '0' || $eventId === '') {
                // Query for All Events
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
                // Query for specific event
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
                // Handle file URL - prioritize drive_view_url
                if (!empty($row['drive_view_url'])) {
                    $row['file'] = $row['drive_view_url'];
                } elseif (empty($row['file']) && !empty($row['drive_file_id'])) {
                    $row['file'] = 'https://drive.google.com/file/d/' . $row['drive_file_id'] . '/preview';
                }
                $data[] = $row;
            }

            $res['data'] = $data;
            
            // Check if there are more records
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

// Collect Entries for Evaluators
if(isset($_POST['collectEntries'])){
    $count = 0;
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $centerFilter = '';
        $centerId = $_SESSION['centerId'] ?? '';
        
        if (!empty($centerId)) {
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
        }
        
        if (empty($centerFilter)) {
            $centerFilter = $_SESSION['center'] ?? '';
        }
        
        $eventId = $_SESSION['eventId'] ?? '';
        
        $query = "SELECT COUNT(*) as count FROM researchfile 
            LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
            LEFT JOIN event_list ON researchfile.event_id = event_list.id
            WHERE endorsement.status = 'accepted' 
            AND researchfile.center = ?
            AND event_list.id = ?";

        $statement = $con->prepare($query);
        if ($statement) {
            $statement->bind_param("ss", $centerFilter, $eventId);
            $statement->execute();
            $result = $statement->get_result();
            $row = $result->fetch_assoc();
            $count = $row['count'] ?? 0;
            
            $result->free();
            $statement->close();
        }
        $con->close();
    }

    ob_clean();
    echo $count;
    exit();
}

// If no action matched, return error
ob_clean();
echo json_encode(['error' => 'Invalid request']);
exit();