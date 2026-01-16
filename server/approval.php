<?php

// Set header FIRST before any output
header('Content-Type: application/json; charset=utf-8');

// Start output buffering to catch any notices/warnings
ob_start();

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include('db.php');

/** @var TYPE_NAME $username */

/** @var TYPE_NAME $host */

/** @var TYPE_NAME $pass */

/** @var TYPE_NAME $dbName */

/** @var TYPE_NAME $rdeEmail */

/** @var TYPE_NAME $emailPassword */







/** @var TYPE_NAME $host */



/** @var TYPE_NAME $username */



/** @var TYPE_NAME $pass */



/** @var TYPE_NAME $dbName */





include_once('Mailer/mailTemplate.php');

include_once('Mailer/MailSender.php');







date_default_timezone_set('Asia/Manila');







if (isset($_POST['approvalFiles'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = 'no';

 //   $userData = unserialize($_SESSION['isLog']);

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $senderEmail =  $_SESSION['userEmail'];

        $senderId=$_SESSION['userId'];

        $signApp = $_POST['appSign'];

        $info = $_POST['info'];

        $fromName = $_SESSION['userFulname'];

        $officeFrom =$_SESSION['userOffice'];

        // Use absolute path instead of relative
        $baseDir = $_SERVER['DOCUMENT_ROOT'] . '/client/Files/approval/';
        $userDir = $baseDir . $senderId . '/';
        
        // Create directories if they don't exist
        if (!is_dir($baseDir)) {
            mkdir($baseDir, 0755, true);
        }
        if (!is_dir($userDir)) {
            mkdir($userDir, 0755, true);
        }

        $fileName = $_FILES['files']['name'];
        $path = $userDir;
        $file = $path . $fileName;

        $approval = json_decode($_POST['finalApprove']);

        $dateMain = date('Y-m-d');

        $docType=$_POST['docType'];



        if (move_uploaded_file($_FILES['files']['tmp_name'], $file)) {

            $fullFilePath = $path . $_FILES['files']['name'];



            $upQuery="INSERT INTO approval(

    approval.senderId,

    approval.senderemail,

    approval.froms, 

    approval.file,

    approval.approvalName,

    approval.approvalEmail, 

    approval.approvalId,

    approval.info,

    approval.doc_type,

    approval.office

) 

VALUES (?,?,?,?,?,?,?,?,?,?)";

            $upStatement=$con->prepare($upQuery);

            $upStatement->bind_param("ssssssssss",$senderId,$senderEmail,$fromName,$file,$approval->name,$approval->email,$approval->id,$info,$docType,$officeFrom);

            $stateUp=$upStatement->execute();

            if ($stateUp) {

                $travQ="INSERT INTO documenttravel (documenttravel.docid,documenttravel.userid,documenttravel.currentloc)

SELECT approval.id,?,? FROM approval  WHERE approval.senderId=? ORDER BY approval.id DESC LIMIT 1";



                $curLoc="Document receive by RDE staff for checking";

                $travStatement=$con->prepare($travQ);

                $travStatement->bind_param("sss",$senderId,$curLoc, $senderId);

                $ss=$travStatement->execute();

                if($ss){

                    $response->status = true;

                    $response->message = 'Success..!';

                    $from = new stdClass();

                    $from->email = $rdeEmail;

                    $from->password = $emailPassword;

                    $from->name = 'Research, Development and Extension';

                    $decSign = json_decode($signApp);

                    $ress = json_decode($_POST['appSign']);

                    for ($x = 0; $x < sizeof($ress); $x++) {

                        $resName = $ress[$x]->name;

                        $resId = $ress[$x]->id;

                        $resEmail = $ress[$x]->email;



                        $useQ="INSERT INTO userapproval(

                         userapproval.docid,

                         userapproval.fileUrl,

                         userapproval.office,

                         userapproval.userid,

                         userapproval.fullname, 

                         userapproval.email) 

SELECT approval.id,?,?,?,?,? FROM approval  WHERE approval.senderId=? ORDER BY approval.id DESC LIMIT 1";

                        $useSta=$con->prepare($useQ);

                        $useSta->bind_param('ssssss',$fullFilePath,$officeFrom,$resId,$resName,$resEmail,$senderId);

                        $useState=$useSta->execute();

                        if ($useState) {

                            $to = new stdClass();

                            $to->name = $decSign[$x]->name;

                            $to->email = $decSign[$x]->email;

                            $emailStatus = SendEmail($from, $to, FileReceive('http://rde.capsu.edu.ph/user/create/approval', $info));

                        } else {

                            $response->message .= $con->error;

                        }

                    }

                }else{

                    $response->message .= $con->error;

                }





            } else {

                $response->message .= $con->error;

            }

        } else {

            $uploadError = '';
            if (!isset($_FILES['files'])) {
                $uploadError = 'No file was uploaded.';
            } elseif (!is_dir($userDir)) {
                $uploadError = 'Upload directory does not exist: ' . $userDir;
            } elseif (!is_writable($userDir)) {
                $uploadError = 'Upload directory is not writable: ' . $userDir;
            } else {
                $uploadError = 'Failed to move uploaded file to: ' . $file;
            }
            $response->message = 'Error uploading file: ' . $uploadError;

        }

    } else {

        $response->message .= $con->error;

    }

    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();

}









if(isset($_POST['perUserApproval'])) {

//    $userData = unserialize($_SESSION['isLog']);

    $userFullName =  $_SESSION['userFulname'];

    $userId = $_SESSION['userId'];

    $response = [];



    if ($con = new mysqli($host, $username, $pass, $dbName)) {







        $approvalQuery = "SELECT `id`, `froms`, `file`,`office`, `date`, `info` FROM `approval` WHERE `status`='forwarded' AND `approvalId`='$userId' AND `approvalStatus` IS  NULL ";

        foreach ($con->query($approvalQuery) as $val){

            $docs=new stdClass();

            $docs->requiredSign=[];

            $d=$val['id'];

            $title=$val['info'];

            $inQuery="SELECT * FROM `userapproval` WHERE   `docId`='$d'";

            $approvalState=true;

            foreach ($con->query($inQuery) as $vlu){

                if($vlu['status']!=='approved'){

                    $approvalState=false;

                    break;

                }else{

                    $reqSign=new stdClass();

                    $reqSign->signLeft=$vlu['signLeft'];

                    $reqSign->signPage=$vlu['signPage'];

                    $reqSign->signTop=$vlu['signTop'];

                    $reqSign->signScale=$vlu['scale'];

                    $reqSign->signUrl=$vlu['signurl'];

                    $docs->requiredSign[]=$reqSign;

                }

            }



            if($approvalState){

                $docs->docId=$val['id'];

                $docs->docOffice=$val['office'];

                $docs->docSendDate=$val['date'];

                $docs->docUrl=$val['file'];

                $docs->title=$title;

                $docs->signUrl=json_decode($_SESSION['userEsign']);

                $response[]=$docs;

            }



        }



        foreach ($con->query("SELECT `id`, `info` FROM `approval` WHERE `status`='forwarded'") as $val){

            $d=$val['id'];

            $title=$val['info'];

            $inQuery="SELECT  `fileUrl`, `office`,  `date` FROM `userapproval` WHERE    `userid`='$userId' AND `status` IS  NULL AND `docId`='$d'";

            foreach ($con->query($inQuery) as $vl){

                $docs=new stdClass();

                $docs->requiredSig=[];

                $ddId=$val['id'];

                $inQuery2="SELECT * FROM `userapproval` WHERE   `docId`='$ddId'";

                $approvalState=true;

                foreach ($con->query($inQuery2) as $vlu){

                    if($vlu['status']==='approved'){

                        $reqSign=new stdClass();

                        $reqSign->signLeft=$vlu['signLeft'];

                        $reqSign->signPage=$vlu['signPage'];

                        $reqSign->signTop=$vlu['signTop'];

                        $reqSign->signScale=$vlu['scale'];

                        $reqSign->signUrl=$vlu['signurl'];

                        $docs->requiredSign[]=$reqSign;

                    }

                }

                $docs->docId=$val['id'];

                $docs->docOffice=$vl['office'];

                $docs->docSendDate=$vl['date'];

                $docs->docUrl=$vl['fileUrl'];

                $docs->title=$title;

                $docs->signUrl=json_decode($_SESSION['userEsign']);

                $response[]=$docs;

            }

        }









    }

    echo json_encode($response);

}









if(isset($_POST['updateApprove'])){

    $response = new stdClass();

    $response->message = '';

    $response->status = false;



    if ($con = new mysqli($host, $username, $pass, $dbName)) {

     //   $userData = unserialize($_SESSION['isLog']);

        $userID = $_SESSION['userId'];

        $userName=   $_SESSION['userFulname'];

        $urlSig=json_decode($_SESSION['userEsign']);

        $postData=json_decode($_POST['signed']);

        $docuId=$_POST['docId'];

        $doctransferstate='';

        $status='';

        $approvalSignLeft=$postData->sign->left;

        $approvalSignPage=$postData->sign->page;

        $approvalSignTop=$postData->sign->top;

        $approvalSignUrl=$urlSig->url;

        $approvalSignScale=$urlSig->scale;

        $approvalStatus=$postData->status;

        $approvalNote=$postData->note;

        $approvalDate=date('Y-m-d');

        //`approvalStatus`='',`approvalNote`='',`approvalDate`='',

        //recommending approval

        $approval=false;

        $travelQuery="INSERT INTO `documenttravel`(`docid`, `userid`, `currentloc`) VALUES ('$docuId','$userID','[$userName] Recieved..')";

        if($con->query($travelQuery)){

            if($approvalStatus==='rejected'){

                $statementRejDocs=$con->prepare("UPDATE approval SET approval.status=? WHERE approval.id=?");

                $statementRejDocs->bind_param("ss",$approvalStatus,$docuId);

                $rejStatus=$statementRejDocs->execute();

                if($rejStatus){

                    $response->status=true;

                    $approval=true;

                }else{

                    $response->message.=$con->error;

                }



            }









            $finalApStatement=$con->prepare("UPDATE approval SET

approval.status=?,

approval.approvalSignLeft=?,

approval.approvalSignTop=?,

approval.approvalPage=?,

approval.approvalSignUrl=?,

approval.approvalSignScale=?,

approval.approvalStatus=?,

approval.approvalNote=?,

approval.approvalDate=?

WHERE approval.id=? AND approval.approvalId=?");



            $finalApStatement->bind_param("sssssssssss",

                $approvalStatus,

                $approvalSignLeft,

                $approvalSignTop,

                $approvalSignPage,

                $approvalSignUrl,

                $approvalSignScale,

                $approvalStatus,

                $approvalNote,

                $approvalDate,

                $docuId,

                $userID

            );



            $finalAppStat=$finalApStatement->execute();

            if($finalAppStat){

                $response->status=true;

                $approval=true;

            }else{

                $response->message.=$con->error;

            }

/*

 *             $appQuery="UPDATE `approval` SET `status`='$approvalStatus',

                      `approvalSignLeft`='$approvalSignLeft',

                      `approvalSignTop`='$approvalSignTop',

                      `approvalPage`='$approvalSignPage',

                      `approvalSignUrl`='$approvalSignUrl',

                      `approvalSignScale`='$approvalSignScale',

                      `approvalStatus`='$approvalStatus',

                      `approvalNote`='$approvalNote',

                      `approvalDate`='$approvalDate'

                  WHERE `id`='$docuId' AND `approvalId`='$userID'";

 if($con->query($appQuery)){

                $response->status=true;

                $approval=true;

            }else{

                $response->message.=$con->error;

            }



 */







            //signature

            $signStatement=$con->prepare("UPDATE userapproval SET 

userapproval.signLeft=?,

userapproval.signTop=?,

userapproval.signPage=?,

userapproval.status=?,

userapproval.signurl=?,

userapproval.scale=?,

userapproval.note=?

WHERE userapproval.docid=? AND userapproval.userid=?");

            $signStatement->bind_param("sssssssss",$approvalSignLeft,$approvalSignTop,$approvalSignPage,$approvalStatus,$approvalSignUrl,$approvalSignScale,$approvalNote,$docuId,$userID);

            $signStat=$signStatement->execute();

            if($signStat){

                $response->status=true;

            }else{

                $response->message.=$con->error;

            }

           /*

            *  $sigQuery="UPDATE `userapproval` SET `signLeft`='$approvalSignLeft',`signTop`='$approvalSignTop',`signPage`='$approvalSignPage',`status`='$approvalStatus',`signurl`='$approvalSignUrl',`scale`='$approvalSignScale',`note`='$approvalNote' WHERE `docid`='$docuId' AND `userid`='$userID'";

            if($con->query($sigQuery)){

                $response->status=true;

            }else{

                $response->message.=$con->error;

            }

            */

        }else{

            $response->message.=$con->error;

        }



        foreach ($con->query("SELECT  `approvalStatus` FROM `approval` WHERE `id`='$docuId'") as $value){

            if($value['approvalStatus']!==null){

                if($value['approvalStatus']==='rejected'){

                    $msg='Your document ws rejected by ['.$_SESSION['userFulname'].'] Please check notes for correction. Thank you..!';

                    $travelQuery="INSERT INTO `documenttravel`(`docid`, `userid`, `currentloc`) VALUES ('$docuId','$userID','$msg')";

                }else{

                    $travelQuery="INSERT INTO `documenttravel`(`docid`, `userid`, `currentloc`) VALUES ('$docuId','$userID','Receiver have reviewed your document. Please wait for the response Thank you..!')";

                }

                if(!$con->query($travelQuery)){

                    $response->message.=$con->error;

                }

            }

        }

    }else{

        $response->message.=$con->error;

    }

    echo json_encode($response);

}









if (isset($_POST['updateApprove..'])) {

    $response = new stdClass();

    $response->message = '';

    $response->status = false;



    if ($con = new mysqli($host, $username, $pass, $dbName)) {



        $userData = unserialize($_SESSION['isLog']);

        $userID = $userData->getId();

        $docId = $_POST['docId'];

        $signed = json_decode($_POST['signed']);



        $getQuery = "SELECT * FROM `approval` WHERE `id`='$docId'";





        foreach ($con->query($getQuery) as $val) {

            $final = json_decode($val['finalapproval']);

            if ($final->id === $userID) {



                $finalSign = $_POST['signed'];

                $updateFinal = "UPDATE `approval` SET `finalapproval`='$finalSign' WHERE `id`='$docId'";

                if ($con->query($updateFinal)) {

                    $response->status = true;

                    $response->message = 'Success!';

                } else {

                    $response->message = 'Failed to update..!';

                }

            } else {

                $sign = json_decode($val['signature']);



                for ($x = 0; $x < sizeof($sign); $x++) {



                    if ($sign[$x]->id === $signed->id) {

                        $ids = $sign[$x]->id;

                        foreach ($con->query("SELECT `signature` FROM `account` WHERE `id`='$ids'") as $uVal) {

                            $sign[$x]->signurl = json_decode($uVal['signature']);

                        }



                        $sign[$x] = $signed;

                        $approval = json_encode($sign);

                        $query = "UPDATE `approval` SET `status`='approve',`signature`='$approval' WHERE `id`='$docId'";

                        for ($ab = 0; $ab < sizeof($sign); $ab++) {

                            if ($sign[$ab]->status !== "approved") {

                                $query = "UPDATE `approval` SET `status`='',`signature`='$approval' WHERE `id`='$docId'";

                                break;

                            }

                        }



                        /*

                         * create a script that identify if the user is the final aproval

                         */



                        //INSERT INTO `systemfiles`(`id`, `name`, `type`, `source`, `date`) VALUES ('[value-1]','[value-2]','[value-3]','[value-4]','[value-5]')



                        if ($con->query($query)) {

                            $response->status = true;

                            $response->message = 'Success!';

                        } else {

                            $response->message = 'Failed to update..!';

                        }

                    }

                }

            }



        }



        if (!$response->status) {

            $response->message .= 'Id not found!';

        }





    } else {

        $response->message = 'Connection failed';

    }

    echo json_encode($response);

}





















if (isset($_POST['getDocsStat'])) {

  //  $userData = unserialize($_SESSION['isLog']);

    $senderId=  $_SESSION['userId'];

    $response = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query = "SELECT * FROM `approval` WHERE `senderId`='$senderId'";

        //`id`, `senderemail`, `from`, `file`, `status`, `signature`, `info`

//" `approvalName`, `approvalEmail`, `approvalSignLeft`, `approvalSignRight`, `approvalSignTop`, `approvalSignUrl`, `approvalSignScale`, `approvalStatus`, `approvalNote`, `approvalId`,"

        foreach ($con->query($query) as $val) {

            $docIndex= $val['id'];

            $files = new stdClass();

            $files->docId = $val['id'];

            $files->from = $val['froms'];

            $files->file = $val['file'];

            $files->info = $val['info'];

            $files->date = $val['date'];

            $files->note = $val['note'];

            $files->saveState = $val['save'];

            $files->response=$val['responsedocs'];



            $files->doctransferstate=[];

            foreach ($con->query("SELECT  `currentloc`, `date` FROM `documenttravel` WHERE `docid`='$files->docId'") as $trav){

                $docLoc=new stdClass();

                //   $files->doctransferstate[]=$trav['doctransferstate'];

                $docLoc->current=$trav['currentloc'];

                $docLoc->date=$trav['date'];

                $files->doctransferstate[]=$docLoc;

            }





            $files->status=$val['status'];

            $files->signature=[];

            $files->approvalName='';

            $files->approvalStatus='';

            $files->approvalNote='';

            $files->approvalDate='';

            if($val['status']!=='returned'){

                $files->approvalName=$val['approvalName'];

                $files->approvalStatus=$val['approvalStatus'];

                $files->approvalNote=$val['approvalNote'];

                $files->approvalDate=$val['approvalDate'];

                foreach ($con->query("SELECT * FROM `userapproval` WHERE `docid`='$docIndex'") as $v){

                    $dat=new stdClass();

                    //SELECT * FROM `userapproval` WHERE `docid`=? AND `userid`AND `userid`

                    $dat->userid=$v['userid'];

                    $dat->fullname=$v['fullname'];

                    $dat->status=$v['status'];

                    $dat->note=$v['note'];

                    $dat->date=$v['updated'];

                    $files->signature[]=$dat;

                }

            }

            $response[] = $files;

        }

    }

    echo json_encode($response);

}



if (isset($_POST['ssm'])) {

    $b64 = explode(',', $_POST['saveFile'])[1];

    $bin = base64_decode($b64, true);



    $userid = $_SESSION['userId'];

    $response = new stdClass();

    $response->message = '';

    $response->status = false;

    $docId = $_POST['docId'];

    $doctype = $_POST['name'];

    $docName = $_POST['docName'];

    $sender = $_POST['sender'];

    $office = $_POST['office'];



    if (!file_exists("../client/SystemFiles/$docName")) {

        if ($con = new mysqli($host, $username, $pass, $dbName)) {

            if (strpos($bin, '%PDF') !== 0) {

                $response->message .= "File unsupported/corrupted...\n\n";

                throw new Exception('Missing the PDF file signature');

            } else {

                //client/SystemFiles

                file_put_contents("../client/SystemFiles/$docName", $bin);

                $fileSource = "../client/SystemFiles/$docName";

                $query = "UPDATE `approval` SET `save`='save' WHERE `id`='$docId'";

                if ($con->query($query)) {

                    $systemQuery = "INSERT INTO `systemfiles`(`id`, `origin`, `office`, `name`, `type`, `source`) VALUES ('$docId','$userid','$office','$sender','$doctype','$fileSource')";

                    if ($con->query($systemQuery)) {

                        $response->message .= "Save success...\n\n";

                        $response->status = true;

                    } else {

                        $response->message .= "Saving Failed...\n\n";

                    }

                } else {

                    $response->message .= "Update Failed...\n\n";

                }

            }

        } else {

            $response->message .= "Connection Failed...\n\n";

        }

    } else {

        $response->message .= "$docName [ File is already exist..! ]\n\n";

    }



    echo json_encode($response);



}



if (isset($_POST['deleteApprovalFile'])) {

    $response = new stdClass();

    $response->message = '';

    $response->status = false;

    $docId = $_POST['docId'];

    $docPath = $_POST['filePath'];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

      //  $queryq = "DELETE FROM `approval` WHERE `id`='$docId'";

        $queryN="DELETE FROM approval WHERE approval.id=? AND approval.status='returned' OR approval.status='removed' OR approval.status='rejected'";



     //   $query="DELETE approval FROM approval INNER JOIN communication ON communication.docid=approval.id WHERE approval.id=?";

        $statement=$con->prepare($queryN);

        $statement->bind_param("s",$docId).'';

        $status=$statement->execute();

        if( $status){

            if($statement->affected_rows>0){

                if (unlink($docPath)) {

                    $response->status = true;

                    $response->message = "deleted successfully..!";

                } else {

                    $response->message = "Deleted from database but fail to remove from server..!\n\n kindly report this bug to your IT department...!";

                }

            }else{

                $response->message .= "File is on process..!";

            }



        } else {

            $response->message .= "Failed to execute query";

        }

    } else {

        $response->message = "Connection Failed..!";

    }

    echo json_encode($response);

}



if(isset($_POST['docsCancel'])){

    $response = new stdClass();

    $response->message = '';

    $response->status = false;

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $docId=$_POST['docId'];

        $checkCanStatement=$con->prepare("SELECT 

EXISTS(SELECT approval.status FROM approval WHERE approval.id=? AND approval.status IS NOT NULL)+

EXISTS(SELECT userapproval.status FROM userapproval WHERE userapproval.docid=? AND userapproval.status IS NOT NULL) as total");



        $checkCanStatement->bind_param('ss',$docId,$docId);

        $checkCanStatement->execute();

        $result=$checkCanStatement->get_result();

        while ($row = $result->fetch_assoc()) {

            if($row['total']===0){

                if($con->query("UPDATE `approval` SET `status`=NULL WHERE `id`='$docId'")){

                    $response->status = true;

                }else{

                    $response->message = $con->error;

                }

            }else{

                $response->message = "Document was already reviewed.";

            }



        }





    }else{

        $response->message = $con->error;

    }

    echo json_encode($response);

}



if (isset($_POST['communication'])) {

    $idList = json_decode($_POST['idList']);

    $response = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        foreach ($con->query("SELECT * FROM `approval`") as $val) {

            $idState = true;

            if (sizeof($idList) > 0) {

                for ($x = 0; $x < sizeof($idList); $x++) {

                    if ($idList[$x] === $val['id']) {

                        $idState = false;

                        break;

                    }

                }

            }

            if ($idState) {

                if ($val['status'] === null && $val['status'] !== 'forwarded' && $val['status'] !== 'returned') {

                    $data = new stdClass();

                    $data->id = $val['id'];

                    $data->froms = $val['froms'];

                    $data->office = $val['office'];

                    $data->senderemail = $val['senderemail'];

                    $data->file = $val['file'];

                    //`docid`, `fileUrl`, `office`, `userid`, `fullname`, `email`, `signLeft`, `signTop`, `signPage`, `status`, `signurl`, `scale`, `note`, `date`

                    $dc = $val['id'];

                    $data->signature = [];



                    foreach ($con->query("SELECT * FROM `userapproval` WHERE `docid`='$dc'") as $v) {

                        $data->signature[] = $v['fullname'];

                    }

                    $data->approvalName = $val['approvalName'];

                    $data->info = $val['info'];

                    $data->date = $val['date'];

                    $data->docType=$val['doc_type'];

                    $response[] = $data;

                }



            }

        }

    }

    echo json_encode($response);

}



/*

 * status

 * #1 returned

 * #2 forwarded

 */



if (isset($_POST['correction'])) {

    $response = new stdClass();

    $response->message = '';

    $response->status = false;

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $consNote = $_POST['noteCorrection'];

        $docId = $_POST['docId'];



        //UPDATE `approval` SET `doctransferstate`='[value-5]',`status`='[value-6]',`note`='[value-7]' WHERE `id`

        if ($con->query("UPDATE `approval` SET  `status`='returned',`note`='$consNote' WHERE `id`='$docId'")) {

            $query2="SELECT approval.senderemail,account_detail.fullName FROM approval 

LEFT JOIN account_detail ON approval.senderId=account_detail.id

WHERE approval.id=? LIMIT 1";

            $stm=$con->prepare($query2);

            $stm->bind_param('s',$docId);

            $stm->execute();

            $re=$stm->get_result();

            while ($v=$re->fetch_assoc()){

                $from= new stdClass();

                $from->email = $rdeEmail;

                $from->password = $emailPassword;

                $from->name = 'Research, Development and Extension';

                $to = new stdClass();

                $to->name = $v['fullName'];

                $to->email = $v['senderemail'];

                $emailStatus = SendEmail($from, $to,RejectedApproval($consNote,  $_SESSION['userFulname'],'http://rde.capsu.edu.ph/user/create/share'));

            }

            $response->message = "Done.!";

            $response->status = true;

        } else {

            $response->message = $con->error;

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}

//forward

if (isset($_POST['forward'])) {

    $response = new stdClass();

    $response->message = '';

    $response->status = false;

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $docId = $_POST['docId'];

        $docState = [];

        $docState[] = "Documents are forwarded to designated receiver";

        $insertJSON = json_encode($docState);

        //UPDATE `approval` SET `doctransferstate`='[value-5]',`status`='[value-6]',`note`='[value-7]' WHERE `id`

        if ($con->query("UPDATE `approval` SET `status`='forwarded' WHERE `id`='$docId'")) {

            $travelUpdate="INSERT INTO `documenttravel`(`docid`, `currentloc`) VALUES ('$docId','Document is currently forwarded to designated receiver')";

            if($con->query($travelUpdate)){

                $response->status = true;

                $response->message = "Done..!";

            }

        } else {

            $response->message = $con->error;

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}



if (isset($_POST['responseUpload'])) {

    $idList = json_decode($_POST['idList']);

    $response = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        foreach ($con->query("SELECT * FROM `approval`") as $val) {

            $idState = true;

            if (sizeof($idList) > 0) {

                for ($x = 0; $x < sizeof($idList); $x++) {

                    if ($idList[$x] === $val['id']) {

                        $idState = false;

                        break;

                    }

                }

            }

            if ($idState) {

                //if (($val['approvalStatus']===NULL || $val['status']==='forwarded' ||$val['status']==='rejected')&& $val['status']!=='returned' ) {

                if (($val['status']==='forwarded'||$val['status']==='rejected'||$val['status']==='approved')&&$val['status']!=='removed') {

                    $data = new stdClass();

                    $data->id = $val['id'];

                    $data->froms = $val['froms'];

                    $data->office = $val['office'];

                    $data->senderemail = $val['senderemail'];

                    $data->file = $val['file'];

                    $data->docType=$val['doc_type'];

                    $data->info = $val['info'];

                    $data->date = $val['date'];

                    $data->status=$val['status'];

                    $data->senderId=$val['senderId'];

                    // `approvalName`, `approvalEmail`, `approvalSignLeft`, `approvalSignTop`, `approvalPage`, `approvalSignUrl`, `approvalSignScale`, `approvalStatus`, `approvalNote`, `approvalId`, `approvalDate`

                    $data->signature=[];

                    $recomendApp=new stdClass();

                    $recomendApp->fullName=$val['approvalName'];

                    $recomendApp->email=$val['approvalEmail'];

                    $recomendApp->signLeft=$val['approvalSignLeft'];

                    $recomendApp->signTop=$val['approvalSignTop'];

                    $recomendApp->signPage=$val['approvalPage'];

                    $recomendApp->status=$val['approvalStatus'];

                    $recomendApp->signUrl=$val['approvalSignUrl'];

                    $recomendApp->scale=$val['approvalSignScale'];

                    $recomendApp->note=$val['approvalNote'];

                    $recomendApp->date=$val['approvalDate'];

                    $data->signature[]=$recomendApp;

                    $retrievalQuery="SELECT  `fullname`, `email`, `signLeft`, `signTop`, `signPage`, `status`, `signurl`, `scale`, `note`, `date` FROM `userapproval` WHERE `docid`=' $data->id ' ";

                    foreach ($con->query($retrievalQuery) as $value){

                        $signature=new stdClass();

                        $signature->fullName=$value['fullname'];

                        $signature->email=$value['email'];

                        $signature->signLeft=$value['signLeft'];

                        $signature->signTop=$value['signTop'];

                        $signature->signPage=$value['signPage'];

                        $signature->status=$value['status'];

                        $signature->signUrl=$value['signurl'];

                        $signature->scale=$value['scale'];

                        $signature->note=$value['note'];

                        $signature->date=$value['date'];

                        $data->signature[]=$signature;

                    }



                    $response[] = $data;

                }



            }

        }

    }

    echo json_encode($response);

}



if(isset($_POST['responseDocument'])){

    $response = new stdClass();

    $response->message = '';

    $response->status = false;

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $fileName=$_POST['fileName'];

        $file=$_FILES['file']['name'];

        $title=$_POST['title'];

        $extendedName=$_POST['docId'];

        $sender=$_POST['sender'];

        $campus=$_POST['campus'];

        $docTYpe=$_POST['docuType'];

        $path="../client/SystemFiles/response/$extendedName-$file";



        if(move_uploaded_file($_FILES['file']['tmp_name'],$path)){

            if($con->query("UPDATE `approval` SET `responsedocs`='responded' WHERE `id`='$extendedName'")){

                $query="INSERT INTO `communication`(`docid`, `campus`, `senderid`,`rdeStaff`, `file`, `title`,`doc_type`) VALUES ('$extendedName','$campus','$sender','anonymus','$path','$title','$docTYpe')";

                if($con->query($query)){

                    $response->status=true;

                }else{

                    $response->message=$con->error;

                }

            }else{

                $response->message=$con->error;

            }

        }else{

            $response->message="Failed to upload";

        }

    }else{

        $response->message=$con->error;

    }

    echo json_encode($response);

}









if(isset($_POST['responseViewerDoc'])){

    $response=new stdClass();

    $response->status=false;

    $docId=$_POST['docId'];



    if ($con = new mysqli($host, $username, $pass, $dbName)) {



    }

    $result=$con->query("SELECT  `rdeStaff`, `file`, `campus`, `date` FROM `communication` WHERE `docid`='$docId'");

    if($result->num_rows>0){

        while ($val=$result->fetch_assoc()){

            $response->staff=$val['rdeStaff'];

            $response->file=$val['file'];

            $response->campus=$val['campus'];

            $response->date=$val['date'];

            $response->status=true;

        }

    }

    echo json_encode($response);

}











if(isset($_POST['allFile'])){

    $response=[];

    $typeFile=$_POST['typeFile'];

    $userData = unserialize($_SESSION['isLog']);

    $campus=$userData->getOffice();



    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query="";

        switch ($typeFile){

            case 'commu':

                $userId=  $_SESSION['userId'];

                $query="SELECT * FROM `communication` WHERE `campus`='$campus' AND `senderid`='$userId'";

                break;

            case 'allDocs':

                $query="SELECT * FROM `communication`";

                break;

        }

//`docid`, `campus`, `senderid`, `rdeStaff`, `file`, `date`

        foreach ($con->query($query) as $val){

            $data=new stdClass();

            $data->docid=$val['docid'];

            $data->campus=$val['campus'];

            $data->senderid=$val['senderid'];

            $data->rdeStaff=$val['rdeStaff'];

            $data->file=$val['file'];

            $data->date=$val['date'];

            $data->title=$val['title'];



            $response[]=$data;

        }



    }

    echo json_encode($response);

}











if(isset($_POST['finDocs'])){

    $response=[];

    $userData = unserialize($_SESSION['isLog']);

    $id= $_SESSION['userId'];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        //SELECT `docid`, `fileUrl`, `office`, `userid`, `fullname`, `email`, `signLeft`, `signTop`, `signPage`, `status`, `signurl`, `scale`, `note`, `date`, `updated` FROM `userapproval` WHERE 1

        $query="SELECT `fileUrl`,`docid`, `note`, `date` ,`status` FROM `userapproval` WHERE `status` IS NOT NULL  AND `userid`='$id'";

        foreach ($con->query($query) as $val){

            $docID=$val['docid'];

            $inq="SELECT `info` FROM `approval` WHERE `id`='$docID'";

            $title="";

            foreach ($con->query($inq) as $v){

                $title=$v['info'];

            }

            $data=new stdClass();

            $data->file=$val['fileUrl'];

            $data->docid=$val['docid'];

            $data->note=$val['note'];

            $data->date=$val['date'];

            $data->status=$val['status'];

            $data->title=$title;

            $response[]=$data;

        }





        $approval="SELECT `id`,`file`, `approvalNote`, `approvalStatus`,`info`,`date` FROM `approval` WHERE `approvalId`='$id' AND  `approvalStatus` IS NOT NULL ";

        foreach ($con->query($approval) as $val){

            $data=new stdClass();

            $data->file=$val['file'];

            $data->docid=$val['id'];

            $data->note=$val['approvalNote'];

            $data->date=$val['date'];

            $data->status=$val['approvalStatus'];

            $data->title=$val['info'];

            $response[]=$data;

        }



    }



    echo json_encode($response);

}



if(isset($_POST['checkState'])){

    $response=new stdClass();

    $response->status=false;

    $response->message='';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $check=$_POST['checkState'];

        $query="SELECT 

approval.responsedocs

FROM approval

WHERE approval.id=?";

        $statement=$con->prepare($query);

        $statement->bind_param('s',$check);

        $statement->execute();

        $responseDocs='';

        $result=$statement->get_result();

        while ($val=$result->fetch_assoc()){

            $responseDocs=$val['responsedocs'];

        }

        if($responseDocs==='responded'){

            $response->status=true;

        }else{

            $response->status=false;

            $response->message='Document is still on Process';

        }

    }else{

        $response->message=$con->error;

    }

    echo json_encode($response);

}





if(isset($_POST['removeQueDocs'])){

    $response=new stdClass();

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $docId=$_POST['docId'];

        $query="UPDATE approval SET approval.status='removed' WHERE approval.responsedocs='responded' AND approval.id='$docId'";

        if($con->query($query)){

            $response->status=true;

        }else{

            $response->message=$con->error;

        }

    }else{

        $response->message=$con->error;

    }

    echo json_encode($response);

}







/*

 * please fix this queries lapit nalang deadline mo!!!

 */





