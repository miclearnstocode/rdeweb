<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/faculty_presentations_errors.log');

header('Content-Type: application/json; charset=utf-8');

// Start output buffering with callback to catch errors
ob_start(function ($buffer) {
    if (
        strpos($buffer, '<b>Warning</b>') !== false ||
        strpos($buffer, '<b>Notice</b>') !== false ||
        strpos($buffer, '<b>Fatal error</b>') !== false
    ) {
        error_log("HTML error in output buffer: " . substr($buffer, 0, 500));
        return json_encode([
            'success' => false,
            'message' => 'Server error occurred',
            'error_type' => 'html_error_in_response'
        ]);
    }
    return $buffer;
});

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/../../../config/driver_config.php';
require_once __DIR__ . '/../../db.php';

function getCurrentQuarter() {
    $month = date('n');
    $year = date('Y');
    
    if ($month >= 1 && $month <= 3) {
        $quarter = '1st Quarter';
    } elseif ($month >= 4 && $month <= 6) {
        $quarter = '2nd Quarter';
    } elseif ($month >= 7 && $month <= 9) {
        $quarter = '3rd Quarter';
    } else {
        $quarter = '4th Quarter';
    }
    
    return "{$year} RDE {$quarter} Accomplishment Report";
}

function cleanFolderName($name) {
    if (empty($name)) {
        return 'Untitled_' . time();
    }
    
    // Remove special characters
    $clean = preg_replace('/[^\w\s\-_.,()&]/', '', $name);
    $clean = preg_replace('/\s+/', ' ', $clean);
    $clean = trim($clean);
    $clean = rtrim($clean, '.,');
    
    if (strlen($clean) > 200) {
        $clean = substr($clean, 0, 197) . '...';
    }
    
    return $clean;
}

function uploadFileToDrive($tempFilePath, $fileName, $documentType, $type, $location, $title) {
    try {
        if (!file_exists($tempFilePath)) {
            throw new Exception("Temporary file not found: $tempFilePath");
        }
        
        $fileSize = filesize($tempFilePath);
        if ($fileSize > 40 * 1024 * 1024) {
            throw new Exception("File too large: " . round($fileSize / 1024 / 1024, 2) . "MB (max 40MB)");
        }
        
        if (!class_exists('GoogleDriveService')) {
            throw new Exception("GoogleDriveService class not found");
        }
        
        $drive = new GoogleDriveService();
        
        $quarterFolderName = getCurrentQuarter();
        $cleanLocation = cleanFolderName($location);
        $cleanTitle = cleanFolderName($title);
        
        // Get or create quarter root folder
        $quarterFolderId = getOrCreateRootFolder($drive, $quarterFolderName);
        
        // Get or create "Faculty Research Results Presented" folder
        $presentationsFolderId = getOrCreateSubFolder($drive, $quarterFolderId, 'Faculty Research Results Presented');
        
        // Get or create location folder based on type and location
        $locationFolderName = '';
        if ($type === 'campus') {
            $locationFolderName = $cleanLocation . ' Campus';
        } elseif ($type === 'center') {
            $locationFolderName = $cleanLocation;
        } else {
            $locationFolderName = $cleanLocation;
        }
        
        $locationFolderId = getOrCreateSubFolder($drive, $presentationsFolderId, $locationFolderName);
        
        // Get or create title folder inside the location folder
        $titleFolderId = getOrCreateSubFolder($drive, $locationFolderId, $cleanTitle);
        
        $extension = pathinfo($fileName, PATHINFO_EXTENSION);
        $nameOnly = pathinfo($fileName, PATHINFO_FILENAME);
        $prefixedFileName = $documentType . '_' . $nameOnly . '.' . $extension;
        
        error_log("Uploading $documentType file: $prefixedFileName to folder: $titleFolderId");
        $uploadResult = $drive->uploadFile($tempFilePath, $prefixedFileName, $titleFolderId);
        
        if (!$uploadResult['success'] || empty($uploadResult['id'])) {
            $errorMsg = $uploadResult['error'] ?? "Upload failed: No file ID returned";
            error_log("Google Drive upload failed: $errorMsg");
            throw new Exception($errorMsg);
        }
        
        // Make file publicly viewable
        $drive->makeFilePublic($uploadResult['id']);
        
        $fileId = $uploadResult['id'];
        $viewUrl = "https://drive.google.com/file/d/{$fileId}/preview";
        $downloadUrl = "https://drive.google.com/uc?id={$fileId}&export=download";
        
        $result = [
            'success' => true,
            'drive_file_id' => $uploadResult['id'],
            'view_url' => $viewUrl,
            'download_url' => $downloadUrl,
            'file_name' => $uploadResult['name'] ?? $fileName,
            'file_size' => $uploadResult['size'] ?? 0
        ];
        
        error_log("$documentType file upload successful: " . $uploadResult['id']);
        return $result;
        
    } catch (Exception $e) {
        error_log("Google Drive upload failed for $fileName: " . $e->getMessage());
        throw new Exception("Failed to upload $fileName: " . $e->getMessage());
    }
}

function getOrCreateRootFolder($drive, $folderName) {
    if (method_exists($drive, 'findOrCreateFolder')) {
        try {
            $rootFolderId = $drive->getRootFolderId();
            $folderId = $drive->findOrCreateFolder($folderName, $rootFolderId);
            error_log("Root folder found/created: $folderName with ID: $folderId");
            return $folderId;
        } catch (Exception $e) {
            error_log("Error with findOrCreateFolder: " . $e->getMessage());
            throw $e;
        }
    }
    
    if (method_exists($drive, 'createFolder')) {
        $rootFolderId = $drive->getRootFolderId();
        $folderId = $drive->createFolder($folderName, $rootFolderId);
        error_log("Created root folder: $folderName with ID: $folderId");
        return $folderId;
    }
    
    throw new Exception("GoogleDriveService does not have required methods for Shared Drive");
}

function getOrCreateSubFolder($drive, $parentId, $folderName) {
    if (empty($parentId)) {
        throw new Exception("Parent folder ID is empty");
    }
    
    if (method_exists($drive, 'findOrCreateFolder')) {
        try {
            $folderId = $drive->findOrCreateFolder($folderName, $parentId);
            error_log("Subfolder found/created: $folderName in parent: $parentId with ID: $folderId");
            return $folderId;
        } catch (Exception $e) {
            error_log("Error with findOrCreateFolder: " . $e->getMessage());
            throw $e;
        }
    }
    
    if (method_exists($drive, 'createFolder')) {
        $folderId = $drive->createFolder($folderName, $parentId);
        error_log("Created subfolder: $folderName in parent: $parentId");
        return $folderId;
    }
    
    throw new Exception("GoogleDriveService does not have required methods for Shared Drive");
}

// Helper function to save uploaded file and return metadata
function processFileUpload($fileInputName, $documentType, $type, $location, $title) {
    if (!isset($_FILES[$fileInputName]) || $_FILES[$fileInputName]['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    
    $file = $_FILES[$fileInputName];
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize limit',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE limit',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
        ];
        $errorMsg = $errorMessages[$file['error']] ?? 'Unknown upload error';
        throw new Exception("File upload error: $errorMsg");
    }
    
    // Validate file type
    $allowedTypes = [
        'presentationSlides' => ['pdf', 'ppt', 'pptx'],
        'certificate' => ['pdf', 'jpg', 'jpeg', 'png'],
        'photoDocumentation' => ['jpg', 'jpeg', 'png', 'gif', 'webp']
    ];
    
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedTypes[$documentType] ?? [])) {
        throw new Exception("Invalid file type for $documentType. Allowed: " . implode(', ', $allowedTypes[$documentType] ?? []));
    }
    
    // Upload to Google Drive
    $result = uploadFileToDrive(
        $file['tmp_name'],
        $file['name'],
        $documentType,
        $type,
        $location,
        $title
    );
    
    return [
        'view_url' => $result['view_url'],
        'download_url' => $result['download_url'],
        'drive_file_id' => $result['drive_file_id'],
        'file_name' => $result['file_name']
    ];
}

// Helper function to handle multiple photo uploads
function processPhotoUploads($type, $location, $title) {
    if (!isset($_FILES['photoDocumentation']) || empty($_FILES['photoDocumentation']['name'][0])) {
        return null;
    }
    
    $files = $_FILES['photoDocumentation'];
    $photoUrls = [
        'view_urls' => [],
        'download_urls' => [],
        'drive_file_ids' => []
    ];
    
    // Check if multiple files were uploaded
    if (is_array($files['name'])) {
        for ($i = 0; $i < count($files['name']); $i++) {
            if ($files['error'][$i] === UPLOAD_ERR_OK) {
                $tempFile = [
                    'tmp_name' => $files['tmp_name'][$i],
                    'name' => $files['name'][$i],
                    'error' => $files['error'][$i]
                ];
                
                // Create a temporary file array
                $fileData = [
                    'tmp_name' => $tempFile['tmp_name'],
                    'name' => $tempFile['name'],
                    'error' => $tempFile['error']
                ];
                
                try {
                    $result = uploadFileToDrive(
                        $fileData['tmp_name'],
                        $fileData['name'],
                        'photoDocumentation',
                        $type,
                        $location,
                        $title
                    );
                    
                    $photoUrls['view_urls'][] = $result['view_url'];
                    $photoUrls['download_urls'][] = $result['download_url'];
                    $photoUrls['drive_file_ids'][] = $result['drive_file_id'];
                } catch (Exception $e) {
                    error_log("Failed to upload photo: " . $e->getMessage());
                    // Continue with other photos
                }
            }
        }
    } else {
        // Single file upload
        if ($files['error'] === UPLOAD_ERR_OK) {
            try {
                $result = uploadFileToDrive(
                    $files['tmp_name'],
                    $files['name'],
                    'photoDocumentation',
                    $type,
                    $location,
                    $title
                );
                
                $photoUrls['view_urls'][] = $result['view_url'];
                $photoUrls['download_urls'][] = $result['download_url'];
                $photoUrls['drive_file_ids'][] = $result['drive_file_id'];
            } catch (Exception $e) {
                error_log("Failed to upload photo: " . $e->getMessage());
            }
        }
    }
    
    if (empty($photoUrls['view_urls'])) {
        return null;
    }
    
    return $photoUrls;
}

try {
    if (!$conn || !($conn instanceof mysqli)) {
        throw new Exception('Database connection failed');
    }

    $action = isset($_POST['action']) ? $_POST['action'] : '';

    switch ($action) {
        case 'fetch_presentations':
            handleFetchPresentations($conn);
            break;
            
        case 'add_presentation':
            handleAddPresentation($conn);
            break;
            
        case 'update_presentation':
            handleUpdatePresentation($conn);
            break;
            
        case 'delete_presentation':
            handleDeletePresentation($conn);
            break;
            
        default:
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action. Available: fetch_presentations, add_presentation, update_presentation, delete_presentation'
            ]);
            break;
    }
} catch (Exception $e) {
    error_log('Faculty Presentations API Error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

// ========== FETCH PRESENTATIONS ==========
function handleFetchPresentations($conn) {
    try {
        $campus = isset($_POST['campus']) ? trim($_POST['campus']) : '';
        $center = isset($_POST['center']) ? trim($_POST['center']) : '';
        $scope = isset($_POST['scope']) ? trim($_POST['scope']) : '';
        $cursor = isset($_POST['cursor']) ? intval($_POST['cursor']) : 0;
        $limit = 50;

        // Build the WHERE clause
        $whereClauses = [];
        $params = [];
        $types = "";

        if (!empty($campus)) {
            $whereClauses[] = "type = 'campus' AND location = ?";
            $params[] = $campus;
            $types .= "s";
        }

        if (!empty($center)) {
            $whereClauses[] = "type = 'center' AND location = ?";
            $params[] = $center;
            $types .= "s";
        }

        if (!empty($scope) && $scope !== 'All Scopes') {
            $whereClauses[] = "scope = ?";
            $params[] = $scope;
            $types .= "s";
        }

        $whereSQL = !empty($whereClauses) ? 'WHERE ' . implode(' AND ', $whereClauses) : '';

        // Get total count
        $countSQL = "SELECT COUNT(*) as total FROM faculty_presentations $whereSQL";
        $countStmt = $conn->prepare($countSQL);
        
        if (!empty($params)) {
            $countStmt->bind_param($types, ...$params);
        }
        
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $totalCount = $countResult->fetch_assoc()['total'];
        $countStmt->close();

        // Get data with pagination
        $offset = $cursor;
        $dataSQL = "SELECT 
            id,
            type,
            location,
            title,
            presenter,
            researchers,
            date,
            venue,
            forum_title,
            sponsoring_agency,
            award,
            scope,
            presentation_drive_view_url,
            presentation_drive_download_url,
            certificate_drive_view_url,
            certificate_drive_download_url,
            event_photos_drive_view_url,
            event_photos_drive_download_url,
            created_at,
            updated_at
        FROM faculty_presentations 
        $whereSQL 
        ORDER BY id ASC 
        LIMIT ? OFFSET ?";

        $stmt = $conn->prepare($dataSQL);
        
        if (!empty($params)) {
            $stmt->bind_param($types . "ii", ...array_merge($params, [$limit, $offset]));
        } else {
            $stmt->bind_param("ii", $limit, $offset);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();

        $data = [];
        $totalPresenters = 0;
        $withAwards = 0;
        $scopeCounts = [
            'Local' => 0,
            'Institutional' => 0,
            'Regional' => 0,
            'National' => 0,
            'International' => 0
        ];

        while ($row = $result->fetch_assoc()) {
            if ($row['presenter']) {
                $totalPresenters++;
            }
            
            if ($row['award'] && $row['award'] !== 'None') {
                $withAwards++;
            }
            
            if ($row['scope'] && isset($scopeCounts[$row['scope']])) {
                $scopeCounts[$row['scope']]++;
            }

            // Decode researchers
            $researchers = null;
            if ($row['researchers']) {
                $decoded = json_decode($row['researchers'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $researchers = $decoded;
                } else {
                    $researchers = $row['researchers'];
                }
            }

            // Build paper trail links for frontend compatibility
            $paperTrailLinks = [];
            
            // Presentation Slides
            if ($row['presentation_drive_view_url'] || $row['presentation_drive_download_url']) {
                $paperTrailLinks['presentationSlides'] = [
                    $row['presentation_drive_view_url'] ?? $row['presentation_drive_download_url']
                ];
            }
            
            // Certificate
            if ($row['certificate_drive_view_url'] || $row['certificate_drive_download_url']) {
                $paperTrailLinks['certificate'] = [
                    $row['certificate_drive_view_url'] ?? $row['certificate_drive_download_url']
                ];
            }
            
            // Event Photos
            if ($row['event_photos_drive_view_url'] || $row['event_photos_drive_download_url']) {
                $photoUrls = [];
                $viewUrls = json_decode($row['event_photos_drive_view_url'], true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($viewUrls)) {
                    $photoUrls = $viewUrls;
                } else if ($row['event_photos_drive_view_url']) {
                    $photoUrls = [$row['event_photos_drive_view_url']];
                }
                if (!empty($photoUrls)) {
                    $paperTrailLinks['photoDocumentation'] = $photoUrls;
                }
            }

            $data[] = [
                'id' => $row['id'],
                'type' => $row['type'],
                'location' => $row['location'],
                'title' => $row['title'],
                'presenter' => $row['presenter'],
                'researchers' => $researchers,
                'date' => $row['date'],
                'venue' => $row['venue'],
                'forumTitle' => $row['forum_title'],
                'sponsoringAgency' => $row['sponsoring_agency'],
                'award' => $row['award'],
                'scope' => $row['scope'],
                'paperTrailLinks' => $paperTrailLinks,
                'presentationDriveViewUrl' => $row['presentation_drive_view_url'],
                'presentationDriveDownloadUrl' => $row['presentation_drive_download_url'],
                'certificateDriveViewUrl' => $row['certificate_drive_view_url'],
                'certificateDriveDownloadUrl' => $row['certificate_drive_download_url'],
                'eventPhotosDriveViewUrl' => $row['event_photos_drive_view_url'],
                'eventPhotosDriveDownloadUrl' => $row['event_photos_drive_download_url'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at']
            ];
        }
        $stmt->close();

        $hasMore = ($offset + $limit) < $totalCount;
        $nextCursor = $hasMore ? ($offset + $limit) : null;

        echo json_encode([
            'success' => true,
            'data' => $data,
            'summary' => [
                'totalPresentations' => $totalCount,
                'totalPresenters' => $totalPresenters,
                'withAwards' => $withAwards,
                'local' => $scopeCounts['Local'],
                'institutional' => $scopeCounts['Institutional'],
                'regional' => $scopeCounts['Regional'],
                'national' => $scopeCounts['National'],
                'international' => $scopeCounts['International']
            ],
            'pagination' => [
                'has_more' => $hasMore,
                'next_cursor' => $nextCursor,
                'total' => $totalCount,
                'limit' => $limit,
                'offset' => $offset
            ]
        ]);

    } catch (Exception $e) {
        error_log('Error in handleFetchPresentations: ' . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch presentations: ' . $e->getMessage()
        ]);
    }
}

// ========== ADD PRESENTATION ==========
function handleAddPresentation($conn) {
    try {
        // Validate required fields
        $type = isset($_POST['type']) ? trim($_POST['type']) : '';
        $location = isset($_POST['location']) ? trim($_POST['location']) : '';
        $title = isset($_POST['title']) ? trim($_POST['title']) : '';
        $presenter = isset($_POST['presenter']) ? trim($_POST['presenter']) : '';
        $date = isset($_POST['date']) ? $_POST['date'] : '';
        $venue = isset($_POST['venue']) ? trim($_POST['venue']) : '';
        $forumTitle = isset($_POST['forumTitle']) ? trim($_POST['forumTitle']) : '';
        $sponsoringAgency = isset($_POST['sponsoringAgency']) ? trim($_POST['sponsoringAgency']) : '';
        $scope = isset($_POST['scope']) ? trim($_POST['scope']) : '';
        
        if (empty($type) || empty($location) || empty($title) || empty($presenter) || 
            empty($date) || empty($venue) || empty($forumTitle) || empty($sponsoringAgency) || empty($scope)) {
            echo json_encode([
                'success' => false,
                'message' => 'All required fields must be filled'
            ]);
            return;
        }

        $award = isset($_POST['award']) && $_POST['award'] !== 'None' ? trim($_POST['award']) : null;
        $researchers = isset($_POST['researchers']) ? $_POST['researchers'] : null;

        // Validate researchers JSON
        if ($researchers) {
            $decoded = json_decode($researchers, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid researchers data format'
                ]);
                return;
            }
        }

        // ===== PROCESS FILE UPLOADS =====
        $presentationViewUrl = null;
        $presentationDownloadUrl = null;
        $certificateViewUrl = null;
        $certificateDownloadUrl = null;
        $eventPhotosViewUrl = null;
        $eventPhotosDownloadUrl = null;

        // Upload Presentation Slides
        if (isset($_FILES['presentationSlides']) && $_FILES['presentationSlides']['error'] !== UPLOAD_ERR_NO_FILE) {
            try {
                $result = processFileUpload('presentationSlides', 'presentationSlides', $type, $location, $title);
                if ($result) {
                    $presentationViewUrl = $result['view_url'];
                    $presentationDownloadUrl = $result['download_url'];
                }
            } catch (Exception $e) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to upload presentation slides: ' . $e->getMessage()
                ]);
                return;
            }
        }

        // Upload Certificate
        if (isset($_FILES['certificate']) && $_FILES['certificate']['error'] !== UPLOAD_ERR_NO_FILE) {
            try {
                $result = processFileUpload('certificate', 'certificate', $type, $location, $title);
                if ($result) {
                    $certificateViewUrl = $result['view_url'];
                    $certificateDownloadUrl = $result['download_url'];
                }
            } catch (Exception $e) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to upload certificate: ' . $e->getMessage()
                ]);
                return;
            }
        }

        // Upload Event Photos (multiple)
        if (isset($_FILES['photoDocumentation']) && !empty($_FILES['photoDocumentation']['name'][0])) {
            try {
                $photoResult = processPhotoUploads($type, $location, $title);
                if ($photoResult) {
                    $eventPhotosViewUrl = json_encode($photoResult['view_urls']);
                    $eventPhotosDownloadUrl = json_encode($photoResult['download_urls']);
                }
            } catch (Exception $e) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to upload event photos: ' . $e->getMessage()
                ]);
                return;
            }
        }

        // Insert into database
        $sql = "INSERT INTO faculty_presentations (
            type,
            location,
            title,
            presenter,
            researchers,
            date,
            venue,
            forum_title,
            sponsoring_agency,
            award,
            scope,
            presentation_drive_view_url,
            presentation_drive_download_url,
            certificate_drive_view_url,
            certificate_drive_download_url,
            event_photos_drive_view_url,
            event_photos_drive_download_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $stmt->bind_param(
            "sssssssssssssssss",
            $type,
            $location,
            $title,
            $presenter,
            $researchers,
            $date,
            $venue,
            $forumTitle,
            $sponsoringAgency,
            $award,
            $scope,
            $presentationViewUrl,
            $presentationDownloadUrl,
            $certificateViewUrl,
            $certificateDownloadUrl,
            $eventPhotosViewUrl,
            $eventPhotosDownloadUrl
        );

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Presentation added successfully',
                'id' => $stmt->insert_id
            ]);
        } else {
            throw new Exception('Failed to insert: ' . $stmt->error);
        }
        
        $stmt->close();
    } catch (Exception $e) {
        error_log('Error in handleAddPresentation: ' . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Failed to add presentation: ' . $e->getMessage()
        ]);
    }
}

// ========== UPDATE PRESENTATION ==========
function handleUpdatePresentation($conn) {
    try {
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        
        if ($id <= 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid presentation ID'
            ]);
            return;
        }

        // Validate required fields
        $type = isset($_POST['type']) ? trim($_POST['type']) : '';
        $location = isset($_POST['location']) ? trim($_POST['location']) : '';
        $title = isset($_POST['title']) ? trim($_POST['title']) : '';
        $presenter = isset($_POST['presenter']) ? trim($_POST['presenter']) : '';
        $date = isset($_POST['date']) ? $_POST['date'] : '';
        $venue = isset($_POST['venue']) ? trim($_POST['venue']) : '';
        $forumTitle = isset($_POST['forumTitle']) ? trim($_POST['forumTitle']) : '';
        $sponsoringAgency = isset($_POST['sponsoringAgency']) ? trim($_POST['sponsoringAgency']) : '';
        $scope = isset($_POST['scope']) ? trim($_POST['scope']) : '';
        
        if (empty($type) || empty($location) || empty($title) || empty($presenter) || 
            empty($date) || empty($venue) || empty($forumTitle) || empty($sponsoringAgency) || empty($scope)) {
            echo json_encode([
                'success' => false,
                'message' => 'All required fields must be filled'
            ]);
            return;
        }

        $award = isset($_POST['award']) && $_POST['award'] !== 'None' ? trim($_POST['award']) : null;
        $researchers = isset($_POST['researchers']) ? $_POST['researchers'] : null;

        // Validate researchers JSON
        if ($researchers) {
            $decoded = json_decode($researchers, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid researchers data format'
                ]);
                return;
            }
        }

        // Get existing record to preserve files that weren't re-uploaded
        $existingSql = "SELECT 
            presentation_drive_view_url,
            presentation_drive_download_url,
            certificate_drive_view_url,
            certificate_drive_download_url,
            event_photos_drive_view_url,
            event_photos_drive_download_url
        FROM faculty_presentations WHERE id = ?";
        
        $existingStmt = $conn->prepare($existingSql);
        $existingStmt->bind_param("i", $id);
        $existingStmt->execute();
        $existingResult = $existingStmt->get_result();
        $existing = $existingResult->fetch_assoc();
        $existingStmt->close();

        // ===== PROCESS FILE UPLOADS (only if new files are uploaded) =====
        $presentationViewUrl = $existing['presentation_drive_view_url'] ?? null;
        $presentationDownloadUrl = $existing['presentation_drive_download_url'] ?? null;
        $certificateViewUrl = $existing['certificate_drive_view_url'] ?? null;
        $certificateDownloadUrl = $existing['certificate_drive_download_url'] ?? null;
        $eventPhotosViewUrl = $existing['event_photos_drive_view_url'] ?? null;
        $eventPhotosDownloadUrl = $existing['event_photos_drive_download_url'] ?? null;

        // Upload Presentation Slides (if new file uploaded)
        if (isset($_FILES['presentationSlides']) && $_FILES['presentationSlides']['error'] !== UPLOAD_ERR_NO_FILE) {
            try {
                $result = processFileUpload('presentationSlides', 'presentationSlides', $type, $location, $title);
                if ($result) {
                    $presentationViewUrl = $result['view_url'];
                    $presentationDownloadUrl = $result['download_url'];
                }
            } catch (Exception $e) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to upload presentation slides: ' . $e->getMessage()
                ]);
                return;
            }
        }

        // Upload Certificate (if new file uploaded)
        if (isset($_FILES['certificate']) && $_FILES['certificate']['error'] !== UPLOAD_ERR_NO_FILE) {
            try {
                $result = processFileUpload('certificate', 'certificate', $type, $location, $title);
                if ($result) {
                    $certificateViewUrl = $result['view_url'];
                    $certificateDownloadUrl = $result['download_url'];
                }
            } catch (Exception $e) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to upload certificate: ' . $e->getMessage()
                ]);
                return;
            }
        }

        // Upload Event Photos (if new files uploaded)
        if (isset($_FILES['photoDocumentation']) && !empty($_FILES['photoDocumentation']['name'][0])) {
            try {
                $photoResult = processPhotoUploads($type, $location, $title);
                if ($photoResult) {
                    $eventPhotosViewUrl = json_encode($photoResult['view_urls']);
                    $eventPhotosDownloadUrl = json_encode($photoResult['download_urls']);
                }
            } catch (Exception $e) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to upload event photos: ' . $e->getMessage()
                ]);
                return;
            }
        }

        // Update database
        $sql = "UPDATE faculty_presentations SET
            type = ?,
            location = ?,
            title = ?,
            presenter = ?,
            researchers = ?,
            date = ?,
            venue = ?,
            forum_title = ?,
            sponsoring_agency = ?,
            award = ?,
            scope = ?,
            presentation_drive_view_url = ?,
            presentation_drive_download_url = ?,
            certificate_drive_view_url = ?,
            certificate_drive_download_url = ?,
            event_photos_drive_view_url = ?,
            event_photos_drive_download_url = ?
        WHERE id = ?";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $stmt->bind_param(
            "sssssssssssssssssi",
            $type,
            $location,
            $title,
            $presenter,
            $researchers,
            $date,
            $venue,
            $forumTitle,
            $sponsoringAgency,
            $award,
            $scope,
            $presentationViewUrl,
            $presentationDownloadUrl,
            $certificateViewUrl,
            $certificateDownloadUrl,
            $eventPhotosViewUrl,
            $eventPhotosDownloadUrl,
            $id
        );

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Presentation updated successfully'
            ]);
        } else {
            throw new Exception('Failed to update: ' . $stmt->error);
        }
        
        $stmt->close();
    } catch (Exception $e) {
        error_log('Error in handleUpdatePresentation: ' . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update presentation: ' . $e->getMessage()
        ]);
    }
}

// ========== DELETE PRESENTATION ==========
function handleDeletePresentation($conn) {
    try {
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        
        if ($id <= 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid presentation ID'
            ]);
            return;
        }

        $sql = "DELETE FROM faculty_presentations WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Presentation deleted successfully'
            ]);
        } else {
            throw new Exception('Failed to delete: ' . $stmt->error);
        }
        
        $stmt->close();
    } catch (Exception $e) {
        error_log('Error in handleDeletePresentation: ' . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete presentation: ' . $e->getMessage()
        ]);
    }
}

// Close connection
if (isset($conn) && $conn instanceof mysqli) {
    $conn->close();
}