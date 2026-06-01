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
        
        // Create folder structure: Event Name -> Campus -> Category
        // No more "Student Symposium" parent folder
        $eventNameFolderId = $drive->findOrCreateFolder($cleanEventName, null);
        if (!$eventNameFolderId)
            throw new Exception("Failed to create event folder: $cleanEventName");
        
        $campusFolderId = $drive->findOrCreateFolder($cleanCampusName, $eventNameFolderId);
        if (!$campusFolderId)
            throw new Exception("Failed to create campus folder");
        
        $categoryFolderId = $drive->findOrCreateFolder($cleanCategoryName, $campusFolderId);
        if (!$categoryFolderId)
            throw new Exception("Failed to create category folder");
        
        // Create per-research folder inside Category
        $titleWords = explode(' ', trim($title));
        $titleKeywords = implode('_', array_slice($titleWords, 0, 3));
        $titleKeywords = cleanFolderNameForDrive($titleKeywords);
        
        $entryFolderName = $authorLastName . ' - ' . $titleKeywords;
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

// Generate a hash for file content to detect identical files
function generateFileHash($filePath)
{
    if (!file_exists($filePath)) {
        return false;
    }
    
    // Use SHA256 for better collision resistance
    $handle = fopen($filePath, 'rb');
    if (!$handle) {
        return false;
    }
    
    $hashContext = hash_init('sha256');
    $fileSize = filesize($filePath);
    
    if ($fileSize > 2 * 1024 * 1024) { // If file > 2MB
        // Hash first 1MB
        $firstChunk = fread($handle, 1024 * 1024);
        hash_update($hashContext, $firstChunk);
        
        // Seek to last 1MB
        fseek($handle, -1024 * 1024, SEEK_END);
        $lastChunk = fread($handle, 1024 * 1024);
        hash_update($hashContext, $lastChunk);
    } else {
        // Hash entire file
        while (!feof($handle)) {
            $chunk = fread($handle, 8192);
            hash_update($hashContext, $chunk);
        }
    }
    
    fclose($handle);
    return hash_final($hashContext);
}

function checkDuplicateStudentResearch($con, $title, $author, $eventId, $eventName)
{
    $query = "SELECT id, title, author, event, event_id, status 
              FROM student_research_papers 
              WHERE TRIM(LOWER(title)) = TRIM(LOWER(?)) 
              AND TRIM(LOWER(author)) = TRIM(LOWER(?))
              AND (event_id = ? OR event = ?)
              LIMIT 1";
    
    $stmt = $con->prepare($query);
    if (!$stmt) {
        return ['isDuplicate' => false, 'message' => ''];
    }
    
    $stmt->bind_param("ssis", $title, $author, $eventId, $eventName);
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
            'message' => "A research paper with the title '{$existing['title']}' and author '{$existing['author']}' already exists for this event." . $statusMsg,
            'existingRecord' => $existing
        ];
    }
    
    return ['isDuplicate' => false, 'message' => ''];
}
function uploadStudentToPaperTrail($tempFilePath, $fileName, $eventName, $author, $title, $type, $isEndorsement, $paperTrailNo = null)
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

        // Student Paper Trail structure: Paper Trail -> Undergrad -> Year -> {paper_trail_no} - {Title}
        $paperTrailRootId = $drive->findOrCreateFolder('Paper Trail', null);
        if (!$paperTrailRootId) {
            return ['success' => false, 'error' => "Failed to create Paper Trail root folder"];
        }

        $undergradFolderId = $drive->findOrCreateFolder('Undergraduate Symposium', $paperTrailRootId);
        if (!$undergradFolderId) {
            return ['success' => false, 'error' => "Failed to create Undergrad folder"];
        }

        $yearFolderId = $drive->findOrCreateFolder($year, $undergradFolderId);
        if (!$yearFolderId) {
            return ['success' => false, 'error' => "Failed to create Year folder: $year"];
        }

        // Create research folder: {paper_trail_no} - {title}
        $researchFolderName = '';
        if (!empty($paperTrailNo)) {
            $researchFolderName = $paperTrailNo . ' - ' . $cleanTitle;
        } else {
            $researchFolderName = $authorLastName . '_' . preg_replace('/[^a-zA-Z0-9]/', '_', substr($cleanTitle, 0, 30));
        }
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
            'sub_type_folder_id' => $undergradFolderId,
            'year_folder_id' => $yearFolderId,
            'research_folder_id' => $researchFolderId,
            'research_folder_name' => $researchFolderName,
            'year' => $year,
            'submission_type' => 'Undergrad',
            'file_name' => $paperTrailFileName,
            'paper_trail_no' => $paperTrailNo,
            'author_last_name' => $authorLastName,
            'file_type' => $type
        ];

    } catch (Exception $e) {
        error_log("Student Paper Trail upload failed: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Upload Student Symposium (Main endpoint for students)
if (isset($_POST['uploadStudentSymposium'])) {
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
            $paperType = $_POST['paper_type'] ?? 'undergraduate';
            
            // Get event_id from event_list
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
            
            // Check for duplicate submission
            $duplicateCheck = checkDuplicateStudentResearch($con, $title, $author, $eventId, $eventName);
            if ($duplicateCheck['isDuplicate']) {
                $response->message = $duplicateCheck['message'];
                $response->status = false;
                
                ob_clean();
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode($response);
                exit();
            }
            
            // Check if event deadline hasn't passed
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
            
            // Validate required files
            if (!isset($_FILES['researchDoc']) || $_FILES['researchDoc']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception("Research paper is required");
            }
            
            if (!isset($_FILES['endorsementDoc']) || $_FILES['endorsementDoc']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception("Endorsement letter is required");
            }
            
            // 1. Upload Research File to Google Drive
            $tempResearchPath = $_FILES['researchDoc']['tmp_name'];
            $researchFileName = $_FILES['researchDoc']['name'];
            
            error_log("Uploading student research: $researchFileName");
            
            $researchDriveResult = uploadStudentResearchToDrive(
                $tempResearchPath,
                $researchFileName,
                $eventName,
                $campus,
                $category,
                $author,
                $title,
                'research',
                false
            );
            
            if (!$researchDriveResult['success']) {
                throw new Exception("Research upload failed: " . ($researchDriveResult['error'] ?? 'Unknown error'));
            }
            
            error_log("Research uploaded successfully: " . $researchDriveResult['drive_file_id']);
            
            // 2. Upload Endorsement File to Google Drive
            $tempEndorsementPath = $_FILES['endorsementDoc']['tmp_name'];
            $endorsementFileName = $_FILES['endorsementDoc']['name'];
            
            error_log("Uploading student endorsement: $endorsementFileName");
            
            $endorsementDriveResult = uploadStudentResearchToDrive(
                $tempEndorsementPath,
                $endorsementFileName,
                $eventName,
                $campus,
                $category,
                $author,
                $title,
                'endorsement',
                true
            );
            
            if (!$endorsementDriveResult['success']) {
                throw new Exception("Endorsement upload failed: " . ($endorsementDriveResult['error'] ?? 'Unknown error'));
            }
            
            error_log("Endorsement uploaded successfully: " . $endorsementDriveResult['drive_file_id']);
            
            // Generate paper trail number
            $paperTrailNo = generateStudentPaperTrailNumber($con, $eventId, $campus, $title, $author);
            
            // Insert into student_research_papers table
            $insertQuery = "INSERT INTO student_research_papers (
                paper_trail_no,
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            
            $stmt = $con->prepare($insertQuery);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $con->error);
            }
            
            $status = 'pending';
            
            $stmt->bind_param(
                'siisssssssssssssssss',
                $paperTrailNo,
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
            
            // ========== PAPER TRAIL INTEGRATION ==========
            $paperTrailResults = [];
            
            // Upload Research File to Paper Trail
            if (isset($_FILES['researchDoc']) && $_FILES['researchDoc']['error'] === UPLOAD_ERR_OK && $researchId) {
                $tempResearchPath = $_FILES['researchDoc']['tmp_name'];
                $researchFileName = $_FILES['researchDoc']['name'];
                
                $paperTrailResearchResult = uploadStudentToPaperTrail(
                    $tempResearchPath,
                    $researchFileName,
                    $eventName,
                    $author,
                    $title,
                    'research',
                    false,
                    $paperTrailNo
                );
                
                if ($paperTrailResearchResult && $paperTrailResearchResult['success']) {
                    $paperTrailResults['research'] = $paperTrailResearchResult;
                    $response->message .= "\nResearch paper saved to Paper Trail.";
                } else {
                    error_log("Paper Trail copy failed for research file: " . ($paperTrailResearchResult['error'] ?? 'Unknown error'));
                }
            }
            
            // Upload Endorsement File to Paper Trail
            if (isset($_FILES['endorsementDoc']) && $_FILES['endorsementDoc']['error'] === UPLOAD_ERR_OK && $researchId) {
                $tempEndorsementPath = $_FILES['endorsementDoc']['tmp_name'];
                $endorsementFileName = $_FILES['endorsementDoc']['name'];
                
                $paperTrailEndorsementResult = uploadStudentToPaperTrail(
                    $tempEndorsementPath,
                    $endorsementFileName,
                    $eventName,
                    $author,
                    $title,
                    'endorsement',
                    true,
                    $paperTrailNo
                );
                
                if ($paperTrailEndorsementResult && $paperTrailEndorsementResult['success']) {
                    $paperTrailResults['endorsement'] = $paperTrailEndorsementResult;
                    $response->message .= "\nEndorsement letter saved to Paper Trail.";
                } else {
                    error_log("Paper Trail copy failed for endorsement file: " . ($paperTrailEndorsementResult['error'] ?? 'Unknown error'));
                }
            }
            
            // Save Paper Trail records to paper_trail_student table
            if ($researchId && !empty($paperTrailResults)) {
                $paperTrailQuery = "INSERT INTO paper_trail_student (
                    student_researchid, 
                    paper_trail_no, 
                    submission_type, 
                    year,
                    paper_trail_root_id, 
                    submission_folder_id, 
                    year_folder_id,
                    research_folder_id,
                    research_file_view_url,
                    research_file_download_url,
                    endorsement_file_view_url,
                    endorsement_file_download_url,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
                
                $paperTrailStmt = $con->prepare($paperTrailQuery);
                if (!$paperTrailStmt) {
                    error_log("Failed to prepare paper trail insert: " . $con->error);
                } else {
                    $currentYear = date('Y');
                    $submissionType = 'Undergrad';
                    
                    // Initialize URLs
                    $researchViewUrl = null;
                    $researchDownloadUrl = null;
                    $endorsementViewUrl = null;
                    $endorsementDownloadUrl = null;
                    
                    // Set URLs based on what was uploaded
                    if (isset($paperTrailResults['research'])) {
                        $researchViewUrl = $paperTrailResults['research']['drive_view_url'];
                        $researchDownloadUrl = $paperTrailResults['research']['drive_download_url'];
                    }
                    
                    if (isset($paperTrailResults['endorsement'])) {
                        $endorsementViewUrl = $paperTrailResults['endorsement']['drive_view_url'];
                        $endorsementDownloadUrl = $paperTrailResults['endorsement']['drive_download_url'];
                    }
                    
                    // Get folder IDs from either research or endorsement result (they should be the same folder)
                    $firstResult = !empty($paperTrailResults['research']) ? $paperTrailResults['research'] : $paperTrailResults['endorsement'];
                    
                    $paperTrailRootId = $firstResult['paper_trail_root_id'] ?? null;
                    $submissionFolderId = $firstResult['sub_type_folder_id'] ?? null;
                    $yearFolderId = $firstResult['year_folder_id'] ?? null;
                    $researchFolderId = $firstResult['research_folder_id'] ?? null;
                    
                    $paperTrailStmt->bind_param(
                        'isssssssssss',
                        $researchId,
                        $paperTrailNo,
                        $submissionType,
                        $currentYear,
                        $paperTrailRootId,
                        $submissionFolderId,
                        $yearFolderId,
                        $researchFolderId,
                        $researchViewUrl,
                        $researchDownloadUrl,
                        $endorsementViewUrl,
                        $endorsementDownloadUrl
                    );
                    
                    if ($paperTrailStmt->execute()) {
                        $response->message .= "\nFiles saved to Paper Trail archive.";
                    } else {
                        error_log("Failed to save Paper Trail record: " . $paperTrailStmt->error);
                    }
                    $paperTrailStmt->close();
                }
            }
            // ========== END PAPER TRAIL INTEGRATION ==========
            
            $response->message = "Student research paper submitted successfully! Paper Trail Number: " . $paperTrailNo . $response->message;
            $response->paper_trail_no = $paperTrailNo;
            $response->research_id = $researchId;
            $response->status = true;
            
        } else {
            throw new Exception("Database connection failed");
        }
    } catch (Exception $e) {
        error_log("Exception in uploadStudentSymposium: " . $e->getMessage());
        $response->message = $e->getMessage();
        $response->status = false;
    }
    
    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

function generateStudentPaperTrailNumber($con, $eventId, $campus, $title, $author)
{
    // Campus to code mapping - using full campus names
    $campusCodes = [
        'Roxas City Main' => 'Roxas City Main',
        'Sigma' => 'Sigma',
        'Dayao' => 'Dayao',
        'Dumarao' => 'Dumarao',
        'Burias' => 'Burias',
        'Mambusao' => 'Mambusao',
        'Pontevedra' => 'Pontevedra',
        'Pilar' => 'Pilar',
        'Tapaz' => 'Tapaz'
    ];
    
    // Use the full campus name as the code
    $campusCode = $campusCodes[$campus] ?? str_replace(' ', '_', $campus);
    
    // Check if this research already has a paper trail number
    $checkQuery = "SELECT paper_trail_no FROM student_research_papers 
                   WHERE TRIM(LOWER(title)) = TRIM(LOWER(?)) 
                   AND TRIM(LOWER(author)) = TRIM(LOWER(?))
                   AND paper_trail_no IS NOT NULL 
                   LIMIT 1";
    
    $checkStmt = $con->prepare($checkQuery);
    if ($checkStmt) {
        $checkStmt->bind_param("ss", $title, $author);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        $existing = $checkResult->fetch_assoc();
        if ($existing && !empty($existing['paper_trail_no'])) {
            $checkStmt->close();
            return $existing['paper_trail_no'];
        }
        $checkStmt->close();
    }
    
    // Get event year
    $yearQuery = "SELECT YEAR(date) as year FROM event_list WHERE id = ? LIMIT 1";
    $yearStmt = $con->prepare($yearQuery);
    if (!$yearStmt) {
        $eventYear = date('Y');
    } else {
        $yearStmt->bind_param("i", $eventId);
        $yearStmt->execute();
        $yearResult = $yearStmt->get_result();
        $yearRow = $yearResult->fetch_assoc();
        $eventYear = $yearRow['year'] ?? date('Y');
        $yearStmt->close();
    }
    
    // Get next sequence number for this year and campus
    // Need to escape the campus name properly for LIKE pattern
    $escapedCampus = addcslashes($campusCode, '%_');
    $pattern = $eventYear . '-' . $escapedCampus . '-%';
    
    $seqQuery = "SELECT MAX(CAST(SUBSTRING_INDEX(paper_trail_no, '-', -1) AS UNSIGNED)) as max_seq 
                 FROM student_research_papers 
                 WHERE paper_trail_no LIKE ?";
    
    $seqStmt = $con->prepare($seqQuery);
    if (!$seqStmt) {
        $nextSeq = 1;
    } else {
        $seqStmt->bind_param("s", $pattern);
        $seqStmt->execute();
        $seqResult = $seqStmt->get_result();
        $seqRow = $seqResult->fetch_assoc();
        $nextSeq = ($seqRow['max_seq'] ?? 0) + 1;
        $seqStmt->close();
    }
    
    $formattedSeq = str_pad($nextSeq, 3, '0', STR_PAD_LEFT);
    $paperTrailNo = $eventYear . '-' . $campusCode . '-' . $formattedSeq;
    
    return $paperTrailNo;
}

// Fetch student research papers for the logged-in user
if (isset($_POST['getStudentResearchPapers'])) {
    $response = new stdClass();
    $response->list = [];
    $response->status = true;
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $userId = $_SESSION['userId'] ?? 0;
        
        $query = "SELECT 
                    srp.id,
                    srp.paper_trail_no,
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
                WHERE srp.senderid = ?
                ORDER BY srp.created_at DESC";
        
        $stmt = $con->prepare($query);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            // Parse coauthors if present
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
            $researchObj->paper_trail_no = $row['paper_trail_no'];
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

// Delete student research paper
if (isset($_POST['deleteStudentResearch'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    $researchId = $_POST['research_id'] ?? 0;
    $userId = $_SESSION['userId'] ?? 0;
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Get research paper details including folder IDs
        $getResearchQuery = "SELECT 
                                srp.status, 
                                srp.drive_entry_folder_id,
                                srp.paper_trail_no,
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
            // Initialize Google Drive service
            $driveSuccess = true;
            $driveMessages = [];
            
            if (class_exists('GoogleDriveService')) {
                try {
                    $drive = new GoogleDriveService();
                    
                    // 1. Move main research folder to trash (drive_entry_folder_id)
                    if (!empty($research['drive_entry_folder_id'])) {
                        error_log("Moving main research folder to trash: " . $research['drive_entry_folder_id']);
                        try {
                            $drive->trashFile($research['drive_entry_folder_id']);
                            $driveMessages[] = "Main research folder moved to trash";
                            error_log("Main research folder moved to trash successfully");
                        } catch (Exception $e) {
                            $driveSuccess = false;
                            $driveMessages[] = "Failed to move main folder to trash: " . $e->getMessage();
                            error_log("Failed to move main folder to trash: " . $e->getMessage());
                        }
                    }
                    
                    // 2. Move Paper Trail folder to trash (research_folder_id)
                    if (!empty($research['paper_trail_folder_id'])) {
                        error_log("Moving Paper Trail folder to trash: " . $research['paper_trail_folder_id']);
                        try {
                            $drive->trashFile($research['paper_trail_folder_id']);
                            $driveMessages[] = "Paper Trail folder moved to trash";
                            error_log("Paper Trail folder moved to trash successfully");
                        } catch (Exception $e) {
                            $driveSuccess = false;
                            $driveMessages[] = "Failed to move Paper Trail folder to trash: " . $e->getMessage();
                            error_log("Failed to move Paper Trail folder to trash: " . $e->getMessage());
                        }
                    }
                    
                } catch (Exception $e) {
                    error_log("Google Drive service error: " . $e->getMessage());
                    $driveMessages[] = "Drive service error: " . $e->getMessage();
                }
            } else {
                error_log("GoogleDriveService class not found");
                $driveMessages[] = "Google Drive service not available";
            }
            
            // Delete from database
            $deleteQuery = "DELETE FROM student_research_papers WHERE id = ? AND senderid = ?";
            $deleteStmt = $con->prepare($deleteQuery);
            $deleteStmt->bind_param("ii", $researchId, $userId);
            
            if ($deleteStmt->execute()) {
                // Also delete related paper_trail_student records
                $deletePaperTrailQuery = "DELETE FROM paper_trail_student WHERE student_researchid = ?";
                $deletePtStmt = $con->prepare($deletePaperTrailQuery);
                $deletePtStmt->bind_param("i", $researchId);
                $deletePtStmt->execute();
                $deletePtStmt->close();
                
                $response->status = true;
                $response->message = "Research paper deleted successfully.";
                
                // Add info about Drive trash
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