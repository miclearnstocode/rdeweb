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

function getDocumentSource($con, $docId) {
    // Check researchfile first
    $query = "SELECT event_id, event FROM researchfile WHERE id = ?";
    $stmt = $con->prepare($query);
    if ($stmt) {
        $stmt->bind_param("i", $docId);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            $stmt->close();
            return ['source' => 'researchfile', 'event_id' => $row['event_id'], 'event' => $row['event']];
        }
        $stmt->close();
    }
    
    // Check student_research_papers
    $query = "SELECT event_id, event FROM student_research_papers WHERE id = ?";
    $stmt = $con->prepare($query);
    if ($stmt) {
        $stmt->bind_param("i", $docId);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            $stmt->close();
            return ['source' => 'student_research_papers', 'event_id' => $row['event_id'], 'event' => $row['event']];
        }
        $stmt->close();
    }
    
    return null;
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
        // ============================================================
        // STEP 1: Determine if the event is a student event
        // ============================================================
        // Check if eventType is a numeric ID or a name
        $isNumericEvent = is_numeric($eventType);
        $eventId = null;
        $eventName = null;
        
        if ($isNumericEvent) {
            // It's an event ID - get the event name from event_list
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
            // It's an event name
            $eventName = $eventType;
            // Try to get the event ID from event_list
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
        
        error_log("commentRequest - Event ID: $eventId, Event Name: $eventName, Is Numeric: " . ($isNumericEvent ? 'Yes' : 'No'));
        
        // ============================================================
        // STEP 2: Determine if it's a student event by checking both tables
        // ============================================================
        $isStudent = false;
        
        // Check if there are student papers with this event name or ID
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
                        error_log("commentRequest - Student event detected with $row['count'] papers");
                    }
                }
                $studentCheckStmt->close();
            }
        }
        
        // If not detected as student, check faculty papers
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
                        error_log("commentRequest - Faculty event detected with $row['count'] papers");
                    }
                }
                $facultyCheckStmt->close();
            }
        }
        
        // ============================================================
        // STEP 3: Build the query based on event type
        // ============================================================
        if ($isStudent) {
            // For student events, query from student_research_papers
            // Use event_id if available, otherwise use event name
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
                    NULL as center,
                    srp.campus,
                    srp.title as doc_title,
                    srp.author,
                    srp.coauthor,
                    srp.presenter,
                    srp.event,
                    NULL as file,
                    srp.research_file_view_url as drive_view_url,
                    NULL as paper_trail_no,
                    NULL as final_symposium_title,
                    cat.id as category_id,
                    cat.name as category_name
                FROM comments c
                LEFT JOIN evaluator e ON e.id = c.evalid
                LEFT JOIN student_research_papers srp ON srp.id = c.resid
                LEFT JOIN category cat ON cat.name = srp.category
                WHERE srp.event_id = ?";
                
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
                    srp.category,
                    NULL as center,
                    srp.campus,
                    srp.title as doc_title,
                    srp.author,
                    srp.coauthor,
                    srp.presenter,
                    srp.event,
                    NULL as file,
                    srp.research_file_view_url as drive_view_url,
                    NULL as paper_trail_no,
                    NULL as final_symposium_title,
                    cat.id as category_id,
                    cat.name as category_name
                FROM comments c
                LEFT JOIN evaluator e ON e.id = c.evalid
                LEFT JOIN student_research_papers srp ON srp.id = c.resid
                LEFT JOIN category cat ON cat.name = srp.category
                WHERE srp.event = ?";
                
                $params = [$eventName];
                $types = "s";
            }
            
            // Add category filter if needed
            if ($categoryId !== 'Print All Category' && !$isPrintAll && !empty($categoryId) && $categoryId !== '-- Select Category --') {
                // If categoryId is numeric, use cat.id; if it's a name, use cat.name
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
            // For faculty events, query from researchfile
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
            
            // Add category filter if needed
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
            
            // Group comments by research file ID
            $groupedComments = [];
            while ($val = $result->fetch_assoc()) {
                $resid = $val['resid'];
                
                // Use doc_title directly
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
            
            // Calculate total word count for each document
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
    $response->message = 'No comments found';
    $response->comments = []; // Add this for multiple comments
    $response->source_table = '';
    $response->doc_info = null;
    
    try {
        // Check if session exists
        if (!isset($_SESSION) || session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Check if userId is set in session
        if (!isset($_SESSION['userId'])) {
            error_log('userId not set in session');
            echo json_encode($response);
            exit();
        }
        
        $docId = $_POST['docId'] ?? '';
        $comName = $_POST['comName'] ?? ''; // This is the section name (title, intro, etc.)
        $eventId = $_POST['eventId'] ?? null;
        
        // Validate inputs
        if (empty($docId)) {
            $response->message = 'Missing document ID';
            echo json_encode($response);
            exit();
        }
        
        // Establish database connection
        $cons = new mysqli($host, $username, $pass, $dbName);
        
        if ($cons->connect_error) {
            error_log('Database connection failed: ' . $cons->connect_error);
            $response->message = 'Database connection failed';
            echo json_encode($response);
            exit();
        }
        
        // Determine which table the document belongs to
        $docSource = getDocumentSource($cons, $docId);
        
        if (!$docSource) {
            $response->message = 'Document not found';
            echo json_encode($response);
            exit();
        }
        
        $isStudent = isStudentEvent($docSource['event']);
        $response->source_table = $isStudent ? 'student_research_papers' : 'researchfile';
        
        // Build query based on source table
        if ($isStudent) {
            // Student document - query with student_research_papers
            $query = "SELECT 
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
                c.resid,
                e.fullname as evaluator_name,
                srp.title as doc_title,
                srp.category,
                NULL as center,
                srp.campus,
                srp.author,
                srp.coauthor,
                srp.presenter,
                srp.event,
                NULL as file,
                srp.research_file_view_url as drive_view_url,
                NULL as paper_trail_no,
                NULL as final_symposium_title,
                srp.status as doc_status
            FROM comments c
            LEFT JOIN evaluator e ON e.id = c.evalid
            LEFT JOIN student_research_papers srp ON srp.id = c.resid
            WHERE c.resid = ?
            ORDER BY c.date DESC, c.evalid";
        } else {
            // Faculty document - query with researchfile
            $query = "SELECT 
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
                c.resid,
                e.fullname as evaluator_name,
                r.title as doc_title,
                r.final_symposium_title,
                r.category,
                r.center,
                r.campus,
                r.author,
                r.coauthor,
                r.presenter,
                r.event,
                r.file,
                r.drive_view_url,
                r.paper_trail_no,
                r.status as doc_status
            FROM comments c
            LEFT JOIN evaluator e ON e.id = c.evalid
            LEFT JOIN researchfile r ON r.id = c.resid
            WHERE c.resid = ?
            ORDER BY c.date DESC, c.evalid";
        }
        
        $statement = $cons->prepare($query);
        
        if (!$statement) {
            error_log('Prepare failed: ' . $cons->error);
            $response->message = 'Query preparation failed';
            echo json_encode($response);
            exit();
        }
        
        $statement->bind_param("s", $docId);
        
        if (!$statement->execute()) {
            error_log('Execute failed: ' . $statement->error);
            $response->message = 'Query execution failed';
            echo json_encode($response);
            exit();
        }
        
        $result = $statement->get_result();
        
        // Build the response with all comments
        $comments = [];
        $hasComments = false;
        $docInfo = null;
        $allCommentData = [];
        
        while ($val = $result->fetch_assoc()) {
            $hasComments = true;
            
            // Store document info once
            if ($docInfo === null) {
                $docInfo = [
                    'resid' => $val['resid'],
                    'doc_title' => $val['doc_title'] ?? 'Untitled',
                    'final_symposium_title' => $val['final_symposium_title'] ?? null,
                    'category' => $val['category'] ?? '',
                    'center' => $val['center'] ?? '',
                    'campus' => $val['campus'] ?? '',
                    'author' => $val['author'] ?? '',
                    'coauthor' => $val['coauthor'] ?? '',
                    'presenter' => $val['presenter'] ?? '',
                    'event' => $val['event'] ?? '',
                    'file' => $val['file'] ?? '',
                    'drive_view_url' => $val['drive_view_url'] ?? '',
                    'paper_trail_no' => $val['paper_trail_no'] ?? '',
                    'doc_status' => $val['doc_status'] ?? '',
                    'source_type' => $isStudent ? 'student' : 'faculty'
                ];
            }
            
            // Get the specific section content based on comName
            $sectionContent = '';
            if (!empty($comName) && isset($val[$comName])) {
                $sectionContent = $val[$comName] ?? '';
            }
            
            // If comName is not specified or is 'all', get all sections
            if (empty($comName) || $comName === 'all') {
                // Build comment object with all sections
                $comment = [
                    'evaluator_name' => $val['evaluator_name'] ?? 'Unknown Evaluator',
                    'date' => $val['date'] ?? '',
                    'evID' => $val['evID'] ?? null,
                    'isCommented' => (int)($val['isCommented'] ?? 0)
                ];
                
                $fields = ['title', 'intro', 'abstract', 'objective', 'methodology', 'results', 'recommendation', 'literature', 'other'];
                foreach ($fields as $field) {
                    if (!empty($val[$field]) && trim($val[$field]) !== '' && trim($val[$field]) !== 'N/A') {
                        $comment[$field] = $val[$field];
                    }
                }
                
                // Check if there's any comment content
                $hasCommentContent = false;
                foreach ($fields as $field) {
                    if (isset($comment[$field]) && !empty($comment[$field])) {
                        $hasCommentContent = true;
                        break;
                    }
                }
                
                if ($hasCommentContent) {
                    $comments[] = $comment;
                }
            } else {
                // Get specific section content
                if (!empty($sectionContent) && trim($sectionContent) !== '' && trim($sectionContent) !== 'N/A') {
                    // This is a comment for a specific section
                    $commentData = [
                        'evaluator_name' => $val['evaluator_name'] ?? 'Unknown Evaluator',
                        'date' => $val['date'] ?? '',
                        'evID' => $val['evID'] ?? null,
                        'isCommented' => (int)($val['isCommented'] ?? 0),
                        $comName => $sectionContent
                    ];
                    $comments[] = $commentData;
                }
            }
        }
        
        $statement->close();
        $cons->close();
        
        if ($hasComments && !empty($comments)) {
            // Return the full comment data
            $response->data = $comments;
            $response->doc_info = $docInfo;
            $response->isCommented = 1;
            $response->message = 'Comments loaded successfully';
            $response->total_comments = count($comments);
            $response->source_type = $isStudent ? 'student' : 'faculty';
            
            // If comName is specified, also return the specific section content
            if (!empty($comName) && $comName !== 'all') {
                // Find the latest comment for this section
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
            $response->message = 'No comments found for this document';
            $response->data = [];
        }
        
    } catch (Exception $e) {
        error_log('Exception in reqCommentIndiv2: ' . $e->getMessage());
        $response->message = 'Server error: ' . $e->getMessage();
        $response->status = 'error';
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