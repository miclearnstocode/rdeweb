<?php
// For debugging - output errors to log file, NOT to browser
error_reporting(E_ALL);
ini_set('display_errors', 0); // DO NOT display errors - breaks JSON
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/drive_errors.log');

header('Content-Type: application/json; charset=utf-8');

// Start output buffering with callback to catch errors
ob_start(function($buffer) {
    // Check if the buffer contains HTML error messages
    if (strpos($buffer, '<b>Warning</b>') !== false || 
        strpos($buffer, '<b>Notice</b>') !== false ||
        strpos($buffer, '<b>Fatal error</b>') !== false) {
        
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

// Function to get center code from center name (fixed mapping)
function getCenterCode($centerName) {
    // Mapping of full center names to their codes
    $centerMapping = [
        'Crop Science Research & Developement Center' => 'CSRDC',
        'Crop Science Research & Development Center' => 'CSRDC', // Alternative spelling
        'Livestock Research & Development Center' => 'LRDC',
        'Fisheries Research & Development Center' => 'FRDC',
        'Food and Industrial Technology Research & Development Center' => 'FIRDC',
        'Food and Industrial Technology Research & Developm...' => 'FIRDC', // Truncated version
        'Social Science Research & Development Center' => 'SSRDC',
        'Machinery and Agricultural Technology Engineering Center' => 'MATEC',
        'Coconut Research and Development Center' => 'CocoRDC',
        'Coconut Research and Development Center (Coco RDC)' => 'CocoRDC',
        'Extension' => 'Extension'
    ];
    
    // Try exact match first
    if (isset($centerMapping[$centerName])) {
        return $centerMapping[$centerName];
    }
    
    // Try partial match for truncated names
    foreach ($centerMapping as $key => $code) {
        if (strpos($centerName, substr($key, 0, 20)) !== false) {
            return $code;
        }
    }
    
    // Try to extract code from name (e.g., "Coconut Research and Development Center (Coco RDC)")
    if (preg_match('/\(([^)]+)\)/', $centerName, $matches)) {
        $code = preg_replace('/[^a-zA-Z]/', '', $matches[1]);
        if (!empty($code)) {
            return $code;
        }
    }
    
    // Extract initials as fallback
    $words = explode(' ', $centerName);
    $code = '';
    foreach ($words as $word) {
        if (ctype_upper(substr($word, 0, 1))) {
            $code .= substr($word, 0, 1);
        }
    }
    
    return !empty($code) ? $code : 'END';
}

function uploadResearchToDrive($tempFilePath, $fileName, $eventName, $centerName, $category, $author, $title, $type = 'research', $isProgram = false, $isEndorsement = false) {
    try {
        // Check if file exists
        if (!file_exists($tempFilePath)) {
            error_log("File not found: $tempFilePath");
            throw new Exception("Temporary file not found: $tempFilePath");
        }
        
        // Check file size (optional - max 10MB)
        $fileSize = filesize($tempFilePath);
        if ($fileSize > 10 * 1024 * 1024) { // 10MB
            throw new Exception("File too large: " . round($fileSize / 1024 / 1024, 2) . "MB");
        }
        
        // Include Drive config
        require_once __DIR__ . '/../config/driver_config.php';
        
        if (!class_exists('GoogleDriveService')) {
            throw new Exception("GoogleDriveService class not found");
        }
        
        $drive = new GoogleDriveService();
        
        // Clean names for Google Drive
        $cleanEventName = cleanFolderNameForDrive($eventName);
        $cleanCenterName = cleanFolderNameForDrive($centerName);
        $cleanCategoryName = cleanFolderNameForDrive($category);
        
        // Get author's last name for folder naming
        $authorParts = explode(' ', trim($author));
        $authorLastName = end($authorParts);
        $authorLastName = cleanFolderNameForDrive($authorLastName);
        
        // Get first three words of title for keyword
        $titleWords = explode(' ', trim($title));
        $titleKeywords = implode('_', array_slice($titleWords, 0, 3));
        $titleKeywords = cleanFolderNameForDrive($titleKeywords);
        
        // Create entry folder name: lastname_keyword
        $entryFolderName = $authorLastName . '_' . $titleKeywords;
        
        error_log("Creating folder structure for: $eventName -> $centerName -> $category -> $entryFolderName");
        
        // Create complete folder structure
        $folders = $drive->createCompleteFolderStructure(
            $cleanEventName,
            $cleanCenterName,
            $cleanCategoryName,
            $entryFolderName
        );
        
        if (empty($folders['entry_folder_id'])) {
            error_log("Failed to create entry folder structure: " . json_encode($folders));
            throw new Exception("Failed to create entry folder structure");
        }
        
        // Determine which folder to upload to based on file type
        $targetFolderId = $folders['entry_folder_id'];
        
        // 2. Upload the file to appropriate folder
        error_log("Uploading $type file: $fileName to folder: $targetFolderId");
        $uploadResult = $drive->uploadFile(
            $tempFilePath,
            $fileName,
            $targetFolderId
        );

        // Check if upload was successful
        if (!$uploadResult['success'] || empty($uploadResult['id'])) {
            $errorMsg = $uploadResult['error'] ?? "Upload failed: No file ID returned from Google Drive";
            error_log("Google Drive upload failed for $fileName: $errorMsg");
            throw new Exception($errorMsg);
        }
        
        // 3. Make file publicly viewable
        error_log("Making file public: " . $uploadResult['id']);
        $drive->makeFilePublic($uploadResult['id']);
        
        // 4. Generate proper URLs
        $fileId = $uploadResult['id'];
        $embedUrl = "https://drive.google.com/file/d/{$fileId}/preview";
        
        // 5. Return success with all metadata
        $result = [
            'success' => true,
            'drive_file_id' => $uploadResult['id'],
            'drive_view_url' => $embedUrl,
            'drive_download_url' => "https://drive.google.com/uc?id={$fileId}&export=download",
            'drive_folder_id' => $targetFolderId, // This is the entry folder ID
            'drive_event_folder_id' => $folders['event_folder_id'] ?? null,
            'drive_center_folder_id' => $folders['center_folder_id'] ?? null,
            'drive_category_folder_id' => $folders['category_folder_id'] ?? null,
            'drive_entry_folder_id' => $folders['entry_folder_id'] ?? null,
            'file_size' => $uploadResult['size'] ?? 0,
            'file_name' => $uploadResult['name'] ?? $fileName,
            'center_name' => $centerName,
            'category_name' => $category,
            'entry_folder_name' => $entryFolderName
        ];
        
        error_log("$type file upload successful: " . $fileName);
        return $result;
        
    } catch (Exception $e) {
        error_log("Google Drive upload failed for $fileName: " . $e->getMessage());
        throw new Exception("Failed to upload $fileName to Google Drive: " . $e->getMessage());
    }
}

// Helper function to clean folder names for Google Drive
function cleanFolderNameForDrive($name) {
    if (empty($name)) {
        return 'Untitled_' . time();
    }
    
    // Remove special characters that Google Drive doesn't like
    $clean = preg_replace('/[^\w\s\-_.,()&]/', '', $name);
    
    // Replace multiple spaces with single space
    $clean = preg_replace('/\s+/', ' ', $clean);
    
    // Trim whitespace
    $clean = trim($clean);
    
    // Remove trailing periods and commas
    $clean = rtrim($clean, '.,');
    
    // If too long, truncate (Google Drive has 255 char limit)
    if (strlen($clean) > 200) {
        $clean = substr($clean, 0, 197) . '...';
    }
    
    return $clean;
}
function getResearchFileUrl($researchRecord) {
    // Priority: 1. Drive URL, 2. Local file path, 3. Empty string
    if (!empty($researchRecord['drive_view_url'])) {
        return [
            'url' => $researchRecord['drive_view_url'],
            'type' => 'drive',
            'download_url' => $researchRecord['drive_download_url'] ?? null,
            'file_id' => $researchRecord['drive_file_id'] ?? null
        ];
    } elseif (!empty($researchRecord['file'])) {
        return [
            'url' => $researchRecord['file'],
            'type' => 'local',
            'download_url' => $researchRecord['file'],
            'file_id' => null
        ];
    } else {
        return [
            'url' => '',
            'type' => 'none',
            'download_url' => '',
            'file_id' => null
        ];
    }
}

if (isset($_POST['uploadResearch'])) {
    // Temporarily disable the error-catching output buffer
    ob_end_clean();
    
    // Start new buffer without callback
    ob_start();
    
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
    
    $center = $_POST['center'] ?? ''; // Use center from POST, not campus
    $senderId = $_SESSION['userId'];
    $response = new stdClass();
    $response->message = '';
    $response->serverMessage = "";
    $response->status = false;
    $response->debug = [];
    
    try {
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            // Test connection
            if ($con->connect_error) {
                throw new Exception("Database connection failed: " . $con->connect_error);
            }
            
            $eventType = $_POST['eventType'];
            $checkQuery = "SELECT COUNT(*) FROM event_list WHERE event_list.name=? AND event_list.dead_line>CURRENT_TIMESTAMP";
            $checkStatement = $con->prepare($checkQuery);
            if (!$checkStatement) {
                throw new Exception("Prepare failed: " . $con->error);
            }
            
            $checkStatement->bind_param("s", $eventType);
            $checkStatement->execute();
            $resss = $checkStatement->get_result()->fetch_row();

            if ($resss[0] !== 0) {
                $userDisignation = $_SESSION['userDesignation'];
                if(true) { // Temporarily bypass permission check
                    
                    // Get research data from POST (single entry)
                    $title = $_POST['title'];
                    $author = $_POST['author'];
                    $category = $_POST['category'];
                    $center = $_POST['center']; // This is the center name
                    $coAuthor = $_POST['coAuthor'] ?? '[]';
                    $presenter = $_POST['presenter'];
                    
                    // Debug log
                    error_log("=== STARTING UPLOAD PROCESS ===");
                    error_log("Title: $title");
                    error_log("Author: $author");
                    error_log("Event: $eventType");
                    error_log("Center: $center");
                    error_log("Category: $category");
                    
                    // 1. Upload Endorsement Letter to Google Drive
                    if (!isset($_FILES['uploadedFileEndorsement']) || $_FILES['uploadedFileEndorsement']['error'] !== UPLOAD_ERR_OK) {
                        throw new Exception('Endorsement letter upload failed. Error code: ' . ($_FILES['uploadedFileEndorsement']['error'] ?? 'NO_FILE'));
                    }
                    
                    $tempEndorsementPath = $_FILES['uploadedFileEndorsement']['tmp_name'];
                    $endorsementFileName = $_FILES['uploadedFileEndorsement']['name'];
                    
                    error_log("Uploading endorsement: $endorsementFileName");
                    
                    // Upload endorsement to Drive
                    $endorsementDriveResult = uploadResearchToDrive(
                        $tempEndorsementPath,
                        $endorsementFileName,
                        $eventType,
                        $center,
                        $category,
                        $author,
                        $title,
                        'endorsement',
                        false,
                        true
                    );
                    
                    if (!$endorsementDriveResult['success']) {
                        throw new Exception("Endorsement upload failed: " . ($endorsementDriveResult['error'] ?? 'Unknown error'));
                    }
                    
                    error_log("Endorsement uploaded successfully: " . $endorsementDriveResult['drive_file_id']);
                    
                    // Insert endorsement record with Drive metadata
                    $defaultTime = date('Y-m-d H:i:s');
                    
                    // FIXED: Removed duplicate center column and corrected number of placeholders
                    $query2 = "INSERT INTO endorsement (
                        endorsement.senderid,
                        endorsement.center,
                        endorsement.file, 
                        endorsement.drive_file_id,
                        endorsement.drive_view_url,
                        endorsement.drive_download_url,
                        endorsement.drive_event_folder_id,
                        endorsement.drive_center_folder_id,
                        endorsement.drive_category_folder_id,
                        endorsement.drive_entry_folder_id,
                        endorsement.event,
                        endorsement.status,
                        endorsement.date
                    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"; // 13 placeholders

                    $stateM = $con->prepare($query2);
                    if (!$stateM) {
                        throw new Exception("Prepare failed for endorsement: " . $con->error);
                    }
                    
                    $sta = NULL;
                    $endorsementFileJson = json_encode($endorsementDriveResult);
                    
                    // Extract values to avoid reference issues with null
                    $drive_event_folder_id = $endorsementDriveResult['drive_event_folder_id'] ?? null;
                    $drive_center_folder_id = $endorsementDriveResult['drive_center_folder_id'] ?? null;
                    $drive_category_folder_id = $endorsementDriveResult['drive_category_folder_id'] ?? null;
                    $drive_entry_folder_id = $endorsementDriveResult['drive_entry_folder_id'] ?? null;
                    
                    // FIXED: Removed $campus parameter and corrected to 13 parameters
                    $stateM->bind_param(
                        'sssssssssssss', // 13 's' parameters
                        $senderId, 
                        $center, // Use center, not campus
                        $endorsementFileJson,
                        $endorsementDriveResult['drive_file_id'],
                        $endorsementDriveResult['drive_view_url'],
                        $endorsementDriveResult['drive_download_url'],
                        $drive_event_folder_id,
                        $drive_center_folder_id,
                        $drive_category_folder_id,
                        $drive_entry_folder_id,
                        $eventType, 
                        $sta,
                        $defaultTime
                    );
                    
                    $st = $stateM->execute();
                    
                    if (!$st) {
                        throw new Exception("Failed to execute endorsement insert: " . $stateM->error);
                    }
                    
                    $endorsementId = $con->insert_id;
                    error_log("Endorsement saved to DB with ID: $endorsementId");
                    
                    // 2. Upload Research File (SINGLE FILE)
                    if (!isset($_FILES['researchDoc']) || $_FILES['researchDoc']['error'] !== UPLOAD_ERR_OK) {
                        $errorCode = $_FILES['researchDoc']['error'] ?? 'NO_FILE';
                        $errorMsg = "Research file upload failed. Error code: $errorCode";
                        if ($errorCode == 1 || $errorCode == 2) {
                            $errorMsg .= " (File too large)";
                        } elseif ($errorCode == 3) {
                            $errorMsg .= " (File only partially uploaded)";
                        } elseif ($errorCode == 4) {
                            $errorMsg .= " (No file selected)";
                        }
                        throw new Exception($errorMsg);
                    }
                    
                    $tempResearchPath = $_FILES['researchDoc']['tmp_name'];
                    $researchFileName = $_FILES['researchDoc']['name'];
                    
                    error_log("Uploading research: $researchFileName");
                    
                    // Check if research file exists before uploading
                    if (!file_exists($tempResearchPath)) {
                        throw new Exception("Research file not found on server. Temp path: $tempResearchPath");
                    }
                    
                    // Upload research paper to Google Drive
                    $researchDriveResult = uploadResearchToDrive(
                        $tempResearchPath,
                        $researchFileName,
                        $eventType,
                        $center,
                        $category,
                        $author,
                        $title,
                        'research',
                        false,
                        false
                    );
                    
                    if (!$researchDriveResult['success']) {
                        throw new Exception("Research upload failed: " . ($researchDriveResult['error'] ?? 'Unknown error'));
                    }
                    
                    error_log("Research uploaded successfully: " . $researchDriveResult['drive_file_id']);
                    
                    // 3. Upload Program File (SINGLE FILE - OPTIONAL)
                    $programDriveResult = null;
                    $programFile = null;
                    $programDriveFileId = null;
                    $programDriveViewUrl = null;
                    
                    if (isset($_FILES['programFile']) && $_FILES['programFile']['error'] === UPLOAD_ERR_OK) {
                        $tempProgramPath = $_FILES['programFile']['tmp_name'];
                        $programFileName = $_FILES['programFile']['name'];
                        
                        error_log("Uploading program: $programFileName");
                        
                        // Check if program file exists before uploading
                        if (file_exists($tempProgramPath)) {
                            $programDriveResult = uploadResearchToDrive(
                                $tempProgramPath,
                                $programFileName,
                                $eventType,
                                $center,
                                $category,
                                $author,
                                $title,
                                'program',
                                true,
                                false
                            );
                            
                            if ($programDriveResult && $programDriveResult['success']) {
                                $programFile = json_encode($programDriveResult);
                                $programDriveFileId = $programDriveResult['drive_file_id'] ?? null;
                                $programDriveViewUrl = $programDriveResult['drive_view_url'] ?? null;
                                error_log("Program uploaded successfully: " . $programDriveResult['drive_file_id']);
                            }
                        }
                    } else {
                        error_log("Program file not uploaded or has error: " . ($_FILES['programFile']['error'] ?? 'NOT_SET'));
                    }
                    
                    // Get event_id
                    $eventId = null;
                    $eventIdQuery = "SELECT id FROM event_list WHERE name = ? LIMIT 1";
                    $eventStmt = $con->prepare($eventIdQuery);
                    $eventStmt->bind_param("s", $eventType);
                    $eventStmt->execute();
                    $eventResult = $eventStmt->get_result();
                    $eventRow = $eventResult->fetch_assoc();
                    $eventId = $eventRow ? $eventRow['id'] : null;
                    
                    // Insert research record with Drive metadata
                    $querV2 = "INSERT INTO researchfile(
                        researchfile.senderid,
                        researchfile.endorsementid,
                        researchfile.author,
                        researchfile.title,
                        researchfile.center,
                        researchfile.category,
                        researchfile.drive_file_id,
                        researchfile.drive_view_url,
                        researchfile.drive_download_url,
                        researchfile.drive_folder_id,
                        researchfile.drive_event_folder_id,
                        researchfile.drive_center_folder_id,
                        researchfile.drive_category_folder_id,
                        researchfile.drive_entry_folder_id,
                        researchfile.program,
                        researchfile.program_drive_file_id,
                        researchfile.program_drive_view_url,
                        researchfile.event,
                        researchfile.event_id,
                        researchfile.campus,
                        researchfile.coauthor,
                        researchfile.presenter,
                        researchfile.reviews
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"; // 23 placeholders

                    $rev = NULL;

                    $stementResNew = $con->prepare($querV2);
                    if (!$stementResNew) {
                        throw new Exception("Prepare failed for researchfile: " . $con->error);
                    }

                    // Extract values to avoid reference issues with null
                    $drive_folder_id = $researchDriveResult['drive_folder_id'] ?? null;
                    $drive_event_folder_id = $researchDriveResult['drive_event_folder_id'] ?? null;
                    $drive_center_folder_id = $researchDriveResult['drive_center_folder_id'] ?? null;
                    $drive_category_folder_id = $researchDriveResult['drive_category_folder_id'] ?? null;
                    $drive_entry_folder_id = $researchDriveResult['drive_entry_folder_id'] ?? null;

                    // Debug: Count parameters
                    error_log("Number of columns in query: 23");
                    error_log("Number of variables to bind: 23");

                    // Bind parameters - count should match: 23 parameters
                    $bound = $stementResNew->bind_param(
                        'sssssssssssssssssssssss', // 23 's' for strings (including NULL values)
                        $senderId,
                        $endorsementId,
                        $author,
                        $title,
                        $center, // Use center
                        $category,
                        $researchDriveResult['drive_file_id'],
                        $researchDriveResult['drive_view_url'],
                        $researchDriveResult['drive_download_url'],
                        $drive_folder_id,
                        $drive_event_folder_id,
                        $drive_center_folder_id,
                        $drive_category_folder_id,
                        $drive_entry_folder_id,
                        $programFile,
                        $programDriveFileId,
                        $programDriveViewUrl,
                        $eventType,
                        $eventId,
                        $center, // Use center for campus field as well (for backward compatibility)
                        $coAuthor,
                        $presenter,
                        $rev
                    );

                    if (!$bound) {
                        throw new Exception("Bind failed for researchfile: " . $stementResNew->error);
                    }

                    $state = $stementResNew->execute();

                    if (!$state) {
                        throw new Exception("Database error for $researchFileName: " . $stementResNew->error);
                    }
                    
                    $researchFileId = $con->insert_id;
                    $response->message = "$researchFileName uploaded to Google Drive successfully.\n";
                    if ($programDriveResult && $programDriveResult['success']) {
                        $response->message .= "Program attachment uploaded successfully.\n";
                    }
                    $response->status = true;
                    
                } else {
                    $response->message = "This account is currently unable to submit endorsement letter.\n Please contact system administrator for permission...!";
                }
            } else {
                $response->message = "Sorry..., The event has closed.";
            }
        } else {
            throw new Exception("Database connection failed: " . $con->error);
        }
    } catch (Exception $e) {
        error_log("Exception in uploadResearch: " . $e->getMessage());
        $response->message = "Error: " . $e->getMessage();
        $response->status = false;
    }
    
    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}


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
            $updateResearchQuery = "UPDATE `researchfile` SET `status`='accepted', `accepted_by`=?, `accepted_date`=NOW() WHERE `endorsementid`=?";
            $updateStmt = $con->prepare($updateResearchQuery);
            $updateStmt->bind_param("ss", $_SESSION['userId'], $docId);
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
// this is for evaluator
if (isset($_POST['researchSubmit'])) {
    $response = new stdClass();
    $response->list = [];
    $response->userName = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Get center from POST or session
        $center = isset($_POST['center']) ? $_POST['center'] : (isset($_SESSION['centerId']) ? $_SESSION['centerId'] : $_SESSION['center']);
        $event = isset($_POST['event']) ? $_POST['event'] : $_SESSION['eventTYpe'];
        $eventId = isset($_POST['eventId']) ? $_POST['eventId'] : $_SESSION['eventId'];
        $response->userName = $_SESSION['userName'];
        $evalId = $_SESSION['userId'];

        // FIXED: Use center code mapping for consistent comparison
        // Get the actual center name from the center table using the session center code
        $centerNameQuery = "SELECT name FROM center WHERE code = ? OR UPPER(code) = UPPER(?) OR name LIKE ? LIMIT 1";
        $centerStmt = $con->prepare($centerNameQuery);
        $searchTerm = "%$center%";
        $centerStmt->bind_param("sss", $center, $center, $searchTerm);
        $centerStmt->execute();
        $centerResult = $centerStmt->get_result();
        $centerRow = $centerResult->fetch_assoc();
        
        // If we found a matching center in the database, use its name
        // Otherwise, use the original value but convert to proper case for comparison
        $dbCenterName = $centerRow ? $centerRow['name'] : $center;
        
        error_log("Evaluator center (session): $center");
        error_log("Looking for researchfiles with center: $dbCenterName");

        // UPDATED QUERY with better center matching - REMOVED event deadline condition
        $sqlQueries = "SELECT 
            researchfile.id,
            researchfile.author,
            researchfile.presenter,
            researchfile.drive_view_url,
            researchfile.drive_file_id,
            researchfile.drive_download_url,
            researchfile.file as local_file,
            researchfile.title as research_title,
            researchfile.event,
            researchfile.event_id,      
            researchfile.category,
            endorsement.center,
            event_list.id as eventId,
            category.id as catId
        FROM researchfile
        LEFT JOIN endorsement ON endorsement.id = researchfile.endorsementid
        LEFT JOIN event_list ON researchfile.event_id = event_list.id
        LEFT JOIN category ON researchfile.category = category.name
        WHERE endorsement.status = ? 
        AND (
            researchfile.center = ? 
            OR researchfile.center LIKE ?
            OR UPPER(researchfile.center) = UPPER(?)
            OR researchfile.center LIKE ?
        )
        AND researchfile.event_id = ?";
        // REMOVED: "AND event_list.dead_line > CURRENT_TIMESTAMP"

        $stm = $con->prepare($sqlQueries);
        $stat = 'accepted';
        
        // Create multiple variations for matching
        $centerExact = $dbCenterName;
        $centerLike = "%$dbCenterName%";
        $centerUpper = strtoupper($center);
        $centerLikeUpper = "%" . strtoupper($dbCenterName) . "%";
        
        $stm->bind_param("sssssi", $stat, $centerExact, $centerLike, $centerUpper, $centerLikeUpper, $eventId);
        
        $stm->execute();
        $resultRes = $stm->get_result();

        while ($val = $resultRes->fetch_assoc()) {
            $data = new stdClass();
            $data->status = NULL;
            $data->id = $val['id'];
            $data->author = $val['author'];
            
            // BACKWARD COMPATIBILITY: Use Google Drive URL if available, otherwise local file
            if (!empty($val['drive_view_url'])) {
                $data->file = $val['drive_view_url']; // Google Drive URL
                $data->file_type = 'drive';
                $data->drive_file_id = $val['drive_file_id'];
                $data->drive_download_url = $val['drive_download_url'];
            } else {
                $data->file = $val['local_file']; 
                $data->file_type = 'local';
                $data->drive_file_id = null;
                $data->drive_download_url = null;
            }
            
            $data->title = $val['research_title']; // Research document title
            $data->event = $val['event'];
            $data->category = $val['category'];
            $data->campus = $val['campus'];
            $data->eventId = $val['eventId'];
            $data->catId = $val['catId'];
            $data->center = $val['center'];

            // Initialize comment fields
            $data->comment_title = ''; // Separate field for comment title
            $data->intro = '';
            $data->abstract = '';
            $data->objective = '';
            $data->methodology = '';
            $data->results = '';
            $data->recommendation = '';
            $data->literature = '';
            $data->other = '';
            
            // Initialize status flags
            $data->hasComment = false;
            $data->hasScore = false;

            // UPDATED query to include comments.title and check for comments
            $comquery = "SELECT 
                comments.title as comment_title, 
                comments.intro,
                comments.abstract,
                comments.objective,
                comments.methodology,
                comments.results,
                comments.recommendation,
                comments.literature,
                comments.other,
                comments.date,
                -- Check if any comment field has content
                CASE 
                    WHEN COALESCE(comments.title, '') != '' 
                         OR COALESCE(comments.intro, '') != ''
                         OR COALESCE(comments.abstract, '') != ''
                         OR COALESCE(comments.objective, '') != ''
                         OR COALESCE(comments.methodology, '') != ''
                         OR COALESCE(comments.results, '') != ''
                         OR COALESCE(comments.recommendation, '') != ''
                         OR COALESCE(comments.literature, '') != ''
                         OR COALESCE(comments.other, '') != ''
                    THEN 1 ELSE 0 
                END as has_comment_content
            FROM comments WHERE comments.resid = ? AND comments.evalid = ? AND comments.eventType = ?";
            
            $statement = $con->prepare($comquery);
            $statement->bind_param('sss', $val['id'], $evalId, $val['event']);
            $statement->execute();
            $res = $statement->get_result();
            
            while ($v = $res->fetch_assoc()) {
                $data->status = 'updated';
                $data->comment_title = $v['comment_title']; // Store comment title separately
                $data->intro = $v['intro'];
                $data->abstract = $v['abstract'];
                $data->objective = $v['objective'];
                $data->methodology = $v['methodology'];
                $data->results = $v['results'];
                $data->recommendation = $v['recommendation'];
                $data->literature = $v['literature'];
                $data->other = $v['other'];
                $data->hasComment = ($v['has_comment_content'] == 1);
            }
            
            // Check if this document has been scored
            $scoreQuery = "SELECT 
                COUNT(*) as score_count,
                CASE 
                    WHEN COUNT(*) > 0 AND SUM(CASE WHEN score IS NOT NULL THEN 1 ELSE 0 END) > 0
                    THEN 1 ELSE 0 
                END as has_score_content
            FROM score_board 
            WHERE doc_id = ? AND eval_id = ?";
            
            $scoreStmt = $con->prepare($scoreQuery);
            $scoreStmt->bind_param('ss', $val['id'], $evalId);
            $scoreStmt->execute();
            $scoreResult = $scoreStmt->get_result();
            
            if ($scoreRow = $scoreResult->fetch_assoc()) {
                $data->hasScore = ($scoreRow['has_score_content'] == 1);
            }
            
            $response->list[] = $data;
        }
        
        error_log("Found " . count($response->list) . " research files for center: $dbCenterName");
    }
    echo json_encode($response);
}


if (isset($_POST['updateReview'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->emailStatus = '';
    
    // Log all POST data for debugging
    error_log("=== updateReview called ===");
    error_log("POST data: " . print_r($_POST, true));
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $category = $_SESSION['category'] ?? $_SESSION['center'] ?? '';
        $response->userName = $_SESSION['userName'] ?? '';
        $evalId = $_SESSION['userId'] ?? 0;
        $evalName = $_SESSION['userFulname'] ?? '';
        $docsId = $_POST['docId'] ?? '';
        
        error_log("evalId: $evalId, docsId: $docsId");
        
        // Get the event ID from the research file
        $eventId = 0;
        if ($docsId) {
            $eventQuery = $con->prepare("SELECT event_id FROM researchfile WHERE id = ?");
            $eventQuery->bind_param("s", $docsId);
            $eventQuery->execute();
            $eventResult = $eventQuery->get_result();
            $eventRow = $eventResult->fetch_assoc();
            $eventId = $eventRow['event_id'] ?? $_SESSION['eventId'] ?? 0;
            $eventQuery->close();
            error_log("eventId: $eventId");
        }
        
        $title = $_POST['title'] ?? '';
        $intro = $_POST['intro'] ?? '';
        $abstract = $_POST['abstract'] ?? '';
        $objective = $_POST['objective'] ?? '';
        $methodology = $_POST['methodology'] ?? '';
        $results = $_POST['results'] ?? '';
        $recommendation = $_POST['recommendation'] ?? '';
        $literature = $_POST['literature'] ?? '';
        $other = $_POST['other'] ?? '';
        
        error_log("Comment data - title: '$title', intro: '$intro', abstract: '$abstract'");
        
        // Get document details for email
        $docInfo = [];
        if ($docsId) {
            $documentDetails = $con->prepare("SELECT 
                researchfile.title, 
                researchfile.author, 
                researchfile.event_id,
                event_list.name as event_name,
                researchfile.category,
                researchfile.center,
                endorsement.center as endorsement_center,
                account_detail.email,
                account_detail.fullName
            FROM researchfile 
            LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
            LEFT JOIN account_detail ON researchfile.senderid = account_detail.id
            LEFT JOIN event_list ON researchfile.event_id = event_list.id
            WHERE researchfile.id = ?");
            
            $documentDetails->bind_param("s", $docsId);
            $documentDetails->execute();
            $docResult = $documentDetails->get_result();
            $docInfo = $docResult->fetch_assoc();
            $documentDetails->close();
        }
        
        // Check if comments exist for this evaluator and document
        $found = false;
        if ($docsId && $evalId) {
            $checkQuery = $con->prepare("SELECT COUNT(*) as count FROM comments WHERE evalid = ? AND resid = ?");
            $checkQuery->bind_param("ss", $evalId, $docsId);
            $checkQuery->execute();
            $checkResult = $checkQuery->get_result();
            $row = $checkResult->fetch_assoc();
            $found = ($row['count'] > 0);
            $checkQuery->close();
            error_log("Comments exist: " . ($found ? 'yes' : 'no'));
        }
        
        if ($found) {
            // Update existing comments
            $comQ = "UPDATE comments SET 
                comments.title = ?,
                comments.intro = ?,
                comments.abstract = ?,
                comments.objective = ?,
                comments.methodology = ?,
                comments.results = ?,
                comments.recommendation = ?,
                comments.literature = ?,
                comments.other = ?,
                comments.isCommented = 1,
                comments.date = NOW()
                WHERE comments.resid = ? AND comments.evalid = ?";
            
            error_log("UPDATE Query: " . $comQ);
            
            $statement = $con->prepare($comQ);
            $statement->bind_param("sssssssssss", 
                $title, $intro, $abstract, $objective, $methodology, 
                $results, $recommendation, $literature, $other, 
                $docsId, $evalId
            );
            
            // Log the values being bound
            error_log("Binding values: title='$title', intro='$intro', abstract='$abstract', objective='$objective', methodology='$methodology', results='$results', recommendation='$recommendation', literature='$literature', other='$other', docsId='$docsId', evalId='$evalId'");
            
            $status = $statement->execute();
            
            if ($status) {
                $response->status = true;
                $response->message = "Comments Updated successfully..!";
                error_log("UPDATE successful");
                
                // Send email notification
                if (!empty($docInfo)) {
                    $response->emailStatus = sendCommentEmail($con, $evalName, $docInfo, [
                        'title' => $title,
                        'intro' => $intro,
                        'abstract' => $abstract,
                        'objective' => $objective,
                        'methodology' => $methodology,
                        'results' => $results,
                        'recommendation' => $recommendation,
                        'literature' => $literature,
                        'other' => $other
                    ], $docsId, $evalId, $rdeEmail, $emailPassword);
                }
                
            } else {
                $response->message = "Update failed: " . $statement->error;
                error_log("UPDATE failed: " . $statement->error);
            }
            $statement->close();
        } else {
            // Insert new comments
            $comQuery = "INSERT INTO comments (
                resid,
                evalid,
                evID,
                title,
                intro,
                abstract,
                objective,
                methodology,
                results,
                recommendation,
                literature,
                other,
                isCommented,
                date ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())";
            
            error_log("INSERT Query: " . $comQuery);
            
            $statementQ = $con->prepare($comQuery);
            $statementQ->bind_param("ssssssssssss", 
                $docsId, $evalId, $eventId, 
                $title, $intro, $abstract, $objective, $methodology, 
                $results, $recommendation, $literature, $other
            );
            
            error_log("Binding values: docsId='$docsId', evalId='$evalId', eventId='$eventId', title='$title', intro='$intro', abstract='$abstract', objective='$objective', methodology='$methodology', results='$results', recommendation='$recommendation', literature='$literature', other='$other'");
            
            $statusIn = $statementQ->execute();
            
            if ($statusIn) {
                $response->status = true;
                $response->message = "Comments Saved successfully..!";
                error_log("INSERT successful");
                
                // Send email notification
                if (!empty($docInfo)) {
                    $response->emailStatus = sendCommentEmail($con, $evalName, $docInfo, [
                        'title' => $title,
                        'intro' => $intro,
                        'abstract' => $abstract,
                        'objective' => $objective,
                        'methodology' => $methodology,
                        'results' => $results,
                        'recommendation' => $recommendation,
                        'literature' => $literature,
                        'other' => $other
                    ], $docsId, $evalId, $rdeEmail, $emailPassword);
                }
                
            } else {
                $response->message = "Insert failed: " . $statementQ->error;
                error_log("INSERT failed: " . $statementQ->error);
            }
            $statementQ->close();
        }
    } else {
        $response->message = "Database connection error";
        error_log("Database connection error");
    }
    
    // Ensure we always return JSON
    header('Content-Type: application/json');
    $jsonResponse = json_encode($response);
    error_log("Response: " . $jsonResponse);
    echo $jsonResponse;
    exit();
}

function sendCommentEmail($con, $evaluatorName, $docInfo, $comments, $docsId, $evalId, $rdeEmail, $emailPassword) {
    
    if (empty($docInfo) || empty($docInfo['email'])) {
        return "Could not send email: No author email found.";
    }
    
    // Clean the comments before sending
    $cleanedComments = [];
    foreach ($comments as $key => $comment) {
        $cleanedComments[$key] = cleanCommentHtml($comment);
    }
    
    // Check if there are any actual comments after cleaning
    $hasComments = false;
    foreach ($cleanedComments as $comment) {
        if (!empty(trim(strip_tags($comment)))) {
            $hasComments = true;
            break;
        }
    }
    
    if (!$hasComments) {
        return "No email sent: No comments were added.";
    }
    
    // Get the system base URL
    $baseUrl = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https://" : "http://";
    $baseUrl .= $_SERVER['HTTP_HOST'];
    $documentUrl = $baseUrl . "/account/Login?redirect=";
    
    // Prepare the email
    $from = new stdClass();
    $from->email = $rdeEmail;
    $from->password = $emailPassword;
    $from->name = 'CAPSU RDE System';
    
    $to = new stdClass();
    $to->name = $docInfo['fullName'] ?? $docInfo['author'];
    $to->email = $docInfo['email'];
    
    // Generate email content - use event_name from the joined query
    $emailContent = CommentNotification(
        $evaluatorName,
        $docInfo['event_name'] ?? 'Research Event',
        $docInfo['title'],
        $docInfo['center'] ?? $docInfo['endorsement_center'],
        $docInfo['author'],
        $cleanedComments,
        $documentUrl
    );
    
    // Send email
    $mailResult = SendEmail($from, $to, $emailContent);
    
    if ($mailResult->status) {
        // Log the email sending
        $logQuery = "INSERT INTO email_log (document_id, evaluator_id, author_email, sent_date, email_type) 
                     VALUES (?, ?, ?, NOW(), 'comment_notification')";
        $logStmt = $con->prepare($logQuery);
        $logStmt->bind_param("sss", $docsId, $evalId, $to->email);
        $logStmt->execute();
        
        return "Email notification sent to author.";
    } else {
        return "Failed to send email: " . ($mailResult->message ?? 'Unknown error');
    }
}

// Helper function to clean HTML comments
function cleanCommentHtml($html) {
    if (empty($html)) {
        return '';
    }
    
    // Decode HTML entities
    $html = html_entity_decode($html, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    
    // Remove &nbsp; (non-breaking spaces) and replace with regular spaces
    $html = str_replace('&nbsp;', ' ', $html);
    
    // Remove multiple spaces
    $html = preg_replace('/\s+/', ' ', $html);
    
    // Trim whitespace
    $html = trim($html);
    
    // Remove empty tags
    $html = preg_replace('/<(\w+)[^>]*>\s*<\/\1>/', '', $html);
    
    // Remove tags that only contain whitespace or &nbsp;
    $html = preg_replace('/<(\w+)[^>]*>(\s|&nbsp;)*<\/\1>/', '', $html);
    
    // Convert <br> tags to newlines for plain text display in email
    $html = str_replace(['<br>', '<br/>', '<br />'], "\n", $html);
    
    // Remove other HTML tags but keep the content (for plain text in email preview)
    $plainText = strip_tags($html);
    
    return $plainText;
}

if (isset($_POST['researchReviewed'])) {
    $response = new stdClass();
    $response->list = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $userId = $_SESSION['userId'];
        
        $queryEndorsement = "SELECT * FROM `endorsement` WHERE `senderid`='$userId'";
        
        foreach ($con->query($queryEndorsement) as $val) {
            $endorsement = new stdClass();
            $endorsement->endorsementFile = $val['drive_view_url']; // Use Drive URL
            $endorsement->drive_file_id = $val['drive_file_id'] ?? null;
            $endorsement->drive_download_url = $val['drive_download_url'] ?? null;
            $endorsement->eventType = $val['event'];
            $endorsement->date = $val['date'];
            $endorsement->status = $val['status'];
            $endorsement->id = $val['id'];
            $endorsement->ResearchDocs = [];
            $enID = $val['id'];
            
            // UPDATED QUERY for Google Drive
            $queryResearch = "SELECT 
                researchfile.author,
                researchfile.coauthor,
                researchfile.presenter,
                researchfile.title,
                researchfile.id as docId,
                researchfile.category,
                researchfile.reviews,
                researchfile.drive_view_url as file,
                researchfile.drive_file_id,
                researchfile.drive_download_url,
                researchfile.drive_folder_id,
                researchfile.drive_event_folder_id,
                researchfile.drive_center_folder_id,
                researchfile.deletestate
            FROM `researchfile` WHERE `senderid`='$userId' AND `endorsementid`='$enID'";
            
            foreach ($con->query($queryResearch) as $res) {
                $researchDocs = new stdClass();
                $researchDocs->author = $res['author'];
                $researchDocs->coauthor = $res['coauthor'];
                $researchDocs->presenter = $res['presenter'];
                $researchDocs->title = $res['title'];
                $researchDocs->docId = $res['docId'];
                $researchDocs->category = $res['category'];
                $researchDocs->comment = $res['reviews'];
                $researchDocs->researchFile = $res['file']; // Google Drive URL
                $researchDocs->drive_file_id = $res['drive_file_id'];
                $researchDocs->drive_download_url = $res['drive_download_url'];
                $researchDocs->drive_folder_id = $res['drive_folder_id'];
                $researchDocs->drive_event_folder_id = $res['drive_event_folder_id'];
                $researchDocs->drive_center_folder_id = $res['drive_center_folder_id'];
                $researchDocs->deleteState = $res['deletestate'];
                
                $endorsement->ResearchDocs[] = $researchDocs;
            }
            $response->list[] = $endorsement;
        }
    }
    echo json_encode($response);
    exit();
}

if (isset($_POST['accessPermission'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $account = $_POST['userId'];

        $query = "UPDATE `account` SET `researchaccess`='allow' WHERE `id`='$account'";

        if ($con->query($query)) {

            $response->status = true;

            $response->message = 'Account added successfully..!';

        } else {

            $response->message = 'Something went wrong ' . $con->error;

        }

    } else {

        $response->message = 'failed to connect...!';

    }

    echo json_encode($response);

}

if (isset($_POST['endorsementApproval'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $accountID = $_POST['accountID'];

        $query = "UPDATE `account` SET `endorsement`='allow' WHERE `id`='$accountID'";

        if ($con->query($query)) {

            $response->status = true;

            $response->message = 'Account added..!';

        } else {

            $response->message = 'Something went wrong ' . $con->error;

        }

    } else {

        $response->message = 'failed to connect...!';

    }

    echo json_encode($response);

}

if (isset($_POST['accessGrantEndorsement'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $response->data = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        //`id`, `username`, `name`, `password`, `office`, `signature`, `position`, `data`, `researchaccess`

        $query = "SELECT * FROM `account`";



        foreach ($con->query($query) as $val) {

            if ($val['endorsement'] !== null) {

                $da = new stdClass();

                $da->email = $val['email'];

                $da->id = $val['id'];

                $da->office = $val['office'];

                $da->fullname = $val['fullname'];

                $response->data[] = $da;

            }

        }

    } else {

        $response->message = 'Connection failed..!';

    }

    echo json_encode($response);

}

if (isset($_POST['accessGrant'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $response->data = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        //`id`, `username`, `name`, `password`, `office`, `signature`, `position`, `data`, `researchaccess`

        $query = "SELECT * FROM `account` WHERE  `researchaccess` IS NOT NULL ";



        foreach ($con->query($query) as $val) {

            $da = new stdClass();

            $da->name = $val['name'];

            $da->fullName = $val['fullname'];

            $da->id = $val['id'];

            $da->office = $val['office'];

            $response->data[] = $da;

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}


if (isset($_POST['allaccount'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $response->data = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        //`id`, `username`, `name`, `password`, `office`, `signature`, `position`, `data`, `researchaccess`

        $query = "SELECT * FROM `account` ";



        foreach ($con->query($query) as $val) {

            $da = new stdClass();

            $da->name = $val['name'];

            $da->id = $val['id'];

            $da->office = $val['office'];

            $response->data[] = $da;

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}

if (isset($_POST['removeAccess'])) {
    //UPDATE `account` SET `researchaccess`=[value-9] WHERE `id`
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $accountID = $_POST['accountID'];
        $query = "UPDATE `account` SET `endorsement`=null WHERE `id`='$accountID'";
        if ($con->query($query)) {
            $response->status = true;
        } else {
            $response->message = $con->error;
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['removeAccessRes'])) {
    //UPDATE `account` SET `researchaccess`=[value-9] WHERE `id`
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $accountID = $_POST['accountID'];
        $query = "UPDATE `account` SET `researchaccess`=null WHERE `id`='$accountID'";
        if ($con->query($query)) {
            $response->status = true;
        } else {
            $response->message = $con->error;
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

//This method was used befor for viewing of endorsement letter
if (isset($_POST['researchFileAdmin'])) {
    $response = new stdClass();
    $response->list = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        
        // UPDATED QUERY for Google Drive
        $queryAd = "SELECT 
            researchfile.id,
            researchfile.senderid,
            researchfile.author,
            researchfile.drive_view_url as file,
            researchfile.drive_file_id,
            researchfile.drive_download_url,
            researchfile.drive_folder_id,
            researchfile.drive_event_folder_id,
            researchfile.drive_center_folder_id,
            researchfile.title,
            researchfile.category,
            researchfile.campus,
            researchfile.coauthor as proponent,
            researchfile.reviews,
            researchfile.status,
            researchfile.event,
            researchfile.deletestate
        FROM `researchfile`";
        
        foreach ($con->query($queryAd) as $val) {
            $data = new stdClass();
            $data->id = $val['id'];
            $data->senderId = $val['senderid'];
            $data->author = $val['author'];
            $data->file = $val['file']; // Google Drive URL
            $data->drive_file_id = $val['drive_file_id'];
            $data->drive_download_url = $val['drive_download_url'];
            $data->drive_folder_id = $val['drive_folder_id'];
            $data->drive_event_folder_id = $val['drive_event_folder_id'];
            $data->drive_center_folder_id = $val['drive_center_folder_id'];
            $data->title = $val['title'];
            $data->category = $val['category'];
            $data->campus = $val['campus'];
            $data->proponent = $val['proponent'];
            $data->date = $val['date'];
            $data->reviews = $val['reviews'];
            $data->status = $val['status'];
            $data->event = $val['event'];
            $data->deletestate = $val['deletestate'];
            
            if (is_null($val['status'])) {
                array_splice($response->list, 0, 0, [$data]);
            } else {
                $response->list[] = $data;
            }
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['getResearch'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->list = [];
    $response->hasMore = false;
    $response->lastId = 0;
    
    // Pagination parameters
    $limit = isset($_POST['limit']) ? intval($_POST['limit']) : 20;
    $lastId = isset($_POST['lastId']) ? intval($_POST['lastId']) : 0;
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $serderId = $_SESSION['userId'];
        
        // Check user access
        $accessQuery = "SELECT `researchaccess` FROM `account` WHERE `id`='$serderId'";
        $accessResult = $con->query($accessQuery);
        $accessRow = $accessResult->fetch_assoc();
        
        if ($accessRow && $accessRow['researchaccess'] !== null) {
            // Query for users with research access - keyset pagination
            $query = "SELECT 
                researchfile.id,
                researchfile.author,
                researchfile.drive_view_url as file_url,
                researchfile.title,
                researchfile.category,
                researchfile.campus,
                researchfile.coauthor,
                researchfile.presenter,
                researchfile.status
            FROM `researchfile`
            WHERE id > $lastId
            ORDER BY id ASC
            LIMIT $limit";
            
            $result = $con->query($query);
            
            while ($row = $result->fetch_assoc()) {
                $data = new stdClass();
                $data->id = $row['id'];
                $data->author = $row['author'];
                $data->file = $row['file_url'];
                $data->title = $row['title'];
                $data->category = $row['category'];
                $data->campus = $row['campus'];
                $data->coauthor = $row['coauthor'];
                $data->presenter = $row['presenter'];
                $data->status = $row['status'];
                $data->file_type = 'drive';
                
                $response->list[] = $data;
                $response->lastId = $row['id'];
            }
            
            // Check if more records exist
            $checkQuery = "SELECT COUNT(*) as count FROM `researchfile` WHERE id > " . $response->lastId;
            $checkResult = $con->query($checkQuery);
            $checkRow = $checkResult->fetch_assoc();
            $response->hasMore = ($checkRow['count'] > 0);
            
        } else {
            // Query for regular users - keyset pagination
            $query = "SELECT 
                researchfile.id,
                researchfile.author,
                researchfile.drive_view_url as file_url,
                researchfile.title,
                researchfile.category,
                researchfile.campus,
                researchfile.coauthor,
                researchfile.presenter,
                researchfile.status,
                researchfile.year,
                researchfile.month,
                researchfile.date
            FROM `researchfile` 
            WHERE `senderid`='$serderId' AND id > $lastId
            ORDER BY id ASC
            LIMIT $limit";
            
            $result = $con->query($query);
            
            while ($row = $result->fetch_assoc()) {
                $data = new stdClass();
                $data->id = $row['id'];
                $data->sender = $row['author'];
                $data->file = $row['file_url'];
                $data->title = $row['title'];
                $data->category = $row['category'];
                $data->campus = $row['campus'];
                $data->coauthor = $row['coauthor'];
                $data->presenter = $row['presenter'];
                $data->status = $row['status'];
                $data->year = $row['year'];
                $data->month = $row['month'];
                $data->date = $row['month'] . '/' . $row['date'] . '/' . $row['year'];
                $data->file_type = 'drive';
                
                $response->list[] = $data;
                $response->lastId = $row['id'];
            }
            
            // Check if more records exist
            $checkQuery = "SELECT COUNT(*) as count FROM `researchfile` WHERE `senderid`='$serderId' AND id > " . $response->lastId;
            $checkResult = $con->query($checkQuery);
            $checkRow = $checkResult->fetch_assoc();
            $response->hasMore = ($checkRow['count'] > 0);
        }
        
        $response->status = true;
        $con->close();
    }
    
    echo json_encode($response);
}

if (isset($_POST['getEndorse'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->list = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $serderId = $_SESSION['userId'];
        
        foreach ($con->query("SELECT  `endorsement` FROM `account` WHERE `id`='$serderId'") as $val) {
            if ($val['endorsement'] !== null) {
                
                // UPDATED QUERY for Google Drive
                foreach ($con->query("SELECT 
                    researchfile.id,
                    researchfile.author,
                    researchfile.drive_view_url as file,
                    researchfile.drive_file_id,
                    researchfile.drive_download_url,
                    researchfile.endorsement,
                    researchfile.title,
                    researchfile.category,
                    researchfile.campus,
                    researchfile.coauthor,
                    researchfile.presenter,
                    researchfile.reviews,
                    researchfile.status,
                    researchfile.approval
                FROM `researchfile`") as $v) {
                    
                    $data = new stdClass();
                    $data->id = $v['id'];
                    $data->author = $v['author'];
                    $data->file = $v['file']; // Google Drive URL
                    $data->drive_file_id = $v['drive_file_id'];
                    $data->drive_download_url = $v['drive_download_url'];
                    $data->endorsement = $v['endorsement'];
                    $data->userId = $serderId;
                    $data->signurl = $_SESSION['userEsign'];
                    
                    if ($v['approval'] === null) {
                        $v['approval'] = json_encode([]);
                    }
                    
                    $app = json_decode($v['approval']);
                    $data->approval = false;
                    
                    for ($x = 0; $x < sizeof($app); $x++) {
                        if ($serderId === $app[$x]->id) {
                            $data->approval = true;
                        }
                    }
                    
                    $data->title = $v['title'];
                    $data->category = $v['category'];
                    $data->campus = $v['campus'];
                    $data->proponent = $v['coauthor'];
                    $data->year = $v['year'];
                    $data->month = $v['month'];
                    $data->date = $v['month'] . '/' . $v['date'] . '/' . $v['year'];
                    $data->reviews = $v['reviews'];
                    $data->status = $v['status'];
                    $response->list[] = $data;
                }
            }
        }
    }
    echo json_encode($response);
    exit();
}

if (isset($_POST['deleteRequest'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docId = $_POST['docId'];
        if ($con->query("DELETE FROM `researchfile` WHERE `id`='$docId'")) {
            $response->status = false;
            $response->message = unlink($_POST['file']);
        } else {
            $response->message = 'Failed to delete';
        }
    } else {
        $response->message = "Failed to connect";
    }
    echo json_encode($response);
}

if (isset($_POST['approve'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        //  $dataUser = unserialize($_SESSION['isLog']);
        $sig = new stdClass();
        $sig->name = $_SESSION['userFulname'];
        $sig->id = $_SESSION['userId'];
        $sig->email = $_SESSION['userEmail'];
        $signUrl = new stdClass();
        $s = json_decode($_SESSION['userEsign']);
        $signUrl->url = $s->url;
        $signUrl->scale = $s->scale;
        $signLoc = json_decode($_POST['signLoc']);
        $signature = new stdClass();
        $signature->left = $signLoc->left;
        $signature->top = $signLoc->top;
        $signature->page = $signLoc->page;
        $sig->signature = $signature;
        $sig->signurl = $signUrl;
        $sig->status = 'approve';
        $sig->note = '';
        $userId = $_SESSION['userId'];
        $docsId = $_POST['docId'];
        foreach ($con->query("SELECT  `approval` FROM `researchfile` WHERE `id`='$docsId'") as $val) {
            if ($val['approval'] === null) {
                $val['approval'] = '[]';
            }
            $data = json_decode($val['approval']);
            $accCheck = false;
            for ($x = 0; $x < sizeof($data); $x++) {
                if ($data[$x]->id === $userId) {
                    $data[$x] = $sig;
                    $accCheck = true;
                    break;
                }
            }
            if (!$accCheck) {
                $data[] = $sig;
            }
            $dataEncoded = json_encode($data);
            if ($con->query("UPDATE `researchfile` SET `approval`='$dataEncoded' WHERE `id`='$docsId'")) {
                $response->status = true;
                $response->message = 'Success..!';
            }
        }
    } else {
        $response->message = 'Connection Failed..!';
    }
    echo json_encode($response);
}

if (isset($_POST['researchPropApp'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $docId = $_POST['docId'];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "UPDATE `researchfile` SET `approval`='approve' WHERE `id`='$docId'";
        if ($con->query($query)) {
            $response->status = true;
        } else {
            $response->message .= 'Failed to update';
        }
    } else {
        $response->message .= "Failed to connect";
    }
    echo json_encode($response);
}

if (isset($_POST['delResearch'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $docId = $_POST['docId'];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $researchFile = "";
        $reviews = [];
        foreach ($con->query("SELECT `file`,`approval` ,`reviews` FROM `researchfile` WHERE `id`='$docId'") as $val) {
            $researchFile = $val['file'];
            if ($val['reviews'] !== null) {
                $reviews = json_decode($val['reviews']);
            }
        }
        if (count($reviews) <= 0) {
            if ($con->query("DELETE FROM `researchfile` WHERE `id`='$docId'")) {
                if (unlink($_POST['fileUrl'])) {
                    $response->status = true;
                    $response->message = "File deleted..!";
                } else {
                    $response->message = $con->error;
                }
            } else {
                $response->message = $con->error;
            }
        } else {
            $response->message = "Unable to delete. This file is already in process..!";
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['saveToSystem'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $docId = $_POST['docId'];
    $category = $_POST['category'];
    $title = $_POST['researchTitle'];
    $author = $_POST['author'];
    $coAuthor = $_POST['coAuthor'];
    //   $dataUser = unserialize($_SESSION['isLog']);
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $review = 0;
        foreach ($con->query("SELECT * FROM `evaluator`") as $val) {
            if ($val['category'] === $category) {
                $review++;
            }
        }

        //client/ResearchFile
        foreach ($con->query("SELECT * FROM `researchfile` WHERE `id`='$docId'") as $val) {
            $rev = json_decode($val['reviews']);
            if ($review === sizeof($rev)) {
                $docArray = explode('/', $val['file']);
                $docNem = $docArray[sizeof($docArray) - 1];
                $researchFileState = false;
                if (!file_exists("../client/ResearchFile/" . $docNem)) {
                    if (rename($val['file'], "../client/ResearchFile/" . $docNem)) {
                        $researchFileState = true;
                    }
                }
                $docenArray = explode('/', $val['endorsement']);
                $docEnNem = $docenArray[sizeof($docenArray) - 1];
                $endorsementState = false;
                if (!file_exists("../client/AllEndorsement/" . $docEnNem)) {
                    if (rename($val['endorsement'], "../client/AllEndorsement/" . $docEnNem)) {
                        $endorsementState = true;
                    }
                }
                if ($endorsementState && $researchFileState) {
                    $researchFile = "../client/ResearchFile/" . $docNem;
                    $endorsement = "../client/AllEndorsement/" . $docEnNem;
                    $reviews = $val['reviews'];
                    $authorId = $val['senderid'];
                    $docIdMain = $docId;
                    //INSERT INTO `researchallfile`(`docid`, `authorid`, `researchfile`, `endoresment`, `comments`, `date`) VALUES ('','','','','','')
                    if ($con->query("INSERT INTO `researchallfile`(`docid`, `author`,authorid,`coauthor`,`title` ,`researchfile`, `endoresment`, `comments`) VALUES ('$docIdMain','$author','$authorId','$coAuthor','$title','$researchFile','$endorsement','$reviews')")) {
                        $response->status = true;
                        $response->message = 'Success';
                    } else {
                        $response->message .= $con->error;
                    }
                } else {
                    $response->message .= "Files can't be move...!";
                }
            } else {
                $response->message .= "Unable to save this file. ";
            }
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

//This request was modified
if (isset($_POST['systemResearchFile'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->list = [];
    //  $dataUser = unserialize($_SESSION['isLog']);
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        foreach ($con->query("SELECT * FROM `researchallfile`") as $val) {
            if ($val['authorid'] === $_SESSION['userId']) {
                $data = new stdClass();
                $data->researchFile = $val['researchfile'];
                $data->endorsementFile = $val['endoresment'];
                $data->title = $val['title'];
                $data->reviews = $val['comments'];
                $data->author = $val['author'];
                $data->authorId = $val['authorid'];
                $data->date = $val['date'];
                $data->coAuthor = json_decode($val['coauthor']);
                $response->list[] = $data;
            }
        }
    } else {
        $response->message .= $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['researchDeleteRequest'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $docId = $_POST['docId'];
    $reason = $_POST['reason'];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "UPDATE `researchfile` SET `deletestate`='$reason' WHERE`id`='$docId'";
        if ($con->query($query)) {
            $response->status = 'true';
            $response->message = "Request Sent...!";
        } else {
            $response->message = $con->error;
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

//==============================================================================================================
if (isset($_POST['saveResearchPer'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->data = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "INSERT INTO researchallfile
        (
            researchallfile.docid,
            researchallfile.author,
            researchallfile.title,
            researchallfile.researchfile,
            researchallfile.eventType,
            researchallfile.date
        ) SELECT 
        researchfile.id,
        researchfile.author,
        researchfile.title,
        researchfile.file,
        researchfile.event,
        endorsement.date
        FROM researchfile 
        LEFT JOIN endorsement ON researchfile.endorsementid=endorsement.id
        WHERE researchfile.endorsementid=?";
        $endorId = $_POST['endorseId'];
        $statement = $con->prepare($query);
        $statement->bind_param("s", $endorId);
        $result = $statement->execute();
        if ($result) {
            $logReq = "INSERT INTO document_log (document_log.user_id,document_log.doc_id,document_log.details)
            SELECT 
            ?,
            researchfile.id,
            ?
            FROM researchfile 
            LEFT JOIN endorsement ON researchfile.endorsementid=endorsement.id
            WHERE researchfile.endorsementid=?";
            $userId = $_SESSION['userId'];
            $rdeStaff = $_SESSION['userEmail'];
            $event = $_POST['eventType'];
            $campus = $_POST['campus'];
            $details = "RDE staff: $rdeStaff store files of $campus  for $event";
            $stm = $con->prepare($logReq);
            $stm->bind_param("sss", $userId, $details, $endorId);
            $stat = $stm->execute();
            if ($stat) {
                // Fetch and return the saved research data with center information
                $fetchQuery = "SELECT 
                    researchfile.id,
                    researchfile.author,
                    researchfile.title,
                    researchfile.file,
                    researchfile.event,
                    researchfile.campus,
                    researchfile.category,
                    endorsement.date
                FROM researchfile 
                LEFT JOIN endorsement ON researchfile.endorsementid=endorsement.id
                WHERE researchfile.endorsementid=?";
                
                $fetchStmt = $con->prepare($fetchQuery);
                $fetchStmt->bind_param("s", $endorId);
                $fetchStmt->execute();
                $fetchRes = $fetchStmt->get_result();
                
                while ($row = $fetchRes->fetch_assoc()) {
                    $data = new stdClass();
                    $data->id = $row['id'];
                    $data->author = $row['author'];
                    $data->title = $row['title'];
                    $data->file = $row['file'];
                    $data->event = $row['event'];
                    $data->campus = $row['campus'];
                    $data->center = $row['category']; // Map category to center for front-end
                    $data->date = $row['date'];
                    $response->data[] = $data;
                }
                $response->status = true;
                $response->message = 'Saved';
            } else {
                $response->message = $stm->error;
            }
        } else {
            $response->message = $statement->error;
        }
    } else {
        $response->message = $con->error;
    }
    ob_clean();
    echo json_encode($response);
    exit();
}

if (isset($_POST['researchFile'])) {
    // Clear output buffers
    while (ob_get_level()) ob_end_clean();
    
    // Set memory limit for this operation
    ini_set('memory_limit', '256M');
    set_time_limit(30);
    
    $response = new stdClass();
    $response->status = false;
    $response->list = [];
    $response->message = '';
    
    try {
        // Check required parameters - ONLY eventId is required
        if (!isset($_POST['eventId']) || intval($_POST['eventId']) === 0) {
            throw new Exception('Event ID is required');
        }
        
        $userId = isset($_SESSION['userId']) ? intval($_SESSION['userId']) : 0;
        $eventId = intval($_POST['eventId']);
        
        error_log("=== researchFile API called ===");
        error_log("Event ID: " . $eventId);
        error_log("User ID: " . $userId);
        
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            $con->set_charset("utf8mb4");
            
            // FIRST: Get the event name for response
            $eventName = '';
            $eventNameQuery = "SELECT name FROM event_list WHERE id = ? LIMIT 1";
            $eventNameStmt = $con->prepare($eventNameQuery);
            if ($eventNameStmt) {
                $eventNameStmt->bind_param('i', $eventId);
                $eventNameStmt->execute();
                $eventNameResult = $eventNameStmt->get_result();
                if ($eventNameRow = $eventNameResult->fetch_assoc()) {
                    $eventName = $eventNameRow['name'];
                }
                $eventNameStmt->close();
            }
            
            // Determine which column to use based on event ID
            $isNewEvent = ($eventId >= 13);
            $groupByColumn = $isNewEvent ? 'rf.center' : 'rf.campus';

            error_log("Event type: " . ($isNewEvent ? 'NEW (center-based)' : 'OLD (campus-based)'));
            error_log("Grouping by: " . $groupByColumn);

            $query = "SELECT 
                rf.id,
                rf.author,
                rf.title,
                rf.drive_view_url,
                rf.drive_file_id,
                rf.drive_download_url,
                rf.file as local_file,
                rf.category,
                rf.campus,
                rf.center,
                DATE_FORMAT(e.date, '%Y-%m-%d') as date,
                " . $groupByColumn . " as group_name
            FROM researchfile rf
            INNER JOIN endorsement e ON e.id = rf.endorsementid
            WHERE e.status = 'accepted'
            AND rf.event_id = ?";  // Only ONE placeholder

            // Add column-specific filters
            if ($isNewEvent) {
                // NEW EVENTS (ID >= 13) - Group by CENTER
                $query .= " AND rf.center IS NOT NULL AND rf.center != ''";
            } else {
                // OLD EVENTS (ID < 13) - Group by CAMPUS
                $query .= " AND rf.campus IS NOT NULL AND rf.campus != ''";
            }

            // Add limits to prevent memory issues
            $query .= " GROUP BY rf.id 
                        ORDER BY group_name, rf.title 
                        LIMIT 500";

            $stmt = $con->prepare($query);
            if (!$stmt) {
                throw new Exception('Prepare failed: ' . $con->error);
            }

            // Bind only ONE parameter - the eventId
            $stmt->bind_param('i', $eventId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            // Group results by campus or center
            $groupedResults = [];
            $totalProcessed = 0;
            $maxGroups = 50;
            $maxItemsPerGroup = 100;
            
            if ($result) {
                while ($row = $result->fetch_assoc()) {
                    $groupName = $row['group_name'];
                    
                    // Skip if group name is empty
                    if (empty($groupName)) {
                        continue;
                    }
                    
                    // Limit number of groups
                    if (count($groupedResults) >= $maxGroups) {
                        error_log("Reached maximum groups limit: " . $maxGroups);
                        break;
                    }
                    
                    if (!isset($groupedResults[$groupName])) {
                        $groupedResults[$groupName] = [
                            'name' => $groupName,
                            'list' => []
                        ];
                    }
                    
                    // Limit items per group
                    if (count($groupedResults[$groupName]['list']) >= $maxItemsPerGroup) {
                        continue;
                    }
                    
                    $data = new stdClass();
                    $data->author = htmlspecialchars($row['author'] ?? '', ENT_QUOTES, 'UTF-8');
                    $data->title = htmlspecialchars($row['title'] ?? '', ENT_QUOTES, 'UTF-8');
                    $data->id = intval($row['id']);
                    
                    // Prioritize Google Drive URL if available
                    if (!empty($row['drive_view_url'])) {
                        $data->file = filter_var($row['drive_view_url'], FILTER_SANITIZE_URL);
                        $data->file_type = 'drive';
                        $data->drive_file_id = htmlspecialchars($row['drive_file_id'] ?? '', ENT_QUOTES, 'UTF-8');
                        $data->drive_download_url = filter_var($row['drive_download_url'] ?? '', FILTER_SANITIZE_URL);
                    } else if (!empty($row['local_file'])) {
                        $data->file = htmlspecialchars($row['local_file'], ENT_QUOTES, 'UTF-8');
                        $data->file_type = 'local';
                    } else {
                        $data->file = null;
                        $data->file_type = 'none';
                    }
                    
                    $data->category = htmlspecialchars($row['category'] ?? '', ENT_QUOTES, 'UTF-8');
                    $data->center = htmlspecialchars($row['center'] ?? '', ENT_QUOTES, 'UTF-8');
                    $data->campus = htmlspecialchars($row['campus'] ?? '', ENT_QUOTES, 'UTF-8');
                    
                    $groupedResults[$groupName]['list'][] = $data;
                    $totalProcessed++;
                }
                
                $result->free();
            }
            
            // Convert to indexed array and sort groups
            $response->list = array_values($groupedResults);
            
            // Sort groups alphabetically
            if (!empty($response->list)) {
                usort($response->list, function($a, $b) {
                    return strcasecmp($a['name'], $b['name']);
                });
            }
            
            $response->status = true;
            $response->event_id = $eventId;
            $response->event_name = $eventName;
            $response->is_center_based = $isNewEvent;
            $response->message = 'Successfully retrieved ' . count($response->list) . ' ' . 
                                ($isNewEvent ? 'centers' : 'campuses') . 
                                ' with ' . $totalProcessed . ' files';
            
            $stmt->close();
            $con->close();
            
            // Clear memory
            unset($groupedResults, $result);
            
        } else {
            throw new Exception('Database connection failed');
        }
        
    } catch (Exception $e) {
        error_log("researchFile error: " . $e->getMessage());
        $response->message = 'Error: ' . $e->getMessage();
        $response->status = false;
        $response->list = [];
    }
    
    // Send JSON response
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    
    echo json_encode($response, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);
    exit();
}

if (isset($_POST['searchResearch'])) {  
    
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->list = [];
    
    try {
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            $searchTerm = $_POST['searchTerm'] ?? '';
            $userId = $_SESSION['userId'] ?? null;
            
            // Debug logging
            error_log("Search term received: " . $searchTerm);
            
            // Clean search term for SQL
            $searchTerm = $con->real_escape_string($searchTerm);
            
            // UPDATED QUERY: Handle both Google Drive and local files
            $query = "
                SELECT DISTINCT
                    event_list.id as event_id,
                    event_list.name as event_name,
                    researchfile.id,
                    researchfile.author,
                    researchfile.title,
                    researchfile.drive_view_url as drive_view_url,
                    researchfile.drive_file_id,
                    researchfile.drive_download_url,
                    researchfile.file as local_file,
                    researchfile.category,
                    researchfile.center,
                    endorsement.center,
                    researchfile.event,
                    researchfile.drive_folder_id,
                    researchfile.drive_event_folder_id,
                    researchfile.drive_center_folder_id
                FROM researchfile
                LEFT JOIN endorsement ON endorsement.id = researchfile.endorsementid
                LEFT JOIN event_list ON researchfile.event = event_list.name
                WHERE endorsement.status = 'accepted'
                AND (
                    researchfile.title LIKE '%$searchTerm%'
                    OR researchfile.author LIKE '%$searchTerm%'
                    OR researchfile.category LIKE '%$searchTerm%'
                    OR researchfile.center LIKE '%$searchTerm%'
                    OR researchfile.event LIKE '%$searchTerm%'
                    OR endorsement.center LIKE '%$searchTerm%'
                )
                ORDER BY event_list.name, researchfile.title";
            
            error_log("Executing query: " . $query);
            $result = $con->query($query);
            
            if ($result) {
                $groupedResults = [];
                
                while ($row = $result->fetch_assoc()) {
                    $eventId = $row['event_id'];
                    $eventName = $row['event_name'];
                    
                    // Initialize event group if not exists
                    if (!isset($groupedResults[$eventId])) {
                        $groupedResults[$eventId] = [
                            'id' => $eventId,
                            'name' => $eventName,
                            'list' => []
                        ];
                    }
                    
                    // Add research file to event group
                    $researchData = new stdClass();
                    $researchData->id = $row['id'];
                    $researchData->author = $row['author'];
                    $researchData->title = $row['title'];
                    
                    // BACKWARD COMPATIBILITY: Use Google Drive URL if available, otherwise local file
                    if (!empty($row['drive_view_url'])) {
                        $researchData->file = $row['drive_view_url'];
                        $researchData->file_type = 'drive';
                        $researchData->drive_file_id = $row['drive_file_id'];
                        $researchData->drive_download_url = $row['drive_download_url'];
                        $researchData->local_file = $row['local_file'];
                    } else if (!empty($row['local_file'])) {
                        $researchData->file = $row['local_file'];
                        $researchData->file_type = 'local';
                        $researchData->drive_file_id = null;
                        $researchData->drive_download_url = null;
                        $researchData->local_file = $row['local_file'];
                    } else {
                        // No file available
                        $researchData->file = null;
                        $researchData->file_type = 'none';
                        $researchData->drive_file_id = null;
                        $researchData->drive_download_url = null;
                        $researchData->local_file = null;
                    }
                    
                    $researchData->category = $row['category'];
                    $researchData->center = $row['center'];
                    $researchData->event = $row['event'];
                    $researchData->drive_folder_id = $row['drive_folder_id'];
                    $researchData->drive_event_folder_id = $row['drive_event_folder_id'];
                    $researchData->drive_center_folder_id = $row['drive_center_folder_id'];
                    
                    $groupedResults[$eventId]['list'][] = $researchData;
                }
                
                // Convert to simple array
                $response->list = array_values($groupedResults);
                $response->status = true;
                $response->message = 'Search completed. Found ' . count($response->list) . ' events with matching files.';
                
                error_log("Search successful: " . count($response->list) . " events found");
                
            } else {
                $response->message = 'Query failed: ' . $con->error;
                error_log("Query failed: " . $con->error);
            }
        } else {
            $response->message = 'Database connection failed';
            error_log("Database connection failed");
        }
    } catch (Exception $e) {
        $response->message = 'Server error: ' . $e->getMessage();
        error_log("Search exception: " . $e->getMessage());
    }
    
    // Ensure no output before this
    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

if (isset($_POST['declineDel'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $docId = $_POST['docId'];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        if ($con->query("UPDATE `researchfile` SET `deletestate`=null WHERE `id`='$docId'")) {
            $response->status = true;
        } else {
            $response->message = $con->error;
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['acceptDel'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $docId = $_POST['docId'];
    $fileUrl = $_POST['fileUrl'];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        if ($con->query("DELETE FROM `researchfile` WHERE `id`='$docId'")) {
            if (unlink($fileUrl)) {
                $response->status = true;
            } else {
                $response->message = $con->error;
            }
        } else {
            $response->message = $con->error;
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

//new Request
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

if (isset($_POST['researchDocsNew'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Query remains the same
        $query = "
            SELECT
                researchfile.id,
                researchfile.senderid,
                researchfile.author,
                researchfile.presenter,
                researchfile.title,
                researchfile.file,                    
                researchfile.drive_view_url,        
                researchfile.drive_file_id,
                researchfile.drive_download_url,
                researchfile.drive_folder_id,
                researchfile.drive_event_folder_id,
                researchfile.drive_center_folder_id,
                researchfile.status,
                researchfile.category,
                researchfile.center,
                researchfile.deletestate,           
                endorsement.center,
                endorsement.campus,
                endorsement.event,
                endorsement.date,
                researchfile.endorsementid,
                researchfile.rejected_by,
                researchfile.accepted_by,
                researchfile.rejected_date,
                researchfile.accepted_date
            FROM researchfile
            LEFT JOIN endorsement ON endorsement.id=researchfile.endorsementid
            WHERE endorsement.status='accepted'";
        
        foreach ($con->query($query) as $val) {
            $data = new stdClass();
            $data->id = $val['id'];
            $data->senderid = $val['senderid'];
            $data->deletestate = $val['deletestate'];
            $data->author = $val['author'];
            $data->title = $val['title'];
            
            // For backward compatibility with existing frontend
            // Use Google Drive URL if available, otherwise local file
            if (!empty($val['drive_view_url'])) {
                $data->file = $val['drive_view_url'];  // Google Drive URL
            } else {
                $data->file = $val['file'];  // Local file path
            }
            
            // Add separate fields for clarity
            $data->local_file = $val['file'];
            $data->drive_view_url = $val['drive_view_url'];
            $data->drive_file_id = $val['drive_file_id'];
            $data->drive_download_url = $val['drive_download_url'];
            $data->drive_folder_id = $val['drive_folder_id'];
            $data->drive_event_folder_id = $val['drive_event_folder_id'];
            $data->drive_center_folder_id = $val['drive_center_folder_id'];
            $data->center = $val['center'];
            $data->status = $val['status'];
            $data->category = $val['category'];
            $data->campus = $val['campus'];
            $data->event = $val['event'];
            $data->date = $val['date'];
            $data->endorsId = $val['endorsementid'];
            $response[] = $data;
        }
    }
    echo json_encode($response);
}

if (isset($_POST['commentRequest'])) {
    $response = [];
    $docId = $_POST['docId'];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT
        comments.title,
        comments.intro,
        comments.abstract,
        comments.objective,
        comments.methodology,
        comments.results,
        comments.recommendation,
        comments.literature,
        comments.other,
        comments.date,
        evaluator.fullname,
        researchfile.campus FROM comments
        LEFT JOIN evaluator ON evaluator.id=comments.evalid
        LEFT JOIN researchfile ON researchfile.id = comments.resid
        WHERE comments.resid='$docId'";

        foreach ($con->query($query) as $val) {

            $data = new stdClass();
            $data->title = $val['title'];
            $data->intro = $val['intro'];
            $data->abstract = $val['abstract'];
            $data->objective = $val['objective'];
            $data->methodology = $val['methodology'];
            $data->results = $val['results'];
            $data->recommendation = $val['recommendation'];
            $data->literature = $val['literature'];
            $data->other = $val['other'];
            $data->date = $val['date'];
            $data->evalName = $val['fullname'];
            $data->campus = $val['campus'];
            $response[] = $data;
        }
    }
    echo json_encode($response);
}

if (isset($_POST['getDeleteRequest'])) {
    $response = new stdClass();
    $response->message = "";
    $docId = $_POST['docId'];
    $query = "SELECT
    researchfile.deletestate
    FROM
    researchfile
    WHERE researchfile.id='$docId'";
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        foreach ($con->query($query) as $val) {
            $response->message = $val['deletestate'];
        }
    }
    echo json_encode($response);
}

if (isset($_POST['grantDeleteResearchRequest'])) {
    $response = new stdClass();
    $response->message = "";
    $response->status = false;
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docId = $_POST['docId'];
        $fileLocation = $_POST['fileLocation'];
        if ($con->query("DELETE FROM researchfile WHERE id='$docId'")) {
            $campus = $_POST['campus'];
            $account = $_POST['accountName'];
            $rdeStaff = $_POST['rdeStaff'];
            $reason = $_POST['reason'];
            $eventName = $_POST['eventName'];
            $title = $_POST['title'];
            $statement = $con->prepare("INSERT INTO deletedresearch(deletedresearch.id,deletedresearch.title,deletedresearch.event,deletedresearch.campus,deletedresearch.accountuser,deletedresearch.reason,deletedresearch.rdeStaff) VALUES (?,?,?,?,?)");
            $statement->bind_param("sssss", $docId, $title, $eventName, $campus, $account, $reason, $rdeStaff);
            $status = $statement->execute();
            if ($status) {
                $response->message = unlink($fileLocation);
                $response->status = true;
            } else {
                $response->message = $statement->error;
            }
        } else {
            $response->message = $con->error;
        }
    }
    echo json_encode($response);

}

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
            $researchUpdateQuery = "UPDATE researchfile SET status='rejected', rejected_by=?, rejected_date=NOW() WHERE endorsementid=?";
            $researchStmt = $con->prepare($researchUpdateQuery);
            $researchStmt->bind_param("ss", $staffId, $docId);
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
                $campus = $senderRow['campus'];
                
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
if (isset($_POST['getRejectedForResubmit'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->data = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $userId = $_SESSION['userId']; // This is the senderid from account_detail
        
        // Check if a specific docId (endorsement ID) was provided
        if (isset($_POST['docId']) && !empty($_POST['docId'])) {
            $endorsementId = $_POST['docId'];
            
            // Fetch ONLY the specific document using endorsement_id
            $query = "SELECT 
                rf.id,
                rf.title,
                rf.author,
                rf.coauthor,
                rf.presenter,
                rf.category,
                rf.center,
                rf.event,
                rf.drive_view_url,
                rf.drive_file_id,
                rf.program_drive_view_url,
                rf.program_drive_file_id,
                rf.resubmit_count,
                rf.resubmitted,
                e.id as endorsement_id,
                e.drive_view_url as endorsement_url,
                e.drive_file_id as endorsement_file_id,
                rd.reason,
                rd.date as rejection_date
            FROM researchfile rf
            LEFT JOIN endorsement e ON rf.endorsementid = e.id
            LEFT JOIN rejecteddocs rd ON e.id = rd.docid
            WHERE rf.senderid = ? AND rf.status = 'rejected' AND e.id = ?";
            
            $stmt = $con->prepare($query);
            $stmt->bind_param("ss", $userId, $endorsementId);
            
        } else {
            // No specific ID - return ALL rejected documents (for listing)
            $query = "SELECT 
                rf.id,
                rf.title,
                rf.author,
                rf.coauthor,
                rf.presenter,
                rf.category,
                rf.center,
                rf.event,
                rf.drive_view_url,
                rf.drive_file_id,
                rf.program_drive_view_url,
                rf.program_drive_file_id,
                rf.resubmit_count,
                rf.resubmitted,
                e.id as endorsement_id,
                e.drive_view_url as endorsement_url,
                e.drive_file_id as endorsement_file_id,
                rd.reason,
                rd.date as rejection_date
            FROM researchfile rf
            LEFT JOIN endorsement e ON rf.endorsementid = e.id
            LEFT JOIN rejecteddocs rd ON e.id = rd.docid
            WHERE rf.senderid = ? AND rf.status = 'rejected'
            ORDER BY rd.date DESC";
            
            $stmt = $con->prepare($query);
            $stmt->bind_param("s", $userId);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $data = new stdClass();
            $data->id = $row['id'];
            $data->title = $row['title'];
            $data->author = $row['author'];
            
            // Parse coauthor
            if (!empty($row['coauthor'])) {
                $coauthorData = json_decode($row['coauthor'], true);
                $data->coauthor = is_array($coauthorData) ? $coauthorData : [];
            } else {
                $data->coauthor = [];
            }
            
            $data->presenter = $row['presenter'] ?? '';
            $data->category = $row['category'];
            $data->center = $row['center'];
            $data->event = $row['event'];
            
            // Research file
            $data->research_file = [
                'url' => $row['drive_view_url'],
                'file_id' => $row['drive_file_id']
            ];
            
            // Program file
            $data->program_file = [
                'url' => $row['program_drive_view_url'],
                'file_id' => $row['program_drive_file_id']
            ];
            
            // Endorsement file
            $data->endorsement_file = [
                'url' => $row['endorsement_url'],
                'file_id' => $row['endorsement_file_id']
            ];
            
            $data->rejection_reason = $row['reason'];
            $data->rejection_date = $row['rejection_date'];
            $data->resubmit_count = $row['resubmit_count'] ?? 0;
            $data->resubmitted = $row['resubmitted'] ?? 0;
            $data->endorsement_id = $row['endorsement_id'];
            
            $response->data[] = $data;
        }
        
        $response->status = true;
        $response->message = count($response->data) . ' document(s) found';
        
    } else {
        $response->message = "Database connection error";
    }
    
    echo json_encode($response);
    exit();
}
if (isset($_POST['resubmitDocument'])) {
    error_log("=== START resubmitDocument ===");
    error_log("POST data: " . print_r($_POST, true));
    
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $endorsementId = $_POST['docId']; // This is the endorsement ID
        $userId = $_SESSION['userId'];
        
        // Find the researchfile using endorsementid column - include folder information
        $checkQuery = "SELECT 
            rf.id,
            rf.title,
            rf.author,
            rf.coauthor,
            rf.presenter,
            rf.category,
            rf.center,
            rf.event,
            rf.drive_file_id,
            rf.drive_view_url,
            rf.program_drive_file_id,
            rf.program_drive_view_url,
            rf.endorsementid,
            rf.resubmit_count,
            rf.status,
            rf.drive_event_folder_id,
            rf.drive_center_folder_id,
            rf.drive_category_folder_id,
            rf.drive_entry_folder_id
        FROM researchfile rf
        WHERE rf.endorsementid = ?";
        
        $checkStmt = $con->prepare($checkQuery);
        $checkStmt->bind_param("s", $endorsementId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            error_log("No researchfile found with endorsementid = $endorsementId");
            $response->message = "Document not found";
            echo json_encode($response);
            exit();
        }
        
        $docInfo = $checkResult->fetch_assoc();
        $researchfileId = $docInfo['id'];
        $resubmitCount = ($docInfo['resubmit_count'] ?? 0) + 1;
        
        error_log("Found researchfile ID: $researchfileId for endorsement ID: $endorsementId");
        
        // Capture folder information from the old files
        $entryFolderId = $docInfo['drive_entry_folder_id'];
        
        error_log("Entry folder ID: " . ($entryFolderId ?: 'none - will create new'));
        
        // STEP 1: Capture all old file IDs for THIS SPECIFIC DOCUMENT
        $oldDriveFileId = $docInfo['drive_file_id'];
        $oldProgramDriveFileId = $docInfo['program_drive_file_id'];
        
        // Get old endorsement file ID from endorsement table
        $oldEndorseQuery = "SELECT drive_file_id FROM endorsement WHERE id = ?";
        $oldEndorseStmt = $con->prepare($oldEndorseQuery);
        $oldEndorseStmt->bind_param("s", $endorsementId);
        $oldEndorseStmt->execute();
        $oldEndorseResult = $oldEndorseStmt->get_result();
        $oldEndorseData = $oldEndorseResult->fetch_assoc();
        $oldEndorsementFileId = $oldEndorseData['drive_file_id'] ?? null;
        
        error_log("For endorsement ID $endorsementId:");
        error_log("  - Research file ID: " . ($oldDriveFileId ?: 'none'));
        error_log("  - Program file ID: " . ($oldProgramDriveFileId ?: 'none'));
        error_log("  - Endorsement file ID: " . ($oldEndorsementFileId ?: 'none'));
        
        // STEP 2: Initialize Drive service
        require_once __DIR__ . '/../config/driver_config.php';
        $driveService = new GoogleDriveService();
        
        // STEP 3: DELETE OLD FILES FIRST - ONLY for files being replaced
        if (isset($_FILES['researchDoc']) && $_FILES['researchDoc']['error'] === UPLOAD_ERR_OK && !empty($oldDriveFileId)) {
            try {
                error_log("Deleting old research file for endorsement $endorsementId: $oldDriveFileId");
                $driveService->trashFile($oldDriveFileId);
                error_log("Successfully deleted old research file: $oldDriveFileId");
            } catch (Exception $e) {
                error_log("Failed to delete old research file: " . $e->getMessage());
                // Continue with upload even if delete fails
            }
        }
        
        if (isset($_FILES['programFile']) && $_FILES['programFile']['error'] === UPLOAD_ERR_OK && !empty($oldProgramDriveFileId)) {
            try {
                error_log("Deleting old program file for endorsement $endorsementId: $oldProgramDriveFileId");
                $driveService->trashFile($oldProgramDriveFileId);
                error_log("Successfully deleted old program file: $oldProgramDriveFileId");
            } catch (Exception $e) {
                error_log("Failed to delete old program file: " . $e->getMessage());
                // Continue with upload even if delete fails
            }
        }
        
        if (isset($_FILES['endorsementFile']) && $_FILES['endorsementFile']['error'] === UPLOAD_ERR_OK && !empty($oldEndorsementFileId)) {
            try {
                error_log("Deleting old endorsement file for endorsement $endorsementId: $oldEndorsementFileId");
                $driveService->trashFile($oldEndorsementFileId);
                error_log("Successfully deleted old endorsement file: $oldEndorsementFileId");
            } catch (Exception $e) {
                error_log("Failed to delete old endorsement file: " . $e->getMessage());
                // Continue with upload even if delete fails
            }
        }
        
        // Track what needs to be updated
        $updates = [];
        $params = [];
        $types = "";
        
        // Check each field for changes
        if (isset($_POST['title']) && trim($_POST['title']) !== $docInfo['title']) {
            $updates[] = "title = ?";
            $params[] = trim($_POST['title']);
            $types .= "s";
            error_log("Title changed");
        }
        
        if (isset($_POST['author']) && trim($_POST['author']) !== $docInfo['author']) {
            $updates[] = "author = ?";
            $params[] = trim($_POST['author']);
            $types .= "s";
            error_log("Author changed");
        }
        
        if (isset($_POST['presenter']) && trim($_POST['presenter']) !== $docInfo['presenter']) {
            $updates[] = "presenter = ?";
            $params[] = trim($_POST['presenter']);
            $types .= "s";
            error_log("Presenter changed");
        }
        
        if (isset($_POST['category']) && trim($_POST['category']) !== $docInfo['category']) {
            $updates[] = "category = ?";
            $params[] = trim($_POST['category']);
            $types .= "s";
            error_log("Category changed");
        }
        
        if (isset($_POST['center']) && trim($_POST['center']) !== $docInfo['center']) {
            $updates[] = "center = ?";
            $params[] = trim($_POST['center']);
            $types .= "s";
            error_log("Center changed");
        }
        
        // Handle coauthor changes
        if (isset($_POST['coauthor'])) {
            $newCoauthor = $_POST['coauthor'];
            $oldCoauthor = $docInfo['coauthor'];
            
            $coauthorData = json_decode($newCoauthor, true);
            $coauthorChanged = false;
            
            if (json_last_error() === JSON_ERROR_NONE) {
                $coauthorChanged = json_encode($coauthorData) !== $oldCoauthor;
            } else {
                $coauthorChanged = $newCoauthor !== $oldCoauthor;
            }
            
            if ($coauthorChanged) {
                if (json_last_error() === JSON_ERROR_NONE) {
                    $updates[] = "coauthor = ?";
                    $params[] = json_encode($coauthorData);
                } else {
                    $updates[] = "coauthor = ?";
                    $params[] = $newCoauthor;
                }
                $types .= "s";
                error_log("Coauthor changed");
            }
        }
        
        // STEP 4: Upload new files to the SAME entry folder
        // Create entry folder if it doesn't exist
        if (empty($entryFolderId)) {
            error_log("No entry folder found, creating new folder structure");
            
            // Generate entry folder name from author and title
            $authorParts = explode(' ', trim($docInfo['author']));
            $authorLastName = end($authorParts);
            $titleWords = explode(' ', trim($docInfo['title']));
            $titleKeywords = implode('_', array_slice($titleWords, 0, 3));
            $entryFolderName = $authorLastName . '_' . $titleKeywords;
            
            $newFolders = $driveService->createCompleteFolderStructure(
                $docInfo['event'],
                $docInfo['center'],
                $docInfo['category'],
                $entryFolderName
            );
            
            $entryFolderId = $newFolders['entry_folder_id'];
            
            // Update folder IDs in database
            $updates[] = "drive_event_folder_id = ?";
            $params[] = $newFolders['event_folder_id'];
            $types .= "s";
            
            $updates[] = "drive_center_folder_id = ?";
            $params[] = $newFolders['center_folder_id'];
            $types .= "s";
            
            $updates[] = "drive_category_folder_id = ?";
            $params[] = $newFolders['category_folder_id'];
            $types .= "s";
            
            $updates[] = "drive_entry_folder_id = ?";
            $params[] = $newFolders['entry_folder_id'];
            $types .= "s";
            
            error_log("Created new entry folder: $entryFolderId");
        }
        
        // Upload research file
        if (isset($_FILES['researchDoc']) && $_FILES['researchDoc']['error'] === UPLOAD_ERR_OK) {
            $tempPath = $_FILES['researchDoc']['tmp_name'];
            $fileName = $_FILES['researchDoc']['name'];
            
            error_log("Uploading new research file to folder $entryFolderId: $fileName");
            
            $driveResult = $driveService->uploadFile($tempPath, $fileName, $entryFolderId);
            
            if (!$driveResult['success']) {
                throw new Exception("Failed to upload new research file: " . ($driveResult['error'] ?? 'Unknown error'));
            }
            
            // Make file public
            $driveService->makeFilePublic($driveResult['id']);
            
            $updates[] = "drive_file_id = ?";
            $params[] = $driveResult['id'];
            $types .= "s";
            
            $updates[] = "drive_view_url = ?";
            $params[] = "https://drive.google.com/file/d/{$driveResult['id']}/preview";
            $types .= "s";
            
            error_log("Research file uploaded to new ID: " . $driveResult['id']);
        }
        
        // Upload program file
        if (isset($_FILES['programFile']) && $_FILES['programFile']['error'] === UPLOAD_ERR_OK) {
            $tempPath = $_FILES['programFile']['tmp_name'];
            $fileName = $_FILES['programFile']['name'];
            
            error_log("Uploading new program file to folder $entryFolderId: $fileName");
            
            $driveResult = $driveService->uploadFile($tempPath, $fileName, $entryFolderId);
            
            if (!$driveResult['success']) {
                throw new Exception("Failed to upload new program file: " . ($driveResult['error'] ?? 'Unknown error'));
            }
            
            // Make file public
            $driveService->makeFilePublic($driveResult['id']);
            
            $updates[] = "program_drive_file_id = ?";
            $params[] = $driveResult['id'];
            $types .= "s";
            
            $updates[] = "program_drive_view_url = ?";
            $params[] = "https://drive.google.com/file/d/{$driveResult['id']}/preview";
            $types .= "s";
            
            error_log("Program file uploaded to new ID: " . $driveResult['id']);
        }
        
        // Upload endorsement file (goes to center folder, not entry folder)
        if (isset($_FILES['endorsementFile']) && $_FILES['endorsementFile']['error'] === UPLOAD_ERR_OK) {
            $tempPath = $_FILES['endorsementFile']['tmp_name'];
            $fileName = $_FILES['endorsementFile']['name'];
            
            // Get or create center folder for endorsement
            $centerFolderId = $docInfo['drive_center_folder_id'];
            
            if (empty($centerFolderId)) {
                // Create center folder structure
                $folders = $driveService->createResearchFolderStructure(
                    $docInfo['event'],
                    $docInfo['center']
                );
                $centerFolderId = $folders['center_folder_id'];
            }
            
            error_log("Uploading new endorsement file to center folder $centerFolderId: $fileName");
            
            $driveResult = $driveService->uploadFile($tempPath, $fileName, $centerFolderId);
            
            if (!$driveResult['success']) {
                throw new Exception("Failed to upload new endorsement file: " . ($driveResult['error'] ?? 'Unknown error'));
            }
            
            // Make file public
            $driveService->makeFilePublic($driveResult['id']);
            
            // Update endorsement table
            $updateEndorseQuery = "UPDATE endorsement SET 
                drive_file_id = ?,
                drive_view_url = ?,
                drive_download_url = ?,
                status = NULL
                WHERE id = ?";
            $updateEndorseStmt = $con->prepare($updateEndorseQuery);
            $downloadUrl = "https://drive.google.com/uc?id={$driveResult['id']}&export=download";
            $viewUrl = "https://drive.google.com/file/d/{$driveResult['id']}/preview";
            
            $updateEndorseStmt->bind_param(
                "ssss",
                $driveResult['id'],
                $viewUrl,
                $downloadUrl,
                $endorsementId
            );
            
            if (!$updateEndorseStmt->execute()) {
                throw new Exception("Failed to update endorsement table: " . $updateEndorseStmt->error);
            }
            
            error_log("Endorsement file uploaded to new ID: " . $driveResult['id']);
        }
        
        // Set status to NULL (waiting for acceptance)
        $updates[] = "status = NULL";
        $updates[] = "rejected_by = NULL";
        $updates[] = "rejected_date = NULL";
        $updates[] = "resubmitted = 1";
        $updates[] = "resubmit_count = ?";
        $params[] = $resubmitCount;
        $types .= "i";

        // If nothing changed, return error
        if (empty($updates)) {
            $response->message = "No changes detected";
            echo json_encode($response);
            exit();
        }

        // Build the final UPDATE query for researchfile
        $updateQuery = "UPDATE researchfile SET " . implode(", ", $updates) . " WHERE endorsementid = ?";
        $params[] = $endorsementId;
        $types .= "s";

        error_log("Update query: $updateQuery");
        error_log("Parameters count: " . count($params) . ", Types: $types");

        // Start transaction
        $con->begin_transaction();

        try {
            $updateStmt = $con->prepare($updateQuery);
            
            if (!$updateStmt) {
                throw new Exception("Failed to prepare update: " . $con->error);
            }
            
            // Bind parameters dynamically
            $bindParams = array_merge([$types], $params);
            $bindParamsRef = [];
            foreach ($bindParams as $key => $value) {
                $bindParamsRef[$key] = &$bindParams[$key];
            }
            
            call_user_func_array([$updateStmt, 'bind_param'], $bindParamsRef);
            
            if (!$updateStmt->execute()) {
                throw new Exception("Failed to execute update: " . $updateStmt->error);
            }
            
            if ($updateStmt->affected_rows === 0) {
                throw new Exception("Failed to update document - no rows affected");
            }
            
            // ALWAYS update endorsement status to NULL regardless of which files changed
            $updateEndorseStatusQuery = "UPDATE endorsement SET status = NULL WHERE id = ?";
            $updateEndorseStatusStmt = $con->prepare($updateEndorseStatusQuery);
            $updateEndorseStatusStmt->bind_param("s", $endorsementId);
            
            if (!$updateEndorseStatusStmt->execute()) {
                throw new Exception("Failed to update endorsement status: " . $updateEndorseStatusStmt->error);
            }
            
            error_log("Endorsement status set to NULL for ID: $endorsementId");
            
            $con->commit();
            
            $response->status = true;
            $response->message = "Document resubmitted successfully. Status changed to waiting for acceptance.";
            
        } catch (Exception $e) {
            $con->rollback();
            $response->message = "Error: " . $e->getMessage();
            error_log("Resubmit failed: " . $e->getMessage());
        }
    } else {
        $response->message = "Database connection error";
    }
    
    echo json_encode($response);
    exit();
}

if (isset($_POST['deleteEndorsement'])) {
    $response = new stdClass();
    $response->message = '';
    $response->status = false;
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docId = $_POST['docId'];
        
        // Start transaction
        $con->begin_transaction();
        
        try {
            // Get all Google Drive file IDs and folder IDs for this endorsement
            $fileQuery = "SELECT 
                e.drive_file_id as endorsement_drive_id,
                e.drive_event_folder_id,
                e.drive_center_folder_id,
                e.drive_category_folder_id,
                e.drive_entry_folder_id,
                rf.id as research_id,
                rf.drive_file_id as research_drive_id,
                rf.program_drive_file_id,
                rf.drive_event_folder_id as research_event_folder,
                rf.drive_center_folder_id as research_center_folder,
                rf.drive_category_folder_id as research_category_folder,
                rf.drive_entry_folder_id as research_entry_folder
            FROM endorsement e
            LEFT JOIN researchfile rf ON rf.endorsementid = e.id
            WHERE e.id = ?";
            
            $fileStmt = $con->prepare($fileQuery);
            $fileStmt->bind_param("s", $docId);
            $fileStmt->execute();
            $fileResult = $fileStmt->get_result();
            
            $driveFileIds = [];
            $folderIds = [];
            $researchIds = [];
            
            while ($row = $fileResult->fetch_assoc()) {
                // Collect endorsement drive files
                if (!empty($row['endorsement_drive_id'])) {
                    $driveFileIds[] = $row['endorsement_drive_id'];
                }
                
                // Collect research drive files
                if (!empty($row['research_drive_id'])) {
                    $driveFileIds[] = $row['research_drive_id'];
                }
                
                // Collect program drive files
                if (!empty($row['program_drive_file_id'])) {
                    $driveFileIds[] = $row['program_drive_file_id'];
                }
                
                // Collect research IDs for comment deletion
                if (!empty($row['research_id'])) {
                    $researchIds[] = $row['research_id'];
                }
                
                // Collect folder IDs (optional - we might keep folders even if empty)
                if (!empty($row['drive_entry_folder_id'])) {
                    $folderIds[] = $row['drive_entry_folder_id'];
                }
                if (!empty($row['research_entry_folder'])) {
                    $folderIds[] = $row['research_entry_folder'];
                }
            }
            
            error_log("Files to delete from Google Drive: " . json_encode($driveFileIds));
            
            // Initialize Google Drive service
            require_once __DIR__ . '/../config/driver_config.php';
            
            if (!class_exists('GoogleDriveService')) {
                throw new Exception("GoogleDriveService class not found");
            }
            
            $driveService = new GoogleDriveService();
            
            // Move files to trash in Google Drive
            $trashedCount = 0;
            $failedFiles = [];
            
            foreach ($driveFileIds as $fileId) {
                try {
                    if (!empty($fileId)) {
                        error_log("Moving Google Drive file to trash: $fileId");
                        $result = $driveService->trashFile($fileId);
                        if ($result) {
                            $trashedCount++;
                            error_log("Successfully trashed file: $fileId");
                        } else {
                            $failedFiles[] = $fileId;
                            error_log("Failed to trash file: $fileId");
                        }
                    }
                } catch (Exception $e) {
                    $failedFiles[] = $fileId;
                    error_log("Exception trashing file $fileId: " . $e->getMessage());
                    // Continue with other files even if one fails
                }
            }
            
            // Delete comments for all research files
            if (!empty($researchIds)) {
                $placeholders = implode(',', array_fill(0, count($researchIds), '?'));
                $commentDeleteQuery = "DELETE FROM comments WHERE resid IN ($placeholders)";
                $commentDeleteStmt = $con->prepare($commentDeleteQuery);
                
                // Dynamically bind parameters
                $types = str_repeat('s', count($researchIds));
                $commentDeleteStmt->bind_param($types, ...$researchIds);
                $commentDeleteStmt->execute();
                $commentsDeleted = $commentDeleteStmt->affected_rows;
                error_log("Deleted $commentsDeleted comments for research IDs: " . implode(',', $researchIds));
            }
            
            // Delete researchfile records
            $deleteResearchQuery = "DELETE FROM researchfile WHERE endorsementid = ?";
            $deleteResearchStmt = $con->prepare($deleteResearchQuery);
            $deleteResearchStmt->bind_param("s", $docId);
            $deleteResearchStmt->execute();
            $researchDeleted = $deleteResearchStmt->affected_rows;
            
            // Delete endorsement record
            $deleteEndorseQuery = "DELETE FROM endorsement WHERE id = ?";
            $deleteEndorseStmt = $con->prepare($deleteEndorseQuery);
            $deleteEndorseStmt->bind_param("s", $docId);
            $deleteEndorseStmt->execute();
            $endorsementDeleted = $deleteEndorseStmt->affected_rows;
            
            if ($endorsementDeleted > 0) {
                // Log the deletion
                $logQuery = "INSERT INTO document_log (user_id, doc_id, details, date) VALUES (?, ?, ?, NOW())";
                $logStmt = $con->prepare($logQuery);
                
                $userName = $_SESSION['userName'] ?? $_SESSION['userFulname'] ?? 'Unknown User';
                $details = "User: $userName deleted endorsement ID: $docId. ";
                $details .= "$trashedCount Google Drive file(s) moved to trash.";
                
                if (!empty($failedFiles)) {
                    $details .= " Failed to trash: " . implode(', ', $failedFiles);
                }
                
                $logStmt->bind_param("sss", $_SESSION['userId'], $docId, $details);
                $logStmt->execute();
                
                $con->commit();
                
                // Build response message
                $response->status = true;
                $response->message = "Document deleted successfully. ";
                $response->message .= "$trashedCount file(s) moved to Google Drive trash.";
                
                if ($researchDeleted > 0) {
                    $response->message .= " $researchDeleted research record(s) deleted.";
                }
                
                if (!empty($failedFiles)) {
                    $response->message .= " Warning: " . count($failedFiles) . " file(s) could not be trashed.";
                    $response->failed_files = $failedFiles;
                }
                
                $response->trashed_count = $trashedCount;
                $response->research_deleted = $researchDeleted;
                
            } else {
                throw new Exception("No endorsement record found to delete");
            }
            
        } catch (Exception $e) {
            $con->rollback();
            $response->message = "Error: " . $e->getMessage();
            $response->error_details = $e->getMessage();
            error_log("Delete endorsement failed: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
        }
    } else {
        $response->message = "Database connection error: " . mysqli_connect_error();
    }
    
    // Ensure clean JSON output
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

if (isset($_POST['rejectRequest'])) {
    $response = new stdClass();
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docId = $_POST['dicId'];
        $query = "SELECT rejecteddocs.rejectedby,rejecteddocs.reason FROM rejecteddocs WHERE rejecteddocs.docid=?";
        $statement = $con->prepare($query);
        $statement->bind_param("s", $docId);
        $statement->execute();
        $result = $statement->get_result();
        while ($val = $result->fetch_assoc()) {
            $response->message = $val['reason'];
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['fileReqRes'])) {
    $response = '';
    $docId = $_POST['docId'];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Updated query to get Google Drive URL from researchfile table
        $query = "SELECT 
            researchfile.drive_view_url as researchfile,
            researchfile.drive_file_id,
            researchfile.drive_download_url,
            researchfile.drive_folder_id,
            researchfile.author,
            researchfile.title
        FROM researchfile WHERE researchfile.id=?";
        
        $statement = $con->prepare($query);
        $statement->bind_param('s', $docId);
        $statement->execute();
        $result = $statement->get_result();
        
        if ($result->num_rows > 0) {
            $val = $result->fetch_assoc();
            
            // Return JSON with all Google Drive metadata
            $response = [
                'drive_view_url' => $val['researchfile'],
                'drive_file_id' => $val['drive_file_id'],
                'drive_download_url' => $val['drive_download_url'],
                'drive_folder_id' => $val['drive_folder_id'],
                'author' => $val['author'],
                'title' => $val['title']
            ];
            
            // If no drive_view_url exists, check if there's a local file
            if (empty($val['researchfile'])) {
                // Fallback to old logic (for backward compatibility)
                $fallbackQuery = "SELECT researchallfile.researchfile FROM researchallfile WHERE researchallfile.docid=?";
                $fallbackStatement = $con->prepare($fallbackQuery);
                $fallbackStatement->bind_param('s', $docId);
                $fallbackStatement->execute();
                $fallbackResult = $fallbackStatement->get_result();
                
                if ($fallbackResult->num_rows > 0) {
                    $fallbackVal = $fallbackResult->fetch_assoc();
                    $response = [
                        'local_file' => $fallbackVal['researchfile'],
                        'type' => 'local'
                    ];
                }
            }
        } else {
            // Check researchallfile as fallback (for older records)
            $fallbackQuery = "SELECT researchallfile.researchfile FROM researchallfile WHERE researchallfile.docid=?";
            $fallbackStatement = $con->prepare($fallbackQuery);
            $fallbackStatement->bind_param('s', $docId);
            $fallbackStatement->execute();
            $fallbackResult = $fallbackStatement->get_result();
            
            if ($fallbackResult->num_rows > 0) {
                $fallbackVal = $fallbackResult->fetch_assoc();
                $response = [
                    'local_file' => $fallbackVal['researchfile'],
                    'type' => 'local'
                ];
            }
        }
    }
    
    // Return JSON response
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

if (isset($_POST['viewDocReq'])) {
    $response = new stdClass();
    $response->status = false;
    $response->data = '';
    $response->drive_file_id = '';
    $response->drive_view_url = '';
    $response->drive_download_url = '';
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // UPDATED QUERY for Google Drive
        $query = "SELECT 
            researchfile.drive_view_url as file,
            researchfile.drive_file_id,
            researchfile.drive_view_url,
            researchfile.drive_download_url,
            researchfile.drive_folder_id,
            researchfile.drive_event_folder_id,
            researchfile.drive_center_folder_id
        FROM researchfile WHERE researchfile.id=? LIMIT 1";
        
        $docId = $_POST['docId'];
        $statement = $con->prepare($query);
        $statement->bind_param('s', $docId);
        $statement->execute();
        $res = $statement->get_result();
        
        while ($val = $res->fetch_assoc()) {
            $response->data = $val['file']; // Google Drive URL
            $response->drive_file_id = $val['drive_file_id'];
            $response->drive_view_url = $val['drive_view_url'];
            $response->drive_download_url = $val['drive_download_url'];
            $response->drive_folder_id = $val['drive_folder_id'];
            $response->drive_event_folder_id = $val['drive_event_folder_id'];
            $response->drive_center_folder_id = $val['drive_center_folder_id'];
            $response->status = true;
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if(isset($_POST['resetComments'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="DELETE FROM comments
        WHERE comments.resid=? AND comments.evalid=?";
        $statement=$con->prepare($query);
        $statement->bind_param("ss",$_POST['docId'],$_SESSION['userId']);
        $status=$statement->execute();
        if($status){
            $response->status=true;
        }else{
            $response->message=$statement->error;
        }
    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
    exit();
}
