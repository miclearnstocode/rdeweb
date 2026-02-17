<?php
//SELECT account.id,account.name,account.office FROM account
include('db.php');
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
/** @var TYPE_NAME $rdeEmail */
/** @var TYPE_NAME $emailPassword */

$con = new mysqli($host, $username, $pass, $dbName);
date_default_timezone_set('Asia/Manila');

if (isset($_POST['systemaccount'])) {

 //   $userData = unserialize($_SESSION['isLog']);
    $response = [];
    if ($con) {
        $rdeQuery="SELECT * FROM rdestaff";
        $rdeStatement=$con->prepare($rdeQuery);
        $rdeStatement->execute();
        $res=$rdeStatement->get_result();
        while ($v=$res->fetch_assoc()){
            if($v['id']!== $_SESSION['userId']) {
                $data = new stdClass();
                $data->Name = $v['email'];
                $data->office = "RDE";
                $data->id = $v['id'];
                $response[] = $data;
            }
        }
     //   $query = "SELECT account.id,account.fullname,account.office FROM account";
        $newQuery="SELECT account_detail.id,account_detail.fullName,account_detail.center FROM account_detail";
        $statement = $con->prepare($newQuery);
        $statement->execute();
        $result = $statement->get_result();
        while ($val = $result->fetch_assoc()) {
            if($val['id']!== $_SESSION['userId']){
                $data = new stdClass();
                $data->Name = $val['fullName'];
                $data->office = $val['campus'];
                $data->id = $val['id'];
                $response[] = $data;
            }

        }

        $evalQuery="SELECT * FROM `evaluator`";
        $statementEval=$con->prepare($evalQuery);
        $statementEval->execute();
        $resEval=$statementEval->get_result();
        while($val = $resEval->fetch_assoc()){
            if($val['id']!== $_SESSION['userId']){
                $data = new stdClass();
                $data->Name = $val['fullname'];
                $data->office = "Evaluator";
                $data->id = $val['id'];
                $response[] = $data;
            }
        }


    }
    echo json_encode($response);
}

function Check($statement, $sender, $receiver, $connect)
{
    $statement->bind_param('ss', $sender, $receiver);
    $statement->execute();
    $row = $statement->get_result()->fetch_row();
    if ($row[0] === 0) {
        $insertStatement = $connect->prepare("INSERT INTO convo_pair (convo_pair.user_a,convo_pair.user_b) VALUES ( ?,? )");
        $insertStatement->bind_param('ss', $sender, $receiver);
        $status = $insertStatement->execute();
        if ($status) {
            Check($statement, $sender, $receiver, $connect);
        } else {
            return $insertStatement->error;
        }

    }
    return true;
}



if (isset($_POST['chatIdRequest'])) {
  //  $userData = unserialize($_SESSION['isLog']);
    $response = new stdClass();
    $response->message="";
    $response->data='';
    if ($con) {
        $receiver = $_POST['receiverID'];
        $sender = $_SESSION['userId'];
        $convoCheck = $con->prepare("SELECT COUNT(*) FROM convo_pair WHERE ? IN (convo_pair.user_a,convo_pair.user_b) AND ? IN (convo_pair.user_a,convo_pair.user_b)");

        if (Check($convoCheck, $sender, $receiver, $con)) {


            $convoSession="SELECT convo_pair.id FROM convo_pair WHERE ? IN (convo_pair.user_a,convo_pair.user_b) AND ? IN (convo_pair.user_a,convo_pair.user_b)";
//SELECT convo_pair.id FROM convo_pair WHERE '' IN (convo_pair.user_a,convo_pair.user_b) AND '' IN (convo_pair.user_a,convo_pair.user_b)
            $convoSessionStatement=$con->prepare($convoSession);
            $convoSessionStatement->bind_param('ss',$sender,$receiver);
            $convoSessionStatement->execute();
            $mainResult=$convoSessionStatement->get_result();
            while ($value=$mainResult->fetch_assoc()){
                $data=new stdClass();
                $data->convoId=$value['id'].'';
                $response->data=$data;
            }
        }

    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}



// convo request v1=================================================








if(isset($_POST['chatMessages'])){
    $response=[];
    if($con){


       // $userData = unserialize($_SESSION['isLog']);
        $convoID=$_POST['convoId'];
        $query="SELECT chat.id,chat.message,chat.sender,chat.date FROM chat WHERE chat.convo_id=?  ORDER BY chat.date DESC LIMIT 10";
        $statement=$con->prepare($query);
        $statement->bind_param("s",$convoID);
        $statement->execute();
        $result=$statement->get_result();
        while ($val=$result->fetch_assoc()){
            $data=new stdClass();
            $data->chatID=$val['id'].'';
            $data->message=$val['message'];
            $data->files=[];
            if($val['sender']===$_SESSION['userId']){
                $data->type='sent';
            }else{
                $data->type='receive';
            }
            $fileQuery="SELECT chat_file.file_name,chat_file.file_type,chat_file.url FROM chat_file WHERE chat_file.id=?";
            $fileStatement=$con->prepare($fileQuery);
            $fileStatement->bind_param('s',$data->chatID);
            $fileStatement->execute();
            $res=$fileStatement->get_result();
            while ($v=$res->fetch_assoc()){
                $det=new stdClass();
                $det->fileName=$v['file_name'];
                $det->fileType=$v['file_type'];
                $det->fileUrl=$v['url'];
                $data->files[]=$det;
            }
            $data->date=$val['date'];
            $response[]=$data;
        }
    }
    echo json_encode($response);
}


if(isset($_POST['sendChat'])){
    $response=new stdClass();
    $response->status=false;
    $response->message="";
    if($con){

        $id=$_SESSION['userId'];
        $query="INSERT INTO chat (chat.convo_id,chat.message,chat.sender) VALUES (?,?,?)";
        $statement=$con->prepare($query);
        $convoId=$_POST['convoID'];
        $message=$_POST['chatMessage'];
        $statement->bind_param("sss",$convoId,$message,$id);
        if($statement->execute()){
            if(isset($_FILES['fileDocs']['name'])){
                $path="../client/Files/chatFile/";
                $fileCounter=count($_FILES['fileDocs']['name']);
                for($x=0;$x<$fileCounter;$x++){
                    $exName = round(microtime(true) * 1000).'-';
                    $fullPath=$path.$exName.'-'.$_FILES['fileDocs']['name'][$x];
                    $fileName=$_FILES['fileDocs']['name'][$x];
                    $fileType=$_FILES['fileDocs']['type'][$x];
                    if(move_uploaded_file($_FILES['fileDocs']['tmp_name'][$x],$fullPath)){
                        $fileQuery="INSERT INTO chat_file (chat_file.id,chat_file.convoid,chat_file.file_name,chat_file.file_type,chat_file.url,chat_file.sender) 
SELECT chat.id,?,?,?,?,? FROM chat WHERE chat.convo_id=? ORDER BY chat.date DESC LIMIT 1";
                        $fileStatement=$con->prepare($fileQuery);
                        $fileStatement->bind_param('ssssss',$convoId,$fileName,$fileType,$fullPath,$id,$convoId);
                        if(!$fileStatement->execute()){
                            $response->message.=$fileStatement->error;
                        }
                    }else{
                        $response->message.='Failed to upload';
                    }
                }
            }
            $response->status=true;

        }else{
            $response->message=$statement->error;
        }
    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}
