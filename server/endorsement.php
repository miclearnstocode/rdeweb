<?php
include('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
$con = new mysqli($host, $username, $pass, $dbName);


if(isset($_POST['researchFileAdmin'])){
 //   $data=unserialize($_SESSION['isLog']);
    $response=[];
    $query="SELECT * FROM `endorsement`";
    //SELECT `id`, `senderid`, `campus`, `file`, `status` FROM `endorsement` WHERE 1
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        foreach ($con->query($query) as $val){
            if($_SESSION['userId']===$val['senderid']){
                $fileObj=new stdClass();
                $fileObj->id=$val['id'];
                $fileObj->senderid=$val['senderid'];
                $fileObj->campus=$val['campus'];
                $fileObj->file=$val['file'];
                $fileObj->status=$val['status'];
                $fileObj->authorSender=$_SESSION['userFulname'];
                $response[]=$fileObj;
            }
        }
    }
    echo json_encode($response);
}

if(isset($_POST['endorsementList'])){
    $response= new stdClass();
    $response->list=[];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="SELECT endorsement.id, endorsement.event,endorsement.campus,endorsement.date FROM endorsement WHERE endorsement.status='accepted'";
        $enStatement=$con->prepare($query);
        $enStatement->execute();
        $result=$enStatement->get_result();

        while ($val= $result->fetch_assoc()){
            $endorsement=new stdClass();
            $endorsement->id=$val['id'];
            $endorsement->event=$val['event'];
            $endorsement->campus=$val['campus'];
            $endorsement->date=$val['date'];
            $endorsement->resStat=false;
            $endorsement->research=[];
            $requery="SELECT researchfile.id,researchfile.author,researchfile.title,researchfile.category, COUNT(researchallfile.docid) as resStat FROM researchfile 
RIGHT JOIN endorsement ON endorsement.id=researchfile.endorsementid 
LEFT JOIN researchallfile ON researchfile.id=researchallfile.docid
WHERE researchfile.endorsementid=?";
            $resState=$con->prepare($requery);
            $resState->bind_param("s",$val['id']);
            $resState->execute();
            $res=$resState->get_result();
            while ($v=$res->fetch_assoc()){
                $endorsement->research[]=$v;
                if($v['resStat']!==0){
                    $endorsement->resStat=true;
                }
            }
            $response->list[]=$endorsement;
        }
    }
    echo json_encode($response->list);
}

if(isset($_POST['requestFileEndorse'])){
    $response=new stdClass();
    $response->status=false;
    $response->res='';
    $response->message='';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docsId=$_POST['docId'];
        $query=" SELECT endorsement.file,endorsement.event FROM endorsement WHERE endorsement.id=? ";
        $statement=$con->prepare($query);
        $statement->bind_param("s",$docsId);
        $statement->execute();
        $result=$statement->get_result();
        while ($val=$result->fetch_assoc()){
            $data=new stdClass();
            $data->fileUrl=$val['file'];
            $data->eventName=$val['event'];
            $response->status=true;
            $response->res=$data;
        }
    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}

if(isset($_POST['returnDocs'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docId=$_POST['docId'];
        $query="UPDATE endorsement SET endorsement.status=NULL WHERE endorsement.id=?";
        $statement=$con->prepare($query);
        $statement->bind_param("s",$docId);
        $status=$statement->execute();
        if($status){
            $response->status=true;
        }else{
            $response->message=$statement->error;
        }
    }
    echo json_encode($response);
}