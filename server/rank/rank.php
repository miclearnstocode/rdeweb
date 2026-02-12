<?php
require_once(__DIR__ . '/../db.php');

// DISABLE ALL OUTPUT EXCEPT JSON
error_reporting(0);
ini_set('display_errors', 0);
ob_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

/**
 * OPTIMIZED VERSION - Reduces from 34+ queries to just 3-4 queries
 */
if(isset($_POST['getEval'])) {
    $response = [];
    
    if($con = new mysqli($host, $username, $pass, $dbName)) {
        $con->set_charset('utf8mb4');
        
        $eventId = $_POST['eventId'];
        $categoryId = $_POST['categoryId'];
        $isNewSystem = ($eventId >= 13);
        
        try {
            if ($isNewSystem) {
                $response = getEvalByCenter($con, $eventId, $categoryId);
            } else {
                $response = getEvalByCategory($con, $eventId, $categoryId);
            }
        } catch (Exception $e) {
            error_log("getEval Error: " . $e->getMessage());
            $response = [];
        }
        
        $con->close();
    }
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}

/**
 * SUB-FUNCTION: Get evaluations by Center (New System)
 * Executes ONLY 3 database queries total
 */
function getEvalByCenter($con, $eventId, $categoryId) {
    $response = [];
    
    if ($categoryId <= 0) {
        return $response;
    }
    
    // --- QUERY 1: Get center details ---
    $centerQuery = "SELECT name, code FROM center WHERE id = ?";
    $centerStmt = $con->prepare($centerQuery);
    $centerStmt->bind_param("i", $categoryId);
    $centerStmt->execute();
    $centerResult = $centerStmt->get_result();
    
    if (!$centerRow = $centerResult->fetch_assoc()) {
        return $response;
    }
    
    $centerName = $centerRow['name'];
    $centerCode = $centerRow['code'];
    $centerStmt->close();
    
    // --- QUERY 2: Get all evaluators for this center/event ---
    $evalQuery = "SELECT DISTINCT
        e.id,
        e.fullname
    FROM evaluator e
    WHERE e.eventid = ?
    AND (e.center_id = ? OR e.center_id IS NULL OR e.center_id = 0)
    ORDER BY e.fullname";
    
    $evalStmt = $con->prepare($evalQuery);
    $evalStmt->bind_param("ii", $eventId, $categoryId);
    $evalStmt->execute();
    $evaluators = $evalStmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $evalStmt->close();
    
    if (empty($evaluators)) {
        return $response;
    }
    
    // Extract evaluator IDs
    $evaluatorIds = array_column($evaluators, 'id');
    $evaluatorMap = [];
    foreach ($evaluators as $eval) {
        $evaluatorMap[$eval['id']] = $eval;
    }
    
    // --- QUERY 3: Get ALL documents with scores for ALL evaluators in ONE query ---
    $idPlaceholders = implode(',', array_fill(0, count($evaluatorIds), '?'));
    
    $docQuery = "SELECT 
        rf.id as doc_id,
        rf.title,
        rf.author,
        rf.campus,
        rf.category,
        rf.center,
        rf.center as display_name,
        sb.eval_id,
        sb.score,
        c.id as criteria_id,
        c.name as criteria_name,
        c.percentage,
        e.id as endors_id,
        e.campus as endors_campus,
        e.event as endors_event
    FROM researchfile rf
    INNER JOIN score_board sb ON rf.id = sb.doc_id
    INNER JOIN criteria c ON sb.criteria_id = c.id
    INNER JOIN endorsement e ON rf.endorsementid = e.id
    WHERE sb.eval_id IN ($idPlaceholders)
    AND rf.event_id = ?
    AND (rf.center LIKE ? OR rf.center LIKE ?)
    AND e.status = 'accepted'
    ORDER BY sb.eval_id, rf.id, c.id";
    
    $docStmt = $con->prepare($docQuery);
    
    // Prepare parameters
    $centerPattern1 = "%" . $centerName . "%";
    $centerPattern2 = "%" . $centerCode . "%";
    
    $types = str_repeat('i', count($evaluatorIds)) . 'iss';
    $params = array_merge($evaluatorIds, [$eventId, $centerPattern1, $centerPattern2]);
    
    $docStmt->bind_param($types, ...$params);
    $docStmt->execute();
    $docResult = $docStmt->get_result();
    
    // Process results and build response structure
    $docsByEval = [];
    
    while ($row = $docResult->fetch_assoc()) {
        $evalId = $row['eval_id'];
        $docId = $row['doc_id'];
        
        // Initialize evaluator if not exists
        if (!isset($docsByEval[$evalId])) {
            $docsByEval[$evalId] = [];
        }
        
        // Initialize document if not exists
        if (!isset($docsByEval[$evalId][$docId])) {
            $docsByEval[$evalId][$docId] = [
                'file' => [
                    'id' => (int)$docId,
                    'title' => $row['title'],
                    'author' => $row['author'],
                    'campus' => $row['campus'],
                    'category' => $row['category'],
                    'center' => $row['center'],
                    'display_name' => $row['display_name'],
                    'center_code' => $centerCode
                ],
                'TotalScore' => 0,
                'criteria' => []
            ];
        }
        
        // Add criteria
        $docsByEval[$evalId][$docId]['criteria'][] = [
            'criteria_id' => (int)$row['criteria_id'],
            'name' => $row['criteria_name'],
            'percentage' => (int)$row['percentage'],
            'score' => (int)$row['score']
        ];
        
        // Accumulate total score
        $docsByEval[$evalId][$docId]['TotalScore'] += (int)$row['score'];
    }
    
    $docStmt->close();
    
    // Build final response structure
    foreach ($evaluatorMap as $evalId => $evaluator) {
        if (isset($docsByEval[$evalId]) && !empty($docsByEval[$evalId])) {
            $eval = new stdClass();
            $eval->evaluator = [
                'id' => (int)$evalId,
                'fullname' => $evaluator['fullname']
            ];
            $eval->docs = array_values($docsByEval[$evalId]);
            $response[] = $eval;
        }
    }
    
    return $response;
}

/**
 * SUB-FUNCTION: Get evaluations by Category (Old System)
 * Executes ONLY 3 database queries total
 */
function getEvalByCategory($con, $eventId, $categoryId) {
    $response = [];
    
    if ($categoryId <= 0) {
        return $response;
    }
    
    // --- QUERY 1: Get category details ---
    $catQuery = "SELECT name FROM category WHERE id = ?";
    $catStmt = $con->prepare($catQuery);
    $catStmt->bind_param("i", $categoryId);
    $catStmt->execute();
    $catResult = $catStmt->get_result();
    
    if (!$catRow = $catResult->fetch_assoc()) {
        return $response;
    }
    
    $categoryName = $catRow['name'];
    $catStmt->close();
    
    // --- QUERY 2: Get all evaluators for this category/event ---
    $evalQuery = "SELECT DISTINCT
        e.id,
        e.fullname
    FROM evaluator e
    WHERE e.eventid = ?
    AND (e.category = ? OR e.category IS NULL OR e.category = '')
    ORDER BY e.fullname";
    
    $evalStmt = $con->prepare($evalQuery);
    $evalStmt->bind_param("is", $eventId, $categoryName);
    $evalStmt->execute();
    $evaluators = $evalStmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $evalStmt->close();
    
    if (empty($evaluators)) {
        return $response;
    }
    
    // Extract evaluator IDs
    $evaluatorIds = array_column($evaluators, 'id');
    $evaluatorMap = [];
    foreach ($evaluators as $eval) {
        $evaluatorMap[$eval['id']] = $eval;
    }
    
    // --- QUERY 3: Get ALL documents with scores for ALL evaluators in ONE query ---
    $idPlaceholders = implode(',', array_fill(0, count($evaluatorIds), '?'));
    
    $docQuery = "SELECT 
        rf.id as doc_id,
        rf.title,
        rf.author,
        rf.campus,
        rf.category,
        rf.center,
        rf.category as display_name,
        '' as center_code,
        sb.eval_id,
        sb.score,
        c.id as criteria_id,
        c.name as criteria_name,
        c.percentage,
        e.id as endors_id
    FROM researchfile rf
    INNER JOIN score_board sb ON rf.id = sb.doc_id
    INNER JOIN criteria c ON sb.criteria_id = c.id
    INNER JOIN endorsement e ON rf.endorsementid = e.id
    WHERE sb.eval_id IN ($idPlaceholders)
    AND rf.event_id = ?
    AND (rf.category = ? OR rf.category LIKE ?)
    AND e.status = 'accepted'
    ORDER BY sb.eval_id, rf.id, c.id";
    
    $docStmt = $con->prepare($docQuery);
    
    // Prepare parameters
    $categoryPattern = "%" . $categoryName . "%";
    
    $types = str_repeat('i', count($evaluatorIds)) . 'iss';
    $params = array_merge($evaluatorIds, [$eventId, $categoryName, $categoryPattern]);
    
    $docStmt->bind_param($types, ...$params);
    $docStmt->execute();
    $docResult = $docStmt->get_result();
    
    // Process results and build response structure
    $docsByEval = [];
    
    while ($row = $docResult->fetch_assoc()) {
        $evalId = $row['eval_id'];
        $docId = $row['doc_id'];
        
        // Initialize evaluator if not exists
        if (!isset($docsByEval[$evalId])) {
            $docsByEval[$evalId] = [];
        }
        
        // Initialize document if not exists
        if (!isset($docsByEval[$evalId][$docId])) {
            $docsByEval[$evalId][$docId] = [
                'file' => [
                    'id' => (int)$docId,
                    'title' => $row['title'],
                    'author' => $row['author'],
                    'campus' => $row['campus'],
                    'category' => $row['category'],
                    'center' => $row['center'],
                    'display_name' => $row['display_name'],
                    'center_code' => ''
                ],
                'TotalScore' => 0,
                'criteria' => []
            ];
        }
        
        // Add criteria
        $docsByEval[$evalId][$docId]['criteria'][] = [
            'criteria_id' => (int)$row['criteria_id'],
            'name' => $row['criteria_name'],
            'percentage' => (int)$row['percentage'],
            'score' => (int)$row['score']
        ];
        
        // Accumulate total score
        $docsByEval[$evalId][$docId]['TotalScore'] += (int)$row['score'];
    }
    
    $docStmt->close();
    
    // Build final response structure
    foreach ($evaluatorMap as $evalId => $evaluator) {
        if (isset($docsByEval[$evalId]) && !empty($docsByEval[$evalId])) {
            $eval = new stdClass();
            $eval->evaluator = [
                'id' => (int)$evalId,
                'fullname' => $evaluator['fullname']
            ];
            $eval->docs = array_values($docsByEval[$evalId]);
            $response[] = $eval;
        }
    }
    
    return $response;
}

/**
 * EXTRA UTILITY: Get summary statistics without loading all data
 */
function getEvalSummary($con, $eventId, $categoryId, $isNewSystem) {
    $summary = [
        'total_evaluators' => 0,
        'total_documents' => 0,
        'total_scores' => 0,
        'average_score' => 0
    ];
    
    if ($isNewSystem) {
        $query = "SELECT 
            COUNT(DISTINCT sb.eval_id) as eval_count,
            COUNT(DISTINCT sb.doc_id) as doc_count,
            COUNT(sb.id) as score_count,
            AVG(sb.score) as avg_score
        FROM score_board sb
        INNER JOIN researchfile rf ON sb.doc_id = rf.id
        INNER JOIN endorsement e ON rf.endorsementid = e.id
        INNER JOIN evaluator ev ON sb.eval_id = ev.id
        WHERE rf.event_id = ?
        AND ev.center_id = ?
        AND e.status = 'accepted'";
        
        $stmt = $con->prepare($query);
        $stmt->bind_param("ii", $eventId, $categoryId);
    } else {
        $query = "SELECT 
            COUNT(DISTINCT sb.eval_id) as eval_count,
            COUNT(DISTINCT sb.doc_id) as doc_count,
            COUNT(sb.id) as score_count,
            AVG(sb.score) as avg_score
        FROM score_board sb
        INNER JOIN researchfile rf ON sb.doc_id = rf.id
        INNER JOIN endorsement e ON rf.endorsementid = e.id
        INNER JOIN evaluator ev ON sb.eval_id = ev.id
        WHERE rf.event_id = ?
        AND ev.category = ?
        AND e.status = 'accepted'";
        
        $catQuery = "SELECT name FROM category WHERE id = ?";
        $catStmt = $con->prepare($catQuery);
        $catStmt->bind_param("i", $categoryId);
        $catStmt->execute();
        $catResult = $catStmt->get_result();
        $catRow = $catResult->fetch_assoc();
        $categoryName = $catRow['name'] ?? '';
        $catStmt->close();
        
        $stmt = $con->prepare($query);
        $stmt->bind_param("is", $eventId, $categoryName);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $summary['total_evaluators'] = (int)$row['eval_count'];
        $summary['total_documents'] = (int)$row['doc_count'];
        $summary['total_scores'] = (int)$row['score_count'];
        $summary['average_score'] = round((float)$row['avg_score'], 2);
    }
    
    $stmt->close();
    
    return $summary;
}