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
endorsement.date
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
endorsement.date
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
                $query="SELECT comments.title FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='title';
                    $res->data=$val['title'];

                }
                break;
            case 'abstract':
                $query="SELECT comments.abstract FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='abstract';
                    $res->data=$val['abstract'];

                }
                break;
            case 'intro':
                $query="SELECT comments.intro FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='intro';
                    $res->data=$val['intro'];

                }
                break;
            case 'objective':
                $query="SELECT comments.objective FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='objective';
                    $res->data=$val['objective'];

                }
                break;
            case 'methodology':
                $query="SELECT comments.methodology FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='methodology';
                    $res->data=$val['methodology'];

                }
                break;
            case 'results':
                $query="SELECT comments.results FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='results';
                    $res->data=$val['results'];

                }
                break;
            case 'recommendation':
                $query="SELECT comments.recommendation FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='recommendation';
                    $res->data=$val['recommendation'];

                }
                break;
            case 'literature':
                $query="SELECT comments.literature FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='literature';
                    $res->data=$val['literature'];

                }
                break;
            case 'other':
                $query="SELECT comments.other FROM comments WHERE comments.resid=? AND comments.evalid=?";
                $statement=$cons->prepare($query);
                $statement->bind_param("ss", $_POST['docId'],$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                while ($val=$result->fetch_assoc()){
                    $res->name='other';
                    $res->data=$val['other'];
              
                }
                break;
        }


    }

    echo json_encode($res);
}