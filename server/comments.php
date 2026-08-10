<?php
ob_start();
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
include('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
$con = new mysqli($host, $username, $pass, $dbName);

header('Content-Type: application/json; charset=utf-8');

function isStudentEvent($eventName, $eventId = null) {
    if (!empty($eventName)) {
        $lowerEventName = strtolower($eventName);
        if (strpos($lowerEventName, 'undergraduate') !== false || 
            strpos($lowerEventName, 'graduate') !== false ||
            strpos($lowerEventName, 'student') !== false) {
            return true;
        }
    }
    return false;
}

function getDocumentSource($con, $docId, $eventId = null) {
    $docId = (int)$docId;
    $result = null;
    
    // If eventId is provided, check if it's a student event
    if (!empty($eventId)) {
        $eventQuery = "SELECT name FROM event_list WHERE id = ? LIMIT 1";
        $eventStmt = $con->prepare($eventQuery);
        if ($eventStmt) {
            $eventStmt->bind_param("i", $eventId);
            $eventStmt->execute();
            $eventResult = $eventStmt->get_result();
            if ($row = $eventResult->fetch_assoc()) {
                $eventName = $row['name'];
                $lowerEventName = strtolower($eventName);
                if (strpos($lowerEventName, 'undergraduate') !== false || 
                    strpos($lowerEventName, 'graduate') !== false ||
                    strpos($lowerEventName, 'student') !== false) {
                    // Check student_research_papers
                    $query = "SELECT event_id, event FROM student_research_papers WHERE id = ? LIMIT 1";
                    $stmt = $con->prepare($query);
                    if ($stmt) {
                        $stmt->bind_param("i", $docId);
                        $stmt->execute();
                        $stmtResult = $stmt->get_result();
                        if ($row = $stmtResult->fetch_assoc()) {
                            $result = ['source' => 'student_research_papers', 'event_id' => $row['event_id'], 'event' => $row['event']];
                        }
                        $stmt->close();
                    }
                }
            }
            $eventStmt->close();
        }
    }
    
    // If not found in student or no eventId, check researchfile
    if ($result === null) {
        $query = "SELECT event_id, event FROM researchfile WHERE id = ? LIMIT 1";
        $stmt = $con->prepare($query);
        if ($stmt) {
            $stmt->bind_param("i", $docId);
            $stmt->execute();
            $stmtResult = $stmt->get_result();
            if ($row = $stmtResult->fetch_assoc()) {
                $result = ['source' => 'researchfile', 'event_id' => $row['event_id'], 'event' => $row['event']];
            }
            $stmt->close();
        }
    }
    
    // If still not found, check student_research_papers as fallback
    if ($result === null) {
        $query = "SELECT event_id, event FROM student_research_papers WHERE id = ? LIMIT 1";
        $stmt = $con->prepare($query);
        if ($stmt) {
            $stmt->bind_param("i", $docId);
            $stmt->execute();
            $stmtResult = $stmt->get_result();
            if ($row = $stmtResult->fetch_assoc()) {
                $result = ['source' => 'student_research_papers', 'event_id' => $row['event_id'], 'event' => $row['event']];
            }
            $stmt->close();
        }
    }
    
    return $result;
}

if(isset($_POST['getCategories'])){
    $response = [];
    
    if($con){
        $query = "SELECT id, name FROM category ORDER BY name";
        $result = $con->query($query);
        
        if($result){
            while($row = $result->fetch_assoc()){
                $response[] = [
                    'id' => $row['id'],
                    'name' => $row['name']
                ];
            }
            $result->free();
        }
    }
    
    echo json_encode($response);
    exit();
}

if(isset($_POST['commentRequest'])){
    $eventType = $_POST['eventType'] ?? '';
    $categoryId = $_POST['categoryId'] ?? '';
    $categoryName = $_POST['categoryName'] ?? '';
    $isPrintAll = $_POST['isPrintAll'] ?? false; 
    
    // If no event selected, return error
    if (empty($eventType) || $eventType === '-- Select Event type --') {
        echo json_encode(['error' => 'Please select an event']);
        exit();
    }
    
    $response = [];
    
    if($con){
        // STEP 1: Determine if the event is a student event
        $isNumericEvent = is_numeric($eventType);
        $eventId = null;
        $eventName = null;
        
        if ($isNumericEvent) {
            $eventId = (int)$eventType;
            $eventNameQuery = "SELECT name FROM event_list WHERE id = ?";
            $eventNameStmt = $con->prepare($eventNameQuery);
            if ($eventNameStmt) {
                $eventNameStmt->bind_param("i", $eventId);
                $eventNameStmt->execute();
                $eventNameResult = $eventNameStmt->get_result();
                if ($row = $eventNameResult->fetch_assoc()) {
                    $eventName = $row['name'];
                }
                $eventNameStmt->close();
            }
        } else {
            $eventName = $eventType;
            $eventIdQuery = "SELECT id FROM event_list WHERE name = ?";
            $eventIdStmt = $con->prepare($eventIdQuery);
            if ($eventIdStmt) {
                $eventIdStmt->bind_param("s", $eventType);
                $eventIdStmt->execute();
                $eventIdResult = $eventIdStmt->get_result();
                if ($row = $eventIdResult->fetch_assoc()) {
                    $eventId = (int)$row['id'];
                }
                $eventIdStmt->close();
            }
        }
        
        $logMessage = "commentRequest - Event ID: " . ($eventId ?? 'null') . ", Event Name: " . ($eventName ?? 'null') . ", Is Numeric: " . ($isNumericEvent ? 'Yes' : 'No');
        error_log($logMessage);
        
        // STEP 2: Determine if it's a student event
        $isStudent = false;
        
        if (!empty($eventName)) {
            $studentCheckQuery = "SELECT COUNT(*) as count FROM student_research_papers WHERE event = ? OR event_id = ?";
            $studentCheckStmt = $con->prepare($studentCheckQuery);
            if ($studentCheckStmt) {
                $studentCheckStmt->bind_param("si", $eventName, $eventId);
                $studentCheckStmt->execute();
                $studentCheckResult = $studentCheckStmt->get_result();
                if ($row = $studentCheckResult->fetch_assoc()) {
                    if ($row['count'] > 0) {
                        $isStudent = true;
                        error_log("commentRequest - Student event detected with " . $row['count'] . " papers");
                    }
                }
                $studentCheckStmt->close();
            }
        }
        
        if (!$isStudent && !empty($eventName)) {
            $facultyCheckQuery = "SELECT COUNT(*) as count FROM researchfile WHERE event = ? OR event_id = ?";
            $facultyCheckStmt = $con->prepare($facultyCheckQuery);
            if ($facultyCheckStmt) {
                $facultyCheckStmt->bind_param("si", $eventName, $eventId);
                $facultyCheckStmt->execute();
                $facultyCheckResult = $facultyCheckStmt->get_result();
                if ($row = $facultyCheckResult->fetch_assoc()) {
                    if ($row['count'] > 0) {
                        $isStudent = false;
                        error_log("commentRequest - Faculty event detected with " . $row['count'] . " papers");
                    }
                }
                $facultyCheckStmt->close();
            }
        }
        
        // STEP 3: Build the query based on event type
        // Define NULL values as variables
        $nullCenter = 'NULL';
        $nullFile = 'NULL';
        $nullPaperTrail = 'NULL';
        $nullFinalSymposium = 'NULL';
        
        if ($isStudent) {
            if ($eventId) {
                $query = "SELECT 
                    c.resid,
                    c.evalid,
                    c.title,
                    c.intro,
                    c.abstract,
                    c.objective,
                    c.methodology,
                    c.results,
                    c.recommendation,
                    c.literature,
                    c.other,
                    c.isCommented,
                    c.date,
                    e.fullname as evaluator_name,
                    srp.category,
                    ? as center,
                    srp.campus,
                    srp.title as doc_title,
                    srp.author,
                    srp.coauthor,
                    srp.presenter,
                    srp.event,
                    ? as file,
                    srp.research_file_view_url as drive_view_url,
                    ? as paper_trail_no,
                    ? as final_symposium_title,
                    cat.id as category_id,
                    cat.name as category_name
                FROM comments c
                LEFT JOIN evaluator e ON e.id = c.evalid
                LEFT JOIN student_research_papers srp ON srp.id = c.resid
                LEFT JOIN category cat ON cat.name = srp.category
                WHERE srp.event_id = ?";
                
                $params = [$nullCenter, $nullFile, $nullPaperTrail, $nullFinalSymposium, $eventId];
                $types = "ssssi";
            } else {
                $query = "SELECT 
                    c.resid,
                    c.evalid,
                    c.title,
                    c.intro,
                    c.abstract,
                    c.objective,
                    c.methodology,
                    c.results,
                    c.recommendation,
                    c.literature,
                    c.other,
                    c.isCommented,
                    c.date,
                    e.fullname as evaluator_name,
                    srp.category,
                    ? as center,
                    srp.campus,
                    srp.title as doc_title,
                    srp.author,
                    srp.coauthor,
                    srp.presenter,
                    srp.event,
                    ? as file,
                    srp.research_file_view_url as drive_view_url,
                    ? as paper_trail_no,
                    ? as final_symposium_title,
                    cat.id as category_id,
                    cat.name as category_name
                FROM comments c
                LEFT JOIN evaluator e ON e.id = c.evalid
                LEFT JOIN student_research_papers srp ON srp.id = c.resid
                LEFT JOIN category cat ON cat.name = srp.category
                WHERE srp.event = ?";
                
                $params = [$nullCenter, $nullFile, $nullPaperTrail, $nullFinalSymposium, $eventName];
                $types = "sssss";
            }
            
            if ($categoryId !== 'Print All Category' && !$isPrintAll && !empty($categoryId) && $categoryId !== '-- Select Category --') {
                if (is_numeric($categoryId)) {
                    $query .= " AND cat.id = ?";
                    $params[] = (int)$categoryId;
                    $types .= "i";
                } else {
                    $query .= " AND cat.name = ?";
                    $params[] = $categoryId;
                    $types .= "s";
                }
            }
            
            $query .= " ORDER BY srp.title, c.date DESC";
            
        } else {
            if ($eventId) {
                $query = "SELECT 
                    c.resid,
                    c.evalid,
                    c.title,
                    c.intro,
                    c.abstract,
                    c.objective,
                    c.methodology,
                    c.results,
                    c.recommendation,
                    c.literature,
                    c.other,
                    c.isCommented,
                    c.date,
                    e.fullname as evaluator_name,
                    r.category,
                    r.center,
                    r.campus,
                    r.title as doc_title,
                    r.author,
                    r.coauthor,
                    r.presenter,
                    r.event,
                    r.file,
                    r.drive_view_url,
                    r.paper_trail_no,
                    r.final_symposium_title,
                    cat.id as category_id,
                    cat.name as category_name
                FROM comments c
                LEFT JOIN evaluator e ON e.id = c.evalid
                LEFT JOIN researchfile r ON r.id = c.resid
                LEFT JOIN category cat ON cat.name = r.category
                WHERE r.event_id = ?";
                
                $params = [$eventId];
                $types = "i";
            } else {
                $query = "SELECT 
                    c.resid,
                    c.evalid,
                    c.title,
                    c.intro,
                    c.abstract,
                    c.objective,
                    c.methodology,
                    c.results,
                    c.recommendation,
                    c.literature,
                    c.other,
                    c.isCommented,
                    c.date,
                    e.fullname as evaluator_name,
                    r.category,
                    r.center,
                    r.campus,
                    r.title as doc_title,
                    r.author,
                    r.coauthor,
                    r.presenter,
                    r.event,
                    r.file,
                    r.drive_view_url,
                    r.paper_trail_no,
                    r.final_symposium_title,
                    cat.id as category_id,
                    cat.name as category_name
                FROM comments c
                LEFT JOIN evaluator e ON e.id = c.evalid
                LEFT JOIN researchfile r ON r.id = c.resid
                LEFT JOIN category cat ON cat.name = r.category
                WHERE r.event = ?";
                
                $params = [$eventName];
                $types = "s";
            }
            
            if ($categoryId !== 'Print All Category' && !$isPrintAll && !empty($categoryId) && $categoryId !== '-- Select Category --') {
                if (is_numeric($categoryId)) {
                    $query .= " AND cat.id = ?";
                    $params[] = (int)$categoryId;
                    $types .= "i";
                } else {
                    $query .= " AND cat.name = ?";
                    $params[] = $categoryId;
                    $types .= "s";
                }
            }
            
            $query .= " ORDER BY r.title, c.date DESC";
        }
        
        error_log("commentRequest - Query: " . $query);
        error_log("commentRequest - Params: " . print_r($params, true));
        error_log("commentRequest - Types: " . $types);
        
        $statement = $con->prepare($query);
        if ($statement) {
            $statement->bind_param($types, ...$params);
            $statement->execute();
            $result = $statement->get_result();
            
            $groupedComments = [];
            while ($val = $result->fetch_assoc()) {
                $resid = $val['resid'];
                $docTitle = $val['doc_title'] ?? 'Untitled';
                
                if (!isset($groupedComments[$resid])) {
                    $groupedComments[$resid] = [
                        'resid' => $val['resid'],
                        'doc_title' => $docTitle,
                        'category' => $val['category_name'] ?? $val['category'] ?? '',
                        'category_id' => $val['category_id'] ?? '',
                        'center' => $val['center'] ?? '',
                        'campus' => $val['campus'] ?? '',
                        'author' => $val['author'] ?? '',
                        'coauthor' => $val['coauthor'] ?? '',
                        'presenter' => $val['presenter'] ?? '',
                        'event' => $val['event'] ?? '',
                        'file' => $val['file'] ?? '',
                        'drive_view_url' => $val['drive_view_url'] ?? '',
                        'paper_trail_no' => $val['paper_trail_no'] ?? '',
                        'final_symposium_title' => $val['final_symposium_title'] ?? '',
                        'source_table' => $isStudent ? 'student_research_papers' : 'researchfile',
                        'comments' => [],
                        'total_word_count' => 0
                    ];
                }
                
                $comment = [];
                if (!empty($val['title'])) $comment['title'] = $val['title'];
                if (!empty($val['intro'])) $comment['intro'] = $val['intro'];
                if (!empty($val['abstract'])) $comment['abstract'] = $val['abstract'];
                if (!empty($val['objective'])) $comment['objective'] = $val['objective'];
                if (!empty($val['methodology'])) $comment['methodology'] = $val['methodology'];
                if (!empty($val['results'])) $comment['results'] = $val['results'];
                if (!empty($val['recommendation'])) $comment['recommendation'] = $val['recommendation'];
                if (!empty($val['literature'])) $comment['literature'] = $val['literature'];
                if (!empty($val['other'])) $comment['other'] = $val['other'];
                $comment['evaluator_name'] = $val['evaluator_name'] ?? 'Unknown Evaluator';
                $comment['date'] = $val['date'] ?? '';
                $comment['source_table'] = $isStudent ? 'student_research_papers' : 'researchfile';
                
                if (count($comment) > 2) {
                    $groupedComments[$resid]['comments'][] = $comment;
                }
            }
            
            foreach ($groupedComments as $resid => &$docData) {
                $totalWords = 0;
                foreach ($docData['comments'] as $comment) {
                    $commentText = '';
                    $fields = ['title', 'intro', 'abstract', 'objective', 'methodology', 'results', 'recommendation', 'literature', 'other'];
                    foreach ($fields as $field) {
                        if (!empty($comment[$field])) {
                            $cleanText = strip_tags($comment[$field]);
                            $commentText .= ' ' . $cleanText;
                        }
                    }
                    if (!empty($comment['evaluator_name'])) {
                        $commentText .= ' ' . strip_tags($comment['evaluator_name']);
                    }
                    $totalWords += str_word_count($commentText);
                }
                if (!empty($docData['doc_title'])) {
                    $totalWords += str_word_count(strip_tags($docData['doc_title']));
                }
                if (!empty($docData['author'])) {
                    $totalWords += str_word_count(strip_tags($docData['author']));
                }
                if (!empty($docData['campus'])) {
                    $totalWords += str_word_count(strip_tags($docData['campus']));
                }
                if (!empty($docData['category'])) {
                    $totalWords += str_word_count(strip_tags($docData['category']));
                }
                
                $docData['total_word_count'] = $totalWords;
            }
            unset($docData);
            
            $response = array_values(array_filter($groupedComments, function($doc) {
                return !empty($doc['comments']);
            }));
            
            $statement->close();
        } else {
            echo json_encode(['error' => 'Database query failed: ' . $con->error]);
            exit();
        }
    }
    
    echo json_encode($response);
    exit();
}

if(isset($_POST['reqCommentIndiv2'])){
    $response = new stdClass();
    $response->name = '';
    $response->data = '';
    $response->isCommented = 0;
    $response->evID = null;
    $response->status = 'success';
    $response->message = 'No comments found for this paper';
    $response->comments = [];
    $response->source_table = '';
    $response->doc_info = null;
    $response->has_comments = false;
    
    try {
        if (!isset($_SESSION) || session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['userId'])) {
            error_log('userId not set in session');
            $response->message = 'User not authenticated';
            $response->status = 'error';
            echo json_encode($response);
            exit();
        }
        
        $docId = $_POST['docId'] ?? '';
        $comName = $_POST['comName'] ?? '';
        $eventId = $_POST['eventId'] ?? null;
        
        // CLEAN THE DOC ID
        if (strpos($docId, '?') !== false) {
            $docId = explode('?', $docId)[0];
        }
        if (strpos($docId, '&') !== false) {
            $docId = explode('&', $docId)[0];
        }
        $docId = (int)preg_replace('/[^0-9]/', '', $docId);
        
        if (empty($docId)) {
            $response->message = 'Missing document ID';
            $response->status = 'error';
            echo json_encode($response);
            exit();
        }
        
        $cons = new mysqli($host, $username, $pass, $dbName);
        
        if ($cons->connect_error) {
            error_log('Database connection failed: ' . $cons->connect_error);
            $response->message = 'Database connection failed';
            $response->status = 'error';
            echo json_encode($response);
            exit();
        }
        
        // Get document source
        $docSource = getDocumentSource($cons, $docId, $eventId);
        
        if (!$docSource) {
            $response->message = 'Document not found';
            $response->status = 'error';
            echo json_encode($response);
            exit();
        }
        
        $isStudent = ($docSource['source'] === 'student_research_papers');
        $eventName = $docSource['event'];
        $eventId = $docSource['event_id'];
        $response->source_table = $docSource['source'];
        $response->source_type = $isStudent ? 'student' : 'faculty';
        
        // Get document info from the appropriate table
        $docInfo = null;
        if ($isStudent) {
            $docQuery = "SELECT 
                id,
                title as doc_title,
                event,
                event_id,
                category,
                campus,
                author,
                coauthor,
                presenter,
                status as doc_status,
                completion_status,
                research_file_view_url as drive_view_url
            FROM student_research_papers WHERE id = ? LIMIT 1";
        } else {
            $docQuery = "SELECT 
                id,
                title as doc_title,
                final_symposium_title,
                event,
                event_id,
                category,
                center,
                campus,
                author,
                coauthor,
                presenter,
                status as doc_status,
                completion_status,
                file,
                drive_view_url,
                paper_trail_no
            FROM researchfile WHERE id = ? LIMIT 1";
        }
        
        $docStmt = $cons->prepare($docQuery);
        if ($docStmt) {
            $docStmt->bind_param("i", $docId);
            $docStmt->execute();
            $docResult = $docStmt->get_result();
            if ($docResult->num_rows > 0) {
                $docInfo = $docResult->fetch_assoc();
            }
            $docStmt->close();
        }
        
        $response->doc_info = $docInfo;
        
        // Get comments for this document and evaluator
        $evalId = (int)$_SESSION['userId'];
        
        $commentQuery = "SELECT 
            c.title,
            c.intro,
            c.abstract,
            c.objective,
            c.methodology,
            c.results,
            c.recommendation,
            c.literature,
            c.other,
            c.isCommented,
            c.evID,
            c.date,
            c.resid
        FROM comments c
        WHERE c.resid = ? AND c.evalid = ?
        ORDER BY c.date DESC";
        
        $commentStmt = $cons->prepare($commentQuery);
        if (!$commentStmt) {
            error_log('Prepare failed: ' . $cons->error);
            $response->message = 'Query preparation failed';
            $response->status = 'error';
            echo json_encode($response);
            exit();
        }
        
        $commentStmt->bind_param("ii", $docId, $evalId);
        
        if (!$commentStmt->execute()) {
            error_log('Execute failed: ' . $commentStmt->error);
            $response->message = 'Query execution failed';
            $response->status = 'error';
            echo json_encode($response);
            exit();
        }
        
        $result = $commentStmt->get_result();
        
        $comments = [];
        $hasContent = false;
        
        while ($val = $result->fetch_assoc()) {
            // Check if there's any actual content
            $fields = ['title', 'intro', 'abstract', 'objective', 'methodology', 'results', 'recommendation', 'literature', 'other'];
            $hasSectionContent = false;
            foreach ($fields as $field) {
                if (!empty($val[$field]) && trim($val[$field]) !== '' && trim($val[$field]) !== 'N/A') {
                    $hasSectionContent = true;
                    break;
                }
            }
            
            if (!$hasSectionContent) {
                continue;
            }
            
            $hasContent = true;
            
            $sectionContent = '';
            if (!empty($comName) && isset($val[$comName])) {
                $sectionContent = $val[$comName] ?? '';
            }
            
            // Get evaluator name
            $evaluatorName = 'Unknown Evaluator';
            if (!empty($val['evID'])) {
                $evalNameQuery = "SELECT fullname FROM evaluator WHERE id = ? LIMIT 1";
                $evalNameStmt = $cons->prepare($evalNameQuery);
                if ($evalNameStmt) {
                    $evalNameStmt->bind_param("i", $val['evID']);
                    $evalNameStmt->execute();
                    $evalNameResult = $evalNameStmt->get_result();
                    if ($row = $evalNameResult->fetch_assoc()) {
                        $evaluatorName = $row['fullname'];
                    }
                    $evalNameStmt->close();
                }
            }
            
            if (empty($comName) || $comName === 'all') {
                $comment = [
                    'evaluator_name' => $evaluatorName,
                    'date' => $val['date'] ?? '',
                    'evID' => $val['evID'] ?? null,
                    'isCommented' => (int)($val['isCommented'] ?? 0)
                ];
                
                foreach ($fields as $field) {
                    if (!empty($val[$field]) && trim($val[$field]) !== '' && trim($val[$field]) !== 'N/A') {
                        $comment[$field] = $val[$field];
                    }
                }
                
                $comments[] = $comment;
            } else {
                if (!empty($sectionContent) && trim($sectionContent) !== '' && trim($sectionContent) !== 'N/A') {
                    $commentData = [
                        'evaluator_name' => $evaluatorName,
                        'date' => $val['date'] ?? '',
                        'evID' => $val['evID'] ?? null,
                        'isCommented' => (int)($val['isCommented'] ?? 0),
                        $comName => $sectionContent
                    ];
                    $comments[] = $commentData;
                }
            }
        }
        
        $commentStmt->close();
        $cons->close();
        
        // Build response
        if ($hasContent && !empty($comments)) {
            $response->data = $comments;
            $response->isCommented = 1;
            $response->message = 'Comments loaded successfully';
            $response->total_comments = count($comments);
            $response->has_comments = true;
            
            if (!empty($comName) && $comName !== 'all') {
                $latestComment = null;
                foreach ($comments as $comment) {
                    if (isset($comment[$comName]) && !empty($comment[$comName])) {
                        $latestComment = $comment[$comName];
                        break;
                    }
                }
                if ($latestComment !== null) {
                    $response->data = $latestComment;
                    $response->name = $comName;
                }
            }
        } else {
            // No comments found - this is the expected response for empty comments
            $response->data = [];
            $response->isCommented = 0;
            $response->message = 'No comments found for this paper';
            $response->status = 'success';
            $response->has_comments = false;
        }
        
    } catch (Exception $e) {
        error_log('Exception in reqCommentIndiv2: ' . $e->getMessage());
        $response->message = 'Server error: ' . $e->getMessage();
        $response->status = 'error';
        $response->data = [];
        $response->has_comments = false;
    }
    
    echo json_encode($response);
    exit();
}

//endpoint to update isCommented status
if(isset($_POST['updateCommentStatus'])){
    $docId = $_POST['docId'];
    $evalId = $_SESSION['userId'];
    $isCommented = $_POST['isCommented'];
    
    if ($cons = new mysqli($host, $username, $pass, $dbName)) {
        $query = "UPDATE comments SET isCommented = ? WHERE resid = ? AND evalid = ?";
        $statement = $cons->prepare($query);
        $statement->bind_param("iss", $isCommented, $docId, $evalId);
        $statement->execute();
        
        echo json_encode(['success' => true]);
    }
}

if(isset($_POST['updateScoreStatus'])){
    $docId = $_POST['docId'];
    $evalId = $_SESSION['userId'];
    $isScored = $_POST['isScored'];
    
    if ($cons = new mysqli($host, $username, $pass, $dbName)) {
        $query = "UPDATE score_board SET isScored = ? WHERE doc_id = ? AND eval_id = ?";
        $statement = $cons->prepare($query);
        $statement->bind_param("iis", $isScored, $docId, $evalId);
        $statement->execute();
        
        echo json_encode(['success' => true]);
    }
}

if(isset($_POST['queueCommentForEmail'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->queued = 0;
    
    try {
        $docId = $_POST['docId'] ?? '';
        $evalId = $_SESSION['userId'] ?? 0;
        $eventId = $_POST['eventId'] ?? 0;
        $eventName = $_POST['eventName'] ?? '';
        
        if (empty($docId) || empty($evalId)) {
            throw new Exception('Missing required parameters');
        }
        
        $cons = new mysqli($host, $username, $pass, $dbName);
        
        if ($cons->connect_error) {
            throw new Exception('Database connection failed: ' . $cons->connect_error);
        }
        
        // Determine which table the document belongs to
        $docSource = getDocumentSource($cons, $docId);
        $isStudent = false;
        
        if ($docSource) {
            $isStudent = isStudentEvent($docSource['event'], $docSource['event_id']);
        }
        
        // Get comments and document data based on source
        if ($isStudent) {
            // Student document
            $checkQuery = "SELECT 
                c.resid, 
                c.evalid, 
                c.intro, 
                c.abstract, 
                c.objective, 
                c.methodology, 
                c.results, 
                c.recommendation, 
                c.literature, 
                c.other,
                srp.author,
                srp.coauthor,
                srp.presenter,
                srp.title,
                srp.event_id,
                srp.event,
                NULL as senderid,
                NULL as acceptance_id,
                NULL as date_to_be_held
            FROM comments c
            LEFT JOIN student_research_papers srp ON c.resid = srp.id
            WHERE c.resid = ? AND c.evalid = ?";
        } else {
            // Faculty document
            $checkQuery = "SELECT 
                c.resid, 
                c.evalid, 
                c.intro, 
                c.abstract, 
                c.objective, 
                c.methodology, 
                c.results, 
                c.recommendation, 
                c.literature, 
                c.other,
                r.author,
                r.coauthor,
                r.presenter,
                r.title,
                r.final_symposium_title,
                r.campus,
                r.event_id,
                r.event,
                r.senderid,
                a.id as acceptance_id,
                a.date_to_be_held
            FROM comments c
            LEFT JOIN researchfile r ON c.resid = r.id
            LEFT JOIN acceptance_letter_data a ON r.event_id = a.event_id
            WHERE c.resid = ? AND c.evalid = ?";
        }
        
        $stmt = $cons->prepare($checkQuery);
        $stmt->bind_param("si", $docId, $evalId);
        $stmt->execute();
        $result = $stmt->get_result();
        $commentData = $result->fetch_assoc();
        $stmt->close();
        
        if (!$commentData) {
            throw new Exception('No comments found for this document');
        }
        
        // Use event info from database if not provided
        if (empty($eventId) && !empty($commentData['event_id'])) {
            $eventId = $commentData['event_id'];
        }
        if (empty($eventName) && !empty($commentData['event'])) {
            $eventName = $commentData['event'];
        }
        
        // Check if there are actual comments
        $hasComments = false;
        $sections = ['intro', 'abstract', 'objective', 'methodology', 'results', 'recommendation', 'literature', 'other'];
        foreach ($sections as $section) {
            if (!empty($commentData[$section]) && trim($commentData[$section]) !== '') {
                $hasComments = true;
                break;
            }
        }
        
        if (!$hasComments) {
            throw new Exception('No comments have been added');
        }
        
        // Get evaluator name
        $evalQuery = "SELECT fullname FROM evaluator WHERE id = ?";
        $evalStmt = $cons->prepare($evalQuery);
        $evalStmt->bind_param("i", $evalId);
        $evalStmt->execute();
        $evalResult = $evalStmt->get_result();
        $evaluator = $evalResult->fetch_assoc();
        $evalStmt->close();
        
        // Get author emails - for student papers, use presenter/author directly
        $authorEmails = [];
        $authorName = '';
        
        if ($isStudent) {
            // For student papers, use presenter as the contact
            if (!empty($commentData['presenter'])) {
                $authorName = $commentData['presenter'];
            } elseif (!empty($commentData['author'])) {
                $authorName = $commentData['author'];
            }
            
            // Get email from account_detail
            if (!empty($authorName)) {
                $authQuery = "SELECT email FROM account_detail WHERE fullName = ? AND (usertype = 'Research Chair' OR usertype = 'User')";
                $authStmt = $cons->prepare($authQuery);
                $authStmt->bind_param("s", $authorName);
                $authStmt->execute();
                $authResult = $authStmt->get_result();
                while ($row = $authResult->fetch_assoc()) {
                    if (!empty($row['email'])) {
                        $authorEmails[] = $row['email'];
                    }
                }
                $authStmt->close();
            }
        } else {
            // For faculty papers, use senderid
            $senderId = $commentData['senderid'] ?? 0;
            
            if (!empty($senderId)) {
                $chairQuery = "SELECT email, fullName, campus FROM account_detail WHERE id = ?";
                $chairStmt = $cons->prepare($chairQuery);
                $chairStmt->bind_param("i", $senderId);
                $chairStmt->execute();
                $chairResult = $chairStmt->get_result();
                
                while ($row = $chairResult->fetch_assoc()) {
                    if (!empty($row['email'])) {
                        $authorEmails[] = $row['email'];
                        $authorName = $row['fullName'] ?? 'Research Chair';
                    }
                }
                $chairStmt->close();
            }
            
            // If no email from senderid, try author name
            if (empty($authorEmails) && !empty($commentData['author'])) {
                $authQuery = "SELECT email, fullName FROM account_detail WHERE fullName = ? AND (usertype = 'Research Chair' OR usertype = 'User')";
                $authStmt = $cons->prepare($authQuery);
                $authStmt->bind_param("s", $commentData['author']);
                $authStmt->execute();
                $authResult = $authStmt->get_result();
                while ($row = $authResult->fetch_assoc()) {
                    if (!empty($row['email'])) {
                        $authorEmails[] = $row['email'];
                        if (empty($authorName)) $authorName = $row['fullName'];
                    }
                }
                $authStmt->close();
            }
        }
        
        if (empty($authorEmails)) {
            throw new Exception('No author email found to notify');
        }
        
        $authorEmails = array_unique($authorEmails);
        
        $acceptanceId = $commentData['acceptance_id'] ?? null;
        $eventDateRaw = $commentData['date_to_be_held'] ?? null;
        $scheduledDate = null;
        
        if (!empty($eventDateRaw)) {
            error_log("Raw date_to_be_held: " . $eventDateRaw);
            
            if (preg_match('/([A-Za-z]+)\s+(\d+)-(\d+),\s+(\d{4})(?:\s+at\s+(\d{1,2}:\d{2}\s*[AP]M))?/i', $eventDateRaw, $matches)) {
                $month = $matches[1];
                $dayEnd = (int)$matches[3]; 
                $year = (int)$matches[4];
                $time = isset($matches[5]) ? $matches[5] : '8:00 AM';
                
                $time = str_replace('at ', '', $time);
                $time = trim($time);
                
                $dateStr = "$month $dayEnd, $year $time";
                error_log("Formatted date string: $dateStr");
                
                $eventDateTime = new DateTime($dateStr);
                $eventDateTime->modify('+1 day');
                $scheduledDate = $eventDateTime->format('Y-m-d H:i:s');
                error_log("Scheduled date (after +1 day): $scheduledDate");
            } else {
                $cleanDate = str_replace(' at ', ' ', $eventDateRaw);
                $cleanDate = str_replace('at ', '', $cleanDate);
                try {
                    $eventDateTime = new DateTime($cleanDate);
                    $eventDateTime->modify('+1 day');
                    $scheduledDate = $eventDateTime->format('Y-m-d H:i:s');
                } catch (Exception $e) {
                    error_log("Regular date parsing failed: " . $e->getMessage());
                    $scheduledDate = date('Y-m-d H:i:s', strtotime('+1 day'));
                }
            }
        }
        
        if (empty($scheduledDate)) {
            $scheduledDate = date('Y-m-d H:i:s', strtotime('+1 day'));
            error_log("Using fallback date: $scheduledDate");
        }
        
        // Get document title
        $documentTitle = $commentData['final_symposium_title'] ?? $commentData['title'] ?? 'Untitled';
        
        // Get comment sections
        $commentSections = [];
        $sectionNames = [
            'intro' => 'Introduction',
            'abstract' => 'Abstract',
            'objective' => 'Objectives',
            'methodology' => 'Methodology',
            'results' => 'Results and Discussion',
            'recommendation' => 'Conclusions and Recommendation',
            'literature' => 'Literature',
            'other' => 'Other Comments'
        ];
        
        foreach ($sectionNames as $key => $name) {
            if (!empty($commentData[$key]) && trim($commentData[$key]) !== '') {
                $commentSections[] = $name;
            }
        }
        
        $commentSectionsStr = implode(', ', $commentSections);
        
        // Insert into email_queue
        $queuedCount = 0;
        foreach ($authorEmails as $email) {
            if (empty($email)) continue;
            
            // Check if already queued
            $checkQueueQuery = "SELECT id FROM email_queue 
                               WHERE document_id = ? AND evaluator_id = ? 
                               AND status IN ('pending', 'processing')";
            $checkQueueStmt = $cons->prepare($checkQueueQuery);
            $checkQueueStmt->bind_param("ii", $docId, $evalId);
            $checkQueueStmt->execute();
            $checkQueueResult = $checkQueueStmt->get_result();
            
            if ($checkQueueResult->num_rows > 0) {
                $checkQueueStmt->close();
                continue;
            }
            $checkQueueStmt->close();
            
            // Insert into email_queue
            $insertQuery = "INSERT INTO email_queue 
                            (document_id, evaluator_id, event_id, acceptance_letter_id, scheduled_date, status) 
                            VALUES (?, ?, ?, ?, ?, 'pending')";
            
            $insertStmt = $cons->prepare($insertQuery);
            $insertStmt->bind_param("iiiss", 
                $docId, 
                $evalId, 
                $eventId, 
                $acceptanceId,
                $scheduledDate
            );
            
            if ($insertStmt->execute()) {
                $queuedCount++;
                error_log("Queued email for doc $docId to Author: $email on $scheduledDate");
            } else {
                error_log("Failed to insert email_queue: " . $insertStmt->error);
            }
            $insertStmt->close();
        }
        
        // Log to email_log
        if ($queuedCount > 0) {
            foreach ($authorEmails as $email) {
                $logQuery = "INSERT INTO email_log 
                             (document_id, evaluator_id, author_email, sent_date, email_type, status) 
                             VALUES (?, ?, ?, NOW(), 'comment_queued', 0)";
                $logStmt = $cons->prepare($logQuery);
                $logStmt->bind_param("iis", $docId, $evalId, $email);
                $logStmt->execute();
                $logStmt->close();
            }
        }
        
        $response->status = true;
        $response->message = "Comments saved";
        $response->queued = $queuedCount;
        $response->scheduled_date = $scheduledDate;
        $response->source_type = $isStudent ? 'student' : 'faculty';
        
        $cons->close();
        
    } catch (Exception $e) {
        error_log('queueCommentForEmail error: ' . $e->getMessage());
        $response->status = false;
        $response->message = $e->getMessage();
    }
    
    echo json_encode($response);
    exit();
}