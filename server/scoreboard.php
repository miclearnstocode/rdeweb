<?php
include('db.php');
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set proper JSON header
header('Content-Type: application/json; charset=utf-8');

// Turn off error display for production
ini_set('display_errors', 0);
error_reporting(0);

// Map category names to IDs
function getCategoryId($categoryName) {
    $categoryMap = [
        'Social Science' => 1,
        'Natural / Biological' => 2,
        'Natural/Biological' => 2,
        'Food' => 3,
        'Development' => 4,
        'Extension' => 5
    ];
    
    return $categoryMap[$categoryName] ?? null;
}

if (isset($_POST['scoreboard_req'])) {
    $response = [];
    
    try {
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            // Check connection
            if ($con->connect_error) {
                throw new Exception("Database connection failed: " . $con->connect_error);
            }
            
            // Check if user is logged in
            if (!isset($_SESSION['userId'])) {
                echo json_encode(['error' => 'User not logged in']);
                exit();
            }
            
            $userId = $_SESSION['userId'];
            
            // Get the docId
            if (!isset($_POST['docId'])) {
                echo json_encode(['error' => 'Document ID not provided']);
                exit();
            }
            
            $docId = $_POST['docId'];
            
            $eventIdFromRequest = isset($_POST['eventId']) ? intval($_POST['eventId']) : null;
            

            $studentQuery = "SELECT 
                srp.event_id, 
                srp.event, 
                srp.category,
                srp.status
            FROM student_research_papers srp
            WHERE srp.id = ?";
            
            $studentStmt = $con->prepare($studentQuery);
            if ($studentStmt) {
                $studentStmt->bind_param("i", $docId);
                $studentStmt->execute();
                $studentResult = $studentStmt->get_result();
                
                if ($row = $studentResult->fetch_assoc()) {
                    // Document found in student_research_papers
                    $eventId = $row['event_id'];
                    $eventName = $row['event'] ?? '';
                    $categoryName = $row['category'] ?? '';
                    $docStatus = $row['status'];
                    $sourceTable = 'student_research_papers';
                    
                    error_log("Scoreboard - Found in student_research_papers: Doc ID $docId, Event ID $eventId, Category: $categoryName");
                    
                    $studentStmt->close();
                    
                    // Get the evaluator's center_id
                    $evalQuery = "SELECT center_id FROM evaluator WHERE id = ?";
                    $evalStmt = $con->prepare($evalQuery);
                    if (!$evalStmt) {
                        throw new Exception("Failed to prepare evaluator query: " . $con->error);
                    }
                    $evalStmt->bind_param("i", $userId);
                    $evalStmt->execute();
                    $evalResult = $evalStmt->get_result();
                    
                    if (!$evalRow = $evalResult->fetch_assoc()) {
                        echo json_encode(['error' => 'Evaluator not found']);
                        exit();
                    }
                    
                    $centerId = $evalRow['center_id'];
                    $evalStmt->close();
                    
                    // Determine if it's a Symposium
                    $isSymposium = false;
                    if (!empty($eventName) && stripos($eventName, 'symposium') !== false) {
                        $isSymposium = true;
                    }
                    
                    // Get criteria based on event type
                    if ($isSymposium) {
                        // SYMPOSIUM: Use category
                        $categoryId = getCategoryId($categoryName);
                        
                        if (empty($categoryId)) {
                            // If category is not mapped, get all criteria for the event
                            $query = "SELECT 
                                criteria.id as criteria_id, 
                                criteria.name, 
                                criteria.description, 
                                criteria.percentage 
                            FROM criteria
                            WHERE criteria.event_id = ?
                            ORDER BY criteria.id";
                            
                            $statement = $con->prepare($query);
                            if ($statement) {
                                $statement->bind_param("i", $eventId);
                                $statement->execute();
                                $result = $statement->get_result();
                                
                                while ($val = $result->fetch_assoc()) {
                                    $response[] = $val;
                                }
                                $statement->close();
                            }
                        } else if (in_array($categoryId, [1, 2, 3, 4])) {
                            // Research categories (1-4) share criteria
                            $query = "SELECT 
                                criteria.id as criteria_id, 
                                criteria.name, 
                                criteria.description, 
                                criteria.percentage 
                            FROM criteria
                            WHERE criteria.event_id = ? 
                            AND criteria.category_id IN (1, 2, 3, 4)
                            ORDER BY criteria.id";
                            
                            $statement = $con->prepare($query);
                            if ($statement) {
                                $statement->bind_param("i", $eventId);
                                $statement->execute();
                                $result = $statement->get_result();
                                
                                while ($val = $result->fetch_assoc()) {
                                    $response[] = $val;
                                }
                                $statement->close();
                            }
                        } else if ($categoryId == 5) {
                            // Extension criteria
                            $query = "SELECT 
                                criteria.id as criteria_id, 
                                criteria.name, 
                                criteria.description, 
                                criteria.percentage 
                            FROM criteria
                            WHERE criteria.event_id = ? 
                            AND criteria.category_id = 5
                            ORDER BY criteria.id";
                            
                            $statement = $con->prepare($query);
                            if ($statement) {
                                $statement->bind_param("i", $eventId);
                                $statement->execute();
                                $result = $statement->get_result();
                                
                                while ($val = $result->fetch_assoc()) {
                                    $response[] = $val;
                                }
                                $statement->close();
                            }
                        } else {
                            // Fallback: try to get criteria for this category
                            $query = "SELECT 
                                criteria.id as criteria_id, 
                                criteria.name, 
                                criteria.description, 
                                criteria.percentage 
                            FROM criteria
                            WHERE criteria.event_id = ? 
                            AND criteria.category_id = ?
                            ORDER BY criteria.id";
                            
                            $statement = $con->prepare($query);
                            if ($statement) {
                                $statement->bind_param("ii", $eventId, $categoryId);
                                $statement->execute();
                                $result = $statement->get_result();
                                
                                while ($val = $result->fetch_assoc()) {
                                    $response[] = $val;
                                }
                                $statement->close();
                            }
                        }
                    } else {
                        // IN-HOUSE: Use center_id
                        $query = "SELECT 
                            criteria.id as criteria_id, 
                            criteria.name, 
                            criteria.description, 
                            criteria.percentage 
                        FROM criteria
                        WHERE criteria.event_id = ? 
                        AND criteria.center_id = ?
                        ORDER BY criteria.id";
                        
                        $statement = $con->prepare($query);
                        if ($statement) {
                            $statement->bind_param("ii", $eventId, $centerId);
                            $statement->execute();
                            $result = $statement->get_result();
                            
                            while ($val = $result->fetch_assoc()) {
                                $response[] = $val;
                            }
                            $statement->close();
                        }
                    }
                    
                    $con->close();
                    
                    // Ensure we always return a valid JSON array
                    if (!is_array($response)) {
                        $response = [];
                    }
                    echo json_encode($response);
                    exit();
                }
                $studentStmt->close();
            }
            
            $eventQuery = "SELECT rf.event_id, rf.event, rf.category 
                          FROM researchfile rf
                          WHERE rf.id = ?";
            $eventStmt = $con->prepare($eventQuery);
            if ($eventStmt) {
                $eventStmt->bind_param("i", $docId);
                $eventStmt->execute();
                $eventResult = $eventStmt->get_result();
                
                if ($row = $eventResult->fetch_assoc()) {
                    // Document found in researchfile
                    $eventId = $row['event_id'];
                    $eventName = $row['event'] ?? '';
                    $categoryName = $row['category'] ?? '';
                    $sourceTable = 'researchfile';
                    
                    error_log("Scoreboard - Found in researchfile: Doc ID $docId, Event ID $eventId, Category: $categoryName");
                    
                    $eventStmt->close();
                    
                    // Get the evaluator's center_id
                    $evalQuery = "SELECT center_id FROM evaluator WHERE id = ?";
                    $evalStmt = $con->prepare($evalQuery);
                    if (!$evalStmt) {
                        throw new Exception("Failed to prepare evaluator query: " . $con->error);
                    }
                    $evalStmt->bind_param("i", $userId);
                    $evalStmt->execute();
                    $evalResult = $evalStmt->get_result();
                    
                    if (!$evalRow = $evalResult->fetch_assoc()) {
                        echo json_encode(['error' => 'Evaluator not found']);
                        exit();
                    }
                    
                    $centerId = $evalRow['center_id'];
                    $evalStmt->close();
                    
                    // Determine if it's a Symposium
                    $isSymposium = false;
                    if (!empty($eventName) && stripos($eventName, 'symposium') !== false) {
                        $isSymposium = true;
                    }
                    
                    // Get criteria based on event type
                    if ($isSymposium) {
                        // SYMPOSIUM: Use category
                        $categoryId = getCategoryId($categoryName);
                        
                        if (empty($categoryId)) {
                            // If category is not mapped, get all criteria for the event
                            $query = "SELECT 
                                criteria.id as criteria_id, 
                                criteria.name, 
                                criteria.description, 
                                criteria.percentage 
                            FROM criteria
                            WHERE criteria.event_id = ?
                            ORDER BY criteria.id";
                            
                            $statement = $con->prepare($query);
                            if ($statement) {
                                $statement->bind_param("i", $eventId);
                                $statement->execute();
                                $result = $statement->get_result();
                                
                                while ($val = $result->fetch_assoc()) {
                                    $response[] = $val;
                                }
                                $statement->close();
                            }
                        } else if (in_array($categoryId, [1, 2, 3, 4])) {
                            // Research categories (1-4) share criteria
                            $query = "SELECT 
                                criteria.id as criteria_id, 
                                criteria.name, 
                                criteria.description, 
                                criteria.percentage 
                            FROM criteria
                            WHERE criteria.event_id = ? 
                            AND criteria.category_id IN (1, 2, 3, 4)
                            ORDER BY criteria.id";
                            
                            $statement = $con->prepare($query);
                            if ($statement) {
                                $statement->bind_param("i", $eventId);
                                $statement->execute();
                                $result = $statement->get_result();
                                
                                while ($val = $result->fetch_assoc()) {
                                    $response[] = $val;
                                }
                                $statement->close();
                            }
                        } else if ($categoryId == 5) {
                            // Extension criteria
                            $query = "SELECT 
                                criteria.id as criteria_id, 
                                criteria.name, 
                                criteria.description, 
                                criteria.percentage 
                            FROM criteria
                            WHERE criteria.event_id = ? 
                            AND criteria.category_id = 5
                            ORDER BY criteria.id";
                            
                            $statement = $con->prepare($query);
                            if ($statement) {
                                $statement->bind_param("i", $eventId);
                                $statement->execute();
                                $result = $statement->get_result();
                                
                                while ($val = $result->fetch_assoc()) {
                                    $response[] = $val;
                                }
                                $statement->close();
                            }
                        } else {
                            // Fallback: try to get criteria for this category
                            $query = "SELECT 
                                criteria.id as criteria_id, 
                                criteria.name, 
                                criteria.description, 
                                criteria.percentage 
                            FROM criteria
                            WHERE criteria.event_id = ? 
                            AND criteria.category_id = ?
                            ORDER BY criteria.id";
                            
                            $statement = $con->prepare($query);
                            if ($statement) {
                                $statement->bind_param("ii", $eventId, $categoryId);
                                $statement->execute();
                                $result = $statement->get_result();
                                
                                while ($val = $result->fetch_assoc()) {
                                    $response[] = $val;
                                }
                                $statement->close();
                            }
                        }
                    } else {
                        // IN-HOUSE: Use center_id
                        $query = "SELECT 
                            criteria.id as criteria_id, 
                            criteria.name, 
                            criteria.description, 
                            criteria.percentage 
                        FROM criteria
                        WHERE criteria.event_id = ? 
                        AND criteria.center_id = ?
                        ORDER BY criteria.id";
                        
                        $statement = $con->prepare($query);
                        if ($statement) {
                            $statement->bind_param("ii", $eventId, $centerId);
                            $statement->execute();
                            $result = $statement->get_result();
                            
                            while ($val = $result->fetch_assoc()) {
                                $response[] = $val;
                            }
                            $statement->close();
                        }
                    }
                    
                    $con->close();
                    
                    // Ensure we always return a valid JSON array
                    if (!is_array($response)) {
                        $response = [];
                    }
                    echo json_encode($response);
                    exit();
                }
                $eventStmt->close();
            }
            
            error_log("Scoreboard - Document not found: Doc ID $docId");
            echo json_encode(['error' => 'Document not found in either table']);
            exit();
            
        } else {
            throw new Exception("Could not connect to database");
        }
    } catch (Exception $e) {
        error_log("Scoreboard error: " . $e->getMessage());
        echo json_encode(['error' => $e->getMessage()]);
        exit();
    }
}

if (isset($_POST['scoreReq'])) {
    $response = [];
    
    try {
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            // Check connection
            if ($con->connect_error) {
                throw new Exception("Database connection failed: " . $con->connect_error);
            }
            
            // Check if user is logged in
            if (!isset($_SESSION['userId'])) {
                echo json_encode(['error' => 'User not logged in']);
                exit();
            }
            
            $userId = $_SESSION['userId'];
            $docId = $_POST['docId'] ?? '';
            $criteriaId = $_POST['criteria_id'] ?? 0;
            
            // CLEAN THE DOC ID - Remove query string
            if (strpos($docId, '?') !== false) {
                $docId = explode('?', $docId)[0];
            }
            if (strpos($docId, '&') !== false) {
                $docId = explode('&', $docId)[0];
            }
            $docId = (int)preg_replace('/[^0-9]/', '', $docId);
            
            if (empty($docId) || empty($criteriaId)) {
                echo json_encode([]);
                exit();
            }
            
            $isStudent = false;
            $eventId = null;
            $eventName = null;
            
            // Check student_research_papers first
            $studentCheck = "SELECT event_id, event FROM student_research_papers WHERE id = ? LIMIT 1";
            $studentStmt = $con->prepare($studentCheck);
            if ($studentStmt) {
                $studentStmt->bind_param("i", $docId);
                $studentStmt->execute();
                $studentResult = $studentStmt->get_result();
                if ($row = $studentResult->fetch_assoc()) {
                    $eventId = $row['event_id'];
                    $eventName = $row['event'];
                    $isStudent = true;
                    error_log("ScoreReq - Document found in student_research_papers: docId=$docId");
                }
                $studentStmt->close();
            }
            
            // If not found in student, check researchfile (faculty)
            if (!$eventId) {
                $facultyCheck = "SELECT event_id, event FROM researchfile WHERE id = ? LIMIT 1";
                $facultyStmt = $con->prepare($facultyCheck);
                if ($facultyStmt) {
                    $facultyStmt->bind_param("i", $docId);
                    $facultyStmt->execute();
                    $facultyResult = $facultyStmt->get_result();
                    if ($row = $facultyResult->fetch_assoc()) {
                        $eventId = $row['event_id'];
                        $eventName = $row['event'];
                        $isStudent = false;
                        error_log("ScoreReq - Document found in researchfile: docId=$docId");
                    }
                    $facultyStmt->close();
                }
            }
            
            // If no event_id found, return empty
            if (empty($eventId)) {
                error_log("ScoreReq - No event found for document ID: $docId");
                echo json_encode([]);
                exit();
            }
            
            // Check if event name contains student keywords
            if (!empty($eventName)) {
                $lowerEventName = strtolower($eventName);
                if (strpos($lowerEventName, 'undergraduate') !== false || 
                    strpos($lowerEventName, 'graduate') !== false ||
                    strpos($lowerEventName, 'student') !== false) {
                    $isStudent = true;
                    error_log("ScoreReq - Student event detected by name: $eventName");
                }
            }
            
            error_log("ScoreReq - Document ID: $docId, Event ID: $eventId, Event Name: $eventName, Is Student: " . ($isStudent ? 'Yes' : 'No'));
            
            // Get criteria event_id
            $criteriaEventQuery = "SELECT event_id FROM criteria WHERE id = ? LIMIT 1";
            $criteriaStmt = $con->prepare($criteriaEventQuery);
            $criteriaEventId = null;
            if ($criteriaStmt) {
                $criteriaStmt->bind_param("i", $criteriaId);
                $criteriaStmt->execute();
                $criteriaResult = $criteriaStmt->get_result();
                if ($row = $criteriaResult->fetch_assoc()) {
                    $criteriaEventId = $row['event_id'];
                }
                $criteriaStmt->close();
            }
            

            $checkQuery = "SELECT EXISTS(SELECT 1 FROM abstain WHERE eval_id = ? AND doc_id = ?) as Total";
            $stm = $con->prepare($checkQuery);
            $hasAbstained = false;
            if ($stm) {
                $stm->bind_param("ii", $userId, $docId);
                $stm->execute();
                $res = $stm->get_result();
                $r1 = $res->fetch_assoc();
                $hasAbstained = ($r1 && $r1['Total'] > 0);
                $stm->close();
            }
            
            if (!$hasAbstained) {

                $query = "SELECT 
                    score_board.score, 
                    score_board.id as scoreId, 
                    score_board.criteria_id
                FROM score_board
                WHERE score_board.doc_id = ? 
                AND score_board.criteria_id = ? 
                AND score_board.eval_id = ?";
                
                $statement = $con->prepare($query);
                if ($statement) {
                    $statement->bind_param("iii", $docId, $criteriaId, $userId);
                    $statement->execute();
                    $result = $statement->get_result();
                    
                    while ($val = $result->fetch_assoc()) {
                        $response[] = $val;
                    }
                    $statement->close();
                }
            }
            
            $con->close();
        }
    } catch (Exception $e) {
        error_log("Score request error: " . $e->getMessage());
        echo json_encode([]);
        exit();
    }
    
    echo json_encode($response);
    exit();
}
if (isset($_POST['scoreSave'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    try {
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            // Check connection
            if ($con->connect_error) {
                throw new Exception("Database connection failed: " . $con->connect_error);
            }
            
            // Check if user is logged in
            if (!isset($_SESSION['userId'])) {
                $response->message = 'User not logged in';
                echo json_encode($response);
                exit();
            }
            
            $userId = $_SESSION['userId'];
            $docId = $_POST['docId'] ?? 0;
            
            if (empty($docId)) {
                $response->message = 'Document ID is required';
                echo json_encode($response);
                exit();
            }
            
            $scores = $_POST['Score'] ?? []; // array
            $criteriaIds = $_POST['criteriaId'] ?? []; // array
            
            if (empty($scores) || empty($criteriaIds)) {
                $response->message = 'No scores to save';
                echo json_encode($response);
                exit();
            }
            
            // Use transaction for data consistency
            $con->begin_transaction();
            
            try {
                foreach ($criteriaIds as $key => $criteriaId) {
                    $score = $scores[$key] ?? 0;
                    
                    // Check if score already exists
                    $checkQuery = "SELECT COUNT(*) as count 
                                  FROM score_board 
                                  WHERE doc_id = ? 
                                  AND criteria_id = ? 
                                  AND eval_id = ?";
                    $checkStmt = $con->prepare($checkQuery);
                    if (!$checkStmt) {
                        throw new Exception("Failed to prepare check query: " . $con->error);
                    }
                    $checkStmt->bind_param('iii', $docId, $criteriaId, $userId);
                    $checkStmt->execute();
                    $checkResult = $checkStmt->get_result();
                    $checkRow = $checkResult->fetch_assoc();
                    $checkStmt->close();
                    
                    if ($checkRow && $checkRow['count'] > 0) {
                        // Update existing score
                        $updateQuery = "UPDATE score_board 
                                       SET score = ? 
                                       WHERE doc_id = ? 
                                       AND criteria_id = ? 
                                       AND eval_id = ?";
                        $updateStmt = $con->prepare($updateQuery);
                        if (!$updateStmt) {
                            throw new Exception("Failed to prepare update query: " . $con->error);
                        }
                        $updateStmt->bind_param("iiii", $score, $docId, $criteriaId, $userId);
                        $updateStmt->execute();
                        $updateStmt->close();
                    } else {
                        // Insert new score
                        $insertQuery = "INSERT INTO score_board (eval_id, doc_id, criteria_id, score) 
                                       VALUES (?, ?, ?, ?)";
                        $insertStmt = $con->prepare($insertQuery);
                        if (!$insertStmt) {
                            throw new Exception("Failed to prepare insert query: " . $con->error);
                        }
                        $insertStmt->bind_param("iiii", $userId, $docId, $criteriaId, $score);
                        $insertStmt->execute();
                        $insertStmt->close();
                    }
                }
                
                $con->commit();
                $response->status = true;
                $response->message = "Score saved successfully";
                
            } catch (Exception $e) {
                $con->rollback();
                throw $e;
            }
            
            $con->close();
            
        } else {
            throw new Exception("Could not connect to database");
        }
    } catch (Exception $e) {
        error_log("Score save error: " . $e->getMessage());
        $response->message = "Error saving score: " . $e->getMessage();
    }
    
    echo json_encode($response);
    exit();
}

// Mark document as presented
if (isset($_POST['markPresented'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    try {
        $docId = $_POST['docId'] ?? 0;
        $sourceTable = $_POST['sourceTable'] ?? 'researchfile';
        $isStudent = isset($_POST['isStudent']) && $_POST['isStudent'] == '1';
        
        if (empty($docId)) {
            throw new Exception('Document ID required');
        }
        
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed');
        }
        
        // Determine which table to update
        $table = $isStudent ? 'student_research_papers' : 'researchfile';
        $idColumn = $isStudent ? 'id' : 'id';
        
        $query = "UPDATE `$table` SET `completion_status` = 'completed' WHERE `$idColumn` = ?";
        $stmt = $con->prepare($query);
        $stmt->bind_param("i", $docId);
        
        if ($stmt->execute()) {
            $response->status = true;
            $response->message = 'Document marked as presented successfully';
        } else {
            throw new Exception($stmt->error);
        }
        
        $stmt->close();
        $con->close();
        
    } catch (Exception $e) {
        error_log('markPresented error: ' . $e->getMessage());
        $response->message = $e->getMessage();
    }
    
    echo json_encode($response);
    exit();
}

// Vote for best presenter
if (isset($_POST['voteBestPresenter'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    try {
        $docId = $_POST['docId'] ?? 0;
        $eventId = $_POST['eventId'] ?? 0;
        $rating = intval($_POST['rating'] ?? 0);
        $sourceTable = $_POST['sourceTable'] ?? 'researchfile';
        $evaluatorId = $_SESSION['userId'] ?? 0;
        
        if (empty($docId) || empty($eventId) || empty($evaluatorId)) {
            throw new Exception('Missing required fields');
        }
        
        if ($rating < 1 || $rating > 10) {
            throw new Exception('Rating must be between 1 and 10');
        }
        
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed');
        }
        
        // Check if already voted
        $checkQuery = "SELECT id FROM best_presenter_votes 
                       WHERE doc_id = ? AND event_id = ? AND evaluator_id = ?";
        $checkStmt = $con->prepare($checkQuery);
        $checkStmt->bind_param("iii", $docId, $eventId, $evaluatorId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            // Update existing vote
            $updateQuery = "UPDATE best_presenter_votes 
                           SET rating = ?, updated_at = NOW() 
                           WHERE doc_id = ? AND event_id = ? AND evaluator_id = ?";
            $updateStmt = $con->prepare($updateQuery);
            $updateStmt->bind_param("iiii", $rating, $docId, $eventId, $evaluatorId);
            $updateStmt->execute();
            $updateStmt->close();
        } else {
            // Insert new vote
            $insertQuery = "INSERT INTO best_presenter_votes 
                           (doc_id, event_id, evaluator_id, rating, source_table) 
                           VALUES (?, ?, ?, ?, ?)";
            $insertStmt = $con->prepare($insertQuery);
            $insertStmt->bind_param("iiiis", $docId, $eventId, $evaluatorId, $rating, $sourceTable);
            $insertStmt->execute();
            $insertStmt->close();
        }
        
        $checkStmt->close();
        $con->close();
        
        $response->status = true;
        $response->message = 'Vote recorded successfully';
        
    } catch (Exception $e) {
        error_log('voteBestPresenter error: ' . $e->getMessage());
        $response->message = $e->getMessage();
    }
    
    echo json_encode($response);
    exit();
}