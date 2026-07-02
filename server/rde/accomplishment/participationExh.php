<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/drive_errors.log');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Start output buffering
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

// Session handling
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/driver_config.php';
require_once __DIR__ . '/../../db.php';

date_default_timezone_set('Asia/Manila');

try {
    $driveService = new GoogleDriveService();
    error_log("Google Drive Service initialized successfully");
} catch (Exception $e) {
    error_log("Failed to initialize Google Drive Service: " . $e->getMessage());
    $driveService = null;
}

function cleanAccomplishmentFolderName($name) {
    if (empty($name)) {
        return 'Untitled_' . time();
    }
    $clean = preg_replace('/[<>:"\/\\|?*]/', '', $name);
    $clean = preg_replace('/\s+/', ' ', $clean);
    $clean = trim($clean);
    $clean = rtrim($clean, '.,');
    if (strlen($clean) > 200) {
        $clean = substr($clean, 0, 197) . '...';
    }
    return $clean;
}

function getOrCreateFolder($driveService, $parentId, $folderName) {
    $folderId = $driveService->findOrCreateFolder($folderName, $parentId);
    if (!$folderId) {
        throw new Exception("Failed to create folder: $folderName");
    }
    return $folderId;
}

function getCurrentAccomplishmentYearQuarter() {
    $currentDate = new DateTime();
    $year = (int)$currentDate->format('Y');
    $month = (int)$currentDate->format('m');
    
    $quarter = (int)ceil($month / 3);
    $startMonth = (int)((($quarter - 1) * 3) + 1);
    $endMonth = (int)($quarter * 3);
    
    $quarterName = [
        1 => '1st',
        2 => '2nd',
        3 => '3rd',
        4 => '4th'
    ];
    
    return [
        'year' => $year,
        'quarter' => $quarter,
        'quarter_name' => $quarterName[(int)$quarter],
        'folder_name' => "{$year} RDE {$quarterName[(int)$quarter]} Quarter Accomplishment",
        'start_month' => date('F', mktime(0, 0, 0, $startMonth, 1, $year)),
        'end_month' => date('F', mktime(0, 0, 0, $endMonth + 1, 0, $year)),
        'start_date' => date('Y-m-d', mktime(0, 0, 0, $startMonth, 1, $year)),
        'end_date' => date('Y-m-d', mktime(0, 0, 0, $endMonth + 1, 0, $year))
    ];
}

function createParticipationFolderStructure($driveService, $type, $location, $activityTitle, $date, $accomplishmentYear, $accomplishmentQuarter) {
    $quarterName = [
        1 => '1st',
        2 => '2nd',
        3 => '3rd',
        4 => '4th'
    ];
    
    // Root: 2026 RDE 2nd Quarter Accomplishment
    $rootFolderName = "{$accomplishmentYear} RDE {$quarterName[$accomplishmentQuarter]} Quarter Accomplishment";
    $rootFolderId = $driveService->findOrCreateFolder($rootFolderName);
    if (!$rootFolderId) {
        throw new Exception("Failed to create root folder: $rootFolderName");
    }
    
    // Category: Participation
    $categoryFolderName = 'Participation';
    $categoryFolderId = getOrCreateFolder($driveService, $rootFolderId, $categoryFolderName);
    
    // Location: Campus or Center
    $locationFolderId = null;
    if ($type === 'campus') {
        $campusParentId = getOrCreateFolder($driveService, $categoryFolderId, 'Campus');
        $locationFolderId = getOrCreateFolder($driveService, $campusParentId, $location);
    } else if ($type === 'center') {
        $centersParentId = getOrCreateFolder($driveService, $categoryFolderId, 'Centers');
        $locationFolderId = getOrCreateFolder($driveService, $centersParentId, $location);
    } else {
        $locationFolderId = getOrCreateFolder($driveService, $categoryFolderId, $location);
    }
    
    // Activity folder: Pasidungog 2025 (without date in name)
    $cleanTitle = cleanAccomplishmentFolderName($activityTitle);
    $activityFolderId = getOrCreateFolder($driveService, $locationFolderId, $cleanTitle);
    
    // Photos folder inside activity folder
    $photosFolderId = getOrCreateFolder($driveService, $activityFolderId, 'photos');
    
    return [
        'root_folder_id' => $rootFolderId,
        'root_folder_name' => $rootFolderName,
        'category_folder_id' => $categoryFolderId,
        'category_folder_name' => $categoryFolderName,
        'location_folder_id' => $locationFolderId,
        'location_folder_name' => $location,
        'location_type' => $type,
        'activity_folder_id' => $activityFolderId,
        'activity_folder_name' => $cleanTitle,
        'photos_folder_id' => $photosFolderId,
        'year' => $accomplishmentYear,
        'quarter' => $accomplishmentQuarter
    ];
}

function uploadFileToDrive($driveService, $fileTemp, $fileName, $folderId) {
    if (!$driveService || empty($fileTemp) || !file_exists($fileTemp)) {
        return null;
    }
    
    // Sanitize filename
    $cleanFileName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $fileName);
    
    $result = $driveService->uploadFile($fileTemp, $cleanFileName, $folderId);
    
    if ($result && $result['success']) {
        $driveService->makeFilePublic($result['id']);
        return [
            'file_id' => $result['id'],
            'view_url' => "https://drive.google.com/file/d/{$result['id']}/preview",
            'download_url' => "https://drive.google.com/uc?id={$result['id']}&export=download",
            'filename' => $cleanFileName
        ];
    }
    
    return null;
}

function uploadPhotosToDrive($driveService, $photos, $photosFolderId) {
    $uploadedPhotos = [];
    
    if (empty($photos) || empty($photosFolderId)) {
        return $uploadedPhotos;
    }
    
    $photoArray = [];
    if (isset($photos['tmp_name'])) {
        $photoArray = [$photos];
    } else {
        $photoArray = $photos;
    }
    
    foreach ($photoArray as $photo) {
        if (isset($photo['error']) && $photo['error'] === UPLOAD_ERR_OK) {
            $timestamp = time() . '_' . uniqid();
            $cleanName = preg_replace('/[^a-zA-Z0-9\._-]/', '', $photo['name']);
            $fileName = $timestamp . '_' . $cleanName;
            
            $result = $driveService->uploadFile($photo['tmp_name'], $fileName, $photosFolderId);
            
            if ($result && $result['success']) {
                $driveService->makeFilePublic($result['id']);
                $uploadedPhotos[] = [
                    'file_id' => $result['id'],
                    'view_url' => "https://drive.google.com/file/d/{$result['id']}/preview",
                    'download_url' => "https://drive.google.com/uc?id={$result['id']}&export=download",
                    'filename' => $cleanName,
                    'original_name' => $photo['name']
                ];
            }
        }
    }
    return $uploadedPhotos;
}

function deleteFileFromDrive($driveService, $fileId) {
    if (empty($fileId)) return true;
    try {
        return $driveService->trashFile($fileId);
    } catch (Exception $e) {
        error_log("Failed to delete file $fileId: " . $e->getMessage());
        return false;
    }
}

$con = new mysqli($host, $username, $pass, $dbName);
if ($con->connect_error) {
    echo json_encode([
        'status' => false,
        'message' => 'Database connection failed: ' . $con->connect_error
    ]);
    exit;
}

if (isset($_POST['action']) && $_POST['action'] === 'fetch_participation') {
    try {
        $response = [
            'success' => true,
            'data' => [],
            'summary' => [
                'totalActivities' => 0,
                'totalProducts' => 0
            ],
            'pagination' => [
                'next_cursor' => null,
                'has_more' => false
            ]
        ];

        $query = "SELECT 
                    id,
                    type,
                    location,
                    title,
                    products,
                    in_charge as inCharge,
                    venue,
                    sponsoring_agency as sponsoringAgency,
                    date,
                    activity_proposal_view_url,
                    activity_proposal_download_url,
                    photo_documentation_view_urls,
                    photo_documentation_download_urls,
                    activity_report_view_url,
                    activity_report_download_url,
                    created_at,
                    updated_at
                  FROM participation_research";

        $conditions = [];
        $params = [];
        $types = '';

        if (isset($_POST['campus']) && !empty($_POST['campus'])) {
            $conditions[] = "location = ? AND type = 'campus'";
            $params[] = $_POST['campus'];
            $types .= 's';
        }

        if (isset($_POST['center']) && !empty($_POST['center'])) {
            $conditions[] = "location = ? AND type = 'center'";
            $params[] = $_POST['center'];
            $types .= 's';
        }

        if (isset($_POST['cursor']) && !empty($_POST['cursor'])) {
            $conditions[] = "id < ?";
            $params[] = (int)$_POST['cursor'];
            $types .= 'i';
        }

        if (!empty($conditions)) {
            $query .= " WHERE " . implode(" AND ", $conditions);
        }

        $query .= " ORDER BY id DESC LIMIT 21";

        $stmt = $con->prepare($query);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $data = [];
        $totalProducts = 0;
        $rowCount = 0;
        $hasMore = false;
        $lastId = null;

        while ($row = $result->fetch_assoc()) {
            $rowCount++;
            if ($rowCount > 20) {
                $hasMore = true;
                break;
            }

            if (!empty($row['products'])) {
                $products = json_decode($row['products'], true);
                if (is_array($products)) {
                    $totalProducts += count($products);
                }
            }

            // Build paper trail links as JSON for frontend compatibility
            $paperTrailLinks = [];
            
            if (!empty($row['activity_proposal_view_url']) || !empty($row['activity_proposal_download_url'])) {
                $paperTrailLinks['activityProposal'] = [
                    'view_url' => $row['activity_proposal_view_url'],
                    'download_url' => $row['activity_proposal_download_url']
                ];
            }
            
            if (!empty($row['photo_documentation_view_urls'])) {
                $viewUrls = json_decode($row['photo_documentation_view_urls'], true);
                $downloadUrls = json_decode($row['photo_documentation_download_urls'], true);
                
                if (is_array($viewUrls) && count($viewUrls) > 0) {
                    $paperTrailLinks['photoDocumentation'] = [];
                    foreach ($viewUrls as $index => $viewUrl) {
                        $paperTrailLinks['photoDocumentation'][] = [
                            'view_url' => $viewUrl,
                            'download_url' => isset($downloadUrls[$index]) ? $downloadUrls[$index] : $viewUrl
                        ];
                    }
                }
            }
            
            if (!empty($row['activity_report_view_url']) || !empty($row['activity_report_download_url'])) {
                $paperTrailLinks['activityReport'] = [
                    'view_url' => $row['activity_report_view_url'],
                    'download_url' => $row['activity_report_download_url']
                ];
            }

            $row['paperTrailLinks'] = $paperTrailLinks;

            $lastId = $row['id'];
            $data[] = $row;
        }

        $stmt->close();

        $countQuery = "SELECT COUNT(*) as total FROM participation_research";
        $countResult = $con->query($countQuery);
        $totalCount = 0;
        if ($countResult) {
            $countRow = $countResult->fetch_assoc();
            $totalCount = (int)$countRow['total'];
        }

        $response['data'] = $data;
        $response['summary'] = [
            'totalActivities' => $totalCount,
            'totalProducts' => $totalProducts
        ];
        $response['pagination'] = [
            'next_cursor' => $hasMore ? $lastId : null,
            'has_more' => $hasMore
        ];

        echo json_encode($response);

    } catch (Exception $e) {
        error_log('Error in fetch_participation: ' . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

if (isset($_POST['action']) && $_POST['action'] === 'add_participation') {
    try {
        // Get form data
        $type = isset($_POST['type']) ? $_POST['type'] : '';
        $location = isset($_POST['location']) ? $_POST['location'] : '';
        $title = isset($_POST['title']) ? $_POST['title'] : '';
        $inCharge = isset($_POST['inCharge']) ? $_POST['inCharge'] : '';
        $venue = isset($_POST['venue']) ? $_POST['venue'] : '';
        $sponsoringAgency = isset($_POST['sponsoringAgency']) ? $_POST['sponsoringAgency'] : '';
        $date = isset($_POST['date']) ? $_POST['date'] : '';
        $products = isset($_POST['products']) ? $_POST['products'] : '[]';

        // Validate required fields
        if (empty($type) || empty($location) || empty($title) || empty($inCharge) || empty($venue) || empty($sponsoringAgency) || empty($date)) {
            throw new Exception('All required fields must be filled');
        }

        // ===== INITIALIZE DRIVE SERVICE =====
        require_once __DIR__ . '/../../../config/driver_config.php';
        $drive = new GoogleDriveService();
        
        if (!$drive) {
            throw new Exception('Failed to initialize Google Drive service');
        }

        // ===== CREATE FOLDER STRUCTURE =====
        $accomplishmentInfo = getCurrentAccomplishmentYearQuarter();
        $folderStructure = createParticipationFolderStructure(
            $drive,
            $type,
            $location,
            $title,
            $date,
            $accomplishmentInfo['year'],
            $accomplishmentInfo['quarter']
        );

        if (empty($folderStructure['activity_folder_id'])) {
            throw new Exception('Failed to create activity folder structure');
        }

        error_log("=== PARTICIPATION UPLOAD START ===");
        error_log("Activity Folder ID: " . $folderStructure['activity_folder_id']);
        error_log("Photos Folder ID: " . $folderStructure['photos_folder_id']);
        error_log("Files received: " . json_encode(array_keys($_FILES)));

        // Initialize URLs
        $activityProposalViewUrl = '';
        $activityProposalDownloadUrl = '';
        $activityReportViewUrl = '';
        $activityReportDownloadUrl = '';
        $photoViewUrls = [];
        $photoDownloadUrls = [];

        // ===== UPLOAD ACTIVITY PROPOSAL =====
        if (isset($_FILES['activityProposal']) && $_FILES['activityProposal']['error'] === UPLOAD_ERR_OK) {
            $fileTemp = $_FILES['activityProposal']['tmp_name'];
            $fileSize = filesize($fileTemp);
            $fileSizeMB = round($fileSize / 1024 / 1024, 2);
            
            error_log("Activity Proposal - Size: {$fileSizeMB}MB, Temp: {$fileTemp}");
            
            if ($fileSize > 500 * 1024 * 1024 * 1024) {
                throw new Exception("Activity Proposal file is too large: {$fileSizeMB}MB (max 500GB)");
            }
            
            $cleanTitle = preg_replace('/[^a-zA-Z0-9_-]/', '_', $title);
            $fileName = 'Activity_Proposal_' . $cleanTitle . '.pdf';
            
            error_log("Uploading Activity Proposal: $fileName to folder: " . $folderStructure['activity_folder_id']);
            
            $uploadResult = $drive->uploadFile($fileTemp, $fileName, $folderStructure['activity_folder_id']);
            
            error_log("Upload result: " . json_encode($uploadResult));
            
            if ($uploadResult && $uploadResult['success']) {
                $drive->makeFilePublic($uploadResult['id']);
                $activityProposalViewUrl = "https://drive.google.com/file/d/{$uploadResult['id']}/preview";
                $activityProposalDownloadUrl = "https://drive.google.com/uc?id={$uploadResult['id']}&export=download";
                error_log("Activity Proposal uploaded successfully: " . $uploadResult['id']);
            } else {
                $errorMsg = $uploadResult['error'] ?? 'Unknown error';
                error_log("Failed to upload Activity Proposal: $errorMsg");
                throw new Exception("Failed to upload Activity Proposal: $errorMsg");
            }
        } else {
            $errorCode = isset($_FILES['activityProposal']['error']) ? $_FILES['activityProposal']['error'] : 'NOT_SET';
            error_log("Activity Proposal not uploaded or error: $errorCode");
            // Continue without throwing - file might be optional
        }

        // ===== UPLOAD ACTIVITY REPORT =====
        if (isset($_FILES['activityReport']) && $_FILES['activityReport']['error'] === UPLOAD_ERR_OK) {
            $fileTemp = $_FILES['activityReport']['tmp_name'];
            $fileSize = filesize($fileTemp);
            $fileSizeMB = round($fileSize / 1024 / 1024, 2);
            
            error_log("Activity Report - Size: {$fileSizeMB}MB, Temp: {$fileTemp}");
            
            if ($fileSize > 500 * 1024 * 1024 * 1024) {
                throw new Exception("Activity Report file is too large: {$fileSizeMB}MB (max 500GB)");
            }
            
            $cleanTitle = preg_replace('/[^a-zA-Z0-9_-]/', '_', $title);
            $fileName = 'Activity_Report_' . $cleanTitle . '.pdf';
            
            error_log("Uploading Activity Report: $fileName");
            
            $uploadResult = $drive->uploadFile($fileTemp, $fileName, $folderStructure['activity_folder_id']);
            
            error_log("Upload result: " . json_encode($uploadResult));
            
            if ($uploadResult && $uploadResult['success']) {
                $drive->makeFilePublic($uploadResult['id']);
                $activityReportViewUrl = "https://drive.google.com/file/d/{$uploadResult['id']}/preview";
                $activityReportDownloadUrl = "https://drive.google.com/uc?id={$uploadResult['id']}&export=download";
                error_log("Activity Report uploaded successfully: " . $uploadResult['id']);
            } else {
                $errorMsg = $uploadResult['error'] ?? 'Unknown error';
                error_log("Failed to upload Activity Report: $errorMsg");
                // Don't throw, continue
            }
        } else {
            error_log("Activity Report not uploaded");
        }

        // ===== UPLOAD PHOTO DOCUMENTATION =====
        if (isset($_FILES['photoDocumentation']) && !empty($_FILES['photoDocumentation']['tmp_name'])) {
            $photos = $_FILES['photoDocumentation'];
            
            error_log("Photo Documentation received - is_array(tmp_name): " . (is_array($photos['tmp_name']) ? 'true' : 'false'));
            
            if (is_array($photos['tmp_name'])) {
                // Multiple files
                for ($i = 0; $i < count($photos['tmp_name']); $i++) {
                    if ($photos['error'][$i] === UPLOAD_ERR_OK) {
                        $fileTemp = $photos['tmp_name'][$i];
                        $fileSize = filesize($fileTemp);
                        $fileSizeMB = round($fileSize / 1024 / 1024, 2);
                        
                        error_log("Photo $i - Size: {$fileSizeMB}MB, Name: " . $photos['name'][$i]);
                        
                        if ($fileSize > 500 * 1024 * 1024 * 1024) {
                            error_log("Photo too large: " . $photos['name'][$i] . " ({$fileSizeMB}MB) - skipping");
                            continue;
                        }
                        
                        $timestamp = time() . '_' . uniqid();
                        $cleanName = preg_replace('/[^a-zA-Z0-9\._-]/', '', $photos['name'][$i]);
                        $fileName = $timestamp . '_' . $cleanName;
                        
                        error_log("Uploading photo: $fileName to folder: " . $folderStructure['photos_folder_id']);
                        
                        $uploadResult = $drive->uploadFile($fileTemp, $fileName, $folderStructure['photos_folder_id']);
                        
                        if ($uploadResult && $uploadResult['success']) {
                            $drive->makeFilePublic($uploadResult['id']);
                            $photoViewUrls[] = "https://drive.google.com/file/d/{$uploadResult['id']}/preview";
                            $photoDownloadUrls[] = "https://drive.google.com/uc?id={$uploadResult['id']}&export=download";
                            error_log("Photo uploaded successfully: " . $uploadResult['id']);
                        } else {
                            $errorMsg = $uploadResult['error'] ?? 'Unknown error';
                            error_log("Failed to upload photo: $errorMsg");
                        }
                    }
                }
            } else if (isset($photos['tmp_name']) && !empty($photos['tmp_name'])) {
                // Single file
                $fileTemp = $photos['tmp_name'];
                $fileSize = filesize($fileTemp);
                $fileSizeMB = round($fileSize / 1024 / 1024, 2);
                
                error_log("Single Photo - Size: {$fileSizeMB}MB, Name: " . $photos['name']);
                
                if ($fileSize > 500 * 1024 * 1024 * 1024) {
                    error_log("Photo too large: " . $photos['name'] . " ({$fileSizeMB}MB) - skipping");
                } else {
                    $timestamp = time() . '_' . uniqid();
                    $cleanName = preg_replace('/[^a-zA-Z0-9\._-]/', '', $photos['name']);
                    $fileName = $timestamp . '_' . $cleanName;
                    
                    error_log("Uploading single photo: $fileName");
                    
                    $uploadResult = $drive->uploadFile($fileTemp, $fileName, $folderStructure['photos_folder_id']);
                    
                    if ($uploadResult && $uploadResult['success']) {
                        $drive->makeFilePublic($uploadResult['id']);
                        $photoViewUrls[] = "https://drive.google.com/file/d/{$uploadResult['id']}/preview";
                        $photoDownloadUrls[] = "https://drive.google.com/uc?id={$uploadResult['id']}&export=download";
                        error_log("Photo uploaded successfully: " . $uploadResult['id']);
                    } else {
                        $errorMsg = $uploadResult['error'] ?? 'Unknown error';
                        error_log("Failed to upload photo: $errorMsg");
                    }
                }
            }
            
            error_log("Total photos uploaded: " . count($photoViewUrls));
        } else {
            error_log("No Photo Documentation files uploaded");
        }

        // Convert arrays to JSON strings
        $photoViewUrlsJson = !empty($photoViewUrls) ? json_encode($photoViewUrls) : '[]';
        $photoDownloadUrlsJson = !empty($photoDownloadUrls) ? json_encode($photoDownloadUrls) : '[]';

        error_log("Final URLs - Proposal: " . ($activityProposalViewUrl ? 'YES' : 'NO') . ", Report: " . ($activityReportViewUrl ? 'YES' : 'NO') . ", Photos: " . count($photoViewUrls));

        // ===== INSERT INTO DATABASE =====
        $query = "INSERT INTO participation_research (
            type, location, title, products, in_charge,
            venue, sponsoring_agency, date,
            activity_proposal_view_url, activity_proposal_download_url,
            activity_report_view_url, activity_report_download_url,
            photo_documentation_view_urls, photo_documentation_download_urls,
            drive_folder_id,
            drive_campus_folder_id,
            drive_center_folder_id,
            drive_activity_folder_id,
            drive_photos_folder_id,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

        $stmt = $con->prepare($query);
        
        // Determine which location folder ID to use
        $campusFolderId = ($type === 'campus') ? $folderStructure['location_folder_id'] : null;
        $centerFolderId = ($type === 'center') ? $folderStructure['location_folder_id'] : null;
        
        $stmt->bind_param(
            'sssssssssssssssssss',
            $type,
            $location,
            $title,
            $products,
            $inCharge,
            $venue,
            $sponsoringAgency,
            $date,
            $activityProposalViewUrl,
            $activityProposalDownloadUrl,
            $activityReportViewUrl,
            $activityReportDownloadUrl,
            $photoViewUrlsJson,
            $photoDownloadUrlsJson,
            $folderStructure['root_folder_id'],
            $campusFolderId,
            $centerFolderId,
            $folderStructure['activity_folder_id'],
            $folderStructure['photos_folder_id']
        );

        if (!$stmt->execute()) {
            throw new Exception('Failed to insert: ' . $stmt->error);
        }

        $newId = $stmt->insert_id;
        $stmt->close();

        error_log("=== PARTICIPATION UPLOAD COMPLETE: ID $newId ===");

        echo json_encode([
            'success' => true,
            'message' => 'Participation record added successfully with files uploaded to Google Drive',
            'id' => $newId,
            'drive_folders' => $folderStructure,
            'uploads' => [
                'activityProposal' => !empty($activityProposalViewUrl),
                'activityReport' => !empty($activityReportViewUrl),
                'photos' => count($photoViewUrls)
            ]
        ]);

    } catch (Exception $e) {
        error_log('Error in add_participation: ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

if (isset($_POST['action']) && $_POST['action'] === 'update_participation') {
    try {
        $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
        
        if ($id <= 0) {
            throw new Exception('Invalid ID for update');
        }

        // Get existing record to check for existing files
        $existingQuery = "SELECT 
            activity_proposal_view_url,
            activity_proposal_download_url,
            activity_report_view_url,
            activity_report_download_url,
            photo_documentation_view_urls,
            photo_documentation_download_urls
        FROM participation_research WHERE id = ?";
        
        $existingStmt = $con->prepare($existingQuery);
        $existingStmt->bind_param('i', $id);
        $existingStmt->execute();
        $existingResult = $existingStmt->get_result();
        $existingData = $existingResult->fetch_assoc();
        $existingStmt->close();

        // Get form data
        $type = isset($_POST['type']) ? $_POST['type'] : '';
        $location = isset($_POST['location']) ? $_POST['location'] : '';
        $title = isset($_POST['title']) ? $_POST['title'] : '';
        $inCharge = isset($_POST['inCharge']) ? $_POST['inCharge'] : '';
        $venue = isset($_POST['venue']) ? $_POST['venue'] : '';
        $sponsoringAgency = isset($_POST['sponsoringAgency']) ? $_POST['sponsoringAgency'] : '';
        $date = isset($_POST['date']) ? $_POST['date'] : '';
        $products = isset($_POST['products']) ? $_POST['products'] : '[]';

        // Validate required fields
        if (empty($type) || empty($location) || empty($title) || empty($inCharge) || empty($venue) || empty($sponsoringAgency) || empty($date)) {
            throw new Exception('All required fields must be filled');
        }

        // Initialize Drive Service
        // $driveService = new DriveService();
        $drive = $driveService; // Define $drive alias to avoid undefined variable error in photo uploading loop

        // Get or create the participation folder structure
        $accomplishmentInfo = getCurrentAccomplishmentYearQuarter();
        $folderStructure = createParticipationFolderStructure(
            $driveService,
            $type,
            $location,
            $title,
            $date,
            $accomplishmentInfo['year'],
            $accomplishmentInfo['quarter']
        );

        $activityProposalViewUrl = '';
        $activityProposalDownloadUrl = '';
        $activityReportViewUrl = '';
        $activityReportDownloadUrl = '';
        $photoViewUrls = [];
        $photoDownloadUrls = [];

        // Parse paperTrailLinks to respect file deletion from client
        if (isset($_POST['paperTrailLinks'])) {
            $paperTrail = json_decode($_POST['paperTrailLinks'], true);
            if (is_array($paperTrail)) {
                // Proposal
                if (!empty($paperTrail['activityProposal'])) {
                    $proposal = $paperTrail['activityProposal'];
                    if (is_array($proposal)) {
                        $activityProposalViewUrl = $proposal['view_url'] ?? '';
                        $activityProposalDownloadUrl = $proposal['download_url'] ?? '';
                    } else if (is_string($proposal)) {
                        $activityProposalViewUrl = $proposal;
                        $activityProposalDownloadUrl = $proposal;
                    }
                }
                
                // Report
                if (!empty($paperTrail['activityReport'])) {
                    $report = $paperTrail['activityReport'];
                    if (is_array($report)) {
                        $activityReportViewUrl = $report['view_url'] ?? '';
                        $activityReportDownloadUrl = $report['download_url'] ?? '';
                    } else if (is_string($report)) {
                        $activityReportViewUrl = $report;
                        $activityReportDownloadUrl = $report;
                    }
                }

                // Photos
                if (isset($paperTrail['photoDocumentation']) && is_array($paperTrail['photoDocumentation'])) {
                    foreach ($paperTrail['photoDocumentation'] as $photo) {
                        if (is_array($photo)) {
                            if (!empty($photo['view_url'])) {
                                $photoViewUrls[] = $photo['view_url'];
                                $photoDownloadUrls[] = $photo['download_url'] ?? $photo['view_url'];
                            }
                        } else if (is_string($photo) && !empty($photo)) {
                            $photoViewUrls[] = $photo;
                            $photoDownloadUrls[] = $photo;
                        }
                    }
                }
            }
        } else {
            // Fallback to database values if paperTrailLinks is missing
            $activityProposalViewUrl = $existingData['activity_proposal_view_url'] ?? '';
            $activityProposalDownloadUrl = $existingData['activity_proposal_download_url'] ?? '';
            $activityReportViewUrl = $existingData['activity_report_view_url'] ?? '';
            $activityReportDownloadUrl = $existingData['activity_report_download_url'] ?? '';
            
            if (!empty($existingData['photo_documentation_view_urls'])) {
                $photoViewUrls = json_decode($existingData['photo_documentation_view_urls'], true) ?: [];
            }
            if (!empty($existingData['photo_documentation_download_urls'])) {
                $photoDownloadUrls = json_decode($existingData['photo_documentation_download_urls'], true) ?: [];
            }
        }

        // Upload new Activity Proposal (if provided)
        if (isset($_FILES['activityProposal']) && $_FILES['activityProposal']['error'] === UPLOAD_ERR_OK) {
            // Delete old file if exists
            if (!empty($existingData['activity_proposal_view_url'])) {
                // Extract file ID from URL and delete
                // You might want to implement this
            }
            
            $fileName = 'Activity_Proposal_' . $title . '.pdf';
            $uploadResult = uploadFileToDrive(
                $driveService,
                $_FILES['activityProposal']['tmp_name'],
                $fileName,
                $folderStructure['activity_folder_id']
            );
            if ($uploadResult) {
                $activityProposalViewUrl = $uploadResult['view_url'];
                $activityProposalDownloadUrl = $uploadResult['download_url'];
            }
        }

        // Upload new Activity Report (if provided)
        if (isset($_FILES['activityReport']) && $_FILES['activityReport']['error'] === UPLOAD_ERR_OK) {
            // Delete old file if exists
            if (!empty($existingData['activity_report_view_url'])) {
                // Extract file ID from URL and delete
            }
            
            $fileName = 'Activity_Report_' . $title . '.pdf';
            $uploadResult = uploadFileToDrive(
                $driveService,
                $_FILES['activityReport']['tmp_name'],
                $fileName,
                $folderStructure['activity_folder_id']
            );
            if ($uploadResult) {
                $activityReportViewUrl = $uploadResult['view_url'];
                $activityReportDownloadUrl = $uploadResult['download_url'];
            }
        }

        // ===== UPLOAD PHOTO DOCUMENTATION =====
        if (isset($_FILES['photoDocumentation']) && !empty($_FILES['photoDocumentation']['tmp_name'])) {
            $photos = $_FILES['photoDocumentation'];
            
            error_log("=== PHOTO UPLOAD START ===");
            
            // Handle the files based on whether it's a single file or multiple
            $photoFiles = [];
            
            if (isset($photos['name']) && is_array($photos['name'])) {
                // Multiple files
                for ($i = 0; $i < count($photos['name']); $i++) {
                    if ($photos['error'][$i] === UPLOAD_ERR_OK) {
                        $photoFiles[] = [
                            'tmp_name' => $photos['tmp_name'][$i],
                            'name' => $photos['name'][$i],
                            'size' => $photos['size'][$i],
                            'type' => $photos['type'][$i],
                            'error' => $photos['error'][$i]
                        ];
                    }
                }
            } else if (isset($photos['tmp_name']) && !empty($photos['tmp_name'])) {
                // Single file
                $photoFiles[] = [
                    'tmp_name' => $photos['tmp_name'],
                    'name' => $photos['name'],
                    'size' => $photos['size'],
                    'type' => $photos['type'],
                    'error' => $photos['error']
                ];
            }
            
            error_log("Total photo files to process: " . count($photoFiles));
            
            foreach ($photoFiles as $index => $photo) {
                error_log("Processing photo $index: " . $photo['name'] . " (Size: " . round($photo['size'] / 1024, 2) . "KB)");
                
                $timestamp = time() . '_' . uniqid();
                $cleanName = preg_replace('/[^a-zA-Z0-9\._-]/', '', $photo['name']);
                $fileName = $timestamp . '_' . $cleanName;
                
                $uploadResult = $drive->uploadFile($photo['tmp_name'], $fileName, $folderStructure['photos_folder_id']);
                
                if ($uploadResult && $uploadResult['success']) {
                    $drive->makeFilePublic($uploadResult['id']);
                    $photoViewUrls[] = "https://drive.google.com/file/d/{$uploadResult['id']}/preview";
                    $photoDownloadUrls[] = "https://drive.google.com/uc?id={$uploadResult['id']}&export=download";
                    error_log("Photo $index uploaded successfully: " . $uploadResult['id']);
                } else {
                    $errorMsg = $uploadResult['error'] ?? 'Unknown error';
                    error_log("Failed to upload photo $index: $errorMsg");
                }
            }
            
            error_log("Total photos uploaded successfully: " . count($photoViewUrls));
            error_log("=== PHOTO UPLOAD END ===");
        }

        // Convert arrays to JSON
        $photoViewUrlsJson = !empty($photoViewUrls) ? json_encode($photoViewUrls) : '[]';
        $photoDownloadUrlsJson = !empty($photoDownloadUrls) ? json_encode($photoDownloadUrls) : '[]';

        // Update database
        $query = "UPDATE participation_research SET 
            type = ?,
            location = ?,
            title = ?,
            products = ?,
            in_charge = ?,
            venue = ?,
            sponsoring_agency = ?,
            date = ?,
            activity_proposal_view_url = ?,
            activity_proposal_download_url = ?,
            activity_report_view_url = ?,
            activity_report_download_url = ?,
            photo_documentation_view_urls = ?,
            photo_documentation_download_urls = ?,
            updated_at = NOW()
        WHERE id = ?";

        $stmt = $con->prepare($query);
        $stmt->bind_param(
            'ssssssssssssssi',
            $type,
            $location,
            $title,
            $products,
            $inCharge,
            $venue,
            $sponsoringAgency,
            $date,
            $activityProposalViewUrl,
            $activityProposalDownloadUrl,
            $activityReportViewUrl,
            $activityReportDownloadUrl,
            $photoViewUrlsJson,
            $photoDownloadUrlsJson,
            $id
        );

        if (!$stmt->execute()) {
            throw new Exception('Failed to update: ' . $stmt->error);
        }

        $stmt->close();

        echo json_encode([
            'success' => true,
            'message' => 'Participation record updated successfully with files uploaded to Google Drive',
            'drive_folders' => $folderStructure
        ]);

    } catch (Exception $e) {
        error_log('Error in update_participation: ' . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

if (isset($_POST['action']) && $_POST['action'] === 'delete_participation') {
    try {
        $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
        
        if ($id <= 0) {
            throw new Exception('Invalid ID');
        }

        $query = "DELETE FROM participation_research WHERE id = ?";
        $stmt = $con->prepare($query);
        $stmt->bind_param('i', $id);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to delete: ' . $stmt->error);
        }
        
        $stmt->close();

        echo json_encode([
            'success' => true,
            'message' => 'Record deleted successfully'
        ]);

    } catch (Exception $e) {
        error_log('Error in delete_participation: ' . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

if (isset($_POST['action']) && $_POST['action'] === 'create_participation_folder') {
    try {
        $type = isset($_POST['type']) ? $_POST['type'] : 'campus';
        $location = isset($_POST['location']) ? $_POST['location'] : '';
        $activityTitle = isset($_POST['activity_title']) ? $_POST['activity_title'] : '';
        $date = isset($_POST['date']) ? $_POST['date'] : date('Y-m-d');
        $year = isset($_POST['year']) ? intval($_POST['year']) : date('Y');
        $quarter = isset($_POST['quarter']) ? intval($_POST['quarter']) : ceil(date('m') / 3);
        
        if (empty($location)) {
            throw new Exception('Location is required');
        }
        if (empty($activityTitle)) {
            throw new Exception('Activity title is required');
        }
        
        $accomplishmentInfo = getCurrentAccomplishmentYearQuarter();
        if ($year !== $accomplishmentInfo['year'] || $quarter !== $accomplishmentInfo['quarter']) {
            $quarterName = [1 => '1st', 2 => '2nd', 3 => '3rd', 4 => '4th'];
            $rootFolderName = "{$year} RDE {$quarterName[$quarter]} Quarter Accomplishment";
            $accomplishmentInfo['folder_name'] = $rootFolderName;
            $accomplishmentInfo['year'] = $year;
            $accomplishmentInfo['quarter'] = $quarter;
        }
        
        $folderStructure = createParticipationFolderStructure(
            $driveService,
            $type,
            $location,
            $activityTitle,
            $date,
            $accomplishmentInfo['year'],
            $accomplishmentInfo['quarter']
        );
        
        echo json_encode([
            'status' => true,
            'message' => 'Participation folder structure created successfully',
            'data' => [
                'folder_structure' => $folderStructure
            ]
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'status' => false,
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

echo json_encode([
    'status' => false,
    'message' => 'Invalid or missing action parameter'
]);

$con->close();