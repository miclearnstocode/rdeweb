<?php
// Set header FIRST before any output
header('Content-Type: application/json; charset=utf-8');

error_reporting(0);
ini_set('display_errors', 0);
if (ob_get_level() == 0) {
    ob_start();
}

require_once( __DIR__ . '/db.php');
/** @var TYP)E_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

function output_json($response) {
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    
    echo json_encode($response);
    exit();
}

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
        
        $response['event'] = [
            'id' => $eventId,
            'name' => $eventName
        ];
        
        // ALWAYS USE CATEGORY - removed new system logic
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
        
        $statement = $con->prepare($query);
        $statement->bind_param("i", $eventId);
        $statement->execute();
        $result = $statement->get_result();
        
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        
        $response['items'] = $items;
    }
    
    output_json($response);
}
if (isset($_POST['getEventName'])) {
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Get the event ID from POST - check both possible parameter names
        $eventId = isset($_POST['eventId']) ? trim($_POST['eventId']) : '';
        
        // If eventId is empty or 'undefined', try to get from getEventName
        if (empty($eventId) || $eventId === 'undefined' || $eventId === 'null') {
            $eventId = isset($_POST['getEventName']) ? trim($_POST['getEventName']) : '';
        }
        
        // If still empty, try to get from the raw POST data
        if (empty($eventId) || $eventId === 'undefined' || $eventId === 'null') {
            // Check if it's a numeric value in the POST array
            foreach ($_POST as $key => $value) {
                if (is_numeric($value) && intval($value) > 0) {
                    $eventId = $value;
                    break;
                }
            }
        }
        
        // Validate the event ID
        if (is_numeric($eventId) && intval($eventId) > 0) {
            $eventId = intval($eventId);
            $query = "SELECT event_list.name FROM event_list WHERE event_list.id = ?";
            $statement = $con->prepare($query);
            $statement->bind_param("i", $eventId);
            $statement->execute();
            $result = $statement->get_result();
            
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $response[] = $row;
                }
            } else {
                $response[] = ['name' => 'Unknown Event'];
            }
            $statement->close();
        } else {
            // Log the invalid event ID for debugging
            error_log("Invalid event ID received: " . print_r($eventId, true));
            $response[] = ['name' => 'Invalid Event ID'];
        }
        
        $con->close();
    } else {
        $response[] = ['name' => 'Database Error'];
    }
    
    // Use proper JSON output
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
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
    
    output_json($response);
}

if (isset($_POST['getDocPerRank'])) {
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventId = (int)$_POST['eventId'];
        $itemId = isset($_POST['categoryId']) ? (int)$_POST['categoryId'] : 0;
        
        $limit = 10;
        $lastId = isset($_POST['lastId']) ? (int)$_POST['lastId'] : 0;
        
        $isNewSystem = ($eventId >= 13);
        
        // SIMPLE query - just get basic document info without scores
        if ($isNewSystem) {
            if ($itemId == 0) {
                $query = "SELECT r.id, r.title, r.author, r.campus, r.center as name
                    FROM researchfile r
                    INNER JOIN endorsement e ON r.endorsementid = e.id
                    WHERE e.status = 'accepted' 
                    AND r.event_id = ?
                    AND r.center IS NOT NULL
                    AND r.center != ''
                    AND r.id > ?
                    ORDER BY r.id ASC
                    LIMIT ?";
                $stmt = $con->prepare($query);
                $stmt->bind_param("iii", $eventId, $lastId, $limit);
            } else {
                $centerQuery = "SELECT CONCAT(name, ' (', code, ')') as display FROM center WHERE id = ?";
                $centerStmt = $con->prepare($centerQuery);
                $centerStmt->bind_param("i", $itemId);
                $centerStmt->execute();
                $centerResult = $centerStmt->get_result();
                $centerRow = $centerResult->fetch_assoc();
                $centerDisplay = $centerRow ? $centerRow['display'] : '';
                
                if (!$centerDisplay) {
                    output_json(['documents' => [], 'pagination' => ['nextLastId' => null, 'hasMore' => false]]);
                }
                
                $query = "SELECT r.id, r.title, r.author, r.campus, r.center as name
                    FROM researchfile r
                    INNER JOIN endorsement e ON r.endorsementid = e.id
                    WHERE e.status = 'accepted' 
                    AND r.event_id = ?
                    AND r.center = ?
                    AND r.id > ?
                    ORDER BY r.id ASC
                    LIMIT ?";
                $stmt = $con->prepare($query);
                $stmt->bind_param("isii", $eventId, $centerDisplay, $lastId, $limit);
            }
        } else {
            if ($itemId == 0) {
                $query = "SELECT r.id, r.title, r.author, r.campus, r.category as name
                    FROM researchfile r
                    INNER JOIN endorsement e ON r.endorsementid = e.id
                    WHERE e.status = 'accepted' 
                    AND r.event_id = ?
                    AND r.category IS NOT NULL
                    AND r.category != ''
                    AND r.id > ?
                    ORDER BY r.id ASC
                    LIMIT ?";
                $stmt = $con->prepare($query);
                $stmt->bind_param("iii", $eventId, $lastId, $limit);
            } else {
                $query = "SELECT r.id, r.title, r.author, r.campus, r.category as name
                    FROM researchfile r
                    INNER JOIN endorsement e ON r.endorsementid = e.id
                    WHERE e.status = 'accepted' 
                    AND r.event_id = ?
                    AND r.category = (SELECT name FROM category WHERE id = ?)
                    AND r.id > ?
                    ORDER BY r.id ASC
                    LIMIT ?";
                $stmt = $con->prepare($query);
                $stmt->bind_param("iiii", $eventId, $itemId, $lastId, $limit);
            }
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $documents = [];
        $lastLoadedId = 0;
        
        while ($row = $result->fetch_assoc()) {
            $lastLoadedId = $row['id'];
            
            // Get scores in a separate, minimal query
            $scoreQuery = "SELECT 
                sb.score,
                c.name as criteria_name,
                c.percentage,
                e.fullname as evaluator_name,
                ROUND(sb.score * (c.percentage / 100), 2) as score_percent
                FROM score_board sb
                INNER JOIN criteria c ON sb.criteria_id = c.id
                INNER JOIN evaluator e ON sb.eval_id = e.id
                WHERE sb.doc_id = ?
                ORDER BY e.id";
                
            $scoreStmt = $con->prepare($scoreQuery);
            $scoreStmt->bind_param("i", $row['id']);
            $scoreStmt->execute();
            $scoreResult = $scoreStmt->get_result();
            
            $criteria = [];
            $totalScore = 0;
            
            while ($scoreRow = $scoreResult->fetch_assoc()) {
                $criteria[] = [
                    'fullname' => $scoreRow['evaluator_name'],
                    'criteria_name' => $scoreRow['criteria_name'],
                    'score' => $scoreRow['score'],
                    'scorePercent' => $scoreRow['score_percent']
                ];
                $totalScore += $scoreRow['score_percent'];
            }
            $scoreStmt->close();
            
            $documents[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'author' => $row['author'],
                'campus' => $row['campus'],
                'name' => $row['name'],
                'total_score' => round($totalScore, 2),
                'criteria' => $criteria
            ];
        }
        $stmt->close();
        
        // Check if more exist
        $checkQuery = "SELECT 1 FROM researchfile r
            INNER JOIN endorsement e ON r.endorsementid = e.id
            WHERE e.status = 'accepted'
            AND r.event_id = ?
            AND r.id > ?
            LIMIT 1";
        $checkStmt = $con->prepare($checkQuery);
        $checkStmt->bind_param("ii", $eventId, $lastLoadedId);
        $checkStmt->execute();
        $hasMore = $checkStmt->get_result()->num_rows > 0;
        $checkStmt->close();
        
        $response['documents'] = $documents;
        $response['pagination'] = [
            'nextLastId' => $lastLoadedId ?: null,
            'hasMore' => $hasMore,
            'returnedCount' => count($documents)
        ];
    }
    
    $con->close();
    output_json($response);
}