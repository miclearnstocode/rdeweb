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

//new Request for incoming
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
        WHERE `status`='' OR `status` IS NULL";

        foreach ($con->query($queries) as $val) {
            $data = new stdClass();
            $data->id = $val['id'];
            $data->senderid = $val['senderid'];
            $data->center = $val['center'];
            $data->campus = $val['campus']; // This comes from account_detail
            $data->event = $val['event'];
            $data->date = $val['date'];
            $data->senderType = $val['usertype'];
            $data->senderEmail = $val['email'];
            $data->researchDocs = [];

            // Determine location type based on center
            if ($val['center'] === 'Extension') {
                $data->locationType = 'campus';
            } else {
                $data->locationType = 'center';
            }

            // Handle file URL with backward compatibility
            $legacyFile = $val['file'];
            $driveFileId = $val['drive_file_id'];
            $driveViewUrl = $val['drive_view_url'];
            $driveDownloadUrl = $val['drive_download_url'];

            // Create a unified file object
            $fileObject = new stdClass();

            // Check if we have Google Drive URLs
            $hasGoogleDrive = !empty($driveFileId) || !empty($driveViewUrl) || !empty($driveDownloadUrl);

            if ($hasGoogleDrive) {
                // We have Google Drive files
                $fileObject->fileUrl = !empty($driveDownloadUrl) ? $driveDownloadUrl : (!empty($driveViewUrl) ? $driveViewUrl : '');
                $fileObject->viewUrl = !empty($driveViewUrl) ? $driveViewUrl : (!empty($driveDownloadUrl) ? $driveDownloadUrl : '');
                $fileObject->driveFileId = $driveFileId;
                $fileObject->driveViewUrl = $driveViewUrl;
                $fileObject->driveDownloadUrl = $driveDownloadUrl;
                $fileObject->isGoogleDrive = true;
            }

            // Always include legacy file for backward compatibility
            if (!empty($legacyFile)) {
                $fileObject->legacyFile = $legacyFile;

                // If no Google Drive URL, use legacy as primary
                if (!$hasGoogleDrive) {
                    $fileObject->fileUrl = $legacyFile;
                    $fileObject->viewUrl = $legacyFile;
                    $fileObject->isGoogleDrive = false;
                }
            }

            // Set the file data as the file object (not just the URL)
            $data->file = $fileObject;

            // Query for research files
            foreach ($con->query("SELECT 
                `id`, 
                `senderid`, 
                `author`, 
                `title`, 
                `file` as legacy_file,
                `drive_view_url`,
                `drive_file_id`,
                `drive_download_url`,
                `drive_folder_id`,
                `drive_event_folder_id`,
                `drive_center_folder_id`,
                `program_drive_view_url`,
                `center`,
                `event`,  
                `status`, 
                `coauthor`,
                `presenter`,
                `category` 
            FROM `researchfile` WHERE `endorsementid`='$data->id'") as $v) {

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

                // For Extension, we'll use the campus from account_detail
                // For other centers, we'll use the center from researchfile
                if ($val['center'] === 'Extension') {
                    $research->displayLocation = $val['campus']; // Use account_detail.campus
                    $research->locationType = 'campus';
                } else {
                    $research->displayLocation = $v['center']; // Use researchfile.center
                    $research->locationType = 'center';
                }

                // Handle research file with backward compatibility
                $researchLegacyFile = $v['legacy_file'];
                $researchDriveViewUrl = $v['drive_view_url'];
                $researchDriveFileId = $v['drive_file_id'];
                $researchDriveDownloadUrl = $v['drive_download_url'];

                // Create unified research file object
                $researchFileObject = new stdClass();

                // Check if we have Google Drive for research file
                $hasResearchGoogleDrive = !empty($researchDriveFileId) || !empty($researchDriveViewUrl) || !empty($researchDriveDownloadUrl);

                if ($hasResearchGoogleDrive) {
                    // Google Drive research file
                    $researchFileObject->fileUrl = !empty($researchDriveDownloadUrl) ? $researchDriveDownloadUrl :
                        (!empty($researchDriveViewUrl) ? $researchDriveViewUrl : '');
                    $researchFileObject->viewUrl = !empty($researchDriveViewUrl) ? $researchDriveViewUrl :
                        (!empty($researchDriveDownloadUrl) ? $researchDriveDownloadUrl : '');
                    $researchFileObject->driveFileId = $researchDriveFileId;
                    $researchFileObject->driveViewUrl = $researchDriveViewUrl;
                    $researchFileObject->driveDownloadUrl = $researchDriveDownloadUrl;
                    $researchFileObject->isGoogleDrive = true;
                }

                // Always include legacy research file
                if (!empty($researchLegacyFile)) {
                    $researchFileObject->legacyFile = $researchLegacyFile;

                    // If no Google Drive URL, use legacy as primary
                    if (!$hasResearchGoogleDrive) {
                        $researchFileObject->fileUrl = $researchLegacyFile;
                        $researchFileObject->viewUrl = $researchLegacyFile;
                        $researchFileObject->isGoogleDrive = false;
                    }
                }

                $research->file = $researchFileObject;

                // Handle program file separately
                $programDriveViewUrl = $v['program_drive_view_url'];
                if (!empty($programDriveViewUrl)) {
                    $research->program_drive_view_url = $programDriveViewUrl;
                    $research->programFile = $programDriveViewUrl;
                } else {
                    $research->program_drive_view_url = null;
                    $research->programFile = null;
                }

                // Include all other fields
                $research->drive_folder_id = $v['drive_folder_id'];
                $research->drive_event_folder_id = $v['drive_event_folder_id'];
                $research->drive_center_folder_id = $v['drive_center_folder_id'];

                $data->researchDocs[] = $research;
            }
            $response[] = $data;
        }
    }
    echo json_encode($response);
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

                // ============================================
                // UNCOMMENTED AND FIXED EMAIL SENDING CODE
                // ============================================

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
        $staffEmail = ''; // This will actually store the staff's NAME (from email column)
        $staffName = '';  // This will store the username

        // Get RDE staff info from rdestaff table
        $staffQuery = "SELECT email, username FROM rdestaff WHERE id=?";
        $staffStmt = $con->prepare($staffQuery);
        $staffStmt->bind_param("i", $staffId);
        $staffStmt->execute();
        $staffRes = $staffStmt->get_result();

        if ($staffRow = $staffRes->fetch_assoc()) {
            // In rdestaff table, 'email' column actually stores the full name
            $staffEmail = $staffRow['email']; // This is the staff's FULL NAME
            $staffName = $staffRow['username']; // This is the login username
            error_log("RDE Staff Name: " . $staffEmail . " (Username: " . $staffName . ")");
        } else {
            // Fallback to account_detail if not found in rdestaff
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
            // 1. Update endorsement status
            $query = "UPDATE endorsement SET endorsement.status=? WHERE endorsement.id=?";
            $statement = $con->prepare($query);
            $state = "rejected";
            $docId = $_POST['docId'];
            $statement->bind_param("ss", $state, $docId);
            $statement->execute();

            // 2. Update researchfile status to 'rejected' (this table has the new columns)
            $researchUpdateQuery = "UPDATE researchfile SET status='rejected' WHERE endorsementid=?";
            $researchStmt = $con->prepare($researchUpdateQuery);
            $researchStmt->bind_param("i", $docId);
            $researchStmt->execute();

            // 3. Insert into rejecteddocs table (this is where rejection records should go)
            $query = "INSERT INTO `rejecteddocs`(`id`, `docid`, `url`, `type`, `reason`, `rejectedby`, `date`) VALUES (?, ?, ?, ?, ?, ?, NOW())";
            $docId = $_POST['docId'];
            $fileUrl = $_POST['fileUrl'];
            $type = $_POST['fileType'];
            $reason = $_POST['reasonEnd'] ?? 'No reason provided';
            $idEn = round(microtime(true) * 1000) . '';

            $statement2 = $con->prepare($query);
            $statement2->bind_param("ssssss", $idEn, $docId, $fileUrl, $type, $reason, $staffId);
            $statement2->execute();

            // Commit transaction
            $con->commit();

            $response->status = true;

            // Define email credentials (you should get these from a config file)
            $rdeEmail = "rde@example.com"; // Replace with actual RDE email address
            $emailPassword = "password"; // Replace with actual email password

            $from = new stdClass();
            $from->email = $rdeEmail;
            $from->password = $emailPassword;
            $from->name = 'Research, Development and Extension';

            // Get sender info for email
            $senderQuery = "SELECT 
                account_detail.email, 
                account_detail.fullName, 
                endorsement.event,
                endorsement.center
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

                // Format for display
                $formattedTitles = implode(', ', $researchTitles);
                $formattedAuthors = implode(', ', array_unique($researchAuthors));

                if (empty($formattedTitles)) {
                    $formattedTitles = "Research Document(s)";
                }

                $detailedReason = $reason;

                // Send email - make sure SendEmail function exists
                if (function_exists('SendEmail')) {
                    $emailResult = SendEmail($from, $to, RejectedEntry($detailedReason, $eventName, $formattedTitles));

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

            $response->message = "Document Rejected Successfully";

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
