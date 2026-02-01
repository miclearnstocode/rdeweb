<?php

// Set header FIRST before any output
header('Content-Type: application/json; charset=utf-8');

// Start output buffering to catch any notices/warnings
ob_start();

include('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

if (isset($_POST['scoreRank'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventId = $_POST['getEventId'];
        
        // First, get event information
        $eventQuery = "SELECT name FROM event_list WHERE id = ?";
        $eventStmt = $con->prepare($eventQuery);
        $eventStmt->bind_param("i", $eventId);
        $eventStmt->execute();
        $eventResult = $eventStmt->get_result();
        $eventRow = $eventResult->fetch_assoc();
        $eventName = $eventRow ? $eventRow['name'] : 'Unknown Event';
        
        // Add event info to response
        $response['event'] = [
            'id' => $eventId,
            'name' => $eventName
        ];
        
        // Get categories/centers based on event type
        if ($eventId >= 13) {
            // NEW SYSTEM: Use center for events 13 and above
            $query = "SELECT 
                center.id,
                center.name,
                center.code,
                COUNT(researchfile.id) as total 
            FROM center
            LEFT JOIN researchfile ON researchfile.center = CONCAT(center.name, ' (', center.code, ')')
            LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
            LEFT JOIN event_list ON researchfile.event_id = event_list.id
            WHERE endorsement.status = 'accepted' 
            AND event_list.id = ?
            AND researchfile.center IS NOT NULL
            GROUP BY center.id, center.name, center.code
            ORDER BY center.name";
        } else {
            // OLD SYSTEM: Use category for events below 13
            $query = "SELECT 
                category.id,
                category.name,
                '' as code,
                COUNT(researchfile.id) as total 
            FROM category
            LEFT JOIN researchfile ON researchfile.category = category.name
            LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
            LEFT JOIN event_list ON researchfile.event_id = event_list.id
            WHERE endorsement.status = 'accepted' 
            AND event_list.id = ?
            AND researchfile.category IS NOT NULL
            GROUP BY category.id, category.name
            ORDER BY category.name";
        }
        
        $statement = $con->prepare($query);
        $statement->bind_param("i", $eventId);
        $statement->execute();
        $result = $statement->get_result();
        
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        
        $response['items'] = $items;
        $response['isNewSystem'] = ($eventId >= 13);
    }
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}

if (isset($_POST['getEventName'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT event_list.name FROM event_list WHERE event_list.id=?";
        $statement = $con->prepare($query);
    
        $eventId = $_POST['eventId'] ?? $_POST['getEventName'] ?? '';// Fix: Use $_POST['eventId'] instead of $_POST['getEventName']
        $statement->bind_param("s", $eventId);                     // Or check which parameter is actually being sent
        
        $statement->execute();
        $result = $statement->get_result();
        
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $response[] = $row;
            }
        } else {
            $response[] = ['name' => 'Unknown Event'];
        }
    } else {
        $response[] = ['name' => 'Database Error'];
    }
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}

if (isset($_POST['getCatIdName'])) {
    $response = [];
    
    $itemId = $_POST['getCatIdName'];
    $eventId = $_POST['eventId'] ?? 0;
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Determine if this is center or category based on event ID
        if ($eventId >= 13) {
            // Get center name
            $query = "SELECT name, code FROM center WHERE id = ?";
            $statement = $con->prepare($query);
            $statement->bind_param("i", $itemId);
            $statement->execute();
            $result = $statement->get_result();
            
            if ($row = $result->fetch_assoc()) {
                // Return formatted center name for new system
                $response[] = ['name' => $row['name'] . " (" . $row['code'] . ")"];
            }
        } else {
            // Get category name
            $query = "SELECT name FROM category WHERE id = ?";
            $statement = $con->prepare($query);
            $statement->bind_param("i", $itemId);
            $statement->execute();
            $result = $statement->get_result();
            
            while ($row = $result->fetch_assoc()) {
                $response[] = $row;
            }
        }
    }
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}

if (isset($_POST['getDocPerRank'])) {
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventId = $_POST['eventId'];
        $itemId = $_POST['categoryId'];
        
        if ($eventId >= 13) {
            // NEW SYSTEM: Get by center
            // If itemId is 0 or empty, get all centers for this event
            if ($itemId == 0 || empty($itemId)) {
                // Get all documents for this event (new system)
                $query = "SELECT 
                    researchfile.id,
                    researchfile.title,
                    researchfile.author,
                    researchfile.campus,
                    researchfile.center as name
                FROM researchfile
                LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
                LEFT JOIN event_list ON researchfile.event_id = event_list.id
                WHERE endorsement.status = 'accepted' 
                AND event_list.id = ?
                AND researchfile.center IS NOT NULL
                AND researchfile.center != ''";
                    
                $statement = $con->prepare($query);
                $statement->bind_param("i", $eventId);
            } else {
                // Get by specific center
                $centerQuery = "SELECT name, code FROM center WHERE id = ?";
                $centerStmt = $con->prepare($centerQuery);
                $centerStmt->bind_param("i", $itemId);
                $centerStmt->execute();
                $centerResult = $centerStmt->get_result();
                $centerRow = $centerResult->fetch_assoc();
                
                if ($centerRow) {
                    $centerDisplay = $centerRow['name'] . " (" . $centerRow['code'] . ")";
                    
                    $query = "SELECT 
                        researchfile.id,
                        researchfile.title,
                        researchfile.author,
                        researchfile.campus,
                        researchfile.center as name
                    FROM researchfile
                    LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
                    LEFT JOIN event_list ON researchfile.event_id = event_list.id
                    WHERE endorsement.status = 'accepted' 
                    AND event_list.id = ?
                    AND researchfile.center = ?";
                        
                    $statement = $con->prepare($query);
                    $statement->bind_param("is", $eventId, $centerDisplay);
                }
            }
        } else {
            // OLD SYSTEM: Get by category
            // If itemId is 0 or empty, get all categories for this event
            if ($itemId == 0 || empty($itemId)) {
                $query = "SELECT 
                    researchfile.id,
                    researchfile.title,
                    researchfile.author,
                    researchfile.campus,
                    researchfile.category as name
                FROM researchfile
                LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
                LEFT JOIN event_list ON researchfile.event_id = event_list.id
                WHERE endorsement.status = 'accepted' 
                AND event_list.id = ?
                AND researchfile.category IS NOT NULL
                AND researchfile.category != ''";
                    
                $statement = $con->prepare($query);
                $statement->bind_param("i", $eventId);
            } else {
                // Get by specific category
                $query = "SELECT 
                    researchfile.id,
                    researchfile.title,
                    researchfile.author,
                    researchfile.campus,
                    researchfile.category as name
                FROM researchfile
                LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
                LEFT JOIN event_list ON researchfile.event_id = event_list.id
                WHERE endorsement.status = 'accepted' 
                AND event_list.id = ?
                AND researchfile.category IN (
                    SELECT name FROM category WHERE id = ?
                    UNION
                    SELECT ? as name
                )";
                    
                $statement = $con->prepare($query);
                $statement->bind_param("iis", $eventId, $itemId, $itemId);
            }
        }
        
        if (isset($statement)) {
            $statement->execute();
            $result = $statement->get_result();

            while ($row = $result->fetch_assoc()) {
                $doc = new stdClass();
                $doc->title = $row['title'];
                $doc->id = $row['id'];
                $doc->author = $row['author'];
                $doc->campus = $row['campus'];
                $doc->name = $row['name'];
                $doc->criteria = [];
                
                // Get scores for this document
                $queryB = "SELECT 
                    evaluator.fullname,
                    score_board.id,
                    criteria.name,
                    criteria.description,
                    CONCAT(criteria.percentage,'%') as percentage,
                    score_board.score,
                    ROUND(score_board.score*(criteria.percentage/100),2) as scorePercent 
                FROM score_board
                LEFT JOIN criteria ON score_board.criteria_id = criteria.id
                LEFT JOIN evaluator ON score_board.eval_id = evaluator.id
                WHERE score_board.doc_id = ? 
                ORDER BY evaluator.id";
                    
                $statement2 = $con->prepare($queryB);
                $statement2->bind_param("s", $row['id']);
                $statement2->execute();
                $resultScoreBoard = $statement2->get_result();
                
                while ($row2 = $resultScoreBoard->fetch_assoc()) {
                    $doc->criteria[] = $row2;
                }
                
                $response[] = $doc;
            }
        }
    }
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}