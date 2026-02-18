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
            $data->intro=$val['intro'];
            $data->abstract=$val['abstract'];
            $data->objective=$val['objective'];
            $data->methodology=$val['methodology'];
            $data->results=$val['results'];
            $data->recommendation=$val['recommendation'];
            $data->literature=$val['literature'];
            $data->other=$val['other'];
            $data->isCommented=$val['isCommented'];
            $data->fullname=$val['fullname'];
            $data->category=$val['category'];
            $response[]=$data;
        }
    }
    echo json_encode($response);
}

if(isset($_POST['commentRequest'])){
    $filter=$_POST['eventType'];
    $category=$_POST['category'];
    $response=[];

    if($con){
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
        WHERE comments.eventType=?  AND comments.resid=?";

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
        WHERE researchfile.category=? AND comments.eventType=?  AND comments.resid=?";
        $state='accepted';

        if($category==='Print All Category'){
            $statement=$con->prepare("SELECT 
        researchfile.id,
        researchfile.author,
        researchfile.title,
        researchfile.event,
        researchfile.category,
        researchfile.campus,
        endorsement.date,
        (SELECT COUNT(*) FROM score_board WHERE score_board.doc_id = researchfile.id AND score_board.isScored = 1) as hasScore,
        (SELECT COUNT(*) FROM comments WHERE comments.resid = researchfile.id AND comments.isCommented = 1) as hasComment
        FROM researchfile
        RIGHT JOIN endorsement
        ON researchfile.endorsementid=endorsement.id
        WHERE researchfile.event=? AND endorsement.status=? ");
            $statement->bind_param("ss",$filter,$state);
        }else{
            $statement=$con->prepare("SELECT 
        researchfile.id,
        researchfile.author,
        researchfile.title,
        researchfile.event,
        researchfile.category,
        researchfile.campus,
        endorsement.date,
        (SELECT COUNT(*) FROM score_board WHERE score_board.doc_id = researchfile.id AND score_board.isScored = 1) as hasScore,
        (SELECT COUNT(*) FROM comments WHERE comments.resid = researchfile.id AND comments.isCommented = 1) as hasComment
        FROM researchfile
        RIGHT JOIN endorsement
        ON researchfile.endorsementid=endorsement.id
        WHERE researchfile.event=? AND endorsement.status=? AND researchfile.category=?");
            $statement->bind_param("sss",$filter,$state,$category);
        }
        $statement->execute();
        $result=$statement->get_result();

        while ($val=$result->fetch_assoc()){

            $researchDocs=new stdClass();
            $researchDocs->id=$val['id'];
            $researchDocs->author=$val['author'];
            $researchDocs->title=$val['title'];
            $researchDocs->event=$val['event'];
            $researchDocs->category=$val['category'];
            $researchDocs->campus=$val['campus'];
            $researchDocs->date=$val['date'];
            $researchDocs->hasScore = $val['hasScore'] > 0;
            $researchDocs->hasComment = $val['hasComment'] > 0;
            $researchDocs->comments=[];
            $docsId=$val['id'];
            $comState="";
            if($category==='Print All Category'){
                $comState=$con->prepare($query2);
                $comState->bind_param("ss",$filter,$docsId);
            }else{
                $comState=$con->prepare($query);
                $comState->bind_param("sss",$category,$filter,$docsId);
            }
            $comState->execute();
            $resultInner=$comState->get_result();
            while ($value=$resultInner->fetch_assoc()){
                $data=new stdClass();
                $data->intro=$value['intro'];
                $data->abstract=$value['abstract'];
                $data->objective=$value['objective'];
                $data->methodology=$value['methodology'];
                $data->results=$value['results'];
                $data->recommendation=$value['recommendation'];
                $data->literature=$value['literature'];
                $data->other=$value['other'];
                $data->isCommented=$value['isCommented'];
                $data->evalName=$value['fullname'];
                $researchDocs->comments[]=$data;
            }

           $response[]=$researchDocs;
            $comState->close();
        }
    }
   echo json_encode($response);
}

if(isset($_POST['reqCommentIndiv2'])){
    $res= new stdClass();
    $res->name='';
    $res->data='';
    if ($cons = new mysqli($host, $username, $pass, $dbName)) {

        switch ($_POST['comName']){
            case 'title':
                $query="SELECT comments.title, comments.isCommented FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='title';
                    $res->data=$val['title'];
                    $res->isCommented=$val['isCommented'];
                }
                break;
            case 'abstract':
                $query="SELECT comments.abstract, comments.isCommented FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='abstract';
                    $res->data=$val['abstract'];
                    $res->isCommented=$val['isCommented'];
                }
                break;
            case 'intro':
                $query="SELECT comments.intro, comments.isCommented FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='intro';
                    $res->data=$val['intro'];
                    $res->isCommented=$val['isCommented'];
                }
                break;
            case 'objective':
                $query="SELECT comments.objective, comments.isCommented FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='objective';
                    $res->data=$val['objective'];
                    $res->isCommented=$val['isCommented'];
                }
                break;
            case 'methodology':
                $query="SELECT comments.methodology, comments.isCommented FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='methodology';
                    $res->data=$val['methodology'];
                    $res->isCommented=$val['isCommented'];
                }
                break;
            case 'results':
                $query="SELECT comments.results, comments.isCommented FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='results';
                    $res->data=$val['results'];
                    $res->isCommented=$val['isCommented'];
                }
                break;
            case 'recommendation':
                $query="SELECT comments.recommendation, comments.isCommented FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='recommendation';
                    $res->data=$val['recommendation'];
                    $res->isCommented=$val['isCommented'];
                }
                break;
            case 'literature':
                $query="SELECT comments.literature, comments.isCommented FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='literature';
                    $res->data=$val['literature'];
                    $res->isCommented=$val['isCommented'];
                }
                break;
            case 'other':
                $query="SELECT comments.other, comments.isCommented FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='other';
                    $res->data=$val['other'];
                    $res->isCommented=$val['isCommented'];
                }
                break;
        }
    }
    echo json_encode($res);
}

// Add endpoint to update isCommented status
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

// Add endpoint to update isScored status
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