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
    $response->data = [];
    $response->hasMore = false;
    $response->total = 0;
    $response->currentPage = 1;
    $response->totalPages = 0;
    $response->error = '';
    $response->lastId = 0;
    $response->nextLastId = 0;
    
    try {
        // Clear buffers
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        
        ob_start();
        header('Content-Type: application/json; charset=utf-8');
        
        // Get pagination parameters
        $page = isset($_POST['page']) ? (int)$_POST['page'] : 1;
        $limit = isset($_POST['limit']) ? (int)$_POST['limit'] : 10;
        
        // Keyset pagination parameter
        $lastId = isset($_POST['lastId']) ? (int)$_POST['lastId'] : 0;
        
        // Validate pagination parameters
        if ($page < 1) $page = 1;
        if ($limit < 1 || $limit > 100) $limit = 10;
        
        $response->currentPage = $page;
        $response->lastId = $lastId;
        
        // First, get total count
        $countQuery = "SELECT COUNT(*) as total FROM endorsement WHERE endorsement.status='accepted'";
        $countResult = $con->query($countQuery);
        if ($countResult) {
            $totalRow = $countResult->fetch_assoc();
            $response->total = (int)$totalRow['total'];
            $response->totalPages = $limit > 0 ? ceil($response->total / $limit) : 0;
        } else {
            throw new Exception('Failed to get total count');
        }
        
        // Get endorsement list with KEYSET PAGINATION
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
                  WHERE endorsement.status='accepted' ";
        
        // KEYSET PAGINATION: Use WHERE id < lastId instead of OFFSET
        if ($lastId > 0) {
            $query .= "AND endorsement.id < ? ";
        }
        
        $query .= "ORDER BY endorsement.id DESC LIMIT ?";
        
        $enStatement = $con->prepare($query);
        if (!$enStatement) {
            throw new Exception('Prepare failed: ' . $con->error);
        }
        
        if ($lastId > 0) {
            $enStatement->bind_param("ii", $lastId, $limit);
        } else {
            $enStatement->bind_param("i", $limit);
        }
        
        if ($enStatement->execute()) {
            $result = $enStatement->get_result();
            
            if (!$result) {
                throw new Exception('Get result failed: ' . $enStatement->error);
            }

            $data = [];
            $smallestId = PHP_INT_MAX; // Track the smallest ID in this batch
            
            while ($val = $result->fetch_assoc()) {
                $endorsement = new stdClass();
                $endorsement->id = $val['id'];
                $endorsement->event = $val['event'];
                $endorsement->campus = $val['campus'];
                $endorsement->date = $val['date'];
                $endorsement->status = $val['status'];
                $endorsement->resStat = false;
                $endorsement->research = [];
                
                // Track the smallest ID in this batch (for next page)
                if ($val['id'] < $smallestId) {
                    $smallestId = $val['id'];
                }
                
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
                    // Use existing view URL
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
                
                // Get research files for this endorsement
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
                           GROUP BY researchfile.id
                           LIMIT 100"; // Added LIMIT to prevent memory issues
                
                $resState = $con->prepare($requery);
                if ($resState) {
                    $resState->bind_param("s", $val['id']);
                    if ($resState->execute()) {
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
                    }
                    $resState->close();
                }
                
                $data[] = $endorsement;
            }
            
            $response->data = $data;
            
            // Set nextLastId for next page (keyset pagination)
            if ($smallestId !== PHP_INT_MAX) {
                $response->nextLastId = $smallestId;
            }
            
            // Check if there are more records using KEYSET PAGINATION
            if ($smallestId !== PHP_INT_MAX && $smallestId > 1) {
                $hasMoreQuery = "SELECT 1 FROM endorsement 
                                WHERE endorsement.status='accepted' 
                                AND endorsement.id < ? 
                                LIMIT 1";
                $hasMoreStmt = $con->prepare($hasMoreQuery);
                if ($hasMoreStmt) {
                    $hasMoreStmt->bind_param("i", $smallestId);
                    $hasMoreStmt->execute();
                    $hasMoreResult = $hasMoreStmt->get_result();
                    $response->hasMore = $hasMoreResult->num_rows > 0;
                    $hasMoreResult->free();
                    $hasMoreStmt->close();
                }
            }
            
            // Free memory
            $enStatement->close();
        } else {
            throw new Exception('Query execution failed: ' . $enStatement->error);
        }
        
    } catch (Exception $e) {
        // Clean buffer and return proper error
        ob_clean();
        $response->error = $e->getMessage();
        echo json_encode($response);
        exit();
    }
    
    // Get clean output and send JSON
    ob_end_clean();
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
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