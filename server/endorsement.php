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
    $response = new stdClass();
    $response->list = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Get endorsement list with proper Google Drive embed URLs
        $query = "SELECT 
                    endorsement.id, 
                    endorsement.event,
                    endorsement.campus,
                    endorsement.date,
                    endorsement.file as legacy_file,
                    endorsement.drive_file_id,
                    endorsement.drive_download_url,
                    endorsement.drive_view_url,
                    endorsement.status
                  FROM endorsement 
                  WHERE endorsement.status='accepted' 
                  ORDER BY endorsement.date DESC";
        
        $enStatement = $con->prepare($query);
        $enStatement->execute();
        $result = $enStatement->get_result();

        while ($val = $result->fetch_assoc()) {
            $endorsement = new stdClass();
            $endorsement->id = $val['id'];
            $endorsement->event = $val['event'];
            $endorsement->campus = $val['campus'];
            $endorsement->date = $val['date'];
            $endorsement->status = $val['status'];
            $endorsement->resStat = false;
            $endorsement->research = [];
            
            // Generate proper Google Drive embed URL
            $fileUrl = '';
            $viewUrl = '';
            $isGoogleDrive = false;
            
            if (!empty($val['drive_file_id'])) {
                // Google Drive file - create embed URL
                $fileUrl = "https://drive.google.com/file/d/" . $val['drive_file_id'] . "/preview";
                $viewUrl = "https://drive.google.com/file/d/" . $val['drive_file_id'] . "/view";
                $isGoogleDrive = true;
            } elseif (!empty($val['drive_view_url'])) {
                // Use existing view URL if it's already an embed URL
                $fileUrl = $val['drive_view_url'];
                $viewUrl = $val['drive_view_url'];
                $isGoogleDrive = true;
                
                // Convert share URL to embed URL if needed
                if (strpos($fileUrl, '/file/d/') !== false && strpos($fileUrl, '/preview') === false) {
                    $pattern = '/\/file\/d\/([a-zA-Z0-9_-]+)/';
                    if (preg_match($pattern, $fileUrl, $matches)) {
                        $fileUrl = "https://drive.google.com/file/d/" . $matches[1] . "/preview";
                        $viewUrl = "https://drive.google.com/file/d/" . $matches[1] . "/view";
                    }
                }
            } elseif (!empty($val['drive_download_url'])) {
                // Convert download URL to embed URL
                $pattern = '/\/file\/d\/([a-zA-Z0-9_-]+)/';
                if (preg_match($pattern, $val['drive_download_url'], $matches)) {
                    $fileUrl = "https://drive.google.com/file/d/" . $matches[1] . "/preview";
                    $viewUrl = "https://drive.google.com/file/d/" . $matches[1] . "/view";
                    $isGoogleDrive = true;
                }
            }
            
            // Legacy file fallback
            if (empty($fileUrl) && !empty($val['legacy_file'])) {
                $fileUrl = $val['legacy_file'];
                $viewUrl = $val['legacy_file'];
                $isGoogleDrive = false;
            }
            
            $endorsement->fileUrl = $fileUrl;
            $endorsement->viewUrl = $viewUrl;
            $endorsement->isGoogleDrive = $isGoogleDrive;
            $endorsement->driveFileId = !empty($val['drive_file_id']) ? $val['drive_file_id'] : null;
            
            // Get research files
            $requery = "SELECT 
                        researchfile.id,
                        researchfile.author,
                        researchfile.title,
                        researchfile.category,
                        researchfile.coauthor,
                        researchfile.file as legacy_research_file,
                        researchfile.drive_file_id,
                        researchfile.drive_view_url,
                        researchfile.drive_download_url,
                        COUNT(researchallfile.docid) as resStat 
                       FROM researchfile 
                       RIGHT JOIN endorsement ON endorsement.id = researchfile.endorsementid 
                       LEFT JOIN researchallfile ON researchfile.id = researchallfile.docid
                       WHERE researchfile.endorsementid = ?
                       GROUP BY researchfile.id";
            
            $resState = $con->prepare($requery);
            $resState->bind_param("s", $val['id']);
            $resState->execute();
            $res = $resState->get_result();
            
            while ($v = $res->fetch_assoc()) {
                $researchItem = new stdClass();
                $researchItem->id = $v['id'];
                $researchItem->author = $v['author'];
                $researchItem->title = $v['title'];
                $researchItem->category = $v['category'];
                $researchItem->coauthor = $v['coauthor'];
                $researchItem->resStat = $v['resStat'];
                
                // Generate research file URL
                $researchFileUrl = '';
                $researchIsGoogleDrive = false;
                
                if (!empty($v['drive_file_id'])) {
                    $researchFileUrl = "https://drive.google.com/file/d/" . $v['drive_file_id'] . "/preview";
                    $researchIsGoogleDrive = true;
                } elseif (!empty($v['drive_view_url'])) {
                    $researchFileUrl = $v['drive_view_url'];
                    $researchIsGoogleDrive = true;
                    
                    if (strpos($researchFileUrl, '/file/d/') !== false && strpos($researchFileUrl, '/preview') === false) {
                        $pattern = '/\/file\/d\/([a-zA-Z0-9_-]+)/';
                        if (preg_match($pattern, $researchFileUrl, $matches)) {
                            $researchFileUrl = "https://drive.google.com/file/d/" . $matches[1] . "/preview";
                        }
                    }
                } elseif (!empty($v['drive_download_url'])) {
                    $pattern = '/\/file\/d\/([a-zA-Z0-9_-]+)/';
                    if (preg_match($pattern, $v['drive_download_url'], $matches)) {
                        $researchFileUrl = "https://drive.google.com/file/d/" . $matches[1] . "/preview";
                        $researchIsGoogleDrive = true;
                    }
                }
                
                if (empty($researchFileUrl) && !empty($v['legacy_research_file'])) {
                    $researchFileUrl = $v['legacy_research_file'];
                    $researchIsGoogleDrive = false;
                }
                
                $researchItem->researchFile = $researchFileUrl;
                $researchItem->isGoogleDrive = $researchIsGoogleDrive;
                
                $endorsement->research[] = $researchItem;
                
                if ($v['resStat'] != 0) {
                    $endorsement->resStat = true;
                }
            }
            
            $response->list[] = $endorsement;
        }
        
        $enStatement->close();
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