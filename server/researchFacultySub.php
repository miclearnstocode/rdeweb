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

function getCenterCode($centerName)
{

    $centerMapping = [
        'Crop Science Research & Developement Center' => 'CSRDC',
        'Crop Science Research & Development Center' => 'CSRDC',
        'Livestock Research & Development Center' => 'LRDC',
        'Fisheries Research & Development Center' => 'FRDC',
        'Food and Industrial Technology Research & Development Center' => 'FIRDC',
        'Food and Industrial Technology Research & Developm...' => 'FITRDC',
        'Social Science Research & Development Center' => 'SSRDC',
        'Machinery and Agricultural Technology Engineering Center' => 'MATEC',
        'Coconut Research and Development Center' => 'CocoRDC',
        'Coconut Research and Development Center (Coco RDC)' => 'CocoRDC',
        'Extension' => 'Extension'
    ];

    if (isset($centerMapping[$centerName])) {
        return $centerMapping[$centerName];
    }

    foreach ($centerMapping as $key => $code) {
        if (strpos($centerName, substr($key, 0, 20)) !== false) {
            return $code;
        }
    }

    if (preg_match('/\(([^)]+)\)/', $centerName, $matches)) {
        $code = preg_replace('/[^a-zA-Z]/', '', $matches[1]);
        if (!empty($code)) {
            return $code;
        }
    }

    $words = explode(' ', $centerName);
    $code = '';
    foreach ($words as $word) {
        if (ctype_upper(substr($word, 0, 1))) {
            $code .= substr($word, 0, 1);
        }
    }

    return !empty($code) ? $code : 'END';
}
//for symposium
function uploadResearchToDrive($tempFilePath, $fileName, $eventName, $centerName, $category, $author, $title, $type = 'research', $isProgram = false, $isEndorsement = false, $isCertificate = false, $isLocalInHouse = false, $paperTrailNo = null, $createPerResearchFolder = false)
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
        $cleanCenterName = cleanFolderNameForDrive($centerName);
        $cleanCategoryName = cleanFolderNameForDrive($category);

        $authorParts = explode(' ', trim($author));
        $authorLastName = end($authorParts);
        $authorLastName = cleanFolderNameForDrive($authorLastName);

        // Create base folder structure: Event -> Center -> Category
        $eventFolderId = $drive->findOrCreateFolder($cleanEventName, null);
        if (!$eventFolderId)
            throw new Exception("Failed to create event folder");

        $centerFolderId = $drive->findOrCreateFolder($cleanCenterName, $eventFolderId);
        if (!$centerFolderId)
            throw new Exception("Failed to create center folder");

        $categoryFolderId = $drive->findOrCreateFolder($cleanCategoryName, $centerFolderId);
        if (!$categoryFolderId)
            throw new Exception("Failed to create category folder");

        $targetFolderId = null;
        $prefixedFileName = '';
        $entryFolderId = null;
        $entryFolderName = null;

        if ($isLocalInHouse) {
            // ===== LOCAL IN-HOUSE: Files go directly inside Category folder =====
            $targetFolderId = $categoryFolderId;

            $fileTypeSuffix = '';
            if ($isProgram) {
                $fileTypeSuffix = 'program_file';
            } elseif ($isCertificate) {
                $fileTypeSuffix = 'certificate_file';
            } elseif ($type === 'research') {
                $fileTypeSuffix = 'research_file';
            } elseif ($isEndorsement) {
                $fileTypeSuffix = 'endorsement_file';
            }

            $prefixedFileName = 'Local In House - ' . $authorLastName . ' ' . $fileTypeSuffix . '.pdf';

        } else {
            // ===== SYMPOSIUM/UNIVERSITY: Create per-research folder inside Category =====
            if ($createPerResearchFolder) {
                // Get keywords from title for folder name (first 3 words)
                $titleWords = explode(' ', trim($title));
                $titleKeywords = implode('_', array_slice($titleWords, 0, 3));
                $titleKeywords = cleanFolderNameForDrive($titleKeywords);

                // Create entry folder name: {author last name} - {title keywords}
                $entryFolderName = $authorLastName . ' - ' . $titleKeywords;
                $entryFolderName = cleanFolderNameForDrive($entryFolderName);

                // Create entry folder inside Category
                $entryFolderId = $drive->findOrCreateFolder($entryFolderName, $categoryFolderId);
                if (!$entryFolderId)
                    throw new Exception("Failed to create entry folder: $entryFolderName");

                $targetFolderId = $entryFolderId;
            } else {
                $targetFolderId = $categoryFolderId;
            }

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
                $prefixedFileName = $cleanTitle . ' - completed research.pdf';
            } elseif ($isEndorsement) {
                $prefixedFileName = $cleanTitle . ' - endorsement letter.pdf';
            } else {
                $prefixedFileName = $fileName;
            }
        }

        if (empty($targetFolderId)) {
            throw new Exception("Failed to determine target folder");
        }

        error_log("Uploading $type file: $prefixedFileName to folder: $targetFolderId");
        $uploadResult = $drive->uploadFile($tempFilePath, $prefixedFileName, $targetFolderId);

        if (!$uploadResult['success'] || empty($uploadResult['id'])) {
            $errorMsg = $uploadResult['error'] ?? "Upload failed: No file ID returned";
            throw new Exception($errorMsg);
        }

        $drive->makeFilePublic($uploadResult['id']);

        $fileId = $uploadResult['id'];
        $embedUrl = "https://drive.google.com/file/d/{$fileId}/preview";
        $downloadUrl = "https://drive.google.com/uc?id={$fileId}&export=download";

        // Paper Trail copy for Symposium files only
        $paperTrailCopy = null;
        if (!empty($paperTrailNo) && !$isLocalInHouse) {
            $paperTrailCopy = uploadToPaperTrail(
                $tempFilePath,
                $fileName,
                $eventName,
                $author,
                $title,
                $type,
                $isProgram,
                $isEndorsement,
                $isCertificate,
                $isLocalInHouse,
                $paperTrailNo
            );

            if ($paperTrailCopy && isset($paperTrailCopy['success']) && $paperTrailCopy['success']) {
                error_log("Paper Trail copy successful for $fileName");
            } else {
                error_log("Paper Trail copy failed for $fileName: " . ($paperTrailCopy['error'] ?? 'Unknown error'));
            }
        }

        return [
            'success' => true,
            'drive_file_id' => $uploadResult['id'],
            'drive_view_url' => $embedUrl,
            'drive_download_url' => $downloadUrl,
            'drive_folder_id' => $targetFolderId,
            'drive_event_folder_id' => $eventFolderId,
            'drive_center_folder_id' => $centerFolderId,
            'drive_category_folder_id' => $categoryFolderId,
            'drive_entry_folder_id' => $entryFolderId,
            'entry_folder_name' => $entryFolderName,
            'file_size' => $uploadResult['size'] ?? 0,
            'file_name' => $prefixedFileName,
            'author_last_name' => $authorLastName,
            'paper_trail_copy' => $paperTrailCopy
        ];

    } catch (Exception $e) {
        error_log("Google Drive upload failed for $fileName: " . $e->getMessage());
        throw new Exception("Failed to upload $fileName to Google Drive: " . $e->getMessage());
    }
}
//in house
function uploadInHouseToDrive($tempFilePath, $fileName, $eventName, $centerName, $category, $author, $title, $type = 'research', $isProgram = false, $isEndorsement = false, $isCertificate = false)
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
        $cleanCenterName = cleanFolderNameForDrive($centerName);
        $cleanCategoryName = cleanFolderNameForDrive($category);

        $authorParts = explode(' ', trim($author));
        $authorLastName = end($authorParts);
        $authorLastName = cleanFolderNameForDrive($authorLastName);

        // Create base folder structure: Event -> Center -> Category
        $eventFolderId = $drive->findOrCreateFolder($cleanEventName, null);
        if (!$eventFolderId)
            throw new Exception("Failed to create event folder");

        $centerFolderId = $drive->findOrCreateFolder($cleanCenterName, $eventFolderId);
        if (!$centerFolderId)
            throw new Exception("Failed to create center folder");

        $categoryFolderId = $drive->findOrCreateFolder($cleanCategoryName, $centerFolderId);
        if (!$categoryFolderId)
            throw new Exception("Failed to create category folder");

        // Get keywords from title for folder name (first 4 words)
        $titleWords = explode(' ', trim($title));
        $titleKeywords = implode('_', array_slice($titleWords, 0, 4));
        $titleKeywords = cleanFolderNameForDrive($titleKeywords);
        if (strlen($titleKeywords) > 100) {
            $titleKeywords = substr($titleKeywords, 0, 97) . '...';
        }

        // Create entry folder name: {Author Last Name} - {Title Keywords}
        $entryFolderName = $authorLastName . ' - ' . $titleKeywords;
        $entryFolderName = cleanFolderNameForDrive($entryFolderName);

        // Create entry folder inside Category
        $entryFolderId = $drive->findOrCreateFolder($entryFolderName, $categoryFolderId);
        if (!$entryFolderId)
            throw new Exception("Failed to create entry folder: $entryFolderName");

        $targetFolderId = $entryFolderId;

        // Clean event name for filename (remove special characters)
        $cleanEventForFilename = preg_replace('/[^\w\s\-]/', '', $eventName);
        $cleanEventForFilename = preg_replace('/\s+/', '_', $cleanEventForFilename);
        $cleanEventForFilename = cleanFolderNameForDrive($cleanEventForFilename);
        
        // Clean title for filename
        $cleanTitle = preg_replace('/[^\w\s\-]/', '', $title);
        $cleanTitle = preg_replace('/\s+/', '_', $cleanTitle);
        $cleanTitle = cleanFolderNameForDrive($cleanTitle);
        if (strlen($cleanTitle) > 80) {
            $cleanTitle = substr($cleanTitle, 0, 77) . '...';
        }

        // Determine file name format: {Event Name} - {File type}.pdf
        $prefixedFileName = '';
        if ($isProgram) {
            $prefixedFileName = $cleanEventForFilename . ' - Program File.pdf';
        } elseif ($isCertificate) {
            $prefixedFileName = $cleanEventForFilename . ' - Certificate.pdf';
        } elseif ($type === 'research') {
            $prefixedFileName = $cleanEventForFilename . ' - ' . $cleanTitle . '.pdf';
        } elseif ($isEndorsement) {
            $prefixedFileName = $cleanEventForFilename . ' - Endorsement Letter.pdf';
        } else {
            $prefixedFileName = $cleanEventForFilename . ' - Document.pdf';
        }

        error_log("Uploading In-House $type file: $prefixedFileName to folder: $targetFolderId");
        $uploadResult = $drive->uploadFile($tempFilePath, $prefixedFileName, $targetFolderId);

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
            'drive_folder_id' => $targetFolderId,
            'drive_event_folder_id' => $eventFolderId,
            'drive_center_folder_id' => $centerFolderId,
            'drive_category_folder_id' => $categoryFolderId,
            'drive_entry_folder_id' => $entryFolderId,
            'entry_folder_name' => $entryFolderName,
            'file_size' => $uploadResult['size'] ?? 0,
            'file_name' => $prefixedFileName,
            'author_last_name' => $authorLastName
        ];

    } catch (Exception $e) {
        error_log("In-House Google Drive upload failed for $fileName: " . $e->getMessage());
        throw new Exception("Failed to upload $fileName to Google Drive: " . $e->getMessage());
    }
}

function cleanFolderNameForDrive($name)
{
    if (empty($name)) {
        return 'Untitled_' . time();
    }

    $clean = preg_replace('/[^\w\s\-_.,()&]/', '', $name);

    $clean = preg_replace('/\s+/', ' ', $clean);
    $clean = trim($clean);

    $clean = rtrim($clean, '.,');

    if (strlen($clean) > 200) {
        $clean = substr($clean, 0, 197) . '...';
    }

    return $clean;
}

function getResearchFileUrl($researchRecord)
{
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
function checkDuplicateResearch($con, $researchData, $fileData = [])
{
    $result = [
        'isDuplicate' => false,
        'message' => '',
        'existingRecord' => null,
        'duplicateReason' => ''
    ];

    try {
        // Build query to check for existing records with same identity fields
        $query = "SELECT 
                    rf.id,
                    rf.title,
                    rf.author,
                    rf.coauthor,
                    rf.presenter,
                    rf.event_id,
                    rf.category,
                    rf.center,
                    rf.campus,
                    rf.drive_file_id,
                    rf.program_drive_file_id,
                    rf.endorsementid,
                    e.drive_file_id as endorsement_drive_file_id,
                    el.name as event_name
                  FROM researchfile rf
                  LEFT JOIN endorsement e ON rf.endorsementid = e.id
                  LEFT JOIN event_list el ON rf.event_id = el.id
                  WHERE 1=1";

        $params = [];
        $types = "";

        // Check identity fields
        if (!empty($researchData['title'])) {
            $query .= " AND rf.title = ?";
            $params[] = $researchData['title'];
            $types .= "s";
        }

        if (!empty($researchData['author'])) {
            $query .= " AND rf.author = ?";
            $params[] = $researchData['author'];
            $types .= "s";
        }

        if (isset($researchData['coauthor'])) {
            // Normalize coauthor for comparison (sort to handle different orders)
            $coauthorInput = $researchData['coauthor'];
            if (is_string($coauthorInput)) {
                $coauthorArray = json_decode($coauthorInput, true);
                if (is_array($coauthorArray)) {
                    sort($coauthorArray);
                    $coauthorInput = json_encode($coauthorArray);
                }
            }

            $query .= " AND rf.coauthor = ?";
            $params[] = $coauthorInput;
            $types .= "s";
        }

        if (!empty($researchData['presenter'])) {
            $query .= " AND rf.presenter = ?";
            $params[] = $researchData['presenter'];
            $types .= "s";
        }

        if (!empty($researchData['event_id'])) {
            $query .= " AND rf.event_id = ?";
            $params[] = $researchData['event_id'];
            $types .= "s";
        }

        if (!empty($researchData['category'])) {
            $query .= " AND rf.category = ?";
            $params[] = $researchData['category'];
            $types .= "s";
        }

        if (!empty($researchData['center'])) {
            $query .= " AND rf.center = ?";
            $params[] = $researchData['center'];
            $types .= "s";
        }

        if (!empty($researchData['campus'])) {
            $query .= " AND rf.campus = ?";
            $params[] = $researchData['campus'];
            $types .= "s";
        }

        // If no identity fields provided, return early
        if (empty($params)) {
            $result['message'] = "No identity fields provided for duplicate check";
            return $result;
        }

        // Execute identity check
        $stmt = $con->prepare($query);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $con->error);
        }

        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $identityResult = $stmt->get_result();

        // Check for exact identity matches first
        if ($identityResult->num_rows > 0) {
            $existingRecord = $identityResult->fetch_assoc();
            $result['isDuplicate'] = true;
            $result['existingRecord'] = $existingRecord;
            $result['duplicateReason'] = "A research entry with the same title, author, and event already exists";
            $result['message'] = "Duplicate research entry detected. Please check existing submissions.";
            return $result;
        }

        // If no exact match, check for file-based duplicates (if file data provided)
        if (!empty($fileData)) {
            // Check for duplicate by file hashes
            if (!empty($fileData['proposal_hash']) || !empty($fileData['program_hash']) || !empty($fileData['endorsement_hash'])) {

                $fileQuery = "SELECT 
                                fh.research_id,
                                rf.id,
                                rf.title,
                                rf.author,
                                rf.drive_file_id,
                                rf.program_drive_file_id,
                                rf.endorsementid,
                                fh.file_type,
                                fh.file_hash
                              FROM file_hashes fh
                              JOIN researchfile rf ON fh.research_id = rf.id
                              WHERE 1=1";

                $fileParams = [];
                $fileTypes = "";
                $fileConditions = [];

                // Check for duplicate research/proposal file by hash
                if (!empty($fileData['proposal_hash'])) {
                    $fileConditions[] = "(fh.file_hash = ? AND fh.file_type = 'proposal')";
                    $fileParams[] = $fileData['proposal_hash'];
                    $fileTypes .= "s";
                }

                // Check for duplicate program file by hash
                if (!empty($fileData['program_hash'])) {
                    $fileConditions[] = "(fh.file_hash = ? AND fh.file_type = 'program')";
                    $fileParams[] = $fileData['program_hash'];
                    $fileTypes .= "s";
                }

                // Check for duplicate endorsement file by hash
                if (!empty($fileData['endorsement_hash'])) {
                    $fileConditions[] = "(fh.file_hash = ? AND fh.file_type = 'endorsement')";
                    $fileParams[] = $fileData['endorsement_hash'];
                    $fileTypes .= "s";
                }

                if (!empty($fileConditions)) {
                    $fileQuery .= " AND (" . implode(" OR ", $fileConditions) . ")";
                    $fileQuery .= " ORDER BY fh.created_at DESC LIMIT 1";

                    $fileStmt = $con->prepare($fileQuery);
                    if (!$fileStmt) {
                        throw new Exception("Prepare failed for file hash check: " . $con->error);
                    }

                    if (!empty($fileParams)) {
                        $fileStmt->bind_param($fileTypes, ...$fileParams);
                    }

                    $fileStmt->execute();
                    $fileResult = $fileStmt->get_result();

                    if ($fileResult->num_rows > 0) {
                        $existingFileRecord = $fileResult->fetch_assoc();
                        $result['isDuplicate'] = true;
                        $result['existingRecord'] = $existingFileRecord;

                        // Determine which file caused the duplicate
                        $fileTypeNames = [
                            'proposal' => 'research file',
                            'program' => 'program file',
                            'endorsement' => 'endorsement letter'
                        ];

                        $fileTypeName = $fileTypeNames[$existingFileRecord['file_type']] ?? 'file';
                        $status = $existingFileRecord['status'] ?? 'pending';

                        $statusMessage = '';
                        if ($status === 'pending') {
                            $statusMessage = " Your submission is still pending review.";
                        } elseif ($status === 'rejected') {
                            $statusMessage = " This entry was rejected. Please check your email for feedback before resubmitting.";
                        }

                        $result['duplicateReason'] = "Duplicate {$fileTypeName} detected for '{$existingFileRecord['title']}' by {$existingFileRecord['author']}." . $statusMessage . " Please use a different file or wait for your pending submission to be processed.";

                        $result['message'] = "Duplicate file detected. This file has been uploaded before.";
                        return $result;
                    }
                }
            }

            // Also check for endorsement ID duplicate (legacy check)
            if (!empty($fileData['endorsement_id'])) {
                $endorsementQuery = "SELECT 
                                        rf.id,
                                        rf.title,
                                        rf.author
                                     FROM researchfile rf
                                     WHERE rf.endorsementid = ?
                                     LIMIT 1";

                $endStmt = $con->prepare($endorsementQuery);
                if ($endStmt) {
                    $endStmt->bind_param("i", $fileData['endorsement_id']);
                    $endStmt->execute();
                    $endResult = $endStmt->get_result();

                    if ($endResult->num_rows > 0) {
                        $existingEndRecord = $endResult->fetch_assoc();
                        $result['isDuplicate'] = true;
                        $result['existingRecord'] = $existingEndRecord;
                        $result['duplicateReason'] = "This endorsement letter has already been used for research ID {$existingEndRecord['id']}: '{$existingEndRecord['title']}' by {$existingEndRecord['author']}";
                        $result['message'] = "Duplicate endorsement detected.";
                        return $result;
                    }
                }
            }
        }

        return $result;

    } catch (Exception $e) {
        error_log("Error in checkDuplicateResearch: " . $e->getMessage());
        $result['message'] = "Error checking for duplicates: " . $e->getMessage();
        return $result;
    }
}

function generateFileHash($filePath)
{
    if (!file_exists($filePath)) {
        return false;
    }

    // Use SHA256 for better collision resistance
    // Only hash first 1MB + last 1MB for performance with large files
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
function getEventScopedFileHash($fileHash, $eventId)
{
    if (empty($eventId) || empty($fileHash)) {
        return $fileHash;
    }

    return hash('sha256', $eventId . '::' . $fileHash);
}
function storeFileHash($con, $researchId, $fileType, $fileHash, $eventId = null)
{
    $scopedHash = getEventScopedFileHash($fileHash, $eventId);

    $query = "INSERT IGNORE INTO file_hashes (research_id, file_type, file_hash, created_at) 
              VALUES (?, ?, ?, NOW())";

    $stmt = $con->prepare($query);
    if ($stmt) {
        $stmt->bind_param("iss", $researchId, $fileType, $scopedHash);
        $stmt->execute();
        $stmt->close();
    }
}
function checkDuplicateByFileHashAndEvent($con, $fileHash, $fileType, $eventId = null, $eventType = null)
{
    if ($eventId !== null) {
        $scopedHash = getEventScopedFileHash($fileHash, $eventId);
        $query = "SELECT rf.id as research_id, rf.title, rf.author, rf.event_id, rf.event 
                  FROM file_hashes fh 
                  JOIN researchfile rf ON fh.research_id = rf.id 
                  WHERE fh.file_type = ?
                  AND rf.event_id = ?
                  AND (fh.file_hash = ? OR fh.file_hash = ?)
                  LIMIT 1";

        $stmt = $con->prepare($query);
        if (!$stmt) {
            return null;
        }

        $stmt->bind_param("siss", $fileType, $eventId, $scopedHash, $fileHash);
    } else {
        $query = "SELECT rf.id as research_id, rf.title, rf.author, rf.event 
                  FROM file_hashes fh 
                  JOIN researchfile rf ON fh.research_id = rf.id 
                  WHERE fh.file_hash = ? 
                  AND fh.file_type = ?
                  AND rf.event = ?
                  LIMIT 1";

        $stmt = $con->prepare($query);
        if (!$stmt) {
            return null;
        }

        $stmt->bind_param("sss", $fileHash, $fileType, $eventType);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $existing = $result->fetch_assoc();
    $stmt->close();

    return $existing;
}
function generatePaperTrailNumber($con, $eventId, $center, $title, $author)
{

    $centerCodes = [
        'Crop Science Research & Developement Center (CSRDC)' => 'A',
        'Livestock Research & Development Center (LRDC)' => 'B',
        'Fisheries Research & Development Center (FRDC)' => 'C',
        'Food and Industrial Technology Research & Development Center (FIRDC)' => 'D',
        'Social Science Research & Development Center (SSRDC)' => 'E',
        'Machinery and Agricultural Technology Engineering Center (MATEC)' => 'F',
        'Coconut Research and Development Center (Coco RDC)' => 'G',
        'Extension (Extension)' => 'H'
    ];

    // Get center code
    $centerCode = $centerCodes[$center] ?? 'X';

    // FIRST: Check if this research already has a paper trail number from a previous submission
    // Match by title and author (case-insensitive, trimmed)
    $checkExistingQuery = "SELECT paper_trail_no, center, event_id 
                          FROM researchfile 
                          WHERE TRIM(LOWER(title)) = TRIM(LOWER(?)) 
                          AND TRIM(LOWER(author)) = TRIM(LOWER(?))
                          AND paper_trail_no IS NOT NULL 
                          AND paper_trail_no != ''
                          LIMIT 1";

    $checkStmt = $con->prepare($checkExistingQuery);
    if (!$checkStmt) {
        throw new Exception("Failed to prepare existing check query: " . $con->error);
    }

    $checkStmt->bind_param("ss", $title, $author);
    $checkStmt->execute();
    $existingResult = $checkStmt->get_result();
    $existingPaper = $existingResult->fetch_assoc();

    // If existing paper trail number found, return it (maintain consistency)
    if ($existingPaper && !empty($existingPaper['paper_trail_no'])) {
        return $existingPaper['paper_trail_no'];
    }

    // SECOND: If no existing paper trail number, check for duplicate submissions
    // (same title and author but no paper trail number yet - should use same center logic)
    $checkDuplicateQuery = "SELECT id, center, event_id 
                           FROM researchfile 
                           WHERE TRIM(LOWER(title)) = TRIM(LOWER(?)) 
                           AND TRIM(LOWER(author)) = TRIM(LOWER(?))
                           LIMIT 1";

    $dupStmt = $con->prepare($checkDuplicateQuery);
    if (!$dupStmt) {
        throw new Exception("Failed to prepare duplicate check query: " . $con->error);
    }

    $dupStmt->bind_param("ss", $title, $author);
    $dupStmt->execute();
    $dupResult = $dupStmt->get_result();
    $duplicate = $dupResult->fetch_assoc();

    // If duplicate found but no paper trail number, we need to generate one
    // Use the original submission's center (not the current one) for consistency
    if ($duplicate) {
        // Use the center from the original submission
        $originalCenter = $duplicate['center'];
        $centerCode = $centerCodes[$originalCenter] ?? 'X';

        // Get the original submission's event year
        $originalEventId = $duplicate['event_id'];
        $yearQuery = "SELECT YEAR(date) as year FROM event_list WHERE id = ? LIMIT 1";
        $yearStmt = $con->prepare($yearQuery);
        if ($yearStmt) {
            $yearStmt->bind_param("i", $originalEventId);
            $yearStmt->execute();
            $yearResult = $yearStmt->get_result();
            $yearRow = $yearResult->fetch_assoc();
            $eventYear = $yearRow['year'] ?? date('Y');
            $yearStmt->close();
        } else {
            $eventYear = date('Y');
        }
    } else {
        // THIRD: No existing paper trail number and no duplicate - generate new one
        // Get event year from event_list for the current submission
        $yearQuery = "SELECT YEAR(date) as year FROM event_list WHERE id = ? LIMIT 1";
        $yearStmt = $con->prepare($yearQuery);
        if (!$yearStmt) {
            throw new Exception("Failed to prepare year query: " . $con->error);
        }

        $yearStmt->bind_param("i", $eventId);
        $yearStmt->execute();
        $yearResult = $yearStmt->get_result();
        $yearRow = $yearResult->fetch_assoc();

        if (!$yearRow || !$yearRow['year']) {
            throw new Exception("Could not determine event year for event ID: $eventId");
        }

        $eventYear = $yearRow['year'];
        $yearStmt->close();
    }

    // Get the next sequence number for this year and center
    $pattern = $eventYear . '-' . $centerCode . '-%';

    $seqQuery = "SELECT MAX(CAST(SUBSTRING_INDEX(paper_trail_no, '-', -1) AS UNSIGNED)) as max_seq 
                 FROM researchfile 
                 WHERE paper_trail_no LIKE ?";

    $seqStmt = $con->prepare($seqQuery);
    if (!$seqStmt) {
        throw new Exception("Failed to prepare sequence query: " . $con->error);
    }

    $seqStmt->bind_param("s", $pattern);
    $seqStmt->execute();
    $seqResult = $seqStmt->get_result();
    $seqRow = $seqResult->fetch_assoc();

    $nextSeq = ($seqRow['max_seq'] ?? 0) + 1;

    // Format with leading zeros (3 digits)
    $formattedSeq = str_pad($nextSeq, 3, '0', STR_PAD_LEFT);

    // Generate the paper trail number
    $paperTrailNo = $eventYear . '-' . $centerCode . '-' . $formattedSeq;

    // Clean up statements
    $checkStmt->close();
    if (isset($dupStmt))
        $dupStmt->close();
    if (isset($seqStmt))
        $seqStmt->close();

    return $paperTrailNo;
}
function getResearchFilesForRevision($con, $userId)
{
    $query = "SELECT 
        rf.id,
        rf.title as original_title,
        rf.event,
        rf.event_id,
        -- Revision information
        rf.revision_status,
        rf.revision_count,
        rf.last_revision_date,
        rf.revised_file_id,
        -- Revised file information (if exists)
        rf.revised_file_id as revised_drive_file_id,
        -- Get revised file URL if revision exists
        CASE 
            WHEN rf.revised_file_id IS NOT NULL 
            THEN CONCAT('https://drive.google.com/file/d/', rf.revised_file_id, '/preview')
            ELSE NULL
        END as revised_drive_view_url,
        -- Event information
        el.name as event_name,
        el.date_of_presentation,
        -- Get the acceptance status
        e.status as endorsement_status
    FROM researchfile rf
    LEFT JOIN event_list el ON rf.event_id = el.id
    LEFT JOIN endorsement e ON rf.endorsementid = e.id
    WHERE rf.senderid = ? 
    AND rf.revision_status IN ('revision_pending', 'revision_rejected')
    ORDER BY rf.last_revision_date DESC, rf.id DESC";

    $stmt = $con->prepare($query);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    // Process the result to include both original and revised files
    $processedResults = [];
    while ($row = $result->fetch_assoc()) {
        $row['revised_file'] = [
            'url' => $row['revised_drive_view_url'],
            'file_id' => $row['revised_drive_file_id'],
            'exists' => !empty($row['revised_drive_file_id'])
        ];

        $processedResults[] = $row;
    }

    return $processedResults;
}
//symposium
function uploadToPaperTrail($tempFilePath, $fileName, $eventName, $author, $title, $type, $isProgram, $isEndorsement, $isCertificate, $isLocalInHouse, $paperTrailNo = null, $existingResearchFolderId = null)
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

        // Determine Paper Trail root folder based on submission type
        $paperTrailRootName = $isLocalInHouse ? 'Local In-House Review' : 'Symposium';

        // Paper Trail -> {Symposium|Local In-House Review} -> Year -> {paper_trail_no} - {title}
        $paperTrailRootId = $drive->findOrCreateFolder('Paper Trail', null);
        if (!$paperTrailRootId) {
            return ['success' => false, 'error' => "Failed to create Paper Trail root folder"];
        }

        $subTypeFolderId = $drive->findOrCreateFolder($paperTrailRootName, $paperTrailRootId);
        if (!$subTypeFolderId) {
            return ['success' => false, 'error' => "Failed to create $paperTrailRootName folder"];
        }

        $yearFolderId = $drive->findOrCreateFolder($year, $subTypeFolderId);
        if (!$yearFolderId) {
            return ['success' => false, 'error' => "Failed to create Year folder: $year"];
        }

        // ===== USE EXISTING RESEARCH FOLDER IF PROVIDED =====
        $researchFolderId = null;
        $researchFolderName = '';

        if (!empty($existingResearchFolderId)) {
            // Use the existing research folder
            $researchFolderId = $existingResearchFolderId;
            $researchFolderName = 'Existing folder';
            error_log("Using existing research folder for title certificate: $researchFolderId");
        } else {
            // Create research folder only if not provided (for research and endorsement files)
            if (!empty($paperTrailNo)) {
                $researchFolderName = $paperTrailNo . ' - ' . $cleanTitle;
            } else {
                $researchFolderName = $authorLastName . '_' . preg_replace('/[^a-zA-Z0-9]/', '_', substr($cleanTitle, 0, 30));
            }
            $researchFolderName = cleanFolderNameForDrive($researchFolderName);

            $researchFolderId = $drive->findOrCreateFolder($researchFolderName, $yearFolderId);
            error_log("Created new research folder: $researchFolderName with ID: $researchFolderId");
        }

        if (!$researchFolderId) {
            return ['success' => false, 'error' => "Failed to get research folder"];
        }

        // ALL files go directly into the research folder (no subfolders)
        $targetFolderId = $researchFolderId;

        // Determine file name for Paper Trail
        $paperTrailFileName = '';

        if ($isLocalInHouse) {
            if ($isProgram) {
                $paperTrailFileName = 'program_file.pdf';
            } elseif ($isCertificate) {
                $paperTrailFileName = 'certificate_file.pdf';
            } elseif ($type === 'research') {
                $paperTrailFileName = 'research_file.pdf';
            } elseif ($isEndorsement) {
                $paperTrailFileName = 'endorsement_letter.pdf';
            } else {
                $paperTrailFileName = 'document.pdf';
            }
        } else {
            // Symposium files
            if ($type === 'research') {
                $paperTrailFileName = 'completed_research.pdf';
            } elseif ($isEndorsement) {
                $paperTrailFileName = 'endorsement_letter.pdf';
            } elseif ($type === 'title_certificate') {
                $paperTrailFileName = 'certificate_of_title_change.pdf';
            } elseif ($type === 'certificate') {
                $paperTrailFileName = 'certificate_file.pdf';
            } else {
                $paperTrailFileName = basename($fileName);
            }
        }

        $uploadResult = $drive->uploadFile($tempFilePath, $paperTrailFileName, $targetFolderId);

        if (!$uploadResult['success'] || empty($uploadResult['id'])) {
            $errorMsg = $uploadResult['error'] ?? 'Unknown error';
            return ['success' => false, 'error' => $errorMsg];
        }

        $drive->makeFilePublic($uploadResult['id']);

        $fileId = $uploadResult['id'];
        $embedUrl = "https://drive.google.com/file/d/{$fileId}/preview";
        $downloadUrl = "https://drive.google.com/uc?id={$fileId}&export=download";

        // ===== BUILD RESULT WITH ALL NECESSARY FIELDS =====
        $result = [
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
            'submission_type' => $paperTrailRootName,
            'file_name' => $paperTrailFileName,
            'paper_trail_no' => $paperTrailNo,
            'author_last_name' => $authorLastName,
            'file_type' => $type
        ];

        // ===== ADD TYPE-SPECIFIC FIELDS =====
        if ($type === 'research') {
            $result['researchfile_drive_view_url'] = $embedUrl;
            $result['researchfile_drive_download_url'] = $downloadUrl;
            $result['researchfile_drive_file_id'] = $fileId;
        } elseif ($isEndorsement) {
            $result['endorsement_drive_view_url'] = $embedUrl;
            $result['endorsement_drive_download_url'] = $downloadUrl;
            $result['endorsement_drive_file_id'] = $fileId;
        } elseif ($type === 'program') {
            $result['program_drive_view_url'] = $embedUrl;
            $result['program_drive_download_url'] = $downloadUrl;
            $result['program_drive_file_id'] = $fileId;
        } elseif ($type === 'certificate') {
            $result['certificate_drive_view_url'] = $embedUrl;
            $result['certificate_drive_download_url'] = $downloadUrl;
            $result['certificate_drive_file_id'] = $fileId;
        } elseif ($type === 'title_certificate') {
            $result['title_certificate_view_url'] = $embedUrl;
            $result['title_certificate_download_url'] = $downloadUrl;
            $result['title_certificate_file_id'] = $fileId;
        }

        return $result;

    } catch (Exception $e) {
        error_log("Paper Trail upload failed: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}
//in house
function uploadInHouseToPaperTrail($tempFilePath, $fileName, $eventName, $author, $title, $type, $isProgram, $isEndorsement, $isCertificate, $paperTrailNo = null)
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

        // In-House Paper Trail structure: Paper Trail -> In-House Review -> Year -> {paper_trail_no} - {Title}
        $paperTrailRootId = $drive->findOrCreateFolder('Paper Trail', null);
        if (!$paperTrailRootId) {
            return ['success' => false, 'error' => "Failed to create Paper Trail root folder"];
        }

        $inHouseFolderId = $drive->findOrCreateFolder('In-House Review', $paperTrailRootId);
        if (!$inHouseFolderId) {
            return ['success' => false, 'error' => "Failed to create In-House Review folder"];
        }

        $yearFolderId = $drive->findOrCreateFolder($year, $inHouseFolderId);
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

        // Determine file name for In-House Paper Trail
        $paperTrailFileName = '';
        if ($isProgram) {
            $paperTrailFileName = 'program_file.pdf';
        } elseif ($isCertificate) {
            $paperTrailFileName = 'certificate_file.pdf';
        } elseif ($type === 'research') {
            $paperTrailFileName = 'research_file.pdf';
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
            'sub_type_folder_id' => $inHouseFolderId,
            'year_folder_id' => $yearFolderId,
            'research_folder_id' => $researchFolderId,
            'research_folder_name' => $researchFolderName,
            'year' => $year,
            'submission_type' => 'In-House Review',
            'file_name' => $paperTrailFileName,
            'paper_trail_no' => $paperTrailNo,
            'author_last_name' => $authorLastName
        ];

    } catch (Exception $e) {
        error_log("In-House Paper Trail upload failed: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}
//in house
if (isset($_POST['uploadResearch'])) {
    ob_end_clean();
    ob_start();
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
    
    $center = $_POST['center'] ?? '';
    $senderId = $_SESSION['userId'];
    $response = new stdClass();
    $response->message = '';
    $response->serverMessage = "";
    $response->status = false;
    $response->debug = [];
    $response->duplicate_field = null;
    
    try {
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
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
                
                // Get research data from POST
                $title = $_POST['title'];
                $author = $_POST['author'];
                $category = $_POST['category'];
                $center = $_POST['center'];
                $campus = $_POST['campus'];
                $coAuthor = $_POST['coAuthor'] ?? '[]';
                $presenter = $_POST['presenter'];
                
                // Get event_id
                $eventId = null;
                $eventIdQuery = "SELECT id FROM event_list WHERE name = ? LIMIT 1";
                $eventStmt = $con->prepare($eventIdQuery);
                $eventStmt->bind_param("s", $eventType);
                $eventStmt->execute();
                $eventResult = $eventStmt->get_result();
                $eventRow = $eventResult->fetch_assoc();
                $eventId = $eventRow ? $eventRow['id'] : null;
                
                // ===== CHECK FOR TITLE/AUTHOR DUPLICATE FIRST =====
                $duplicateCheckQuery = "SELECT COUNT(*) as count, id, title, author, event_id, event 
                                       FROM researchfile 
                                       WHERE TRIM(LOWER(title)) = TRIM(LOWER(?)) 
                                       AND TRIM(LOWER(author)) = TRIM(LOWER(?))
                                       AND event_id = ?
                                       LIMIT 1";
                
                $dupStmt = $con->prepare($duplicateCheckQuery);
                if (!$dupStmt) {
                    throw new Exception("Prepare failed for duplicate check: " . $con->error);
                }
                
                $dupStmt->bind_param("ssi", $title, $author, $eventId);
                $dupStmt->execute();
                $dupResult = $dupStmt->get_result();
                $existingRecord = $dupResult->fetch_assoc();
                $dupStmt->close();
                
                if ($existingRecord && $existingRecord['count'] > 0) {
                    $response->message = "A research with the title '{$title}' and author '{$author}' already exists for this event.";
                    $response->status = false;
                    $response->duplicate_field = 'title_author';
                    
                    ob_clean();
                    header('Content-Type: application/json; charset=utf-8');
                    echo json_encode($response);
                    exit();
                }
                
                // CHECK REVISION STATUS BEFORE ALLOWING UPLOAD
                if (isset($_POST['is_revision']) && $_POST['is_revision'] === 'true') {
                    $originalResearchId = $_POST['original_research_id'] ?? 0;
                    
                    $checkRevisionQuery = "SELECT revision_status, revision_count FROM researchfile WHERE id = ? AND senderid = ?";
                    $checkStmt = $con->prepare($checkRevisionQuery);
                    $checkStmt->bind_param("ii", $originalResearchId, $senderId);
                    $checkStmt->execute();
                    $checkResult = $checkStmt->get_result();
                    $revisionData = $checkResult->fetch_assoc();
                    
                    if (!$revisionData || !in_array($revisionData['revision_status'], ['revision_pending', 'revision_rejected'])) {
                        throw new Exception("This document is not eligible for revision submission");
                    }
                }
                
                // ===== CHECK RESEARCH FILE DUPLICATE =====
                $researchFileHash = null;
                if (isset($_FILES['researchDoc']) && $_FILES['researchDoc']['error'] === UPLOAD_ERR_OK) {
                    $tempResearchPath = $_FILES['researchDoc']['tmp_name'];
                    $researchFileHash = generateFileHash($tempResearchPath);
                    
                    if ($researchFileHash) {
                        $existingResearch = checkDuplicateByFileHashAndEvent($con, $researchFileHash, 'proposal', $eventId, $eventType);
                        if ($existingResearch) {
                            $response->message = "RESEARCH FILE DUPLICATE: This file has already been used for '" . $existingResearch['title'] . "' by " . $existingResearch['author'];
                            $response->status = false;
                            $response->duplicate_field = 'researchFile';
                            
                            ob_clean();
                            header('Content-Type: application/json; charset=utf-8');
                            echo json_encode($response);
                            exit();
                        }
                    }
                }
                
                // ===== CHECK ENDORSEMENT FILE DUPLICATE =====
                $endorsementFileHash = null;
                if (isset($_FILES['uploadedFileEndorsement']) && $_FILES['uploadedFileEndorsement']['error'] === UPLOAD_ERR_OK) {
                    $tempEndorsementPath = $_FILES['uploadedFileEndorsement']['tmp_name'];
                    $endorsementFileHash = generateFileHash($tempEndorsementPath);
                    
                    if ($endorsementFileHash) {
                        $existingEndorsement = checkDuplicateByFileHashAndEvent($con, $endorsementFileHash, 'endorsement', $eventId, $eventType);
                        if ($existingEndorsement) {
                            $response->message = "ENDORSEMENT LETTER DUPLICATE: This file has already been used for '" . $existingEndorsement['title'] . "' by " . $existingEndorsement['author'];
                            $response->status = false;
                            $response->duplicate_field = 'endorsementFile';
                            
                            ob_clean();
                            header('Content-Type: application/json; charset=utf-8');
                            echo json_encode($response);
                            exit();
                        }
                    }
                }
                
                // ===== CHECK PROGRAM FILE DUPLICATE =====
                $programFileHash = null;
                if (isset($_FILES['programFile']) && $_FILES['programFile']['error'] === UPLOAD_ERR_OK) {
                    $tempProgramPath = $_FILES['programFile']['tmp_name'];
                    $programFileHash = generateFileHash($tempProgramPath);
                    
                    if ($programFileHash) {
                        $existingProgram = checkDuplicateByFileHashAndEvent($con, $programFileHash, 'program', $eventId, $eventType);
                        if ($existingProgram) {
                            $response->message = "PROGRAM FILE DUPLICATE: This file has already been used for '" . $existingProgram['title'] . "' by " . $existingProgram['author'];
                            $response->status = false;
                            $response->duplicate_field = 'programFile';
                            
                            ob_clean();
                            header('Content-Type: application/json; charset=utf-8');
                            echo json_encode($response);
                            exit();
                        }
                    }
                }
                
                $certificateFileHash = null;
                if (isset($_FILES['certificateFile']) && $_FILES['certificateFile']['error'] === UPLOAD_ERR_OK) {
                    $tempCertificatePath = $_FILES['certificateFile']['tmp_name'];
                    $certificateFileHash = generateFileHash($tempCertificatePath);
                    
                    if ($certificateFileHash) {
                        $existingCertificate = checkDuplicateByFileHashAndEvent($con, $certificateFileHash, 'certificate', $eventId, $eventType);
                        if ($existingCertificate) {
                            $response->message = "CERTIFICATE FILE DUPLICATE: This file has already been used for '" . $existingCertificate['title'] . "' by " . $existingCertificate['author'];
                            $response->status = false;
                            $response->duplicate_field = 'certificateFile';
                            
                            ob_clean();
                            header('Content-Type: application/json; charset=utf-8');
                            echo json_encode($response);
                            exit();
                        }
                    }
                }
                
                // ===== PROCEED WITH UPLOADS =====
                
                // 1. Upload Endorsement Letter to Google Drive
                if (!isset($_FILES['uploadedFileEndorsement']) || $_FILES['uploadedFileEndorsement']['error'] !== UPLOAD_ERR_OK) {
                    throw new Exception('Endorsement letter upload failed. Error code: ' . ($_FILES['uploadedFileEndorsement']['error'] ?? 'NO_FILE'));
                }
                
                $tempEndorsementPath = $_FILES['uploadedFileEndorsement']['tmp_name'];
                $endorsementFileName = $_FILES['uploadedFileEndorsement']['name'];
                
                $endorsementDriveResult = uploadInHouseToDrive(
                    $tempEndorsementPath,
                    $endorsementFileName,
                    $eventType,
                    $center,
                    $category,
                    $author,
                    $title,
                    'endorsement',
                    false,
                    true,
                    false
                );
                
                if (!$endorsementDriveResult['success']) {
                    throw new Exception("Endorsement upload failed: " . ($endorsementDriveResult['error'] ?? 'Unknown error'));
                }
                
                error_log("Endorsement uploaded successfully: " . $endorsementDriveResult['drive_file_id']);
                
                $defaultTime = date('Y-m-d H:i:s');
                
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
                    endorsement.date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";

                $stateM = $con->prepare($query2);
                if (!$stateM) {
                    throw new Exception("Prepare failed for endorsement: " . $con->error);
                }
                
                $sta = NULL;
                $endorsementFileJson = json_encode($endorsementDriveResult);
                
                $drive_event_folder_id = $endorsementDriveResult['drive_event_folder_id'] ?? null;
                $drive_center_folder_id = $endorsementDriveResult['drive_center_folder_id'] ?? null;
                $drive_category_folder_id = $endorsementDriveResult['drive_category_folder_id'] ?? null;
                $drive_entry_folder_id = $endorsementDriveResult['drive_entry_folder_id'] ?? null;
                
                $stateM->bind_param(
                    'sssssssssssss',
                    $senderId, 
                    $center,
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
                    $defaultTime);
                
                $st = $stateM->execute();
                
                if (!$st) {
                    throw new Exception("Failed to execute endorsement insert: " . $stateM->error);
                }
                
                $endorsementId = $con->insert_id;
                error_log("Endorsement saved to DB with ID: $endorsementId");
                
                // 2. Upload Research File
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
                
                if (!file_exists($tempResearchPath)) {
                    throw new Exception("Research file not found on server. Temp path: $tempResearchPath");
                }
                
                $researchDriveResult = uploadInHouseToDrive(
                    $tempResearchPath,
                    $researchFileName,
                    $eventType,
                    $center,
                    $category,
                    $author,
                    $title,
                    'research',
                    false,
                    false,
                    false
                );
                
                if (!$researchDriveResult['success']) {
                    throw new Exception("Research upload failed: " . ($researchDriveResult['error'] ?? 'Unknown error'));
                }
                
                error_log("Research uploaded successfully: " . $researchDriveResult['drive_file_id']);
                
                // 3. Upload Program File (Required for In-House)
                $programDriveResult = null;
                $programFile = null;
                $programDriveFileId = null;
                $programDriveViewUrl = null;
                
                if (!isset($_FILES['programFile']) || $_FILES['programFile']['error'] !== UPLOAD_ERR_OK) {
                    throw new Exception("Program file is required for In-House Review events");
                }
                
                $tempProgramPath = $_FILES['programFile']['tmp_name'];
                $programFileName = $_FILES['programFile']['name'];
                
                error_log("Uploading program file for In-House: $programFileName");
                
                if (file_exists($tempProgramPath)) {
                    $programDriveResult = uploadInHouseToDrive(
                        $tempProgramPath,
                        $programFileName,
                        $eventType,
                        $center,
                        $category,
                        $author,
                        $title,
                        'program',
                        true,
                        false,
                        false
                    );
                    
                    if ($programDriveResult && $programDriveResult['success']) {
                        $programFile = json_encode($programDriveResult);
                        $programDriveFileId = $programDriveResult['drive_file_id'] ?? null;
                        $programDriveViewUrl = $programDriveResult['drive_view_url'] ?? null;
                        error_log("Program uploaded successfully: " . $programDriveFileId);
                    } else {
                        throw new Exception("Program file upload failed: " . ($programDriveResult['error'] ?? 'Unknown error'));
                    }
                }
                
                // 4. Upload Certificate File (Optional for In-House)
                $certificateDriveResult = null;
                $certificateDriveFileId = null;
                $certificateDriveViewUrl = null;
                
                if (isset($_FILES['certificateFile']) && $_FILES['certificateFile']['error'] === UPLOAD_ERR_OK) {
                    $tempCertificatePath = $_FILES['certificateFile']['tmp_name'];
                    $certificateFileName = $_FILES['certificateFile']['name'];
                    
                    error_log("Uploading certificate for In-House: $certificateFileName");
                    
                    if (file_exists($tempCertificatePath)) {
                        $certificateDriveResult = uploadInHouseToDrive(
                            $tempCertificatePath,
                            $certificateFileName,
                            $eventType,
                            $center,
                            $category,
                            $author,
                            $title,
                            'certificate',
                            false,
                            false,
                            true
                        );
                        
                        if ($certificateDriveResult && $certificateDriveResult['success']) {
                            $certificateDriveFileId = $certificateDriveResult['drive_file_id'] ?? null;
                            $certificateDriveViewUrl = $certificateDriveResult['drive_view_url'] ?? null;
                            error_log("Certificate uploaded successfully: " . $certificateDriveFileId);
                        }
                    }
                }
                
                // Generate Paper Trail Number
                $paperTrailNo = generatePaperTrailNumber($con, $eventId, $center, $title, $author);
                
                // Insert into researchfile table
                $querV2 = "INSERT INTO researchfile(
                    researchfile.paper_trail_no,
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
                    researchfile.certificate_drive_file_id,
                    researchfile.certificate_drive_view_url,
                    researchfile.event,
                    researchfile.event_id,
                    researchfile.campus,
                    researchfile.coauthor,
                    researchfile.presenter,
                    researchfile.status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                $rev = 'pending';
                
                $stementResNew = $con->prepare($querV2);
                if (!$stementResNew) {
                    throw new Exception("Prepare failed for researchfile: " . $con->error);
                }
                
                $drive_folder_id = $researchDriveResult['drive_folder_id'] ?? null;
                $drive_event_folder_id = $researchDriveResult['drive_event_folder_id'] ?? null;
                $drive_center_folder_id = $researchDriveResult['drive_center_folder_id'] ?? null;
                $drive_category_folder_id = $researchDriveResult['drive_category_folder_id'] ?? null;
                $drive_entry_folder_id = $researchDriveResult['drive_entry_folder_id'] ?? null;
                
                $bound = $stementResNew->bind_param(
                    'ssssssssssssssssssssssssss',
                    $paperTrailNo, $senderId, $endorsementId,
                    $author, $title, $center, $category,
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
                    $certificateDriveFileId,     
                    $certificateDriveViewUrl,      
                    $eventType, $eventId, $campus,
                    $coAuthor, $presenter, $rev);
                    
                if (!$bound) {
                    throw new Exception("Bind failed for researchfile: " . $stementResNew->error);
                }
                
                $state = $stementResNew->execute();
                
                if (!$state) {
                    throw new Exception("Database error for $researchFileName: " . $stementResNew->error);
                }
                
                $researchFileId = $con->insert_id;
                $response->paper_trail_no = $paperTrailNo;
                
                // Store File Hashes for Future Duplicate Detection
                if ($researchFileId) {
                    if (isset($researchFileHash) && $researchFileHash) {
                        storeFileHash($con, $researchFileId, 'proposal', $researchFileHash, $eventId);
                    }
                    
                    if (isset($programFileHash) && $programFileHash) {
                        storeFileHash($con, $researchFileId, 'program', $programFileHash, $eventId);
                    }
                    
                    if (isset($endorsementFileHash) && $endorsementFileHash) {
                        storeFileHash($con, $researchFileId, 'endorsement', $endorsementFileHash, $eventId);
                    }
                    
                    if (isset($certificateFileHash) && $certificateFileHash) {
                        storeFileHash($con, $researchFileId, 'certificate', $certificateFileHash, $eventId);
                    }
                }
                
                $paperTrailResults = [];
                
                // Upload Research File to Paper Trail
                if (isset($_FILES['researchDoc']) && $_FILES['researchDoc']['error'] === UPLOAD_ERR_OK && $researchFileId) {
                    $tempResearchPath = $_FILES['researchDoc']['tmp_name'];
                    $researchFileName = $_FILES['researchDoc']['name'];
                    
                    $paperTrailResearchResult = uploadInHouseToPaperTrail(
                        $tempResearchPath,
                        $researchFileName,
                        $eventType,
                        $author,
                        $title,
                        'research',
                        false,
                        false,
                        false,
                        $paperTrailNo
                    );
                    
                    if ($paperTrailResearchResult && $paperTrailResearchResult['success']) {
                        $paperTrailResults['research'] = $paperTrailResearchResult;
                        $response->message .= "\nResearch file saved to Paper Trail.";
                    } else {
                        error_log("Paper Trail copy failed for research file: " . ($paperTrailResearchResult['error'] ?? 'Unknown error'));
                    }
                }
                
                // Upload Program File to Paper Trail
                if (isset($_FILES['programFile']) && $_FILES['programFile']['error'] === UPLOAD_ERR_OK && $researchFileId) {
                    $tempProgramPath = $_FILES['programFile']['tmp_name'];
                    $programFileName = $_FILES['programFile']['name'];
                    
                    $paperTrailProgramResult = uploadInHouseToPaperTrail(
                        $tempProgramPath,
                        $programFileName,
                        $eventType,
                        $author,
                        $title,
                        'program',
                        true,
                        false,
                        false,
                        $paperTrailNo
                    );
                    
                    if ($paperTrailProgramResult && $paperTrailProgramResult['success']) {
                        $paperTrailResults['program'] = $paperTrailProgramResult;
                        $response->message .= "\nProgram file saved to Paper Trail.";
                    } else {
                        error_log("Paper Trail copy failed for program file: " . ($paperTrailProgramResult['error'] ?? 'Unknown error'));
                    }
                }
                
                // Upload Certificate File to Paper Trail (if provided)
                if (isset($_FILES['certificateFile']) && $_FILES['certificateFile']['error'] === UPLOAD_ERR_OK && $researchFileId) {
                    $tempCertificatePath = $_FILES['certificateFile']['tmp_name'];
                    $certificateFileName = $_FILES['certificateFile']['name'];
                    
                    $paperTrailCertificateResult = uploadInHouseToPaperTrail(
                        $tempCertificatePath,
                        $certificateFileName,
                        $eventType,
                        $author,
                        $title,
                        'certificate',
                        false,
                        false,
                        true,
                        $paperTrailNo
                    );
                    
                    if ($paperTrailCertificateResult && $paperTrailCertificateResult['success']) {
                        $paperTrailResults['certificate'] = $paperTrailCertificateResult;
                        $response->message .= "\nCertificate file saved to Paper Trail.";
                    } else {
                        error_log("Paper Trail copy failed for certificate file: " . ($paperTrailCertificateResult['error'] ?? 'Unknown error'));
                    }
                }
                
                // Upload Endorsement File to Paper Trail
                if (isset($_FILES['uploadedFileEndorsement']) && $_FILES['uploadedFileEndorsement']['error'] === UPLOAD_ERR_OK && $researchFileId) {
                    $tempEndorsementPath = $_FILES['uploadedFileEndorsement']['tmp_name'];
                    $endorsementFileName = $_FILES['uploadedFileEndorsement']['name'];
                    
                    $paperTrailEndorsementResult = uploadInHouseToPaperTrail(
                        $tempEndorsementPath,
                        $endorsementFileName,
                        $eventType,
                        $author,
                        $title,
                        'endorsement',
                        false,
                        true,
                        false,
                        $paperTrailNo
                    );
                    
                    if ($paperTrailEndorsementResult && $paperTrailEndorsementResult['success']) {
                        $paperTrailResults['endorsement'] = $paperTrailEndorsementResult;
                        $response->message .= "\nEndorsement file saved to Paper Trail.";
                    } else {
                        error_log("Paper Trail copy failed for endorsement file: " . ($paperTrailEndorsementResult['error'] ?? 'Unknown error'));
                    }
                }
                
                // Save Paper Trail records to database
                if ($researchFileId && !empty($paperTrailResults)) {
                    $paperTrailQuery = "INSERT INTO paper_trail_files (
                        research_id, paper_trail_no, submission_type, year,
                        paper_trail_root_id, submission_folder_id, year_folder_id,
                        research_folder_id, research_folder_name,
                        drive_file_id, drive_view_url, drive_download_url,
                        created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
                    
                    $paperTrailStmt = $con->prepare($paperTrailQuery);
                    $currentYear = date('Y');
                    $inHouseReviewType = 'In-House Review';
                    foreach ($paperTrailResults as $fileType => $result) {
                        
                        $paperTrailStmt->bind_param(
                            'isssssssssss',
                            $researchFileId,
                            $paperTrailNo,
                            $inHouseReviewType,
                            $currentYear,
                            $result['paper_trail_root_id'],
                            $result['sub_type_folder_id'],
                            $result['year_folder_id'],
                            $result['research_folder_id'],
                            $result['research_folder_name'],
                            $result['drive_file_id'],
                            $result['drive_view_url'],
                            $result['drive_download_url']
                        );
                        $paperTrailStmt->execute();
                    }
                    $paperTrailStmt->close();
                    
                    $response->message .= "\nAll files saved to Paper Trail archive.";
                }
                
                $response->message = "$researchFileName uploaded to Google Drive successfully.\n";
                if ($programDriveResult && $programDriveResult['success']) {
                    $response->message .= "Program attachment uploaded successfully.\n";
                }
                if ($certificateDriveResult && $certificateDriveResult['success']) {
                    $response->message .= "Certificate attachment uploaded successfully.\n";
                }
                $response->status = true;
                
            } else {
                $response->message = "Sorry..., The event has closed.";
            }
        } else {
            throw new Exception("Database connection failed: " . $con->error);
        }
    } catch (Exception $e) {
        error_log("Exception in uploadResearch: " . $e->getMessage());
        $response->message = $e->getMessage();
        $response->status = false;
    }
    
    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}
// symposium
if (isset($_POST['saveLocalInhouse'])) {
    $response = new stdClass();
    $response->status = false;
    $response->success = false;
    $response->message = '';
    $response->saved_id = null;
    $response->paper_trail_no = null;
    $response->research_id = null;

    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        if ($con->connect_error) {
            throw new Exception("Database connection failed: " . $con->connect_error);
        }

        $senderId = isset($_SESSION['userId']) ? $_SESSION['userId'] : 0;
        $eventId = isset($_POST['eventId']) ? (int) $_POST['eventId'] : 0;
        $eventName = isset($_POST['eventName']) ? trim($_POST['eventName']) : '';

        // Get form data
        $documentTitle = trim($_POST['document_title'] ?? '');
        $campus = trim($_POST['campus'] ?? '');
        $category = trim($_POST['category'] ?? '');
        $center = trim($_POST['center'] ?? '');
        $mainAuthor = trim($_POST['main_author'] ?? '');
        $presenter = trim($_POST['presenter'] ?? '');
        $coAuthors = $_POST['co_authors'] ?? '[]';
        
        // ===== FIX: Initialize these variables =====
        $date_started = isset($_POST['date_started']) && !empty($_POST['date_started']) ? $_POST['date_started'] : null;
        $date_completed = isset($_POST['date_completed']) && !empty($_POST['date_completed']) ? $_POST['date_completed'] : null;
        $final_symposium_title = isset($_POST['final_symposium_title']) && !empty($_POST['final_symposium_title']) ? $_POST['final_symposium_title'] : null;
        $title_changed = isset($_POST['title_changed']) ? (int) $_POST['title_changed'] : 0;

        // Validate required fields
        if (empty($documentTitle) || empty($mainAuthor) || empty($category) || empty($center) || empty($campus)) {
            throw new Exception("Missing required fields for Local In-House Review");
        }

        // Generate paper trail number for Local In-House
        $paperTrailNo = generatePaperTrailNumber($con, $eventId, $center, $documentTitle, $mainAuthor);

        $drive = new GoogleDriveService();

        $cleanTitle = cleanFolderNameForDrive($documentTitle);
        $year = date('Y');

        // Get author last name for folder naming
        $authorParts = explode(' ', trim($mainAuthor));
        $authorLastName = end($authorParts);
        $authorLastName = cleanFolderNameForDrive($authorLastName);

        // ===== LOCATION 1: Event -> Center -> Category (for event storage) =====
        $cleanEventName = cleanFolderNameForDrive($eventName);
        $cleanCenterName = cleanFolderNameForDrive($center);
        $cleanCategoryName = cleanFolderNameForDrive($category);

        $eventFolderId = $drive->findOrCreateFolder($cleanEventName, null);
        if (!$eventFolderId)
            throw new Exception("Failed to create event folder");

        $centerFolderId = $drive->findOrCreateFolder($cleanCenterName, $eventFolderId);
        if (!$centerFolderId)
            throw new Exception("Failed to create center folder");

        $categoryFolderId = $drive->findOrCreateFolder($cleanCategoryName, $centerFolderId);
        if (!$categoryFolderId)
            throw new Exception("Failed to create category folder");

        // For Local In-House, files go directly in Category folder (NO per-research folder)
        $eventStorageFolderId = $categoryFolderId;

        // ===== LOCATION 2: Paper Trail -> Local In-House Review -> Year -> {Paper_Trail_No} - {Title} =====
        $paperTrailRootId = $drive->findOrCreateFolder('Paper Trail', null);
        $localInHouseFolderId = $drive->findOrCreateFolder('Local In-House Review', $paperTrailRootId);
        $yearFolderId = $drive->findOrCreateFolder($year, $localInHouseFolderId);
        $researchFolderName = $paperTrailNo . ' - ' . $cleanTitle;
        $paperTrailFolderId = $drive->findOrCreateFolder($researchFolderName, $yearFolderId);

        // Upload Program File to BOTH locations
        $programDriveFileId = null;
        $programDriveViewUrl = null;
        $programDriveDownloadUrl = null;
        $programEventFileId = null;
        $programEventViewUrl = null;

        if (isset($_FILES['programFile']) && $_FILES['programFile']['error'] === UPLOAD_ERR_OK) {
            $tempProgramPath = $_FILES['programFile']['tmp_name'];
            $programFileName = 'program_file.pdf';
            $programEventFileName = 'Local In House - ' . $authorLastName . ' program_file.pdf';

            // Upload to Paper Trail
            $programPaperTrailResult = $drive->uploadFile($tempProgramPath, $programFileName, $paperTrailFolderId);
            if ($programPaperTrailResult['success']) {
                $drive->makeFilePublic($programPaperTrailResult['id']);
                $programDriveFileId = $programPaperTrailResult['id'];
                $programDriveViewUrl = "https://drive.google.com/file/d/{$programDriveFileId}/preview";
                $programDriveDownloadUrl = "https://drive.google.com/uc?id={$programDriveFileId}&export=download";
                error_log("Program file uploaded to Paper Trail: ID = $programDriveFileId");
            } else {
                throw new Exception("Program file upload to Paper Trail failed: " . ($programPaperTrailResult['error'] ?? 'Unknown error'));
            }

            // Upload to Event folder
            $programEventResult = $drive->uploadFile($tempProgramPath, $programEventFileName, $eventStorageFolderId);
            if ($programEventResult['success']) {
                $drive->makeFilePublic($programEventResult['id']);
                $programEventFileId = $programEventResult['id'];
                $programEventViewUrl = "https://drive.google.com/file/d/{$programEventFileId}/preview";
                error_log("Program file uploaded to Event folder: ID = $programEventFileId");
            } else {
                error_log("Program file upload to Event folder failed: " . ($programEventResult['error'] ?? 'Unknown error'));
                // Don't throw, continue with Paper Trail copy at least
            }
        }

        // Upload Certificate File to BOTH locations
        $certificateDriveFileId = null;
        $certificateDriveViewUrl = null;
        $certificateDriveDownloadUrl = null;
        $certificateEventFileId = null;
        $certificateEventViewUrl = null;

        if (isset($_FILES['certificateFile']) && $_FILES['certificateFile']['error'] === UPLOAD_ERR_OK) {
            $tempCertificatePath = $_FILES['certificateFile']['tmp_name'];
            $certificateFileName = 'certificate_file.pdf';
            $certificateEventFileName = 'Local In House - ' . $authorLastName . ' certificate_file.pdf';

            // Upload to Paper Trail
            $certificatePaperTrailResult = $drive->uploadFile($tempCertificatePath, $certificateFileName, $paperTrailFolderId);
            if ($certificatePaperTrailResult['success']) {
                $drive->makeFilePublic($certificatePaperTrailResult['id']);
                $certificateDriveFileId = $certificatePaperTrailResult['id'];
                $certificateDriveViewUrl = "https://drive.google.com/file/d/{$certificateDriveFileId}/preview";
                $certificateDriveDownloadUrl = "https://drive.google.com/uc?id={$certificateDriveFileId}&export=download";
                error_log("Certificate file uploaded to Paper Trail: ID = $certificateDriveFileId");
            } else {
                throw new Exception("Certificate file upload to Paper Trail failed: " . ($certificatePaperTrailResult['error'] ?? 'Unknown error'));
            }

            // Upload to Event folder
            $certificateEventResult = $drive->uploadFile($tempCertificatePath, $certificateEventFileName, $eventStorageFolderId);
            if ($certificateEventResult['success']) {
                $drive->makeFilePublic($certificateEventResult['id']);
                $certificateEventFileId = $certificateEventResult['id'];
                $certificateEventViewUrl = "https://drive.google.com/file/d/{$certificateEventFileId}/preview";
                error_log("Certificate file uploaded to Event folder: ID = $certificateEventFileId");
            } else {
                error_log("Certificate file upload to Event folder failed: " . ($certificateEventResult['error'] ?? 'Unknown error'));
                // Don't throw, continue with Paper Trail copy at least
            }
        }

        // ===== STEP 1: INSERT INTO researchfile TABLE FIRST =====
        $rev = 'pending';
        $nullEndorsement = null;

        // ===== FIX: Use proper variable names =====
        $insertResearchQuery = "INSERT INTO researchfile(
            paper_trail_no, senderid, endorsementid, event_id, author, coauthor, presenter,
            date_started, date_completed, title, final_symposium_title, event, status,
            category, center, campus, title_changed,
            drive_file_id, drive_view_url, drive_download_url,
            drive_event_folder_id, drive_center_folder_id, drive_category_folder_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $insertResearchStmt = $con->prepare($insertResearchQuery);
        if (!$insertResearchStmt) {
            throw new Exception("Prepare failed for researchfile: " . $con->error);
        }

        // For Local In-House, store the Event folder program file as the primary file
        $insertResearchStmt->bind_param(
            'siiissssssssssssissssss',
            $paperTrailNo,
            $senderId,
            $nullEndorsement,
            $eventId,
            $mainAuthor,
            $coAuthors,
            $presenter,
            $date_started,        // Now defined
            $date_completed,      // Now defined
            $documentTitle,
            $final_symposium_title, // Now defined (fixed typo)
            $eventName,
            $rev,
            $category,
            $center,
            $campus,
            $title_changed,       // Now defined
            $programEventFileId,
            $programEventViewUrl,
            $programDriveDownloadUrl,
            $eventFolderId,
            $centerFolderId,
            $categoryFolderId
        );

        if (!$insertResearchStmt->execute()) {
            throw new Exception("Failed to insert researchfile: " . $insertResearchStmt->error);
        }

        $researchId = $con->insert_id;
        $insertResearchStmt->close();

        error_log("Researchfile created with ID: $researchId for Local In-House");

        // ===== STEP 2: INSERT INTO local_inhouse TABLE USING research_id =====
        $query = "INSERT INTO local_inhouse (
            research_id,
            document_title, 
            campus, 
            category, 
            center,
            main_author, 
            presenter, 
            co_authors,
            program_file_view_url, 
            program_file_download_url,
            certificate_file_view_url, 
            certificate_file_download_url,
            program_event_file_id,
            program_event_view_url,
            certificate_event_file_id,
            certificate_event_view_url,
            paper_trail_folder_id,
            event_folder_id,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $con->prepare($query);
        if (!$stmt) {
            throw new Exception("Prepare failed for local_inhouse: " . $con->error);
        }

        $stmt->bind_param(
            'isssssssssssssssss',
            $researchId,
            $documentTitle,
            $campus,
            $category,
            $center,
            $mainAuthor,
            $presenter,
            $coAuthors,
            $programDriveViewUrl,
            $programDriveDownloadUrl,
            $certificateDriveViewUrl,
            $certificateDriveDownloadUrl,
            $programEventFileId,
            $programEventViewUrl,
            $certificateEventFileId,
            $certificateEventViewUrl,
            $paperTrailFolderId,
            $categoryFolderId
        );

        if (!$stmt->execute()) {
            throw new Exception("Failed to insert into local_inhouse: " . $stmt->error);
        }

        $localId = $con->insert_id;

        $response->saved_id = $localId;
        $response->research_id = $researchId;
        $response->paper_trail_no = $paperTrailNo;
        $response->status = true;
        $response->success = true;
        $response->message = "Local In-House Review saved successfully";

        $stmt->close();
        $con->close();

    } catch (Exception $e) {
        error_log("saveLocalInhouse error: " . $e->getMessage());
        $response->message = $e->getMessage();
        $response->status = false;
        $response->success = false;
    }

    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}
// symposium connected to local in house
if (isset($_POST['uploadSymposium'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->success = false;
    $response->research_id = null;
    $response->local_inhouse_id = null;
    $response->paper_trail_no = null;
    $response->paper_trail_record_id = null;

    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        if ($con->connect_error) {
            throw new Exception("Database connection failed: " . $con->connect_error);
        }

        $senderId = isset($_SESSION['userId']) ? $_SESSION['userId'] : 0;
        $eventType = isset($_POST['eventType']) ? trim($_POST['eventType']) : '';
        $eventId = isset($_POST['eventId']) ? (int) $_POST['eventId'] : 0;
        $presentationType = isset($_POST['presentation_type']) ? $_POST['presentation_type'] : 'university';
        
        // Common symposium fields
        $category = isset($_POST['category']) ? trim($_POST['category']) : '';
        $center = isset($_POST['center']) ? trim($_POST['center']) : '';
        $author = isset($_POST['author']) ? trim($_POST['author']) : '';
        $presenter = isset($_POST['presenter']) ? trim($_POST['presenter']) : '';
        $campus = isset($_POST['campus']) ? trim($_POST['campus']) : '';
        $coAuthor = isset($_POST['coAuthor']) ? $_POST['coAuthor'] : '[]';
        $date_started = isset($_POST['date_started']) && !empty($_POST['date_started']) ? $_POST['date_started'] : null;
        $date_completed = isset($_POST['date_completed']) && !empty($_POST['date_completed']) ? $_POST['date_completed'] : null;
        $finalSymposiumTitle = isset($_POST['final_symposium_title']) && !empty($_POST['final_symposium_title']) ? $_POST['final_symposium_title'] : null;
        $title_changed = isset($_POST['title_changed']) ? (int) $_POST['title_changed'] : 0;

        $drive = new GoogleDriveService();

        if ($presentationType === 'local') {
            // ===== LOCAL IN-HOUSE SYMPOSIUM SUBMISSION =====
            $localTitle = isset($_POST['local_title']) ? trim($_POST['local_title']) : '';
            $localCampus = isset($_POST['local_campus']) ? trim($_POST['local_campus']) : '';
            $localCategory = isset($_POST['local_category']) ? trim($_POST['local_category']) : '';
            $localCenter = isset($_POST['local_center']) ? trim($_POST['local_center']) : '';
            $localAuthor = isset($_POST['local_author']) ? trim($_POST['local_author']) : '';
            $localPresenter = isset($_POST['local_presenter']) ? trim($_POST['local_presenter']) : '';
            $localCoAuthors = isset($_POST['local_coAuthors']) ? $_POST['local_coAuthors'] : '[]';

            if (empty($localTitle) || empty($localAuthor)) {
                throw new Exception("Local In-House title and author are required");
            }

            // Generate paper trail number
            $paperTrailNo = generatePaperTrailNumber($con, $eventId, $localCenter, $localTitle, $localAuthor);
            $currentYear = date('Y');

            // Clean names for folder creation
            $cleanEventName = cleanFolderNameForDrive($eventType);
            $cleanCenterName = cleanFolderNameForDrive($localCenter);
            $cleanCategoryName = cleanFolderNameForDrive($localCategory);
            $cleanLocalTitle = cleanFolderNameForDrive($localTitle);
            $authorParts = explode(' ', trim($localAuthor));
            $authorLastName = end($authorParts);
            $authorLastName = cleanFolderNameForDrive($authorLastName);

            // Create folder structure: Event -> Center -> Category
            $eventFolderId = $drive->findOrCreateFolder($cleanEventName, null);
            if (!$eventFolderId) throw new Exception("Failed to create event folder");

            $centerFolderId = $drive->findOrCreateFolder($cleanCenterName, $eventFolderId);
            if (!$centerFolderId) throw new Exception("Failed to create center folder");

            $categoryFolderId = $drive->findOrCreateFolder($cleanCategoryName, $centerFolderId);
            if (!$categoryFolderId) throw new Exception("Failed to create category folder");

            // Create entry folder for symposium files: {author last name} - {title keywords}
            $titleWords = explode(' ', trim($localTitle));
            $titleKeywords = implode('_', array_slice($titleWords, 0, 3));
            $titleKeywords = cleanFolderNameForDrive($titleKeywords);
            $entryFolderName = $authorLastName . ' - ' . $titleKeywords;
            $entryFolderId = $drive->findOrCreateFolder($entryFolderName, $categoryFolderId);
            
            // ===== STEP 1: UPLOAD SYMPOSIUM FILES TO ENTRY FOLDER =====
            $researchDriveFileId = null;
            $researchDriveViewUrl = null;
            $researchPaperTrailResult = null;
            
            if (isset($_FILES['researchDoc']) && $_FILES['researchDoc']['error'] === UPLOAD_ERR_OK) {
                $tempResearchPath = $_FILES['researchDoc']['tmp_name'];
                $finalTitle = $title_changed && !empty($finalSymposiumTitle) ? $finalSymposiumTitle : $localTitle;
                $cleanFinalTitle = cleanFolderNameForDrive($finalTitle);
                $researchFileName = $cleanFinalTitle . ' - completed research.pdf';
                
                $researchUploadResult = $drive->uploadFile($tempResearchPath, $researchFileName, $entryFolderId);
                if ($researchUploadResult['success']) {
                    $drive->makeFilePublic($researchUploadResult['id']);
                    $researchDriveFileId = $researchUploadResult['id'];
                    $researchDriveViewUrl = "https://drive.google.com/file/d/{$researchDriveFileId}/preview";
                    
                    $researchPaperTrailResult = uploadToPaperTrail(
                        $tempResearchPath,
                        $researchFileName,
                        $eventType,
                        $author,
                        $finalTitle,
                        'research',
                        false,
                        false,
                        false,
                        false,
                        $paperTrailNo
                    );
                } else {
                    throw new Exception("Failed to upload research file: " . ($researchUploadResult['error'] ?? 'Unknown error'));
                }
            } else {
                throw new Exception('Research file is required for symposium submission');
            }
            
            // Upload Endorsement File
            $endorsementDriveFileId = null;
            $endorsementDriveViewUrl = null;
            $endorsementPaperTrailResult = null;
            
            if (isset($_FILES['endorsementFile']) && $_FILES['endorsementFile']['error'] === UPLOAD_ERR_OK) {
                $tempEndorsementPath = $_FILES['endorsementFile']['tmp_name'];
                $finalTitle = $title_changed && !empty($finalSymposiumTitle) ? $finalSymposiumTitle : $localTitle;
                $cleanFinalTitle = cleanFolderNameForDrive($finalTitle);
                $endorsementFileName = $cleanFinalTitle . ' - endorsement letter.pdf';
                
                $endorsementUploadResult = $drive->uploadFile($tempEndorsementPath, $endorsementFileName, $entryFolderId);
                if ($endorsementUploadResult['success']) {
                    $drive->makeFilePublic($endorsementUploadResult['id']);
                    $endorsementDriveFileId = $endorsementUploadResult['id'];
                    $endorsementDriveViewUrl = "https://drive.google.com/file/d/{$endorsementDriveFileId}/preview";
                    
                    $endorsementPaperTrailResult = uploadToPaperTrail(
                        $tempEndorsementPath,
                        $endorsementFileName,
                        $eventType,
                        $author,
                        $finalTitle,
                        'endorsement',
                        false,
                        true,
                        false,
                        false,
                        $paperTrailNo
                    );
                } else {
                    throw new Exception("Failed to upload endorsement file: " . ($endorsementUploadResult['error'] ?? 'Unknown error'));
                }
            } else {
                throw new Exception('Endorsement file is required for symposium submission');
            }
            
            // Create endorsement record
            $defaultTime = date('Y-m-d H:i:s');
            $endorsementQuery = "INSERT INTO endorsement (
                senderid, center, campus, drive_file_id, drive_view_url, 
                drive_download_url, drive_event_folder_id, drive_center_folder_id, 
                drive_category_folder_id, drive_entry_folder_id, event, status, date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $endorsementStmt = $con->prepare($endorsementQuery);
            $endorsementStatus = 'pending';
            $endorsementDriveDownloadUrl = "https://drive.google.com/uc?id={$endorsementDriveFileId}&export=download";
            
            $endorsementStmt->bind_param(
                'issssssssssss',
                $senderId,
                $center,
                $campus,
                $endorsementDriveFileId,
                $endorsementDriveViewUrl,
                $endorsementDriveDownloadUrl,
                $eventFolderId,
                $centerFolderId,
                $categoryFolderId,
                $entryFolderId,
                $eventType,
                $endorsementStatus,
                $defaultTime
            );
            
            if (!$endorsementStmt->execute()) {
                throw new Exception("Failed to save endorsement: " . $endorsementStmt->error);
            }
            
            $endorsementId = $con->insert_id;
            
            // ===== STEP 2: TITLE CHANGE CERTIFICATE LOCAL =====
            $titleCertificateViewUrl = null;
            $titleCertificateDownloadUrl = null;
            $titleCertificatePaperTrailResult = null;
            $titleCertificateDriveFileId = null;

            if ($title_changed && isset($_FILES['titleCertificateFile']) && $_FILES['titleCertificateFile']['error'] === UPLOAD_ERR_OK) {
                $tempCertificatePath = $_FILES['titleCertificateFile']['tmp_name'];
                $cleanLocalTitle = cleanFolderNameForDrive($localTitle);
                $titleCertificateName = $cleanLocalTitle . ' - certificate of title change.pdf';
                
                // ===== UPLOAD TO EVENT FOLDER (entry folder) =====
                $certificateUploadResult = $drive->uploadFile($tempCertificatePath, $titleCertificateName, $entryFolderId);
                if ($certificateUploadResult['success']) {
                    $drive->makeFilePublic($certificateUploadResult['id']);
                    $titleCertificateDriveFileId = $certificateUploadResult['id'];
                    $titleCertificateViewUrl = "https://drive.google.com/file/d/{$titleCertificateDriveFileId}/preview";
                    $titleCertificateDownloadUrl = "https://drive.google.com/uc?id={$titleCertificateDriveFileId}&export=download";
                    error_log("Title certificate uploaded to event folder: ID = $titleCertificateDriveFileId using original title: $localTitle");
                } else {
                    error_log("Failed to upload title certificate to event folder: " . ($certificateUploadResult['error'] ?? 'Unknown error'));
                }
                
                // ===== GET THE EXISTING RESEARCH FOLDER ID FROM PAPER TRAIL =====
                $existingResearchFolderId = null;
                if (isset($researchPaperTrailResult['research_folder_id']) && !empty($researchPaperTrailResult['research_folder_id'])) {
                    $existingResearchFolderId = $researchPaperTrailResult['research_folder_id'];
                    error_log("Using research folder ID from research file: $existingResearchFolderId");
                } elseif (isset($endorsementPaperTrailResult['research_folder_id']) && !empty($endorsementPaperTrailResult['research_folder_id'])) {
                    $existingResearchFolderId = $endorsementPaperTrailResult['research_folder_id'];
                    error_log("Using research folder ID from endorsement file: $existingResearchFolderId");
                } else {
                    error_log("No existing research folder ID found, will create new folder");
                }
                
                // ===== UPLOAD TO PAPER TRAIL - PASS EXISTING FOLDER ID =====
                $titleCertificatePaperTrailResult = uploadToPaperTrail(
                    $tempCertificatePath,
                    $titleCertificateName,
                    $eventType,
                    $author,
                    $localTitle,
                    'title_certificate',
                    false,
                    false,
                    true,
                    false,
                    $paperTrailNo,
                    $existingResearchFolderId  // CRITICAL: Pass the existing folder ID
                );
                
                if ($titleCertificatePaperTrailResult && $titleCertificatePaperTrailResult['success']) {
                    error_log("Title certificate uploaded to Paper Trail successfully using original title: $localTitle");
                } else {
                    error_log("Failed to upload title certificate to Paper Trail: " . ($titleCertificatePaperTrailResult['error'] ?? 'Unknown error'));
                }
            }
            
            // ===== STEP 3: INSERT INTO researchfile TABLE =====
            $rev = 'pending';
            $originalTitle = isset($_POST['original_title']) ? trim($_POST['original_title']) : $localTitle;
            $localInhouseFlag = 1;
            $researchDriveDownloadUrl = "https://drive.google.com/uc?id={$researchDriveFileId}&export=download";
            $titleChanged = isset($_POST['title_changed']) ? (int)$_POST['title_changed'] : 0;
            $researchQuery = "INSERT INTO researchfile(
                paper_trail_no, senderid, endorsementid, event_id, author, coauthor, presenter,
                date_started, date_completed, title, final_symposium_title, event, status,
                category, center, campus, title_changed, local_inhouse,
                drive_file_id, drive_view_url, drive_download_url,
                drive_folder_id, drive_event_folder_id, drive_center_folder_id, 
                drive_category_folder_id, drive_entry_folder_id,
                title_certificate_view_url, title_certificate_download_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $researchStmt = $con->prepare($researchQuery);
            
            $researchStmt->bind_param(
                'siiissssssssssssisssssssssss',
                $paperTrailNo,
                $senderId,
                $endorsementId,
                $eventId,
                $author,
                $coAuthor,
                $presenter,
                $date_started,
                $date_completed,
                $originalTitle,
                $finalSymposiumTitle,
                $eventType,
                $rev,
                $category,
                $center,
                $campus,
                $title_changed,
                $localInhouseFlag,
                $researchDriveFileId,
                $researchDriveViewUrl,
                $researchDriveDownloadUrl,
                $entryFolderId,
                $eventFolderId,
                $centerFolderId,
                $categoryFolderId,
                $entryFolderId,
                $titleCertificateViewUrl,
                $titleCertificateDownloadUrl
            );
            
            if (!$researchStmt->execute()) {
                throw new Exception("Failed to insert researchfile: " . $researchStmt->error);
            }
            
            $researchId = $con->insert_id;
            $response->research_id = $researchId;
            
            // ===== STEP 4: UPLOAD LOCAL IN-HOUSE PROGRAM FILE =====
            $programDriveFileId = null;
            $programDriveViewUrl = null;
            $programPaperTrailResult = null;
            
            if (isset($_FILES['programFile']) && $_FILES['programFile']['error'] === UPLOAD_ERR_OK) {
                $tempProgramPath = $_FILES['programFile']['tmp_name'];
                $programFileName = 'Local In-House Program - ' . $cleanLocalTitle . '.pdf';
                
                $programUploadResult = $drive->uploadFile($tempProgramPath, $programFileName, $categoryFolderId);
                if ($programUploadResult['success']) {
                    $drive->makeFilePublic($programUploadResult['id']);
                    $programDriveFileId = $programUploadResult['id'];
                    $programDriveViewUrl = "https://drive.google.com/file/d/{$programDriveFileId}/preview";
                    
                    $programPaperTrailResult = uploadToPaperTrail(
                        $tempProgramPath,
                        $programFileName,
                        $eventType,
                        $localAuthor,
                        $localTitle,
                        'program',
                        true,
                        false,
                        false,
                        true,
                        $paperTrailNo
                    );
                }
            }

            // ===== STEP 5: LOCAL IN-HOUSE CERTIFICATE FILE =====
            $certificateDriveFileId = null;
            $certificateDriveViewUrl = null;
            $certificateDriveDownloadUrl = null;
            $localCertificatePaperTrailResult = null;
            
            if (isset($_FILES['local_certificateFile']) && $_FILES['local_certificateFile']['error'] === UPLOAD_ERR_OK) {
                $tempCertificatePath = $_FILES['local_certificateFile']['tmp_name'];
                $localCertificateFileName = 'Local In-House Certificate - ' . $cleanLocalTitle . '.pdf';
                
                $certificateUploadResult = $drive->uploadFile($tempCertificatePath, $localCertificateFileName, $categoryFolderId);
                if ($certificateUploadResult['success']) {
                    $drive->makeFilePublic($certificateUploadResult['id']);
                    $certificateDriveFileId = $certificateUploadResult['id'];
                    $certificateDriveViewUrl = "https://drive.google.com/file/d/{$certificateDriveFileId}/preview";
                    $certificateDriveDownloadUrl = "https://drive.google.com/uc?id={$certificateDriveFileId}&export=download";
                    
                    $localCertificatePaperTrailResult = uploadToPaperTrail(
                        $tempCertificatePath,
                        $localCertificateFileName,
                        $eventType,
                        $localAuthor,
                        $localTitle,
                        'certificate',
                        false,
                        false,
                        true,
                        true,
                        $paperTrailNo
                    );
                }
            }

            // ===== STEP 6: INSERT INTO local_inhouse TABLE =====
            $localQuery = "INSERT INTO local_inhouse (
                research_id, document_title, campus, category, center, main_author, presenter, co_authors,
                program_file_view_url, program_file_download_url,
                certificate_file_view_url, certificate_file_download_url,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

            $localStmt = $con->prepare($localQuery);
            $programDownloadUrl = $programDriveFileId ? "https://drive.google.com/uc?id={$programDriveFileId}&export=download" : null;
            
            $localStmt->bind_param(
                'isssssssssss',
                $researchId,
                $localTitle,
                $localCampus,
                $localCategory,
                $localCenter,
                $localAuthor,
                $localPresenter,
                $localCoAuthors,
                $programDriveViewUrl,
                $programDownloadUrl,
                $certificateDriveViewUrl,
                $certificateDriveDownloadUrl
            );
            
            if (!$localStmt->execute()) {
                throw new Exception("Failed to insert local_inhouse: " . $localStmt->error);
            }
            
            $localInhouseId = $con->insert_id;
            $response->local_inhouse_id = $localInhouseId;
            $response->paper_trail_no = $paperTrailNo;
            
            // ===== STEP 7: UPDATE researchfile WITH CERTIFICATE FILE IDs =====
            if ($certificateDriveFileId) {
                $updateResearchQuery = "UPDATE researchfile SET 
                    certificate_drive_file_id = ?,
                    certificate_drive_view_url = ?
                WHERE id = ?";
                
                $updateStmt = $con->prepare($updateResearchQuery);
                $updateStmt->bind_param('ssi', $certificateDriveFileId, $certificateDriveViewUrl, $researchId);
                $updateStmt->execute();
                $updateStmt->close();
            }
            
            // ===== STEP 8: SAVE PAPER TRAIL RECORDS =====
            if ($researchPaperTrailResult && $researchPaperTrailResult['success']) {
                savePaperTrailRecord($con, $researchId, $paperTrailNo, $currentYear, 'Symposium', $researchPaperTrailResult);
            }
            
            if ($endorsementPaperTrailResult && $endorsementPaperTrailResult['success']) {
                savePaperTrailRecord($con, $researchId, $paperTrailNo, $currentYear, 'Symposium', $endorsementPaperTrailResult);
            }
            
            // Save title change certificate
            if ($titleCertificatePaperTrailResult && $titleCertificatePaperTrailResult['success']) {
                savePaperTrailRecord($con, $researchId, $paperTrailNo, $currentYear, 'Symposium', $titleCertificatePaperTrailResult);
            }
            
            // Save program file
            if ($programPaperTrailResult && $programPaperTrailResult['success']) {
                savePaperTrailRecord($con, $researchId, $paperTrailNo, $currentYear, 'Local In-House Review', $programPaperTrailResult);
            }
            
            // Save local certificate
            if ($localCertificatePaperTrailResult && $localCertificatePaperTrailResult['success']) {
                savePaperTrailRecord($con, $researchId, $paperTrailNo, $currentYear, 'Local In-House Review', $localCertificatePaperTrailResult);
            }
            
        } else {
            // ===== UNIVERSITY SYMPOSIUM SUBMISSION =====
            $originalTitle = isset($_POST['original_title']) ? trim($_POST['original_title']) : '';
            $selectedInhouseId = isset($_POST['selected_inhouse_id']) ? (int) $_POST['selected_inhouse_id'] : null;
            $currentYear = date('Y');
            
            if (empty($originalTitle) || empty($author) || empty($category) || empty($center) || empty($campus) || empty($presenter)) {
                throw new Exception("Missing required fields for Symposium submission");
            }
            
            // Generate paper trail number
            $paperTrailNo = generatePaperTrailNumber($con, $eventId, $center, $originalTitle, $author);
            
            // Clean names for folder creation
            $cleanEventName = cleanFolderNameForDrive($eventType);
            $cleanCenterName = cleanFolderNameForDrive($center);
            $cleanCategoryName = cleanFolderNameForDrive($category);
            $authorParts = explode(' ', trim($author));
            $authorLastName = end($authorParts);
            $authorLastName = cleanFolderNameForDrive($authorLastName);
            
            // Get keywords from title for folder name
            $titleWords = explode(' ', trim($originalTitle));
            $titleKeywords = implode('_', array_slice($titleWords, 0, 3));
            $titleKeywords = cleanFolderNameForDrive($titleKeywords);
            
            // Create entry folder name: {author last name} - {title keywords}
            $entryFolderName = $authorLastName . ' - ' . $titleKeywords;
            
            // Create folder structure: Event -> Center -> Category -> EntryFolder
            $eventFolderId = $drive->findOrCreateFolder($cleanEventName, null);
            if (!$eventFolderId) throw new Exception("Failed to create event folder");
            
            $centerFolderId = $drive->findOrCreateFolder($cleanCenterName, $eventFolderId);
            if (!$centerFolderId) throw new Exception("Failed to create center folder");
            
            $categoryFolderId = $drive->findOrCreateFolder($cleanCategoryName, $centerFolderId);
            if (!$categoryFolderId) throw new Exception("Failed to create category folder");
            
            $entryFolderId = $drive->findOrCreateFolder($entryFolderName, $categoryFolderId);
            if (!$entryFolderId) throw new Exception("Failed to create entry folder");
            
            // Upload Research File
            $researchDriveFileId = null;
            $researchDriveViewUrl = null;
            $researchPaperTrailResult = null;
            
            if (isset($_FILES['researchDoc']) && $_FILES['researchDoc']['error'] === UPLOAD_ERR_OK) {
                $tempResearchPath = $_FILES['researchDoc']['tmp_name'];
                $cleanTitle = cleanFolderNameForDrive($originalTitle);
                $researchFileName = $cleanTitle . ' - completed research.pdf';
                
                $researchUploadResult = $drive->uploadFile($tempResearchPath, $researchFileName, $entryFolderId);
                if ($researchUploadResult['success']) {
                    $drive->makeFilePublic($researchUploadResult['id']);
                    $researchDriveFileId = $researchUploadResult['id'];
                    $researchDriveViewUrl = "https://drive.google.com/file/d/{$researchDriveFileId}/preview";
                    
                    $researchPaperTrailResult = uploadToPaperTrail(
                        $tempResearchPath,
                        $researchFileName,
                        $eventType,
                        $author,
                        $originalTitle,
                        'research',
                        false,
                        false,
                        false,
                        false,
                        $paperTrailNo
                    );
                }
            }
            
            // Upload Endorsement File
            $endorsementDriveFileId = null;
            $endorsementDriveViewUrl = null;
            $endorsementPaperTrailResult = null;
            
            if (isset($_FILES['endorsementFile']) && $_FILES['endorsementFile']['error'] === UPLOAD_ERR_OK) {
                $tempEndorsementPath = $_FILES['endorsementFile']['tmp_name'];
                $cleanTitle = cleanFolderNameForDrive($originalTitle);
                $endorsementFileName = $cleanTitle . ' - endorsement letter.pdf';
                
                $endorsementUploadResult = $drive->uploadFile($tempEndorsementPath, $endorsementFileName, $entryFolderId);
                if ($endorsementUploadResult['success']) {
                    $drive->makeFilePublic($endorsementUploadResult['id']);
                    $endorsementDriveFileId = $endorsementUploadResult['id'];
                    $endorsementDriveViewUrl = "https://drive.google.com/file/d/{$endorsementDriveFileId}/preview";
                    
                    $endorsementPaperTrailResult = uploadToPaperTrail(
                        $tempEndorsementPath,
                        $endorsementFileName,
                        $eventType,
                        $author,
                        $originalTitle,
                        'endorsement',
                        false,
                        true,
                        false,
                        false,
                        $paperTrailNo
                    );
                }
            }
            
            // Create endorsement record
            $defaultTime = date('Y-m-d H:i:s');
            $endorsementQuery = "INSERT INTO endorsement (
                senderid, center, campus, drive_file_id, drive_view_url, 
                drive_download_url, drive_event_folder_id, drive_center_folder_id, 
                drive_category_folder_id, drive_entry_folder_id, event, status, date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $endorsementStmt = $con->prepare($endorsementQuery);
            $endorsementStatus = 'pending';
            $endorsementDriveDownloadUrl = "https://drive.google.com/uc?id={$endorsementDriveFileId}&export=download";
            
            $endorsementStmt->bind_param(
                'issssssssssss',
                $senderId,
                $center,
                $campus,
                $endorsementDriveFileId,
                $endorsementDriveViewUrl,
                $endorsementDriveDownloadUrl,
                $eventFolderId,
                $centerFolderId,
                $categoryFolderId,
                $entryFolderId,
                $eventType,
                $endorsementStatus,
                $defaultTime
            );
            
            if (!$endorsementStmt->execute()) {
                throw new Exception("Failed to save endorsement: " . $endorsementStmt->error);
            }
            
            $endorsementId = $con->insert_id;
            
            // ===== TITLE CHANGE CERTIFICATE =====
            $titleCertificateViewUrl = null;
            $titleCertificateDownloadUrl = null;
            $titleCertificatePaperTrailResult = null;
            $titleCertificateDriveFileId = null;

            if ($title_changed && isset($_FILES['titleCertificateFile']) && $_FILES['titleCertificateFile']['error'] === UPLOAD_ERR_OK) {
                $tempCertificatePath = $_FILES['titleCertificateFile']['tmp_name'];
                $cleanOriginalTitle = cleanFolderNameForDrive($originalTitle);
                $titleCertificateName = $cleanOriginalTitle . ' - certificate of title change.pdf';
                
                // ===== UPLOAD TO ENTRY FOLDER =====
                $certificateUploadResult = $drive->uploadFile($tempCertificatePath, $titleCertificateName, $entryFolderId);
                if ($certificateUploadResult['success']) {
                    $drive->makeFilePublic($certificateUploadResult['id']);
                    $titleCertificateDriveFileId = $certificateUploadResult['id'];
                    $titleCertificateViewUrl = "https://drive.google.com/file/d/{$titleCertificateDriveFileId}/preview";
                    $titleCertificateDownloadUrl = "https://drive.google.com/uc?id={$titleCertificateDriveFileId}&export=download";
                    error_log("University title certificate uploaded to entry folder: ID = $titleCertificateDriveFileId using original title: $originalTitle");
                } else {
                    error_log("Failed to upload title certificate to entry folder: " . ($certificateUploadResult['error'] ?? 'Unknown error'));
                }
                
                // ===== GET THE EXISTING RESEARCH FOLDER ID FROM PAPER TRAIL =====
                $existingResearchFolderId = null;
                if (isset($researchPaperTrailResult['research_folder_id']) && !empty($researchPaperTrailResult['research_folder_id'])) {
                    $existingResearchFolderId = $researchPaperTrailResult['research_folder_id'];
                    error_log("Using research folder ID from research file: $existingResearchFolderId");
                } elseif (isset($endorsementPaperTrailResult['research_folder_id']) && !empty($endorsementPaperTrailResult['research_folder_id'])) {
                    $existingResearchFolderId = $endorsementPaperTrailResult['research_folder_id'];
                    error_log("Using research folder ID from endorsement file: $existingResearchFolderId");
                } else {
                    error_log("No existing research folder ID found, will create new folder");
                }
                
                // ===== UPLOAD TO PAPER TRAIL - PASS EXISTING FOLDER ID =====
                $titleCertificatePaperTrailResult = uploadToPaperTrail(
                    $tempCertificatePath,
                    $titleCertificateName, 
                    $eventType,
                    $author,
                    $originalTitle, 
                    'title_certificate',
                    false,
                    false,
                    true,
                    false,
                    $paperTrailNo,
                    $existingResearchFolderId  // CRITICAL: Pass the existing folder ID
                );
                
                if ($titleCertificatePaperTrailResult && $titleCertificatePaperTrailResult['success']) {
                    error_log("University title certificate uploaded to Paper Trail successfully using original title: $originalTitle");
                } else {
                    error_log("Failed to upload title certificate to Paper Trail: " . ($titleCertificatePaperTrailResult['error'] ?? 'Unknown error'));
                }
            }
            
            $rev = 'pending';
            $titleChanged = isset($_POST['title_changed']) ? (int)$_POST['title_changed'] : 0;
            $researchQuery = "INSERT INTO researchfile(
                paper_trail_no, senderid, endorsementid, event_id, author, coauthor, presenter,
                date_started, date_completed, title, final_symposium_title, event, status,
                category, center, campus, drive_file_id, drive_view_url, drive_download_url,
                drive_folder_id, drive_event_folder_id, drive_center_folder_id, 
                drive_category_folder_id, drive_entry_folder_id, title_changed,
                title_certificate_view_url, title_certificate_download_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $researchStmt = $con->prepare($researchQuery);
            $researchDriveDownloadUrl = "https://drive.google.com/uc?id={$researchDriveFileId}&export=download";
            
            $researchStmt->bind_param(
                'siiissssssssssssssssssssiss',
                $paperTrailNo,
                $senderId,
                $endorsementId,
                $eventId,
                $author,
                $coAuthor,
                $presenter,
                $date_started,
                $date_completed,
                $originalTitle,
                $finalSymposiumTitle,
                $eventType,
                $rev,
                $category,
                $center,
                $campus,
                $researchDriveFileId,
                $researchDriveViewUrl,
                $researchDriveDownloadUrl,
                $entryFolderId,
                $eventFolderId,
                $centerFolderId,
                $categoryFolderId,
                $entryFolderId,
                $title_changed,
                $titleCertificateViewUrl,
                $titleCertificateDownloadUrl
            );
            
            if (!$researchStmt->execute()) {
                throw new Exception("Failed to insert researchfile: " . $researchStmt->error);
            }
            
            $researchId = $con->insert_id;
            $response->research_id = $researchId;
            $response->paper_trail_no = $paperTrailNo;

            // ===== MARK THE ORIGINAL IN-HOUSE RESEARCH AS SUBMITTED =====
            if ($selectedInhouseId) {
                $updateSubmittedQuery = "UPDATE researchfile SET symposium_submitted = 1 WHERE id = ?";
                $updateSubmittedStmt = $con->prepare($updateSubmittedQuery);
                $updateSubmittedStmt->bind_param("i", $selectedInhouseId);
                $updateSubmittedStmt->execute();
                $updateSubmittedStmt->close();
                error_log("Marked research ID $selectedInhouseId as symposium_submitted");
            }
    
            // Save Paper Trail records for university symposium
            if ($researchPaperTrailResult && $researchPaperTrailResult['success']) {
                savePaperTrailRecord($con, $researchId, $paperTrailNo, $currentYear, 'Symposium', $researchPaperTrailResult);
            }
            
            if ($endorsementPaperTrailResult && $endorsementPaperTrailResult['success']) {
                savePaperTrailRecord($con, $researchId, $paperTrailNo, $currentYear, 'Symposium', $endorsementPaperTrailResult);
            }
            
            // FIX: Save title certificate to Paper Trail
            if ($titleCertificatePaperTrailResult && $titleCertificatePaperTrailResult['success']) {
                savePaperTrailRecord($con, $researchId, $paperTrailNo, $currentYear, 'Symposium', $titleCertificatePaperTrailResult);
            }
            
            $response->local_inhouse_id = null;
        }

        $con->commit();
        $response->status = true;
        $response->success = true;
        $response->message = "Symposium submission successful! Files have been saved to both event folder and Paper Trail.";
        
        $con->close();

    } catch (Exception $e) {
        if (isset($con) && $con) {
            $con->rollback();
        }
        error_log("uploadSymposium error: " . $e->getMessage());
        $response->message = $e->getMessage();
        $response->status = false;
        $response->success = false;
    }

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

function savePaperTrailRecord($con, $researchId, $paperTrailNo, $year, $submissionType, $paperTrailResult) {
    // Check if this is a title certificate
    $isTitleCertificate = isset($paperTrailResult['file_type']) && $paperTrailResult['file_type'] === 'title_certificate';
    
    // For title certificates, they go into the same research folder
    // All file types share the same folder structure
    $paperTrailQuery = "INSERT INTO paper_trail_files (
        research_id, 
        paper_trail_no, 
        submission_type, 
        year,
        paper_trail_root_id, 
        submission_folder_id, 
        year_folder_id,
        research_folder_id, 
        research_folder_name,
        researchfile_drive_view_url,
        researchfile_drive_download_url,
        endorsement_drive_view_url,
        endorsement_drive_download_url,
        program_drive_view_url,
        program_drive_download_url,
        certificate_drive_view_url,
        certificate_drive_download_url,
        title_certificate_view_url,
        title_certificate_download_url,
        created_at
    ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        NOW()
    )";
    
    $paperTrailStmt = $con->prepare($paperTrailQuery);
    
    // Extract values from paperTrailResult
    $researchfileViewUrl = isset($paperTrailResult['researchfile_drive_view_url']) ? $paperTrailResult['researchfile_drive_view_url'] : (isset($paperTrailResult['drive_view_url']) && $paperTrailResult['file_type'] === 'research' ? $paperTrailResult['drive_view_url'] : null);
    $researchfileDownloadUrl = isset($paperTrailResult['researchfile_drive_download_url']) ? $paperTrailResult['researchfile_drive_download_url'] : (isset($paperTrailResult['drive_download_url']) && $paperTrailResult['file_type'] === 'research' ? $paperTrailResult['drive_download_url'] : null);
    
    $endorsementViewUrl = isset($paperTrailResult['endorsement_drive_view_url']) ? $paperTrailResult['endorsement_drive_view_url'] : (isset($paperTrailResult['drive_view_url']) && isset($paperTrailResult['file_type']) && $paperTrailResult['file_type'] === 'endorsement' ? $paperTrailResult['drive_view_url'] : null);
    $endorsementDownloadUrl = isset($paperTrailResult['endorsement_drive_download_url']) ? $paperTrailResult['endorsement_drive_download_url'] : (isset($paperTrailResult['drive_download_url']) && isset($paperTrailResult['file_type']) && $paperTrailResult['file_type'] === 'endorsement' ? $paperTrailResult['drive_download_url'] : null);
    
    $programViewUrl = isset($paperTrailResult['program_drive_view_url']) ? $paperTrailResult['program_drive_view_url'] : null;
    $programDownloadUrl = isset($paperTrailResult['program_drive_download_url']) ? $paperTrailResult['program_drive_download_url'] : null;
    
    $certificateViewUrl = isset($paperTrailResult['certificate_drive_view_url']) ? $paperTrailResult['certificate_drive_view_url'] : (isset($paperTrailResult['drive_view_url']) && isset($paperTrailResult['file_type']) && $paperTrailResult['file_type'] === 'certificate' ? $paperTrailResult['drive_view_url'] : null);
    $certificateDownloadUrl = isset($paperTrailResult['certificate_drive_download_url']) ? $paperTrailResult['certificate_drive_download_url'] : (isset($paperTrailResult['drive_download_url']) && isset($paperTrailResult['file_type']) && $paperTrailResult['file_type'] === 'certificate' ? $paperTrailResult['drive_download_url'] : null);
    
    // Title certificate - always use the title_certificate specific fields
    $titleCertificateViewUrl = isset($paperTrailResult['title_certificate_view_url']) ? $paperTrailResult['title_certificate_view_url'] : (isset($paperTrailResult['drive_view_url']) && $isTitleCertificate ? $paperTrailResult['drive_view_url'] : null);
    $titleCertificateDownloadUrl = isset($paperTrailResult['title_certificate_download_url']) ? $paperTrailResult['title_certificate_download_url'] : (isset($paperTrailResult['drive_download_url']) && $isTitleCertificate ? $paperTrailResult['drive_download_url'] : null);
    
    // Get folder values
    $paperTrailRootId = isset($paperTrailResult['paper_trail_root_id']) ? $paperTrailResult['paper_trail_root_id'] : null;
    $subTypeFolderId = isset($paperTrailResult['sub_type_folder_id']) ? $paperTrailResult['sub_type_folder_id'] : null;
    $yearFolderId = isset($paperTrailResult['year_folder_id']) ? $paperTrailResult['year_folder_id'] : null;
    $researchFolderId = isset($paperTrailResult['research_folder_id']) ? $paperTrailResult['research_folder_id'] : null;
    $researchFolderName = isset($paperTrailResult['research_folder_name']) ? $paperTrailResult['research_folder_name'] : null;
    
    $paperTrailStmt->bind_param(
        'issssssssssssssssss',
        $researchId,
        $paperTrailNo,
        $submissionType,
        $year,
        $paperTrailRootId,
        $subTypeFolderId,
        $yearFolderId,
        $researchFolderId,
        $researchFolderName,
        $researchfileViewUrl,
        $researchfileDownloadUrl,
        $endorsementViewUrl,
        $endorsementDownloadUrl,
        $programViewUrl,
        $programDownloadUrl,
        $certificateViewUrl,
        $certificateDownloadUrl,
        $titleCertificateViewUrl,
        $titleCertificateDownloadUrl
    );
    
    $paperTrailStmt->execute();
    $paperTrailStmt->close();
}

if (isset($_POST['searchInhouseTitles'])) {
    while (ob_get_level())
        ob_end_clean();
    ob_start();

    $response = new stdClass();
    $response->status = false;
    $response->list = [];
    $response->message = '';

    try {
        if ($con = new mysqli($host, $username, $pass, $dbName)) {

            $searchTerm = isset($_POST['search']) ? trim($_POST['search']) : '';
            $searchPattern = '%' . $con->real_escape_string($searchTerm) . '%';

            $query = "SELECT DISTINCT rf.title, rf.author, rf.presenter, rf.drive_view_url, rf.id
                      FROM researchfile rf
                      INNER JOIN endorsement e ON rf.endorsementid = e.id
                      WHERE e.status = 'accepted'
                      AND (rf.event LIKE '%In House Review%' OR rf.event LIKE '%In-House Review%')
                      AND (rf.title LIKE ? OR rf.author LIKE ? OR rf.presenter LIKE ?)
                      ORDER BY rf.title ASC
                      LIMIT 20";

            $stmt = $con->prepare($query);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $con->error);
            }

            $stmt->bind_param("sss", $searchPattern, $searchPattern, $searchPattern);
            $stmt->execute();
            $result = $stmt->get_result();

            while ($row = $result->fetch_assoc()) {
                $item = new stdClass();
                $item->title = $row['title'];
                $item->author = $row['author'];
                $item->presenter = $row['presenter'];
                $item->drive_view_url = $row['drive_view_url'];
                $item->id = $row['id'];
                $response->list[] = $item;
            }

            $response->status = true;
            $response->message = 'Found ' . count($response->list) . ' results';
            $stmt->close();
            $con->close();
        } else {
            throw new Exception("Database connection failed");
        }
    } catch (Exception $e) {
        error_log("searchInhouseTitles error: " . $e->getMessage());
        $response->status = false;
        $response->message = $e->getMessage();
        $response->list = [];
    }

    // Clear any output buffers and send clean JSON
    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($response);
    exit();
}

if (isset($_POST['getAcceptedInhouseReviews'])) {
    // Clean any previous output
    while (ob_get_level()) ob_end_clean();
    ob_start();
    
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->data = [];

    try {
        // Check if user is logged in
        if (!isset($_SESSION['userId']) || empty($_SESSION['userId'])) {
            throw new Exception("User not logged in. Please refresh the page.");
        }
        
        $userId = (int)$_SESSION['userId'];
        
        // Check database connection
        $con = new mysqli($host, $username, $pass, $dbName);
        if ($con->connect_error) {
            throw new Exception("Database connection failed: " . $con->connect_error);
        }

        // ===== UPDATED QUERY - FILTER OUT ALREADY SUBMITTED =====
        $query = "SELECT 
                    rf.id,
                    rf.title,
                    rf.author,
                    rf.coauthor,
                    rf.category,
                    rf.center,
                    rf.event,
                    rf.event_id,
                    rf.symposium_submitted,
                    e.status,
                    el.name as event_name,
                    el.date as event_date
                  FROM researchfile rf
                  LEFT JOIN endorsement e ON rf.endorsementid = e.id
                  LEFT JOIN event_list el ON rf.event_id = el.id
                  WHERE (rf.event LIKE '%In-House Review%' 
                         OR rf.event LIKE '%in-house review%'
                         OR rf.event LIKE '%In-House Review%')
                  AND rf.senderid = ? 
                  AND (e.status = 'accepted' OR rf.status = 'accepted')
                  AND rf.symposium_submitted = 0 
                  ORDER BY el.date DESC, rf.id DESC";

        $stmt = $con->prepare($query);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $con->error);
        }
        
        $stmt->bind_param("i", $userId);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $data = new stdClass();
            $data->id = (int)$row['id'];
            $data->title = $row['title'] ?? '';
            $data->author = $row['author'] ?? '';
            $data->category = $row['category'] ?? '';
            $data->center = $row['center'] ?? '';
            $data->event_name = $row['event_name'] ?? $row['event'] ?? '';
            $data->event_date = $row['event_date'] ?? '';
            $data->status = $row['status'] ?? '';
            $data->symposium_submitted = (int)($row['symposium_submitted'] ?? 0);

            // Parse coauthors
            if (!empty($row['coauthor'])) {
                $coauthors = json_decode($row['coauthor'], true);
                $data->coauthors = is_array($coauthors) ? $coauthors : [];
            } else {
                $data->coauthors = [];
            }

            $response->data[] = $data;
        }

        $response->status = true;
        $response->message = count($response->data) . ' accepted in-house review(s) found';

        $stmt->close();
        $con->close();
        
    } catch (Exception $e) {
        error_log("Error fetching accepted in-house reviews: " . $e->getMessage());
        $response->message = $e->getMessage();
        $response->status = false;
        $response->data = [];
    }

    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($response);
    ob_end_flush();
    exit();
}

//get research files for events
if (isset($_POST['researchFile'])) {
    while (ob_get_level())
        ob_end_clean();
    ini_set('memory_limit', '256M');
    set_time_limit(30);

    $response = new stdClass();
    $response->status = false;
    $response->list = [];
    $response->message = '';

    try {
        if (!isset($_POST['eventId']) || intval($_POST['eventId']) === 0) {
            throw new Exception('Event ID is required');
        }

        $userId = isset($_SESSION['userId']) ? intval($_SESSION['userId']) : 0;
        $eventId = intval($_POST['eventId']);

        // Get search term if provided
        $searchTerm = isset($_POST['search']) ? trim($_POST['search']) : '';

        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            $con->set_charset("utf8mb4");

            // Get the event name
            $eventName = '';
            $eventNameStmt = $con->prepare("SELECT name FROM event_list WHERE id = ? LIMIT 1");
            if ($eventNameStmt) {
                $eventNameStmt->bind_param('i', $eventId);
                $eventNameStmt->execute();
                $eventNameResult = $eventNameStmt->get_result();
                if ($eventNameRow = $eventNameResult->fetch_assoc()) {
                    $eventName = $eventNameRow['name'];
                }
                $eventNameStmt->close();
            }

            $isNewEvent = ($eventId >= 13);

            $query = "SELECT 
                rf.id,
                rf.author,
                rf.coauthor,
                rf.presenter,
                rf.title,
                rf.drive_view_url,
                rf.drive_file_id,
                rf.drive_download_url,
                rf.file as local_file,
                rf.category,
                rf.campus,
                rf.center,
                el.name as event_name
            FROM researchfile rf
            INNER JOIN endorsement e ON e.id = rf.endorsementid
            INNER JOIN event_list el ON el.id = rf.event_id
            WHERE (e.status = 'accepted' OR rf.status = 'accepted')
            AND rf.event_id = ?";

            if ($isNewEvent) {
                $query .= " AND rf.center IS NOT NULL AND rf.center != ''";
            } else {
                $query .= " AND rf.campus IS NOT NULL AND rf.campus != ''";
            }

            // Add search condition if search term is provided
            if (!empty($searchTerm)) {
                $searchPattern = '%' . $con->real_escape_string($searchTerm) . '%';
                $query .= " AND (
                    rf.author LIKE ? OR 
                    rf.coauthor LIKE ? OR 
                    rf.presenter LIKE ? OR 
                    rf.title LIKE ? OR 
                    rf.campus LIKE ? OR 
                    rf.center LIKE ?
                )";
            }

            // Add ORDER BY to ensure consistent ordering
            $query .= " ORDER BY el.name, " . ($isNewEvent ? "rf.center" : "rf.campus") . ", rf.title";

            $stmt = $con->prepare($query);
            if (!$stmt)
                throw new Exception('Prepare failed: ' . $con->error);

            // Bind parameters
            if (!empty($searchTerm)) {
                $searchPattern = '%' . $searchTerm . '%';
                $stmt->bind_param('issssss', $eventId, $searchPattern, $searchPattern, $searchPattern, $searchPattern, $searchPattern, $searchPattern);
            } else {
                $stmt->bind_param('i', $eventId);
            }

            $stmt->execute();
            $result = $stmt->get_result();

            $groupedResults = [];

            if ($result && $result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    // Get location based on event type
                    $location = $isNewEvent
                        ? ($row['center'] ?? 'N/A')
                        : ($row['campus'] ?? 'N/A');

                    // Use event name + location as the grouping key
                    $currentEventName = $row['event_name'] ?: $eventName;
                    $key = $currentEventName . '|' . $location;

                    if (!isset($groupedResults[$key])) {
                        $groupedResults[$key] = [
                            'name' => $currentEventName,     // → Event Name column
                            'location' => $location,              // → Campus/Center column
                            'list' => []
                        ];
                    }

                    $data = new stdClass();
                    $data->author = htmlspecialchars($row['author'] ?? '', ENT_QUOTES, 'UTF-8');
                    $data->coauthor = htmlspecialchars($row['coauthor'] ?? '', ENT_QUOTES, 'UTF-8');
                    $data->presenter = htmlspecialchars($row['presenter'] ?? '', ENT_QUOTES, 'UTF-8');
                    $data->title = htmlspecialchars($row['title'] ?? '', ENT_QUOTES, 'UTF-8');
                    $data->id = intval($row['id']);

                    if (!empty($row['drive_view_url'])) {
                        $data->file = filter_var($row['drive_view_url'], FILTER_SANITIZE_URL);
                        $data->file_type = 'drive';
                        $data->drive_file_id = htmlspecialchars($row['drive_file_id'] ?? '', ENT_QUOTES, 'UTF-8');
                        $data->drive_download_url = filter_var($row['drive_download_url'] ?? '', ENT_QUOTES);
                    } elseif (!empty($row['local_file'])) {
                        $data->file = htmlspecialchars($row['local_file'], ENT_QUOTES, 'UTF-8');
                        $data->file_type = 'local';
                    } else {
                        $data->file = null;
                        $data->file_type = 'none';
                    }

                    $data->category = htmlspecialchars($row['category'] ?? '', ENT_QUOTES, 'UTF-8');
                    $data->center = htmlspecialchars($row['center'] ?? '', ENT_QUOTES, 'UTF-8');
                    $data->campus = htmlspecialchars($row['campus'] ?? '', ENT_QUOTES, 'UTF-8');

                    $groupedResults[$key]['list'][] = $data;
                }

                // Store the number of rows BEFORE freeing the result
                $totalRows = $result->num_rows;

                // Now it's safe to free the result
                $result->free();

                // Convert to indexed array
                $response->list = array_values($groupedResults);

                // Sort by event name then location
                usort($response->list, function ($a, $b) {
                    $nameCompare = strcasecmp($a['name'], $b['name']);
                    if ($nameCompare !== 0)
                        return $nameCompare;
                    return strcasecmp($a['location'], $b['location']);
                });

                // Set status to true since we have data
                $response->status = true;
                $response->message = 'Retrieved ' . count($response->list) . ' groups with ' . $totalRows . ' total files';
                $response->search_term = $searchTerm;

            } else {
                // No data found
                $response->status = true; // Still true, just empty result
                $response->message = empty($searchTerm) ? 'No research documents found for this event' : 'No matching research documents found';
                $response->list = [];
                $response->search_term = $searchTerm;
            }

            $stmt->close();
            $con->close();

        } else {
            throw new Exception('Database connection failed');
        }

    } catch (Exception $e) {
        error_log("researchFile error: " . $e->getMessage());
        $response->message = 'Error: ' . $e->getMessage();
        $response->status = false;
        $response->list = [];
    }

    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    echo json_encode($response, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);
    exit();
}
//displayed the data in the center table
if (isset($_POST['researchReviewed'])) {
    // Clean any previous output
    while (ob_get_level()) ob_end_clean();
    ob_start();
    
    $response = new stdClass();
    $response->list = [];
    $response->status = true;
    $response->message = '';

    try {
        // Check if user is logged in
        if (!isset($_SESSION['userId']) || empty($_SESSION['userId'])) {
            throw new Exception("User not logged in");
        }
        
        $userId = $_SESSION['userId'];
        
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            if ($con->connect_error) {
                throw new Exception("Database connection failed: " . $con->connect_error);
            }

            // Temporarily disable ONLY_FULL_GROUP_BY for this session
            $con->query("SET SESSION sql_mode = ''");
            
            // Get endorsements
            $queryEndorsement = "SELECT * FROM endorsement WHERE senderid = ? ORDER BY date DESC";
            $endorseStmt = $con->prepare($queryEndorsement);
            if (!$endorseStmt) {
                throw new Exception("Prepare failed: " . $con->error);
            }
            $endorseStmt->bind_param("i", $userId);
            $endorseStmt->execute();
            $endorseResult = $endorseStmt->get_result();

            while ($val = $endorseResult->fetch_assoc()) {
                $endorsement = new stdClass();
                $endorsement->endorsementFile = $val['drive_view_url'] ?? null;
                $endorsement->drive_file_id = $val['drive_file_id'] ?? null;
                $endorsement->drive_download_url = $val['drive_download_url'] ?? null;
                $endorsement->eventType = $val['event'] ?? '';
                $endorsement->date = $val['date'] ?? '';
                $endorsement->status = $val['status'] ?? '';
                $endorsement->id = $val['id'] ?? 0;
                $endorsement->ResearchDocs = [];
                $enID = $val['id'];

                // ===== FIX: Remove GROUP BY or use proper aggregation =====
                $queryResearch = "SELECT 
                    rf.author,
                    rf.coauthor,
                    rf.presenter,
                    rf.title,
                    rf.final_symposium_title,
                    rf.title_changed,
                    rf.center,
                    rf.campus,
                    rf.date_started,
                    rf.date_completed,
                    rf.id as docId,
                    rf.category,
                    rf.drive_view_url as file,
                    rf.drive_file_id,
                    rf.program_drive_view_url,
                    rf.certificate_drive_view_url,
                    rf.title_certificate_view_url,
                    rf.revision_status,
                    rf.revision_count,
                    rf.event_id,
                    rf.status as original_status,
                    rf.local_inhouse,
                    el.date_of_presentation,
                    el.name as event_name,
                    li.program_file_view_url as local_program_file_view_url,
                    li.certificate_file_view_url as local_certificate_file_view_url
                FROM researchfile rf
                LEFT JOIN event_list el ON rf.event_id = el.id
                LEFT JOIN local_inhouse li ON rf.id = li.research_id
                WHERE rf.senderid = ? AND rf.endorsementid = ?
                ORDER BY rf.id DESC";

                $researchStmt = $con->prepare($queryResearch);
                if (!$researchStmt) {
                    throw new Exception("Research query prepare failed: " . $con->error);
                }
                $researchStmt->bind_param("ii", $userId, $enID);
                $researchStmt->execute();
                $researchResult = $researchStmt->get_result();

                while ($res = $researchResult->fetch_assoc()) {
                    $researchDocs = new stdClass();
                    $researchDocs->author = $res['author'] ?? '';
                    $researchDocs->coauthor = $res['coauthor'] ?? '';
                    $researchDocs->presenter = $res['presenter'] ?? '';
                    
                    // Title display logic
                    $researchDocs->title_changed = (int)($res['title_changed'] ?? 0);
                    $researchDocs->original_title = $res['title'] ?? '';
                    $researchDocs->final_symposium_title = $res['final_symposium_title'] ?? null;
                    
                    if (!empty($res['final_symposium_title']) && $researchDocs->title_changed == 1) {
                        $researchDocs->title = $res['final_symposium_title'];
                    } else {
                        $researchDocs->title = $res['title'] ?? '';
                    }
                    
                    $researchDocs->center = $res['center'] ?? '';
                    $researchDocs->campus = $res['campus'] ?? '';
                    $researchDocs->date_started = $res['date_started'] ?? null;
                    $researchDocs->date_completed = $res['date_completed'] ?? null;
                    $researchDocs->docId = $res['docId'] ?? 0;
                    $researchDocs->category = $res['category'] ?? '';
                    $researchDocs->researchFile = $res['file'] ?? null;
                    $researchDocs->drive_file_id = $res['drive_file_id'] ?? null;
                    $researchDocs->program_drive_view_url = $res['program_drive_view_url'] ?? null;
                    $researchDocs->certificate_drive_view_url = $res['certificate_drive_view_url'] ?? null;
                    $researchDocs->title_certificate_view_url = $res['title_certificate_view_url'] ?? null;
                    $researchDocs->revision_status = $res['revision_status'] ?? null;
                    $researchDocs->revision_count = $res['revision_count'] ?? 0;
                    $researchDocs->event_id = $res['event_id'] ?? null;
                    $researchDocs->date_of_presentation = $res['date_of_presentation'] ?? null;
                    $researchDocs->original_status = $res['original_status'] ?? 'pending';
                    $researchDocs->event_name = $res['event_name'] ?? '';
                    $researchDocs->local_inhouse = $res['local_inhouse'] ?? 0;
                    $researchDocs->local_program_file_view_url = $res['local_program_file_view_url'] ?? null;
                    $researchDocs->local_certificate_file_view_url = $res['local_certificate_file_view_url'] ?? null;

                    // Determine the display status
                    $currentDate = date('Y-m-d H:i:s');
                    $presentationDate = $res['date_of_presentation'] ?? null;
                    $originalStatus = $res['original_status'] ?? 'pending';
                    $revisionStatus = $res['revision_status'] ?? null;

                    if ($originalStatus === 'rejected') {
                        $displayStatus = 'rejected';
                    } elseif ($presentationDate === null) {
                        $displayStatus = $originalStatus;
                    } elseif ($presentationDate < $currentDate) {
                        $displayStatus = !empty($revisionStatus) ? $revisionStatus : 'revision_pending';
                    } else {
                        $displayStatus = $originalStatus;
                    }

                    $researchDocs->status = $displayStatus;
                    $endorsement->ResearchDocs[] = $researchDocs;
                }
                $response->list[] = $endorsement;
            }
            $con->close();
            
        } else {
            throw new Exception("Database connection failed");
        }
        
    } catch (Exception $e) {
        error_log("researchReviewed error: " . $e->getMessage());
        $response->status = false;
        $response->message = $e->getMessage();
        $response->list = [];
    }

    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($response);
    ob_end_flush();
    exit();
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

if (isset($_POST['rejectedComments'])){
    // Set proper JSON header
    header('Content-Type: application/json; charset=utf-8');
    
    // Initialize response
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->reason = '';
    $response->date = '';
    $response->documentTitle = '';
    $response->eventName = '';
    $response->author = '';
    $response->category = '';
    $response->campus = '';
    $response->center = '';
    $response->documentStatus = '';
    
    // Log that the endpoint was called
    error_log("=== rejectedComments endpoint called ===");
    error_log("POST data: " . print_r($_POST, true));
    
    $docId = isset($_POST['docId']) ? intval($_POST['docId']) : 0;
    
    error_log("docId received: " . $docId);
    
    if ($docId <= 0) {
        $response->message = 'Invalid document ID';
        error_log("Invalid docId: " . $docId);
        echo json_encode($response);
        exit();
    }
    
    try {
        if (!isset($host) || !isset($username) || !isset($pass) || !isset($dbName)) {
            error_log("Database connection variables not set");
            $response->message = 'Database configuration error';
            echo json_encode($response);
            exit();
        }
        
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            error_log("Database connection failed: " . $con->connect_error);
            $response->message = 'Database connection failed: ' . $con->connect_error;
            echo json_encode($response);
            exit();
        }
        
        error_log("Database connected successfully");
        
        $getEndorsementQuery = "SELECT endorsementid FROM researchfile WHERE id = ? LIMIT 1";
        $stmt1 = $con->prepare($getEndorsementQuery);
        $stmt1->bind_param("i", $docId);
        $stmt1->execute();
        $result1 = $stmt1->get_result();
        
        $endorsementId = $docId; // Default to the sent ID
        
        if ($result1 && $result1->num_rows > 0) {
            $row1 = $result1->fetch_assoc();
            $endorsementId = $row1['endorsementid'];
            error_log("Found endorsement ID: " . $endorsementId . " for researchfile ID: " . $docId);
        } else {
            error_log("No researchfile found with ID: " . $docId . ", trying to use as endorsement ID directly");
            $endorsementId = $docId;
        }
        $stmt1->close();
        
        $query = "SELECT 
            rd.reason,
            rd.date,
            rf.title as document_title,
            rf.event as event_name,
            rf.author,
            rf.category,
            rf.campus,
            rf.center,
            rf.status as document_status,
            rf.id as researchfile_id
        FROM rejecteddocs rd
        LEFT JOIN researchfile rf ON rd.docid = rf.endorsementid
        WHERE rd.docid = ?
        ORDER BY rd.date DESC
        LIMIT 1";
        
        error_log("Query with endorsementId: " . $endorsementId);
        
        $stmt = $con->prepare($query);
        if (!$stmt) {
            error_log("Prepare failed: " . $con->error);
            $response->message = 'Database error: ' . $con->error;
            echo json_encode($response);
            exit();
        }
        
        $stmt->bind_param("i", $endorsementId);
        
        if (!$stmt->execute()) {
            error_log("Execute failed: " . $stmt->error);
            $response->message = 'Query execution failed: ' . $stmt->error;
            echo json_encode($response);
            exit();
        }
        
        $result = $stmt->get_result();
        error_log("Result rows: " . $result->num_rows);
        
        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            error_log("Row found: " . print_r($row, true));
            
            $response->status = true;
            $response->message = 'Rejection reason found';
            $response->reason = $row['reason'] ?? 'No reason provided';
            $response->date = $row['date'] ?? '';
            $response->rejectedBy = $row['rejected_by_name'] ?? 'Unknown';
            $response->documentTitle = $row['document_title'] ?? 'N/A';
            $response->eventName = $row['event_name'] ?? 'N/A';
            $response->author = $row['author'] ?? 'N/A';
            $response->category = $row['category'] ?? 'N/A';
            $response->campus = $row['campus'] ?? 'N/A';
            $response->center = $row['center'] ?? 'N/A';
            $response->documentStatus = $row['document_status'] ?? 'N/A';
            $response->researchfileId = $row['researchfile_id'] ?? null;
        } else {
            error_log("No rejection record found for endorsement ID: " . $endorsementId);
            $response->message = 'No rejection record found for this document';
            
            // Check if the document is rejected in the researchfile table
            $statusQuery = "SELECT status, title, event FROM researchfile WHERE id = ?";
            $statusStmt = $con->prepare($statusQuery);
            $statusStmt->bind_param("i", $docId);
            $statusStmt->execute();
            $statusResult = $statusStmt->get_result();
            
            if ($statusResult && $statusResult->num_rows > 0) {
                $statusRow = $statusResult->fetch_assoc();
                if ($statusRow['status'] === 'rejected') {
                    $response->documentTitle = $statusRow['title'] ?? 'N/A';
                    $response->eventName = $statusRow['event'] ?? 'N/A';
                    $response->documentStatus = 'rejected';
                    $response->reason = 'Document was rejected but no rejection reason was recorded.';
                }
            }
            $statusStmt->close();
        }
        
        $stmt->close();
        $con->close();
        
    } catch (Exception $e) {
        error_log("Exception: " . $e->getMessage());
        $response->message = 'Error: ' . $e->getMessage();
    }
    
    // Ensure we always return valid JSON
    $jsonResponse = json_encode($response);
    error_log("Response: " . $jsonResponse);
    echo $jsonResponse;
    exit();
}

if (isset($_POST['submitRevision'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $researchId = $_POST['original_research_id'] ?? 0;
        $userId = $_SESSION['userId'] ?? 0;

        // 1. Get original research record
        $query = "SELECT rf.*, el.date_of_presentation 
                  FROM researchfile rf
                  LEFT JOIN event_list el ON rf.event_id = el.id
                  WHERE rf.id = ? AND rf.senderid = ?";
        $stmt = $con->prepare($query);
        $stmt->bind_param("ii", $researchId, $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $doc = $result->fetch_assoc();

        if (!$doc) {
            $response->message = "Research record not found or access denied.";
            echo json_encode($response);
            exit();
        }

        // Verify document is eligible for revision
        $isEligible = in_array($doc['revision_status'], ['revision_pending', 'revision_rejected']);
        if (!$isEligible) {
            $response->message = "This document is not eligible for revision. Current status: " . ($doc['revision_status'] ?? 'none');
            echo json_encode($response);
            exit();
        }

        // 2. Upload new file to Google Drive
        if (!isset($_FILES['researchDoc']) || $_FILES['researchDoc']['error'] !== UPLOAD_ERR_OK) {
            $response->message = "Revised research document is required.";
            echo json_encode($response);
            exit();
        }

        // Validate file type and size
        $fileType = $_FILES['researchDoc']['type'];
        $fileSize = $_FILES['researchDoc']['size'];

        if ($fileType !== 'application/pdf') {
            $response->message = "Only PDF files are allowed.";
            echo json_encode($response);
            exit();
        }

        if ($fileSize > 10 * 1024 * 1024) { // 10MB limit
            $response->message = "File size must not exceed 10MB.";
            echo json_encode($response);
            exit();
        }

        try {
            $driveService = new GoogleDriveService();

            // Get folder to upload to (prefer entry folder, fallback to center or event)
            $targetFolderId = $doc['drive_entry_folder_id'] ?? $doc['drive_folder_id'];

            if (empty($targetFolderId)) {
                // If no folder found, use the createCompleteFolderStructure helper
                $authorParts = explode(' ', trim($doc['author']));
                $authorLastName = end($authorParts);
                $titleWords = explode(' ', trim($doc['title']));
                $titleKeywords = implode('_', array_slice($titleWords, 0, 3));
                $entryFolderName = $authorLastName . '_' . $titleKeywords;

                $folders = $driveService->createCompleteFolderStructure(
                    $doc['event'],
                    $doc['center'] ?? 'General',
                    $doc['category'] ?? 'Uncategorized',
                    $entryFolderName
                );
                $targetFolderId = $folders['entry_folder_id'];
            }

            // ===== EVENT-BASED FILE NAMING WITH UPLOADED FILE TITLE =====
            $eventName = $doc['event'];
            $revisionCount = ($doc['revision_count'] ?? 0) + 1;
            $extension = '.pdf';

            // Get the uploaded file's original name (file title), NOT rf.title
            $uploadedFileName = pathinfo($_FILES['researchDoc']['name'], PATHINFO_FILENAME);
            $cleanTitle = preg_replace('/[<>:"\/\\|?*]/', '', $uploadedFileName);
            $cleanTitle = trim($cleanTitle);

            // Determine file type based on event name
            $isSymposium = stripos($eventName, 'Symposium') !== false;
            $isInHouse = stripos($eventName, 'In-House Review') !== false ||
                stripos($eventName, 'In House Review') !== false ||
                stripos($eventName, 'In-house Review') !== false;

            $baseFileName = '';
            if ($isSymposium) {
                $baseFileName = 'Revised Paper';
            } elseif ($isInHouse) {
                $baseFileName = 'Revised Proposal';
            } else {
                $baseFileName = 'Revised Document';
            }

            // Build filename using the uploaded file's title
            $newFileName = $baseFileName . ' v' . $revisionCount . ' - ' . $cleanTitle . $extension;

            $driveResult = $driveService->uploadFile($_FILES['researchDoc']['tmp_name'], $newFileName, $targetFolderId);

            if (!$driveResult['success']) {
                throw new Exception("Drive upload failed: " . ($driveResult['error'] ?? 'Unknown error'));
            }

            $driveService->makeFilePublic($driveResult['id']);
            $newFileId = $driveResult['id'];
            $newViewUrl = "https://drive.google.com/file/d/{$newFileId}/preview";
            $newDownloadUrl = "https://drive.google.com/uc?id={$newFileId}&export=download";

            error_log("New file uploaded: ID = $newFileId, URL = $newViewUrl");

            // 3. Update database
            $updateQuery = "UPDATE researchfile SET 
                revision_status = 'revision_submitted',
                revision_count = ?,
                last_revision_date = NOW(),
                revised_file_id = ?,
                revised_drive_view_url = ?,
                revised_drive_download_url = ?,
                drive_file_id = ?,
                drive_view_url = ?,
                drive_download_url = ?,
                resubmitted = 1,
                status = NULL
                WHERE id = ?";

            $updateStmt = $con->prepare($updateQuery);
            $updateStmt->bind_param(
                "issssssi",
                $revisionCount,
                $newFileId,
                $newViewUrl,
                $newDownloadUrl,
                $newFileId,
                $newViewUrl,
                $newDownloadUrl,
                $researchId
            );

            if ($updateStmt->execute()) {
                $response->status = true;
                $response->message = "Revision submitted successfully! Your document is now under review.";
                $response->revision_count = $revisionCount;

                // Update endorsement status to NULL to reset review process
                $endorsementId = $doc['endorsementid'];
                if ($endorsementId) {
                    $updateEndorseQuery = "UPDATE endorsement SET status = NULL WHERE id = ?";
                    $endorseStmt = $con->prepare($updateEndorseQuery);
                    $endorseStmt->bind_param("i", $endorsementId);
                    $endorseStmt->execute();
                    $endorseStmt->close();
                    error_log("Endorsement status reset to NULL for ID: $endorsementId");
                }

                // Track update in document log
                $logQuery = "INSERT INTO document_log (user_id, doc_id, details, date) VALUES (?, ?, ?, NOW())";
                $logStmt = $con->prepare($logQuery);
                $details = "User submitted revision #$revisionCount for document: " . $doc['title'] . " | File: " . $newFileName;
                $logStmt->bind_param("iss", $userId, $researchId, $details);
                $logStmt->execute();
                $logStmt->close();

                error_log("Revision submitted successfully for research ID: $researchId, revision count: $revisionCount");

            } else {
                throw new Exception("Database update failed: " . $updateStmt->error);
            }

        } catch (Exception $e) {
            error_log("Revision submission failed: " . $e->getMessage());
            $response->message = "Error: " . $e->getMessage();
        }
    } else {
        $response->message = "Database connection error.";
    }

    header('Content-Type: application/json');
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

                $sessionUserId = $_SESSION['userId'] ?? 0;
                $logStmt->bind_param("sss", $sessionUserId, $docId, $details);
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