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

if(isset($_POST['commentRequest..'])){
    $filter=$_POST['eventType'];
    $category=$_POST['category'];
    $query=" SELECT
        comments.intro,
        comments.abstract,
        comments.objective,
        comments.methodology,
        comments.results,
        comments.recommendation,
        comments.literature,
        comments.other,
        comments.isCommented,
        evaluator.fullname,
        researchfile.category
        FROM comments
        LEFT JOIN evaluator
        ON evaluator.id=comments.evalid
        LEFT JOIN researchfile
        ON researchfile.id=comments.resid
        WHERE researchfile.category=? AND comments.eventType=?";

    $query2="SELECT
        comments.intro,
        comments.abstract,
        comments.objective,
        comments.methodology,
        comments.results,
        comments.recommendation,
        comments.literature,
        comments.other,
        comments.isCommented,
        evaluator.fullname,
        researchfile.category
        FROM comments
        LEFT JOIN evaluator
        ON evaluator.id=comments.evalid
        LEFT JOIN researchfile
        ON researchfile.id=comments.resid
        WHERE comments.eventType=?";

    //In-house Review
    $response=[];
    $result="";
    if($con){
        $statement='';
        if($category==='Print All Category'){
            $statement=$con->prepare($query2);
            $statement->bind_param("s",$filter);
        }else{
            $statement=$con->prepare($query);
            $statement->bind_param("ss",$category,$filter);
        }
        $statement->execute();
        $result=$statement->get_result();
        while ($val=$result->fetch_assoc()){
            $data=new stdClass();
            $data->intro = $val['intro'] ?? '';
            $data->abstract = $val['abstract'] ?? '';
            $data->objective = $val['objective'] ?? '';
            $data->methodology = $val['methodology'] ?? '';
            $data->results = $val['results'] ?? '';
            $data->recommendation = $val['recommendation'] ?? '';
            $data->literature = $val['literature'] ?? '';
            $data->other = $val['other'] ?? '';
            $data->isCommented = $val['isCommented'] ?? 0;
            $data->fullname = $val['fullname'] ?? '';
            $data->category = $val['category'] ?? '';
            $response[]=$data;
        }
    }
    echo json_encode($response);
    exit();
}

if(isset($_POST['commentRequest'])){
    $docId = $_POST['docId'] ?? '';
    
    if (empty($docId)) {
        echo json_encode(['error' => 'Document ID is required']);
        exit();
    }
    
    $response = [];
    
    if($con){
        $query = "SELECT
            comments.intro,
            comments.abstract,
            comments.objective,
            comments.methodology,
            comments.results,
            comments.recommendation,
            comments.literature,
            comments.other,
            comments.isCommented,
            evaluator.fullname,
            researchfile.category,
            researchfile.title,
            researchfile.author,
            researchfile.campus
        FROM comments
        LEFT JOIN evaluator ON evaluator.id = comments.evalid
        LEFT JOIN researchfile ON researchfile.id = comments.resid
        WHERE comments.resid = ?";
        
        $statement = $con->prepare($query);
        if ($statement) {
            $statement->bind_param("s", $docId);
            $statement->execute();
            $result = $statement->get_result();
            
            $commentsList = [];
            while ($val = $result->fetch_assoc()){
                $data = new stdClass();
                $data->intro = $val['intro'] ?? '';
                $data->abstract = $val['abstract'] ?? '';
                $data->objective = $val['objective'] ?? '';
                $data->methodology = $val['methodology'] ?? '';
                $data->results = $val['results'] ?? '';
                $data->recommendation = $val['recommendation'] ?? '';
                $data->literature = $val['literature'] ?? '';
                $data->other = $val['other'] ?? '';
                $data->isCommented = $val['isCommented'] ?? 0;
                $data->fullname = $val['fullname'] ?? 'Unknown Evaluator';
                $data->category = $val['category'] ?? '';
                $data->title = $val['title'] ?? '';
                $data->author = $val['author'] ?? '';
                $data->campus = $val['campus'] ?? '';
                $commentsList[] = $data;
            }
            
            $response = $commentsList;
            $statement->close();
        }
    }
    
    echo json_encode($response);
    exit();
}

// FIXED: reqCommentIndiv2 handler - returns HTML content as-is
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
