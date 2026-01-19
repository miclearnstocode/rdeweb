<?php
include_once('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
$con = new mysqli($host, $username, $pass, $dbName);

if(isset($_POST['eSignature'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='';
    $data=unserialize($_SESSION['isLog']);
    $id=$data-> getId();
    if($con){
        $response->message='connected';
        $response->status=true;
        $response->upload=new stdClass();
        $response->upload->status=false;

        //public/template/signature/maam alfon.png
        if(move_uploaded_file($_FILES['file']['tmp_name'],"public/template/signature/".$_FILES['file']['name'])){
            $response->message='uploaded successfully...!';
            $response->upload->status=true;
            $file="public/template/signature/".$_FILES['file']['name'];
            $query="UPDATE `account` SET `signature`='$file' WHERE `id`='$id'";
            if($con->query($query)){
                $response->message='Uploaded successfully...!';
                $response->upload->status=true;
            }else{
                $response->message='Uploaded successfully but failed to save..';
                $response->upload->status=false;
            }
        }else{
            $response->message='failed to upload';
            $response->upload->status=false;
        }
    }
    echo json_encode($response);
}


if(isset($_POST['esigViewer'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='';
   // $data=unserialize($_SESSION['isLog']);

    $id=$_SESSION['userId'];
    if($con){
        //SELECT  `username`, `name`, `password`, `office`, `position`, `signature`, `data` FROM `account` WHERE
        $query="SELECT  `signature`  FROM `account` WHERE `id`='$id'";
        foreach ($con->query($query) as $val){
            $response->message=$val['id'];
            $response->status=true;
        }
    }
}

if(isset($_POST['userSignature'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='';
    $response->data='';
    if($con){
        $query="SELECT * FROM `account`";
        $response->status=true;
        $list=[];
        foreach ($con->query($query) as $val){
            $data=new stdClass();
            $data->id=$val['id'];
            $data->data=$val['fullname'];
            $list[]=$data;
        }
        $response->data=$list;
    }else{
        $response->message='Unable to connect..!';
    }
    echo json_encode($response);
}

if(isset($_POST['userData'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='';
    $response->data=new stdClass();
    $response->data->fullname='';
    $response->data->position='';
    if($con){
       // $data=unserialize($_SESSION['isLog']);

        $id=$_SESSION['userId'];
        $query="SELECT  `position`,`fullname`  FROM `account` WHERE `id`='$id'";
        foreach ($con->query($query) as $val){
            $response->data->fullname=$val['fullname'];
            $response->data->position=$val['position'];
            $response->status=true;
        }
    }
    echo json_encode($response);
}

if(isset($_POST['saveEsign'])){
    $response=new stdClass();
    $response->message='';
    $response->status=true;
   // $data=unserialize($_SESSION['isLog']);

    $id=$_SESSION['userId'];
    $idSIG = round(microtime(true) * 1000) . '';
    if($con){
        $imageFile=$_FILES['signatureIMG']['name'];
        $pathFile="../server/signature/".$idSIG.$_SESSION['userFulname']."-".$imageFile;
        if(move_uploaded_file($_FILES['signatureIMG']['tmp_name'],$pathFile)){

            $signature=new stdClass();
            $signature->url=$pathFile;
            $signature->scale=$_POST['imageRes'];

        //    $query="UPDATE `account` SET `signature`='$strSign' WHERE `id`='$id'";

            $checker="SELECT count(*) FROM  signature WHERE signature.user_id=?";
            $statementMain=$con->prepare($checker);
            $statementMain->bind_param('s',$_SESSION['userId']);
            $statementMain->execute();
            $found=$statementMain->get_result()->fetch_row();
            $queryStatement='';
            if($found[0]===0){
                $insertQuery="INSERT INTO signature (signature.user_id,signature.signature_url,signature.scale) VALUES (?,?,?)";
                $queryStatement=$con->prepare($insertQuery);

                $queryStatement->bind_param('sss',$_SESSION['userId'],$signature->url,$signature->scale);
            }else{
                $updateQuery="UPDATE signature SET signature.signature_url=?,signature.scale=? WHERE signature.user_id=?";
                $queryStatement=$con->prepare($updateQuery);
                $queryStatement->bind_param('sss',$signature->url,$signature->scale, $_SESSION['userId']);
            }
            $result=$queryStatement->execute();
            if($result){
                $response->status=true;
                $response->message='File saved..!';
                $_SESSION['userEsign']=json_encode($signature);
            }else{
                $response->message='Failed to execute queries';
            }
        }else{
            $response->message='Failed to upload file';
        }

    }else{
        $response->message='Failed to connect';
    }

    echo json_encode($response);
}


if(isset($_POST['getSig'])){
  //  $data=unserialize($_SESSION['isLog']);

     $userID= $_SESSION['userId'];
    $response=new stdClass();
     $response->esign='';
     if($con){
         $query="SELECT signature.signature_url,signature.scale FROM signature WHERE signature.user_id=? LIMIT 1";
         $statement=$con->prepare($query);
         $statement->bind_param('s',$userID);
         $statement->execute();
         $res=$statement->get_result();
         while ($val=$res->fetch_assoc()){
             $data=new stdClass();
             $data->url=$val['signature_url'];
             $data->scale=$val['scale'];
             $response->esign=$data;
         }

     }
     echo json_encode($response);
}
