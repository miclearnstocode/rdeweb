<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/drive_errors.log');

header('Content-Type: application/json; charset=utf-8');

ob_start(function ($buffer) {
    if (
        strpos($buffer, '<b>Warning</b>') !== false ||
        strpos($buffer, '<b>Notice</b>') !== false ||
        strpos($buffer, '<b>Fatal error</b>') !== false
    ) {

        error_log("HTML error in output buffer: " . substr($buffer, 0, 500));

        return json_encode([
            'status' => false,
            'message' => 'Server error occurred',
            'error_type' => 'html_error_in_response'
        ]);
    }
    return $buffer;
});

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

if (isset($_POST['saveAcceptanceLetter'])) {
    $response = ['status' => false, 'message' => ''];
    
    try {
        $eventId = isset($_POST['eventId']) ? intval($_POST['eventId']) : 0;
        $eventName = isset($_POST['eventName']) ? trim($_POST['eventName']) : '';
        $eventType = isset($_POST['eventType']) ? trim($_POST['eventType']) : 'ftf';
        $dateToBeHeld = isset($_POST['dateToBeHeld']) ? trim($_POST['dateToBeHeld']) : '';
        $driveLink = isset($_POST['driveLink']) ? trim($_POST['driveLink']) : '';
        $venue = isset($_POST['venue']) ? trim($_POST['venue']) : null;
        $pptDeadline = isset($_POST['pptDeadline']) ? trim($_POST['pptDeadline']) : null;
        $zoomTime = isset($_POST['zoomTime']) ? trim($_POST['zoomTime']) : null;
        $zoomLink = isset($_POST['zoomLink']) ? trim($_POST['zoomLink']) : null;
        $meetingId = isset($_POST['meetingId']) ? trim($_POST['meetingId']) : null;
        $passcode = isset($_POST['passcode']) ? trim($_POST['passcode']) : null;
        
        // Validate required fields
        if ($eventId <= 0) {
            throw new Exception('Invalid event ID');
        }
        
        if (empty($eventName)) {
            throw new Exception('Event name is required');
        }
        
        if (empty($dateToBeHeld)) {
            throw new Exception('Date to be held is required');
        }
        
        if (empty($driveLink)) {
            throw new Exception('Google Drive link is required');
        }
        
        // Validate based on event type
        if ($eventType === 'ftf') {
            if (empty($venue)) {
                throw new Exception('Venue is required for Face-to-Face events');
            }
            if (empty($pptDeadline)) {
                throw new Exception('PPT Deadline is required for Face-to-Face events');
            }
        } else if ($eventType === 'zoom') {
            if (empty($zoomTime)) {
                throw new Exception('Time is required for Zoom events');
            }
            if (empty($zoomLink)) {
                throw new Exception('Zoom link is required for Zoom events');
            }
            if (empty($meetingId)) {
                throw new Exception('Meeting ID is required for Zoom events');
            }
            if (empty($passcode)) {
                throw new Exception('Passcode is required for Zoom events');
            }
        } else {
            throw new Exception('Invalid event type. Must be "ftf" or "zoom"');
        }
        
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }
        
        // Check if record exists
        $checkStmt = $con->prepare("SELECT id FROM acceptance_letter_data WHERE event_id = ?");
        $checkStmt->bind_param("i", $eventId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        $exists = $checkResult->num_rows > 0;
        $checkStmt->close();
        
        if ($exists) {
            // Update existing record
            $stmt = $con->prepare("
                UPDATE acceptance_letter_data SET
                    event_name = ?,
                    event_type = ?,
                    date_to_be_held = ?,
                    drive_link = ?,
                    venue = ?,
                    ppt_deadline = ?,
                    zoom_time = ?,
                    zoom_link = ?,
                    meeting_id = ?,
                    passcode = ?
                WHERE event_id = ?
            ");
            $stmt->bind_param(
                "ssssssssssi",
                $eventName,
                $eventType,
                $dateToBeHeld,
                $driveLink,
                $venue,
                $pptDeadline,
                $zoomTime,
                $zoomLink,
                $meetingId,
                $passcode,
                $eventId
            );
        } else {
            // Insert new record
            $stmt = $con->prepare("
                INSERT INTO acceptance_letter_data (
                    event_id, event_name, event_type, date_to_be_held, drive_link,
                    venue, ppt_deadline, zoom_time, zoom_link, meeting_id, passcode
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->bind_param(
                "issssssssss",
                $eventId,
                $eventName,
                $eventType,
                $dateToBeHeld,
                $driveLink,
                $venue,
                $pptDeadline,
                $zoomTime,
                $zoomLink,
                $meetingId,
                $passcode
            );
        }
        
        if ($stmt->execute()) {
            $response['status'] = true;
            $response['message'] = $exists ? 'Acceptance letter data updated successfully' : 'Acceptance letter data saved successfully';
            $response['id'] = $exists ? $eventId : $con->insert_id;
        } else {
            throw new Exception('Failed to save data: ' . $stmt->error);
        }
        
        $stmt->close();
        $con->close();
        
    } catch (Exception $e) {
        error_log("saveAcceptanceLetter error: " . $e->getMessage());
        $response['status'] = false;
        $response['message'] = $e->getMessage();
    }
    
    echo json_encode($response);
    exit();
}

if (isset($_POST['getAcceptanceLetterData'])) {
    $response = ['status' => false, 'message' => '', 'data' => null];
    
    try {
        $eventId = isset($_POST['eventId']) ? intval($_POST['eventId']) : 0;
        
        if ($eventId <= 0) {
            throw new Exception('Invalid event ID');
        }
        
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }
        
        $stmt = $con->prepare("
            SELECT 
                id,
                event_id,
                event_name,
                event_type,
                date_to_be_held,
                drive_link,
                venue,
                ppt_deadline,
                zoom_time,
                zoom_link,
                meeting_id,
                passcode,
                created_at,
                updated_at
            FROM acceptance_letter_data 
            WHERE event_id = ?
        ");
        $stmt->bind_param("i", $eventId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $data = $result->fetch_assoc();
            $response['status'] = true;
            $response['data'] = $data;
            $response['message'] = 'Data found';
        } else {
            $response['status'] = false;
            $response['message'] = 'No data found for this event';
        }
        
        $stmt->close();
        $con->close();
        
    } catch (Exception $e) {
        error_log("getAcceptanceLetterData error: " . $e->getMessage());
        $response['status'] = false;
        $response['message'] = $e->getMessage();
    }
    
    echo json_encode($response);
    exit();
}

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

            $isExtension = ($val['center'] === 'Extension (Extension)');
            $data->locationType = $isExtension ? 'campus' : 'center';

            // Endorsement file - use drive_view_url only
            $endorsementFileObject = new stdClass();
            $endorsementFileObject->hasFile = false;
            
            if (!empty($val['drive_view_url'])) {
                $endorsementFileObject->driveViewUrl = $val['drive_view_url'];
                $endorsementFileObject->viewUrl = $val['drive_view_url'];
                $endorsementFileObject->fileUrl = $val['drive_view_url'];
                $endorsementFileObject->driveFileId = $val['drive_file_id'];
                $endorsementFileObject->driveDownloadUrl = $val['drive_download_url'];
                $endorsementFileObject->isGoogleDrive = true;
                $endorsementFileObject->hasFile = true;
            } elseif (!empty($val['file'])) {
                // Legacy file fallback
                $endorsementFileObject->legacyFile = $val['file'];
                $endorsementFileObject->fileUrl = $val['file'];
                $endorsementFileObject->viewUrl = $val['file'];
                $endorsementFileObject->isGoogleDrive = false;
                $endorsementFileObject->hasFile = true;
            }

            $data->file = $endorsementFileObject;

            $researchQuery = "SELECT 
                rf.id, 
                rf.senderid, 
                rf.author, 
                rf.title, 
                rf.final_symposium_title,
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
                rf.title_certificate_view_url,
                rf.center,
                rf.event,  
                rf.status, 
                rf.coauthor,
                rf.presenter,
                rf.category,
                rf.paper_trail_no,
                rf.local_inhouse,
                rf.symposium_submitted,
                rm.fund_source,
                li.program_file_view_url,
                li.program_file_download_url,
                li.certificate_file_view_url,
                li.certificate_file_download_url,
                li.document_title,
                li.campus as local_campus,
                li.main_author,
                li.co_authors,
                li.paper_trail_no as local_paper_trail_no
            FROM researchfile rf
            LEFT JOIN research_monitoring rm ON rf.id = rm.research_id
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
                $research->final_symposium_title = $v['final_symposium_title'];
                $research->center = $v['center'];
                $research->event = $v['event'];
                $research->status = $v['status'];
                $research->coauthor = $v['coauthor'];
                $research->presenter = $v['presenter'];
                $research->category = $v['category'];
                $research->paper_trail_no = $v['paper_trail_no'];
                $research->local_inhouse = (int)$v['local_inhouse'];
                $research->symposium_submitted = (int)$v['symposium_submitted'];
                $research->fundsource = $v['fund_source'];
                $research->title_certificate_view_url = $v['title_certificate_view_url']; // ADD TITLE CERTIFICATE URL
                
                // ===== TRACE IN-HOUSE SOURCE USING PAPER TRAIL NO =====
                $research->inhouse_source = null;
                $research->local_inhouse_data = null;
                
                if (!empty($v['paper_trail_no'])) {
                    $isSymposium = stripos($v['event'], 'Symposium') !== false;
                    
                    if ($isSymposium) {
                        $inhouseQuery = "SELECT 
                            rf.id as inhouse_id,
                            rf.title as inhouse_title,
                            rf.event as inhouse_event,
                            rf.author as inhouse_author,
                            rf.paper_trail_no,
                            rf.symposium_submitted,
                            el.name as event_name,
                            el.date_of_presentation
                        FROM researchfile rf
                        LEFT JOIN event_list el ON rf.event_id = el.id
                        WHERE rf.paper_trail_no = ?
                        AND (rf.event LIKE '%In-House Review%' 
                             OR rf.event LIKE '%In House Review%'
                             OR rf.event LIKE '%in-house review%'
                             OR rf.event LIKE '%in house review%')
                        AND rf.id != ?
                        LIMIT 1";
                        
                        $inhouseStmt = $con->prepare($inhouseQuery);
                        $inhouseStmt->bind_param("si", $v['paper_trail_no'], $v['id']);
                        $inhouseStmt->execute();
                        $inhouseResult = $inhouseStmt->get_result();
                        
                        if ($inhouseRow = $inhouseResult->fetch_assoc()) {
                            $research->inhouse_source = new stdClass();
                            $research->inhouse_source->id = $inhouseRow['inhouse_id'];
                            $research->inhouse_source->title = $inhouseRow['inhouse_title'];
                            $research->inhouse_source->event = $inhouseRow['inhouse_event'];
                            $research->inhouse_source->author = $inhouseRow['inhouse_author'];
                            $research->inhouse_source->paper_trail_no = $inhouseRow['paper_trail_no'];
                            $research->inhouse_source->event_name = $inhouseRow['event_name'];
                            $research->inhouse_source->date_of_presentation = $inhouseRow['date_of_presentation'];
                            $research->inhouse_source->source_type = 'researchfile';
                        }
                        $inhouseStmt->close();
                    }
                }
                
                // ===== IF NO IN-HOUSE SOURCE FOUND, CHECK local_inhouse =====
                if ($research->inhouse_source === null && $v['local_inhouse'] == 1) {
                    $localSourceQuery = "SELECT 
                        id,
                        document_title,
                        campus,
                        category,
                        center,
                        main_author,
                        co_authors,
                        local_eventname,
                        paper_trail_no,
                        created_at
                    FROM local_inhouse 
                    WHERE research_id = ?";
                    
                    $localSourceStmt = $con->prepare($localSourceQuery);
                    $localSourceStmt->bind_param("i", $v['id']);
                    $localSourceStmt->execute();
                    $localSourceResult = $localSourceStmt->get_result();
                    
                    if ($localSourceRow = $localSourceResult->fetch_assoc()) {
                        $research->local_inhouse_data = new stdClass();
                        $research->local_inhouse_data->id = $localSourceRow['id'];
                        $research->local_inhouse_data->document_title = $localSourceRow['document_title'];
                        $research->local_inhouse_data->campus = $localSourceRow['campus'];
                        $research->local_inhouse_data->category = $localSourceRow['category'];
                        $research->local_inhouse_data->center = $localSourceRow['center'];
                        $research->local_inhouse_data->main_author = $localSourceRow['main_author'];
                        $research->local_inhouse_data->local_eventname = $localSourceRow['local_eventname'];
                        $research->local_inhouse_data->paper_trail_no = $localSourceRow['paper_trail_no'];
                        $research->local_inhouse_data->created_at = $localSourceRow['created_at'];
                        $research->local_inhouse_data->source_type = 'local_inhouse';
                    }
                    $localSourceStmt->close();
                }
                
                $research->displayLocation = $isExtension ? $val['campus'] : $v['center'];
                $research->locationType = $isExtension ? 'campus' : 'center';

                // RESEARCH FILE - use drive_view_url only
                $researchFileObject = new stdClass();
                $researchFileObject->hasFile = false;
                
                if (!empty($v['drive_view_url'])) {
                    $researchFileObject->driveViewUrl = $v['drive_view_url'];
                    $researchFileObject->viewUrl = $v['drive_view_url'];
                    $researchFileObject->fileUrl = $v['drive_view_url'];
                    $researchFileObject->driveFileId = $v['drive_file_id'];
                    $researchFileObject->driveDownloadUrl = $v['drive_download_url'];
                    $researchFileObject->isGoogleDrive = true;
                    $researchFileObject->hasFile = true;
                } elseif (!empty($v['legacy_file'])) {
                    // Legacy file fallback
                    $researchFileObject->legacyFile = $v['legacy_file'];
                    $researchFileObject->fileUrl = $v['legacy_file'];
                    $researchFileObject->viewUrl = $v['legacy_file'];
                    $researchFileObject->isGoogleDrive = false;
                    $researchFileObject->hasFile = true;
                }

                $research->file = $researchFileObject;

                // PROGRAM FILE - use program_file_view_url only
                $programFileObject = null;
                if (!empty($v['program_file_view_url'])) {
                    $programFileObject = new stdClass();
                    $programFileObject->viewUrl = $v['program_file_view_url'];
                    $programFileObject->downloadUrl = $v['program_file_download_url'] ?? $v['program_file_view_url'];
                    $programFileObject->hasFile = true;
                } elseif (!empty($v['program_drive_view_url'])) {
                    // Legacy program file fallback
                    $programFileObject = new stdClass();
                    $programFileObject->viewUrl = $v['program_drive_view_url'];
                    $programFileObject->downloadUrl = $v['program_drive_view_url'];
                    $programFileObject->hasFile = true;
                }
                $research->programFile = $programFileObject;
                $research->program_drive_view_url = $programFileObject ? $programFileObject->viewUrl : null;

                // CERTIFICATE FILE - use certificate_drive_view_url only
                $certificateFileObject = null;
                if (!empty($v['certificate_drive_view_url'])) {
                    $certificateFileObject = new stdClass();
                    $certificateFileObject->viewUrl = $v['certificate_drive_view_url'];
                    $certificateFileObject->downloadUrl = $v['certificate_drive_view_url'];
                    $certificateFileObject->driveFileId = $v['certificate_drive_file_id'];
                    $certificateFileObject->hasFile = true;
                } elseif (!empty($v['certificate_file_view_url'])) {
                    // Legacy certificate file fallback (from local_inhouse)
                    $certificateFileObject = new stdClass();
                    $certificateFileObject->viewUrl = $v['certificate_file_view_url'];
                    $certificateFileObject->downloadUrl = $v['certificate_file_download_url'] ?? $v['certificate_file_view_url'];
                    $certificateFileObject->hasFile = true;
                }
                $research->certificateFile = $certificateFileObject;
                $research->certificate_drive_file_id = $certificateFileObject ? $certificateFileObject->driveFileId : null;
                $research->certificate_drive_view_url = $certificateFileObject ? $certificateFileObject->viewUrl : null;

                // TITLE CERTIFICATE - use title_certificate_view_url only
                $titleCertificateObject = null;
                if (!empty($v['title_certificate_view_url'])) {
                    $titleCertificateObject = new stdClass();
                    $titleCertificateObject->viewUrl = $v['title_certificate_view_url'];
                    $titleCertificateObject->downloadUrl = $v['title_certificate_view_url'];
                    $titleCertificateObject->hasFile = true;
                }
                $research->titleCertificateFile = $titleCertificateObject;

                // Local Inhouse Data
                $research->document_title = $v['document_title'];
                $research->local_campus = $v['local_campus'];
                $research->main_author = $v['main_author'];
                $research->co_authors = $v['co_authors'];
                $research->drive_folder_id = $v['drive_folder_id'];
                $research->drive_event_folder_id = $v['drive_event_folder_id'];
                $research->drive_center_folder_id = $v['drive_center_folder_id'];
                $research->local_paper_trail_no = $v['local_paper_trail_no'];

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

            // Update endorsement status to rejected
            $query = "UPDATE endorsement SET endorsement.status='rejected' WHERE endorsement.id=?";
            $statement = $con->prepare($query);
            $statement->bind_param("s", $docId);
            $statement->execute();

            // Update all research files under this endorsement
            $researchUpdateQuery = "UPDATE researchfile SET status='rejected' WHERE endorsementid=?";
            $researchStmt = $con->prepare($researchUpdateQuery);
            $researchStmt->bind_param("i", $docId);
            $researchStmt->execute();

            // Insert into rejecteddocs - id is AUTO_INCREMENT, so we don't specify it
            // url is NULL since we don't send it
            $query = "INSERT INTO `rejecteddocs` (`docid`, `url`, `type`, `reason`, `rejectedby`, `date`) 
                      VALUES (?, NULL, ?, ?, ?, NOW())";
            
            $statement2 = $con->prepare($query);
            $statement2->bind_param("isss", $docId, $type, $reason, $staffId);
            $statement2->execute();

            // Add document log entry for rejection
            $details = "RDE staff: $staffName rejected endorsement letter for $type from " . ($_POST['campus'] ?? 'Unknown campus') . ". Reason: $reason";
            $userId = $_SESSION['userId'];
            $logQuery = "INSERT INTO document_log (document_log.user_id, document_log.doc_id, document_log.details, document_log.date) VALUES (?, ?, ?, ?)";
            $logStmt = $con->prepare($logQuery);
            $defaultTime = date('Y-m-d H:i:s');
            $logStmt->bind_param('ssss', $userId, $docId, $details, $defaultTime);
            $logStatus = $logStmt->execute();
            
            if ($logStatus) {
                error_log("Document log entry created for rejection of endorsement ID: $docId");
            } else {
                error_log("Failed to create document log entry: " . $logStmt->error);
            }

            // Commit transaction
            $con->commit();

            $response->status = true;
            $response->message = "Document Rejected Successfully";

            // Email configuration
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
    
    $campus_escaped = $con->real_escape_string($campus);
    $eventType_escaped = $con->real_escape_string($eventType);
    
    $updateQuery = "UPDATE student_research_papers 
                    SET status = 'accepted', updated_at = NOW() 
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
    // Clear any previous output
    while (ob_get_level()) ob_end_clean();
    ob_start();
    
    $response = ['status' => false, 'message' => ''];
    
    try {
        $paperId = isset($_POST['paperId']) ? intval($_POST['paperId']) : 0;
        $reason = isset($_POST['reason']) ? trim($_POST['reason']) : '';
        
        if ($paperId <= 0) {
            throw new Exception('Invalid paper ID');
        }
        
        if (empty($reason)) {
            throw new Exception('Please provide a reason for rejection');
        }
        
        // Check if user is logged in
        if (!isset($_SESSION['userId']) || empty($_SESSION['userId'])) {
            throw new Exception('User not logged in');
        }
        
        $staffId = $_SESSION['userId'];
        $staffName = $_SESSION['userName'] ?? $_SESSION['userFulname'] ?? 'RDE Staff';
        
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }
        
        // Start transaction
        $con->begin_transaction();
        
        // Get paper details first to check if it exists and is pending
        $checkQuery = "SELECT id, title, author, event, campus FROM student_research_papers WHERE id = ? AND status = 'pending'";
        $checkStmt = $con->prepare($checkQuery);
        $checkStmt->bind_param("i", $paperId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            throw new Exception('Research paper not found or already processed');
        }
        
        $paperData = $checkResult->fetch_assoc();
        $checkStmt->close();
        
        // Update the status to 'rejected'
        $updateQuery = "UPDATE student_research_papers 
                        SET status = 'rejected', updated_at = NOW() 
                        WHERE id = ? AND status = 'pending'";
        
        $updateStmt = $con->prepare($updateQuery);
        $updateStmt->bind_param("i", $paperId);
        
        if (!$updateStmt->execute()) {
            throw new Exception('Failed to update research paper status: ' . $updateStmt->error);
        }
        
        if ($updateStmt->affected_rows === 0) {
            throw new Exception('Research paper not found or already processed');
        }
        $updateStmt->close();
        
        // Log the rejection in rejecteddocs - id is AUTO_INCREMENT
        $docId = $paperId;
        $type = 'Student Research';
        $reason = $reason;
        
        $insertRejectQuery = "INSERT INTO rejecteddocs (docid, url, type, reason, rejectedby, date) 
                              VALUES (?, NULL, ?, ?, ?, NOW())";
        $insertStmt = $con->prepare($insertRejectQuery);
        $insertStmt->bind_param("isss", $docId, $type, $reason, $staffId);
        
        if (!$insertStmt->execute()) {
            throw new Exception('Failed to log rejection: ' . $insertStmt->error);
        }
        $insertStmt->close();
        
        // Log the action in document_log
        $logQuery = "INSERT INTO document_log (user_id, doc_id, details, date) VALUES (?, ?, ?, NOW())";
        $logStmt = $con->prepare($logQuery);
        $logDetails = "RDE staff: $staffName rejected student research paper ID: $paperId. Title: " . ($paperData['title'] ?? 'N/A') . ". Reason: $reason";
        $logStmt->bind_param("iss", $staffId, $paperId, $logDetails);
        
        if (!$logStmt->execute()) {
            error_log('Failed to log rejection in document_log: ' . $logStmt->error);
        }
        $logStmt->close();
        
        // Commit transaction
        $con->commit();
        
        $response['status'] = true;
        $response['message'] = 'Research paper rejected successfully.' . ($reason ? ' Reason: ' . $reason : '');
        
        $con->close();
        
    } catch (Exception $e) {
        // Rollback transaction on error
        if (isset($con) && $con) {
            $con->rollback();
        }
        error_log("rejectStudentResearch error: " . $e->getMessage());
        $response['status'] = false;
        $response['message'] = $e->getMessage();
    }
    
    // Clear output buffer and send JSON
    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    ob_end_flush();
    exit();
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

// Get incoming poster submissions
if (isset($_POST['incomingPosterSubmissions'])) {
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT 
            ps.id,
            ps.research_id,
            ps.paper_trail_no,
            ps.sender_id,
            ps.event_id,
            ps.status,
            ps.poster_drive_file_id,
            ps.poster_drive_view_url,
            ps.poster_drive_download_url,
            ps.poster_file_name,
            ps.created_at,
            ps.updated_at,
            rf.title,
            rf.author,
            rf.coauthor,
            rf.category,
            rf.campus,
            rf.center,
            rf.event,
            el.name as event_name,
            account_detail.email as sender_email,
            account_detail.fullname as sender_name,
            account_detail.usertype as sender_type
        FROM poster_submissions ps
        LEFT JOIN researchfile rf ON ps.research_id = rf.id
        LEFT JOIN event_list el ON rf.event_id = el.id
        LEFT JOIN account_detail ON ps.sender_id = account_detail.id
        WHERE ps.status = 'pending' OR ps.status IS NULL
        ORDER BY ps.created_at DESC";
        
        $result = $con->query($query);
        
        if ($result && $result->num_rows > 0) {
            foreach ($result as $row) {
                $data = new stdClass();
                $data->id = $row['id'];
                $data->research_id = $row['research_id'];
                $data->paper_trail_no = $row['paper_trail_no'];
                $data->sender_id = $row['sender_id'];
                $data->event_id = $row['event_id'];
                $data->status = $row['status'] ?? 'pending';
                $data->title = $row['title'];
                $data->author = $row['author'];
                $data->coauthor = $row['coauthor'];
                $data->category = $row['category'];
                $data->campus = $row['campus'];
                $data->center = $row['center'];
                $data->event = $row['event'];
                $data->event_name = $row['event_name'] ?? $row['event'];
                $data->sender_email = $row['sender_email'];
                $data->sender_name = $row['sender_name'];
                $data->sender_type = $row['sender_type'];
                $data->poster_file_name = $row['poster_file_name'];
                $data->poster_drive_file_id = $row['poster_drive_file_id'];
                $data->poster_drive_view_url = $row['poster_drive_view_url'];
                $data->poster_drive_download_url = $row['poster_drive_download_url'];
                $data->created_at = $row['created_at'];
                $data->updated_at = $row['updated_at'];
                
                $response[] = $data;
            }
        }
        $con->close();
    }
    
    echo json_encode($response);
    exit();
}

// Accept Poster
if (isset($_POST['acceptPoster'])) {
    $response = ['status' => false, 'message' => ''];
    
    $posterId = isset($_POST['posterId']) ? intval($_POST['posterId']) : 0;
    
    if ($posterId <= 0) {
        $response['message'] = 'Invalid poster ID';
        echo json_encode($response);
        exit;
    }
    
    $con = new mysqli($host, $username, $pass, $dbName);
    
    if ($con->connect_error) {
        $response['message'] = 'Database connection failed: ' . $con->connect_error;
        echo json_encode($response);
        exit;
    }
    
    // Update poster status to accepted
    $updateQuery = "UPDATE poster_submissions 
                    SET status = 'accepted', updated_at = NOW() 
                    WHERE id = ? AND status = 'pending'";
    
    $stmt = $con->prepare($updateQuery);
    $stmt->bind_param("i", $posterId);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            $response['status'] = true;
            $response['message'] = 'Poster accepted successfully!';
            
            // Get research_id to update the poster_submitted flag
            $getResearchQuery = "SELECT research_id FROM poster_submissions WHERE id = ?";
            $getStmt = $con->prepare($getResearchQuery);
            $getStmt->bind_param("i", $posterId);
            $getStmt->execute();
            $result = $getStmt->get_result();
            if ($row = $result->fetch_assoc()) {
                $researchId = $row['research_id'];
                // Ensure poster_submitted is set to 1 in researchfile
                $updateFlagQuery = "UPDATE researchfile SET poster_submitted = 1 WHERE id = ?";
                $flagStmt = $con->prepare($updateFlagQuery);
                $flagStmt->bind_param("i", $researchId);
                $flagStmt->execute();
                $flagStmt->close();
            }
            $getStmt->close();
        } else {
            $response['message'] = 'Poster not found or already processed';
        }
    } else {
        $response['message'] = 'Failed to accept poster: ' . $stmt->error;
    }
    
    $stmt->close();
    $con->close();
    echo json_encode($response);
    exit();
}

// Reject Poster
if (isset($_POST['rejectPoster'])) {
    // Clear any previous output
    while (ob_get_level()) ob_end_clean();
    ob_start();
    
    $response = ['status' => false, 'message' => ''];
    
    try {
        $posterId = isset($_POST['posterId']) ? intval($_POST['posterId']) : 0;
        $reason = isset($_POST['reason']) ? trim($_POST['reason']) : '';
        
        if ($posterId <= 0) {
            throw new Exception('Invalid poster ID');
        }
        
        if (empty($reason)) {
            throw new Exception('Please provide a reason for rejection');
        }
        
        // Check if user is logged in
        if (!isset($_SESSION['userId']) || empty($_SESSION['userId'])) {
            throw new Exception('User not logged in');
        }
        
        // Get staff info for logging
        $staffId = $_SESSION['userId'];
        $staffName = $_SESSION['userName'] ?? $_SESSION['userFulname'] ?? 'RDE Staff';
        
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }
        
        // Start transaction
        $con->begin_transaction();
        
        // Get poster details first to check if it exists and is pending
        $checkQuery = "SELECT id, research_id, paper_trail_no, sender_id FROM poster_submissions WHERE id = ? AND status = 'pending'";
        $checkStmt = $con->prepare($checkQuery);
        $checkStmt->bind_param("i", $posterId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            throw new Exception('Poster not found or already processed');
        }
        
        $posterData = $checkResult->fetch_assoc();
        $checkStmt->close();
        
        // Update poster status to rejected
        $updateQuery = "UPDATE poster_submissions 
                        SET status = 'rejected', updated_at = NOW() 
                        WHERE id = ?";
        
        $stmt = $con->prepare($updateQuery);
        $stmt->bind_param("i", $posterId);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to update poster status: ' . $stmt->error);
        }
        
        if ($stmt->affected_rows === 0) {
            throw new Exception('Poster not found or already processed');
        }
        $stmt->close();
        
        // Log the rejection reason - id is AUTO_INCREMENT, so we don't specify it
        $docId = $posterId;
        $type = 'Poster';
        $staffIdStr = (string)$staffId; // Convert to string for TEXT column
        
        // Insert into rejecteddocs - id will be auto-generated, url is NULL
        $insertRejectQuery = "INSERT INTO rejecteddocs (docid, url, type, reason, rejectedby, date) 
                              VALUES (?, NULL, ?, ?, ?, NOW())";
        $insertStmt = $con->prepare($insertRejectQuery);
        $insertStmt->bind_param("isss", $docId, $type, $reason, $staffIdStr);
        
        if (!$insertStmt->execute()) {
            throw new Exception('Failed to log rejection: ' . $insertStmt->error);
        }
        $insertStmt->close();
        
        // Log the action in document_log
        $logQuery = "INSERT INTO document_log (user_id, doc_id, details, date) VALUES (?, ?, ?, NOW())";
        $logStmt = $con->prepare($logQuery);
        $logDetails = "RDE staff: $staffName rejected poster ID: $posterId. Reason: $reason";
        $logStmt->bind_param("iss", $staffId, $posterId, $logDetails);
        
        if (!$logStmt->execute()) {
            // Log failure shouldn't break the main process
            error_log('Failed to log rejection in document_log: ' . $logStmt->error);
        }
        $logStmt->close();
        
        // Commit transaction
        $con->commit();
        
        $response['status'] = true;
        $response['message'] = 'Poster rejected successfully.';
        
        $con->close();
        
    } catch (Exception $e) {
        // Rollback transaction on error
        if (isset($con) && $con) {
            $con->rollback();
        }
        error_log("rejectPoster error: " . $e->getMessage());
        $response['status'] = false;
        $response['message'] = $e->getMessage();
    }
    
    // Clear output buffer and send JSON
    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    ob_end_flush();
    exit();
}

if (isset($_POST['getAllPosters'])) {
    // Clear any previous output
    while (ob_get_level()) ob_end_clean();
    ob_start();

    $response = ['status' => false, 'message' => '', 'data' => [], 'total' => 0, 'total_pages' => 0];
    
    try {
        $searchTerm = isset($_POST['search']) ? trim($_POST['search']) : '';
        $page = isset($_POST['page']) ? intval($_POST['page']) : 1;
        $limit = isset($_POST['limit']) ? intval($_POST['limit']) : 10;
        $offset = ($page - 1) * $limit;
        
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception("Database connection failed: " . $con->connect_error);
        }
        
        // Build base query - get all posters with their associated research data
        $baseQuery = "SELECT 
            ps.id,
            ps.research_id,
            ps.paper_trail_no,
            ps.sender_id,
            ps.event_id,
            ps.poster_drive_file_id,
            ps.poster_drive_view_url,
            ps.poster_drive_download_url,
            ps.poster_file_name,
            ps.created_at,
            ps.updated_at,
            rf.title,
            rf.author,
            rf.coauthor,
            rf.presenter,
            rf.category,
            rf.campus,
            rf.center,
            rf.event,
            el.name as event_name,
            account_detail.email as sender_email,
            account_detail.fullname as sender_name,
            account_detail.usertype as sender_type
        FROM poster_submissions ps
        LEFT JOIN researchfile rf ON ps.research_id = rf.id
        LEFT JOIN event_list el ON rf.event_id = el.id
        LEFT JOIN account_detail ON ps.sender_id = account_detail.id
        WHERE 1=1";
        
        // Add search filter
        if (!empty($searchTerm)) {
            $searchPattern = '%' . $con->real_escape_string($searchTerm) . '%';
            $baseQuery .= " AND (rf.title LIKE '$searchPattern' 
                               OR rf.author LIKE '$searchPattern' 
                               OR rf.coauthor LIKE '$searchPattern'
                               OR rf.presenter LIKE '$searchPattern'
                               OR el.name LIKE '$searchPattern'
                               OR ps.paper_trail_no LIKE '$searchPattern')";
        }
        
        // Get total count
        $countQuery = "SELECT COUNT(*) as total FROM ($baseQuery) as subquery";
        $countResult = $con->query($countQuery);
        $total = 0;
        if ($countResult && $countResult->num_rows > 0) {
            $row = $countResult->fetch_assoc();
            $total = intval($row['total']);
        }
        
        // Add pagination
        $query = $baseQuery . " ORDER BY ps.created_at DESC LIMIT $offset, $limit";
        $result = $con->query($query);
        
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $poster = new stdClass();
                $poster->id = $row['id'];
                $poster->research_id = $row['research_id'];
                $poster->paper_trail_no = $row['paper_trail_no'];
                $poster->sender_id = $row['sender_id'];
                $poster->event_id = $row['event_id'];
                $poster->title = $row['title'];
                $poster->author = $row['author'];
                $poster->coauthor = $row['coauthor'];
                $poster->presenter = $row['presenter'];
                $poster->category = $row['category'];
                $poster->campus = $row['campus'];
                $poster->center = $row['center'];
                $poster->event = $row['event'];
                $poster->event_name = $row['event_name'];
                $poster->sender_email = $row['sender_email'];
                $poster->sender_name = $row['sender_name'];
                $poster->sender_type = $row['sender_type'];
                $poster->poster_file_name = $row['poster_file_name'];
                $poster->poster_drive_file_id = $row['poster_drive_file_id'];
                $poster->poster_drive_view_url = $row['poster_drive_view_url'];
                $poster->poster_drive_download_url = $row['poster_drive_download_url'];
                $poster->created_at = $row['created_at'];
                $poster->updated_at = $row['updated_at'];
                
                $response['data'][] = $poster;
            }
        }
        
        $response['status'] = true;
        $response['total'] = $total;
        $response['total_pages'] = ceil($total / $limit);
        $response['current_page'] = $page;
        $response['message'] = count($response['data']) . ' poster(s) found';
        
        $con->close();
        
    } catch (Exception $e) {
        error_log("getAllPosters error: " . $e->getMessage());
        $response['status'] = false;
        $response['message'] = $e->getMessage();
    }
    
    // Clear output buffer and send JSON
    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    ob_end_flush();
    exit();
}
// Get Best Presenter based on Quality of Presentation criteria
if (isset($_POST['getBestPresenter'])) {
    while (ob_get_level()) ob_end_clean();
    ob_start();
    
    $response = ['status' => false, 'message' => '', 'data' => []];
    
    try {
        $eventId = isset($_POST['eventId']) ? intval($_POST['eventId']) : 0;
        
        if ($eventId <= 0) {
            throw new Exception('Invalid event ID');
        }
        
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }
        
        $criteriaQuery = "SELECT id, name, percentage FROM criteria WHERE event_id = ? AND name LIKE '%Quality of Presentation%' LIMIT 1";
        $criteriaStmt = $con->prepare($criteriaQuery);
        $criteriaStmt->bind_param("i", $eventId);
        $criteriaStmt->execute();
        $criteriaResult = $criteriaStmt->get_result();
        
        if ($criteriaResult->num_rows === 0) {
            throw new Exception('Quality of Presentation criteria not found for this event');
        }
        
        $criteriaRow = $criteriaResult->fetch_assoc();
        $criteriaId = $criteriaRow['id'];
        $criteriaPercentage = $criteriaRow['percentage'] ?? 25;
        
        $criteriaStmt->close();
        
        $eventQuery = "SELECT name FROM event_list WHERE id = ?";
        $eventStmt = $con->prepare($eventQuery);
        $eventStmt->bind_param("i", $eventId);
        $eventStmt->execute();
        $eventResult = $eventStmt->get_result();
        $eventRow = $eventResult->fetch_assoc();
        $eventName = $eventRow['name'] ?? '';
        $eventStmt->close();
        
        // Check if it's a student event by looking for keywords in the name
        $isStudentEvent = false;
        if (!empty($eventName)) {
            $lowerEventName = strtolower($eventName);
            if (strpos($lowerEventName, 'undergraduate') !== false || 
                strpos($lowerEventName, 'graduate') !== false) {
                $isStudentEvent = true;
            }
        }
        
        error_log("BestPresenter - Event: $eventId, IsStudent: " . ($isStudentEvent ? 'Yes' : 'No'));
        
        $evalQuery = "
            SELECT 
                e.id as evaluator_id,
                e.fullname as evaluator_name,
                ec.category_id,
                c.name as category_name
            FROM evaluator e
            LEFT JOIN evaluator_categories ec ON e.id = ec.evaluator_id
            LEFT JOIN category c ON ec.category_id = c.id
            WHERE e.event_ids LIKE ?
            ORDER BY e.id, ec.category_id
        ";
        $evalPattern = '%' . $eventId . '%';
        $evalStmt = $con->prepare($evalQuery);
        $evalStmt->bind_param("s", $evalPattern);
        $evalStmt->execute();
        $evalResult = $evalStmt->get_result();
        
        $evaluatorCategories = [];
        $evaluatorNames = []; // Store evaluator names by ID from evaluator table
        $totalEvaluatorsByCategory = [];
        
        while ($row = $evalResult->fetch_assoc()) {
            $evalId = $row['evaluator_id'];
            $evalName = $row['evaluator_name'] ?? 'Unknown Evaluator';
            $categoryId = $row['category_id'];
            $categoryName = $row['category_name'];
            
            // Store evaluator name from evaluator table
            $evaluatorNames[$evalId] = $evalName;
            
            if (!isset($evaluatorCategories[$evalId])) {
                $evaluatorCategories[$evalId] = [
                    'id' => $evalId,
                    'name' => $evalName,
                    'categories' => []
                ];
            }
            
            if ($categoryId && $categoryName) {
                $evaluatorCategories[$evalId]['categories'][] = [
                    'id' => $categoryId,
                    'name' => $categoryName
                ];
            }
            
            // Track total evaluators per category
            if ($categoryId) {
                if (!isset($totalEvaluatorsByCategory[$categoryId])) {
                    $totalEvaluatorsByCategory[$categoryId] = [
                        'name' => $categoryName,
                        'count' => 0,
                        'evaluators' => []
                    ];
                }
                $totalEvaluatorsByCategory[$categoryId]['count']++;
                $totalEvaluatorsByCategory[$categoryId]['evaluators'][] = $evalId;
            }
        }
        $evalStmt->close();
        
        error_log("BestPresenter - Evaluator names from evaluator table: " . print_r($evaluatorNames, true));
        
        $scoreQuery = "
            SELECT 
                sb.doc_id,
                sb.score,
                sb.eval_id
            FROM score_board sb
            WHERE sb.criteria_id = ?
              AND sb.score IS NOT NULL
              AND sb.score > 0
            ORDER BY sb.doc_id, sb.eval_id
        ";
        
        $scoreStmt = $con->prepare($scoreQuery);
        $scoreStmt->bind_param("i", $criteriaId);
        $scoreStmt->execute();
        $scoreResult = $scoreStmt->get_result();
        
        $allScores = [];
        $docIds = [];
        $evaluatorScores = []; // Track which evaluators scored which documents
        
        while ($row = $scoreResult->fetch_assoc()) {
            $docId = $row['doc_id'];
            $evalId = $row['eval_id'];
            
            // Get evaluator name from the evaluator table data
            $evalName = $evaluatorNames[$evalId] ?? 'Unknown Evaluator';
            
            $allScores[] = [
                'doc_id' => $docId,
                'score' => $row['score'],
                'eval_id' => $evalId,
                'evaluator_name' => $evalName
            ];
            $docIds[] = $docId;
            
            // Track evaluator scores per document
            if (!isset($evaluatorScores[$docId])) {
                $evaluatorScores[$docId] = [];
            }
            $evaluatorScores[$docId][$evalId] = true;
        }
        $scoreStmt->close();
        
        error_log("BestPresenter - Total scores found: " . count($allScores));
        
        if (empty($allScores)) {
            throw new Exception('No scores found for Quality of Presentation criteria (ID: ' . $criteriaId . ')');
        }
        
        // Get unique doc_ids
        $uniqueDocIds = array_unique($docIds);
        $docIdPlaceholders = implode(',', array_fill(0, count($uniqueDocIds), '?'));
        $docIdTypes = str_repeat('i', count($uniqueDocIds));
        
        $docScoresMap = [];
        $validDocIds = [];
        
        if ($isStudentEvent) {
            $docCheckQuery = "
                SELECT 
                    srp.id as doc_id,
                    srp.title,
                    srp.author,
                    srp.presenter,
                    srp.coauthor,
                    srp.category,
                    srp.campus,
                    srp.event,
                    srp.paper_type,
                    srp.event_id,
                    cat.id as category_id
                FROM student_research_papers srp
                LEFT JOIN category cat ON srp.category = cat.name
                WHERE srp.id IN ($docIdPlaceholders)
                  AND srp.event_id = ?
                  AND srp.status = 'accepted'
            ";
        } else {
            $docCheckQuery = "
                SELECT 
                    rf.id as doc_id,
                    rf.title,
                    rf.final_symposium_title,
                    rf.author,
                    rf.presenter,
                    rf.coauthor,
                    rf.category,
                    rf.center,
                    rf.campus,
                    rf.event,
                    rf.event_id,
                    cat.id as category_id
                FROM researchfile rf
                INNER JOIN endorsement e ON rf.endorsementid = e.id
                LEFT JOIN category cat ON rf.category = cat.name
                WHERE rf.id IN ($docIdPlaceholders)
                  AND rf.event_id = ?
                  AND (rf.status = 'accepted' OR e.status = 'accepted')
            ";
        }
        
        $docCheckStmt = $con->prepare($docCheckQuery);
        $docCheckParams = array_merge($uniqueDocIds, [$eventId]);
        $docCheckTypes = $docIdTypes . 'i';
        $docCheckStmt->bind_param($docCheckTypes, ...$docCheckParams);
        $docCheckStmt->execute();
        $docCheckResult = $docCheckStmt->get_result();
        
        while ($row = $docCheckResult->fetch_assoc()) {
            $docId = $row['doc_id'];
            $categoryId = $row['category_id'] ?? null;
            $categoryName = $row['category'] ?? 'Uncategorized';
            $validDocIds[] = $docId;
            
            // Get evaluators for this category
            $categoryEvaluators = [];
            $categoryEvaluatorCount = 0;
            if ($categoryId && isset($totalEvaluatorsByCategory[$categoryId])) {
                $categoryEvaluators = $totalEvaluatorsByCategory[$categoryId]['evaluators'];
                $categoryEvaluatorCount = $totalEvaluatorsByCategory[$categoryId]['count'];
            }
            
            $docScoresMap[$docId] = [
                'doc_id' => $docId,
                'title' => $row['title'] ?? ($row['final_symposium_title'] ?? 'Untitled'),
                'author' => $row['author'] ?? 'Unknown',
                'presenter' => $row['presenter'] ?? $row['author'] ?? 'Unknown',
                'coauthor' => $row['coauthor'] ?? '',
                'category' => $categoryName,
                'category_id' => $categoryId,
                'campus' => $row['campus'] ?? 'N/A',
                'center' => $row['center'] ?? 'N/A',
                'event' => $row['event'] ?? $eventName,
                'paper_type' => $row['paper_type'] ?? null,
                'source_type' => $isStudentEvent ? 'student' : 'faculty',
                'scores' => [],
                'score_details' => [],
                'total_score' => 0,
                'evaluator_count' => 0,
                'total_evaluators_for_category' => $categoryEvaluatorCount,
                'category_evaluators' => $categoryEvaluators,
                'abstained_count' => 0,
                'evaluator_names' => []
            ];
        }
        $docCheckStmt->close();
        
        error_log("BestPresenter - Valid documents found: " . count($validDocIds));
        
        foreach ($allScores as $scoreRow) {
            $docId = $scoreRow['doc_id'];
            if (isset($docScoresMap[$docId])) {
                $evalId = $scoreRow['eval_id'];
                $categoryId = $docScoresMap[$docId]['category_id'];
                $categoryEvaluators = $docScoresMap[$docId]['category_evaluators'];
                
                // Check if this evaluator is assigned to this document's category
                $isValidEvaluator = empty($categoryEvaluators) || in_array($evalId, $categoryEvaluators);
                
                if ($isValidEvaluator) {
                    $scoreValue = (float)$scoreRow['score'];
                    $evaluatorName = $scoreRow['evaluator_name'] ?? 'Unknown Evaluator';
                    
                    $docScoresMap[$docId]['scores'][] = $scoreValue;
                    $docScoresMap[$docId]['total_score'] += $scoreValue;
                    $docScoresMap[$docId]['evaluator_count']++;
                    
                    if (!in_array($evaluatorName, $docScoresMap[$docId]['evaluator_names'])) {
                        $docScoresMap[$docId]['evaluator_names'][] = $evaluatorName;
                    }
                    
                    // Store detailed score info
                    $docScoresMap[$docId]['score_details'][] = [
                        'score' => $scoreValue,
                        'evaluator_name' => $evaluatorName,
                        'evaluator_id' => $evalId
                    ];
                }
            }
        }
        
        // Calculate abstentions for each document (only from category-assigned evaluators)
        foreach ($docScoresMap as $docId => &$data) {
            $categoryEvaluators = $data['category_evaluators'] ?? [];
            $totalCategoryEvaluators = $data['total_evaluators_for_category'] ?? 0;
            
            // Count how many category evaluators actually scored
            $scoredEvaluators = 0;
            if (!empty($categoryEvaluators)) {
                foreach ($categoryEvaluators as $evalId) {
                    if (isset($evaluatorScores[$docId][$evalId])) {
                        $scoredEvaluators++;
                    }
                }
            } else {
                // If no category mapping, use the scores we have
                $scoredEvaluators = $data['evaluator_count'];
            }
            
            $data['abstained_count'] = $totalCategoryEvaluators - $scoredEvaluators;
            $data['total_evaluators'] = $totalCategoryEvaluators;
        }
        
        $ranking = [];
        foreach ($docScoresMap as $docId => $data) {
            if ($data['evaluator_count'] > 0) {
                $avgScore = $data['total_score'] / $data['evaluator_count'];
                $data['average_score'] = round($avgScore, 2);
                $data['percentage'] = $criteriaPercentage;
                $ranking[] = $data;
            }
        }
        
        // Sort by average score (highest first)
        usort($ranking, function($a, $b) {
            return ($b['average_score'] ?? 0) <=> ($a['average_score'] ?? 0);
        });
        
        // Add ranks
        foreach ($ranking as $index => &$doc) {
            $doc['rank'] = $index + 1;
        }
        
        $categories = [];
        $categoryQuery = "SELECT id, name FROM category ORDER BY name ASC";
        $categoryResult = $con->query($categoryQuery);
        while ($catRow = $categoryResult->fetch_assoc()) {
            $categories[] = $catRow;
        }
        
        $response['status'] = true;
        $response['data'] = [
            'event_id' => $eventId,
            'event_name' => $eventName,
            'is_student_event' => $isStudentEvent,
            'criteria_id' => $criteriaId,
            'criteria_name' => $criteriaRow['name'],
            'criteria_percentage' => $criteriaPercentage,
            'total_evaluators' => count($evaluatorCategories),
            'total_documents' => count($ranking),
            'categories' => $categories,
            'evaluator_categories' => $evaluatorCategories,
            'evaluator_names' => $evaluatorNames,
            'ranking' => $ranking,
            'best_presenter' => !empty($ranking) ? $ranking[0] : null,
            'debug' => [
                'total_scores_found' => count($allScores),
                'unique_doc_ids' => count($uniqueDocIds),
                'valid_docs_matched' => count($validDocIds),
                'documents_with_scores' => count($docScoresMap)
            ]
        ];
        
        if (empty($ranking)) {
            $response['message'] = 'No matching documents found with scores.';
        } else {
            $response['message'] = 'Best Presenter data retrieved successfully';
        }
        
        $con->close();
        
    } catch (Exception $e) {
        error_log("getBestPresenter error: " . $e->getMessage());
        $response['status'] = false;
        $response['message'] = $e->getMessage();
    }
    
    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    ob_end_flush();
    exit();
}