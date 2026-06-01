<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../drive_errors.log');

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
require_once __DIR__ . '/../../config/driver_config.php';
include(__DIR__ . '/../db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
/** @var TYPE_NAME $rdeEmail */
/** @var TYPE_NAME $emailPassword */

require_once __DIR__ . '/../Mailer/mailTemplate.php';
require_once __DIR__ . '/../Mailer/MailSender.php';
date_default_timezone_set('Asia/Manila');

function cleanFolderNameForDrive($name)
{
    if (empty($name)) {
        return 'Untitled_' . time();
    }

    $clean = preg_replace('/[^\w\s\-_.,()&]/', '', $name);
    
    $clean = str_replace('/', '-', $clean);
    
    $clean = preg_replace('/\s+/', ' ', $clean);
    
    $clean = trim($clean);
    
    $clean = rtrim($clean, '.,');
    
    if (strlen($clean) > 200) {
        $clean = substr($clean, 0, 197) . '...';
    }
    
    return $clean;
}

function capitalizeFirstLetter($str) {
    if (empty($str)) return $str;
    return ucwords(strtolower(trim($str)));
}

function uploadStudentResearchToDrive($tempFilePath, $fileName, $eventName, $campus, $category, $author, $title, $type = 'research', $isEndorsement = false)
{
    try {
        if (!file_exists($tempFilePath)) {
            throw new Exception("Temporary file not found: $tempFilePath");
        }
        
        $fileSize = filesize($tempFilePath);
        if ($fileSize > 10 * 1024 * 1024) {
            throw new Exception("File too large: " . round($fileSize / 1024 / 1024, 2) . "MB");
        }
        
        if (!class_exists('GoogleDriveService')) {
            throw new Exception("GoogleDriveService class not found");
        }
        
        $drive = new GoogleDriveService();
        
        $cleanEventName = cleanFolderNameForDrive($eventName);
        $cleanCampusName = cleanFolderNameForDrive($campus);
        $cleanCategoryName = cleanFolderNameForDrive($category);
        
        $authorParts = explode(' ', trim($author));
        $authorLastName = end($authorParts);
        $authorLastName = cleanFolderNameForDrive($authorLastName);
        
        // START DIRECTLY WITH EVENT FOLDER - NO PARENT FOLDER
        $eventNameFolderId = $drive->findOrCreateFolder($cleanEventName, null);
        if (!$eventNameFolderId)
            throw new Exception("Failed to create event folder: $cleanEventName");
        
        $campusFolderId = $drive->findOrCreateFolder($cleanCampusName, $eventNameFolderId);
        if (!$campusFolderId)
            throw new Exception("Failed to create campus folder");
        
        $categoryFolderId = $drive->findOrCreateFolder($cleanCategoryName, $campusFolderId);
        if (!$categoryFolderId)
            throw new Exception("Failed to create category folder");
        
        // Create per-research folder inside Category using Author Last Name - Title format
        $cleanTitleForFolder = preg_replace('/[^\w\s\-]/', '', $title);
        $cleanTitleForFolder = preg_replace('/\s+/', ' ', $cleanTitleForFolder);
        $cleanTitleForFolder = trim($cleanTitleForFolder);
        if (strlen($cleanTitleForFolder) > 60) {
            $cleanTitleForFolder = substr($cleanTitleForFolder, 0, 57) . '...';
        }
        $cleanTitleForFolder = cleanFolderNameForDrive($cleanTitleForFolder);
        
        $entryFolderName = $authorLastName . ' - ' . $cleanTitleForFolder;
        $entryFolderName = cleanFolderNameForDrive($entryFolderName);
        
        $entryFolderId = $drive->findOrCreateFolder($entryFolderName, $categoryFolderId);
        if (!$entryFolderId)
            throw new Exception("Failed to create entry folder: $entryFolderName");
        
        // Clean title for filename
        $cleanTitle = preg_replace('/[^\w\s\-]/', '', $title);
        $cleanTitle = preg_replace('/\s+/', ' ', $cleanTitle);
        $cleanTitle = trim($cleanTitle);
        if (strlen($cleanTitle) > 50) {
            $cleanTitle = substr($cleanTitle, 0, 47) . '...';
        }
        $cleanTitle = cleanFolderNameForDrive($cleanTitle);
        
        // Filename format
        if ($type === 'research') {
            $prefixedFileName = $cleanTitle . ' - research paper.pdf';
        } elseif ($isEndorsement) {
            $prefixedFileName = $cleanTitle . ' - endorsement letter.pdf';
        } else {
            $prefixedFileName = $fileName;
        }
        
        error_log("Uploading $type file: $prefixedFileName to folder: $entryFolderId");
        $uploadResult = $drive->uploadFile($tempFilePath, $prefixedFileName, $entryFolderId);
        
        if (!$uploadResult['success'] || empty($uploadResult['id'])) {
            $errorMsg = $uploadResult['error'] ?? "Upload failed: No file ID returned";
            throw new Exception($errorMsg);
        }
        
        $drive->makeFilePublic($uploadResult['id']);
        
        $fileId = $uploadResult['id'];
        $embedUrl = "https://drive.google.com/file/d/{$fileId}/preview";
        $downloadUrl = "https://drive.google.com/uc?id={$fileId}&export=download";
        
        return [
            'success' => true,
            'drive_file_id' => $uploadResult['id'],
            'drive_view_url' => $embedUrl,
            'drive_download_url' => $downloadUrl,
            'drive_event_folder_id' => $eventNameFolderId,
            'drive_campus_folder_id' => $campusFolderId,
            'drive_category_folder_id' => $categoryFolderId,
            'drive_entry_folder_id' => $entryFolderId,
            'entry_folder_name' => $entryFolderName,
            'file_size' => $uploadResult['size'] ?? 0,
            'file_name' => $prefixedFileName,
            'author_last_name' => $authorLastName
        ];
        
    } catch (Exception $e) {
        error_log("Google Drive upload failed for $fileName: " . $e->getMessage());
        throw new Exception("Failed to upload $fileName to Google Drive: " . $e->getMessage());
    }
}
function uploadStudentToPaperTrail($tempFilePath, $fileName, $eventName, $author, $title, $type, $isEndorsement, $paperType = 'undergraduate')
{
    try {
        if (!file_exists($tempFilePath)) {
            return ['success' => false, 'error' => "Temporary file not found: $tempFilePath"];
        }

        if (!class_exists('GoogleDriveService')) {
            return ['success' => false, 'error' => "GoogleDriveService class not found"];
        }

        $drive = new GoogleDriveService();
        $year = date('Y');

        $authorParts = explode(' ', trim($author));
        $authorLastName = end($authorParts);
        $authorLastName = cleanFolderNameForDrive($authorLastName);

        $cleanTitle = preg_replace('/[^\w\s\-]/', '', $title);
        $cleanTitle = preg_replace('/\s+/', ' ', $cleanTitle);
        $cleanTitle = trim($cleanTitle);
        if (strlen($cleanTitle) > 80) {
            $cleanTitle = substr($cleanTitle, 0, 77) . '...';
        }
        $cleanTitle = cleanFolderNameForDrive($cleanTitle);

        // Paper Trail structure: Paper Trail -> {Undergraduate/Graduate} -> Year
        $paperTrailRootId = $drive->findOrCreateFolder('Paper Trail', null);
        if (!$paperTrailRootId) {
            return ['success' => false, 'error' => "Failed to create Paper Trail root folder"];
        }

        // Keep separation for archive - Undergraduate Symposium or Graduate Symposium
        $subTypeFolderName = ($paperType === 'graduate') ? 'Graduate Symposium' : 'Undergraduate Symposium';
        $subTypeFolderId = $drive->findOrCreateFolder($subTypeFolderName, $paperTrailRootId);
        if (!$subTypeFolderId) {
            return ['success' => false, 'error' => "Failed to create $subTypeFolderName folder"];
        }

        $yearFolderId = $drive->findOrCreateFolder($year, $subTypeFolderId);
        if (!$yearFolderId) {
            return ['success' => false, 'error' => "Failed to create Year folder: $year"];
        }

        // Create research folder: Author Last Name - Title (no timestamp needed)
        $researchFolderName = $authorLastName . ' - ' . $cleanTitle;
        $researchFolderName = cleanFolderNameForDrive($researchFolderName);
        
        $researchFolderId = $drive->findOrCreateFolder($researchFolderName, $yearFolderId);
        if (!$researchFolderId) {
            return ['success' => false, 'error' => "Failed to create research folder: $researchFolderName"];
        }

        // Determine file name for Student Paper Trail
        $paperTrailFileName = '';
        if ($type === 'research') {
            $paperTrailFileName = 'research_paper.pdf';
        } elseif ($isEndorsement) {
            $paperTrailFileName = 'endorsement_letter.pdf';
        } else {
            $paperTrailFileName = 'document.pdf';
        }

        $uploadResult = $drive->uploadFile($tempFilePath, $paperTrailFileName, $researchFolderId);

        if (!$uploadResult['success'] || empty($uploadResult['id'])) {
            $errorMsg = $uploadResult['error'] ?? 'Unknown error';
            return ['success' => false, 'error' => $errorMsg];
        }

        $drive->makeFilePublic($uploadResult['id']);

        $fileId = $uploadResult['id'];
        $embedUrl = "https://drive.google.com/file/d/{$fileId}/preview";
        $downloadUrl = "https://drive.google.com/uc?id={$fileId}&export=download";

        return [
            'success' => true,
            'drive_file_id' => $fileId,
            'drive_view_url' => $embedUrl,
            'drive_download_url' => $downloadUrl,
            'paper_trail_root_id' => $paperTrailRootId,
            'sub_type_folder_id' => $subTypeFolderId,
            'year_folder_id' => $yearFolderId,
            'research_folder_id' => $researchFolderId,
            'research_folder_name' => $researchFolderName,
            'year' => $year,
            'submission_type' => $paperType === 'graduate' ? 'Graduate' : 'Undergrad',
            'file_name' => $paperTrailFileName,
            'author_last_name' => $authorLastName,
            'file_type' => $type,
            'paper_type' => $paperType
        ];

    } catch (Exception $e) {
        error_log("Student Paper Trail upload failed: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

function generateFileHash($filePath)
{
    if (!file_exists($filePath)) {
        return false;
    }
    
    $handle = fopen($filePath, 'rb');
    if (!$handle) {
        return false;
    }
    
    $hashContext = hash_init('sha256');
    $fileSize = filesize($filePath);
    
    if ($fileSize > 2 * 1024 * 1024) {
        $firstChunk = fread($handle, 1024 * 1024);
        hash_update($hashContext, $firstChunk);
        fseek($handle, -1024 * 1024, SEEK_END);
        $lastChunk = fread($handle, 1024 * 1024);
        hash_update($hashContext, $lastChunk);
    } else {
        while (!feof($handle)) {
            $chunk = fread($handle, 8192);
            hash_update($hashContext, $chunk);
        }
    }
    
    fclose($handle);
    return hash_final($hashContext);
}

function checkDuplicateStudentResearch($con, $title, $author, $eventId, $eventName, $paperType = 'undergraduate')
{
    $query = "SELECT id, title, author, event, event_id, status, paper_type 
              FROM student_research_papers 
              WHERE TRIM(LOWER(title)) = TRIM(LOWER(?)) 
              AND TRIM(LOWER(author)) = TRIM(LOWER(?))
              AND (event_id = ? OR event = ?)
              AND paper_type = ?
              LIMIT 1";
    
    $stmt = $con->prepare($query);
    if (!$stmt) {
        return ['isDuplicate' => false, 'message' => ''];
    }
    
    $stmt->bind_param("ssiss", $title, $author, $eventId, $eventName, $paperType);
    $stmt->execute();
    $result = $stmt->get_result();
    $existing = $result->fetch_assoc();
    $stmt->close();
    
    if ($existing) {
        $statusMsg = '';
        if ($existing['status'] === 'pending') {
            $statusMsg = " This submission is still pending review.";
        } elseif ($existing['status'] === 'rejected') {
            $statusMsg = " This submission was rejected. Please check your email for feedback before resubmitting.";
        }
        
        return [
            'isDuplicate' => true, 
            'message' => "A research paper with the title '{$existing['title']}' and author '{$existing['author']}' already exists for this {$paperType} event." . $statusMsg,
            'existingRecord' => $existing
        ];
    }
    
    return ['isDuplicate' => false, 'message' => ''];
}

// ==================== UNDERGRADUATE SUBMISSION ENDPOINT ====================
if (isset($_POST['uploadUndergraduateSymposium'])) {
    ob_end_clean();
    ob_start();
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
    
    $senderId = $_SESSION['userId'];
    $response = new stdClass();
    $response->message = '';
    $response->serverMessage = "";
    $response->status = false;
    $response->debug = [];
    
    try {
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            if ($con->connect_error) {
                throw new Exception("Database connection failed: " . $con->connect_error);
            }
            
            $eventName = $_POST['eventType'] ?? '';
            $title = capitalizeFirstLetter($_POST['title'] ?? '');
            $author = capitalizeFirstLetter($_POST['author'] ?? '');
            $category = $_POST['category'] ?? '';
            $campus = $_POST['campus'] ?? '';
            $presenter = capitalizeFirstLetter($_POST['presenter'] ?? '');
            $coAuthor = $_POST['coAuthor'] ?? '[]';
            $paperType = 'undergraduate';
            
            $eventId = null;
            $eventIdQuery = "SELECT id FROM event_list WHERE name = ? LIMIT 1";
            $eventStmt = $con->prepare($eventIdQuery);
            if ($eventStmt) {
                $eventStmt->bind_param("s", $eventName);
                $eventStmt->execute();
                $eventResult = $eventStmt->get_result();
                $eventRow = $eventResult->fetch_assoc();
                $eventId = $eventRow ? $eventRow['id'] : null;
                $eventStmt->close();
            }
            
            $duplicateCheck = checkDuplicateStudentResearch($con, $title, $author, $eventId, $eventName, $paperType);
            if ($duplicateCheck['isDuplicate']) {
                $response->message = $duplicateCheck['message'];
                $response->status = false;
                
                ob_clean();
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode($response);
                exit();
            }
            
            $checkQuery = "SELECT COUNT(*) FROM event_list WHERE event_list.name=? AND event_list.dead_line>CURRENT_TIMESTAMP";
            $checkStatement = $con->prepare($checkQuery);
            if (!$checkStatement) {
                throw new Exception("Prepare failed: " . $con->error);
            }
            
            $checkStatement->bind_param("s", $eventName);
            $checkStatement->execute();
            $resss = $checkStatement->get_result()->fetch_row();
            
            if ($resss[0] == 0) {
                $response->message = "Sorry, the event has closed for submissions.";
                $response->status = false;
                ob_clean();
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode($response);
                exit();
            }
            
            if (!isset($_FILES['researchDoc']) || $_FILES['researchDoc']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception("Research paper is required");
            }
            
            if (!isset($_FILES['endorsementDoc']) || $_FILES['endorsementDoc']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception("Endorsement letter is required");
            }
            
            $tempResearchPath = $_FILES['researchDoc']['tmp_name'];
            $researchFileName = $_FILES['researchDoc']['name'];
            
            error_log("Uploading undergraduate research: $researchFileName");
            
            $researchDriveResult = uploadStudentResearchToDrive(
                $tempResearchPath,
                $researchFileName,
                $eventName,
                $campus,
                $category,
                $author,
                $title,
                'research',
                false,
                $paperType
            );
            
            if (!$researchDriveResult['success']) {
                throw new Exception("Research upload failed: " . ($researchDriveResult['error'] ?? 'Unknown error'));
            }
            
            $tempEndorsementPath = $_FILES['endorsementDoc']['tmp_name'];
            $endorsementFileName = $_FILES['endorsementDoc']['name'];
            
            $endorsementDriveResult = uploadStudentResearchToDrive(
                $tempEndorsementPath,
                $endorsementFileName,
                $eventName,
                $campus,
                $category,
                $author,
                $title,
                'endorsement',
                true,
                $paperType
            );
            
            if (!$endorsementDriveResult['success']) {
                throw new Exception("Endorsement upload failed: " . ($endorsementDriveResult['error'] ?? 'Unknown error'));
            }
            
            $insertQuery = "INSERT INTO student_research_papers (
                senderid,
                event_id,
                author,
                coauthor,
                presenter,
                title,
                event,
                status,
                paper_type,
                category,
                campus,
                drive_event_folder_id,
                drive_category_folder_id,
                drive_campus_folder_id,
                drive_entry_folder_id,
                research_file_view_url,
                research_file_download_url,
                endorsement_file_view_url,
                endorsement_download_url,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            
            $stmt = $con->prepare($insertQuery);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $con->error);
            }
            
            $status = 'pending';
            
            $stmt->bind_param(
                'iisssssssssssssssss',
                $senderId,
                $eventId,
                $author,
                $coAuthor,
                $presenter,
                $title,
                $eventName,
                $status,
                $paperType,
                $category,
                $campus,
                $researchDriveResult['drive_event_folder_id'],
                $researchDriveResult['drive_category_folder_id'],
                $researchDriveResult['drive_campus_folder_id'],
                $researchDriveResult['drive_entry_folder_id'],
                $researchDriveResult['drive_view_url'],
                $researchDriveResult['drive_download_url'],
                $endorsementDriveResult['drive_view_url'],
                $endorsementDriveResult['drive_download_url']
            );
            
            $insertResult = $stmt->execute();
            
            if (!$insertResult) {
                throw new Exception("Database insert failed: " . $stmt->error);
            }
            
            $researchId = $con->insert_id;
            $stmt->close();
            
            // ========== PAPER TRAIL INTEGRATION (without paper trail number) ==========
            $paperTrailResults = [];
            
            // Upload Research File to Paper Trail
            if (isset($_FILES['researchDoc']) && $_FILES['researchDoc']['error'] === UPLOAD_ERR_OK && $researchId) {
                $paperTrailResearchResult = uploadStudentToPaperTrail(
                    $tempResearchPath,
                    $researchFileName,
                    $eventName,
                    $author,
                    $title,
                    'research',
                    false
                );
                
                if ($paperTrailResearchResult && $paperTrailResearchResult['success']) {
                    $paperTrailResults['research'] = $paperTrailResearchResult;
                }
            }
            
            // Upload Endorsement File to Paper Trail
            if (isset($_FILES['endorsementDoc']) && $_FILES['endorsementDoc']['error'] === UPLOAD_ERR_OK && $researchId) {
                $paperTrailEndorsementResult = uploadStudentToPaperTrail(
                    $tempEndorsementPath,
                    $endorsementFileName,
                    $eventName,
                    $author,
                    $title,
                    'endorsement',
                    true
                );
                
                if ($paperTrailEndorsementResult && $paperTrailEndorsementResult['success']) {
                    $paperTrailResults['endorsement'] = $paperTrailEndorsementResult;
                }
            }
            
            // Save Paper Trail records to paper_trail_student table
            if ($researchId && !empty($paperTrailResults)) {
                $paperTrailQuery = "INSERT INTO paper_trail_student (
                    student_researchid, 
                    submission_type, 
                    year,
                    submission_folder_id, 
                    year_folder_id,
                    research_folder_id,
                    research_file_view_url,
                    research_file_download_url,
                    endorsement_file_view_url,
                    endorsement_file_download_url,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
                
                $paperTrailStmt = $con->prepare($paperTrailQuery);
                if ($paperTrailStmt) {
                    $currentYear = date('Y');
                    $submissionType = 'Undergrad';
                    
                    $researchViewUrl = null;
                    $researchDownloadUrl = null;
                    $endorsementViewUrl = null;
                    $endorsementDownloadUrl = null;
                    
                    if (isset($paperTrailResults['research'])) {
                        $researchViewUrl = $paperTrailResults['research']['drive_view_url'];
                        $researchDownloadUrl = $paperTrailResults['research']['drive_download_url'];
                    }
                    
                    if (isset($paperTrailResults['endorsement'])) {
                        $endorsementViewUrl = $paperTrailResults['endorsement']['drive_view_url'];
                        $endorsementDownloadUrl = $paperTrailResults['endorsement']['drive_download_url'];
                    }
                    
                    $firstResult = !empty($paperTrailResults['research']) ? $paperTrailResults['research'] : $paperTrailResults['endorsement'];
                    
                    $submissionFolderId = $firstResult['sub_type_folder_id'] ?? null;
                    $yearFolderId = $firstResult['year_folder_id'] ?? null;
                    $researchFolderId = $firstResult['research_folder_id'] ?? null;
                    
                    $paperTrailStmt->bind_param(
                        'isssssssss',
                        $researchId,
                        $submissionType,
                        $currentYear,
                        $submissionFolderId,
                        $yearFolderId,
                        $researchFolderId,
                        $researchViewUrl,
                        $researchDownloadUrl,
                        $endorsementViewUrl,
                        $endorsementDownloadUrl
                    );
                    
                    $paperTrailStmt->execute();
                    $paperTrailStmt->close();
                }
            }
            
            $response->message = "Undergraduate research paper submitted successfully!";
            $response->research_id = $researchId;
            $response->status = true;
            
        } else {
            throw new Exception("Database connection failed");
        }
    } catch (Exception $e) {
        error_log("Exception in uploadUndergraduateSymposium: " . $e->getMessage());
        $response->message = $e->getMessage();
        $response->status = false;
    }
    
    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

// ==================== GRADUATE SUBMISSION ENDPOINT ====================
if (isset($_POST['uploadGraduateSymposium'])) {
    ob_end_clean();
    ob_start();
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
    
    $senderId = $_SESSION['userId'];
    $response = new stdClass();
    $response->message = '';
    $response->serverMessage = "";
    $response->status = false;
    $response->debug = [];
    
    try {
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            if ($con->connect_error) {
                throw new Exception("Database connection failed: " . $con->connect_error);
            }
            
            $eventName = $_POST['eventType'] ?? '';
            $title = capitalizeFirstLetter($_POST['title'] ?? '');
            $author = capitalizeFirstLetter($_POST['author'] ?? '');
            $category = $_POST['category'] ?? '';
            $campus = $_POST['campus'] ?? '';
            $presenter = capitalizeFirstLetter($_POST['presenter'] ?? '');
            $coAuthor = $_POST['coAuthor'] ?? '[]';
            $paperType = 'graduate';
            
            $eventId = null;
            $eventIdQuery = "SELECT id FROM event_list WHERE name = ? LIMIT 1";
            $eventStmt = $con->prepare($eventIdQuery);
            if ($eventStmt) {
                $eventStmt->bind_param("s", $eventName);
                $eventStmt->execute();
                $eventResult = $eventStmt->get_result();
                $eventRow = $eventResult->fetch_assoc();
                $eventId = $eventRow ? $eventRow['id'] : null;
                $eventStmt->close();
            }
            
            $duplicateCheck = checkDuplicateStudentResearch($con, $title, $author, $eventId, $eventName, $paperType);
            if ($duplicateCheck['isDuplicate']) {
                $response->message = $duplicateCheck['message'];
                $response->status = false;
                
                ob_clean();
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode($response);
                exit();
            }
            
            $checkQuery = "SELECT COUNT(*) FROM event_list WHERE event_list.name=? AND event_list.dead_line>CURRENT_TIMESTAMP";
            $checkStatement = $con->prepare($checkQuery);
            if (!$checkStatement) {
                throw new Exception("Prepare failed: " . $con->error);
            }
            
            $checkStatement->bind_param("s", $eventName);
            $checkStatement->execute();
            $resss = $checkStatement->get_result()->fetch_row();
            
            if ($resss[0] == 0) {
                $response->message = "Sorry, the event has closed for submissions.";
                $response->status = false;
                ob_clean();
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode($response);
                exit();
            }
            
            if (!isset($_FILES['researchDoc']) || $_FILES['researchDoc']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception("Research paper is required");
            }
            
            if (!isset($_FILES['endorsementDoc']) || $_FILES['endorsementDoc']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception("Endorsement letter is required");
            }
            
            $tempResearchPath = $_FILES['researchDoc']['tmp_name'];
            $researchFileName = $_FILES['researchDoc']['name'];
            
            error_log("Uploading graduate research: $researchFileName");
            
            $researchDriveResult = uploadStudentResearchToDrive(
                $tempResearchPath,
                $researchFileName,
                $eventName,
                $campus,
                $category,
                $author,
                $title,
                'research',
                false,
                $paperType
            );
            
            if (!$researchDriveResult['success']) {
                throw new Exception("Research upload failed: " . ($researchDriveResult['error'] ?? 'Unknown error'));
            }
            
            $tempEndorsementPath = $_FILES['endorsementDoc']['tmp_name'];
            $endorsementFileName = $_FILES['endorsementDoc']['name'];
            
            $endorsementDriveResult = uploadStudentResearchToDrive(
                $tempEndorsementPath,
                $endorsementFileName,
                $eventName,
                $campus,
                $category,
                $author,
                $title,
                'endorsement',
                true,
                $paperType
            );
            
            if (!$endorsementDriveResult['success']) {
                throw new Exception("Endorsement upload failed: " . ($endorsementDriveResult['error'] ?? 'Unknown error'));
            }

            $insertQuery = "INSERT INTO student_research_papers (
                senderid,
                event_id,
                author,
                coauthor,
                presenter,
                title,
                event,
                status,
                paper_type,
                category,
                campus,
                drive_event_folder_id,
                drive_category_folder_id,
                drive_campus_folder_id,
                drive_entry_folder_id,
                research_file_view_url,
                research_file_download_url,
                endorsement_file_view_url,
                endorsement_download_url,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            
            $stmt = $con->prepare($insertQuery);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $con->error);
            }
            
            $status = 'pending';
            
            $stmt->bind_param(
                'iisssssssssssssssss',
                $senderId,
                $eventId,
                $author,
                $coAuthor,
                $presenter,
                $title,
                $eventName,
                $status,
                $paperType,
                $category,
                $campus,
                $researchDriveResult['drive_event_folder_id'],
                $researchDriveResult['drive_category_folder_id'],
                $researchDriveResult['drive_campus_folder_id'],
                $researchDriveResult['drive_entry_folder_id'],
                $researchDriveResult['drive_view_url'],
                $researchDriveResult['drive_download_url'],
                $endorsementDriveResult['drive_view_url'],
                $endorsementDriveResult['drive_download_url']
            );
            
            $insertResult = $stmt->execute();
            
            if (!$insertResult) {
                throw new Exception("Database insert failed: " . $stmt->error);
            }
            
            $researchId = $con->insert_id;
            $stmt->close();
            
            // ========== PAPER TRAIL INTEGRATION (without paper trail number) ==========
            $paperTrailResults = [];
            
            // Upload Research File to Paper Trail
            if (isset($_FILES['researchDoc']) && $_FILES['researchDoc']['error'] === UPLOAD_ERR_OK && $researchId) {
                $paperTrailResearchResult = uploadStudentToPaperTrail(
                    $tempResearchPath,
                    $researchFileName,
                    $eventName,
                    $author,
                    $title,
                    'research',
                    false,
                    $paperType
                );
                
                if ($paperTrailResearchResult && $paperTrailResearchResult['success']) {
                    $paperTrailResults['research'] = $paperTrailResearchResult;
                }
            }
            
            // Upload Endorsement File to Paper Trail
            if (isset($_FILES['endorsementDoc']) && $_FILES['endorsementDoc']['error'] === UPLOAD_ERR_OK && $researchId) {
                $paperTrailEndorsementResult = uploadStudentToPaperTrail(
                    $tempEndorsementPath,
                    $endorsementFileName,
                    $eventName,
                    $author,
                    $title,
                    'endorsement',
                    true
                );
                
                if ($paperTrailEndorsementResult && $paperTrailEndorsementResult['success']) {
                    $paperTrailResults['endorsement'] = $paperTrailEndorsementResult;
                }
            }
            
            // Save Paper Trail records to paper_trail_student table
            if ($researchId && !empty($paperTrailResults)) {
                $paperTrailQuery = "INSERT INTO paper_trail_student (
                    student_researchid, 
                    submission_type, 
                    year,
                    submission_folder_id, 
                    year_folder_id,
                    research_folder_id,
                    research_file_view_url,
                    research_file_download_url,
                    endorsement_file_view_url,
                    endorsement_file_download_url,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
                
                $paperTrailStmt = $con->prepare($paperTrailQuery);
                if ($paperTrailStmt) {
                    $currentYear = date('Y');
                    $submissionType = 'Graduate';
                    
                    $researchViewUrl = null;
                    $researchDownloadUrl = null;
                    $endorsementViewUrl = null;
                    $endorsementDownloadUrl = null;
                    
                    if (isset($paperTrailResults['research'])) {
                        $researchViewUrl = $paperTrailResults['research']['drive_view_url'];
                        $researchDownloadUrl = $paperTrailResults['research']['drive_download_url'];
                    }
                    
                    if (isset($paperTrailResults['endorsement'])) {
                        $endorsementViewUrl = $paperTrailResults['endorsement']['drive_view_url'];
                        $endorsementDownloadUrl = $paperTrailResults['endorsement']['drive_download_url'];
                    }
                    
                    $firstResult = !empty($paperTrailResults['research']) ? $paperTrailResults['research'] : $paperTrailResults['endorsement'];
                    
                    $submissionFolderId = $firstResult['sub_type_folder_id'] ?? null;
                    $yearFolderId = $firstResult['year_folder_id'] ?? null;
                    $researchFolderId = $firstResult['research_folder_id'] ?? null;
                    
                    $paperTrailStmt->bind_param(
                        'isssssssss',
                        $researchId,
                        $submissionType,
                        $currentYear,
                        $submissionFolderId,
                        $yearFolderId,
                        $researchFolderId,
                        $researchViewUrl,
                        $researchDownloadUrl,
                        $endorsementViewUrl,
                        $endorsementDownloadUrl
                    );
                    
                    $paperTrailStmt->execute();
                    $paperTrailStmt->close();
                }
            }
            // ========== END PAPER TRAIL INTEGRATION ==========
            
            $response->message = "Graduate research paper submitted successfully!";
            $response->research_id = $researchId;
            $response->status = true;
            
        } else {
            throw new Exception("Database connection failed");
        }
    } catch (Exception $e) {
        error_log("Exception in uploadGraduateSymposium: " . $e->getMessage());
        $response->message = $e->getMessage();
        $response->status = false;
    }
    
    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

// ==================== FETCH STUDENT RESEARCH PAPERS (with paper_type filter) ====================
if (isset($_POST['getStudentResearchPapers'])) {
    $response = new stdClass();
    $response->list = [];
    $response->status = true;
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $userId = $_SESSION['userId'] ?? 0;
        $paperType = $_POST['paper_type'] ?? 'undergraduate';
        
        $query = "SELECT 
                    srp.id,
                    srp.author,
                    srp.coauthor,
                    srp.presenter,
                    srp.title,
                    srp.event,
                    srp.event_id,
                    srp.status,
                    srp.paper_type,
                    srp.category,
                    srp.campus,
                    srp.research_file_view_url,
                    srp.research_file_download_url,
                    srp.endorsement_file_view_url,
                    srp.endorsement_download_url,
                    srp.drive_entry_folder_id,
                    srp.created_at,
                    srp.updated_at,
                    el.name as event_name,
                    el.date as event_date,
                    el.dead_line as event_deadline
                FROM student_research_papers srp
                LEFT JOIN event_list el ON srp.event_id = el.id
                WHERE srp.senderid = ? AND srp.paper_type = ?
                ORDER BY srp.created_at DESC";
        
        $stmt = $con->prepare($query);
        $stmt->bind_param("is", $userId, $paperType);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $coAuthors = [];
            if (!empty($row['coauthor'])) {
                try {
                    $coAuthors = json_decode($row['coauthor'], true);
                    if (!is_array($coAuthors)) {
                        $coAuthors = [];
                    }
                } catch (Exception $e) {
                    $coAuthors = [];
                }
            }
            
            $researchObj = new stdClass();
            $researchObj->id = $row['id'];
            $researchObj->author = $row['author'];
            $researchObj->coAuthors = $coAuthors;
            $researchObj->presenter = $row['presenter'];
            $researchObj->title = $row['title'];
            $researchObj->eventName = $row['event'] ?? $row['event_name'];
            $researchObj->event_id = $row['event_id'];
            $researchObj->status = $row['status'];
            $researchObj->paper_type = $row['paper_type'];
            $researchObj->category = $row['category'];
            $researchObj->campus = $row['campus'];
            $researchObj->researchFile = $row['research_file_view_url'];
            $researchObj->researchDownloadUrl = $row['research_file_download_url'];
            $researchObj->endorsementFile = $row['endorsement_file_view_url'];
            $researchObj->endorsementDownloadUrl = $row['endorsement_download_url'];
            $researchObj->drive_entry_folder_id = $row['drive_entry_folder_id'];
            $researchObj->created_at = $row['created_at'];
            $researchObj->updated_at = $row['updated_at'];
            $researchObj->event_date = $row['event_date'];
            $researchObj->event_deadline = $row['event_deadline'];
            
            $response->list[] = $researchObj;
        }
        
        $stmt->close();
        $con->close();
    }
    
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

// ==================== FETCH EVENT LIST (with paper_type filter) ====================
if (isset($_POST['getEventList'])) {
    $response = new stdClass();
    $response->events = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $paperType = $_POST['paper_type'] ?? 'undergraduate';
        
        if ($paperType === 'graduate') {
            $query = "SELECT id, name, date, dead_line FROM event_list 
                      WHERE LOWER(name) LIKE '%graduate%' 
                      AND LOWER(name) LIKE '%symposium%'
                      ORDER BY date DESC";
        } else {
            $query = "SELECT id, name, date, dead_line FROM event_list 
                      WHERE LOWER(name) LIKE '%student%' 
                      AND LOWER(name) LIKE '%symposium%'
                      AND LOWER(name) NOT LIKE '%graduate%'
                      ORDER BY date DESC";
        }
        
        $result = $con->query($query);
        
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $response->events[] = $row;
            }
        }
        
        $con->close();
    }
    
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

// ==================== FETCH EVENTS FOR DROPDOWN ====================
if (isset($_POST['getEvent'])) {
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $paperType = $_POST['paper_type'] ?? 'undergraduate';
        
        if ($paperType === 'graduate') {
            $query = "SELECT id, name FROM event_list 
                      WHERE LOWER(name) LIKE '%graduate%' 
                      AND LOWER(name) LIKE '%symposium%'
                      ORDER BY date DESC";
        } else {
            $query = "SELECT id, name FROM event_list 
                      WHERE LOWER(name) LIKE '%student%' 
                      AND LOWER(name) LIKE '%symposium%'
                      AND LOWER(name) NOT LIKE '%graduate%'
                      ORDER BY date DESC";
        }
        
        $result = $con->query($query);
        
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $response[] = $row;
            }
        }
        
        $con->close();
    }
    
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

// ==================== FETCH STUDENT RESEARCH PAPERS BY EVENT ====================
if (isset($_POST['getStudentResearchPapersByEvent'])) {
    $response = new stdClass();
    $response->list = [];
    $response->status = true;
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventId = $_POST['eventId'] ?? 0;
        $paperType = $_POST['paper_type'] ?? 'undergraduate';
        $searchTerm = isset($_POST['search']) ? trim($_POST['search']) : '';
        
        $query = "SELECT 
                    srp.id,
                    srp.author,
                    srp.coauthor,
                    srp.presenter,
                    srp.title,
                    srp.event,
                    srp.event_id,
                    srp.status,
                    srp.paper_type,
                    srp.category,
                    srp.campus,
                    srp.research_file_view_url,
                    srp.research_file_download_url,
                    srp.endorsement_file_view_url,
                    srp.endorsement_download_url,
                    el.name as event_name
                FROM student_research_papers srp
                LEFT JOIN event_list el ON srp.event_id = el.id
                WHERE srp.event_id = ? AND srp.paper_type = ?";
        
        $params = [$eventId, $paperType];
        $types = "is";
        
        if (!empty($searchTerm)) {
            $searchPattern = "%{$searchTerm}%";
            $query .= " AND (srp.title LIKE ? OR srp.author LIKE ? OR srp.presenter LIKE ? OR srp.coauthor LIKE ? OR srp.campus LIKE ? OR el.name LIKE ?)";
            $params[] = $searchPattern;
            $params[] = $searchPattern;
            $params[] = $searchPattern;
            $params[] = $searchPattern;
            $params[] = $searchPattern;
            $params[] = $searchPattern;
            $types .= "ssssss";
        }
        
        $query .= " ORDER BY srp.created_at DESC";
        
        $stmt = $con->prepare($query);
        if (!$stmt) {
            $response->status = false;
            $response->message = "Prepare failed: " . $con->error;
        } else {
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
            
            while ($row = $result->fetch_assoc()) {
                $researchObj = new stdClass();
                $researchObj->id = $row['id'];
                $researchObj->author = $row['author'];
                $researchObj->presenter = $row['presenter'];
                $researchObj->title = $row['title'];
                $researchObj->eventName = $row['event'] ?? $row['event_name'];
                $researchObj->paper_type = $row['paper_type'];
                $researchObj->category = $row['category'];
                $researchObj->campus = $row['campus'];
                $researchObj->researchFile = $row['research_file_view_url'];
                $researchObj->researchDownloadUrl = $row['research_file_download_url'];
                $researchObj->endorsementFile = $row['endorsement_file_view_url'];
                $researchObj->endorsementDownloadUrl = $row['endorsement_download_url'];
                
                $response->list[] = $researchObj;
            }
            
            $stmt->close();
        }
        
        $con->close();
    }
    
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

// ==================== DELETE STUDENT RESEARCH PAPER ====================
if (isset($_POST['deleteStudentResearch'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    $researchId = $_POST['research_id'] ?? 0;
    $userId = $_SESSION['userId'] ?? 0;
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $getResearchQuery = "SELECT 
                                srp.status, 
                                srp.drive_entry_folder_id,
                                srp.author,
                                srp.title,
                                pts.research_folder_id as paper_trail_folder_id
                            FROM student_research_papers srp
                            LEFT JOIN paper_trail_student pts ON srp.id = pts.student_researchid
                            WHERE srp.id = ? AND srp.senderid = ?";
        
        $getStmt = $con->prepare($getResearchQuery);
        $getStmt->bind_param("ii", $researchId, $userId);
        $getStmt->execute();
        $researchResult = $getStmt->get_result();
        $research = $researchResult->fetch_assoc();
        
        if (!$research) {
            $response->message = "Research paper not found or you don't have permission to delete it.";
        } elseif ($research['status'] !== 'pending') {
            $response->message = "Cannot delete research paper that has already been " . $research['status'] . ".";
        } else {
            $driveMessages = [];
            
            if (class_exists('GoogleDriveService')) {
                try {
                    $drive = new GoogleDriveService();
                    
                    if (!empty($research['drive_entry_folder_id'])) {
                        try {
                            $drive->trashFile($research['drive_entry_folder_id']);
                            $driveMessages[] = "Main research folder moved to trash";
                        } catch (Exception $e) {
                            $driveMessages[] = "Failed to move main folder to trash: " . $e->getMessage();
                        }
                    }
                    
                    if (!empty($research['paper_trail_folder_id'])) {
                        try {
                            $drive->trashFile($research['paper_trail_folder_id']);
                            $driveMessages[] = "Paper Trail folder moved to trash";
                        } catch (Exception $e) {
                            $driveMessages[] = "Failed to move Paper Trail folder to trash: " . $e->getMessage();
                        }
                    }
                    
                } catch (Exception $e) {
                    $driveMessages[] = "Drive service error: " . $e->getMessage();
                }
            } else {
                $driveMessages[] = "Google Drive service not available";
            }
            
            $deleteQuery = "DELETE FROM student_research_papers WHERE id = ? AND senderid = ?";
            $deleteStmt = $con->prepare($deleteQuery);
            $deleteStmt->bind_param("ii", $researchId, $userId);
            
            if ($deleteStmt->execute()) {
                $deletePaperTrailQuery = "DELETE FROM paper_trail_student WHERE student_researchid = ?";
                $deletePtStmt = $con->prepare($deletePaperTrailQuery);
                $deletePtStmt->bind_param("i", $researchId);
                $deletePtStmt->execute();
                $deletePtStmt->close();
                
                $response->status = true;
                $response->message = "Research paper deleted successfully.";
                
                if (!empty($driveMessages)) {
                    $response->message .= " " . implode("; ", $driveMessages);
                }
            } else {
                $response->message = "Failed to delete research paper from database.";
            }
            $deleteStmt->close();
        }
        
        $getStmt->close();
        $con->close();
    } else {
        $response->message = "Database connection failed.";
    }
    
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}