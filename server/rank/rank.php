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
    
    if($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventId = $_POST['eventId'];
        $categoryId = $_POST['categoryId']; // This is center_id for new system, category_id for old system
        
        // Determine system type based on event ID
        $isNewSystem = ($eventId >= 13);
        
        // Get evaluators for the specific category/center
        if ($isNewSystem) {
            // NEW SYSTEM: Get by center
            if ($categoryId > 0) {
                // Get center details
                $centerQuery = "SELECT name, code FROM center WHERE id = ?";
                $centerStmt = $con->prepare($centerQuery);
                $centerStmt->bind_param("i", $categoryId);
                $centerStmt->execute();
                $centerResult = $centerStmt->get_result();
                
                if ($centerRow = $centerResult->fetch_assoc()) {
                    $centerName = $centerRow['name'];
                    $centerCode = $centerRow['code'];
                    
                    // Get evaluators assigned to this center for this event
                    $evalQuery = "SELECT DISTINCT
                        evaluator.id,
                        evaluator.fullname
                    FROM evaluator
                    WHERE evaluator.eventid = ?
                    AND (evaluator.center_id = ? OR evaluator.center_id IS NULL OR evaluator.center_id = 0)
                    ORDER BY evaluator.fullname";
                    
                    $evalStmt = $con->prepare($evalQuery);
                    $evalStmt->bind_param("ii", $eventId, $categoryId);
                    $evalStmt->execute();
                    $evalResult = $evalStmt->get_result();
                    
                    while($row = $evalResult->fetch_assoc()) {
                        $eval = new stdClass();
                        $eval->evaluator = $row;
                        $eval->docs = [];
                        
                        // Get documents for this evaluator within the selected center
                        // Use LIKE to match center name with different formats
                        $docQuery = "SELECT 
                            rf.id,
                            rf.title,
                            rf.author,
                            rf.campus,
                            rf.category,
                            rf.center,
                            rf.center as display_name,
                            ? as center_code
                        FROM researchfile rf
                        INNER JOIN score_board sb ON rf.id = sb.doc_id
                        INNER JOIN endorsement e ON rf.endorsementid = e.id
                        WHERE sb.eval_id = ?
                        AND rf.event_id = ?
                        AND (rf.center LIKE ? OR rf.center LIKE ?)
                        AND e.status = 'accepted'
                        GROUP BY rf.id";
                        
                        $docStmt = $con->prepare($docQuery);
                        
                        // multiple patterns to match the center
                        $centerPattern1 = "%" . $centerName . "%";
                        $centerPattern2 = "%" . $centerCode . "%";
                        
                        $docStmt->bind_param("siiss", $centerCode, $row['id'], $eventId, $centerPattern1, $centerPattern2);
                        $docStmt->execute();
                        $docResult = $docStmt->get_result();
                        
                        while($docRow = $docResult->fetch_assoc()) {
                            $doc = new stdClass();
                            $doc->file = $docRow;
                            $doc->TotalScore = 0;
                            $doc->criteria = [];
                            
                            // Get scores for this document by this evaluator
                            $scoreQuery = "SELECT 
                                c.id as criteria_id,
                                c.name,
                                c.percentage,
                                sb.score
                            FROM score_board sb
                            LEFT JOIN criteria c ON sb.criteria_id = c.id
                            WHERE sb.doc_id = ?
                            AND sb.eval_id = ?
                            ORDER BY c.id";
                            
                            $scoreStmt = $con->prepare($scoreQuery);
                            $scoreStmt->bind_param("ii", $docRow['id'], $row['id']);
                            $scoreStmt->execute();
                            $scoreResult = $scoreStmt->get_result();
                            
                            $rawTotal = 0;
                            
                            while($scoreRow = $scoreResult->fetch_assoc()) {
                                $doc->criteria[] = $scoreRow;
                                $rawTotal += $scoreRow['score'];
                            }
                            
                            $doc->TotalScore = $rawTotal;
                            $eval->docs[] = $doc;
                        }
                        
                        // Only add evaluator if they have documents in this center
                        if (count($eval->docs) > 0) {
                            $response[] = $eval;
                        }
                    }
                }
            }
        } else {
            // OLD SYSTEM: Get by category
            if ($categoryId > 0) {
                // Get category details
                $categoryQuery = "SELECT name FROM category WHERE id = ?";
                $catStmt = $con->prepare($categoryQuery);
                $catStmt->bind_param("i", $categoryId);
                $catStmt->execute();
                $catResult = $catStmt->get_result();
                
                if ($catRow = $catResult->fetch_assoc()) {
                    $categoryName = $catRow['name'];
                    
                    // Get evaluators assigned to this category for this event
                    $evalQuery = "SELECT DISTINCT
                        evaluator.id,
                        evaluator.fullname
                    FROM evaluator
                    WHERE evaluator.eventid = ?
                    AND (evaluator.category = ? OR evaluator.category IS NULL OR evaluator.category = '')
                    ORDER BY evaluator.fullname";
                    
                    $evalStmt = $con->prepare($evalQuery);
                    $evalStmt->bind_param("is", $eventId, $categoryName);
                    $evalStmt->execute();
                    $evalResult = $evalStmt->get_result();
                    
                    while($row = $evalResult->fetch_assoc()) {
                        $eval = new stdClass();
                        $eval->evaluator = $row;
                        $eval->docs = [];
                        
                        // Get documents for this evaluator within the selected category
                        $docQuery = "SELECT 
                            rf.id,
                            rf.title,
                            rf.author,
                            rf.campus,
                            rf.category,
                            rf.center,
                            rf.category as display_name,
                            '' as center_code
                        FROM researchfile rf
                        INNER JOIN score_board sb ON rf.id = sb.doc_id
                        INNER JOIN endorsement e ON rf.endorsementid = e.id
                        WHERE sb.eval_id = ?
                        AND rf.event_id = ?
                        AND (rf.category = ? OR rf.category LIKE ?)
                        AND e.status = 'accepted'
                        GROUP BY rf.id";
                        
                        $docStmt = $con->prepare($docQuery);
                        $categoryPattern = "%" . $categoryName . "%";
                        $docStmt->bind_param("iiss", $row['id'], $eventId, $categoryName, $categoryPattern);
                        $docStmt->execute();
                        $docResult = $docStmt->get_result();
                        
                        while($docRow = $docResult->fetch_assoc()) {
                            $doc = new stdClass();
                            $doc->file = $docRow;
                            $doc->TotalScore = 0;
                            $doc->criteria = [];
                            
                            // Get scores for this document by this evaluator
                            $scoreQuery = "SELECT 
                                c.id as criteria_id,
                                c.name,
                                c.percentage,
                                sb.score
                            FROM score_board sb
                            LEFT JOIN criteria c ON sb.criteria_id = c.id
                            WHERE sb.doc_id = ?
                            AND sb.eval_id = ?
                            ORDER BY c.id";
                            
                            $scoreStmt = $con->prepare($scoreQuery);
                            $scoreStmt->bind_param("ii", $docRow['id'], $row['id']);
                            $scoreStmt->execute();
                            $scoreResult = $scoreStmt->get_result();
                            
                            $rawTotal = 0;
                            
                            while($scoreRow = $scoreResult->fetch_assoc()) {
                                $doc->criteria[] = $scoreRow;
                                $rawTotal += $scoreRow['score'];
                            }
                            
                            $doc->TotalScore = $rawTotal;
                            $eval->docs[] = $doc;
                        }
                        
                        // Only add evaluator if they have documents in this category
                        if (count($eval->docs) > 0) {
                            $response[] = $eval;
                        }
                    }
                }
            }
        }
        
        // If no data found, return empty array
        if (empty($response)) {
            // Log for debugging
            error_log("No data found for eventId: $eventId, categoryId: $categoryId, isNewSystem: " . ($isNewSystem ? 'true' : 'false'));
        }
        if (ob_get_length() > 0) {
            ob_end_flush();
        }
    }
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}

/**
 * GENERATE SUMMARY REPORT - EXACT EXCEL FORMAT
 */
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
                'criteria' => $criteriaList,  // <-- CRITICAL: Add this line
                'evaluators' => [],
                'quality_presentation_totals' => [],
                'rankings' => []
            ];
            
            // STEP 6: ORGANIZE DOCUMENTS BY COLUMN (CRITICAL - Excel format)
            // First, collect ALL unique documents across ALL evaluators
            $allDocuments = [];
            $documentColumns = []; // Maps document_id -> column number
            
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
            
            // Sort documents by ID to ensure consistent column mapping
            $documentIds = array_keys($allDocuments);
            sort($documentIds);
            
            // Assign column numbers (1, 2, 3...)
            foreach ($documentIds as $index => $docId) {
                $documentColumns[$docId] = $index + 1;
            }
            
            // STEP 7: PROCESS EACH EVALUATOR - EXACT EXCEL ROW STRUCTURE
            foreach ($evaluatorData as $evalIndex => $evalItem) {
                $evaluator = $evalItem->evaluator ?? $evalItem['evaluator'];
                $docs = $evalItem->docs ?? $evalItem['docs'];
                
                // Initialize evaluator sheet with EXACT Excel rows
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
                        'scores' => []  // This will store scores keyed by column number
                    ];
                }

                // NEW: Initialize document score lookup array
                $scoresByDoc = []; // Will store scores by doc_id and criteria_id

                // Create a lookup map for quick criteria identification by name
                $criteriaNameMap = [];
                foreach ($criteriaList as $criterion) {
                    $criteriaNameMap[$criterion['name']] = $criterion['id'];
                }
                
                // Map document scores to their column positions
                foreach ($docs as $doc) {
                    $docData = $doc->file ?? $doc['file'];
                    $docId = $docData['id'];
                    $columnNumber = $documentColumns[$docId];
                    
                    // Add to headers
                    $evaluatorSheet['headers']['criteria_row'][] = $columnNumber;
                    $evaluatorSheet['headers']['title_row'][] = $docData['title'];
                    
                    // Store document info
                    $evaluatorSheet['documents'][$docId] = [
                        'column' => $columnNumber,
                        'id' => $docId,
                        'title' => $docData['title'],
                        'total_score' => $doc->TotalScore ?? $doc['TotalScore']
                    ];
                    
                    // Get criteria scores for this document - USE DOC_ID TO GROUP SCORES
                    $docScores = $doc->criteria ?? $doc['criteria'];

                    // Group scores by document ID first, then by criteria
                    foreach ($docScores as $scoreItem) {
                        $criteriaId = (int)$scoreItem['criteria_id'];
                        $criteriaName = $scoreItem['name'] ?? '';
                        $score = (int)$scoreItem['score'];
                        
                        // Store scores keyed by document ID and criteria ID
                        if (!isset($scoresByDoc[$docId])) {
                            $scoresByDoc[$docId] = [];
                        }
                        $scoresByDoc[$docId][$criteriaId] = $score;
                        
                        // Map to column number for this document
                        if (isset($criteriaScores[$criteriaId])) {
                            $criteriaScores[$criteriaId]['scores'][$columnNumber] = $score;
                        }
                        
                        // Track Quality Presentation scores for ranking - using doc_id
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
                    
                    // Add to total row
                    $evaluatorSheet['total_row'][] = $doc->TotalScore ?? $doc['TotalScore'];
                }
                
                // Build criteria rows in EXACT order - USING DOC_ID TO GET SCORES
                $evaluatorSheet['criteria_rows'] = [];
                $addedCriteriaNames = [];

                // For each unique criterion
                foreach ($criteriaList as $criterion) {
                    $criteriaId = (int)$criterion['id'];
                    $criteriaName = $criterion['name'];
                    
                    // Skip duplicates
                    if (isset($addedCriteriaNames[$criteriaName])) {
                        continue;
                    }
                    
                    // Create ONE row per unique criterion
                    $row = [
                        'name' => $criteriaName,
                        'percentage' => (int)$criterion['percentage'],
                        'scores' => []
                    ];
                    
                    // For each document column
                    foreach ($documentIds as $docId) {
                        $column = $documentColumns[$docId];
                        
                        // Get the score for this document and criteria
                        $score = 0;
                        
                        // Check if we have scores for this document
                        if (isset($scoresByDoc[$docId]) && isset($scoresByDoc[$docId][$criteriaId])) {
                            $score = $scoresByDoc[$docId][$criteriaId];
                        } else {
                            // Try to find by criteria name
                            foreach ($scoresByDoc[$docId] ?? [] as $cid => $s) {
                                foreach ($criteriaList as $c) {
                                    if ($c['id'] == $cid && $c['name'] == $criteriaName) {
                                        $score = $s;
                                        break 2;
                                    }
                                }
                            }
                        }
                        
                        $row['scores'][$column] = $score;
                    }
                    
                    $evaluatorSheet['criteria_rows'][] = $row;
                    $addedCriteriaNames[$criteriaName] = true;
                }

                // DEBUG: Log the scores for first document
                if ($evalIndex == 0 && !empty($documentIds)) {
                    $firstDocId = $documentIds[0];
                    $firstColumn = $documentColumns[$firstDocId];
                    error_log("Scores for Document $firstDocId (Column $firstColumn): " . json_encode($scoresByDoc[$firstDocId] ?? []));
                }
                
                $summaryReport['evaluators'][] = $evaluatorSheet;
            }
            
            // STEP 8: CALCULATE QUALITY PRESENTATION ROW AND RANKS
            // ALWAYS initialize the quality_presentation_row
            $qualityPresentationRow = [
                'name' => 'Quality of Presentation',
                'scores' => []
            ];

            // Initialize all columns with 0
            foreach ($documentIds as $docId) {
                $column = $documentColumns[$docId];
                $qualityPresentationRow['scores'][$column] = 0;
            }

            // Fill in actual scores if they exist
            if (!empty($summaryReport['quality_presentation_totals'])) {
                foreach ($summaryReport['quality_presentation_totals'] as $docId => $data) {
                    $column = $data['column'];
                    $qualityPresentationRow['scores'][$column] = $data['total_score'];
                }
                
                // Calculate rankings
                $rankings = [];
                foreach ($summaryReport['quality_presentation_totals'] as $docId => $data) {
                    $rankings[] = [
                        'doc_id' => $docId,
                        'title' => $data['title'],
                        'total_score' => $data['total_score'],
                        'column' => $data['column']
                    ];
                }
                
                // Sort by total score descending
                usort($rankings, function($a, $b) {
                    return $b['total_score'] - $a['total_score'];
                });
                
                // Apply tie ranks
                $rankedData = [];
                $currentIndex = 0;
                $count = count($rankings);
                
                while ($currentIndex < $count) {
                    $tieGroup = [$rankings[$currentIndex]];
                    $tieSum = $currentIndex + 1;
                    
                    for ($j = $currentIndex + 1; $j < $count; $j++) {
                        if ($rankings[$j]['total_score'] == $rankings[$currentIndex]['total_score']) {
                            $tieGroup[] = $rankings[$j];
                            $tieSum += ($j + 1);
                        } else {
                            break;
                        }
                    }
                    
                    $averageRank = $tieSum / count($tieGroup);
                    
                    foreach ($tieGroup as $item) {
                        $rankedData[] = [
                            'rank' => round($averageRank, 1),
                            'doc_id' => $item['doc_id'],
                            'title' => $item['title'],
                            'total_score' => $item['total_score'],
                            'column' => $item['column']
                        ];
                    }
                    
                    $currentIndex += count($tieGroup);
                }
                
                $summaryReport['rankings'] = $rankedData;
            }

            // ALWAYS set the quality_presentation_row
            $summaryReport['quality_presentation_row'] = $qualityPresentationRow;
            
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