<?php
// Disable error display - critical for JSON responses
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT); // Enable logging but not display

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
    // Log error but don't output
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    return true; // Prevent default error handler
});

// Register shutdown function to catch fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        // Clear any output
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

if(isset($_POST['getEvent'])){
    $response=[];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="SELECT * FROM event_list WHERE event_list.dead_line > CURRENT_TIMESTAMP";
        $result = $con->query($query);
        if ($result) {
            while ($val = $result->fetch_assoc()) {
                $response[]=$val;
            }
            $result->free();
        }
        $con->close();
    }
    
    // Clear buffer and output JSON
    ob_clean();
    echo json_encode($response);
    exit();
}

if(isset($_POST['getEventName'])){
    $response=[];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="SELECT event_list.name FROM event_list WHERE event_list.id=?";
        $statement=$con->prepare($query);
        if ($statement) {
            $statement->bind_param("s", $_POST['eventId']);
            $statement->execute();
            $result=$statement->get_result();
            while ($row=$result->fetch_assoc()){
                $response[]=$row;
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

if(isset($_POST['getEventList'])){
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Select both id and name so the frontend can use ev.id and ev.name
        $query = "SELECT event_list.id, event_list.name FROM event_list ORDER BY event_list.name ASC";
        $statement = $con->prepare($query);
        if ($statement) {
            $statement->execute();
            $result = $statement->get_result();
            while ($row = $result->fetch_assoc()) {
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

if(isset($_POST['getEventAdmin'])){
    $response=[];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="SELECT 
            event_list.id, 
            event_list.name, 
            event_list.dead_line, 
            event_list.status, 
            event_list.date,
            score_sheet.id as scID 
            FROM event_list
            LEFT JOIN score_sheet ON event_list.id=score_sheet.event_id
            ORDER BY event_list.dead_line DESC";
        $result = $con->query($query);
        if ($result) {
            while ($val = $result->fetch_assoc()) {
                $response[]=$val;
            }
            $result->free();
        }
        $con->close();
    }
    
    // FIX: Check if output buffering is active before cleaning
    ob_clean();
    
    echo json_encode($response);
    exit();
}

if (isset($_POST['requestEventRDE'])) {
    // Ensure clean buffer
    ob_clean();
    
    $eventId = $_POST['eventId'] ?? '0';
    $page  = max(1, (int)($_POST['page'] ?? 1));
    $limit = max(1, min(50, (int)($_POST['limit'] ?? 10)));
    
    // Get lastId for keyset pagination
    $lastId = isset($_POST['lastId']) ? max(0, (int)$_POST['lastId']) : 0;
    
    $res = [
        'data' => [],
        'hasMore' => false,
        'total' => 0,
        'currentPage' => $page,
        'totalPages' => 0,
        'lastId' => 0
    ];

    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }

        // Disable mysqli error reporting
        mysqli_report(MYSQLI_REPORT_OFF);
        
        // Set charset
        $con->set_charset('utf8mb4');
        
        /* ---------- COUNT ---------- */
        if ($eventId === '0' || $eventId === '') {
            $countSql = "
                SELECT COUNT(*) as total
                FROM researchfile
                INNER JOIN endorsement ON endorsement.id = researchfile.endorsementid
                WHERE endorsement.status = 'accepted'";
            $countStmt = $con->prepare($countSql);
            
            if (!$countStmt) {
                throw new Exception('Count prepare failed: ' . $con->error);
            }
            
            $countStmt->execute();
        } else {
            $countSql = "
                SELECT COUNT(*) as total
                FROM researchfile
                INNER JOIN endorsement ON endorsement.id = researchfile.endorsementid
                INNER JOIN event_list ON researchfile.event = event_list.name
                WHERE endorsement.status = 'accepted'
                AND event_list.id = ?";
            $countStmt = $con->prepare($countSql);
            
            if (!$countStmt) {
                throw new Exception('Count prepare failed: ' . $con->error);
            }
            
            $countStmt->bind_param('s', $eventId);
            $countStmt->execute();
        }

        $countResult = $countStmt->get_result();
        
        if (!$countResult) {
            throw new Exception('Failed to get count result');
        }
        
        $countRow = $countResult->fetch_assoc();
        $total = (int)($countRow['total'] ?? 0);
        
        $countResult->free();
        $countStmt->close();

        $res['total'] = $total;
        $res['totalPages'] = $total > 0 ? (int)ceil($total / $limit) : 0;

        // Only fetch data if there are results
        if ($total > 0) {
            /* ---------- KEYSET PAGINATION ---------- */
            if ($eventId === '0' || $eventId === '') {
                if ($lastId > 0) {
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
                            researchfile.drive_folder_id,
                            researchfile.drive_event_folder_id,
                            researchfile.drive_center_folder_id,
                            researchfile.status,
                            researchfile.category,
                            researchfile.center,
                            researchfile.deletestate,
                            endorsement.campus,
                            endorsement.event,
                            endorsement.date,
                            endorsement.id AS endorsId
                        FROM researchfile
                        INNER JOIN endorsement ON endorsement.id = researchfile.endorsementid
                        WHERE endorsement.status = 'accepted'
                        AND researchfile.id < ?
                        ORDER BY researchfile.id DESC
                        LIMIT ?";
                    $stmt = $con->prepare($sql);
                    $stmt->bind_param('ii', $lastId, $limit);
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
                            researchfile.drive_folder_id,
                            researchfile.drive_event_folder_id,
                            researchfile.drive_center_folder_id,
                            researchfile.status,
                            researchfile.category,
                            researchfile.center,
                            researchfile.deletestate,
                            endorsement.campus,
                            endorsement.event,
                            endorsement.date,
                            endorsement.id AS endorsId
                        FROM researchfile
                        INNER JOIN endorsement ON endorsement.id = researchfile.endorsementid
                        WHERE endorsement.status = 'accepted'
                        ORDER BY researchfile.id DESC
                        LIMIT ?";
                    $stmt = $con->prepare($sql);
                    $stmt->bind_param('i', $limit);
                }
            } else {
                if ($lastId > 0) {
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
                            researchfile.drive_folder_id,
                            researchfile.drive_event_folder_id,
                            researchfile.drive_center_folder_id,
                            researchfile.status,
                            researchfile.category,
                            researchfile.center,
                            researchfile.deletestate,
                            endorsement.campus,
                            endorsement.event,
                            endorsement.date,
                            endorsement.id AS endorsId
                        FROM researchfile
                        INNER JOIN endorsement ON endorsement.id = researchfile.endorsementid
                        INNER JOIN event_list ON researchfile.event = event_list.name
                        WHERE event_list.id = ?
                        AND researchfile.id < ?
                        ORDER BY researchfile.id DESC
                        LIMIT ?";
                    $stmt = $con->prepare($sql);
                    $stmt->bind_param('sii', $eventId, $lastId, $limit);
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
                            researchfile.drive_folder_id,
                            researchfile.drive_event_folder_id,
                            researchfile.drive_center_folder_id,
                            researchfile.status,
                            researchfile.category,
                            researchfile.center,
                            researchfile.deletestate,
                            endorsement.campus,
                            endorsement.event,
                            endorsement.date,
                            endorsement.id AS endorsId
                        FROM researchfile
                        INNER JOIN endorsement ON endorsement.id = researchfile.endorsementid
                        INNER JOIN event_list ON researchfile.event = event_list.name
                        WHERE event_list.id = ?
                        ORDER BY researchfile.id DESC
                        LIMIT ?";
                    $stmt = $con->prepare($sql);
                    $stmt->bind_param('si', $eventId, $limit);
                }
            }

            if (!$stmt->execute()) {
                throw new Exception('Query execution failed: ' . $stmt->error);
            }

            $result = $stmt->get_result();
            
            if (!$result) {
                throw new Exception('Failed to get result set');
            }

            $data = [];
            $lastProcessedId = 0;
            
            while ($row = $result->fetch_assoc()) {
                // Process file URL
                if (!empty($row['drive_view_url'])) {
                    $row['file'] = $row['drive_view_url'];
                } elseif (empty($row['file']) && !empty($row['drive_file_id'])) {
                    $row['file'] = 'https://drive.google.com/file/d/' . $row['drive_file_id'] . '/preview';
                }
                $data[] = $row;
                $lastProcessedId = $row['id'];
            }

            $res['lastId'] = $lastProcessedId;
            $res['data'] = $data;

            // Check if there are more records
            if ($lastProcessedId > 0) {
                if ($eventId === '0' || $eventId === '') {
                    $hasMoreSql = "
                        SELECT 1 
                        FROM researchfile
                        INNER JOIN endorsement ON endorsement.id = researchfile.endorsementid
                        WHERE endorsement.status = 'accepted'
                        AND researchfile.id < ?
                        LIMIT 1";
                    $hasMoreStmt = $con->prepare($hasMoreSql);
                    $hasMoreStmt->bind_param('i', $lastProcessedId);
                } else {
                    $hasMoreSql = "
                        SELECT 1 
                        FROM researchfile
                        INNER JOIN endorsement ON endorsement.id = researchfile.endorsementid
                        INNER JOIN event_list ON researchfile.event = event_list.name
                        WHERE event_list.id = ?
                        AND researchfile.id < ?
                        LIMIT 1";
                    $hasMoreStmt = $con->prepare($hasMoreSql);
                    $hasMoreStmt->bind_param('si', $eventId, $lastProcessedId);
                }
                
                $hasMoreStmt->execute();
                $hasMoreResult = $hasMoreStmt->get_result();
                $res['hasMore'] = $hasMoreResult->num_rows > 0;
                
                $hasMoreResult->free();
                $hasMoreStmt->close();
            }

            $result->free();
            $stmt->close();
        }

        $con->close();

    } catch (Exception $e) {
        error_log("requestEventRDE Error: " . $e->getMessage());
        
        // Clear buffer and return error
        ob_clean();
        echo json_encode([
            'error' => true,
            'message' => 'An error occurred while fetching documents',
            'data' => [],
            'total' => 0,
            'currentPage' => $page,
            'totalPages' => 0,
            'hasMore' => false,
            'lastId' => 0
        ]);
        exit;
    }

    // Clear buffer and output clean JSON
    ob_clean();
    echo json_encode($res, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

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
                $response->message = "Event deleted..!";
            } else {
                $response->message = $statement->error;
            }
            $statement->close();
        } else {
            $response->message = $con->error;
        }
        $con->close();
    } else {
        $response->message = $con->error ?? 'Connection failed';
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}
// for evaluators number of entries
if(isset($_POST['collectEntries'])){
    $count = 0;
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Get center name with code format for filtering
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

    // Clear buffer and output count
    ob_clean();
    echo $count;
    exit();
}

// If no action matched, return error
ob_clean();
echo json_encode(['error' => 'Invalid request']);
exit();