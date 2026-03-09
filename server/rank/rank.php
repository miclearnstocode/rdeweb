<?php
require_once(__DIR__ . '/../db.php');

// DISABLE ALL OUTPUT EXCEPT JSON
error_reporting(0);
ini_set('display_errors', 0);
ob_start(); // Start output buffering early

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

if(isset($_POST['getEval'])) {
    $response = [];
    
    $con = new mysqli($host, $username, $pass, $dbName);
    $con->set_charset("utf8mb4");
    
    $eventId = (int)$_POST['eventId'];
    $categoryId = (int)$_POST['categoryId'];
    $isNewSystem = ($eventId >= 13);
    
    if ($categoryId > 0) {
        if ($isNewSystem) {
            // NEW SYSTEM - Get by center
            $centerStmt = $con->prepare("SELECT name, code FROM center WHERE id = ?");
            $centerStmt->bind_param("i", $categoryId);
            $centerStmt->execute();
            $centerResult = $centerStmt->get_result();
            
            if ($centerRow = $centerResult->fetch_assoc()) {
                $centerName = $centerRow['name'];
                $centerCode = $centerRow['code'];
                
                // Get evaluators
                $evalQuery = "SELECT id, fullname FROM evaluator WHERE eventid = ? AND (center_id = ? OR center_id IS NULL OR center_id = 0) ORDER BY fullname";
                $evalStmt = $con->prepare($evalQuery);
                $evalStmt->bind_param("ii", $eventId, $categoryId);
                $evalStmt->execute();
                $evaluators = $evalStmt->get_result()->fetch_all(MYSQLI_ASSOC);
                
                foreach ($evaluators as $row) {
                    $eval = new stdClass();
                    $eval->evaluator = $row;
                    $eval->docs = [];
                    
                    // Get documents with scores - FIX: COALESCE to handle NULL scores
                    $docQuery = "SELECT 
                        rf.id,
                        rf.title,
                        rf.author,
                        rf.campus,
                        rf.category,
                        rf.center,
                        rf.center as display_name,
                        ? as center_code,
                        COALESCE(sb.score, 0) as score,
                        c.id as criteria_id,
                        c.name as criteria_name,
                        c.percentage
                    FROM researchfile rf
                    INNER JOIN score_board sb ON rf.id = sb.doc_id
                    INNER JOIN endorsement e ON rf.endorsementid = e.id
                    LEFT JOIN criteria c ON sb.criteria_id = c.id
                    WHERE sb.eval_id = ?
                    AND rf.event_id = ?
                    AND (rf.center LIKE ? OR rf.center LIKE ?)
                    AND e.status = 'accepted'
                    ORDER BY rf.id, c.id";
                    
                    $docStmt = $con->prepare($docQuery);
                    $centerPattern1 = "%" . $centerName . "%";
                    $centerPattern2 = "%" . $centerCode . "%";
                    
                    $docStmt->bind_param("siiss", $centerCode, $row['id'], $eventId, $centerPattern1, $centerPattern2);
                    $docStmt->execute();
                    $docResult = $docStmt->get_result();
                    
                    $docs = [];
                    while ($docRow = $docResult->fetch_assoc()) {
                        $docId = $docRow['id'];
                        
                        if (!isset($docs[$docId])) {
                            $doc = new stdClass();
                            $doc->file = [
                                'id' => (int)$docRow['id'],
                                'title' => (string)$docRow['title'],
                                'author' => (string)$docRow['author'],
                                'campus' => (string)$docRow['campus'],
                                'category' => (string)$docRow['category'],
                                'center' => (string)$docRow['center'],
                                'display_name' => (string)$docRow['display_name'],
                                'center_code' => (string)$docRow['center_code']
                            ];
                            $doc->TotalScore = 0;
                            $doc->criteria = [];
                            $docs[$docId] = $doc;
                        }
                        
                        // Add criteria - score is never NULL because of COALESCE
                        if ($docRow['criteria_id']) {
                            $criteria = [
                                'criteria_id' => (int)$docRow['criteria_id'],
                                'name' => (string)$docRow['criteria_name'],
                                'percentage' => (int)$docRow['percentage'],
                                'score' => (int)$docRow['score'] // Now always an int
                            ];
                            
                            $docs[$docId]->criteria[] = $criteria;
                            $docs[$docId]->TotalScore += (int)$docRow['score'];
                        }
                    }
                    
                    $eval->docs = array_values($docs);
                    if (count($eval->docs) > 0) {
                        $response[] = $eval;
                    }
                }
            }
        } else {
            // OLD SYSTEM - Get by category
            $catStmt = $con->prepare("SELECT name FROM category WHERE id = ?");
            $catStmt->bind_param("i", $categoryId);
            $catStmt->execute();
            $catResult = $catStmt->get_result();
            
            if ($catRow = $catResult->fetch_assoc()) {
                $categoryName = $catRow['name'];
                
                // Get evaluators
                $evalQuery = "SELECT id, fullname FROM evaluator WHERE eventid = ? AND (category = ? OR category IS NULL OR category = '') ORDER BY fullname";
                $evalStmt = $con->prepare($evalQuery);
                $evalStmt->bind_param("is", $eventId, $categoryName);
                $evalStmt->execute();
                $evaluators = $evalStmt->get_result()->fetch_all(MYSQLI_ASSOC);
                
                foreach ($evaluators as $row) {
                    $eval = new stdClass();
                    $eval->evaluator = $row;
                    $eval->docs = [];
                    
                    // Get documents with scores - FIX: COALESCE to handle NULL scores
                    $docQuery = "SELECT 
                        rf.id,
                        rf.title,
                        rf.author,
                        rf.campus,
                        rf.category,
                        rf.center,
                        rf.category as display_name,
                        '' as center_code,
                        COALESCE(sb.score, 0) as score,
                        c.id as criteria_id,
                        c.name as criteria_name,
                        c.percentage
                    FROM researchfile rf
                    INNER JOIN score_board sb ON rf.id = sb.doc_id
                    INNER JOIN endorsement e ON rf.endorsementid = e.id
                    LEFT JOIN criteria c ON sb.criteria_id = c.id
                    WHERE sb.eval_id = ?
                    AND rf.event_id = ?
                    AND (rf.category = ? OR rf.category LIKE ?)
                    AND e.status = 'accepted'
                    ORDER BY rf.id, c.id";
                    
                    $docStmt = $con->prepare($docQuery);
                    $categoryPattern = "%" . $categoryName . "%";
                    
                    $docStmt->bind_param("iiss", $row['id'], $eventId, $categoryName, $categoryPattern);
                    $docStmt->execute();
                    $docResult = $docStmt->get_result();
                    
                    $docs = [];
                    while ($docRow = $docResult->fetch_assoc()) {
                        $docId = $docRow['id'];
                        
                        if (!isset($docs[$docId])) {
                            $doc = new stdClass();
                            $doc->file = [
                                'id' => (int)$docRow['id'],
                                'title' => (string)$docRow['title'],
                                'author' => (string)$docRow['author'],
                                'campus' => (string)$docRow['campus'],
                                'category' => (string)$docRow['category'],
                                'center' => (string)$docRow['center'],
                                'display_name' => (string)$docRow['display_name'],
                                'center_code' => (string)$docRow['center_code']
                            ];
                            $doc->TotalScore = 0;
                            $doc->criteria = [];
                            $docs[$docId] = $doc;
                        }
                        
                        // Add criteria - score is never NULL because of COALESCE
                        if ($docRow['criteria_id']) {
                            $criteria = [
                                'criteria_id' => (int)$docRow['criteria_id'],
                                'name' => (string)$docRow['criteria_name'],
                                'percentage' => (int)$docRow['percentage'],
                                'score' => (int)$docRow['score'] // Now always an int
                            ];
                            
                            $docs[$docId]->criteria[] = $criteria;
                            $docs[$docId]->TotalScore += (int)$docRow['score'];
                        }
                    }
                    
                    $eval->docs = array_values($docs);
                    if (count($eval->docs) > 0) {
                        $response[] = $eval;
                    }
                }
            }
        }
    }
    
    // Clean output buffer and send JSON
    ob_clean();
    header('Content-Type: application/json');
    
    // Force all numbers to be numbers in JSON
    echo json_encode($response, JSON_NUMERIC_CHECK);
    ob_end_flush();
    exit();
}

//GENERATE SUMMARY REPORT - EXACT EXCEL FORMAT
if(isset($_POST['generateSummaryReport'])) {
    $response = ['success' => false, 'data' => null, 'error' => ''];
    
    if($con = new mysqli($host, $username, $pass, $dbName)) {
        $con->set_charset('utf8mb4');
        
        $eventId = $_POST['eventId'];
        $categoryId = $_POST['categoryId'];
        $isNewSystem = ($eventId >= 13);
        
        try {
            // STEP 1: GET EVENT DETAILS
            $eventName = getEventName($con, $eventId);
            $eventTitle = $eventName;
            
            // STEP 2: GET CATEGORY/CENTER NAME
            $categoryName = '';
            $systemType = $isNewSystem ? 'Center' : 'Category';
            $centerCode = '';
            
            if ($categoryId && $categoryId != '0') {
                if ($isNewSystem) {
                    $catQuery = "SELECT name, code FROM center WHERE id = ?";
                    $catStmt = $con->prepare($catQuery);
                    $catStmt->bind_param("i", $categoryId);
                    $catStmt->execute();
                    $catResult = $catStmt->get_result();
                    if ($catRow = $catResult->fetch_assoc()) {
                        $categoryName = $catRow['name'];
                        $centerCode = $catRow['code'] ?? '';
                    }
                    $catStmt->close();
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
            } else {
                $categoryName = $isNewSystem ? 'All Centers' : 'All Categories';
            }
            
            // STEP 3: GET CRITERIA FOR THIS EVENT AND CATEGORY/CENTER - NO DUPLICATES
            $criteriaList = [];
            $qualityPresentationCriteriaId = null;

            if ($isNewSystem) {
                // New system: Get criteria for this center
                if ($categoryId && $categoryId != '0') {
                    $criteriaQuery = "SELECT DISTINCT c.id, c.name, c.percentage 
                                    FROM criteria c
                                    WHERE c.event_id = ? 
                                    AND (c.center_id = ? OR c.center_id IS NULL OR c.center_id = 0)
                                    ORDER BY c.id ASC";
                    $criteriaStmt = $con->prepare($criteriaQuery);
                    $criteriaStmt->bind_param("ii", $eventId, $categoryId);
                } else {
                    // All Centers - get default criteria
                    $criteriaQuery = "SELECT DISTINCT c.id, c.name, c.percentage 
                                    FROM criteria c
                                    WHERE c.event_id = ? 
                                    AND (c.center_id IS NULL OR c.center_id = 0)
                                    ORDER BY c.id ASC";
                    $criteriaStmt = $con->prepare($criteriaQuery);
                    $criteriaStmt->bind_param("i", $eventId);
                }
            } else {
                // Old system: Get criteria for this category
                if ($categoryId && $categoryId != '0') {
                    // First get the category name
                    $catNameQuery = "SELECT name FROM category WHERE id = ?";
                    $catNameStmt = $con->prepare($catNameQuery);
                    $catNameStmt->bind_param("i", $categoryId);
                    $catNameStmt->execute();
                    $catNameResult = $catNameStmt->get_result();
                    $catNameRow = $catNameResult->fetch_assoc();
                    $categoryNameForQuery = $catNameRow['name'] ?? '';
                    $catNameStmt->close();
                    
                    $criteriaQuery = "SELECT DISTINCT c.id, c.name, c.percentage 
                                    FROM criteria c
                                    WHERE c.event_id = ? 
                                    AND (c.category_id = ? OR c.category_id IS NULL OR c.category_id = 0)
                                    ORDER BY c.id ASC";
                    $criteriaStmt = $con->prepare($criteriaQuery);
                    $criteriaStmt->bind_param("ii", $eventId, $categoryId);
                } else {
                    // All Categories - get default criteria
                    $criteriaQuery = "SELECT DISTINCT c.id, c.name, c.percentage 
                                    FROM criteria c
                                    WHERE c.event_id = ? 
                                    AND (c.category_id IS NULL OR c.category_id = 0)
                                    ORDER BY c.id ASC";
                    $criteriaStmt = $con->prepare($criteriaQuery);
                    $criteriaStmt->bind_param("i", $eventId);
                }
            }

            $criteriaStmt->execute();
            $criteriaResult = $criteriaStmt->get_result();

            while ($criterion = $criteriaResult->fetch_assoc()) {
                $criteriaList[] = [
                    'id' => (int)$criterion['id'],
                    'name' => $criterion['name'],
                    'percentage' => (int)$criterion['percentage']
                ];
                
                // Identify Quality of Presentation criteria
                if (stripos($criterion['name'], 'Quality of Presentation') !== false) {
                    $qualityPresentationCriteriaId = (int)$criterion['id'];
                }
            }
            $criteriaStmt->close();

            // DEBUG: Log the criteria we found
            error_log("Criteria for Event $eventId, Category/Center $categoryId: " . count($criteriaList) . " criteria found");
            
            // STEP 4: GET EVALUATOR DATA (Using the functions defined below)
            $evaluatorData = [];
            if ($isNewSystem) {
                $evaluatorData = getEvalByCenter($con, $eventId, $categoryId);
            } else {
                $evaluatorData = getEvalByCategory($con, $eventId, $categoryId);
            }
            
            // STEP 5: BUILD EXCEL-FORMAT REPORT STRUCTURE
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
            
            // STEP 6: COLLECT ALL UNIQUE DOCUMENTS
            $allDocuments = [];
            
            foreach ($evaluatorData as $evalItem) {
                $docs = $evalItem->docs ?? $evalItem['docs'];
                foreach ($docs as $doc) {
                    $docId = $doc->file['id'] ?? $doc['file']['id'];
                    if (!isset($allDocuments[$docId])) {
                        $allDocuments[$docId] = [
                            'id' => $docId,
                            'title' => $doc->file['title'] ?? $doc['file']['title'],
                            'author' => $doc->file['author'] ?? $doc['file']['author'] ?? '',
                            'campus' => $doc->file['campus'] ?? $doc['file']['campus'] ?? '',
                            'category' => $doc->file['category'] ?? $doc['file']['category'] ?? '',
                            'center' => $doc->file['center'] ?? $doc['file']['center'] ?? ''
                        ];
                    }
                }
            }
            
            // STEP 7: SORT DOCUMENTS BY TITLE TO ENSURE CONSISTENT ORDERING
            // This ensures document 1 is always column 1, document 2 is column 2, etc.
            uasort($allDocuments, function($a, $b) {
                return strcmp($a['title'], $b['title']);
            });
            
            $documentIds = array_keys($allDocuments);
            $documentColumns = []; // Maps document_id -> column number
            
            // Assign column numbers based on sorted order
            foreach ($documentIds as $index => $docId) {
                $documentColumns[$docId] = $index + 1;
            }
            
            // DEBUG: Log document column assignments
            error_log("=== DOCUMENT COLUMN ASSIGNMENTS ===");
            foreach ($documentIds as $docId) {
                error_log("Doc ID {$docId}: Column {$documentColumns[$docId]} - Title: {$allDocuments[$docId]['title']}");
            }
            
            // STEP 8: PROCESS EACH EVALUATOR
            foreach ($evaluatorData as $evalIndex => $evalItem) {
                $evaluator = $evalItem->evaluator ?? $evalItem['evaluator'];
                $docs = $evalItem->docs ?? $evalItem['docs'];
                
                // Initialize evaluator sheet
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
                
                // Initialize scores array for each criteria
                $criteriaScores = [];
                foreach ($criteriaList as $criterion) {
                    $criteriaId = (int)$criterion['id'];
                    $criteriaScores[$criteriaId] = [
                        'id' => $criteriaId,
                        'name' => $criterion['name'],
                        'percentage' => (int)$criterion['percentage'],
                        'scores' => []
                    ];
                }

                // Initialize document score lookup array
                $scoresByDoc = [];

                // FIRST: Add ALL documents from master list to headers in column order
                foreach ($documentIds as $docId) {
                    $columnNumber = $documentColumns[$docId];
                    $docTitle = $allDocuments[$docId]['title'];
                    
                    // Add to headers
                    $evaluatorSheet['headers']['criteria_row'][] = $columnNumber;
                    $evaluatorSheet['headers']['title_row'][] = $docTitle;
                    
                    // Initialize document info with zero score
                    $evaluatorSheet['documents'][$docId] = [
                        'column' => $columnNumber,
                        'id' => $docId,
                        'title' => $docTitle,
                        'total_score' => 0
                    ];
                }
                
                // SECOND: Populate scores for documents this evaluator actually scored
                foreach ($docs as $doc) {
                    $docData = $doc->file ?? $doc['file'];
                    $docId = $docData['id'];
                    
                    // Make sure this document exists in our master list
                    if (!isset($documentColumns[$docId])) {
                        error_log("WARNING: Document ID {$docId} not found in master list");
                        continue;
                    }
                    
                    $columnNumber = $documentColumns[$docId];
                    
                    // Update document info with actual scores
                    $evaluatorSheet['documents'][$docId] = [
                        'column' => $columnNumber,
                        'id' => $docId,
                        'title' => $docData['title'],
                        'total_score' => $doc->TotalScore ?? $doc['TotalScore']
                    ];
                    
                    // Get criteria scores for this document
                    $docScores = $doc->criteria ?? $doc['criteria'];

                    // Group scores by document ID and criteria ID
                    foreach ($docScores as $scoreItem) {
                        $criteriaId = (int)$scoreItem['criteria_id'];
                        $score = (int)$scoreItem['score'];
                        
                        if (!isset($scoresByDoc[$docId])) {
                            $scoresByDoc[$docId] = [];
                        }
                        $scoresByDoc[$docId][$criteriaId] = $score;
                        
                        // Map to column number for this document
                        if (isset($criteriaScores[$criteriaId])) {
                            $criteriaScores[$criteriaId]['scores'][$columnNumber] = $score;
                        }
                        
                        // Track Quality Presentation scores
                        $criteriaName = $scoreItem['name'] ?? '';
                        if (stripos($criteriaName, 'Quality of Presentation') !== false) {
                            if (!isset($summaryReport['quality_presentation_totals'][$docId])) {
                                $summaryReport['quality_presentation_totals'][$docId] = [
                                    'doc_id' => $docId,
                                    'title' => $docData['title'],
                                    'total_score' => 0,
                                    'column' => $columnNumber
                                ];
                            }
                            $summaryReport['quality_presentation_totals'][$docId]['total_score'] += $score;
                        }
                    }
                }
                
                // REBUILD TOTAL ROW IN CORRECT COLUMN ORDER
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
                    
                    if (isset($addedCriteriaNames[$criteriaName])) {
                        continue;
                    }
                    
                    $row = [
                        'name' => $criteriaName,
                        'percentage' => (int)$criterion['percentage'],
                        'scores' => []
                    ];
                    
                    // Add scores in correct column order
                    foreach ($documentIds as $docId) {
                        $column = $documentColumns[$docId];
                        $score = 0;
                        
                        if (isset($scoresByDoc[$docId]) && isset($scoresByDoc[$docId][$criteriaId])) {
                            $score = $scoresByDoc[$docId][$criteriaId];
                        }
                        
                        $row['scores'][$column] = $score;
                    }
                    
                    $evaluatorSheet['criteria_rows'][] = $row;
                    $addedCriteriaNames[$criteriaName] = true;
                }
                
                // CALCULATE RANK ROW FOR THIS EVALUATOR
                $rankRow = ['Rank'];
                $scoresForRanking = [];

                // Collect scores in column order
                foreach ($documentIds as $docId) {
                    $column = $documentColumns[$docId];
                    $totalScore = $evaluatorSheet['documents'][$docId]['total_score'] ?? 0;
                    $scoresForRanking[] = [
                        'column' => $column,
                        'score' => $totalScore,
                        'doc_id' => $docId
                    ];
                }

                // Sort by score descending for ranking
                usort($scoresForRanking, function($a, $b) {
                    return $b['score'] - $a['score'];
                });

                // Calculate ranks with normal ranking (1,2,2,3)
                $rankedScores = [];
                $currentRank = 1;
                $currentIndex = 0;
                $count = count($scoresForRanking);

                while ($currentIndex < $count) {
                    $currentScore = $scoresForRanking[$currentIndex]['score'];
                    $tieCount = 1;
                    
                    // Find all ties
                    for ($j = $currentIndex + 1; $j < $count; $j++) {
                        if ($scoresForRanking[$j]['score'] == $currentScore) {
                            $tieCount++;
                        } else {
                            break;
                        }
                    }
                    
                    // Assign same rank to all tied items
                    for ($k = 0; $k < $tieCount; $k++) {
                        $item = $scoresForRanking[$currentIndex + $k];
                        $rankedScores[$item['column']] = $currentRank;
                    }
                    
                    $currentIndex += $tieCount;
                    $currentRank++; // Always increment by 1 regardless of tie count
                }
                // Build rank row in correct column order
                foreach ($documentIds as $docId) {
                    $column = $documentColumns[$docId];
                    $rankValue = $rankedScores[$column] ?? '';
                    $rankRow[] = $rankValue;
                }

                $evaluatorSheet['rank_row'] = $rankRow;
                $summaryReport['evaluators'][] = $evaluatorSheet;
            }
            
            // STEP 9: CALCULATE CRITERIA RANKINGS
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
                    
                    // Sort by total score descending
                    usort($criterionScores, function($a, $b) {
                        return $b['total_score'] - $a['total_score'];
                    });
                    
                    // Apply 1224 standard ranking
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
        return $row['name'];  // Return the FULL event name
    }
    
    return 'RDE Symposium';  // Default fallback
}

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
        rf.id,  
        rf.title,
        sb.eval_id,
        sb.score,
        sb.doc_id as score_doc_id,
        c.id as criteria_id,
        c.name as criteria_name,
        c.percentage
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
        $docId = (int)$row['id'];  // Use rf.id as the document ID
        $scoreDocId = (int)$row['score_doc_id'];  // Verify match
        
        // Verify that the document IDs match (should always be true due to INNER JOIN)
        if ($docId != $scoreDocId) {
            error_log("WARNING: Document ID mismatch: rf.id=$docId, sb.doc_id=$scoreDocId");
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
                    'title' => $row['title']
                    // REMOVED: author, campus, category, center, display_name, center_code
                ],
                'TotalScore' => 0,
                'criteria' => []
            ];
        }
        
        // Add criteria - use score from score_board
        $docsByEval[$evalId][$docId]['criteria'][] = [
            'criteria_id' => (int)$row['criteria_id'],
            'name' => $row['criteria_name'],
            'percentage' => (int)$row['percentage'],
            'score' => (int)$row['score']  // Score from score_board
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
        rf.id,  
        rf.title,
        sb.eval_id,
        sb.score,
        sb.doc_id as score_doc_id,  
        c.id as criteria_id,
        c.name as criteria_name,
        c.percentage
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
        $docId = (int)$row['id'];  // Use rf.id as the document ID
        $scoreDocId = (int)$row['score_doc_id'];  // Verify match
        
        // Verify that the document IDs match (should always be true due to INNER JOIN)
        if ($docId != $scoreDocId) {
            error_log("WARNING: Document ID mismatch: rf.id=$docId, sb.doc_id=$scoreDocId");
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
                    'title' => $row['title']
                    // REMOVED: author, campus, category, center, display_name, center_code
                ],
                'TotalScore' => 0,
                'criteria' => []
            ];
        }
        
        // Add criteria - use score from score_board
        $docsByEval[$evalId][$docId]['criteria'][] = [
            'criteria_id' => (int)$row['criteria_id'],
            'name' => $row['criteria_name'],
            'percentage' => (int)$row['percentage'],
            'score' => (int)$row['score']  // Score from score_board
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

// GET FINAL CONSOLIDATED RANK (1224 STANDARD)
if(isset($_POST['getFinalRank'])) {
    $response = ['success' => false, 'data' => null, 'error' => ''];
    
    if($con = new mysqli($host, $username, $pass, $dbName)) {
        $con->set_charset('utf8mb4');
        
        $eventId = $_POST['eventId'];
        $categoryId = $_POST['categoryId'];
        $isNewSystem = ($eventId >= 13);
        
        try {
            // STEP 1: GET EVALUATOR DATA
            $evaluatorData = [];
            if ($isNewSystem) {
                $evaluatorData = getEvalByCenter($con, $eventId, $categoryId);
            } else {
                $evaluatorData = getEvalByCategory($con, $eventId, $categoryId);
            }
            
            if (empty($evaluatorData)) {
                throw new Exception('No evaluator data found');
            }
            
            // STEP 2: COLLECT ALL UNIQUE DOCUMENTS
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
            
            // STEP 3: SORT DOCUMENTS BY TITLE
            uasort($allDocuments, function($a, $b) {
                return strcmp($a['title'], $b['title']);
            });
            
            $documentIds = array_keys($allDocuments);
            $documentColumns = [];
            foreach ($documentIds as $index => $docId) {
                $documentColumns[$docId] = $index + 1;
            }
            
            // STEP 4: CALCULATE FINAL RANK FOR EACH EVALUATOR
            $finalRankRows = [];
            
            foreach ($evaluatorData as $evalIndex => $evalItem) {
                $evaluator = $evalItem->evaluator ?? $evalItem['evaluator'];
                $evalId = $evaluator['id'] ?? $evaluator->id;
                $docs = $evalItem->docs ?? $evalItem['docs'];
                
                // Create document score map
                $docScores = [];
                foreach ($docs as $doc) {
                    $docId = $doc->file['id'] ?? $doc['file']['id'];
                    $docScores[$docId] = $doc->TotalScore ?? $doc['TotalScore'];
                }
                
                // STEP 4a: Calculate ranks based on scores (with ties)
                $scoreItems = [];
                foreach ($documentIds as $docId) {
                    $scoreItems[] = [
                        'doc_id' => $docId,
                        'score' => $docScores[$docId] ?? 0,
                        'column' => $documentColumns[$docId]
                    ];
                }
                
                // Sort by score descending
                usort($scoreItems, function($a, $b) {
                    return $b['score'] - $a['score'];
                });
                
                // Assign ranks (e.g., 1, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 6)
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
                
                // STEP 4b: Create array of documents with their rank
                $rankedDocs = [];
                foreach ($documentIds as $docId) {
                    $rankedDocs[] = [
                        'doc_id' => $docId,
                        'rank' => $ranks[$docId],
                        'column' => $documentColumns[$docId]
                    ];
                }
                
                // STEP 4c: Sort by rank (and column for stability)
                usort($rankedDocs, function($a, $b) {
                    if ($a['rank'] == $b['rank']) {
                        return $a['column'] - $b['column'];
                    }
                    return $a['rank'] - $b['rank'];
                });
                
                // STEP 4d: Group by rank
                $rankGroups = [];
                foreach ($rankedDocs as $item) {
                    $rank = $item['rank'];
                    if (!isset($rankGroups[$rank])) {
                        $rankGroups[$rank] = [];
                    }
                    $rankGroups[$rank][] = $item['doc_id'];
                }
                
                // STEP 4e: Calculate final rank for each rank group
                // The final ranks must be consecutive numbers
                $finalRanks = [];
                $groupPosition = 1;
                
                foreach ($rankGroups as $rank => $groupDocIds) {
                    $groupSize = count($groupDocIds);
                    
                    if ($groupSize == 1) {
                        // Single document - final rank is the group position
                        foreach ($groupDocIds as $docId) {
                            $finalRanks[$docId] = $groupPosition;
                        }
                    } else {
                        // Multiple documents - average the group positions
                        // Sum of positions from $groupPosition to $groupPosition + $groupSize - 1
                        $sumOfPositions = 0;
                        for ($pos = $groupPosition; $pos < $groupPosition + $groupSize; $pos++) {
                            $sumOfPositions += $pos;
                        }
                        $averagePosition = $sumOfPositions / $groupSize;
                        
                        // Format to 1 decimal if needed
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
                
                // STEP 4f: Create final rank row in column order
                $finalRankRow = [];
                foreach ($documentIds as $docId) {
                    $finalRankRow[$documentColumns[$docId]] = $finalRanks[$docId] ?? '';
                }
                
                $finalRankRows[$evalId] = $finalRankRow;
            }
            
            // STEP 5: BUILD RESPONSE
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

//GET AVERAGE RANK ACROSS ALL EVALUATORS
if(isset($_POST['getAverageRank'])) {
    $response = ['success' => false, 'data' => null, 'error' => ''];
    
    if($con = new mysqli($host, $username, $pass, $dbName)) {
        $con->set_charset('utf8mb4');
        
        $eventId = $_POST['eventId'];
        $categoryId = $_POST['categoryId'];
        $isNewSystem = ($eventId >= 13);
        
        try {
            // STEP 1: GET EVENT AND CATEGORY DETAILS
            $eventName = getEventName($con, $eventId);
            
            // Get category/center name
            $categoryName = '';
            $systemType = $isNewSystem ? 'Center' : 'Category';
            $centerCode = '';
            
            if ($categoryId && $categoryId != '0') {
                if ($isNewSystem) {
                    $catQuery = "SELECT name, code FROM center WHERE id = ?";
                    $catStmt = $con->prepare($catQuery);
                    $catStmt->bind_param("i", $categoryId);
                    $catStmt->execute();
                    $catResult = $catStmt->get_result();
                    if ($catRow = $catResult->fetch_assoc()) {
                        $categoryName = $catRow['name'];
                        $centerCode = $catRow['code'] ?? '';
                    }
                    $catStmt->close();
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
            } else {
                $categoryName = $isNewSystem ? 'All Centers' : 'All Categories';
            }
            
            // STEP 2: GET EVALUATOR DATA
            $evaluatorData = [];
            if ($isNewSystem) {
                $evaluatorData = getEvalByCenter($con, $eventId, $categoryId);
            } else {
                $evaluatorData = getEvalByCategory($con, $eventId, $categoryId);
            }
            
            if (empty($evaluatorData)) {
                throw new Exception('No evaluator data found');
            }
            
            // STEP 3: COLLECT ALL UNIQUE DOCUMENTS
            $allDocuments = [];
            $documentColumns = [];
            
            foreach ($evaluatorData as $evalItem) {
                $docs = $evalItem->docs ?? $evalItem['docs'];
                foreach ($docs as $doc) {
                    $docId = $doc->file['id'] ?? $doc['file']['id'];
                    if (!isset($allDocuments[$docId])) {
                        $allDocuments[$docId] = [
                            'id' => $docId,
                            'title' => $doc->file['title'] ?? $doc['file']['title'],
                            'author' => $doc->file['author'] ?? $doc['file']['author'] ?? '',
                            'campus' => $doc->file['campus'] ?? $doc['file']['campus'] ?? '',
                            'category' => $doc->file['category'] ?? $doc['file']['category'] ?? '',
                            'center' => $doc->file['center'] ?? $doc['file']['center'] ?? ''
                        ];
                    }
                }
            }
            
            // Sort documents and assign columns
            $documentIds = array_keys($allDocuments);
            sort($documentIds);
            
            foreach ($documentIds as $index => $docId) {
                $documentColumns[$docId] = $index + 1;
            }
            
            // STEP 4: CALCULATE RANKS PER EVALUATOR
            $evaluatorRanks = [];
            $allRankings = []; // Store all ranks for averaging
            
            foreach ($evaluatorData as $evalIndex => $evalItem) {
                $evaluator = $evalItem->evaluator ?? $evalItem['evaluator'];
                $docs = $evalItem->docs ?? $evalItem['docs'];
                $evalId = $evaluator['id'] ?? $evaluator->id;
                $evalName = $evaluator['fullname'] ?? $evaluator->fullname;
                
                // Create document score map for this evaluator
                $docScores = [];
                foreach ($docs as $doc) {
                    $docId = $doc->file['id'] ?? $doc['file']['id'];
                    $docScores[$docId] = $doc->TotalScore ?? $doc['TotalScore'];
                }
                
                // Prepare scores for ranking
                $scoresForRanking = [];
                foreach ($documentIds as $docId) {
                    $score = $docScores[$docId] ?? 0;
                    $scoresForRanking[] = [
                        'doc_id' => $docId,
                        'score' => $score,
                        'column' => $documentColumns[$docId]
                    ];
                }
                
                // Sort by score descending
                usort($scoresForRanking, function($a, $b) {
                    return $b['score'] - $a['score'];
                });
                
                // Calculate ranks with tie handling
                $currentIndex = 0;
                $count = count($scoresForRanking);
                
                while ($currentIndex < $count) {
                    $tieGroup = [$scoresForRanking[$currentIndex]];
                    $tieCount = 1;
                    
                    // Find all ties
                    for ($j = $currentIndex + 1; $j < $count; $j++) {
                        if ($scoresForRanking[$j]['score'] == $scoresForRanking[$currentIndex]['score']) {
                            $tieGroup[] = $scoresForRanking[$j];
                            $tieCount++;
                        } else {
                            break;
                        }
                    }
                    
                    // Assign same rank to all tied items
                    $rank = $currentIndex + 1;
                    
                    foreach ($tieGroup as $item) {
                        $docId = $item['doc_id'];
                        
                        // Store per-evaluator rank
                        if (!isset($evaluatorRanks[$docId])) {
                            $evaluatorRanks[$docId] = [];
                        }
                        
                        $evaluatorRanks[$docId][] = [
                            'evaluator_id' => $evalId,
                            'evaluator_name' => $evalName,
                            'evaluator_number' => $evalIndex + 1,
                            'rank' => $rank,
                            'score' => $item['score']
                        ];
                        
                        // Store for averaging
                        if (!isset($allRankings[$docId])) {
                            $allRankings[$docId] = [];
                        }
                        $allRankings[$docId][] = $rank;
                    }
                    
                    $currentIndex += $tieCount;
                }
            }
            
            // STEP 5: CALCULATE AVERAGE RANKS
            $averageRanks = [];
            foreach ($documentIds as $docId) {
                if (isset($allRankings[$docId]) && !empty($allRankings[$docId])) {
                    $ranks = $allRankings[$docId];
                    $sum = array_sum($ranks);
                    $count = count($ranks);
                    $average = $sum / $count;
                    
                    // Format to 1 decimal place
                    $formattedAverage = round($average, 1);
                    
                    $averageRanks[$docId] = [
                        'doc_id' => $docId,
                        'title' => $allDocuments[$docId]['title'],
                        'column' => $documentColumns[$docId],
                        'ranks' => $ranks,
                        'average' => $average,
                        'formatted_average' => $formattedAverage,
                        'sum' => $sum,
                        'count' => $count
                    ];
                }
            }
            
            // Sort average ranks by average (lower is better)
            uasort($averageRanks, function($a, $b) {
                if ($a['average'] == $b['average']) return 0;
                return ($a['average'] < $b['average']) ? -1 : 1;
            });
            
            // Add final rank position based on average
            $finalPosition = 1;
            foreach ($averageRanks as $docId => &$rankData) {
                $rankData['final_rank'] = $finalPosition++;
            }
            
            // STEP 6: BUILD RESPONSE
            $response['success'] = true;
            $response['data'] = [
                'event' => [
                    'name' => $eventName,
                    'id' => $eventId
                ],
                'category' => [
                    'name' => $categoryName,
                    'type' => $systemType,
                    'code' => $centerCode,
                    'id' => $categoryId
                ],
                'documents' => $allDocuments,
                'document_columns' => $documentColumns,
                'evaluator_ranks' => $evaluatorRanks,
                'average_ranks' => $averageRanks,
                'summary' => [
                    'total_evaluators' => count($evaluatorData),
                    'total_documents' => count($documentIds),
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