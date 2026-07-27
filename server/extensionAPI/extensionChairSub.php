<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../drive_errors.log');

header('Content-Type: application/json; charset=utf-8');

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

require_once __DIR__ . '/..//Mailer/mailTemplate.php';
require_once __DIR__ . '/..//Mailer/MailSender.php';
date_default_timezone_set('Asia/Manila');

//for symposium
function uploadResearchToDrive($tempFilePath, $fileName, $eventName, $centerName, $category, $author, $title, $type = 'research', $isProgram = false, $isEndorsement = false, $isCertificate = false, $isLocalInHouse = false, $paperTrailNo = null, $createPerResearchFolder = false, $campus = null, $existingEntryFolderId = null)
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
        $cleanCategoryName = cleanFolderNameForDrive($category);
        
        // For Extension, we use campus instead of center
        $cleanCampusName = !empty($campus) ? cleanFolderNameForDrive($campus) : null;

        $authorParts = explode(' ', trim($author));
        $authorLastName = end($authorParts);
        $authorLastName = cleanFolderNameForDrive($authorLastName);

        $targetFolderId = null;
        $prefixedFileName = '';
        $entryFolderId = null;
        $entryFolderName = null;
        $eventFolderId = null;
        $extensionFolderId = null;
        $campusFolderId = null;
        $categoryFolderId = null;

        // If an existing entry folder ID is provided, use it directly
        if ($existingEntryFolderId !== null && !empty($existingEntryFolderId)) {
            error_log("Using existing entry folder ID: $existingEntryFolderId for $type file");
            $entryFolderId = $existingEntryFolderId;
            $targetFolderId = $entryFolderId;
        } else {
            // Create folder structure: Event -> Extension (Extension) -> Campus
            $eventFolderId = $drive->findOrCreateFolder($cleanEventName, null);
            if (!$eventFolderId)
                throw new Exception("Failed to create event folder");

            // Extension folder (acts as center/category)
            $extensionFolderId = $drive->findOrCreateFolder('Extension (Extension)', $eventFolderId);
            if (!$extensionFolderId)
                throw new Exception("Failed to create Extension folder");

            // Campus folder
            if (!empty($cleanCampusName)) {
                $campusFolderId = $drive->findOrCreateFolder($cleanCampusName, $extensionFolderId);
                if (!$campusFolderId)
                    throw new Exception("Failed to create campus folder: $cleanCampusName");
            } else {
                $campusFolderId = $extensionFolderId;
            }

            // For Extension, create per-research folder inside Campus: {author last name} - {title keywords}
            if ($createPerResearchFolder) {
                // Get keywords from title for folder name (first 3 words)
                $titleWords = explode(' ', trim($title));
                $titleKeywords = implode('_', array_slice($titleWords, 0, 3));
                $titleKeywords = cleanFolderNameForDrive($titleKeywords);

                // Create entry folder name: {author last name} - {title keywords}
                $entryFolderName = $authorLastName . ' - ' . $titleKeywords;
                $entryFolderName = cleanFolderNameForDrive($entryFolderName);

                // Create entry folder inside Campus folder
                $entryFolderId = $drive->findOrCreateFolder($entryFolderName, $campusFolderId);
                if (!$entryFolderId)
                    throw new Exception("Failed to create entry folder: $entryFolderName");

                $targetFolderId = $entryFolderId;
            } else {
                $targetFolderId = $campusFolderId;
            }
        }

        if (empty($targetFolderId)) {
            throw new Exception("Failed to determine target folder");
        }

        // Generate filename based on file type
        $cleanEventForFilename = preg_replace('/[^\w\s\-]/', '', $eventName);
        $cleanEventForFilename = preg_replace('/\s+/', '_', $cleanEventForFilename);
        
        $cleanTitle = preg_replace('/[^\w\s\-]/', '', $title);
        $cleanTitle = preg_replace('/\s+/', '_', $cleanTitle);
        if (strlen($cleanTitle) > 80) {
            $cleanTitle = substr($cleanTitle, 0, 77) . '...';
        }
        
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
            'drive_extension_folder_id' => $extensionFolderId,
            'drive_campus_folder_id' => $campusFolderId,
            'drive_category_folder_id' => $extensionFolderId,
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

function uploadExtensionToDrive($tempFilePath, $fileName, $eventName, $campus, $author, $title, $type = 'research', $isProgram = false, $isEndorsement = false, $isCertificate = false, $existingEntryFolderId = null)
{
    try {
        if (!file_exists($tempFilePath)) {
            throw new Exception("Temporary file not found: $tempFilePath");
        }

        $drive = new GoogleDriveService();
        
        // Store folder IDs for return
        $eventFolderId = null;
        $extensionFolderId = null;
        $campusFolderId = null;
        $entryFolderId = null;
        
        // If an existing entry folder ID is provided, use it directly
        if ($existingEntryFolderId !== null && !empty($existingEntryFolderId)) {
            error_log("Using existing entry folder ID: $existingEntryFolderId for $type file");
            $entryFolderId = $existingEntryFolderId;
        } else {
            // Create folder structure
            $cleanEventName = cleanFolderNameForDrive($eventName);
            $cleanCampus = cleanFolderNameForDrive($campus);
            
            $authorParts = explode(' ', trim($author));
            $authorLastName = end($authorParts);
            $cleanAuthor = cleanFolderNameForDrive($authorLastName);
            
            $titleWords = explode(' ', trim($title));
            $titleKeywords = implode('_', array_slice($titleWords, 0, 4));
            $cleanKeywords = cleanFolderNameForDrive($titleKeywords);
            
            $entryFolderName = $cleanAuthor . ' - ' . $cleanKeywords;
            
            // Create folder structure
            $eventFolderId = $drive->findOrCreateFolder($cleanEventName, null);
            if (!$eventFolderId) throw new Exception("Failed to create event folder");
            
            $extensionFolderId = $drive->findOrCreateFolder('Extension (Extension)', $eventFolderId);
            if (!$extensionFolderId) throw new Exception("Failed to create Extension folder");
            
            $campusFolderId = $drive->findOrCreateFolder($cleanCampus, $extensionFolderId);
            if (!$campusFolderId) throw new Exception("Failed to create campus folder");
            
            $entryFolderId = $drive->findOrCreateFolder($entryFolderName, $campusFolderId);
            if (!$entryFolderId) throw new Exception("Failed to create entry folder");
            
            error_log("Created new folder structure: $cleanEventName / Extension (Extension) / $cleanCampus / $entryFolderName");
        }
        
        // Generate filename
        $cleanEventForFilename = preg_replace('/[^\w\s\-]/', '', $eventName);
        $cleanEventForFilename = preg_replace('/\s+/', '_', $cleanEventForFilename);
        
        $cleanTitle = preg_replace('/[^\w\s\-]/', '', $title);
        $cleanTitle = preg_replace('/\s+/', '_', $cleanTitle);
        if (strlen($cleanTitle) > 80) {
            $cleanTitle = substr($cleanTitle, 0, 77) . '...';
        }
        
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
        
        error_log("Uploading $type file: $prefixedFileName to folder: $entryFolderId");
        $uploadResult = $drive->uploadFile($tempFilePath, $prefixedFileName, $entryFolderId);
        
        if (!$uploadResult['success'] || empty($uploadResult['id'])) {
            throw new Exception($uploadResult['error'] ?? "Upload failed");
        }
        
        $drive->makeFilePublic($uploadResult['id']);
        
        // Return ALL the folder IDs that the main code expects
        return [
            'success' => true,
            'drive_file_id' => $uploadResult['id'],
            'drive_view_url' => "https://drive.google.com/file/d/{$uploadResult['id']}/preview",
            'drive_download_url' => "https://drive.google.com/uc?id={$uploadResult['id']}&export=download",
            'drive_entry_folder_id' => $entryFolderId,
            // Add missing folder IDs that the main code expects
            'drive_event_folder_id' => $eventFolderId,
            'drive_extension_folder_id' => $extensionFolderId,
            'drive_category_folder_id' => $extensionFolderId, // Extension folder acts as category
            'drive_campus_folder_id' => $campusFolderId
        ];
        
    } catch (Exception $e) {
        error_log("Extension upload failed for $type file: " . $e->getMessage());
        throw $e;
    }
}
function cleanFolderNameForDrive($name)
{
    // If input is empty, return a default
    if (empty($name) || trim($name) === '') {
        return 'General';
    }

    // Remove special characters that Google Drive doesn't like
    $clean = preg_replace('/[^\w\s\-_.,()&]/', '', $name);

    // Replace multiple spaces with single space
    $clean = preg_replace('/\s+/', ' ', $clean);

    // Trim whitespace
    $clean = trim($clean);

    // Remove trailing periods and commas
    $clean = rtrim($clean, '.,');

    // If after cleaning the string is empty, use a sanitized version of the original
    if (empty($clean)) {
        // Replace problematic characters with underscore
        $clean = preg_replace('/[^a-zA-Z0-9]/', '_', $name);
        $clean = trim($clean, '_');
        
        // If still empty, use a default with timestamp
        if (empty($clean)) {
            $clean = 'Folder_' . time();
        }
    }

    // If too long, truncate (Google Drive has 255 char limit)
    if (strlen($clean) > 200) {
        $clean = substr($clean, 0, 197) . '...';
    }

    return $clean;
}

function getResearchFileUrl($researchRecord)
{
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
//Generate a hash for file content to detect identical files even with different names
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
    // Store a scoped hash per event so identical files in different events do not conflict.
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
    // Center to code mapping - EXTENSION uses 'H'
    $centerCodes = [
        'Extension (Extension)' => 'H',
        'Extension' => 'H'  // Also handle 'Extension' without parentheses
    ];

    // DEBUG: Log what center is being passed
    error_log("generatePaperTrailNumber received center: '$center'");
    
    // Normalize center name
    $normalizedCenter = trim($center);
    if ($normalizedCenter === 'Extension') {
        $normalizedCenter = 'Extension (Extension)';
    }
    
    // Get center code
    if (!isset($centerCodes[$normalizedCenter])) {
        error_log("ERROR: Center '$center' not found in mapping. Available keys: " . implode(', ', array_keys($centerCodes)));
        throw new Exception("Invalid center: '$center'. Only 'Extension (Extension)' is allowed.");
    }
    
    $centerCode = $centerCodes[$normalizedCenter]; // This should be 'H'
    error_log("Using center code: $centerCode for center: $normalizedCenter");

    // FIRST: Check if this research already has a paper trail number
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

    // If existing paper trail number found, return it
    if ($existingPaper && !empty($existingPaper['paper_trail_no'])) {
        error_log("Found existing paper trail number: " . $existingPaper['paper_trail_no']);
        return $existingPaper['paper_trail_no'];
    }

    // Get event year
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

    // Get the next sequence number for this year and center
    $pattern = $eventYear . '-' . $centerCode . '-%';
    error_log("Looking for pattern: $pattern");

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

    // Generate the paper trail number (format: YYYY-H-XXX)
    $paperTrailNo = $eventYear . '-' . $centerCode . '-' . $formattedSeq;
    
    error_log("Generated paper trail number: $paperTrailNo");

    $seqStmt->close();
    $checkStmt->close();

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
            } elseif ($type === 'program') {
                $paperTrailFileName = 'program_file.pdf';
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
//symposium
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
        
        // Common symposium fields - for Extension, center may be null
        $category = isset($_POST['category']) ? trim($_POST['category']) : 'Extension';
        $center = isset($_POST['center']) && !empty($_POST['center']) ? trim($_POST['center']) : null;
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
            $localCategory = isset($_POST['local_category']) ? trim($_POST['local_category']) : 'Extension';
            $localCenter = isset($_POST['local_center']) && !empty($_POST['local_center']) ? trim($_POST['local_center']) : null;
            $localAuthor = isset($_POST['local_author']) ? trim($_POST['local_author']) : '';
            $localPresenter = isset($_POST['local_presenter']) ? trim($_POST['local_presenter']) : '';
            $localCoAuthors = isset($_POST['local_coAuthors']) ? $_POST['local_coAuthors'] : '[]';

            if (empty($localTitle) || empty($localAuthor)) {
                throw new Exception("Local In-House title and author are required");
            }

            // Generate paper trail number - pass 'Extension (Extension)' if center is null
            $centerForPaperTrail = !empty($localCenter) ? $localCenter : 'Extension (Extension)';
            $paperTrailNo = generatePaperTrailNumber($con, $eventId, $centerForPaperTrail, $localTitle, $localAuthor);
            $currentYear = date('Y');

            // Clean names for folder creation
            $cleanEventName = cleanFolderNameForDrive($eventType);
            $cleanCategoryName = cleanFolderNameForDrive($localCategory);
            $cleanCampusName = cleanFolderNameForDrive($localCampus);
            $cleanLocalTitle = cleanFolderNameForDrive($localTitle);
            $authorParts = explode(' ', trim($localAuthor));
            $authorLastName = end($authorParts);
            $authorLastName = cleanFolderNameForDrive($authorLastName);

            // ===== FOLDER STRUCTURE: Event -> Extension -> Campus -> Entry Folder =====
            // Step 1: Create Event folder
            $eventFolderId = $drive->findOrCreateFolder($cleanEventName, null);
            if (!$eventFolderId) throw new Exception("Failed to create event folder: $cleanEventName");

            // Step 2: Create Extension folder inside Event
            $extensionFolderId = $drive->findOrCreateFolder('Extension', $eventFolderId);
            if (!$extensionFolderId) throw new Exception("Failed to create Extension folder");

            // Step 3: Create Campus folder inside Extension
            $campusFolderId = $drive->findOrCreateFolder($cleanCampusName, $extensionFolderId);
            if (!$campusFolderId) throw new Exception("Failed to create campus folder: $cleanCampusName");

            // Step 4: Create Entry folder inside Campus: {author last name} - {title keywords}
            $titleWords = explode(' ', trim($localTitle));
            $titleKeywords = implode('_', array_slice($titleWords, 0, 3));
            $titleKeywords = cleanFolderNameForDrive($titleKeywords);
            $entryFolderName = $authorLastName . ' - ' . $titleKeywords;
            $entryFolderId = $drive->findOrCreateFolder($entryFolderName, $campusFolderId);
            if (!$entryFolderId) throw new Exception("Failed to create entry folder: $entryFolderName");
            
            // ===== STEP 1: UPLOAD SYMPOSIUM FILES TO ENTRY FOLDER =====
            // Upload Symposium Research File
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
            $drive_center_folder_id = null;
            $endorsementStmt->bind_param(
                'issssssssssss',
                $senderId,
                $center,
                $campus,
                $endorsementDriveFileId,
                $endorsementDriveViewUrl,
                $endorsementDriveDownloadUrl,
                $eventFolderId,
                $drive_center_folder_id,
                $extensionFolderId,
                $entryFolderId,
                $eventType,
                $endorsementStatus,
                $defaultTime
            );
            
            if (!$endorsementStmt->execute()) {
                throw new Exception("Failed to save endorsement: " . $endorsementStmt->error);
            }
            
            $endorsementId = $con->insert_id;
            
            // ===== STEP 2: TITLE CHANGE CERTIFICATE =====
            $titleCertificateViewUrl = null;
            $titleCertificateDownloadUrl = null;
            $titleCertificatePaperTrailResult = null;
            $titleCertificateDriveFileId = null;

            if ($title_changed && isset($_FILES['titleCertificateFile']) && $_FILES['titleCertificateFile']['error'] === UPLOAD_ERR_OK) {
                $tempCertificatePath = $_FILES['titleCertificateFile']['tmp_name'];
                $cleanLocalTitle = cleanFolderNameForDrive($localTitle);
                $titleCertificateName = $cleanLocalTitle . ' - certificate of title change.pdf';
                
                // ===== UPLOAD TO ENTRY FOLDER =====
                $certificateUploadResult = $drive->uploadFile($tempCertificatePath, $titleCertificateName, $entryFolderId);
                if ($certificateUploadResult['success']) {
                    $drive->makeFilePublic($certificateUploadResult['id']);
                    $titleCertificateDriveFileId = $certificateUploadResult['id'];
                    $titleCertificateViewUrl = "https://drive.google.com/file/d/{$titleCertificateDriveFileId}/preview";
                    $titleCertificateDownloadUrl = "https://drive.google.com/uc?id={$titleCertificateDriveFileId}&export=download";
                    error_log("Title certificate uploaded to entry folder: ID = $titleCertificateDriveFileId");
                } else {
                    error_log("Failed to upload title certificate: " . ($certificateUploadResult['error'] ?? 'Unknown error'));
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
                
                // ===== UPLOAD TO PAPER TRAIL =====
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
                    $existingResearchFolderId
                );
                
                if ($titleCertificatePaperTrailResult && $titleCertificatePaperTrailResult['success']) {
                    error_log("Title certificate uploaded to Paper Trail successfully");
                } else {
                    error_log("Failed to upload title certificate to Paper Trail: " . ($titleCertificatePaperTrailResult['error'] ?? 'Unknown error'));
                }
            }
            
            // ===== STEP 3: INSERT INTO researchfile TABLE =====
            $rev = 'pending';
            $originalTitle = isset($_POST['original_title']) ? trim($_POST['original_title']) : $localTitle;
            $localInhouseFlag = 1;
            $researchDriveDownloadUrl = "https://drive.google.com/uc?id={$researchDriveFileId}&export=download";
            
            $researchQuery = "INSERT INTO researchfile(
                paper_trail_no, senderid, endorsementid, event_id, author, coauthor, presenter,
                date_started, date_completed, title, final_symposium_title, event, status,
                category, center, campus, title_changed, local_inhouse,
                drive_file_id, drive_view_url, drive_download_url,
                drive_folder_id, drive_event_folder_id, drive_center_folder_id, 
                drive_category_folder_id, drive_entry_folder_id, drive_campus_folder_id, 
                title_certificate_view_url, title_certificate_download_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $researchStmt = $con->prepare($researchQuery);
            $drive_center_folder_id = null;
            $researchStmt->bind_param(
                'siiissssssssssssissssssssssss',
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
                $drive_center_folder_id, 
                $drive_campus_folder_id,
                $extensionFolderId,
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
                
                // Upload to Campus folder (not entry folder)
                $programUploadResult = $drive->uploadFile($tempProgramPath, $programFileName, $campusFolderId);
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
            
            if (isset($_FILES['certificateFile']) && $_FILES['certificateFile']['error'] === UPLOAD_ERR_OK) {
                $tempCertificatePath = $_FILES['certificateFile']['tmp_name'];
                $localCertificateFileName = 'Local In-House Certificate - ' . $cleanLocalTitle . '.pdf';
                
                // Upload to Campus folder (not entry folder)
                $certificateUploadResult = $drive->uploadFile($tempCertificatePath, $localCertificateFileName, $campusFolderId);
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
            
            if ($titleCertificatePaperTrailResult && $titleCertificatePaperTrailResult['success']) {
                savePaperTrailRecord($con, $researchId, $paperTrailNo, $currentYear, 'Symposium', $titleCertificatePaperTrailResult);
            }
            
            if ($programPaperTrailResult && $programPaperTrailResult['success']) {
                savePaperTrailRecord($con, $researchId, $paperTrailNo, $currentYear, 'Local In-House Review', $programPaperTrailResult);
            }
            
            if ($localCertificatePaperTrailResult && $localCertificatePaperTrailResult['success']) {
                savePaperTrailRecord($con, $researchId, $paperTrailNo, $currentYear, 'Local In-House Review', $localCertificatePaperTrailResult);
            }
            
        } else {
            // ===== UNIVERSITY SYMPOSIUM SUBMISSION =====
            $originalTitle = isset($_POST['original_title']) ? trim($_POST['original_title']) : '';
            $selectedInhouseId = isset($_POST['selected_inhouse_id']) ? (int) $_POST['selected_inhouse_id'] : null;
            $currentYear = date('Y');
            
            if (empty($originalTitle) || empty($author) || empty($category) || empty($campus) || empty($presenter)) {
                throw new Exception("Missing required fields for Symposium submission");
            }
            
            // Generate paper trail number - pass 'Extension (Extension)' if center is null
            $centerForPaperTrail = !empty($center) ? $center : 'Extension (Extension)';
            $paperTrailNo = generatePaperTrailNumber($con, $eventId, $centerForPaperTrail, $originalTitle, $author);
            
            // Clean names for folder creation
            $cleanEventName = cleanFolderNameForDrive($eventType);
            $cleanCategoryName = cleanFolderNameForDrive($category);
            $cleanCampusName = cleanFolderNameForDrive($campus);
            $authorParts = explode(' ', trim($author));
            $authorLastName = end($authorParts);
            $authorLastName = cleanFolderNameForDrive($authorLastName);
            
            // Get keywords from title for folder name
            $titleWords = explode(' ', trim($originalTitle));
            $titleKeywords = implode('_', array_slice($titleWords, 0, 3));
            $titleKeywords = cleanFolderNameForDrive($titleKeywords);
            
            // Create entry folder name: {author last name} - {title keywords}
            $entryFolderName = $authorLastName . ' - ' . $titleKeywords;
            
            // ===== FOLDER STRUCTURE: Event -> Extension -> Campus -> Entry Folder =====
            // Step 1: Create Event folder
            $eventFolderId = $drive->findOrCreateFolder($cleanEventName, null);
            if (!$eventFolderId) throw new Exception("Failed to create event folder: $cleanEventName");

            // Step 2: Create Extension folder inside Event
            $extensionFolderId = $drive->findOrCreateFolder('Extension', $eventFolderId);
            if (!$extensionFolderId) throw new Exception("Failed to create Extension folder");

            // Step 3: Create Campus folder inside Extension
            $campusFolderId = $drive->findOrCreateFolder($cleanCampusName, $extensionFolderId);
            if (!$campusFolderId) throw new Exception("Failed to create campus folder: $cleanCampusName");

            // Step 4: Create Entry folder inside Campus: {author last name} - {title keywords}
            $entryFolderId = $drive->findOrCreateFolder($entryFolderName, $campusFolderId);
            if (!$entryFolderId) throw new Exception("Failed to create entry folder: $entryFolderName");
            
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
            $drive_center_folder_id = null;
            $endorsementStmt->bind_param(
                'issssssssssss',
                $senderId,
                $center,
                $campus,
                $endorsementDriveFileId,
                $endorsementDriveViewUrl,
                $endorsementDriveDownloadUrl,
                $eventFolderId,
                $drive_center_folder_id,
                $extensionFolderId,
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
                    error_log("University title certificate uploaded to entry folder: ID = $titleCertificateDriveFileId");
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
                
                // ===== UPLOAD TO PAPER TRAIL =====
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
                    $existingResearchFolderId
                );
                
                if ($titleCertificatePaperTrailResult && $titleCertificatePaperTrailResult['success']) {
                    error_log("University title certificate uploaded to Paper Trail successfully");
                } else {
                    error_log("Failed to upload title certificate to Paper Trail: " . ($titleCertificatePaperTrailResult['error'] ?? 'Unknown error'));
                }
            }
            
            $rev = 'pending';
            $researchQuery = "INSERT INTO researchfile(
                paper_trail_no, senderid, endorsementid, event_id, author, coauthor, presenter,
                date_started, date_completed, title, final_symposium_title, event, status,
                category, center, campus, drive_file_id, drive_view_url, drive_download_url,
                drive_folder_id, drive_event_folder_id, drive_center_folder_id, drive_campus_folder_id,
                drive_category_folder_id, drive_entry_folder_id, title_changed,
                title_certificate_view_url, title_certificate_download_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $researchStmt = $con->prepare($researchQuery);
            $researchDriveDownloadUrl = "https://drive.google.com/uc?id={$researchDriveFileId}&export=download";
            $drive_center_folder_id = null;
            $researchStmt->bind_param(
                'siiissssssssssssssssssssisss',
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
                $drive_center_folder_id,
                $drive_campus_folder_id,
                $extensionFolderId,
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
            
            // Save Paper Trail records for university symposium
            if ($researchPaperTrailResult && $researchPaperTrailResult['success']) {
                savePaperTrailRecord($con, $researchId, $paperTrailNo, $currentYear, 'Symposium', $researchPaperTrailResult);
            }
            
            if ($endorsementPaperTrailResult && $endorsementPaperTrailResult['success']) {
                savePaperTrailRecord($con, $researchId, $paperTrailNo, $currentYear, 'Symposium', $endorsementPaperTrailResult);
            }
            
            if ($titleCertificatePaperTrailResult && $titleCertificatePaperTrailResult['success']) {
                savePaperTrailRecord($con, $researchId, $paperTrailNo, $currentYear, 'Symposium', $titleCertificatePaperTrailResult);
            }
            
            $response->local_inhouse_id = null;
        }

        $con->commit();
        $response->status = true;
        $response->success = true;
        $response->message = "Symposium submission successful! Files have been saved to: $eventType -> Extension -> $campus -> $entryFolderName";
        
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
function savePaperTrailRecord($con, $researchId, $paperTrailNo, $year, $submissionType, $paperTrailResult)
{
    if (!$paperTrailResult || !$paperTrailResult['success']) {
        return false;
    }

    $query = "INSERT INTO paper_trail_files (
        research_id, paper_trail_no, submission_type, year,
        paper_trail_root_id, submission_folder_id, year_folder_id,
        research_folder_id, research_folder_name,
        researchfile_drive_view_url, researchfile_drive_download_url,
        endorsement_drive_view_url, endorsement_drive_download_url,
        program_drive_view_url, program_drive_download_url,
        certificate_drive_view_url, certificate_drive_download_url,
        title_certificate_view_url, title_certificate_download_url,
        created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

    $stmt = $con->prepare($query);
    if (!$stmt) {
        error_log("Failed to prepare paper_trail_files insert: " . $con->error);
        return false;
    }

    // Extract URLs based on file type
    $researchViewUrl = isset($paperTrailResult['researchfile_drive_view_url']) ? $paperTrailResult['researchfile_drive_view_url'] : null;
    $researchDownloadUrl = isset($paperTrailResult['researchfile_drive_download_url']) ? $paperTrailResult['researchfile_drive_download_url'] : null;
    $endorsementViewUrl = isset($paperTrailResult['endorsement_drive_view_url']) ? $paperTrailResult['endorsement_drive_view_url'] : null;
    $endorsementDownloadUrl = isset($paperTrailResult['endorsement_drive_download_url']) ? $paperTrailResult['endorsement_drive_download_url'] : null;
    $programViewUrl = isset($paperTrailResult['program_drive_view_url']) ? $paperTrailResult['program_drive_view_url'] : null;
    $programDownloadUrl = isset($paperTrailResult['program_drive_download_url']) ? $paperTrailResult['program_drive_download_url'] : null;
    $certificateViewUrl = isset($paperTrailResult['certificate_drive_view_url']) ? $paperTrailResult['certificate_drive_view_url'] : null;
    $certificateDownloadUrl = isset($paperTrailResult['certificate_drive_download_url']) ? $paperTrailResult['certificate_drive_download_url'] : null;
    $titleCertificateViewUrl = isset($paperTrailResult['title_certificate_view_url']) ? $paperTrailResult['title_certificate_view_url'] : null;
    $titleCertificateDownloadUrl = isset($paperTrailResult['title_certificate_download_url']) ? $paperTrailResult['title_certificate_download_url'] : null;

    $stmt->bind_param(
        'issssssssssssssssss',
        $researchId,
        $paperTrailNo,
        $submissionType,
        $year,
        $paperTrailResult['paper_trail_root_id'],
        $paperTrailResult['sub_type_folder_id'],
        $paperTrailResult['year_folder_id'],
        $paperTrailResult['research_folder_id'],
        $paperTrailResult['research_folder_name'],
        $researchViewUrl,
        $researchDownloadUrl,
        $endorsementViewUrl,
        $endorsementDownloadUrl,
        $programViewUrl,
        $programDownloadUrl,
        $certificateViewUrl,
        $certificateDownloadUrl,
        $titleCertificateViewUrl,
        $titleCertificateDownloadUrl
    );

    $result = $stmt->execute();
    if (!$result) {
        error_log("Failed to insert paper_trail_files record: " . $stmt->error);
    }
    $stmt->close();
    return $result;
}
//in house
function uploadInHouseToPaperTrail($tempFilePath, $fileName, $eventName, $author, $title, $type, $isProgram, $isEndorsement, $isCertificate, $paperTrailNo = null, $sourceFileId = null)
{
    try {
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

        // Paper Trail structure: Paper Trail -> In-House Review -> Year -> {paper_trail_no} - {Title}
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

        // Determine file name for Paper Trail
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

        // USE COPY INSTEAD OF UPLOAD if sourceFileId is provided
        if ($sourceFileId) {
            error_log("Paper Trail: Copying file $sourceFileId to folder $researchFolderId as $paperTrailFileName");
            $copyResult = $drive->copyFile($sourceFileId, $researchFolderId, $paperTrailFileName);
            
            if (!$copyResult['success']) {
                // If copy fails, fallback to upload
                error_log("Copy failed, falling back to upload: " . ($copyResult['error'] ?? 'Unknown error'));
                if (!file_exists($tempFilePath)) {
                    return ['success' => false, 'error' => "Temporary file not found for fallback upload: $tempFilePath"];
                }
                $uploadResult = $drive->uploadFile($tempFilePath, $paperTrailFileName, $researchFolderId);
                if (!$uploadResult['success'] || empty($uploadResult['id'])) {
                    return ['success' => false, 'error' => $uploadResult['error'] ?? 'Upload failed'];
                }
                $fileId = $uploadResult['id'];
            } else {
                $fileId = $copyResult['id'];
            }
        } else {
            // No source file ID, do normal upload
            if (!file_exists($tempFilePath)) {
                return ['success' => false, 'error' => "Temporary file not found: $tempFilePath"];
            }
            $uploadResult = $drive->uploadFile($tempFilePath, $paperTrailFileName, $researchFolderId);
            if (!$uploadResult['success'] || empty($uploadResult['id'])) {
                return ['success' => false, 'error' => $uploadResult['error'] ?? 'Upload failed'];
            }
            $fileId = $uploadResult['id'];
        }

        $drive->makeFilePublic($fileId);

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
        error_log("In-House Paper Trail failed: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

if (isset($_POST['uploadResearch'])) {
    ob_end_clean();
    ob_start();
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
    set_time_limit(300);
    
    $senderId = $_SESSION['userId'];
    $response = new stdClass();
    $response->message = '';
    $response->status = false;
    $response->paper_trail_results = [];
    
    try {
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            if ($con->connect_error) {
                throw new Exception("Database connection failed: " . $con->connect_error);
            }
            
            // Get POST data with validation
            $eventType = trim($_POST['eventType'] ?? '');
            $title = trim($_POST['title'] ?? '');
            $author = trim($_POST['author'] ?? '');
            $campus = trim($_POST['campus'] ?? '');
            $coAuthor = $_POST['coAuthor'] ?? '[]';
            $presenter = trim($_POST['presenter'] ?? '');
            $category = 'Extension';
            $center = null;
            
            // Validate required fields
            $errors = [];
            if (empty($eventType)) $errors[] = "Event name is required";
            if (empty($title)) $errors[] = "Title is required";
            if (empty($author)) $errors[] = "Author is required";
            if (empty($campus)) $errors[] = "Campus is required";
            
            if (!empty($errors)) {
                throw new Exception("Missing required fields: " . implode(", ", $errors));
            }
            
            // Get event_id
            $eventId = null;
            $eventStmt = $con->prepare("SELECT id FROM event_list WHERE name = ? LIMIT 1");
            $eventStmt->bind_param("s", $eventType);
            $eventStmt->execute();
            $eventResult = $eventStmt->get_result();
            $eventRow = $eventResult->fetch_assoc();
            $eventId = $eventRow ? $eventRow['id'] : null;
            $eventStmt->close();
            
            // Generate paper trail number FIRST (needed for Paper Trail folders)
            $paperTrailNo = generatePaperTrailNumber($con, $eventId, 'Extension (Extension)', $title, $author);
            error_log("Paper Trail Number: $paperTrailNo");
            
            // ========== 1. UPLOAD ENDORSEMENT FILE ==========
            if (!isset($_FILES['uploadedFileEndorsement']) || $_FILES['uploadedFileEndorsement']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('Endorsement letter is required');
            }
            
            $tempEndorsementPath = $_FILES['uploadedFileEndorsement']['tmp_name'];
            $endorsementFileName = $_FILES['uploadedFileEndorsement']['name'];
            
            $endorsementDriveResult = uploadExtensionToDrive(
                $tempEndorsementPath,
                $endorsementFileName,
                $eventType,
                $campus,
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
            
            // Upload endorsement to Paper Trail
            $endorsementPaperTrailResult = uploadInHouseToPaperTrail(
                $tempEndorsementPath,
                $endorsementFileName,
                $eventType,
                $author,
                $title,
                'endorsement',
                false,      // isProgram
                true,       // isEndorsement
                false,      // isCertificate
                $paperTrailNo,
                $endorsementDriveResult['drive_file_id']
            );
            
            // Get folder IDs from first upload
            $entryFolderId = $endorsementDriveResult['drive_entry_folder_id'];
            $eventFolderId = $endorsementDriveResult['drive_event_folder_id'];
            $extensionFolderId = $endorsementDriveResult['drive_extension_folder_id'];
            $campusFolderId = $endorsementDriveResult['drive_campus_folder_id'];
            
            
            // ========== 2. UPLOAD RESEARCH FILE ==========
            $tempResearchPath = $_FILES['researchDoc']['tmp_name'];
            $researchFileName = $_FILES['researchDoc']['name'];
            
            $researchDriveResult = uploadExtensionToDrive(
                $tempResearchPath,
                $researchFileName,
                $eventType,
                $campus,
                $author,
                $title,
                'research',
                false,
                false,
                false,
                $entryFolderId
            );
            
            if (!$researchDriveResult['success']) {
                throw new Exception("Research upload failed: " . ($researchDriveResult['error'] ?? 'Unknown error'));
            }
            
            // Upload research to Paper Trail
            $researchPaperTrailResult = uploadInHouseToPaperTrail(
                $tempResearchPath,
                $researchFileName,
                $eventType,
                $author,
                $title,
                'research',
                false,      // isProgram
                false,      // isEndorsement
                false,      // isCertificate
                $paperTrailNo,
                $researchDriveResult['drive_file_id']
            );
            
            // ========== 3. UPLOAD PROGRAM FILE ==========
            $tempProgramPath = $_FILES['programFile']['tmp_name'];
            $programFileName = $_FILES['programFile']['name'];
            
            $programDriveResult = uploadExtensionToDrive(
                $tempProgramPath,
                $programFileName,
                $eventType,
                $campus,
                $author,
                $title,
                'program',
                true,
                false,
                false,
                $entryFolderId
            );
            
            if (!$programDriveResult['success']) {
                throw new Exception("Program upload failed: " . ($programDriveResult['error'] ?? 'Unknown error'));
            }
            
            // Upload program to Paper Trail
            $programPaperTrailResult = uploadInHouseToPaperTrail(
                $tempProgramPath,
                $programFileName,
                $eventType,
                $author,
                $title,
                'program',
                true,       // isProgram
                false,      // isEndorsement
                false,      // isCertificate
                $paperTrailNo,
                $programDriveResult['drive_file_id']
            );
            
            // ========== 4. UPLOAD CERTIFICATE FILE ==========
            $certificateDriveResult = null;
            $certificatePaperTrailResult = null;
            
            if (isset($_FILES['certificateFile']) && $_FILES['certificateFile']['error'] === UPLOAD_ERR_OK) {
                $tempCertificatePath = $_FILES['certificateFile']['tmp_name'];
                $certificateFileName = $_FILES['certificateFile']['name'];
                
                $certificateDriveResult = uploadExtensionToDrive(
                    $tempCertificatePath,
                    $certificateFileName,
                    $eventType,
                    $campus,
                    $author,
                    $title,
                    'certificate',
                    false,
                    false,
                    true,
                    $entryFolderId
                );
                
                if ($certificateDriveResult && $certificateDriveResult['success']) {
                    $certificatePaperTrailResult = uploadInHouseToPaperTrail(
                        $tempCertificatePath,
                        $certificateFileName,
                        $eventType,
                        $author,
                        $title,
                        'certificate',
                        false,      // isProgram
                        false,      // isEndorsement
                        true,       // isCertificate
                        $paperTrailNo,
                        $certificateDriveResult['drive_file_id']
                    );
                }
            }
            
            // ========== SAVE TO DATABASE ==========
            $defaultTime = date('Y-m-d H:i:s');
            $nullStatus = null;
            
            // Save endorsement to database
            $endStmt = $con->prepare("INSERT INTO endorsement (
                senderid, center, file, drive_file_id, drive_view_url, drive_download_url,
                drive_event_folder_id, drive_center_folder_id, drive_category_folder_id, drive_entry_folder_id,
                event, status, date
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");
            
            $endorsementJson = json_encode($endorsementDriveResult);
            $endStmt->bind_param('sssssssssssss',
                $senderId, $center, $endorsementJson,
                $endorsementDriveResult['drive_file_id'], 
                $endorsementDriveResult['drive_view_url'], 
                $endorsementDriveResult['drive_download_url'],
                $eventFolderId, $extensionFolderId, $campusFolderId, $entryFolderId,
                $eventType, $nullStatus, $defaultTime
            );
            $endStmt->execute();
            $endorsementId = $con->insert_id;
            $endStmt->close();
            
            // Save research file to database
            $programJson = json_encode($programDriveResult);
            $certificateFileId = $certificateDriveResult ? $certificateDriveResult['drive_file_id'] : null;
            $certificateViewUrl = $certificateDriveResult ? $certificateDriveResult['drive_view_url'] : null;
            
            $resStmt = $con->prepare("INSERT INTO researchfile (
                paper_trail_no, senderid, endorsementid, author, title, center, category,
                drive_file_id, drive_view_url, drive_download_url,
                drive_folder_id, drive_event_folder_id, drive_center_folder_id,
                drive_category_folder_id, drive_entry_folder_id,
                program, program_drive_file_id, program_drive_view_url,
                certificate_drive_file_id, certificate_drive_view_url,
                event, event_id, campus, coauthor, presenter, status
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
            
            $rev = 'pending';
            $resStmt->bind_param(
                'siisssssssssssssssssssssss',  
                $paperTrailNo, 
                $senderId, 
                $endorsementId,
                $author,
                $title, 
                $center, 
                $category,
                $researchDriveResult['drive_file_id'], 
                $researchDriveResult['drive_view_url'], 
                $researchDriveResult['drive_download_url'],
                $entryFolderId, 
                $eventFolderId, 
                $extensionFolderId, 
                $campusFolderId, 
                $entryFolderId,
                $programJson, 
                $programDriveResult['drive_file_id'], 
                $programDriveResult['drive_view_url'],
                $certificateFileId, 
                $certificateViewUrl,
                $eventType, 
                $eventId, 
                $campus, 
                $coAuthor, 
                $presenter, 
                $rev
            );
            
            if (!$resStmt->execute()) {
                throw new Exception("Database insert failed: " . $resStmt->error);
            }
            $researchFileId = $con->insert_id;
            $resStmt->close();
            
            // ========== SAVE SINGLE PAPER TRAIL RECORD ==========
            // Get folder structure from any successful Paper Trail result (use research as primary)
            $primaryPtResult = $researchPaperTrailResult;
            
            if ($primaryPtResult && $primaryPtResult['success']) {
                $paperTrailQuery = "INSERT INTO paper_trail_files (
                    research_id, paper_trail_no, submission_type, year,
                    paper_trail_root_id, submission_folder_id, year_folder_id,
                    research_folder_id, research_folder_name,
                    researchfile_drive_view_url, researchfile_drive_download_url,
                    endorsement_drive_view_url, endorsement_drive_download_url,
                    program_drive_view_url, program_drive_download_url,
                    certificate_drive_view_url, certificate_drive_download_url,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
                
                $paperTrailStmt = $con->prepare($paperTrailQuery);
                $currentYear = date('Y');
                $submissionType = 'In-House Review';
                
                // Extract URLs from each result
                $researchFileViewUrl = $researchPaperTrailResult['success'] ? $researchPaperTrailResult['drive_view_url'] : null;
                $researchFileDownloadUrl = $researchPaperTrailResult['success'] ? $researchPaperTrailResult['drive_download_url'] : null;
                
                $endorsementViewUrl = $endorsementPaperTrailResult['success'] ? $endorsementPaperTrailResult['drive_view_url'] : null;
                $endorsementDownloadUrl = $endorsementPaperTrailResult['success'] ? $endorsementPaperTrailResult['drive_download_url'] : null;
                
                $programViewUrl = $programPaperTrailResult['success'] ? $programPaperTrailResult['drive_view_url'] : null;
                $programDownloadUrl = $programPaperTrailResult['success'] ? $programPaperTrailResult['drive_download_url'] : null;
                
                $certificateViewUrl = ($certificatePaperTrailResult && $certificatePaperTrailResult['success']) ? $certificatePaperTrailResult['drive_view_url'] : null;
                $certificateDownloadUrl = ($certificatePaperTrailResult && $certificatePaperTrailResult['success']) ? $certificatePaperTrailResult['drive_download_url'] : null;
                
                $paperTrailStmt->bind_param(
                    'issssssssssssssss',
                    $researchFileId,
                    $paperTrailNo,
                    $submissionType,
                    $currentYear,
                    $primaryPtResult['paper_trail_root_id'],
                    $primaryPtResult['sub_type_folder_id'],
                    $primaryPtResult['year_folder_id'],
                    $primaryPtResult['research_folder_id'],
                    $primaryPtResult['research_folder_name'],
                    $researchFileViewUrl,
                    $researchFileDownloadUrl,
                    $endorsementViewUrl,
                    $endorsementDownloadUrl,
                    $programViewUrl,
                    $programDownloadUrl,
                    $certificateViewUrl,
                    $certificateDownloadUrl
                );
                
                if ($paperTrailStmt->execute()) {
                    error_log("Paper Trail record saved successfully for research ID: $researchFileId");
                    $response->paper_trail_saved = true;
                } else {
                    error_log("Failed to save Paper Trail record: " . $paperTrailStmt->error);
                }
                $paperTrailStmt->close();
            } else {
                error_log("Primary Paper Trail result not available, skipping database save");
            }
            
            $response->paper_trail_no = $paperTrailNo;
            $response->research_id = $researchFileId;
            $response->message = "Extension files uploaded successfully! Copies saved to Paper Trail.";
            $response->status = true;
            
            $con->close();
        }
    } catch (Exception $e) {
        error_log("Extension upload error: " . $e->getMessage());
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
        $center = null;
        $mainAuthor = trim($_POST['main_author'] ?? '');
        $presenter = trim($_POST['presenter'] ?? '');
        $coAuthors = $_POST['co_authors'] ?? '[]';

        if (empty($documentTitle) || empty($mainAuthor) || empty($category) || empty($campus)) {
            throw new Exception("Missing required fields for Local In-House Review");
        }

        $paperTrailNo = generatePaperTrailNumber($con, $eventId, 'Extension (Extension)', $documentTitle, $mainAuthor);

        $drive = new GoogleDriveService();

        $cleanTitle = cleanFolderNameForDrive($documentTitle);
        $year = date('Y');

        // Get author last name for folder naming
        $authorParts = explode(' ', trim($mainAuthor));
        $authorLastName = end($authorParts);
        $authorLastName = cleanFolderNameForDrive($authorLastName);

        // ===== LOCATION 1: Event -> Category (for event storage) - NO CENTER LEVEL =====
        $cleanEventName = cleanFolderNameForDrive($eventName);
        $cleanCategoryName = cleanFolderNameForDrive($category);

        $eventFolderId = $drive->findOrCreateFolder($cleanEventName, null);
        if (!$eventFolderId)
            throw new Exception("Failed to create event folder");

        $categoryFolderId = $drive->findOrCreateFolder($cleanCategoryName, $eventFolderId);
        if (!$categoryFolderId)
            throw new Exception("Failed to create category folder");

        // For Local In-House, files go directly in Category folder
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
        $programPtResult = null;

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
                $programPtResult = $programPaperTrailResult;
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
            }
        }

        // Upload Certificate File to BOTH locations
        $certificateDriveFileId = null;
        $certificateDriveViewUrl = null;
        $certificateDriveDownloadUrl = null;
        $certificateEventFileId = null;
        $certificateEventViewUrl = null;
        $certificatePtResult = null;

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
                $certificatePtResult = $certificatePaperTrailResult;
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
            }
        }

        // ===== STEP 1: INSERT INTO researchfile TABLE =====
        $rev = 'pending';
        $nullEndorsement = null;
        $title_changed = 0;
        $date_started = null;
        $date_completed = null;
        $final_symposium_title = null;

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
        $center = null;
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
            $date_started,
            $date_completed,
            $documentTitle,
            $final_symposium_title,
            $eventName,
            $rev,
            $category,
            $center,                    // NULL for Extension
            $campus,
            $title_changed,
            $programEventFileId,
            $programEventViewUrl,       // drive_view_url
            $programDriveDownloadUrl,   // drive_download_url
            $eventFolderId,             // drive_event_folder_id
            $center,                       // drive_center_folder_id (NULL for Extension)
            $categoryFolderId           // drive_category_folder_id
        );

        if (!$insertResearchStmt->execute()) {
            throw new Exception("Failed to insert researchfile: " . $insertResearchStmt->error);
        }

        $researchId = $con->insert_id;
        $insertResearchStmt->close();

        error_log("Researchfile created with ID: $researchId for Local In-House");

        // ===== STEP 2: INSERT INTO local_inhouse TABLE =====
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
            $center,                    // NULL for Extension
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

        // ===== STEP 3: SAVE SINGLE PAPER TRAIL RECORD =====
        if ($programPtResult && $programPtResult['success']) {
            $paperTrailQuery = "INSERT INTO paper_trail_files (
                research_id, paper_trail_no, submission_type, year,
                paper_trail_root_id, submission_folder_id, year_folder_id,
                research_folder_id, research_folder_name,
                program_drive_view_url, program_drive_download_url,
                certificate_drive_view_url, certificate_drive_download_url,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            
            $paperTrailStmt = $con->prepare($paperTrailQuery);
            
            $programUrl = $programPtResult['drive_view_url'];
            $programDownload = $programPtResult['drive_download_url'];
            $certificateUrl = $certificatePtResult && $certificatePtResult['success'] ? $certificatePtResult['drive_view_url'] : null;
            $certificateDownload = $certificatePtResult && $certificatePtResult['success'] ? $certificatePtResult['drive_download_url'] : null;
            $folderName = 'Local In-House Review';
            $paperTrailStmt->bind_param(
                'issssssssssss',
                $researchId, $paperTrailNo, $folderName, $year,
                $programPtResult['paper_trail_root_id'],
                $programPtResult['sub_type_folder_id'],
                $programPtResult['year_folder_id'],
                $programPtResult['research_folder_id'],
                $programPtResult['research_folder_name'],
                $programUrl, $programDownload,
                $certificateUrl, $certificateDownload
            );
            $paperTrailStmt->execute();
            $paperTrailStmt->close();
            error_log("Paper Trail record saved for Local In-House ID: $localId");
        }

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

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

if (isset($_POST['searchInhouseTitles'])) {
    // Clean output buffer to prevent HTML errors
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
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->data = [];

    try {
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            // Remove senderid filter - get ALL accepted in-house reviews
            $query = "SELECT 
                        rf.id,
                        rf.title,
                        rf.author,
                        rf.coauthor,
                        rf.category,
                        rf.center,
                        rf.event,
                        rf.event_id,
                        e.status,
                        el.name as event_name,
                        el.date as event_date
                      FROM researchfile rf
                      LEFT JOIN endorsement e ON rf.endorsementid = e.id
                      LEFT JOIN event_list el ON rf.event_id = el.id
                      WHERE (rf.event LIKE '%In-House Review%' 
                             OR rf.event LIKE '%in house review%'
                             OR rf.event LIKE '%In House Review%')
                      AND e.status = 'accepted' 
                      ORDER BY el.date DESC, rf.id DESC";

            $stmt = $con->prepare($query);
            $stmt->execute();
            $result = $stmt->get_result();

            while ($row = $result->fetch_assoc()) {
                $data = new stdClass();
                $data->id = $row['id'];
                $data->title = $row['title'];
                $data->author = $row['author'];
                $data->category = $row['category'] ?? '';
                $data->center = $row['center'] ?? '';
                $data->event_name = $row['event_name'] ?? $row['event'];
                $data->event_date = $row['event_date'] ?? '';
                $data->status = $row['status'];

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
        } else {
            throw new Exception("Database connection failed");
        }
    } catch (Exception $e) {
        error_log("Error fetching accepted in-house reviews: " . $e->getMessage());
        $response->message = "Error: " . $e->getMessage();
        $response->status = false;
    }

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
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

            $query .= " ORDER BY el.name, " . ($isNewEvent ? "rf.center" : "rf.campus") . ", rf.title";

            $stmt = $con->prepare($query);
            if (!$stmt)
                throw new Exception('Prepare failed: ' . $con->error);

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
                $totalRows = $result->num_rows;
                $result->free();
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
                $response->status = true;
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

            $con->query("SET SESSION sql_mode = ''");

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
                $endorsement->type = 'faculty';
                $endorsement->ResearchDocs = [];
                $enID = $val['id'];

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
                    li.certificate_file_view_url as local_certificate_file_view_url,
                    li.local_eventname as local_eventname
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
                    $researchDocs->type = 'faculty';
                    
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
                    $researchDocs->local_eventname = $res['local_eventname'] ?? null;
                    
                    // Determine the display status for faculty papers
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
                if (count($endorsement->ResearchDocs) > 0) {
                    $response->list[] = $endorsement;
                }
            }

            $queryStudentPapers = "SELECT 
                srp.id,
                srp.senderid,
                srp.event_id,
                srp.author,
                srp.coauthor,
                srp.presenter,
                srp.date_started,
                srp.date_completed,
                srp.title,
                srp.event,
                srp.status,
                srp.paper_type,
                srp.category,
                srp.campus,
                srp.research_file_view_url,
                srp.endorsement_file_view_url,
                srp.created_at,
                srp.updated_at,
                el.name as event_name,
                el.date_of_presentation
            FROM student_research_papers srp
            LEFT JOIN event_list el ON srp.event_id = el.id
            WHERE srp.senderid = ?
            ORDER BY srp.created_at DESC";

            $studentStmt = $con->prepare($queryStudentPapers);
            if (!$studentStmt) {
                throw new Exception("Student papers query prepare failed: " . $con->error);
            }
            $studentStmt->bind_param("i", $userId);
            $studentStmt->execute();
            $studentResult = $studentStmt->get_result();

            while ($row = $studentResult->fetch_assoc()) {
                // Determine event name
                $eventName = !empty($row['event_name']) ? $row['event_name'] : ($row['event'] ?? 'Uncategorized');

                // Create a single endorsement entry for each student paper
                $studentEndorsement = new stdClass();
                $studentEndorsement->type = 'student';
                $studentEndorsement->id = $row['id'] ?? 0;
                $studentEndorsement->eventType = $eventName;
                $studentEndorsement->date = $row['created_at'] ?? date('Y-m-d H:i:s');
                $studentEndorsement->status = $row['status'] ?? 'pending';
                $studentEndorsement->endorsementFile = $row['endorsement_file_view_url'] ?? null;
                $studentEndorsement->drive_file_id = null;
                $studentEndorsement->drive_download_url = null;
                $studentEndorsement->ResearchDocs = [];

                // Create the research document entry
                $researchDoc = new stdClass();
                $researchDoc->docId = $row['id'] ?? 0;
                $researchDoc->author = $row['author'] ?? '';
                $researchDoc->coauthor = $row['coauthor'] ?? '';
                $researchDoc->presenter = $row['presenter'] ?? '';
                $researchDoc->title = $row['title'] ?? '';
                $researchDoc->category = $row['category'] ?? '';
                $researchDoc->campus = $row['campus'] ?? '';
                $researchDoc->status = $row['status'] ?? 'pending';
                $researchDoc->paper_type = $row['paper_type'] ?? 'undergraduate';
                $researchDoc->event = $row['event'] ?? '';
                $researchDoc->event_name = $eventName;
                $researchDoc->event_id = $row['event_id'] ?? null;
                $researchDoc->date_started = $row['date_started'] ?? null;
                $researchDoc->date_completed = $row['date_completed'] ?? null;
                $researchDoc->date_of_presentation = $row['date_of_presentation'] ?? null;
                $researchDoc->type = 'student';
                
                // Set both research and endorsement file URLs
                $researchDoc->researchFile = $row['research_file_view_url'] ?? null;
                $researchDoc->endorsementFile = $row['endorsement_file_view_url'] ?? null;
                
                $studentEndorsement->ResearchDocs[] = $researchDoc;
                $response->list[] = $studentEndorsement;
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
    
    $docId = isset($_POST['docId']) ? intval($_POST['docId']) : 0;
    if ($docId <= 0) {
        $response->message = 'Invalid document ID';
        exit();
    }
    
    try {
        if (!isset($host) || !isset($username) || !isset($pass) || !isset($dbName)) {
            $response->message = 'Database configuration error';
            exit();
        }
        
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            error_log("Database connection failed: " . $con->connect_error);
            $response->message = 'Database connection failed: ' . $con->connect_error;
            echo json_encode($response);
            exit();
        }
        
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

if (isset($_POST['getRejectedForResubmit'])) {
    // Clean any previous output
    while (ob_get_level()) ob_end_clean();
    ob_start();
    
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->data = null;

    try {
        // Check if user is logged in
        if (!isset($_SESSION['userId']) || empty($_SESSION['userId'])) {
            throw new Exception("User not logged in");
        }
        
        $userId = $_SESSION['userId'];
        
        // Check if docId is provided
        if (!isset($_POST['docId']) || empty($_POST['docId'])) {
            throw new Exception("Document ID is required");
        }

        $endorsementId = trim($_POST['docId']);

        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            if ($con->connect_error) {
                throw new Exception("Database connection failed: " . $con->connect_error);
            }

            // First check if the document exists and is rejected
            $checkQuery = "SELECT rf.id, rf.status, rf.title, e.id as endorsement_id 
                           FROM researchfile rf 
                           LEFT JOIN endorsement e ON rf.endorsementid = e.id 
                           WHERE rf.endorsementid = ? AND rf.senderid = ?";
            $checkStmt = $con->prepare($checkQuery);
            if (!$checkStmt) {
                throw new Exception("Prepare failed: " . $con->error);
            }
            
            $checkStmt->bind_param("si", $endorsementId, $userId);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result();
            
            if ($checkResult->num_rows === 0) {
                throw new Exception("No document found with this ID for your account");
            }
            
            $checkRow = $checkResult->fetch_assoc();
            if ($checkRow['status'] !== 'rejected') {
                throw new Exception("Document is not rejected (status: " . ($checkRow['status'] ?? 'unknown') . ")");
            }
            $checkStmt->close();

            // ===== FETCH SYMPOSIUM DATA =====
            $query = "SELECT 
                rf.id,
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
                rf.resubmit_count,
                rf.resubmitted,
                e.id as endorsement_id,
                e.drive_view_url as endorsement_url,
                e.drive_file_id as endorsement_file_id,
                e.drive_download_url as endorsement_download_url,
                el.date_of_presentation,
                el.name as event_name,
                rd.reason,
                rd.date as rejection_date
            FROM researchfile rf
            LEFT JOIN endorsement e ON rf.endorsementid = e.id
            LEFT JOIN event_list el ON rf.event_id = el.id
            LEFT JOIN rejecteddocs rd ON e.id = rd.docid
            WHERE rf.endorsementid = ? AND rf.senderid = ?
            LIMIT 1";

            $stmt = $con->prepare($query);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $con->error);
            }
            
            $stmt->bind_param("si", $endorsementId, $userId);
            
            if (!$stmt->execute()) {
                throw new Exception("Query execution failed: " . $stmt->error);
            }
            
            $result = $stmt->get_result();

            if ($result && $result->num_rows > 0) {
                $row = $result->fetch_assoc();
                
                // ===== BUILD SYMPOSIUM DATA =====
                $data = new stdClass();
                $data->id = (int)$row['id'];
                $data->author = $row['author'] ?? '';
                $data->coauthor = $row['coauthor'] ?? '';
                $data->presenter = $row['presenter'] ?? '';
                
                // Title display logic
                $data->title_changed = (int)($row['title_changed'] ?? 0);
                $data->original_title = $row['title'] ?? '';
                $data->final_symposium_title = $row['final_symposium_title'] ?? null;
                
                if (!empty($row['final_symposium_title']) && $data->title_changed == 1) {
                    $data->title = $row['final_symposium_title'];
                } else {
                    $data->title = $row['title'] ?? '';
                }
                
                $data->center = $row['center'] ?? '';
                $data->campus = $row['campus'] ?? '';
                $data->category = $row['category'] ?? '';
                $data->event = $row['event_name'] ?? '';
                $data->event_id = $row['event_id'] !== null ? (int)$row['event_id'] : null;
                $data->date_started = $row['date_started'] ?? null;
                $data->date_completed = $row['date_completed'] ?? null;
                $data->date_of_presentation = $row['date_of_presentation'] ?? null;
                $data->original_status = $row['original_status'] ?? 'pending';
                $data->revision_status = $row['revision_status'] ?? null;
                $data->revision_count = (int)($row['revision_count'] ?? 0);
                $data->local_inhouse = (int)($row['local_inhouse'] ?? 0);
                $data->resubmit_count = (int)($row['resubmit_count'] ?? 0);
                $data->resubmitted = (int)($row['resubmitted'] ?? 0);
                $data->endorsement_id = $row['endorsement_id'] !== null ? (int)$row['endorsement_id'] : null;

                // Determine the display status
                $currentDate = date('Y-m-d H:i:s');
                $presentationDate = $row['date_of_presentation'] ?? null;
                $originalStatus = $row['original_status'] ?? 'pending';
                $revisionStatus = $row['revision_status'] ?? null;

                if ($originalStatus === 'rejected') {
                    $displayStatus = 'rejected';
                } elseif ($presentationDate === null) {
                    $displayStatus = $originalStatus;
                } elseif ($presentationDate < $currentDate) {
                    $displayStatus = !empty($revisionStatus) ? $revisionStatus : 'revision_pending';
                } else {
                    $displayStatus = $originalStatus;
                }

                $data->status = $displayStatus;

                // ===== SYMPOSIUM FILES (Only Research + Endorsement) =====
                $data->research_file = [
                    'url' => $row['file'] ?? '',
                    'file_id' => $row['drive_file_id'] ?? '',
                    'download_url' => null,
                    'label' => 'Research Paper'
                ];

                $data->endorsement_file = [
                    'url' => $row['endorsement_url'] ?? '',
                    'file_id' => $row['endorsement_file_id'] ?? '',
                    'download_url' => $row['endorsement_download_url'] ?? '',
                    'label' => 'Endorsement Letter'
                ];

                // ===== FETCH LOCAL IN-HOUSE DATA (if exists) =====
                $data->local_inhouse_data = null;
                
                if ($data->local_inhouse == 1) {
                    $localQuery = "SELECT 
                        li.id,
                        li.document_title,
                        li.campus,
                        li.category,
                        li.center,
                        li.main_author,
                        li.presenter,
                        li.co_authors,
                        li.program_file_view_url,
                        li.program_file_download_url,
                        li.certificate_file_view_url,
                        li.certificate_file_download_url,
                        li.created_at,
                        li.updated_at
                    FROM local_inhouse li
                    WHERE li.research_id = ?
                    LIMIT 1";
                    
                    $localStmt = $con->prepare($localQuery);
                    if ($localStmt) {
                        $localStmt->bind_param("i", $row['id']);
                        $localStmt->execute();
                        $localResult = $localStmt->get_result();
                        
                        if ($localResult && $localResult->num_rows > 0) {
                            $localRow = $localResult->fetch_assoc();
                            
                            $data->local_inhouse_data = new stdClass();
                            $data->local_inhouse_data->id = (int)$localRow['id'];
                            $data->local_inhouse_data->document_title = $localRow['document_title'] ?? '';
                            $data->local_inhouse_data->campus = $localRow['campus'] ?? '';
                            $data->local_inhouse_data->category = $localRow['category'] ?? '';
                            $data->local_inhouse_data->center = $localRow['center'] ?? '';
                            $data->local_inhouse_data->main_author = $localRow['main_author'] ?? '';
                            $data->local_inhouse_data->presenter = $localRow['presenter'] ?? '';
                            
                            // Parse co_authors
                            if (!empty($localRow['co_authors'])) {
                                $coAuthors = json_decode($localRow['co_authors'], true);
                                $data->local_inhouse_data->co_authors = is_array($coAuthors) ? $coAuthors : [];
                            } else {
                                $data->local_inhouse_data->co_authors = [];
                            }
                            
                            // ===== LOCAL IN-HOUSE FILES (Only Program + Certificate) =====
                            $data->local_inhouse_data->program_file = [
                                'url' => $localRow['program_file_view_url'] ?? '',
                                'download_url' => $localRow['program_file_download_url'] ?? '',
                                'label' => 'Local Program File'
                            ];
                            
                            $data->local_inhouse_data->certificate_file = [
                                'url' => $localRow['certificate_file_view_url'] ?? '',
                                'download_url' => $localRow['certificate_file_download_url'] ?? '',
                                'label' => 'Local Certificate File'
                            ];
                            
                            $data->local_inhouse_data->created_at = $localRow['created_at'] ?? null;
                            $data->local_inhouse_data->updated_at = $localRow['updated_at'] ?? null;
                        }
                        $localStmt->close();
                    }
                }

                // Rejection details
                $data->rejection_reason = $row['reason'] ?? 'No reason provided';
                $data->rejection_date = $row['rejection_date'] ?? '';

                $response->status = true;
                $response->message = 'Document found';
                $response->data = $data;
            } else {
                throw new Exception("Document is rejected but no rejection reason found in records");
            }

            $stmt->close();
            $con->close();
            
        } else {
            throw new Exception("Database connection failed");
        }
        
    } catch (Exception $e) {
        error_log("getRejectedForResubmit error: " . $e->getMessage());
        $response->status = false;
        $response->message = $e->getMessage();
        $response->data = null;
    }

    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($response);
    ob_end_flush();
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

        $entryFolderId = $docInfo['drive_entry_folder_id'];

        error_log("Entry folder ID: " . ($entryFolderId ?: 'none - will create new'));

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

        $driveService = new GoogleDriveService();

        if (isset($_FILES['researchDoc']) && $_FILES['researchDoc']['error'] === UPLOAD_ERR_OK && !empty($oldDriveFileId)) {
            try {
                error_log("Deleting old research file for endorsement $endorsementId: $oldDriveFileId");
                $driveService->trashFile($oldDriveFileId);
                error_log("Successfully deleted old research file: $oldDriveFileId");
            } catch (Exception $e) {
                error_log("Failed to delete old research file: " . $e->getMessage());
            }
        }

        if (isset($_FILES['programFile']) && $_FILES['programFile']['error'] === UPLOAD_ERR_OK && !empty($oldProgramDriveFileId)) {
            try {
                error_log("Deleting old program file for endorsement $endorsementId: $oldProgramDriveFileId");
                $driveService->trashFile($oldProgramDriveFileId);
                error_log("Successfully deleted old program file: $oldProgramDriveFileId");
            } catch (Exception $e) {
                error_log("Failed to delete old program file: " . $e->getMessage());
            }
        }

        if (isset($_FILES['endorsementFile']) && $_FILES['endorsementFile']['error'] === UPLOAD_ERR_OK && !empty($oldEndorsementFileId)) {
            try {
                error_log("Deleting old endorsement file for endorsement $endorsementId: $oldEndorsementFileId");
                $driveService->trashFile($oldEndorsementFileId);
                error_log("Successfully deleted old endorsement file: $oldEndorsementFileId");
            } catch (Exception $e) {
                error_log("Failed to delete old endorsement file: " . $e->getMessage());
            }
        }

        $updates = [];
        $params = [];
        $types = "";

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

    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}
// Update Research Entry (Edit Mode)
if (isset($_POST['updateResearch'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        if ($con->connect_error) {
            throw new Exception("Database connection failed: " . $con->connect_error);
        }
        
        $senderId = $_SESSION['userId'] ?? 0;
        $researchId = isset($_POST['researchId']) ? (int)$_POST['researchId'] : 0;
        $endorsementId = isset($_POST['endorsementId']) ? (int)$_POST['endorsementId'] : 0;
        
        // Get current research record
        $checkStmt = $con->prepare("SELECT * FROM researchfile WHERE id = ? AND senderid = ?");
        $checkStmt->bind_param("ii", $researchId, $senderId);
        $checkStmt->execute();
        $existing = $checkStmt->get_result()->fetch_assoc();
        $checkStmt->close();
        
        if (!$existing) {
            throw new Exception("Research record not found or access denied");
        }
        
        // Get POST data
        $eventType = trim($_POST['eventType'] ?? '');
        $title = trim($_POST['title'] ?? '');
        $author = trim($_POST['author'] ?? '');
        $campus = trim($_POST['campus'] ?? '');
        $coAuthor = $_POST['coAuthor'] ?? '[]';
        $presenter = trim($_POST['presenter'] ?? '');
        $category = trim($_POST['category'] ?? 'Extension');
        $center = null; // Extension doesn't use center
        
        // Get event_id
        $eventId = null;
        $eventStmt = $con->prepare("SELECT id FROM event_list WHERE name = ? LIMIT 1");
        $eventStmt->bind_param("s", $eventType);
        $eventStmt->execute();
        $eventResult = $eventStmt->get_result();
        $eventRow = $eventResult->fetch_assoc();
        $eventId = $eventRow ? $eventRow['id'] : null;
        $eventStmt->close();
        
        // Track what changed for logging
        $changes = [];
        
        // Build update query dynamically
        $updateFields = [];
        $params = [];
        $types = "";
        
        // Basic fields
        if ($eventType !== $existing['event']) {
            $updateFields[] = "event = ?";
            $params[] = $eventType;
            $types .= "s";
            $changes[] = "event: '" . $existing['event'] . "' -> '" . $eventType . "'";
        }
        if ($eventId !== $existing['event_id']) {
            $updateFields[] = "event_id = ?";
            $params[] = $eventId;
            $types .= "i";
            $changes[] = "event_id: " . ($existing['event_id'] ?? 'null') . " -> " . ($eventId ?? 'null');
        }
        if ($title !== $existing['title']) {
            $updateFields[] = "title = ?";
            $params[] = $title;
            $types .= "s";
            $changes[] = "title: '" . $existing['title'] . "' -> '" . $title . "'";
        }
        if ($author !== $existing['author']) {
            $updateFields[] = "author = ?";
            $params[] = $author;
            $types .= "s";
            $changes[] = "author: '" . $existing['author'] . "' -> '" . $author . "'";
        }
        if ($campus !== $existing['campus']) {
            $updateFields[] = "campus = ?";
            $params[] = $campus;
            $types .= "s";
            $changes[] = "campus: '" . $existing['campus'] . "' -> '" . $campus . "'";
        }
        if ($coAuthor !== $existing['coauthor']) {
            $updateFields[] = "coauthor = ?";
            $params[] = $coAuthor;
            $types .= "s";
            $changes[] = "coauthor updated";
        }
        if ($presenter !== $existing['presenter']) {
            $updateFields[] = "presenter = ?";
            $params[] = $presenter;
            $types .= "s";
            $changes[] = "presenter: '" . $existing['presenter'] . "' -> '" . $presenter . "'";
        }
        if ($category !== $existing['category']) {
            $updateFields[] = "category = ?";
            $params[] = $category;
            $types .= "s";
            $changes[] = "category: '" . $existing['category'] . "' -> '" . $category . "'";
        }
        
        // Handle file updates - only update if new file was uploaded
        $drive = new GoogleDriveService();
        $entryFolderId = $existing['drive_entry_folder_id'];
        
        if (isset($_FILES['researchDoc']) && $_FILES['researchDoc']['error'] === UPLOAD_ERR_OK) {
            // Upload new file (replace existing)
            $tempPath = $_FILES['researchDoc']['tmp_name'];
            $fileName = $_FILES['researchDoc']['name'];
            
            // Delete old file from Drive if exists
            if (!empty($existing['drive_file_id'])) {
                $drive->trashFile($existing['drive_file_id']);
            }
            
            $uploadResult = $drive->uploadFile($tempPath, $fileName, $entryFolderId);
            if ($uploadResult['success']) {
                $drive->makeFilePublic($uploadResult['id']);
                $updateFields[] = "drive_file_id = ?";
                $params[] = $uploadResult['id'];
                $types .= "s";
                $updateFields[] = "drive_view_url = ?";
                $params[] = "https://drive.google.com/file/d/{$uploadResult['id']}/preview";
                $types .= "s";
                $updateFields[] = "drive_download_url = ?";
                $params[] = "https://drive.google.com/uc?id={$uploadResult['id']}&export=download";
                $types .= "s";
                $changes[] = "research file replaced";
            } else {
                throw new Exception("Research file upload failed: " . ($uploadResult['error'] ?? 'Unknown error'));
            }
        } elseif (isset($_POST['keepResearch']) && $_POST['keepResearch'] === 'true') {
            // Keep existing file - no changes needed
            $changes[] = "research file kept";
        } else {
            // No research file provided and no keep flag - this shouldn't happen in edit mode
            // but we'll keep the existing file to be safe
            $changes[] = "research file unchanged";
        }

        // Endorsement File - only upload if a new file was provided
        if (isset($_FILES['uploadedFileEndorsement']) && $_FILES['uploadedFileEndorsement']['error'] === UPLOAD_ERR_OK) {
            $tempPath = $_FILES['uploadedFileEndorsement']['tmp_name'];
            $fileName = $_FILES['uploadedFileEndorsement']['name'];
            
            // Delete old endorsement from Drive
            if (!empty($existing['endorsement_drive_file_id'])) {
                $drive->trashFile($existing['endorsement_drive_file_id']);
            }
            
            $uploadResult = $drive->uploadFile($tempPath, $fileName, $entryFolderId);
            if ($uploadResult['success']) {
                $drive->makeFilePublic($uploadResult['id']);
                // Update endorsement table
                $endStmt = $con->prepare("UPDATE endorsement SET drive_file_id = ?, drive_view_url = ?, drive_download_url = ? WHERE id = ?");
                $viewUrl = "https://drive.google.com/file/d/{$uploadResult['id']}/preview";
                $downloadUrl = "https://drive.google.com/uc?id={$uploadResult['id']}&export=download";
                $endStmt->bind_param("sssi", $uploadResult['id'], $viewUrl, $downloadUrl, $endorsementId);
                $endStmt->execute();
                $endStmt->close();
                $changes[] = "endorsement file replaced";
            } else {
                throw new Exception("Endorsement file upload failed: " . ($uploadResult['error'] ?? 'Unknown error'));
            }
        } elseif (isset($_POST['keepEndorsement']) && $_POST['keepEndorsement'] === 'true') {
            // Keep existing file
            $changes[] = "endorsement file kept";
        }

        // Program File (for In-House)
        if (isset($_FILES['programFile']) && $_FILES['programFile']['error'] === UPLOAD_ERR_OK) {
            $tempPath = $_FILES['programFile']['tmp_name'];
            $fileName = $_FILES['programFile']['name'];
            
            // Delete old program file from Drive
            if (!empty($existing['program_drive_file_id'])) {
                $drive->trashFile($existing['program_drive_file_id']);
            }
            
            $uploadResult = $drive->uploadFile($tempPath, $fileName, $entryFolderId);
            if ($uploadResult['success']) {
                $drive->makeFilePublic($uploadResult['id']);
                $updateFields[] = "program_drive_file_id = ?";
                $params[] = $uploadResult['id'];
                $types .= "s";
                $updateFields[] = "program_drive_view_url = ?";
                $params[] = "https://drive.google.com/file/d/{$uploadResult['id']}/preview";
                $types .= "s";
                $changes[] = "program file replaced";
            }
        } elseif (isset($_POST['keepProgram']) && $_POST['keepProgram'] === 'true') {
            $changes[] = "program file kept";
        }

        // Certificate File
        if (isset($_FILES['certificateFile']) && $_FILES['certificateFile']['error'] === UPLOAD_ERR_OK) {
            $tempPath = $_FILES['certificateFile']['tmp_name'];
            $fileName = $_FILES['certificateFile']['name'];
            
            if (!empty($existing['certificate_drive_file_id'])) {
                $drive->trashFile($existing['certificate_drive_file_id']);
            }
            
            $uploadResult = $drive->uploadFile($tempPath, $fileName, $entryFolderId);
            if ($uploadResult['success']) {
                $drive->makeFilePublic($uploadResult['id']);
                $updateFields[] = "certificate_drive_file_id = ?";
                $params[] = $uploadResult['id'];
                $types .= "s";
                $updateFields[] = "certificate_drive_view_url = ?";
                $params[] = "https://drive.google.com/file/d/{$uploadResult['id']}/preview";
                $types .= "s";
                $changes[] = "certificate file replaced";
            }
        } elseif (isset($_POST['keepCertificate']) && $_POST['keepCertificate'] === 'true') {
            $changes[] = "certificate file kept";
        }

        // Title Certificate File (for Symposium)
        if (isset($_FILES['titleCertificateFile']) && $_FILES['titleCertificateFile']['error'] === UPLOAD_ERR_OK) {
            $tempPath = $_FILES['titleCertificateFile']['tmp_name'];
            $fileName = $_FILES['titleCertificateFile']['name'];
            
            if (!empty($existing['title_certificate_drive_file_id'])) {
                $drive->trashFile($existing['title_certificate_drive_file_id']);
            }
            
            $uploadResult = $drive->uploadFile($tempPath, $fileName, $entryFolderId);
            if ($uploadResult['success']) {
                $drive->makeFilePublic($uploadResult['id']);
                $updateFields[] = "title_certificate_view_url = ?";
                $params[] = "https://drive.google.com/file/d/{$uploadResult['id']}/preview";
                $types .= "s";
                $updateFields[] = "title_certificate_download_url = ?";
                $params[] = "https://drive.google.com/uc?id={$uploadResult['id']}&export=download";
                $types .= "s";
                $changes[] = "title certificate file replaced";
            }
        } elseif (isset($_POST['keepTitleCertificate']) && $_POST['keepTitleCertificate'] === 'true') {
            $changes[] = "title certificate file kept";
        }
        
        // Title change info
        $titleChanged = isset($_POST['title_changed']) ? (int)$_POST['title_changed'] : 0;
        if ($titleChanged !== (int)$existing['title_changed']) {
            $updateFields[] = "title_changed = ?";
            $params[] = $titleChanged;
            $types .= "i";
            $changes[] = "title_changed: " . $existing['title_changed'] . " -> " . $titleChanged;
        }
        
        $finalSymposiumTitle = isset($_POST['final_symposium_title']) ? trim($_POST['final_symposium_title']) : null;
        if ($finalSymposiumTitle !== $existing['final_symposium_title']) {
            $updateFields[] = "final_symposium_title = ?";
            $params[] = $finalSymposiumTitle;
            $types .= "s";
            $changes[] = "final_symposium_title updated";
        }
        
        if (empty($updateFields)) {
            $response->message = "No changes to update";
            $response->status = true;
            echo json_encode($response);
            exit();
        }
        

        $params[] = $researchId;
        $types .= "i";
        
        // Execute update
        $query = "UPDATE researchfile SET " . implode(", ", $updateFields) . " WHERE id = ? AND senderid = ?";
        $params[] = $senderId;
        $types .= "i";
        
        $updateStmt = $con->prepare($query);
        $updateStmt->bind_param($types, ...$params);
        
        if (!$updateStmt->execute()) {
            throw new Exception("Update failed: " . $updateStmt->error);
        }
        
        // Also update endorsement if event/campus changed
        if (in_array('event', $updateFields) || in_array('campus', $updateFields)) {
            $endUpdateFields = [];
            $endParams = [];
            $endTypes = "";
            
            if (in_array('event', $updateFields)) {
                $endUpdateFields[] = "event = ?";
                $endParams[] = $eventType;
                $endTypes .= "s";
            }
            if (in_array('campus', $updateFields)) {
                $endUpdateFields[] = "campus = ?";
                $endParams[] = $campus;
                $endTypes .= "s";
            }
            
            if (!empty($endUpdateFields)) {
                $endParams[] = $endorsementId;
                $endTypes .= "i";
                $endQuery = "UPDATE endorsement SET " . implode(", ", $endUpdateFields) . " WHERE id = ?";
                $endStmt = $con->prepare($endQuery);
                $endStmt->bind_param($endTypes, ...$endParams);
                $endStmt->execute();
                $endStmt->close();
            }
        }
        
        // Log the update
        $logQuery = "INSERT INTO document_log (user_id, doc_id, details, date) VALUES (?, ?, ?, NOW())";
        $logStmt = $con->prepare($logQuery);
        $logDetails = "User updated research ID: $researchId. Changes: " . implode("; ", $changes);
        $logStmt->bind_param("iss", $senderId, $researchId, $logDetails);
        $logStmt->execute();
        $logStmt->close();
        
        $response->status = true;
        $response->message = "Document updated successfully! Changes: " . count($changes) . " field(s) updated.";
        $response->changes = $changes;
        
        $con->close();
        
    } catch (Exception $e) {
        error_log("Update research error: " . $e->getMessage());
        $response->message = $e->getMessage();
        $response->status = false;
    }
    
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

// Search accepted papers for poster submission
if (isset($_POST['searchAcceptedPapers'])) {
    while (ob_get_level()) ob_end_clean();
    ob_start();

    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->data = [];

    try {
        $searchTerm = isset($_POST['searchTerm']) ? trim($_POST['searchTerm']) : '';

        if (empty($searchTerm) || strlen($searchTerm) < 2) {
            throw new Exception("Please enter at least 2 characters to search");
        }

        $con = new mysqli($host, $username, $pass, $dbName);
        if ($con->connect_error) {
            throw new Exception("Database connection failed: " . $con->connect_error);
        }

        $searchPattern = '%' . $con->real_escape_string($searchTerm) . '%';

        // ===== SEARCH FACULTY RESEARCH PAPERS =====
        // Removed senderid filter - get ALL accepted symposium papers
        $query = "SELECT DISTINCT 
                    rf.id,
                    rf.title,
                    rf.author,
                    rf.coauthor,
                    rf.center,
                    rf.campus,
                    rf.category,
                    rf.paper_trail_no,
                    rf.event,
                    rf.event_id,
                    el.name as event_name,
                    rf.status,
                    rf.poster_submitted,
                    e.status as endorsement_status
                  FROM researchfile rf
                  LEFT JOIN event_list el ON rf.event_id = el.id
                  LEFT JOIN endorsement e ON rf.endorsementid = e.id
                  WHERE rf.status = 'accepted'
                  AND (rf.event LIKE '%Symposium%' 
                       OR el.name LIKE '%Symposium%'
                       OR rf.event LIKE '%symposium%')
                  AND rf.poster_submitted = 0
                  AND (rf.title LIKE ? 
                       OR rf.author LIKE ? 
                       OR rf.paper_trail_no LIKE ?
                       OR rf.id = ?)
                  ORDER BY rf.id DESC
                  LIMIT 50";

        $stmt = $con->prepare($query);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $con->error);
        }

        $idSearch = (int)$searchTerm;
        $stmt->bind_param("sssi", $searchPattern, $searchPattern, $searchPattern, $idSearch);
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $paper = new stdClass();
            $paper->id = (int)$row['id'];
            $paper->title = $row['title'] ?? '';
            $paper->author = $row['author'] ?? '';
            $paper->coauthors = [];
            $paper->center = $row['center'] ?? '';
            $paper->campus = $row['campus'] ?? '';
            $paper->category = $row['category'] ?? '';
            $paper->paper_trail_no = $row['paper_trail_no'] ?? '';
            $paper->event = $row['event'] ?? '';
            $paper->event_id = $row['event_id'] ? (int)$row['event_id'] : null;
            $paper->event_name = $row['event_name'] ?? $row['event'] ?? '';
            $paper->status = $row['status'] ?? '';
            $paper->poster_submitted = (int)($row['poster_submitted'] ?? 0);

            // Parse coauthors
            if (!empty($row['coauthor'])) {
                $coauthors = json_decode($row['coauthor'], true);
                $paper->coauthors = is_array($coauthors) ? $coauthors : [];
            }

            $response->data[] = $paper;
        }

        $stmt->close();

        // ===== IF NO FACULTY PAPERS FOUND, SEARCH STUDENT PAPERS =====
        if (count($response->data) === 0) {
            $studentQuery = "SELECT 
                                srp.id,
                                srp.title,
                                srp.author,
                                srp.coauthor,
                                srp.category,
                                srp.campus,
                                srp.paper_type,
                                srp.event_id,
                                srp.event,
                                srp.status,
                                el.name as event_name
                             FROM student_research_papers srp
                             LEFT JOIN event_list el ON srp.event_id = el.id
                             WHERE srp.status = 'accepted'
                             AND (srp.event LIKE '%Symposium%' 
                                  OR el.name LIKE '%Symposium%'
                                  OR srp.event LIKE '%symposium%')
                             AND srp.id NOT IN (
                                 SELECT research_id FROM poster_submissions 
                                 WHERE research_type = 'student'
                             )
                             AND (srp.title LIKE ? 
                                  OR srp.author LIKE ?
                                  OR srp.id = ?)
                             ORDER BY srp.id DESC
                             LIMIT 50";

            $studentStmt = $con->prepare($studentQuery);
            if ($studentStmt) {
                $studentStmt->bind_param("ssi", $searchPattern, $searchPattern, $idSearch);
                $studentStmt->execute();
                $studentResult = $studentStmt->get_result();

                while ($row = $studentResult->fetch_assoc()) {
                    $paper = new stdClass();
                    $paper->id = (int)$row['id'];
                    $paper->title = $row['title'] ?? '';
                    $paper->author = $row['author'] ?? '';
                    $paper->coauthors = [];
                    $paper->center = '';
                    $paper->campus = $row['campus'] ?? '';
                    $paper->category = $row['category'] ?? '';
                    $paper->paper_trail_no = '';
                    $paper->event = $row['event'] ?? '';
                    $paper->event_id = $row['event_id'] ? (int)$row['event_id'] : null;
                    $paper->event_name = $row['event_name'] ?? $row['event'] ?? '';
                    $paper->status = $row['status'] ?? '';
                    $paper->poster_submitted = 0;

                    if (!empty($row['coauthor'])) {
                        $coauthors = json_decode($row['coauthor'], true);
                        $paper->coauthors = is_array($coauthors) ? $coauthors : [];
                    }

                    $response->data[] = $paper;
                }
                $studentStmt->close();
            }
        }

        $response->status = true;
        $response->message = count($response->data) . ' paper(s) found from Symposium events';

        $con->close();

    } catch (Exception $e) {
        error_log("searchAcceptedPapers error: " . $e->getMessage());
        $response->status = false;
        $response->message = $e->getMessage();
    }

    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

// Submit Poster
if (isset($_POST['submitPoster'])) {
    while (ob_get_level()) ob_end_clean();
    ob_start();

    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->poster_id = null;
    $response->drive_file_id = null;

    try {
        if (!isset($_SESSION['userId']) || empty($_SESSION['userId'])) {
            throw new Exception("User not logged in");
        }

        $senderId = $_SESSION['userId'];
        $researchId = isset($_POST['research_id']) ? (int)$_POST['research_id'] : 0;
        $eventId = isset($_POST['event_id']) ? (int)$_POST['event_id'] : 0;
        $eventName = isset($_POST['event_name']) ? trim($_POST['event_name']) : '';
        $title = isset($_POST['title']) ? trim($_POST['title']) : '';
        $author = isset($_POST['author']) ? trim($_POST['author']) : '';
        $coAuthors = isset($_POST['coAuthors']) ? $_POST['coAuthors'] : '[]';
        $campus = isset($_POST['campus']) ? trim($_POST['campus']) : '';
        $center = isset($_POST['center']) ? trim($_POST['center']) : '';
        $category = isset($_POST['category']) ? trim($_POST['category']) : '';

        if ($researchId <= 0) {
            throw new Exception("Please select a valid research paper.");
        }

        if (!isset($_FILES['posterFile']) || $_FILES['posterFile']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("Poster file is required.");
        }

        $file = $_FILES['posterFile'];
        if ($file['type'] !== 'application/pdf' && !str_ends_with($file['name'], '.pdf')) {
            throw new Exception("Only PDF files are allowed.");
        }

        if ($file['size'] > 30 * 1024 * 1024) {
            throw new Exception("File size exceeds 30MB limit.");
        }

        $con = new mysqli($host, $username, $pass, $dbName);
        if ($con->connect_error) {
            throw new Exception("Database connection failed: " . $con->connect_error);
        }

        // Start transaction
        $con->begin_transaction();

        // ===== CHECK IF POSTER ALREADY EXISTS =====
        $checkQuery = "SELECT id FROM poster_submissions WHERE research_id = ? AND sender_id = ?";
        $checkStmt = $con->prepare($checkQuery);
        $checkStmt->bind_param("ii", $researchId, $senderId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();

        if ($checkResult->num_rows > 0) {
            throw new Exception("A poster has already been submitted for this paper.");
        }
        $checkStmt->close();

        $flagCheckQuery = "SELECT poster_submitted, paper_trail_no, author, title, event, center, category FROM researchfile WHERE id = ?";
        $flagStmt = $con->prepare($flagCheckQuery);
        $flagStmt->bind_param("i", $researchId);
        $flagStmt->execute();
        $flagResult = $flagStmt->get_result();
        $researchData = $flagResult->fetch_assoc();
        $flagStmt->close();

        if ($researchData && isset($researchData['poster_submitted']) && $researchData['poster_submitted'] == 1) {
            throw new Exception("A poster has already been submitted for this paper.");
        }

        $paperTrailNo = $researchData['paper_trail_no'] ?? null;
        $authorName = $researchData['author'] ?? $author;
        $researchTitle = $researchData['title'] ?? $title;
        $eventType = $researchData['event'] ?? $eventName;
        $centerName = $researchData['center'] ?? $center;
        $categoryName = $researchData['category'] ?? $category;

        // ===== UPLOAD TO GOOGLE DRIVE =====
        if (!class_exists('GoogleDriveService')) {
            throw new Exception("GoogleDriveService class not found");
        }

        $drive = new GoogleDriveService();

        // Clean folder names
        $cleanEventName = cleanFolderNameForDrive($eventType);
        $cleanTitle = preg_replace('/[^\w\s\-]/', '', $researchTitle);
        $cleanTitle = preg_replace('/\s+/', '_', $cleanTitle);
        $cleanTitle = substr($cleanTitle, 0, 80);

        // ===== LOCATION 1: Event -> Posters (for easy access) =====
        $eventFolderId = $drive->findOrCreateFolder($cleanEventName, null);
        if (!$eventFolderId) throw new Exception("Failed to create event folder");

        $posterFolderId = $drive->findOrCreateFolder('Posters', $eventFolderId);
        if (!$posterFolderId) throw new Exception("Failed to create Posters folder");

        // Generate filename with paper trail no prefix
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $paperTrailPrefix = !empty($paperTrailNo) ? $paperTrailNo . ' - ' : '';
        $posterFileName = $paperTrailPrefix . 'Poster - ' . $cleanTitle . '.' . $extension;

        // Upload to Event -> Posters folder
        $uploadResult = $drive->uploadFile($file['tmp_name'], $posterFileName, $posterFolderId);
        if (!$uploadResult['success'] || empty($uploadResult['id'])) {
            throw new Exception("Failed to upload poster: " . ($uploadResult['error'] ?? 'Unknown error'));
        }

        $drive->makeFilePublic($uploadResult['id']);
        $fileId = $uploadResult['id'];
        $viewUrl = "https://drive.google.com/file/d/{$fileId}/preview";
        $downloadUrl = "https://drive.google.com/uc?id={$fileId}&export=download";

        // ===== LOCATION 2: Paper Trail -> Symposium -> Year -> {Paper Trail No} - {Title} =====
        // Upload poster to Paper Trail folder structure
        $paperTrailPosterResult = uploadPosterToPaperTrail(
            $con,
            $file['tmp_name'],
            $posterFileName,
            $researchId,
            $paperTrailNo,
            $researchTitle,
            $authorName,
            $eventType
        );

        $posterPaperTrailFileId = null;
        $posterPaperTrailViewUrl = null;
        $posterPaperTrailDownloadUrl = null;
        $paperTrailFolderId = null;

        if ($paperTrailPosterResult && $paperTrailPosterResult['success']) {
            $posterPaperTrailFileId = $paperTrailPosterResult['drive_file_id'] ?? null;
            $posterPaperTrailViewUrl = $paperTrailPosterResult['drive_view_url'] ?? null;
            $posterPaperTrailDownloadUrl = $paperTrailPosterResult['drive_download_url'] ?? null;
            $paperTrailFolderId = $paperTrailPosterResult['research_folder_id'] ?? null;
            error_log("Poster uploaded to Paper Trail: " . $posterPaperTrailFileId);
        } else {
            error_log("Failed to upload poster to Paper Trail: " . ($paperTrailPosterResult['error'] ?? 'Unknown error'));
        }

        // ===== SAVE TO DATABASE =====
        $insertQuery = "INSERT INTO poster_submissions (
            research_id, paper_trail_no, sender_id, event_id,
            event_folder_id, poster_folder_id,
            poster_drive_file_id, poster_drive_view_url, poster_drive_download_url,
            poster_file_name, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $insertStmt = $con->prepare($insertQuery);
        if (!$insertStmt) {
            throw new Exception("Prepare failed: " . $con->error);
        }

        $insertStmt->bind_param(
            'isssssssss',
            $researchId,
            $paperTrailNo,
            $senderId,
            $eventId,
            $eventFolderId,
            $posterFolderId,
            $fileId,
            $viewUrl,
            $downloadUrl,
            $posterFileName
        );

        if (!$insertStmt->execute()) {
            throw new Exception("Failed to save poster: " . $insertStmt->error);
        }

        $posterId = $con->insert_id;
        $insertStmt->close();

        // ===== UPDATE PAPER_TRAIL_FILES WITH POSTER INFO =====
        if ($posterPaperTrailFileId && $paperTrailFolderId) {
            // Check if paper_trail_files record exists for this research
            $checkPaperTrailQuery = "SELECT id FROM paper_trail_files WHERE research_id = ? AND paper_trail_no = ? AND submission_type = 'Symposium' LIMIT 1";
            $checkPaperTrailStmt = $con->prepare($checkPaperTrailQuery);
            $checkPaperTrailStmt->bind_param("is", $researchId, $paperTrailNo);
            $checkPaperTrailStmt->execute();
            $checkPaperTrailResult = $checkPaperTrailStmt->get_result();
            
            if ($checkPaperTrailResult->num_rows > 0) {
                // Update existing record with poster info
                $updatePaperTrailQuery = "UPDATE paper_trail_files SET 
                    poster_drive_view_url = ?,
                    poster_drive_download_url = ?
                    WHERE research_id = ? AND paper_trail_no = ? AND submission_type = 'Symposium'";
                
                $updatePaperTrailStmt = $con->prepare($updatePaperTrailQuery);
                $updatePaperTrailStmt->bind_param("ssis", $posterPaperTrailViewUrl, $posterPaperTrailDownloadUrl, $researchId, $paperTrailNo);
                $updatePaperTrailStmt->execute();
                $updatePaperTrailStmt->close();
                error_log("Updated paper_trail_files with poster info for research_id: $researchId");
            } else {
                // Insert new paper_trail_files record
                $insertPaperTrailQuery = "INSERT INTO paper_trail_files (
                    research_id, paper_trail_no, submission_type, year,
                    paper_trail_root_id, submission_folder_id, year_folder_id,
                    research_folder_id, research_folder_name,
                    poster_drive_view_url, poster_drive_download_url,
                    created_at
                ) VALUES (?, ?, 'Symposium', ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
                
                $currentYear = date('Y');
                $paperTrailRootId = $paperTrailPosterResult['paper_trail_root_id'] ?? null;
                $submissionFolderId = $paperTrailPosterResult['sub_type_folder_id'] ?? null;
                $yearFolderId = $paperTrailPosterResult['year_folder_id'] ?? null;
                $researchFolderName = $paperTrailPosterResult['research_folder_name'] ?? null;
                
                $insertPaperTrailStmt = $con->prepare($insertPaperTrailQuery);
                $insertPaperTrailStmt->bind_param(
                    'ississsssss',
                    $researchId,
                    $paperTrailNo,
                    $currentYear,
                    $paperTrailRootId,
                    $submissionFolderId,
                    $yearFolderId,
                    $paperTrailFolderId,
                    $researchFolderName,
                    $posterPaperTrailViewUrl,
                    $posterPaperTrailDownloadUrl
                );
                $insertPaperTrailStmt->execute();
                $insertPaperTrailStmt->close();
                error_log("Inserted new paper_trail_files record for research_id: $researchId with poster info");
            }
            $checkPaperTrailStmt->close();
        }

        // ===== UPDATE RESEARCHFILE POSTER_SUBMITTED FLAG =====
        $updateFlagQuery = "UPDATE researchfile SET poster_submitted = 1 WHERE id = ?";
        $updateStmt = $con->prepare($updateFlagQuery);
        $updateStmt->bind_param("i", $researchId);
        if (!$updateStmt->execute()) {
            throw new Exception("Failed to update poster_submitted flag: " . $updateStmt->error);
        }
        $updateStmt->close();

        // Commit transaction
        $con->commit();

        $response->status = true;
        $response->message = "Poster submitted successfully!";
        $response->poster_id = $posterId;
        $response->paper_trail_no = $paperTrailNo;
        $response->drive_file_id = $fileId;
        $response->drive_view_url = $viewUrl;
        $response->paper_trail_file_id = $posterPaperTrailFileId;

        $con->close();

    } catch (Exception $e) {
        // Rollback transaction on error
        if (isset($con) && $con) {
            $con->rollback();
        }
        error_log("submitPoster error: " . $e->getMessage());
        $response->status = false;
        $response->message = $e->getMessage();
    }

    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

// Helper function to upload poster to Paper Trail
function uploadPosterToPaperTrail($con, $tempFilePath, $fileName, $researchId, $paperTrailNo, $title, $author, $eventType)
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

        // Paper Trail -> Symposium -> Year -> {paper_trail_no} - {title}
        $paperTrailRootId = $drive->findOrCreateFolder('Paper Trail', null);
        if (!$paperTrailRootId) {
            return ['success' => false, 'error' => "Failed to create Paper Trail root folder"];
        }

        $symposiumFolderId = $drive->findOrCreateFolder('Symposium', $paperTrailRootId);
        if (!$symposiumFolderId) {
            return ['success' => false, 'error' => "Failed to create Symposium folder"];
        }

        $yearFolderId = $drive->findOrCreateFolder($year, $symposiumFolderId);
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

        // Check if research folder already exists
        $researchFolderId = $drive->findOrCreateFolder($researchFolderName, $yearFolderId);
        if (!$researchFolderId) {
            return ['success' => false, 'error' => "Failed to create research folder: $researchFolderName"];
        }

        // Poster file name
        $posterFileName = 'Poster.pdf';

        $uploadResult = $drive->uploadFile($tempFilePath, $posterFileName, $researchFolderId);

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
            'sub_type_folder_id' => $symposiumFolderId,
            'year_folder_id' => $yearFolderId,
            'research_folder_id' => $researchFolderId,
            'research_folder_name' => $researchFolderName,
            'year' => $year,
            'submission_type' => 'Symposium',
            'file_name' => $posterFileName,
            'paper_trail_no' => $paperTrailNo,
            'author_last_name' => $authorLastName
        ];

    } catch (Exception $e) {
        error_log("Poster Paper Trail upload failed: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Get user's submitted posters
if (isset($_POST['getUserPosters'])) {
    while (ob_get_level()) ob_end_clean();
    ob_start();

    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->data = [];

    try {
        if (!isset($_SESSION['userId']) || empty($_SESSION['userId'])) {
            throw new Exception("User not logged in");
        }

        $userId = $_SESSION['userId'];
        $searchTerm = isset($_POST['search']) ? trim($_POST['search']) : '';
        $status = isset($_POST['status']) ? trim($_POST['status']) : '';

        $con = new mysqli($host, $username, $pass, $dbName);
        if ($con->connect_error) {
            throw new Exception("Database connection failed: " . $con->connect_error);
        }

        $query = "SELECT 
                    ps.*,
                    rf.title,
                    rf.author,
                    rf.coauthor,
                    rf.event,
                    rf.event_id,
                    rf.poster_submitted,
                    el.name as event_name
                  FROM poster_submissions ps
                  LEFT JOIN researchfile rf ON ps.research_id = rf.id
                  LEFT JOIN event_list el ON rf.event_id = el.id
                  WHERE ps.sender_id = ?";

        $params = [$userId];
        $types = "i";

        if (!empty($status)) {
            $query .= " AND ps.status = ?";
            $params[] = $status;
            $types .= "s";
        }

        if (!empty($searchTerm)) {
            $searchPattern = '%' . $con->real_escape_string($searchTerm) . '%';
            $query .= " AND (rf.title LIKE ? OR rf.author LIKE ? OR el.name LIKE ? OR ps.paper_trail_no LIKE ?)";
            $params[] = $searchPattern;
            $params[] = $searchPattern;
            $params[] = $searchPattern;
            $params[] = $searchPattern;
            $types .= "ssss";
        }

        $query .= " ORDER BY ps.created_at DESC";

        $stmt = $con->prepare($query);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $con->error);
        }

        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $poster = new stdClass();
            $poster->id = (int)$row['id'];
            $poster->research_id = (int)$row['research_id'];
            $poster->paper_trail_no = $row['paper_trail_no'] ?? '';
            $poster->title = $row['title'] ?? '';
            $poster->author = $row['author'] ?? '';
            $poster->event_name = $row['event_name'] ?? $row['event'] ?? '';
            $poster->status = $row['status'] ?? 'pending';
            $poster->poster_file_name = $row['poster_file_name'] ?? '';
            $poster->poster_drive_view_url = $row['poster_drive_view_url'] ?? '';
            $poster->poster_drive_download_url = $row['poster_drive_download_url'] ?? '';
            $poster->poster_submitted = (int)($row['poster_submitted'] ?? 0);
            $poster->created_at = $row['created_at'] ?? null;
            $poster->updated_at = $row['updated_at'] ?? null;
            
            $response->data[] = $poster;
        }

        $response->status = true;
        $response->message = count($response->data) . ' poster(s) found';

        $stmt->close();
        $con->close();

    } catch (Exception $e) {
        error_log("getUserPosters error: " . $e->getMessage());
        $response->status = false;
        $response->message = $e->getMessage();
    }

    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

if (isset($_POST['updatePoster'])) {
    while (ob_get_level()) ob_end_clean();
    ob_start();

    $response = new stdClass();
    $response->status = false;
    $response->message = '';

    try {
        if (!isset($_SESSION['userId']) || empty($_SESSION['userId'])) {
            throw new Exception("User not logged in");
        }

        $senderId = $_SESSION['userId'];
        $posterId = isset($_POST['poster_id']) ? (int)$_POST['poster_id'] : 0;
        $researchId = isset($_POST['research_id']) ? (int)$_POST['research_id'] : 0;

        if ($posterId <= 0) {
            throw new Exception("Invalid poster ID");
        }

        if (!isset($_FILES['posterFile']) || $_FILES['posterFile']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("Poster file is required.");
        }

        $file = $_FILES['posterFile'];
        if ($file['type'] !== 'application/pdf' && !str_ends_with($file['name'], '.pdf')) {
            throw new Exception("Only PDF files are allowed.");
        }

        if ($file['size'] > 10 * 1024 * 1024) {
            throw new Exception("File size exceeds 10MB limit.");
        }

        $con = new mysqli($host, $username, $pass, $dbName);
        if ($con->connect_error) {
            throw new Exception("Database connection failed: " . $con->connect_error);
        }

        // Get existing poster record with research file title
        $getQuery = "SELECT ps.*, rf.title as research_title 
                     FROM poster_submissions ps
                     LEFT JOIN researchfile rf ON ps.research_id = rf.id
                     WHERE ps.id = ? AND ps.sender_id = ?";
        $getStmt = $con->prepare($getQuery);
        $getStmt->bind_param("ii", $posterId, $senderId);
        $getStmt->execute();
        $getResult = $getStmt->get_result();
        $poster = $getResult->fetch_assoc();

        if (!$poster) {
            throw new Exception("Poster not found or you don't have permission to edit it.");
        }
        $getStmt->close();

        // Initialize Google Drive service
        if (!class_exists('GoogleDriveService')) {
            throw new Exception("GoogleDriveService class not found");
        }

        $drive = new GoogleDriveService();

        // ===== DELETE OLD FILE FROM GOOGLE DRIVE (Move to Trash) =====
        $oldFileId = $poster['poster_drive_file_id'];
        if (!empty($oldFileId)) {
            try {
                error_log("Attempting to move old poster file to trash: " . $oldFileId);
                $result = $drive->trashFile($oldFileId);
                if ($result) {
                    error_log("Old poster file successfully moved to trash: " . $oldFileId);
                } else {
                    error_log("Failed to move old poster file to trash: " . $oldFileId);
                }
            } catch (Exception $e) {
                error_log("Exception while trashing old poster file: " . $e->getMessage());
                // Continue with upload even if trash fails
            }
        }

        // ===== UPLOAD NEW FILE WITH RESEARCH TITLE =====
        // Use the research title from the database
        $researchTitle = $poster['research_title'] ?? 'Poster';
        $cleanTitle = preg_replace('/[^\w\s\-]/', '', $researchTitle);
        $cleanTitle = preg_replace('/\s+/', '_', $cleanTitle);
        $cleanTitle = substr($cleanTitle, 0, 80);

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $paperTrailPrefix = !empty($poster['paper_trail_no']) ? $poster['paper_trail_no'] . ' - ' : '';
        $posterFileName = $paperTrailPrefix . 'Poster - ' . $cleanTitle . '.' . $extension;

        error_log("Uploading new poster file: " . $posterFileName . " to folder: " . $poster['poster_folder_id']);

        $uploadResult = $drive->uploadFile($file['tmp_name'], $posterFileName, $poster['poster_folder_id']);
        if (!$uploadResult['success'] || empty($uploadResult['id'])) {
            throw new Exception("Failed to upload new poster: " . ($uploadResult['error'] ?? 'Unknown error'));
        }

        $drive->makeFilePublic($uploadResult['id']);
        $fileId = $uploadResult['id'];
        $viewUrl = "https://drive.google.com/file/d/{$fileId}/preview";
        $downloadUrl = "https://drive.google.com/uc?id={$fileId}&export=download";

        // ===== UPDATE DATABASE =====
        $updateQuery = "UPDATE poster_submissions SET 
            poster_drive_file_id = ?,
            poster_drive_view_url = ?,
            poster_drive_download_url = ?,
            poster_file_name = ?,
            status = 'pending',
            updated_at = NOW()
            WHERE id = ? AND sender_id = ?";

        $updateStmt = $con->prepare($updateQuery);
        if (!$updateStmt) {
            throw new Exception("Prepare failed: " . $con->error);
        }

        $updateStmt->bind_param(
            'ssssii',
            $fileId,
            $viewUrl,
            $downloadUrl,
            $posterFileName,
            $posterId,
            $senderId
        );

        if (!$updateStmt->execute()) {
            throw new Exception("Failed to update poster: " . $updateStmt->error);
        }
        $updateStmt->close();

        $response->status = true;
        $response->message = "Poster updated successfully! Old file moved to trash.";
        $response->new_file_id = $fileId;
        $response->old_file_id = $oldFileId;
        $con->close();

    } catch (Exception $e) {
        error_log("updatePoster error: " . $e->getMessage());
        $response->status = false;
        $response->message = $e->getMessage();
    }

    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}
// Delete Poster
if (isset($_POST['deletePoster'])) {
    while (ob_get_level()) ob_end_clean();
    ob_start();

    $response = new stdClass();
    $response->status = false;
    $response->message = '';

    try {
        if (!isset($_SESSION['userId']) || empty($_SESSION['userId'])) {
            throw new Exception("User not logged in");
        }

        $senderId = $_SESSION['userId'];
        $posterId = isset($_POST['poster_id']) ? (int)$_POST['poster_id'] : 0;
        $researchId = isset($_POST['research_id']) ? (int)$_POST['research_id'] : 0;

        if ($posterId <= 0) {
            throw new Exception("Invalid poster ID");
        }

        $con = new mysqli($host, $username, $pass, $dbName);
        if ($con->connect_error) {
            throw new Exception("Database connection failed: " . $con->connect_error);
        }

        // Start transaction
        $con->begin_transaction();

        // Get existing poster record
        $getQuery = "SELECT * FROM poster_submissions WHERE id = ? AND sender_id = ?";
        $getStmt = $con->prepare($getQuery);
        $getStmt->bind_param("ii", $posterId, $senderId);
        $getStmt->execute();
        $getResult = $getStmt->get_result();
        $poster = $getResult->fetch_assoc();

        if (!$poster) {
            throw new Exception("Poster not found or you don't have permission to delete it.");
        }
        $getStmt->close();

        // Initialize Google Drive service
        if (!class_exists('GoogleDriveService')) {
            throw new Exception("GoogleDriveService class not found");
        }

        $drive = new GoogleDriveService();

        // ===== DELETE FILE FROM GOOGLE DRIVE (Move to Trash) =====
        $oldFileId = $poster['poster_drive_file_id'];
        if (!empty($oldFileId)) {
            try {
                error_log("Attempting to move poster file to trash during delete: " . $oldFileId);
                $result = $drive->trashFile($oldFileId);
                if ($result) {
                    error_log("Poster file successfully moved to trash: " . $oldFileId);
                } else {
                    error_log("Failed to move poster file to trash: " . $oldFileId);
                }
            } catch (Exception $e) {
                error_log("Exception while trashing poster file: " . $e->getMessage());
                // Continue with database deletion even if trash fails
            }
        }

        // ===== DELETE FROM DATABASE =====
        $deleteQuery = "DELETE FROM poster_submissions WHERE id = ? AND sender_id = ?";
        $deleteStmt = $con->prepare($deleteQuery);
        $deleteStmt->bind_param("ii", $posterId, $senderId);

        if (!$deleteStmt->execute()) {
            throw new Exception("Failed to delete poster: " . $deleteStmt->error);
        }
        $deleteStmt->close();

        // ===== RESET POSTER_SUBMITTED FLAG IN RESEARCHFILE =====
        $resetQuery = "UPDATE researchfile SET poster_submitted = 0 WHERE id = ?";
        $resetStmt = $con->prepare($resetQuery);
        $resetStmt->bind_param("i", $researchId);
        if (!$resetStmt->execute()) {
            throw new Exception("Failed to reset poster_submitted flag: " . $resetStmt->error);
        }
        $resetStmt->close();

        // Commit transaction
        $con->commit();

        $response->status = true;
        $response->message = "Poster deleted successfully! File moved to trash.";
        $con->close();

    } catch (Exception $e) {
        // Rollback transaction on error
        if (isset($con) && $con) {
            $con->rollback();
        }
        error_log("deletePoster error: " . $e->getMessage());
        $response->status = false;
        $response->message = $e->getMessage();
    }

    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}