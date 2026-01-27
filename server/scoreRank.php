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
        
        if ($eventId >= 13) {
            // NEW SYSTEM: Use center table and handle display format
            $query = "SELECT 
                center.id,
                center.name,
                center.code,
                COUNT(researchfile.category) as total 
            FROM center
            LEFT JOIN researchfile ON (
                researchfile.category = CONCAT(center.name, ' (', center.code, ')') OR
                researchfile.category = center.name
            )
            LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
            LEFT JOIN event_list ON researchfile.event = event_list.name
            WHERE endorsement.status = 'accepted' 
            AND event_list.id = ?
            GROUP BY center.id, center.name, center.code
            ORDER BY center.name";
        } else {
            // OLD SYSTEM: Use category table
            $query = "SELECT 
                category.id,
                category.name,
                '' as code,
                COUNT(researchfile.category) as total 
            FROM category
            LEFT JOIN researchfile ON category.name = researchfile.category
            LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
            LEFT JOIN event_list ON researchfile.event = event_list.name
            WHERE endorsement.status = 'accepted' 
            AND event_list.id = ?
            GROUP BY researchfile.category
            ORDER BY category.name";
        }
        
        $statement = $con->prepare($query);
        $statement->bind_param("i", $eventId);
        $statement->execute();
        $result = $statement->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $response[] = $row;
        }
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
    
    $categoryId = $_POST['getCatIdName'];
    $eventId = $_POST['eventId'] ?? null; // Need eventId to determine if new or old
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Check if this is for a new event (eventId >= 13)
        if ($eventId && $eventId >= 13) {
            // New system: get center name
            $query = "SELECT name FROM center WHERE id = ?";
        } else {
            // Old system: get category name
            $query = "SELECT name FROM category WHERE id = ?";
        }
        
        $statement = $con->prepare($query);
        $statement->bind_param("i", $categoryId);
        $statement->execute();
        $result = $statement->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $response[] = $row;
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
        $centerId = $_POST['categoryId'];
        
        if ($eventId >= 13) {
            // NEW SYSTEM: Get center info and handle display format
            $centerQuery = "SELECT name, code FROM center WHERE id = ?";
            $centerStmt = $con->prepare($centerQuery);
            $centerStmt->bind_param("i", $centerId);
            $centerStmt->execute();
            $centerResult = $centerStmt->get_result();
            $centerRow = $centerResult->fetch_assoc();
            
            if ($centerRow) {
                $centerName = $centerRow['name'];
                $centerCode = $centerRow['code'];
                $displayFormat = $centerName . " (" . $centerCode . ")";
                
                // Try both formats: display format and plain name
                $queryA = "SELECT researchfile.title, researchfile.id, researchfile.category as name 
                    FROM researchfile
                    LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
                    LEFT JOIN event_list ON researchfile.event = event_list.name
                    WHERE endorsement.status = 'accepted' 
                    AND event_list.id = ?
                    AND (researchfile.category = ? OR researchfile.category = ?)";
                    
                $statement = $con->prepare($queryA);
                $statement->bind_param("sss", $eventId, $displayFormat, $centerName);
            } else {
                // Center not found
                echo json_encode($response);
                exit();
            }
        } else {
            // OLD SYSTEM
            $queryA = "SELECT researchfile.title, researchfile.id, category.name 
                FROM researchfile
                LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
                LEFT JOIN event_list ON researchfile.event = event_list.name
                LEFT JOIN category ON researchfile.category = category.name
                WHERE endorsement.status = 'accepted' 
                AND category.id = ? 
                AND event_list.id = ?";
                
            $statement = $con->prepare($queryA);
            $statement->bind_param("ss", $centerId, $eventId);
        }
        
        $statement->execute();
        $result = $statement->get_result();

        while ($row = $result->fetch_assoc()) {
            $doc = new stdClass();
            $doc->name = $row['title'];
            $doc->criteria = [];
            
            $queryB = "SELECT 
                evaluator.fullname,
                score_board.id,
                criteria.name,
                criteria.description,
                concat(criteria.percentage,'%') as percentage,
                score_board.score,
                round(score_board.score*(criteria.percentage/100),2) as scorePercent 
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
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}