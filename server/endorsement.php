<?php
// Set header and start output buffering
header('Content-Type: application/json; charset=utf-8');
ob_start();

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include('db.php');
include_once('Mailer/mailTemplate.php');
include_once('Mailer/MailSender.php');
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
    $response = new stdClass();
    $response->status = false;
    $response->res = '';
    $response->message = '';
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docsId = $_POST['docId'];
        
        // Updated query to include both legacy and new Google Drive fields
        $query = "SELECT 
                    endorsement.file,
                    endorsement.event,
                    endorsement.drive_file_id,
                    endorsement.drive_download_url,
                    endorsement.drive_view_url,
                    endorsement.status
                  FROM endorsement 
                  WHERE endorsement.id = ?";
        
        $statement = $con->prepare($query);
        $statement->bind_param("s", $docsId);
        $statement->execute();
        $result = $statement->get_result();
        
        if ($result->num_rows > 0) {
            $val = $result->fetch_assoc();
            $data = new stdClass();
            $data->eventName = $val['event'];
            
            // Determine which file URL to use (Google Drive takes priority)
            if (!empty($val['drive_download_url']) || !empty($val['drive_view_url'])) {
                // Use Google Drive URLs
                $data->fileUrl = !empty($val['drive_download_url']) 
                    ? $val['drive_download_url'] 
                    : $val['drive_view_url'];
                $data->viewUrl = !empty($val['drive_view_url']) 
                    ? $val['drive_view_url'] 
                    : $val['drive_download_url'];
                $data->driveFileId = $val['drive_file_id'];
                $data->isGoogleDrive = true;
            } else {
                // Fallback to legacy file URL
                $data->fileUrl = $val['file'];
                $data->viewUrl = $val['file']; // Same URL for view/download in legacy
                $data->isGoogleDrive = false;
            }
            
            $data->status = $val['status'];
            
            $response->status = true;
            $response->res = $data;
        } else {
            $response->message = "Document not found";
        }
        
        $statement->close();
    } else {
        $response->message = $con->error;
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

            // Send notification email to the original sender if reason provided
            $reason = isset($_POST['reason']) ? trim($_POST['reason']) : '';

            // Fetch sender info and event
            $infoQ = "SELECT endorsement.senderid, endorsement.event, account_detail.email, account_detail.fullName FROM endorsement LEFT JOIN account_detail ON endorsement.senderid=account_detail.id WHERE endorsement.id=? LIMIT 1";
            $infoStmt = $con->prepare($infoQ);
            $infoStmt->bind_param('s', $docId);
            $infoStmt->execute();
            $infoRes = $infoStmt->get_result();
            if($row = $infoRes->fetch_assoc()){
                $toEmail = isset($row['email']) && !empty($row['email']) ? $row['email'] : '';
                
                // If email is not found in account_detail, try to get it from the senderid
                if(empty($toEmail) && isset($row['senderid'])){
                    $emailQ = "SELECT account_detail.email FROM account_detail WHERE account_detail.id=? LIMIT 1";
                    $emailStmt = $con->prepare($emailQ);
                    $emailStmt->bind_param('s', $row['senderid']);
                    $emailStmt->execute();
                    $emailRes = $emailStmt->get_result();
                    if($emailRow = $emailRes->fetch_assoc()){
                        $toEmail = isset($emailRow['email']) ? $emailRow['email'] : '';
                    }
                }
                
                $toName = isset($row['fullName']) ? $row['fullName'] : 'User';
                $eventName = isset($row['event']) ? $row['event'] : '';

                if($toEmail){
                    $from = new stdClass();
                    $from->email = isset($rdeEmail) ? $rdeEmail : '';
                    $from->password = isset($emailPassword) ? $emailPassword : '';
                    $from->name = 'Research, Development and Extension';

                    $to = new stdClass();
                    $to->name = $toName ? $toName : 'User';
                    $to->email = $toEmail;

                    $rdeStaff = isset($_SESSION['userFulname']) ? $_SESSION['userFulname'] : 'RDE Staff';
                    $url = 'http://rde.capsu.edu.ph/user';

                    $emailBody = RejectedApproval($reason, $rdeStaff, $url);
                    $emailResult = SendEmail($from, $to, $emailBody);
                    if(!$emailResult->status){
                        error_log('ReturnDocs email failed: ' . $emailResult->message);
                        $response->message = 'Email sending failed';
                    }
                }
            }

        }else{
            $response->message=$statement->error;
        }
    }
    echo json_encode($response);
}