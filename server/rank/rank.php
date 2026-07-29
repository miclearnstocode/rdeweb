<?php
require_once(__DIR__ . '/../db.php');

// DISABLE ALL OUTPUT EXCEPT JSON
error_reporting(0);
ini_set('display_errors', 0);

// Start output buffering to catch any unexpected output
ob_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

function isSimilarString($str1, $str2, $threshold = 0.85) {
    // Remove common prefixes like "1.", "2.", etc.
    $clean1 = preg_replace('/^[\d]+\.\s*/', '', trim($str1));
    $clean2 = preg_replace('/^[\d]+\.\s*/', '', trim($str2));
    
    // If strings are identical after cleaning, they're the same
    if ($clean1 === $clean2) {
        return true;
    }
    
    // Calculate Levenshtein distance
    $len1 = strlen($clean1);
    $len2 = strlen($clean2);
    
    // If length difference is too big, they're probably not the same
    if (abs($len1 - $len2) > max($len1, $len2) * 0.3) {
        return false;
    }
    
    $distance = levenshtein($clean1, $clean2);
    $maxLen = max($len1, $len2);
    
    // Calculate similarity percentage
    if ($maxLen === 0) {
        return true;
    }
    
    $similarity = 1 - ($distance / $maxLen);
    
    return $similarity >= $threshold;
}

function deduplicateDocuments($documents, $docScores = []) {
    $uniqueDocs = [];
    $usedIndices = [];
    $docList = array_values($documents);
    
    for ($i = 0; $i < count($docList); $i++) {
        if (in_array($i, $usedIndices)) {
            continue;
        }
        
        $bestIndex = $i;
        $bestScore = isset($docScores[$docList[$i]['id']]) ? $docScores[$docList[$i]['id']] : 0;
        $bestTitle = $docList[$i]['title'];
        
        // Check against all other documents
        for ($j = $i + 1; $j < count($docList); $j++) {
            if (in_array($j, $usedIndices)) {
                continue;
            }
            
            $title1 = $docList[$i]['title'] ?? '';
            $title2 = $docList[$j]['title'] ?? '';
            
            // If titles are similar, mark as duplicate
            if (isSimilarString($title1, $title2)) {
                $usedIndices[] = $j;
                
                // Check if this document has a higher score
                $currentScore = isset($docScores[$docList[$j]['id']]) ? $docScores[$docList[$j]['id']] : 0;
                if ($currentScore > $bestScore) {
                    $bestScore = $currentScore;
                    $bestIndex = $j;
                    $bestTitle = $docList[$j]['title'];
                }
            }
        }
        
        // Keep the document with the highest score
        $uniqueDocs[$docList[$bestIndex]['id']] = $docList[$bestIndex];
        
        error_log("Kept document: ID={$docList[$bestIndex]['id']}, Title='$bestTitle', Score=$bestScore");
    }
    
    return $uniqueDocs;
}

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
    
    // If no category selected, return empty array
    if ($categoryId <= 0) {
        ob_clean();
        echo json_encode([]);
        ob_end_flush();
        exit();
    }
    
    try {
        // STEP 1: Get the category name from the ID
        $categoryName = '';
        
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
        
        // If no category found, return empty
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
        
        // STEP 2: Get documents for this event and category
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
        $allDocs = [];
        while ($row = $checkResult->fetch_assoc()) {
            $docIds[] = $row['id'];
            $allDocs[$row['id']] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'category' => $row['category'],
                'event_id' => $row['event_id']
            ];
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
        
        // STEP 2.5: Get total scores for each document to help with deduplication
        $docIdPlaceholder = implode(',', array_fill(0, count($docIds), '?'));
        $scoreSumQuery = "SELECT 
                            doc_id,
                            SUM(score) as total_score
                          FROM score_board
                          WHERE doc_id IN ($docIdPlaceholder)
                          GROUP BY doc_id";
        
        $scoreSumStmt = $con->prepare($scoreSumQuery);
        if ($scoreSumStmt) {
            $types = str_repeat('i', count($docIds));
            $scoreSumStmt->bind_param($types, ...$docIds);
            $scoreSumStmt->execute();
            $scoreSumResult = $scoreSumStmt->get_result();
            
            $docScores = [];
            while ($row = $scoreSumResult->fetch_assoc()) {
                $docScores[$row['doc_id']] = (int)$row['total_score'];
            }
            $scoreSumStmt->close();
            
            // Deduplicate documents using fuzzy matching
            $allDocs = deduplicateDocuments($allDocs, $docScores);
            $docIds = array_keys($allDocs);
            
            error_log("After deduplication: " . count($docIds) . " documents remain");
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

if(isset($_POST['generateSummaryReport'])) {
    $response = ['success' => false, 'data' => null, 'error' => ''];
    
    if($con = new mysqli($host, $username, $pass, $dbName)) {
        $con->set_charset('utf8mb4');
        
        $eventId = (int)$_POST['eventId'];
        $categoryId = isset($_POST['categoryId']) ? (int)$_POST['categoryId'] : 0;
        
        try {
            // STEP 1: GET EVENT DETAILS
            $eventName = getEventName($con, $eventId);
            $eventTitle = $eventName;
            
            // STEP 2: GET CATEGORY NAME
            $categoryName = 'All Categories';
            $categoryDatabaseId = 0;
            
            if ($categoryId > 0) {
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
            
            // STEP 3: GET CRITERIA FOR THIS EVENT
            $criteriaList = [];
            $qualityPresentationCriteriaId = null;

            // First, get the criteria IDs that are actually being used in scores for this category
            $criteriaIdQuery = "SELECT DISTINCT sb.criteria_id 
                                FROM score_board sb
                                INNER JOIN researchfile rf ON rf.id = sb.doc_id
                                INNER JOIN endorsement e ON rf.endorsementid = e.id
                                WHERE rf.event_id = ? 
                                AND rf.category = ? 
                                AND e.status = 'accepted'
                                AND sb.score > 0";

            $criteriaIdStmt = $con->prepare($criteriaIdQuery);
            if (!$criteriaIdStmt) {
                throw new Exception('Prepare failed: ' . $con->error);
            }
            $criteriaIdStmt->bind_param("is", $eventId, $categoryName);
            $criteriaIdStmt->execute();
            $criteriaIdResult = $criteriaIdStmt->get_result();

            $criteriaIds = [];
            while ($row = $criteriaIdResult->fetch_assoc()) {
                $criteriaIds[] = (int)$row['criteria_id'];
            }
            $criteriaIdStmt->close();

            error_log("Criteria IDs found in score_board: " . implode(', ', $criteriaIds));

            // If criteria IDs found, get the full criteria details
            if (!empty($criteriaIds)) {
                $idPlaceholder = implode(',', array_fill(0, count($criteriaIds), '?'));
                $criteriaQuery = "SELECT DISTINCT c.id, c.name, c.percentage 
                                FROM criteria c
                                WHERE c.id IN ($idPlaceholder)
                                ORDER BY c.id ASC";
                
                $criteriaStmt = $con->prepare($criteriaQuery);
                if (!$criteriaStmt) {
                    throw new Exception('Prepare failed: ' . $con->error);
                }
                
                $types = str_repeat('i', count($criteriaIds));
                $criteriaStmt->bind_param($types, ...$criteriaIds);
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
                
                error_log("Found " . count($criteriaList) . " criteria from score_board data with IDs: " . implode(', ', array_column($criteriaList, 'id')));
            }

            // If still no criteria found, return error
            if (empty($criteriaList)) {
                throw new Exception('No criteria found for this event and category');
            }
            
            // STEP 4: GET ACCEPTED DOCUMENTS FOR THIS EVENT
            $docQuery = "SELECT 
                rf.id,  
                rf.title,
                rf.author,
                rf.campus,
                rf.category
            FROM researchfile rf
            INNER JOIN endorsement e ON rf.endorsementid = e.id
            WHERE rf.event_id = ?
            AND e.status = 'accepted'";
            
            $params = [$eventId];
            $types = "i";
            
            if ($categoryId > 0) {
                $docQuery .= " AND rf.category = ?";
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
                    'category' => $row['category'] ?? ''
                ];
            }
            $docStmt->close();
            
            if (empty($allDocuments)) {
                throw new Exception('No documents found for this event' . ($categoryId > 0 ? ' and category' : ''));
            }
            
            // STEP 4.5: Deduplicate documents using fuzzy matching
            $docIds = array_keys($allDocuments);
            
            // Get total scores for each document
            $docIdPlaceholder = implode(',', array_fill(0, count($docIds), '?'));
            $scoreSumQuery = "SELECT 
                                doc_id,
                                SUM(score) as total_score
                              FROM score_board
                              WHERE doc_id IN ($docIdPlaceholder)
                              GROUP BY doc_id";
            
            $scoreSumStmt = $con->prepare($scoreSumQuery);
            $docScores = [];
            if ($scoreSumStmt) {
                $types = str_repeat('i', count($docIds));
                $scoreSumStmt->bind_param($types, ...$docIds);
                $scoreSumStmt->execute();
                $scoreSumResult = $scoreSumStmt->get_result();
                
                while ($row = $scoreSumResult->fetch_assoc()) {
                    $docScores[$row['doc_id']] = (int)$row['total_score'];
                }
                $scoreSumStmt->close();
            }
            
            // Deduplicate documents
            $allDocuments = deduplicateDocuments($allDocuments, $docScores);
            
            error_log("After deduplication: " . count($allDocuments) . " documents remain");
            
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
                            'category' => $row['category'] ?? ''
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
                    'type' => 'Category'
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

                foreach ($criteriaList as $criterion) {
                    $criteriaId = (int)$criterion['id'];
                    $criteriaName = $criterion['name'];
                    
                    $row = [
                        'name' => $criteriaName,
                        'percentage' => (int)$criterion['percentage'],
                        'scores' => []
                    ];
                    
                    foreach ($documentIds as $docId) {
                        $column = $documentColumns[$docId];
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
                
                // ADD THE EVALUATOR SHEET TO THE REPORT
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
    
    // Get evaluators for this event
    $evalQuery = "SELECT DISTINCT e.id, e.fullname
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
    
    // Get documents for this event and category
    $idPlaceholders = implode(',', array_fill(0, count($evaluatorIds), '?'));
    
    $docQuery = "SELECT 
        rf.id,  
        rf.title,
        rf.author,
        rf.campus,
        rf.category,
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
    AND rf.category = ?
    AND e.status = 'accepted'
    ORDER BY sb.eval_id, rf.id, c.id";
    
    $docStmt = $con->prepare($docQuery);
    $types = str_repeat('i', count($evaluatorIds)) . 'is';
    $params = array_merge($evaluatorIds, [$eventId, $categoryName]);
    
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
                    'category' => $row['category'] ?? ''
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

// GET FINAL CONSOLIDATED RANK (with deduplication)
if(isset($_POST['getFinalRank'])) {
    $response = ['success' => false, 'data' => null, 'error' => ''];
    
    if($con = new mysqli($host, $username, $pass, $dbName)) {
        $con->set_charset('utf8mb4');
        
        $eventId = $_POST['eventId'];
        $categoryId = $_POST['categoryId'];
        
        try {
            // Get evaluator data using category
            $evaluatorData = getEvalByCategory($con, $eventId, $categoryId);
            
            if (empty($evaluatorData)) {
                throw new Exception('No evaluator data found');
            }
            
            // Get all documents and their scores for deduplication
            $allDocuments = [];
            $docScores = [];
            
            foreach ($evaluatorData as $evalItem) {
                $docs = $evalItem->docs ?? $evalItem['docs'];
                foreach ($docs as $doc) {
                    $docId = $doc->file['id'] ?? $doc['file']['id'];
                    $docTitle = $doc->file['title'] ?? $doc['file']['title'];
                    $docScore = $doc->TotalScore ?? $doc['TotalScore'];
                    
                    if (!isset($allDocuments[$docId])) {
                        $allDocuments[$docId] = [
                            'id' => $docId,
                            'title' => $docTitle
                        ];
                        $docScores[$docId] = $docScore;
                    } else {
                        // Keep the higher score if duplicate found
                        if ($docScore > $docScores[$docId]) {
                            $docScores[$docId] = $docScore;
                        }
                    }
                }
            }
            
            // Deduplicate documents
            $allDocuments = deduplicateDocuments($allDocuments, $docScores);
            
            error_log("getFinalRank - After deduplication: " . count($allDocuments) . " documents remain");
            
            // Rebuild evaluator data with deduplicated documents
            $deduplicatedEvalData = [];
            foreach ($evaluatorData as $evalItem) {
                $eval = new stdClass();
                $eval->evaluator = $evalItem->evaluator;
                $eval->docs = [];
                
                $docs = $evalItem->docs ?? $evalItem['docs'];
                foreach ($docs as $doc) {
                    $docId = $doc->file['id'] ?? $doc['file']['id'];
                    // Only keep documents that survived deduplication
                    if (isset($allDocuments[$docId])) {
                        $eval->docs[] = $doc;
                    }
                }
                
                if (!empty($eval->docs)) {
                    $deduplicatedEvalData[] = $eval;
                }
            }
            
            $evaluatorData = $deduplicatedEvalData;
            
            if (empty($evaluatorData)) {
                throw new Exception('No evaluator data found after deduplication');
            }
            
            // Sort documents by title for consistent column order
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

// GET AVERAGE RANK ACROSS ALL EVALUATORS (with deduplication)
if(isset($_POST['getAverageRank'])) {
    $response = ['success' => false, 'data' => null, 'error' => ''];
    
    if($con = new mysqli($host, $username, $pass, $dbName)) {
        $con->set_charset('utf8mb4');
        
        $eventId = (int)$_POST['eventId'];
        $categoryId = isset($_POST['categoryId']) ? (int)$_POST['categoryId'] : 0;
        
        try {
            $eventName = getEventName($con, $eventId);
            
            // STEP 1: Get category name if specified
            $categoryName = null;
            if ($categoryId > 0) {
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
            
            // STEP 2: Get accepted documents for this event (filtered by category if specified)
            $docQuery = "SELECT 
                rf.id,  
                rf.title,
                rf.author,
                rf.campus,
                rf.category,
                rf.event_id
            FROM researchfile rf
            INNER JOIN endorsement e ON rf.endorsementid = e.id
            WHERE rf.event_id = ?
            AND e.status = 'accepted'";
            
            $params = [$eventId];
            $types = "i";
            
            // Add category filter if specified and found
            if ($categoryId > 0 && $categoryName !== null) {
                $docQuery .= " AND rf.category = ?";
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
                    'category' => $row['category'] ?? ''
                ];
            }
            $docStmt->close();
            
            if (empty($allDocuments)) {
                throw new Exception('No documents found for this event' . ($categoryId > 0 ? ' and selected category' : ''));
            }
            
            // STEP 2.5: Get total scores for each document for deduplication
            $docIds = array_keys($allDocuments);
            $docIdPlaceholder = implode(',', array_fill(0, count($docIds), '?'));
            $scoreSumQuery = "SELECT 
                                doc_id,
                                SUM(score) as total_score
                              FROM score_board
                              WHERE doc_id IN ($docIdPlaceholder)
                              GROUP BY doc_id";
            
            $scoreSumStmt = $con->prepare($scoreSumQuery);
            $docScores = [];
            if ($scoreSumStmt) {
                $types = str_repeat('i', count($docIds));
                $scoreSumStmt->bind_param($types, ...$docIds);
                $scoreSumStmt->execute();
                $scoreSumResult = $scoreSumStmt->get_result();
                
                while ($row = $scoreSumResult->fetch_assoc()) {
                    $docScores[$row['doc_id']] = (int)$row['total_score'];
                }
                $scoreSumStmt->close();
            }
            
            // Deduplicate documents
            $allDocuments = deduplicateDocuments($allDocuments, $docScores);
            
            error_log("getAverageRank - After deduplication: " . count($allDocuments) . " documents remain");
            
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
            
            $response['success'] = true;
            $response['data'] = [
                'event' => [
                    'name' => $eventName,
                    'id' => $eventId
                ],
                'category' => [
                    'name' => $categoryDisplayName,
                    'type' => 'Category',
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