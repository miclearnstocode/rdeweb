<?php
// Start output buffering FIRST to catch any notices/warnings
ob_start();

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include($_SERVER['DOCUMENT_ROOT'] . '/server/db.php');

/** @var TYPE_NAME $host */

/** @var TYPE_NAME $username */

/** @var TYPE_NAME $pass */

/** @var TYPE_NAME $dbName */

// Set JSON header
header('Content-Type: application/json');



if(isset($_POST['getEvent'])){

    $response=[];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query="SELECT * FROM event_list WHERE event_list.dead_line>CURRENT_TIMESTAMP ";

        foreach ($con->query($query) as $val) {

            $response[]=$val;

        }

    }

    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();

}

if(isset($_POST['getEventName'])){
    $response=[];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="SELECT event_list.name FROM event_list WHERE event_list.id=?";
        $statement=$con->prepare($query);
        $statement->bind_param("s",$_POST['eventId']);
        $statement->execute();
        $result=$statement->get_result();
        while ($row=$result->fetch_assoc()){
            $response[]=$row;
        }
    }
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
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
        score_sheet.id as scID FROM event_list
            LEFT JOIN score_sheet ON event_list.id=score_sheet.event_id
            ORDER BY event_list.dead_line DESC";
        foreach ($con->query($query) as $val) {
            $response[]=$val;
        }
    }
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}



if(isset($_POST['requestEventRDE'])) {
    // Clear all buffers
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    
    // Start fresh
    ob_start();
    
    // Set JSON header
    header('Content-Type: application/json; charset=utf-8');
    
    $res = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventId = $_POST['eventId'] ?? '0';
        $page = isset($_POST['page']) ? (int)$_POST['page'] : 1;
        $limit = isset($_POST['limit']) ? (int)$_POST['limit'] : 10;
        
        // Calculate offset for pagination
        $offset = ($page - 1) * $limit;
        
        error_log("PHP: Processing requestEventRDE with eventId: " . $eventId . ", page: " . $page . ", limit: " . $limit . ", offset: " . $offset);
        
        // First, get total count for pagination info
        $totalCount = 0;
        
        if($eventId === '0') {
            // Get total count
            $countQuery = "
                SELECT COUNT(*) as total
                FROM researchfile
                LEFT JOIN endorsement ON endorsement.id = researchfile.endorsementid
                WHERE endorsement.status = 'accepted'";
            
            $countStatement = $con->prepare($countQuery);
            if ($countStatement->execute()) {
                $countResult = $countStatement->get_result();
                $countRow = $countResult->fetch_assoc();
                $totalCount = $countRow['total'];
                $countStatement->close();
            }
            
            // Get paginated data
            $query = "
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
                    endorsement.id as endorsId
                FROM researchfile
                LEFT JOIN endorsement ON endorsement.id = researchfile.endorsementid
                WHERE endorsement.status = 'accepted'
                ORDER BY researchfile.id DESC
                LIMIT ? OFFSET ?";
            
            $statement = $con->prepare($query);
            $statement->bind_param('ii', $limit, $offset);
        } else {
            // Get total count for specific event
            $countQuery = "
                SELECT COUNT(*) as total
                FROM researchfile
                LEFT JOIN endorsement ON endorsement.id = researchfile.endorsementid
                LEFT JOIN event_list ON researchfile.event = event_list.name
                WHERE event_list.id = ?";
            
            $countStatement = $con->prepare($countQuery);
            $countStatement->bind_param('s', $eventId);
            if ($countStatement->execute()) {
                $countResult = $countStatement->get_result();
                $countRow = $countResult->fetch_assoc();
                $totalCount = $countRow['total'];
                $countStatement->close();
            }
            
            // Get paginated data for specific event
            $query = "
                SELECT
                    event_list.id as eventId,
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
                    endorsement.id as endorsId
                FROM researchfile
                LEFT JOIN endorsement ON endorsement.id = researchfile.endorsementid
                LEFT JOIN event_list ON researchfile.event = event_list.name
                WHERE event_list.id = ?
                ORDER BY researchfile.id DESC
                LIMIT ? OFFSET ?";
            
            $statement = $con->prepare($query);
            $statement->bind_param('sii', $eventId, $limit, $offset);
        }
        
        if ($statement->execute()) {
            $result = $statement->get_result();
            
            error_log("PHP: Query executed, found " . $result->num_rows . " rows (page: " . $page . ")");
            
            $data = [];
            while ($val = $result->fetch_assoc()) {
                // Process file paths
                if (!empty($val['drive_view_url'])) {
                    $val['file'] = $val['drive_view_url'];
                }
                
                // Add to data array
                $data[] = $val;
            }
            
            error_log("PHP: Added " . count($data) . " items to data array");
            
            // Calculate if there are more pages
            $hasMore = ($page * $limit) < $totalCount;
            
            // Prepare complete response
            $res = [
                'data' => $data,
                'hasMore' => $hasMore,
                'total' => $totalCount,
                'currentPage' => $page,
                'totalPages' => ceil($totalCount / $limit)
            ];
            
            $statement->close();
        } else {
            error_log("PHP: Query execution failed: " . $statement->error);
            $res = ['error' => 'Query failed: ' . $statement->error];
        }
        
        $con->close();
    } else {
        error_log("PHP: Database connection failed");
        $res = ['error' => 'Database connection failed'];
    }
    
    // Clear output buffer and send JSON
    ob_clean();
    
    $json = json_encode($res);
    if ($json === false) {
        error_log("PHP: json_encode failed: " . json_last_error_msg());
        $json = json_encode(['error' => 'Failed to encode JSON: ' . json_last_error_msg()]);
    } else {
        error_log("PHP: JSON encoded successfully, length: " . strlen($json));
    }
    
    echo $json;
    exit();
}



if(isset($_POST['deleteEvent'])){

    $response=new stdClass();

    $response->message='';

    $response->status=false;

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query="DELETE FROM event_list WHERE event_list.id=?";

        $statement=$con->prepare($query);

        $statement->bind_param("s",$_POST['eventId']);

        $status=$statement->execute();

        if($status){

            $response->status=true;

            $response->message="Event deleted..!";

        }else{

            $response->message=$statement->error;

        }

    }else{

        $response->message=$con->error;

    }
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();

}



if(isset($_POST['collectEntries'])){
    $data=0;
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
                // Format: "Center Name (CODE)" to match researchfile.center column
                $centerFilter = $rowCenter['name'] . " (" . $rowCenter['code'] . ")";
            }
        }
        
        // Fallback to session center if center not found
        if (empty($centerFilter)) {
            $centerFilter = $_SESSION['center'] ?? '';
        }
        
        error_log("DEBUG - Center filter for researchfile.center: $centerFilter");
        
        $eventId = $_SESSION['eventId'] ?? '';
        
        // UPDATED QUERY: Changed researchfile.category to researchfile.center
        $query="SELECT COUNT(*) as count FROM researchfile 
            LEFT JOIN endorsement ON researchfile.endorsementid=endorsement.id
            LEFT JOIN event_list ON researchfile.event_id=event_list.id
            WHERE endorsement.status='accepted' 
            AND researchfile.center = ?  -- Changed from researchfile.category
            AND event_list.id=?
            AND event_list.dead_line > CURRENT_TIMESTAMP";

        $statement= $con->prepare($query);
        $statement->bind_param("ss", $centerFilter, $eventId);
        $statement->execute();
        $result = $statement->get_result();
        $row = $result->fetch_assoc();
        
        $count = $row['count'] ?? 0;
        error_log("DEBUG - Query returned count: $count");
        
        ob_clean();
        echo $count;
        ob_end_flush();
        exit();
    }
}

// Default response if no valid POST data
ob_clean();
echo json_encode([
    'error' => 'Invalid request',
    'status' => false
]);
ob_end_flush();
exit();