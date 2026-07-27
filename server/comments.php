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
    
    // If no event selected, return error
    if (empty($eventType) || $eventType === '-- Select Event type --') {
        echo json_encode(['error' => 'Please select an event']);
        exit();
    }
    
    $response = [];
    
    if($con){
        // Build the query - join comments with researchfile and category
        $query = "SELECT 
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
            c.isCommented,
            c.date,
            e.fullname as evaluator_name,
            r.category,
            r.center,
            r.campus,
            r.title,
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
        
        $params = [$eventType];
        $types = "s";
        
        // Add category filter if not "Print All Category" and categoryId is provided
        if (!empty($categoryId) && $categoryId !== 'Print All Category' && $categoryId !== '-- Select Category --') {
            $query .= " AND cat.id = ?";
            $params[] = $categoryId;
            $types .= "s";
        }
        
        $query .= " ORDER BY r.title, c.date DESC";
        
        $statement = $con->prepare($query);
        if ($statement) {
            $statement->bind_param($types, ...$params);
            $statement->execute();
            $result = $statement->get_result();
            
            // Group comments by research file ID
            $groupedComments = [];
            while ($val = $result->fetch_assoc()) {
                $resid = $val['resid'];
                
                if (!isset($groupedComments[$resid])) {
                    $groupedComments[$resid] = [
                        'resid' => $val['resid'],
                        'title' => $val['final_symposium_title'] ?? $val['title'] ?? 'Untitled',
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
                        'comments' => []
                    ];
                }
                
                // Add comment if it exists
                $comment = [];
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
                
                if (count($comment) > 2) {
                    $groupedComments[$resid]['comments'][] = $comment;
                }
            }
            
            // Convert to array and filter out documents with no comments
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
        
        $comName = $_POST['comName'] ?? '';
        $docId = $_POST['docId'] ?? '';
        $evalId = $_SESSION['userId'];
        
        // Validate inputs
        if (empty($comName) || empty($docId)) {
            $response->message = 'Missing required parameters';
            echo json_encode($response);
            exit();
        }
        
        // Map section names to database columns
        $columnMap = [
            'title' => 'title',
            'abstract' => 'abstract',
            'intro' => 'intro',
            'objective' => 'objective',
            'methodology' => 'methodology',
            'results' => 'results',
            'recommendation' => 'recommendation',
            'literature' => 'literature',
            'other' => 'other'
        ];
        
        if (isset($columnMap[$comName])) {
            $column = $columnMap[$comName];
            $query = "SELECT comments.$column as data, comments.isCommented, comments.evID 
                     FROM comments 
                     WHERE comments.resid = ? AND comments.evalid = ?";
            
            $cons = new mysqli($host, $username, $pass, $dbName);
            
            if ($cons->connect_error) {
                error_log('Database connection failed: ' . $cons->connect_error);
                $response->message = 'Database connection failed';
                echo json_encode($response);
                exit();
            }
            
            $statement = $cons->prepare($query);
            
            if (!$statement) {
                error_log('Prepare failed: ' . $cons->error);
                $response->message = 'Query preparation failed';
                echo json_encode($response);
                exit();
            }
            
            $statement->bind_param("ss", $docId, $evalId);
            
            if (!$statement->execute()) {
                error_log('Execute failed: ' . $statement->error);
                $response->message = 'Query execution failed';
                echo json_encode($response);
                exit();
            }
            
            $result = $statement->get_result();
            
            while ($val = $result->fetch_assoc()) {
                $response->name = $comName;
                // Return the data as-is (with HTML tags) - the frontend will render it
                $response->data = $val['data'] ?? '';
                $response->isCommented = (int)($val['isCommented'] ?? 0);
                $response->evID = $val['evID'] ?? null;
                $response->message = 'Comment loaded';
            }
            
            $statement->close();
            $cons->close();
        } else {
            $response->message = 'Invalid section name';
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
