<?php
// Clear ALL output buffers
while (ob_get_level() > 0) {
    ob_end_clean();
}

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set JSON header ONCE
header('Content-Type: application/json; charset=utf-8');

// Include database config
require_once(__DIR__ . '/db.php');

// Prevent any other output
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && ($error['type'] === E_ERROR || $error['type'] === E_WARNING || $error['type'] === E_PARSE)) {
        ob_clean();
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
        }
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}

if(isset($_POST['getEventName'])){
    $response=[];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="SELECT event_list.name FROM event_list WHERE event_list.id=?";
        $statement=$con->prepare($query);
        $statement->bind_param("s", $_POST['eventId']);
        $statement->execute();
        $result=$statement->get_result();
        while ($row=$result->fetch_assoc()){
            $response[]=$row;
        }
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
        }
    }
    
    // FIX: Check if output buffering is active before cleaning
    if (ob_get_level() > 0) {
        ob_clean();
    }
    
    // Also set proper headers for JSON response
    header('Content-Type: application/json; charset=utf-8');
    
    echo json_encode($response);
    exit();
}

if (isset($_POST['requestEventRDE'])) {
    // Clear ALL buffers first
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    
    // Start fresh output buffer
    ob_start();
    
    header('Content-Type: application/json; charset=utf-8');

    $eventId = $_POST['eventId'] ?? '0';
    $page  = max(1, (int)($_POST['page'] ?? 1));
    $limit = max(1, min(50, (int)($_POST['limit'] ?? 10)));
    
    // NEW: Get lastId for keyset pagination
    $lastId = max(0, (int)($_POST['lastId'] ?? 0));
    
    $res = [
        'data' => [],
        'hasMore' => false,
        'total' => 0,
        'currentPage' => $page,
        'totalPages' => 0,
        'lastId' => 0 // Will be updated with last fetched ID
    ];

    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }

        // Disable mysqli error reporting to prevent output
        mysqli_report(MYSQLI_REPORT_OFF);
        
        /* ---------- COUNT (Optimized) ---------- */
        if ($eventId === '0') {
            $countSql = "
                SELECT COUNT(*) as total
                FROM researchfile
                INNER JOIN endorsement ON endorsement.id = researchfile.endorsementid
                WHERE endorsement.status = 'accepted'";
            $countStmt = $con->prepare($countSql);
        } else {
            $countSql = "
                SELECT COUNT(*) as total
                FROM researchfile
                INNER JOIN endorsement ON endorsement.id = researchfile.endorsementid
                INNER JOIN event_list ON researchfile.event = event_list.name
                WHERE event_list.id = ?";
            $countStmt = $con->prepare($countSql);
            
            if (!$countStmt) {
                throw new Exception('Count prepare failed: ' . $con->error);
            }
            
            $countStmt->bind_param('s', $eventId);
        }

        if (!$countStmt) {
            throw new Exception('Count query preparation failed: ' . $con->error);
        }

        if (!$countStmt->execute()) {
            throw new Exception('Count execution failed: ' . $countStmt->error);
        }

        $countResult = $countStmt->get_result();
        
        if (!$countResult) {
            throw new Exception('Failed to get count result');
        }
        
        $countRow = $countResult->fetch_assoc();
        $total = (int)($countRow['total'] ?? 0);
        
        // IMPORTANT: Free the result and close statement before next query
        $countResult->free();
        $countStmt->close();

        $res['total'] = $total;
        $res['totalPages'] = $total > 0 ? (int)ceil($total / $limit) : 0;

        // Only fetch data if there are results
        if ($total > 0) {
            /* ---------- KEYSET PAGINATION (Memory Efficient) ---------- */
            if ($eventId === '0') {
                if ($lastId > 0) {
                    // Continue from last ID (keyset pagination)
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
                        AND researchfile.id < ?  -- Changed from OFFSET to WHERE id < lastId
                        ORDER BY researchfile.id DESC
                        LIMIT ?";
                    $stmt = $con->prepare($sql);
                    
                    if (!$stmt) {
                        throw new Exception('Query preparation failed: ' . $con->error);
                    }
                    
                    $stmt->bind_param('ii', $lastId, $limit);
                } else {
                    // First page
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
                    
                    if (!$stmt) {
                        throw new Exception('Query preparation failed: ' . $con->error);
                    }
                    
                    $stmt->bind_param('i', $limit);
                }
            } else {
                // With event filter
                if ($lastId > 0) {
                    // Continue from last ID (keyset pagination)
                    $sql = "
                        SELECT
                            event_list.id AS eventId,
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
                        AND researchfile.id < ?  -- Changed from OFFSET to WHERE id < lastId
                        ORDER BY researchfile.id DESC
                        LIMIT ?";
                    $stmt = $con->prepare($sql);
                    
                    if (!$stmt) {
                        throw new Exception('Query preparation failed: ' . $con->error);
                    }
                    
                    $stmt->bind_param('sii', $eventId, $lastId, $limit);
                } else {
                    // First page
                    $sql = "
                        SELECT
                            event_list.id AS eventId,
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
                    
                    if (!$stmt) {
                        throw new Exception('Query preparation failed: ' . $con->error);
                    }
                    
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
            
            // Process rows one at a time to minimize memory usage
            while ($row = $result->fetch_assoc()) {
                // Only modify if needed
                if (!empty($row['drive_view_url'])) {
                    $row['file'] = $row['drive_view_url'];
                }
                $data[] = $row;
                $lastProcessedId = $row['id'];
            }

            // Set lastId for next request
            $res['lastId'] = $lastProcessedId;
            
            // Calculate hasMore (check if there are more records after the last one)
            if ($lastProcessedId > 0) {
                if ($eventId === '0') {
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
            } else {
                $res['hasMore'] = false;
            }

            $res['data'] = $data;

            // Clean up
            $result->free();
            $stmt->close();
        }

        $con->close();

    } catch (Exception $e) {
        // Clean buffer
        ob_clean();
        
        // Log error
        error_log("requestEventRDE Error: " . $e->getMessage());
        
        // Return error response
        echo json_encode([
            'error' => true,
            'message' => 'An error occurred while fetching documents',
            'debug' => $e->getMessage(), // Remove this in production
            'data' => [],
            'total' => 0,
            'currentPage' => $page,
            'totalPages' => 0,
            'hasMore' => false,
            'lastId' => 0
        ]);
        exit;
    }

    // Get clean output
    $output = ob_get_clean();
    
    // Send ONLY JSON response
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
        $statement->bind_param("s", $_POST['eventId']);
        $status = $statement->execute();

        if($status){
            $response->status = true;
            $response->message = "Event deleted..!";
        } else {
            $response->message = $statement->error;
        }
    } else {
        $response->message = $con->error;
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}

if(isset($_POST['collectEntries'])){
    $data = 0;
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Get center name with code format for filtering
        $centerFilter = '';
        $centerId = $_SESSION['centerId'] ?? '';
        
        if (!empty($centerId)) {
            $queryCenter = "SELECT name, code FROM center WHERE id = ?";
            $stmtCenter = $con->prepare($queryCenter);
            $stmtCenter->bind_param("s", $centerId);
            $stmtCenter->execute();
            $resultCenter = $stmtCenter->get_result();
            
            if ($rowCenter = $resultCenter->fetch_assoc()) {
                $centerFilter = $rowCenter['name'] . " (" . $rowCenter['code'] . ")";
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
            AND event_list.id = ?
            AND event_list.dead_line > CURRENT_TIMESTAMP";

        $statement = $con->prepare($query);
        $statement->bind_param("ss", $centerFilter, $eventId);
        $statement->execute();
        $result = $statement->get_result();
        $row = $result->fetch_assoc();
        
        $count = $row['count'] ?? 0;
        
    }

    echo $count;
    exit();
}