<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/drive_errors.log');

header('Content-Type: application/json; charset=utf-8');

// Start output buffering with callback to catch errors
ob_start(function ($buffer) {
    // Check if the buffer contains HTML error messages
    if (
        strpos($buffer, '<b>Warning</b>') !== false ||
        strpos($buffer, '<b>Notice</b>') !== false ||
        strpos($buffer, '<b>Fatal error</b>') !== false
    ) {

        // Log the error
        error_log("HTML error in output buffer: " . substr($buffer, 0, 500));

        // Return a clean JSON error
        return json_encode([
            'status' => false,
            'message' => 'Server error occurred',
            'error_type' => 'html_error_in_response'
        ]);
    }
    return $buffer;
});

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/../config/driver_config.php';
include(__DIR__ . '/db.php');

/** @var TYPE_NAME $host */

/** @var TYPE_NAME $username */

/** @var TYPE_NAME $pass */

/** @var TYPE_NAME $dbName */

/** @var TYPE_NAME $rdeEmail */

/** @var TYPE_NAME $emailPassword */

require_once __DIR__ . '/Mailer/mailTemplate.php';
require_once __DIR__ . '/Mailer/MailSender.php';
date_default_timezone_set('Asia/Manila');

//new Request for incoming for faculty center or extension
if (isset($_POST['incomingEndorsement'])) {
    $response = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $queries = "SELECT endorsement.id, 
            endorsement.senderid,
            endorsement.center, 
            endorsement.file,  
            endorsement.drive_file_id,
            endorsement.drive_view_url,  
            endorsement.drive_download_url,
            endorsement.event, 
            endorsement.date,
            account_detail.usertype,
            account_detail.email,
            account_detail.campus 
        FROM endorsement
        LEFT JOIN account_detail ON endorsement.senderid=account_detail.id
        WHERE `status`='' OR `status` IS NULL OR `status`='pending'";

        foreach ($con->query($queries) as $val) {
            $data = new stdClass();
            $data->id = $val['id'];
            $data->senderid = $val['senderid'];
            $data->center = $val['center'];
            $data->campus = $val['campus'];
            $data->event = $val['event'];
            $data->date = $val['date'];
            $data->senderType = $val['usertype'];
            $data->senderEmail = $val['email'];
            $data->researchDocs = [];

            // Determine location type based on center (handle NULL for Extension)
            $isExtension = ($val['center'] === 'Extension' || $val['center'] === null || $val['center'] === '');
            if ($isExtension) {
                $data->locationType = 'campus';
            } else {
                $data->locationType = 'center';
            }

            // Handle file URL with backward compatibility - ENDORSEMENT LETTER
            $legacyFile = $val['file'];
            $driveFileId = $val['drive_file_id'];
            $driveViewUrl = $val['drive_view_url'];
            $driveDownloadUrl = $val['drive_download_url'];

            // Create a unified file object for ENDORSEMENT LETTER
            $fileObject = new stdClass();
            $fileObject->hasFile = false;

            // Check if we have Google Drive URLs
            $hasGoogleDrive = !empty($driveFileId) || !empty($driveViewUrl) || !empty($driveDownloadUrl);

            if ($hasGoogleDrive) {
                $fileObject->fileUrl = !empty($driveDownloadUrl) ? $driveDownloadUrl : (!empty($driveViewUrl) ? $driveViewUrl : '');
                $fileObject->viewUrl = !empty($driveViewUrl) ? $driveViewUrl : (!empty($driveDownloadUrl) ? $driveDownloadUrl : '');
                $fileObject->driveFileId = $driveFileId;
                $fileObject->driveViewUrl = $driveViewUrl;
                $fileObject->driveDownloadUrl = $driveDownloadUrl;
                $fileObject->isGoogleDrive = true;
                $fileObject->hasFile = !empty($driveViewUrl) || !empty($driveDownloadUrl);
            }

            if (!empty($legacyFile)) {
                $fileObject->legacyFile = $legacyFile;
                if (!$hasGoogleDrive) {
                    $fileObject->fileUrl = $legacyFile;
                    $fileObject->viewUrl = $legacyFile;
                    $fileObject->isGoogleDrive = false;
                    $fileObject->hasFile = true;
                }
            }

            $data->file = $fileObject;

            // Query for research files with JOIN to local_inhouse
            $researchQuery = "SELECT 
                rf.id, 
                rf.senderid, 
                rf.author, 
                rf.title, 
                rf.file as legacy_file,
                rf.drive_view_url,
                rf.drive_file_id,
                rf.drive_download_url,
                rf.drive_folder_id,
                rf.drive_event_folder_id,
                rf.drive_center_folder_id,
                rf.program_drive_view_url,
                rf.certificate_drive_file_id,
                rf.certificate_drive_view_url,
                rf.center,
                rf.event,  
                rf.status, 
                rf.coauthor,
                rf.presenter,
                rf.category,
                li.program_file_view_url,
                li.program_file_download_url,
                li.certificate_file_view_url,
                li.certificate_file_download_url,
                li.document_title,
                li.campus as local_campus,
                li.main_author,
                li.presenter as local_presenter,
                li.co_authors
            FROM researchfile rf
            LEFT JOIN local_inhouse li ON rf.id = li.research_id
            WHERE rf.endorsementid = ?";
            
            $researchStmt = $con->prepare($researchQuery);
            $researchStmt->bind_param("i", $data->id);
            $researchStmt->execute();
            $researchResult = $researchStmt->get_result();

            while ($v = $researchResult->fetch_assoc()) {
                $research = new stdClass();
                $research->id = $v['id'];
                $research->senderid = $v['senderid'];
                $research->author = $v['author'];
                $research->title = $v['title'];
                $research->center = $v['center'];
                $research->event = $v['event'];
                $research->status = $v['status'];
                $research->coauthor = $v['coauthor'];
                $research->presenter = $v['presenter'];
                $research->category = $v['category'];
                
                // Handle location display for Extension
                if ($isExtension) {
                    $research->displayLocation = $val['campus'];
                    $research->locationType = 'campus';
                } else {
                    $research->displayLocation = $v['center'];
                    $research->locationType = 'center';
                }

                // ===== FIX: Handle RESEARCH PROPOSAL/PAPER file =====
                $researchLegacyFile = $v['legacy_file'];
                $researchDriveViewUrl = $v['drive_view_url'];
                $researchDriveFileId = $v['drive_file_id'];
                $researchDriveDownloadUrl = $v['drive_download_url'];

                $researchFileObject = new stdClass();
                $researchFileObject->hasFile = false;
                $hasResearchGoogleDrive = !empty($researchDriveFileId) || !empty($researchDriveViewUrl) || !empty($researchDriveDownloadUrl);

                if ($hasResearchGoogleDrive) {
                    // PRIMARY: Use drive_view_url for viewing the research proposal
                    $researchFileObject->driveViewUrl = $researchDriveViewUrl;
                    $researchFileObject->driveFileId = $researchDriveFileId;
                    $researchFileObject->driveDownloadUrl = $researchDriveDownloadUrl;
                    
                    // Set viewUrl - PRIORITIZE drive_view_url (this is the research proposal)
                    $researchFileObject->viewUrl = !empty($researchDriveViewUrl) ? $researchDriveViewUrl : 
                        (!empty($researchDriveDownloadUrl) ? $researchDriveDownloadUrl : '');
                    
                    // Set fileUrl - use download URL if available, fallback to view URL
                    $researchFileObject->fileUrl = !empty($researchDriveDownloadUrl) ? $researchDriveDownloadUrl : 
                        (!empty($researchDriveViewUrl) ? $researchDriveViewUrl : '');
                    
                    $researchFileObject->isGoogleDrive = true;
                    $researchFileObject->hasFile = !empty($researchDriveViewUrl) || !empty($researchDriveDownloadUrl);
                }

                // If no Google Drive but legacy file exists (fallback)
                if (!empty($researchLegacyFile) && !$hasResearchGoogleDrive) {
                    $researchFileObject->legacyFile = $researchLegacyFile;
                    $researchFileObject->fileUrl = $researchLegacyFile;
                    $researchFileObject->viewUrl = $researchLegacyFile;
                    $researchFileObject->isGoogleDrive = false;
                    $researchFileObject->hasFile = true;
                }

                // If still no file, set hasFile to false
                if (empty($researchFileObject->viewUrl) && empty($researchFileObject->fileUrl)) {
                    $researchFileObject->hasFile = false;
                }

                $research->file = $researchFileObject;

                // Handle program file (from local_inhouse or researchfile)
                $programFileViewUrl = $v['program_file_view_url'] ?? null;
                $programFileDownloadUrl = $v['program_file_download_url'] ?? null;
                
                if (!empty($programFileViewUrl) || !empty($programFileDownloadUrl)) {
                    $programFileObject = new stdClass();
                    $programFileObject->viewUrl = $programFileViewUrl;
                    $programFileObject->downloadUrl = $programFileDownloadUrl;
                    $programFileObject->hasFile = !empty($programFileViewUrl);
                    $research->programFile = $programFileObject;
                    $research->program_drive_view_url = $programFileViewUrl;
                } else {
                    // Fallback to old program_drive_view_url
                    $oldProgramUrl = $v['program_drive_view_url'] ?? null;
                    if (!empty($oldProgramUrl)) {
                        $programFileObject = new stdClass();
                        $programFileObject->viewUrl = $oldProgramUrl;
                        $programFileObject->downloadUrl = $oldProgramUrl;
                        $programFileObject->hasFile = true;
                        $research->programFile = $programFileObject;
                        $research->program_drive_view_url = $oldProgramUrl;
                    } else {
                        $research->programFile = null;
                        $research->program_drive_view_url = null;
                    }
                }

                // Handle certificate file (from local_inhouse OR researchfile for center)
                $certificateFileViewUrl = $v['certificate_file_view_url'] ?? null;
                $certificateFileDownloadUrl = $v['certificate_file_download_url'] ?? null;
                $certificateDriveFileId = $v['certificate_drive_file_id'] ?? null;
                $certificateDriveViewUrl = $v['certificate_drive_view_url'] ?? null;
                
                if ($isExtension) {
                    // Extension
                    if (!empty($certificateFileViewUrl) || !empty($certificateFileDownloadUrl)) {
                        $certificateFileObject = new stdClass();
                        $certificateFileObject->viewUrl = $certificateFileViewUrl;
                        $certificateFileObject->downloadUrl = $certificateFileDownloadUrl;
                        $certificateFileObject->driveFileId = null;
                        $certificateFileObject->hasFile = !empty($certificateFileViewUrl);
                        $research->certificateFile = $certificateFileObject;
                        $research->certificate_drive_file_id = null;
                        $research->certificate_drive_view_url = $certificateFileViewUrl;
                    } else {
                        $research->certificateFile = null;
                        $research->certificate_drive_file_id = null;
                        $research->certificate_drive_view_url = null;
                    }
                } else {
                    // Center
                    if (!empty($certificateDriveFileId) || !empty($certificateDriveViewUrl)) {
                        $certificateFileObject = new stdClass();
                        $certificateFileObject->viewUrl = $certificateDriveViewUrl;
                        $certificateFileObject->downloadUrl = $certificateDriveViewUrl;
                        $certificateFileObject->driveFileId = $certificateDriveFileId;
                        $certificateFileObject->hasFile = !empty($certificateDriveViewUrl);
                        $research->certificateFile = $certificateFileObject;
                        $research->certificate_drive_file_id = $certificateDriveFileId;
                        $research->certificate_drive_view_url = $certificateDriveViewUrl;
                    } else {
                        $research->certificateFile = null;
                        $research->certificate_drive_file_id = null;
                        $research->certificate_drive_view_url = null;
                    }
                }

                // Include local_inhouse data (for Extension submissions)
                $research->document_title = $v['document_title'];
                $research->local_campus = $v['local_campus'];
                $research->main_author = $v['main_author'];
                $research->local_presenter = $v['local_presenter'];
                $research->co_authors = $v['co_authors'];
                
                // Include folder IDs
                $research->drive_folder_id = $v['drive_folder_id'];
                $research->drive_event_folder_id = $v['drive_event_folder_id'];
                $research->drive_center_folder_id = $v['drive_center_folder_id'];

                $data->researchDocs[] = $research;
            }
            $researchStmt->close();
            $response[] = $data;
        }
        $con->close();
    }
    echo json_encode($response);
    exit();
}

//acceptance of research docs by RDE staff
if (isset($_POST['acceptRequest'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $docId = $_POST['docId'];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $rdeStaff = $_SESSION['userEmail'];
        $logDate = date("Y-m-d");
        $event = $_POST['eventType'];
        $campus = $_POST['campus'];

        if ($con->query("UPDATE `endorsement` SET `status`='accepted'  WHERE `id`='$docId'")) {
            //Update ALL researchfile records under this endorsement
            $updateResearchQuery = "UPDATE `researchfile` SET `status`='accepted' WHERE `endorsementid`=?";
            $updateStmt = $con->prepare($updateResearchQuery);
            $updateStmt->bind_param("s", $docId);
            $updateStmt->execute();

            $details = "RDE staff: $rdeStaff accepted endorsement letter for $event from $campus";
            $userId = $_SESSION['userId'];
            $logQuery = "INSERT INTO document_log (document_log.user_id,document_log.doc_id,document_log.details,document_log.date) VALUES (?,?,?,?)";
            $stm = $con->prepare($logQuery);
            $defaultTime = date('Y-m-d H:i:s');
            $stm->bind_param('ssss', $userId, $docId, $details, $defaultTime);
            $status = $stm->execute();

            if ($status) {
                $response->status = true;

                $from = new stdClass();
                $from->email = $rdeEmail;
                $from->password = $emailPassword;
                $from->name = 'Research, Development and Extension';

                // Get the research papers under this endorsement
                $emailStatement = $con->prepare("SELECT 
                    DISTINCT account_detail.email, 
                    account_detail.fullName, 
                    researchfile.title, 
                    researchfile.event 
                FROM researchfile 
                LEFT JOIN account_detail ON account_detail.id = researchfile.senderid 
                WHERE researchfile.endorsementid=?");

                $emailStatement->bind_param("s", $docId);
                $emailStatement->execute();
                $emRes = $emailStatement->get_result();

                $emailCount = 0;
                while ($row = $emRes->fetch_assoc()) {
                    $to = new stdClass();
                    $to->name = $row['fullName'];
                    $to->email = $row['email'];

                    // Send acceptance email
                    $emailResult = SendEmail($from, $to, AcceptedEntry($row['event'], $row['title']));

                    if ($emailResult) {
                        $emailCount++;
                    }
                }

                if ($emailCount > 0) {
                    $response->message = "Document Accepted and email notifications sent to $emailCount submitter(s)";
                } else {
                    $response->message = "Document Accepted but no email notifications sent";
                }
            } else {
                $response->message = $stm->error;
            }
        } else {
            $response->message = $con->error;
        }
    } else {
        $response->message = $con->error;
    }

    echo json_encode($response);
}

// rejection of research docs by RDE staff
if (isset($_POST['rejectIndorse'])) {
    error_log("=== START rejectIndorse ===");
    error_log("POST data: " . print_r($_POST, true));
    error_log("Session ID: " . $_SESSION['userId']);

    $response = new stdClass();
    $response->message = "";
    $response->status = false;
    $response->emailStat = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        error_log("Database connected successfully");

        // Get current RDE staff user info
        $staffId = $_SESSION['userId'];
        $staffEmail = ''; 
        $staffName = ''; 

        // Get RDE staff info from rdestaff table
        $staffQuery = "SELECT email, username FROM rdestaff WHERE id=?";
        $staffStmt = $con->prepare($staffQuery);
        $staffStmt->bind_param("i", $staffId);
        $staffStmt->execute();
        $staffRes = $staffStmt->get_result();

        if ($staffRow = $staffRes->fetch_assoc()) {
            $staffEmail = $staffRow['email'];
            $staffName = $staffRow['username'];
            error_log("RDE Staff Name: " . $staffEmail . " (Username: " . $staffName . ")");
        } else {
            $staffQuery2 = "SELECT email, fullName FROM account_detail WHERE id=?";
            $staffStmt2 = $con->prepare($staffQuery2);
            $staffStmt2->bind_param("i", $staffId);
            $staffStmt2->execute();
            $staffRes2 = $staffStmt2->get_result();

            if ($staffRow2 = $staffRes2->fetch_assoc()) {
                $staffEmail = $staffRow2['email'];
                $staffName = $staffRow2['fullName'];
                error_log("Using account_detail fallback: " . $staffName);
            } else {
                error_log("Could not find staff info for ID: " . $staffId);
            }
        }

        // Start transaction
        $con->begin_transaction();

        try {
            $docId = $_POST['docId'];
            $reason = $_POST['reasonEnd'] ?? 'No reason provided';
            $type = $_POST['fileType'] ?? 'Unknown';

            $query = "UPDATE endorsement SET endorsement.status='rejected' WHERE endorsement.id=?";
            $statement = $con->prepare($query);
            $statement->bind_param("s", $docId);
            $statement->execute();

            $researchUpdateQuery = "UPDATE researchfile SET status='rejected' WHERE endorsementid=?";
            $researchStmt = $con->prepare($researchUpdateQuery);
            $researchStmt->bind_param("i", $docId);
            $researchStmt->execute();

            $query = "INSERT INTO `rejecteddocs`(`id`, `docid`, `url`, `type`, `reason`, `rejectedby`, `date`) VALUES (?, ?, ?, ?, ?, ?, NOW())";
            $idEn = round(microtime(true) * 1000) . '';
            $placeholderUrl = 'Status updated to rejected - no file needed';
            
            $statement2 = $con->prepare($query);
            $statement2->bind_param("ssssss", $idEn, $docId, $placeholderUrl, $type, $reason, $staffId);
            $statement2->execute();

            // Commit transaction
            $con->commit();

            $response->status = true;
            $response->message = "Document Rejected Successfully";

            $from = new stdClass();
            $from->email = $rdeEmail;
            $from->password = $emailPassword;
            $from->name = 'Research, Development and Extension';

            // Get sender info for email notification
            $senderQuery = "SELECT 
                account_detail.email, 
                account_detail.fullName, 
                endorsement.event,
                account_detail.campus
            FROM endorsement 
            LEFT JOIN account_detail ON endorsement.senderid = account_detail.id 
            WHERE endorsement.id=?";

            $senderStmt = $con->prepare($senderQuery);
            $senderStmt->bind_param("s", $docId);
            $senderStmt->execute();
            $senderRes = $senderStmt->get_result();

            if ($senderRow = $senderRes->fetch_assoc()) {
                $to = new stdClass();
                $to->name = $senderRow['fullName'];
                $to->email = $senderRow['email'];
                $eventName = $senderRow['event'];
                $campus = $senderRow['campus'] ?? 'Main';

                // Get research titles
                $titlesQuery = "SELECT title, author FROM researchfile WHERE endorsementid=?";
                $titlesStmt = $con->prepare($titlesQuery);
                $titlesStmt->bind_param("s", $docId);
                $titlesStmt->execute();
                $titlesRes = $titlesStmt->get_result();

                $researchTitles = [];
                $researchAuthors = [];
                while ($titleRow = $titlesRes->fetch_assoc()) {
                    $researchTitles[] = $titleRow['title'];
                    $researchAuthors[] = $titleRow['author'];
                }

                $formattedTitles = implode(', ', $researchTitles);
                $formattedAuthors = implode(', ', array_unique($researchAuthors));

                if (empty($formattedTitles)) {
                    $formattedTitles = "Research Document(s)";
                }

                if (function_exists('SendEmail')) {
                    $emailResult = SendEmail($from, $to, RejectedEntry($reason, $eventName, $formattedTitles));

                    if ($emailResult->status) {
                        $response->emailStat = 'Email sent successfully to ' . $to->email;
                        error_log("Email sent successfully to " . $to->email);
                    } else {
                        $response->emailStat = 'Failed to send email to ' . $to->email . ': ' . $emailResult->message;
                        error_log("Email failed: " . $emailResult->message);
                    }
                } else {
                    $response->emailStat = 'Email function not available';
                    error_log("SendEmail function not found");
                }
            } else {
                $response->emailStat = 'Could not find sender information for email';
                error_log("Could not find sender for endorsement ID: " . $docId);
            }

        } catch (Exception $e) {
            // Rollback on error
            $con->rollback();
            $response->message = "Error: " . $e->getMessage();
            error_log("Transaction failed: " . $e->getMessage());
        }
    } else {
        $response->message = "Database connection error";
    }
    echo json_encode($response);
}

if (isset($_POST['incomingStudentResearch'])) {
    $response = [];
    $paperType = isset($_POST['paper_type']) ? $_POST['paper_type'] : null; // 'undergraduate' or 'graduate'
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Base query for student research papers - PENDING status only
        $queries = "SELECT 
            srp.id,
            srp.senderid,
            srp.author,
            srp.coauthor,
            srp.presenter,
            srp.title,
            srp.event,
            srp.status,
            srp.paper_type,
            srp.category,
            srp.campus,
            srp.date_started,
            srp.date_completed,
            srp.drive_parent_folder_id,
            srp.drive_event_folder_id,
            srp.drive_category_folder_id,
            srp.drive_entry_folder_id,
            srp.research_file_view_url,
            srp.research_file_download_url,
            srp.endorsement_file_view_url,
            srp.endorsement_download_url,
            srp.created_at,
            srp.updated_at,
            account_detail.usertype as sender_type,
            account_detail.email as sender_email,
            account_detail.campus as sender_campus,
            account_detail.fullname as sender_name
        FROM student_research_papers srp
        LEFT JOIN account_detail ON srp.senderid = account_detail.id
        WHERE srp.status = 'pending'";
        
        // Filter by paper type if specified
        if ($paperType && in_array($paperType, ['undergraduate', 'graduate'])) {
            $queries .= " AND srp.paper_type = '$paperType'";
        }
        
        // Order by created date (newest first)
        $queries .= " ORDER BY srp.created_at DESC";
        
        $result = $con->query($queries);
        
        if ($result && $result->num_rows > 0) {
            foreach ($result as $val) {
                $data = new stdClass();
                $data->id = $val['id'];
                $data->senderid = $val['senderid'];
                $data->sender_name = $val['sender_name'];
                $data->sender_type = $val['sender_type'];
                $data->sender_email = $val['sender_email'];
                $data->author = $val['author'];
                $data->coauthor = $val['coauthor'];
                $data->presenter = $val['presenter'];
                $data->title = $val['title'];
                $data->event = $val['event'];
                $data->event_name = $val['event']; // For consistency
                $data->status = $val['status'];
                $data->paper_type = $val['paper_type'];
                $data->category = $val['category'];
                $data->campus = $val['campus'];
                $data->date_started = $val['date_started'];
                $data->date_completed = $val['date_completed'];
                $data->created_at = $val['created_at'];
                $data->updated_at = $val['updated_at'];
                
                // Determine location type
                if ($val['campus']) {
                    $data->locationType = 'campus';
                    $data->location = $val['campus'];
                } else {
                    $data->locationType = 'unknown';
                    $data->location = 'N/A';
                }
                
                // Create research file object (the actual paper)
                $researchFileObject = new stdClass();
                $researchFileObject->isGoogleDrive = false;
                $researchFileObject->hasFile = false;
                
                // Check for research file
                if (!empty($val['research_file_view_url'])) {
                    $researchFileObject->viewUrl = $val['research_file_view_url'];
                    $researchFileObject->downloadUrl = $val['research_file_download_url'];
                    $researchFileObject->fileUrl = !empty($val['research_file_download_url']) 
                        ? $val['research_file_download_url'] 
                        : $val['research_file_view_url'];
                    $researchFileObject->isGoogleDrive = true;
                    $researchFileObject->hasFile = true;
                    $researchFileObject->type = 'research_paper';
                }
                
                $data->research_file = $researchFileObject;
                
                // Create endorsement file object (letter of endorsement/recommendation)
                $endorsementFileObject = new stdClass();
                $endorsementFileObject->isGoogleDrive = false;
                $endorsementFileObject->hasFile = false;
                
                if (!empty($val['endorsement_file_view_url'])) {
                    $endorsementFileObject->viewUrl = $val['endorsement_file_view_url'];
                    $endorsementFileObject->downloadUrl = $val['endorsement_download_url'];
                    $endorsementFileObject->fileUrl = !empty($val['endorsement_download_url']) 
                        ? $val['endorsement_download_url'] 
                        : $val['endorsement_file_view_url'];
                    $endorsementFileObject->isGoogleDrive = true;
                    $endorsementFileObject->hasFile = true;
                    $endorsementFileObject->type = 'endorsement_letter';
                }
                
                $data->endorsement_file = $endorsementFileObject;
                
                // Add folder IDs for reference
                $data->drive_folders = [
                    'parent_folder_id' => $val['drive_parent_folder_id'],
                    'event_folder_id' => $val['drive_event_folder_id'],
                    'category_folder_id' => $val['drive_category_folder_id'],
                    'entry_folder_id' => $val['drive_entry_folder_id']
                ];
                
                $response[] = $data;
            }
        }
        $con->close();
    }
    echo json_encode($response);
}

if (isset($_POST['acceptStudentResearch'])) {
    $response = ['status' => false, 'message' => ''];
    
    $paperId = isset($_POST['paperId']) ? intval($_POST['paperId']) : 0;
    $campus = isset($_POST['campus']) ? $_POST['campus'] : '';
    $eventType = isset($_POST['eventType']) ? $_POST['eventType'] : '';
    
    if ($paperId <= 0) {
        $response['message'] = 'Invalid paper ID';
        echo json_encode($response);
        exit;
    }
    
    // Create database connection FIRST
    $con = new mysqli($host, $username, $pass, $dbName);
    
    // Check connection
    if ($con->connect_error) {
        $response['message'] = 'Database connection failed: ' . $con->connect_error;
        echo json_encode($response);
        exit;
    }
    
    // Escape strings only after connection is established
    $campus_escaped = $con->real_escape_string($campus);
    $eventType_escaped = $con->real_escape_string($eventType);
    
    // Update the status to 'approved'
    $updateQuery = "UPDATE student_research_papers 
                    SET status = 'approved', updated_at = NOW() 
                    WHERE id = $paperId AND status = 'pending'";
    
    if ($con->query($updateQuery)) {
        if ($con->affected_rows > 0) {
            $response['status'] = true;
            $response['message'] = 'Research paper accepted successfully!';
        } else {
            $response['message'] = 'Research paper not found or already processed';
        }
    } else {
        $response['message'] = 'Failed to accept research paper: ' . $con->error;
    }
    
    $con->close();
    echo json_encode($response);
}


if (isset($_POST['rejectStudentResearch'])) {
    $response = ['status' => false, 'message' => ''];
    
    $paperId = isset($_POST['paperId']) ? intval($_POST['paperId']) : 0;
    $reason = isset($_POST['reason']) ? $_POST['reason'] : '';
    
    if ($paperId <= 0) {
        $response['message'] = 'Invalid paper ID';
        echo json_encode($response);
        exit;
    }
    
    // Create database connection FIRST
    $con = new mysqli($host, $username, $pass, $dbName);
    
    // Check connection
    if ($con->connect_error) {
        $response['message'] = 'Database connection failed: ' . $con->connect_error;
        echo json_encode($response);
        exit;
    }
    
    // Escape reason string after connection is established
    $reason_escaped = $con->real_escape_string($reason);
    
    // Update the status to 'rejected'
    $updateQuery = "UPDATE student_research_papers 
                    SET status = 'rejected', updated_at = NOW() 
                    WHERE id = $paperId AND status = 'pending'";
    
    if ($con->query($updateQuery)) {
        if ($con->affected_rows > 0) {
            $response['status'] = true;
            $response['message'] = 'Research paper rejected.' . ($reason ? ' Reason: ' . $reason : '');
        } else {
            $response['message'] = 'Research paper not found or already processed';
        }
    } else {
        $response['message'] = 'Failed to reject research paper: ' . $con->error;
    }
    
    $con->close();
    echo json_encode($response);
} 

if (isset($_POST['getStudentResearchById'])) {
    $response = null;
    $paperId = isset($_POST['paperId']) ? intval($_POST['paperId']) : 0;
    
    if ($paperId > 0) {
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if (!$con->connect_error) {
            $query = "SELECT 
                srp.*,
                account_detail.usertype as sender_type,
                account_detail.email as sender_email,
                account_detail.fullname as sender_name
            FROM student_research_papers srp
            LEFT JOIN account_detail ON srp.senderid = account_detail.id
            WHERE srp.id = $paperId";
            
            $result = $con->query($query);
            
            if ($result && $result->num_rows > 0) {
                $response = $result->fetch_assoc();
            }
            $con->close();
        }
    }
    
    echo json_encode($response);
}
