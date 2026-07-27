<?php
require_once(__DIR__ . '/../db.php');

// DISABLE ALL OUTPUT EXCEPT JSON
error_reporting(0);
ini_set('display_errors', 0);

// Start output buffering to catch any unexpected output
ob_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

if(isset($_POST['getEval'])) {
    $response = [];
    
    // Check database connection
    $con = new mysqli($host, $username, $pass, $dbName);
    
    // Check connection
    if ($con->connect_error) {
        ob_clean();
        echo json_encode(['error' => 'Database connection failed: ' . $con->connect_error]);
        ob_end_flush();
        exit();
    }
    
    $con->set_charset("utf8mb4");
    
    $eventId = (int)$_POST['eventId'];
    $categoryId = (int)$_POST['categoryId'];
    
    // If no category/center selected, return empty array
    if ($categoryId <= 0) {
        ob_clean();
        echo json_encode([]);
        ob_end_flush();
        exit();
    }
    
    try {
        // STEP 1: Get the category name from the ID
        $categoryName = '';
        
        // First try category table (old system)
        $catStmt = $con->prepare("SELECT name FROM category WHERE id = ?");
        if (!$catStmt) {
            throw new Exception('Prepare failed: ' . $con->error);
        }
        $catStmt->bind_param("i", $categoryId);
        $catStmt->execute();
        $catResult = $catStmt->get_result();
        
        if ($catRow = $catResult->fetch_assoc()) {
            $categoryName = $catRow['name'];
        }
        $catStmt->close();
        
        // If not found in category, try center table (new system)
        if (empty($categoryName)) {
            $centerStmt = $con->prepare("SELECT name FROM center WHERE id = ?");
            if (!$centerStmt) {
                throw new Exception('Prepare failed: ' . $con->error);
            }
            $centerStmt->bind_param("i", $categoryId);
            $centerStmt->execute();
            $centerResult = $centerStmt->get_result();
            
            if ($centerRow = $centerResult->fetch_assoc()) {
                $categoryName = $centerRow['name'];
            }
            $centerStmt->close();
        }
        
        // If no category/center found, return empty
        if (empty($categoryName)) {
            error_log("No category found for ID: " . $categoryId);
            ob_clean();
            echo json_encode([]);
            ob_end_flush();
            exit();
        }
        
        error_log("=== getEval Request ===");
        error_log("Event ID: " . $eventId);
        error_log("Category ID: " . $categoryId);
        error_log("Category Name from DB: '" . $categoryName . "'");
        
        // STEP 2: First, let's check what documents exist for this event and category
        $checkQuery = "SELECT rf.id, rf.title, rf.category, rf.event_id, e.status 
                       FROM researchfile rf 
                       INNER JOIN endorsement e ON rf.endorsementid = e.id 
                       WHERE rf.event_id = ? AND rf.category = ? AND e.status = 'accepted'";
        $checkStmt = $con->prepare($checkQuery);
        if (!$checkStmt) {
            throw new Exception('Prepare failed: ' . $con->error);
        }
        $checkStmt->bind_param("is", $eventId, $categoryName);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        $docIds = [];
        while ($row = $checkResult->fetch_assoc()) {
            $docIds[] = $row['id'];
            error_log("Found document: ID=" . $row['id'] . ", Title=" . $row['title'] . ", Category=" . $row['category']);
        }
        $checkStmt->close();
        
        if (empty($docIds)) {
            error_log("No documents found for event " . $eventId . " and category '" . $categoryName . "'");
            ob_clean();
            echo json_encode([]);
            ob_end_flush();
            exit();
        }
        
        // STEP 3: Get evaluators who have scored these documents
        $docIdsPlaceholder = implode(',', array_fill(0, count($docIds), '?'));
        
        $evalQuery = "SELECT DISTINCT sb.eval_id, e.fullname 
                      FROM score_board sb 
                      INNER JOIN evaluator e ON sb.eval_id = e.id 
                      WHERE sb.doc_id IN ($docIdsPlaceholder) 
                      AND sb.score > 0
                      ORDER BY e.fullname";
        
        $evalStmt = $con->prepare($evalQuery);
        if (!$evalStmt) {
            throw new Exception('Prepare failed: ' . $con->error);
        }
        
        $types = str_repeat('i', count($docIds));
        $evalStmt->bind_param($types, ...$docIds);
        $evalStmt->execute();
        $evalResult = $evalStmt->get_result();
        
        $evaluators = [];
        while ($row = $evalResult->fetch_assoc()) {
            $evaluators[$row['eval_id']] = [
                'id' => $row['eval_id'],
                'fullname' => $row['fullname']
            ];
            error_log("Found evaluator: ID=" . $row['eval_id'] . ", Name=" . $row['fullname']);
        }
        $evalStmt->close();
        
        if (empty($evaluators)) {
            error_log("No evaluators found with scores for these documents");
            ob_clean();
            echo json_encode([]);
            ob_end_flush();
            exit();
        }
        
        $evaluatorIds = array_keys($evaluators);
        
        // STEP 4: Get all scores for these documents and evaluators
        $evalIdPlaceholder = implode(',', array_fill(0, count($evaluatorIds), '?'));
        $docIdPlaceholder = implode(',', array_fill(0, count($docIds), '?'));
        
        $scoreQuery = "SELECT 
            rf.id as doc_id,  
            rf.title,
            rf.author,
            rf.campus,
            rf.category,
            rf.center,
            rf.event_id,
            sb.eval_id,
            COALESCE(sb.score, 0) as score,
            c.id as criteria_id,
            c.name as criteria_name,
            c.percentage
        FROM score_board sb
        INNER JOIN researchfile rf ON rf.id = sb.doc_id
        LEFT JOIN criteria c ON sb.criteria_id = c.id
        WHERE sb.doc_id IN ($docIdPlaceholder)
        AND sb.eval_id IN ($evalIdPlaceholder)
        AND sb.score > 0
        ORDER BY sb.eval_id, rf.id, c.id";
        
        $scoreStmt = $con->prepare($scoreQuery);
        if (!$scoreStmt) {
            throw new Exception('Prepare failed: ' . $con->error);
        }
        
        $types = str_repeat('i', count($docIds)) . str_repeat('i', count($evaluatorIds));
        $params = array_merge($docIds, $evaluatorIds);
        $scoreStmt->bind_param($types, ...$params);
        $scoreStmt->execute();
        $scoreResult = $scoreStmt->get_result();
        
        error_log("Score query returned " . $scoreResult->num_rows . " rows");
        
        // Process results and build response structure
        $docsByEval = [];
        
        while ($row = $scoreResult->fetch_assoc()) {
            $evalId = $row['eval_id'];
            $docId = (int)$row['doc_id'];
            
            // Skip if document has no criteria scores
            if ($row['criteria_id'] === null) {
                continue;
            }
            
            // Initialize evaluator if not exists
            if (!isset($docsByEval[$evalId])) {
                $docsByEval[$evalId] = [];
            }
            
            // Initialize document if not exists
            if (!isset($docsByEval[$evalId][$docId])) {
                $docsByEval[$evalId][$docId] = [
                    'file' => [
                        'id' => $docId,
                        'title' => $row['title'] ?? 'Untitled',
                        'author' => $row['author'] ?? '',
                        'campus' => $row['campus'] ?? '',
                        'category' => $row['category'] ?? '',
                        'center' => $row['center'] ?? '',
                        'event_id' => (int)$row['event_id']
                    ],
                    'TotalScore' => 0,
                    'criteria' => []
                ];
            }
            
            // Add criteria
            $docsByEval[$evalId][$docId]['criteria'][] = [
                'criteria_id' => (int)$row['criteria_id'],
                'name' => $row['criteria_name'] ?? 'Unknown',
                'percentage' => (int)$row['percentage'],
                'score' => (int)$row['score']
            ];
            
            // Accumulate total score
            $docsByEval[$evalId][$docId]['TotalScore'] += (int)$row['score'];
        }
        
        $scoreStmt->close();
        
        // Build final response
        foreach ($evaluators as $evalId => $evaluator) {
            if (isset($docsByEval[$evalId]) && !empty($docsByEval[$evalId])) {
                $eval = new stdClass();
                $eval->evaluator = [
                    'id' => (int)$evalId,
                    'fullname' => $evaluator['fullname']
                ];
                $eval->docs = array_values($docsByEval[$evalId]);
                $response[] = $eval;
                
                error_log("Evaluator " . $evaluator['fullname'] . " has " . count($eval->docs) . " documents");
            }
        }
        
        error_log("Total evaluators with documents: " . count($response));
        
    } catch (Exception $e) {
        error_log("getEval Error: " . $e->getMessage());
        error_log("Error on line: " . $e->getLine());
        ob_clean();
        echo json_encode([]);
        ob_end_flush();
        exit();
    }
    
    $con->close();
    
    ob_clean();
    echo json_encode($response, JSON_NUMERIC_CHECK);
    ob_end_flush();
    exit();
}

// GENERATE SUMMARY REPORT - EXACT EXCEL FORMAT
if(isset($_POST['generateSummaryReport'])) {
    $response = ['success' => false, 'data' => null, 'error' => ''];
    
    if($con = new mysqli($host, $username, $pass, $dbName)) {
        $con->set_charset('utf8mb4');
        
        $eventId = (int)$_POST['eventId'];
        $categoryId = isset($_POST['categoryId']) ? (int)$_POST['categoryId'] : 0;
        $isNewSystem = ($eventId >= 13);
        
        try {
            // STEP 1: GET EVENT DETAILS
            $eventName = getEventName($con, $eventId);
            $eventTitle = $eventName;
            
            // STEP 2: GET CATEGORY/CENTER NAME
            $categoryName = 'All Categories';
            $systemType = $isNewSystem ? 'Center' : 'Category';
            $centerCode = '';
            $categoryDatabaseId = 0;
            
            if ($categoryId > 0) {
                if ($isNewSystem) {
                    $centerQuery = "SELECT name, code, id FROM center WHERE id = ?";
                    $centerStmt = $con->prepare($centerQuery);
                    $centerStmt->bind_param("i", $categoryId);
                    $centerStmt->execute();
                    $centerResult = $centerStmt->get_result();
                    if ($centerRow = $centerResult->fetch_assoc()) {
                        $categoryName = $centerRow['name'];
                        $centerCode = $centerRow['code'] ?? '';
                        $categoryDatabaseId = $centerRow['id'];
                    }
                    $centerStmt->close();
                } else {
                    $catQuery = "SELECT name, id FROM category WHERE id = ?";
                    $catStmt = $con->prepare($catQuery);
                    $catStmt->bind_param("i", $categoryId);
                    $catStmt->execute();
                    $catResult = $catStmt->get_result();
                    if ($catRow = $catResult->fetch_assoc()) {
                        $categoryName = $catRow['name'];
                        $categoryDatabaseId = $catRow['id'];
                    }
                    $catStmt->close();
                }
            }
            
            // STEP 3: GET CRITERIA FOR THIS EVENT AND CATEGORY
            $criteriaList = [];
            $qualityPresentationCriteriaId = null;

            $criteriaQuery = "SELECT DISTINCT c.id, c.name, c.percentage 
                            FROM criteria c
                            WHERE c.event_id = ?";
            
            $params = [$eventId];
            $types = "i";
            
            // Filter by category/center if specified
            if ($categoryId > 0) {
                if ($isNewSystem) {
                    $criteriaQuery .= " AND c.center_id = ?";
                    $params[] = $categoryDatabaseId;
                    $types .= "i";
                } else {
                    $criteriaQuery .= " AND c.category_id = ?";
                    $params[] = $categoryDatabaseId;
                    $types .= "i";
                }
            }
            
            $criteriaQuery .= " ORDER BY c.id ASC";
            
            $criteriaStmt = $con->prepare($criteriaQuery);
            if (!$criteriaStmt) {
                throw new Exception('Prepare failed: ' . $con->error);
            }
            $criteriaStmt->bind_param($types, ...$params);
            $criteriaStmt->execute();
            $criteriaResult = $criteriaStmt->get_result();

            while ($criterion = $criteriaResult->fetch_assoc()) {
                $criteriaList[] = [
                    'id' => (int)$criterion['id'],
                    'name' => $criterion['name'],
                    'percentage' => (int)$criterion['percentage']
                ];
                
                if (stripos($criterion['name'], 'Quality of Presentation') !== false) {
                    $qualityPresentationCriteriaId = (int)$criterion['id'];
                }
            }
            $criteriaStmt->close();

            error_log("Criteria for Event $eventId, Category $categoryId: " . count($criteriaList) . " criteria found");
            
            // If no criteria found, return error
            if (empty($criteriaList)) {
                throw new Exception('No criteria found for this event and category/center');
            }
            
            // STEP 4: GET ACCEPTED DOCUMENTS FOR THIS EVENT (FILTER BY CATEGORY IF SPECIFIED)
            $docQuery = "SELECT 
                rf.id,  
                rf.title,
                rf.author,
                rf.campus,
                rf.category,
                rf.center
            FROM researchfile rf
            INNER JOIN endorsement e ON rf.endorsementid = e.id
            WHERE rf.event_id = ?
            AND e.status = 'accepted'";
            
            $params = [$eventId];
            $types = "i";
            
            if ($categoryId > 0) {
                if ($isNewSystem) {
                    $docQuery .= " AND rf.center = ?";
                    $params[] = $categoryName;
                    $types .= "s";
                } else {
                    $docQuery .= " AND rf.category = ?";
                    $params[] = $categoryName;
                    $types .= "s";
                }
            }
            
            $docQuery .= " ORDER BY rf.title";
            
            $docStmt = $con->prepare($docQuery);
            if (!$docStmt) {
                throw new Exception('Prepare failed: ' . $con->error);
            }
            $docStmt->bind_param($types, ...$params);
            $docStmt->execute();
            $docResult = $docStmt->get_result();
            
            $allDocuments = [];
            while ($row = $docResult->fetch_assoc()) {
                $allDocuments[$row['id']] = [
                    'id' => $row['id'],
                    'title' => $row['title'] ?? 'Untitled',
                    'author' => $row['author'] ?? '',
                    'campus' => $row['campus'] ?? '',
                    'category' => $row['category'] ?? '',
                    'center' => $row['center'] ?? ''
                ];
            }
            $docStmt->close();
            
            if (empty($allDocuments)) {
                throw new Exception('No documents found for this event' . ($categoryId > 0 ? ' and category/center' : ''));
            }
            
            $docIds = array_keys($allDocuments);
            $docIdPlaceholder = implode(',', array_fill(0, count($docIds), '?'));
            
            // STEP 5: GET EVALUATORS WHO HAVE SCORED THESE DOCUMENTS
            $evalQuery = "SELECT DISTINCT sb.eval_id, e.fullname 
                          FROM score_board sb 
                          INNER JOIN evaluator e ON sb.eval_id = e.id 
                          WHERE sb.doc_id IN ($docIdPlaceholder) 
                          AND sb.score > 0
                          ORDER BY e.fullname";
            
            $evalStmt = $con->prepare($evalQuery);
            if (!$evalStmt) {
                throw new Exception('Prepare failed: ' . $con->error);
            }
            $types = str_repeat('i', count($docIds));
            $evalStmt->bind_param($types, ...$docIds);
            $evalStmt->execute();
            $evalResult = $evalStmt->get_result();
            
            $evaluators = [];
            while ($row = $evalResult->fetch_assoc()) {
                $evaluators[$row['eval_id']] = [
                    'id' => $row['eval_id'],
                    'fullname' => $row['fullname']
                ];
            }
            $evalStmt->close();
            
            if (empty($evaluators)) {
                throw new Exception('No evaluators found with scores');
            }
            
            $evaluatorIds = array_keys($evaluators);
            $evalIdPlaceholder = implode(',', array_fill(0, count($evaluatorIds), '?'));
            
            // STEP 6: GET ALL SCORES - FILTER BY THE CRITERIA IDs WE FOUND
            $criteriaIds = array_column($criteriaList, 'id');
            $criteriaIdPlaceholder = implode(',', array_fill(0, count($criteriaIds), '?'));
            
            $scoreQuery = "SELECT 
                rf.id as doc_id,  
                rf.title,
                rf.author,
                rf.campus,
                rf.category,
                rf.center,
                sb.eval_id,
                sb.score,
                sb.criteria_id,
                c.name as criteria_name,
                c.percentage
            FROM score_board sb
            INNER JOIN researchfile rf ON rf.id = sb.doc_id
            LEFT JOIN criteria c ON sb.criteria_id = c.id
            WHERE sb.doc_id IN ($docIdPlaceholder)
            AND sb.eval_id IN ($evalIdPlaceholder)
            AND sb.criteria_id IN ($criteriaIdPlaceholder)
            AND sb.score > 0
            ORDER BY sb.eval_id, rf.id, sb.criteria_id";
            
            $scoreStmt = $con->prepare($scoreQuery);
            if (!$scoreStmt) {
                throw new Exception('Prepare failed: ' . $con->error);
            }
            
            $types = str_repeat('i', count($docIds)) . str_repeat('i', count($evaluatorIds)) . str_repeat('i', count($criteriaIds));
            $params = array_merge($docIds, $evaluatorIds, $criteriaIds);
            $scoreStmt->bind_param($types, ...$params);
            $scoreStmt->execute();
            $scoreResult = $scoreStmt->get_result();
            
            // Process scores by evaluator and document
            $docsByEval = [];
            while ($row = $scoreResult->fetch_assoc()) {
                $evalId = $row['eval_id'];
                $docId = (int)$row['doc_id'];
                $criteriaId = (int)$row['criteria_id'];
                $score = (int)$row['score'];
                
                // Initialize evaluator if not exists
                if (!isset($docsByEval[$evalId])) {
                    $docsByEval[$evalId] = [];
                }
                
                // Initialize document if not exists
                if (!isset($docsByEval[$evalId][$docId])) {
                    $docsByEval[$evalId][$docId] = [
                        'file' => [
                            'id' => $docId,
                            'title' => $row['title'] ?? 'Untitled',
                            'author' => $row['author'] ?? '',
                            'campus' => $row['campus'] ?? '',
                            'category' => $row['category'] ?? '',
                            'center' => $row['center'] ?? ''
                        ],
                        'TotalScore' => 0,
                        'criteria' => []
                    ];
                }
                
                // Add criteria score
                $docsByEval[$evalId][$docId]['criteria'][] = [
                    'criteria_id' => $criteriaId,
                    'name' => $row['criteria_name'] ?? 'Unknown',
                    'percentage' => (int)$row['percentage'],
                    'score' => $score
                ];
                
                // Accumulate total score
                $docsByEval[$evalId][$docId]['TotalScore'] += $score;
            }
            $scoreStmt->close();
            
            // STEP 7: BUILD EVALUATOR DATA
            $evaluatorData = [];
            foreach ($evaluators as $evalId => $evaluator) {
                if (isset($docsByEval[$evalId]) && !empty($docsByEval[$evalId])) {
                    $eval = new stdClass();
                    $eval->evaluator = [
                        'id' => (int)$evalId,
                        'fullname' => $evaluator['fullname']
                    ];
                    $eval->docs = array_values($docsByEval[$evalId]);
                    $evaluatorData[] = $eval;
                }
            }
            
            // STEP 8: BUILD EXCEL-FORMAT REPORT STRUCTURE
            $summaryReport = [
                'event' => [
                    'name' => $eventTitle,
                    'title' => $eventTitle
                ],
                'category' => [
                    'name' => $categoryName,
                    'type' => $systemType,
                    'code' => $centerCode
                ],
                'criteria' => $criteriaList,
                'evaluators' => [],
                'quality_presentation_totals' => [],
                'rankings' => []
            ];
            
            // Sort documents by title for consistent column order
            uasort($allDocuments, function($a, $b) {
                return strcmp($a['title'], $b['title']);
            });
            
            $documentIds = array_keys($allDocuments);
            $documentColumns = [];
            
            foreach ($documentIds as $index => $docId) {
                $documentColumns[$docId] = $index + 1;
            }
            
            // STEP 9: PROCESS EACH EVALUATOR
            foreach ($evaluatorData as $evalIndex => $evalItem) {
                $evaluator = $evalItem->evaluator ?? $evalItem['evaluator'];
                $docs = $evalItem->docs ?? $evalItem['docs'];
                
                $evaluatorSheet = [
                    'evaluator' => [
                        'number' => $evalIndex + 1,
                        'name' => $evaluator['fullname'] ?? $evaluator->fullname,
                        'id' => $evaluator['id'] ?? $evaluator->id
                    ],
                    'headers' => [
                        'criteria_row' => ['CRITERIA'],
                        'title_row' => ['TITLE']
                    ],
                    'criteria_rows' => [],
                    'total_row' => ['Total'],
                    'documents' => []
                ];
                
                // Initialize scores by document for quick lookup
                $scoresByDoc = [];

                // Add ALL documents from master list with default scores
                foreach ($documentIds as $docId) {
                    $columnNumber = $documentColumns[$docId];
                    $docTitle = $allDocuments[$docId]['title'];
                    
                    $evaluatorSheet['headers']['criteria_row'][] = $columnNumber;
                    $evaluatorSheet['headers']['title_row'][] = $docTitle;
                    
                    $evaluatorSheet['documents'][$docId] = [
                        'column' => $columnNumber,
                        'id' => $docId,
                        'title' => $docTitle,
                        'total_score' => 0
                    ];
                    
                    // Initialize scores for each criteria for this document
                    foreach ($criteriaList as $criterion) {
                        $criteriaId = (int)$criterion['id'];
                        if (!isset($scoresByDoc[$docId])) {
                            $scoresByDoc[$docId] = [];
                        }
                        $scoresByDoc[$docId][$criteriaId] = 0;
                    }
                }
                
                // Populate scores for documents this evaluator actually scored
                foreach ($docs as $doc) {
                    $docData = $doc->file ?? $doc['file'];
                    $docId = $docData['id'];
                    
                    if (!isset($documentColumns[$docId])) {
                        continue;
                    }
                    
                    $columnNumber = $documentColumns[$docId];
                    $totalScore = $doc->TotalScore ?? $doc['TotalScore'];
                    
                    $evaluatorSheet['documents'][$docId] = [
                        'column' => $columnNumber,
                        'id' => $docId,
                        'title' => $docData['title'],
                        'total_score' => $totalScore
                    ];
                    
                    // Get criteria scores for this document
                    $docScores = $doc->criteria ?? $doc['criteria'];
                    
                    // Store each criteria score
                    foreach ($docScores as $scoreItem) {
                        $criteriaId = (int)$scoreItem['criteria_id'];
                        $score = (int)$scoreItem['score'];
                        
                        // Store in scoresByDoc for easy lookup
                        if (!isset($scoresByDoc[$docId])) {
                            $scoresByDoc[$docId] = [];
                        }
                        $scoresByDoc[$docId][$criteriaId] = $score;
                    }
                }
                
                // REBUILD TOTAL ROW with actual scores
                $evaluatorSheet['total_row'] = ['Total'];
                foreach ($documentIds as $docId) {
                    $totalScore = $evaluatorSheet['documents'][$docId]['total_score'] ?? 0;
                    $evaluatorSheet['total_row'][] = $totalScore;
                }
                
                // BUILD CRITERIA ROWS
                $evaluatorSheet['criteria_rows'] = [];
                $addedCriteriaNames = [];

                foreach ($criteriaList as $criterion) {
                    $criteriaId = (int)$criterion['id'];
                    $criteriaName = $criterion['name'];
                    
                    $row = [
                        'name' => $criteriaName,
                        'percentage' => (int)$criterion['percentage'],
                        'scores' => []
                    ];
                    
                    // Get scores for each document for this criteria
                    foreach ($documentIds as $docId) {
                        $column = $documentColumns[$docId];
                        // Get score from scoresByDoc
                        $score = isset($scoresByDoc[$docId][$criteriaId]) ? $scoresByDoc[$docId][$criteriaId] : 0;
                        $row['scores'][$column] = $score;
                    }
                    
                    $evaluatorSheet['criteria_rows'][] = $row;
                }
                
                // CALCULATE RANK ROW
                $rankRow = ['Rank'];
                $scoresForRanking = [];

                foreach ($documentIds as $docId) {
                    $column = $documentColumns[$docId];
                    $totalScore = $evaluatorSheet['documents'][$docId]['total_score'] ?? 0;
                    $scoresForRanking[] = [
                        'column' => $column,
                        'score' => $totalScore,
                        'doc_id' => $docId
                    ];
                }

                usort($scoresForRanking, function($a, $b) {
                    return $b['score'] - $a['score'];
                });

                $rankedScores = [];
                $currentRank = 1;
                $currentIndex = 0;
                $count = count($scoresForRanking);

                while ($currentIndex < $count) {
                    $currentScore = $scoresForRanking[$currentIndex]['score'];
                    $tieCount = 1;
                    
                    for ($j = $currentIndex + 1; $j < $count; $j++) {
                        if ($scoresForRanking[$j]['score'] == $currentScore) {
                            $tieCount++;
                        } else {
                            break;
                        }
                    }
                    
                    for ($k = 0; $k < $tieCount; $k++) {
                        $item = $scoresForRanking[$currentIndex + $k];
                        $rankedScores[$item['column']] = $currentRank;
                    }
                    
                    $currentIndex += $tieCount;
                    $currentRank++;
                }

                foreach ($documentIds as $docId) {
                    $column = $documentColumns[$docId];
                    $rankValue = $rankedScores[$column] ?? '';
                    $rankRow[] = $rankValue;
                }

                $evaluatorSheet['rank_row'] = $rankRow;
                $summaryReport['evaluators'][] = $evaluatorSheet;
            }
            
            // STEP 10: CALCULATE CRITERIA RANKINGS
            $criteriaRankings = [];

            if (!empty($criteriaList) && !empty($documentIds)) {
                foreach ($criteriaList as $criterion) {
                    $criteriaId = (int)$criterion['id'];
                    $criteriaName = $criterion['name'];
                    
                    $criterionScores = [];
                    
                    foreach ($documentIds as $docId) {
                        $totalScore = 0;
                        
                        foreach ($evaluatorData as $evalItem) {
                            $docs = $evalItem->docs ?? $evalItem['docs'];
                            foreach ($docs as $doc) {
                                if (($doc->file['id'] ?? $doc['file']['id']) == $docId) {
                                    $docScores = $doc->criteria ?? $doc['criteria'];
                                    foreach ($docScores as $scoreItem) {
                                        if ((int)$scoreItem['criteria_id'] == $criteriaId) {
                                            $totalScore += (int)$scoreItem['score'];
                                        }
                                    }
                                }
                            }
                        }
                        
                        $criterionScores[] = [
                            'doc_id' => $docId,
                            'title' => $allDocuments[$docId]['title'],
                            'total_score' => $totalScore,
                            'column' => $documentColumns[$docId]
                        ];
                    }
                    
                    usort($criterionScores, function($a, $b) {
                        return $b['total_score'] - $a['total_score'];
                    });
                    
                    $rankedScores = [];
                    $currentIndex = 0;
                    $count = count($criterionScores);
                    
                    while ($currentIndex < $count) {
                        $currentScore = $criterionScores[$currentIndex]['total_score'];
                        $tieCount = 1;
                        
                        for ($j = $currentIndex + 1; $j < $count; $j++) {
                            if ($criterionScores[$j]['total_score'] == $currentScore) {
                                $tieCount++;
                            } else {
                                break;
                            }
                        }
                        
                        $rank = $currentIndex + 1;
                        
                        for ($k = 0; $k < $tieCount; $k++) {
                            $item = $criterionScores[$currentIndex + $k];
                            $rankedScores[] = [
                                'rank' => $rank,
                                'doc_id' => $item['doc_id'],
                                'title' => $item['title'],
                                'total_score' => $item['total_score'],
                                'column' => $item['column']
                            ];
                        }
                        
                        $currentIndex += $tieCount;
                    }
                    
                    $criteriaRankings[$criteriaId] = [
                        'id' => $criteriaId,
                        'name' => $criteriaName,
                        'rankings' => $rankedScores
                    ];
                }
            }

            $summaryReport['criteria_rankings'] = $criteriaRankings;
            
            $response['success'] = true;
            $response['data'] = $summaryReport;
            
        } catch (Exception $e) {
            error_log("generateSummaryReport Error: " . $e->getMessage());
            error_log("Error on line: " . $e->getLine());
            $response['error'] = $e->getMessage() . ' on line ' . $e->getLine();
        }
        
        $con->close();
    }
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}

function getEventName($con, $eventId) {
    $query = "SELECT name FROM event_list WHERE id = ?";
    $stmt = $con->prepare($query);
    $stmt->bind_param("i", $eventId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();
    
    if ($row && isset($row['name'])) {
        return $row['name'];
    }
    
    return 'RDE Symposium';
}

function getEvalByCenter($con, $eventId, $categoryId) {
    $response = [];
    
    if ($categoryId <= 0) {
        return $response;
    }
    
    // Get center details
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
    
    // Get all evaluators for this center/event
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
    
    $evaluatorIds = array_column($evaluators, 'id');
    $evaluatorMap = [];
    foreach ($evaluators as $eval) {
        $evaluatorMap[$eval['id']] = $eval;
    }
    
    // Get ALL documents with scores
    $idPlaceholders = implode(',', array_fill(0, count($evaluatorIds), '?'));
    
    $docQuery = "SELECT 
        rf.id,  
        rf.title,
        rf.author,
        rf.campus,
        rf.category,
        rf.center,
        sb.eval_id,
        COALESCE(sb.score, 0) as score,
        c.id as criteria_id,
        c.name as criteria_name,
        c.percentage
    FROM researchfile rf
    LEFT JOIN score_board sb ON rf.id = sb.doc_id  
    LEFT JOIN criteria c ON sb.criteria_id = c.id
    INNER JOIN endorsement e ON rf.endorsementid = e.id
    WHERE sb.eval_id IN ($idPlaceholders)
    AND rf.event_id = ?
    AND (rf.center = ? OR rf.center LIKE ? OR rf.center LIKE ?)
    AND e.status = 'accepted'
    ORDER BY sb.eval_id, rf.id, c.id";
    
    $docStmt = $con->prepare($docQuery);
    
    $centerPattern1 = "%" . $centerName . "%";
    $centerPattern2 = "%" . $centerCode . "%";
    
    $types = str_repeat('i', count($evaluatorIds)) . 'isss';
    $params = array_merge($evaluatorIds, [$eventId, $centerName, $centerPattern1, $centerPattern2]);
    
    $docStmt->bind_param($types, ...$params);
    $docStmt->execute();
    $docResult = $docStmt->get_result();
    
    $docsByEval = [];
    
    while ($row = $docResult->fetch_assoc()) {
        $evalId = $row['eval_id'];
        $docId = (int)$row['id'];
        
        if ($row['criteria_id'] === null) {
            continue;
        }
        
        if (!isset($docsByEval[$evalId])) {
            $docsByEval[$evalId] = [];
        }
        
        if (!isset($docsByEval[$evalId][$docId])) {
            $docsByEval[$evalId][$docId] = [
                'file' => [
                    'id' => $docId,
                    'title' => $row['title'] ?? 'Untitled',
                    'author' => $row['author'] ?? '',
                    'campus' => $row['campus'] ?? '',
                    'category' => $row['category'] ?? '',
                    'center' => $row['center'] ?? ''
                ],
                'TotalScore' => 0,
                'criteria' => []
            ];
        }
        
        $docsByEval[$evalId][$docId]['criteria'][] = [
            'criteria_id' => (int)$row['criteria_id'],
            'name' => $row['criteria_name'] ?? 'Unknown',
            'percentage' => (int)$row['percentage'],
            'score' => (int)$row['score']
        ];
        
        $docsByEval[$evalId][$docId]['TotalScore'] += (int)$row['score'];
    }
    
    $docStmt->close();
    
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

function getEvalByCategory($con, $eventId, $categoryId) {
    $response = [];
    
    if ($categoryId <= 0) {
        return $response;
    }
    
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
    
    $evalQuery = "SELECT DISTINCT
        e.id,
        e.fullname
    FROM evaluator e
    WHERE e.eventid = ?
    ORDER BY e.fullname";
    
    $evalStmt = $con->prepare($evalQuery);
    $evalStmt->bind_param("i", $eventId);
    $evalStmt->execute();
    $evaluators = $evalStmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $evalStmt->close();
    
    if (empty($evaluators)) {
        return $response;
    }
    
    $evaluatorIds = array_column($evaluators, 'id');
    $evaluatorMap = [];
    foreach ($evaluators as $eval) {
        $evaluatorMap[$eval['id']] = $eval;
    }
    
    $idPlaceholders = implode(',', array_fill(0, count($evaluatorIds), '?'));
    
    $docQuery = "SELECT 
        rf.id,  
        rf.title,
        rf.author,
        rf.campus,
        rf.category,
        rf.center,
        sb.eval_id,
        COALESCE(sb.score, 0) as score,
        c.id as criteria_id,
        c.name as criteria_name,
        c.percentage
    FROM researchfile rf
    LEFT JOIN score_board sb ON rf.id = sb.doc_id  
    LEFT JOIN criteria c ON sb.criteria_id = c.id
    INNER JOIN endorsement e ON rf.endorsementid = e.id
    WHERE sb.eval_id IN ($idPlaceholders)
    AND rf.event_id = ?
    AND (rf.category = ? OR rf.category LIKE ?)
    AND e.status = 'accepted'
    ORDER BY sb.eval_id, rf.id, c.id";
    
    $docStmt = $con->prepare($docQuery);
    
    $categoryPattern = "%" . $categoryName . "%";
    
    $types = str_repeat('i', count($evaluatorIds)) . 'iss';
    $params = array_merge($evaluatorIds, [$eventId, $categoryName, $categoryPattern]);
    
    $docStmt->bind_param($types, ...$params);
    $docStmt->execute();
    $docResult = $docStmt->get_result();
    
    $docsByEval = [];
    
    while ($row = $docResult->fetch_assoc()) {
        $evalId = $row['eval_id'];
        $docId = (int)$row['id'];
        
        if ($row['criteria_id'] === null) {
            continue;
        }
        
        if (!isset($docsByEval[$evalId])) {
            $docsByEval[$evalId] = [];
        }
        
        if (!isset($docsByEval[$evalId][$docId])) {
            $docsByEval[$evalId][$docId] = [
                'file' => [
                    'id' => $docId,
                    'title' => $row['title'] ?? 'Untitled',
                    'author' => $row['author'] ?? '',
                    'campus' => $row['campus'] ?? '',
                    'category' => $row['category'] ?? '',
                    'center' => $row['center'] ?? ''
                ],
                'TotalScore' => 0,
                'criteria' => []
            ];
        }
        
        $docsByEval[$evalId][$docId]['criteria'][] = [
            'criteria_id' => (int)$row['criteria_id'],
            'name' => $row['criteria_name'] ?? 'Unknown',
            'percentage' => (int)$row['percentage'],
            'score' => (int)$row['score']
        ];
        
        $docsByEval[$evalId][$docId]['TotalScore'] += (int)$row['score'];
    }
    
    $docStmt->close();
    
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

// GET FINAL CONSOLIDATED RANK (1224 STANDARD)
if(isset($_POST['getFinalRank'])) {
    $response = ['success' => false, 'data' => null, 'error' => ''];
    
    if($con = new mysqli($host, $username, $pass, $dbName)) {
        $con->set_charset('utf8mb4');
        
        $eventId = $_POST['eventId'];
        $categoryId = $_POST['categoryId'];
        $isNewSystem = ($eventId >= 13);
        
        try {
            $evaluatorData = [];
            if ($isNewSystem) {
                $evaluatorData = getEvalByCenter($con, $eventId, $categoryId);
            } else {
                $evaluatorData = getEvalByCategory($con, $eventId, $categoryId);
            }
            
            if (empty($evaluatorData)) {
                throw new Exception('No evaluator data found');
            }
            
            $allDocuments = [];
            
            foreach ($evaluatorData as $evalItem) {
                $docs = $evalItem->docs ?? $evalItem['docs'];
                foreach ($docs as $doc) {
                    $docId = $doc->file['id'] ?? $doc['file']['id'];
                    if (!isset($allDocuments[$docId])) {
                        $allDocuments[$docId] = [
                            'id' => $docId,
                            'title' => $doc->file['title'] ?? $doc['file']['title']
                        ];
                    }
                }
            }
            
            uasort($allDocuments, function($a, $b) {
                return strcmp($a['title'], $b['title']);
            });
            
            $documentIds = array_keys($allDocuments);
            $documentColumns = [];
            foreach ($documentIds as $index => $docId) {
                $documentColumns[$docId] = $index + 1;
            }
            
            $finalRankRows = [];
            
            foreach ($evaluatorData as $evalIndex => $evalItem) {
                $evaluator = $evalItem->evaluator ?? $evalItem['evaluator'];
                $evalId = $evaluator['id'] ?? $evaluator->id;
                $docs = $evalItem->docs ?? $evalItem['docs'];
                
                $docScores = [];
                foreach ($docs as $doc) {
                    $docId = $doc->file['id'] ?? $doc['file']['id'];
                    $docScores[$docId] = $doc->TotalScore ?? $doc['TotalScore'];
                }
                
                $scoreItems = [];
                foreach ($documentIds as $docId) {
                    $scoreItems[] = [
                        'doc_id' => $docId,
                        'score' => $docScores[$docId] ?? 0,
                        'column' => $documentColumns[$docId]
                    ];
                }
                
                usort($scoreItems, function($a, $b) {
                    return $b['score'] - $a['score'];
                });
                
                $ranks = [];
                $currentRank = 1;
                $i = 0;
                
                while ($i < count($scoreItems)) {
                    $currentScore = $scoreItems[$i]['score'];
                    $tieCount = 1;
                    
                    for ($j = $i + 1; $j < count($scoreItems); $j++) {
                        if ($scoreItems[$j]['score'] == $currentScore) {
                            $tieCount++;
                        } else {
                            break;
                        }
                    }
                    
                    for ($k = 0; $k < $tieCount; $k++) {
                        $docId = $scoreItems[$i + $k]['doc_id'];
                        $ranks[$docId] = $currentRank;
                    }
                    
                    $i += $tieCount;
                    $currentRank++;
                }
                
                $rankedDocs = [];
                foreach ($documentIds as $docId) {
                    $rankedDocs[] = [
                        'doc_id' => $docId,
                        'rank' => $ranks[$docId],
                        'column' => $documentColumns[$docId]
                    ];
                }
                
                usort($rankedDocs, function($a, $b) {
                    if ($a['rank'] == $b['rank']) {
                        return $a['column'] - $b['column'];
                    }
                    return $a['rank'] - $b['rank'];
                });
                
                $rankGroups = [];
                foreach ($rankedDocs as $item) {
                    $rank = $item['rank'];
                    if (!isset($rankGroups[$rank])) {
                        $rankGroups[$rank] = [];
                    }
                    $rankGroups[$rank][] = $item['doc_id'];
                }
                
                $finalRanks = [];
                $groupPosition = 1;
                
                foreach ($rankGroups as $rank => $groupDocIds) {
                    $groupSize = count($groupDocIds);
                    
                    if ($groupSize == 1) {
                        foreach ($groupDocIds as $docId) {
                            $finalRanks[$docId] = $groupPosition;
                        }
                    } else {
                        $sumOfPositions = 0;
                        for ($pos = $groupPosition; $pos < $groupPosition + $groupSize; $pos++) {
                            $sumOfPositions += $pos;
                        }
                        $averagePosition = $sumOfPositions / $groupSize;
                        
                        if (floor($averagePosition) == $averagePosition) {
                            $finalRank = (int)$averagePosition;
                        } else {
                            $finalRank = round($averagePosition, 1);
                        }
                        
                        foreach ($groupDocIds as $docId) {
                            $finalRanks[$docId] = $finalRank;
                        }
                    }
                    
                    $groupPosition += $groupSize;
                }
                
                $finalRankRow = [];
                foreach ($documentIds as $docId) {
                    $finalRankRow[$documentColumns[$docId]] = $finalRanks[$docId] ?? '';
                }
                
                $finalRankRows[$evalId] = $finalRankRow;
            }
            
            $response['success'] = true;
            $response['data'] = [
                'document_columns' => $documentColumns,
                'final_rank_rows' => $finalRankRows,
                'documents' => $allDocuments,
                'summary' => [
                    'total_evaluators' => count($evaluatorData),
                    'total_documents' => count($documentIds)
                ]
            ];
            
        } catch (Exception $e) {
            error_log("getFinalRank Error: " . $e->getMessage());
            $response['error'] = $e->getMessage();
        }
        
        $con->close();
    }
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}

// GET AVERAGE RANK ACROSS ALL EVALUATORS (FILTERED BY CATEGORY)
if(isset($_POST['getAverageRank'])) {
    $response = ['success' => false, 'data' => null, 'error' => ''];
    
    if($con = new mysqli($host, $username, $pass, $dbName)) {
        $con->set_charset('utf8mb4');
        
        $eventId = (int)$_POST['eventId'];
        $categoryId = isset($_POST['categoryId']) ? (int)$_POST['categoryId'] : 0;
        $isNewSystem = ($eventId >= 13);
        
        try {
            $eventName = getEventName($con, $eventId);
            
            // STEP 1: Get category/center name if specified
            $categoryName = null;
            if ($categoryId > 0) {
                if ($isNewSystem) {
                    $centerQuery = "SELECT name FROM center WHERE id = ?";
                    $centerStmt = $con->prepare($centerQuery);
                    $centerStmt->bind_param("i", $categoryId);
                    $centerStmt->execute();
                    $centerResult = $centerStmt->get_result();
                    if ($centerRow = $centerResult->fetch_assoc()) {
                        $categoryName = $centerRow['name'];
                    }
                    $centerStmt->close();
                } else {
                    $catQuery = "SELECT name FROM category WHERE id = ?";
                    $catStmt = $con->prepare($catQuery);
                    $catStmt->bind_param("i", $categoryId);
                    $catStmt->execute();
                    $catResult = $catStmt->get_result();
                    if ($catRow = $catResult->fetch_assoc()) {
                        $categoryName = $catRow['name'];
                    }
                    $catStmt->close();
                }
            }
            
            // STEP 2: Get accepted documents for this event (filtered by category if specified)
            $docQuery = "SELECT 
                rf.id,  
                rf.title,
                rf.author,
                rf.campus,
                rf.category,
                rf.center,
                rf.event_id
            FROM researchfile rf
            INNER JOIN endorsement e ON rf.endorsementid = e.id
            WHERE rf.event_id = ?
            AND e.status = 'accepted'";
            
            $params = [$eventId];
            $types = "i";
            
            // Add category filter if specified and found
            if ($categoryId > 0 && $categoryName !== null) {
                if ($isNewSystem) {
                    $docQuery .= " AND rf.center = ?";
                } else {
                    $docQuery .= " AND rf.category = ?";
                }
                $params[] = $categoryName;
                $types .= "s";
            }
            
            $docQuery .= " ORDER BY rf.title";
            
            $docStmt = $con->prepare($docQuery);
            if (!$docStmt) {
                throw new Exception('Prepare failed: ' . $con->error);
            }
            $docStmt->bind_param($types, ...$params);
            $docStmt->execute();
            $docResult = $docStmt->get_result();
            
            $allDocuments = [];
            while ($row = $docResult->fetch_assoc()) {
                $allDocuments[$row['id']] = [
                    'id' => $row['id'],
                    'title' => $row['title'] ?? 'Untitled',
                    'author' => $row['author'] ?? '',
                    'campus' => $row['campus'] ?? '',
                    'category' => $row['category'] ?? '',
                    'center' => $row['center'] ?? ''
                ];
            }
            $docStmt->close();
            
            if (empty($allDocuments)) {
                throw new Exception('No documents found for this event' . ($categoryId > 0 ? ' and selected category' : ''));
            }
            
            $docIds = array_keys($allDocuments);
            $docIdPlaceholder = implode(',', array_fill(0, count($docIds), '?'));
            
            // STEP 3: Get evaluators who have scored these documents
            $evalQuery = "SELECT DISTINCT sb.eval_id, e.fullname 
                          FROM score_board sb 
                          INNER JOIN evaluator e ON sb.eval_id = e.id 
                          WHERE sb.doc_id IN ($docIdPlaceholder) 
                          AND sb.score > 0
                          ORDER BY e.fullname";
            
            $evalStmt = $con->prepare($evalQuery);
            if (!$evalStmt) {
                throw new Exception('Prepare failed: ' . $con->error);
            }
            $types = str_repeat('i', count($docIds));
            $evalStmt->bind_param($types, ...$docIds);
            $evalStmt->execute();
            $evalResult = $evalStmt->get_result();
            
            $evaluators = [];
            while ($row = $evalResult->fetch_assoc()) {
                $evaluators[$row['eval_id']] = [
                    'id' => $row['eval_id'],
                    'fullname' => $row['fullname']
                ];
            }
            $evalStmt->close();
            
            if (empty($evaluators)) {
                throw new Exception('No evaluators found with scores');
            }
            
            $evaluatorIds = array_keys($evaluators);
            $evalIdPlaceholder = implode(',', array_fill(0, count($evaluatorIds), '?'));
            
            // STEP 4: Get all scores
            $scoreQuery = "SELECT 
                rf.id as doc_id,  
                sb.eval_id,
                COALESCE(sb.score, 0) as score,
                c.id as criteria_id,
                c.name as criteria_name,
                c.percentage
            FROM score_board sb
            INNER JOIN researchfile rf ON rf.id = sb.doc_id
            LEFT JOIN criteria c ON sb.criteria_id = c.id
            WHERE sb.doc_id IN ($docIdPlaceholder)
            AND sb.eval_id IN ($evalIdPlaceholder)
            AND sb.score > 0
            ORDER BY sb.eval_id, rf.id, c.id";
            
            $scoreStmt = $con->prepare($scoreQuery);
            if (!$scoreStmt) {
                throw new Exception('Prepare failed: ' . $con->error);
            }
            
            $types = str_repeat('i', count($docIds)) . str_repeat('i', count($evaluatorIds));
            $params = array_merge($docIds, $evaluatorIds);
            $scoreStmt->bind_param($types, ...$params);
            $scoreStmt->execute();
            $scoreResult = $scoreStmt->get_result();
            
            // Process scores by evaluator and document
            $docsByEval = [];
            while ($row = $scoreResult->fetch_assoc()) {
                $evalId = $row['eval_id'];
                $docId = (int)$row['doc_id'];
                
                if ($row['criteria_id'] === null) {
                    continue;
                }
                
                if (!isset($docsByEval[$evalId])) {
                    $docsByEval[$evalId] = [];
                }
                
                if (!isset($docsByEval[$evalId][$docId])) {
                    $docsByEval[$evalId][$docId] = [
                        'doc_id' => $docId,
                        'TotalScore' => 0,
                        'criteria' => []
                    ];
                }
                
                $docsByEval[$evalId][$docId]['criteria'][] = [
                    'criteria_id' => (int)$row['criteria_id'],
                    'name' => $row['criteria_name'] ?? 'Unknown',
                    'percentage' => (int)$row['percentage'],
                    'score' => (int)$row['score']
                ];
                
                $docsByEval[$evalId][$docId]['TotalScore'] += (int)$row['score'];
            }
            $scoreStmt->close();
            
            // STEP 5: Calculate ranks for each evaluator
            $allFinalRanks = [];
            
            foreach ($docsByEval as $evalId => $evalDocs) {
                // Sort documents by TotalScore descending
                uasort($evalDocs, function($a, $b) {
                    return $b['TotalScore'] - $a['TotalScore'];
                });
                
                // Calculate ranks with tie handling
                $sortedDocs = array_values($evalDocs);
                $ranks = [];
                $currentRank = 1;
                $i = 0;
                $count = count($sortedDocs);
                
                while ($i < $count) {
                    $currentScore = $sortedDocs[$i]['TotalScore'];
                    $tieCount = 1;
                    
                    for ($j = $i + 1; $j < $count; $j++) {
                        if ($sortedDocs[$j]['TotalScore'] == $currentScore) {
                            $tieCount++;
                        } else {
                            break;
                        }
                    }
                    
                    // Assign rank (with tie handling)
                    for ($k = 0; $k < $tieCount; $k++) {
                        $docId = $sortedDocs[$i + $k]['doc_id'];
                        $ranks[$docId] = $currentRank;
                    }
                    
                    $i += $tieCount;
                    $currentRank++;
                }
                
                // Store ranks for this evaluator
                foreach ($ranks as $docId => $rank) {
                    if (!isset($allFinalRanks[$docId])) {
                        $allFinalRanks[$docId] = [];
                    }
                    $allFinalRanks[$docId][] = $rank;
                }
            }
            
            // STEP 6: Calculate average ranks
            $averageFinalRanks = [];
            $docColumns = [];
            $sortedDocIds = array_keys($allDocuments);
            sort($sortedDocIds);
            
            foreach ($sortedDocIds as $index => $docId) {
                $docColumns[$docId] = $index + 1;
            }
            
            foreach ($allDocuments as $docId => $doc) {
                if (isset($allFinalRanks[$docId]) && !empty($allFinalRanks[$docId])) {
                    $ranks = $allFinalRanks[$docId];
                    $sum = array_sum($ranks);
                    $count = count($ranks);
                    $average = $sum / $count;
                    
                    $formattedAverage = round($average, 2);
                    
                    $averageFinalRanks[$docId] = [
                        'doc_id' => $docId,
                        'title' => $doc['title'],
                        'author' => $doc['author'],
                        'campus' => $doc['campus'],
                        'category' => $doc['category'],
                        'center' => $doc['center'],
                        'column' => $docColumns[$docId],
                        'final_ranks' => $ranks,
                        'total_rank_score' => $sum,
                        'average' => $average,
                        'formatted_average' => $formattedAverage,
                        'count' => $count
                    ];
                }
            }
            
            // Sort by average rank (ascending)
            uasort($averageFinalRanks, function($a, $b) {
                if ($a['average'] == $b['average']) return 0;
                return ($a['average'] < $b['average']) ? -1 : 1;
            });
            
            // Assign final positions
            $finalPosition = 1;
            foreach ($averageFinalRanks as $docId => &$rankData) {
                $rankData['final_rank'] = $finalPosition++;
            }
            
            // Build evaluator names list
            $evaluatorNames = [];
            $counter = 1;
            foreach ($evaluators as $evalId => $evaluator) {
                $evaluatorNames[] = [
                    'id' => $evalId,
                    'name' => $evaluator['fullname'],
                    'number' => $counter++
                ];
            }
            
            // Get category info for response
            $categoryDisplayName = $categoryName ?? 'All Categories';
            $categoryType = $isNewSystem ? 'Center' : 'Category';
            
            $response['success'] = true;
            $response['data'] = [
                'event' => [
                    'name' => $eventName,
                    'id' => $eventId
                ],
                'category' => [
                    'name' => $categoryDisplayName,
                    'type' => $categoryType,
                    'id' => $categoryId
                ],
                'documents' => $allDocuments,
                'document_columns' => $docColumns,
                'evaluator_names' => $evaluatorNames,
                'average_ranks' => $averageFinalRanks,
                'summary' => [
                    'total_evaluators' => count($evaluators),
                    'total_documents' => count($allDocuments),
                    'generated_at' => date('Y-m-d H:i:s')
                ]
            ];
            
        } catch (Exception $e) {
            error_log("getAverageRank Error: " . $e->getMessage());
            $response['error'] = $e->getMessage();
        }
        
        $con->close();
    }
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}