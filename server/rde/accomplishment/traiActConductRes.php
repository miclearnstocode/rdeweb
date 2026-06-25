<?php

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');

// Start session if not started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Include database and Google Drive config
require_once __DIR__ . '/../../../config/driver_config.php';
require_once __DIR__ . '/../../db.php';

date_default_timezone_set('Asia/Manila');

$action = $_POST['action'] ?? $_GET['action'] ?? '';

function cleanTrainingFolderName($name) {
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

function createTrainingFolderStructure($driveService, $type, $location, $trainingTitle, $date) {
    $rootFolderName = 'Trainings/Activity Conducted/Facilitated';
    $rootFolderId = $driveService->findOrCreateFolder($rootFolderName);
    if (!$rootFolderId) {
        throw new Exception("Failed to create root folder: $rootFolderName");
    }
    
    $formattedDate = date('Y-m-d', strtotime($date));
    $cleanTitle = cleanTrainingFolderName($trainingTitle);
    $trainingFolderName = $cleanTitle . '_' . $formattedDate;
    
    $parentId = $rootFolderId;
    $campusFolderId = null;
    $centerFolderId = null;
    $categoryFolderId = null;
    
    if ($type === 'campus') {
        $campusParentId = getOrCreateFolder($driveService, $rootFolderId, 'Campus');
        $campusFolderId = getOrCreateFolder($driveService, $campusParentId, $location);
        $parentId = $campusFolderId;
    } else {
        $centersParentId = getOrCreateFolder($driveService, $rootFolderId, 'Centers');
        $centerFolderId = getOrCreateFolder($driveService, $centersParentId, $location);
        $parentId = $centerFolderId;
    }
    
    $trainingFolderId = getOrCreateFolder($driveService, $parentId, $trainingFolderName);
    
    $photosFolderId = $driveService->findOrCreateFolder('photos', $trainingFolderId);
    
    return [
        'training_folder_id' => $trainingFolderId,
        'photos_folder_id' => $photosFolderId,
        'root_folder_id' => $rootFolderId,
        'campus_folder_id' => $campusFolderId,
        'center_folder_id' => $centerFolderId,
        'category_folder_id' => $categoryFolderId,
        'entry_folder_id' => $trainingFolderId
    ];
}

function uploadTrainingFile($driveService, $fileTemp, $fileName, $folderId) {
    if (!$driveService || empty($fileTemp) || !file_exists($fileTemp)) {
        return null;
    }
    
    $result = $driveService->uploadFile($fileTemp, $fileName, $folderId);
    
    if ($result && $result['success']) {
        $driveService->makeFilePublic($result['id']);
        return [
            'file_id' => $result['id'],
            'view_url' => "https://drive.google.com/file/d/{$result['id']}/preview",
            'download_url' => "https://drive.google.com/uc?id={$result['id']}&export=download"
        ];
    }
    
    return null;
}

function uploadTrainingPhotos($driveService, $photos, $photosFolderId) {
    $uploadedPhotos = [];
    
    if (empty($photos) || empty($photosFolderId)) {
        return $uploadedPhotos;
    }
    
    $photoUrls = [];
    $photoFileIds = [];
    
    foreach ($photos as $photo) {
        if ($photo['error'] === UPLOAD_ERR_OK) {
            $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9\._-]/', '', $photo['name']);
            $result = $driveService->uploadFile($photo['tmp_name'], $fileName, $photosFolderId);
            
            if ($result && $result['success']) {
                $driveService->makeFilePublic($result['id']);
                $photoUrls[] = "https://drive.google.com/file/d/{$result['id']}/preview";
                $photoFileIds[] = $result['id'];
            }
        }
    }
    
    return [
        'urls' => $photoUrls,
        'file_ids' => $photoFileIds
    ];
}

function deleteTrainingFile($driveService, $fileId) {
    if (empty($fileId)) return true;
    
    try {
        return $driveService->trashFile($fileId);
    } catch (Exception $e) {
        error_log("Failed to delete file $fileId: " . $e->getMessage());
        return false;
    }
}


function handleInsert($con, $driveService, $data, $files) {
    $type = $data['type'] ?? null;
    $location = $data['location'] ?? null;
    $title = $data['title'] ?? '';
    $date = $data['date'] ?? '';
    $budget = isset($data['budget']) && $data['budget'] !== '' ? (float)$data['budget'] : null;
    $fundSource = $data['fundSource'] ?? $data['fund_source'] ?? null;
    $topicsDiscussed = $data['topics_discussed'];
    $attendees = isset($data['attendees']) ? (int)$data['attendees'] : 0;

    if (empty($title)) {
        return ['success' => false, 'message' => "Training title is required"];
    }
    if (empty($date)) {
        return ['success' => false, 'message' => "Date is required"];
    }
    if (empty($topicsDiscussed)) {
        return ['success' => false, 'message' => "Topics discussed is required"];
    }
    if ($attendees <= 0) {
        return ['success' => false, 'message' => "Number of attendees is required and must be greater than 0"];
    }
    
    $userId = $_SESSION['userId'] ?? 0;
    if (!$userId) {
        return ['success' => false, 'message' => "User not authenticated"];
    }
    
    try {
        $folders = createTrainingFolderStructure(
            $driveService,
            $type,
            $location,
            $title,
            $date
        );
        
        $trainingFolderId = $folders['training_folder_id'];
        $photosFolderId = $folders['photos_folder_id'];
        
    } catch (Exception $e) {
        error_log("Folder creation failed: " . $e->getMessage());
        return ['success' => false, 'message' => "Failed to create folder structure: " . $e->getMessage()];
    }
    
    $activityProposal = null;
    $attendanceSheet = null;
    $activityReport = null;
    $program = null;
    $photos = ['urls' => [], 'file_ids' => []];
    
    if (isset($files['activity_proposal']) && $files['activity_proposal']['error'] === UPLOAD_ERR_OK) {
        $activityProposal = uploadTrainingFile(
            $driveService,
            $files['activity_proposal']['tmp_name'],
            'activity_proposal.pdf',
            $trainingFolderId
        );
    }
    
    if (isset($files['attendance_sheet']) && $files['attendance_sheet']['error'] === UPLOAD_ERR_OK) {
        $attendanceSheet = uploadTrainingFile(
            $driveService,
            $files['attendance_sheet']['tmp_name'],
            'attendance_sheet.pdf',
            $trainingFolderId
        );
    }
    
    if (isset($files['activity_report']) && $files['activity_report']['error'] === UPLOAD_ERR_OK) {
        $activityReport = uploadTrainingFile(
            $driveService,
            $files['activity_report']['tmp_name'],
            'activity_report.pdf',
            $trainingFolderId
        );
    }
    
    if (isset($files['program']) && $files['program']['error'] === UPLOAD_ERR_OK) {
        $program = uploadTrainingFile(
            $driveService,
            $files['program']['tmp_name'],
            'program.pdf',
            $trainingFolderId
        );
    }
    
    $photoFiles = [];
    if (isset($files['photos'])) {
        $photoInput = $files['photos'];
        if (isset($photoInput['tmp_name']) && is_array($photoInput['tmp_name'])) {
            $photoCount = count($photoInput['tmp_name']);
            for ($i = 0; $i < $photoCount; $i++) {
                if ($photoInput['error'][$i] === UPLOAD_ERR_OK) {
                    $photoFiles[] = [
                        'name' => $photoInput['name'][$i],
                        'tmp_name' => $photoInput['tmp_name'][$i],
                        'error' => $photoInput['error'][$i]
                    ];
                }
            }
        } elseif (isset($photoInput['error']) && $photoInput['error'] === UPLOAD_ERR_OK) {
            $photoFiles[] = $photoInput;
        }
    }
    
    if (!empty($photoFiles)) {
        $photos = uploadTrainingPhotos($driveService, $photoFiles, $photosFolderId);
    }
    
    $resourcePersons = [];
    if (isset($data['resourcePersons']) && !empty($data['resourcePersons'])) {
        $input = $data['resourcePersons'];
        
        // Check if it's a JSON string
        if (is_string($input) && (strpos($input, '[') === 0 || strpos($input, '{') === 0)) {
            $decoded = json_decode($input, true);
            if (is_array($decoded)) {
                $resourcePersons = $decoded;
            } else {
                // If JSON decode failed, treat as comma-separated string
                $names = array_map('trim', explode(',', $input));
                $resourcePersons = array_map(function($name) {
                    return ['name' => $name];
                }, array_filter($names));
            }
        } else {
            // Treat as comma-separated string
            $names = array_map('trim', explode(',', $input));
            $resourcePersons = array_map(function($name) {
                return ['name' => $name];
            }, array_filter($names));
        }
    }
    error_log("Resource Persons processed: " . json_encode($resourcePersons));
    
    // Process Participants - Accept comma-separated string or JSON
    $participants = [];
    if (isset($data['participants']) && !empty($data['participants'])) {
        $input = $data['participants'];
        
        // Check if it's a JSON string
        if (is_string($input) && (strpos($input, '[') === 0 || strpos($input, '{') === 0)) {
            $decoded = json_decode($input, true);
            if (is_array($decoded)) {
                $participants = $decoded;
            } else {
                // If JSON decode failed, treat as comma-separated string
                $names = array_map('trim', explode(',', $input));
                $participants = array_map(function($name) {
                    return ['name' => $name];
                }, array_filter($names));
            }
        } else {
            // Treat as comma-separated string
            $names = array_map('trim', explode(',', $input));
            $participants = array_map(function($name) {
                return ['name' => $name];
            }, array_filter($names));
        }
    }
    error_log("Participants processed: " . json_encode($participants));
    
    $resourcePersonsJson = json_encode($resourcePersons);
    $participantsJson = json_encode($participants);
    
    $query = "INSERT INTO conducted_trainings (
        type, location, title, date, budget, fund_source,
        topics_discussed, resource_persons, participants, attendees,
        drive_folder_id, drive_campus_folder_id, drive_center_folder_id,
        drive_category_folder_id, drive_entry_folder_id,
        activity_proposal_url, activity_proposal_file_id,
        attendance_sheet_url, attendance_sheet_file_id,
        activity_report_url, activity_report_file_id,
        program_url, program_file_id, photos,
        created_by, created_at
    ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?,
        ?, NOW()
    )";
    
    $stmt = $con->prepare($query);
    if (!$stmt) {
        error_log("Prepare failed: " . $con->error);
        return ['success' => false, 'message' => "Database prepare failed: " . $con->error];
    }
    
    $driveFolderId = $folders['training_folder_id'] ?? null;
    $driveCampusFolderId = $folders['campus_folder_id'] ?? null;
    $driveCenterFolderId = $folders['center_folder_id'] ?? null;
    $driveCategoryFolderId = $folders['category_folder_id'] ?? null;
    $driveEntryFolderId = $folders['entry_folder_id'] ?? null;

    $activityProposalUrl = $activityProposal['view_url'] ?? null;
    $activityProposalFileId = $activityProposal['file_id'] ?? null;
    $attendanceSheetUrl = $attendanceSheet['view_url'] ?? null;
    $attendanceSheetFileId = $attendanceSheet['file_id'] ?? null;
    $activityReportUrl = $activityReport['view_url'] ?? null;
    $activityReportFileId = $activityReport['file_id'] ?? null;
    $programUrl = $program['view_url'] ?? null;
    $programFileId = $program['file_id'] ?? null;
    $photosJson = json_encode([
        'urls' => $photos['urls'] ?? [],
        'file_ids' => $photos['file_ids'] ?? []
    ]);
    
    $stmt->bind_param(
        "ssssssssssssssssssssssssi",
        $type,
        $location,
        $title,
        $date,
        $budget,
        $fundSource,
        $topicsDiscussed,
        $resourcePersonsJson,
        $participantsJson,
        $attendees,
        $driveFolderId,
        $driveCampusFolderId,
        $driveCenterFolderId,
        $driveCategoryFolderId,
        $driveEntryFolderId,
        $activityProposalUrl,
        $activityProposalFileId,
        $attendanceSheetUrl,
        $attendanceSheetFileId,
        $activityReportUrl,
        $activityReportFileId,
        $programUrl,
        $programFileId,
        $photosJson,
        $userId
    );
    
    if ($stmt->execute()) {
        $insertId = $con->insert_id;
        return [
            'success' => true,
            'message' => "Training record created successfully",
            'data' => ['id' => $insertId],
            'drive_path' => $folders
        ];
    } else {
        error_log("Execute failed: " . $stmt->error);
        return ['success' => false, 'message' => "Database error: " . $stmt->error];
    }
}

function handleFetch($con, $data) {
    $limit = isset($data['limit']) ? (int)$data['limit'] : 50;
    $cursor = isset($data['cursor']) ? (int)$data['cursor'] : 0;
    
    // Build WHERE conditions
    $whereConditions = ["1=1"];
    $params = [];
    $types = "";
    
    // Handle filter_type and filter_location from the JS request
    if (!empty($data['filter_type']) && !empty($data['filter_location'])) {
        $whereConditions[] = "type = ? AND location = ?";
        $params[] = $data['filter_type'];
        $params[] = $data['filter_location'];
        $types .= "ss";
    } else {
        // Legacy filter parameters
        if (!empty($data['type'])) {
            $whereConditions[] = "type = ?";
            $params[] = $data['type'];
            $types .= "s";
        }

        if (!empty($data['location'])) {
            $whereConditions[] = "location = ?";
            $params[] = $data['location'];
            $types .= "s";
        }
    }
    
    if (!empty($data['search'])) {
        $whereConditions[] = "(title LIKE ? OR topics_discussed LIKE ?)";
        $searchTerm = "%{$data['search']}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= "ss";
    }
    
    if (!empty($data['date_from'])) {
        $whereConditions[] = "date >= ?";
        $params[] = $data['date_from'];
        $types .= "s";
    }
    
    if (!empty($data['date_to'])) {
        $whereConditions[] = "date <= ?";
        $params[] = $data['date_to'];
        $types .= "s";
    }
    
    // Keyset pagination
    if ($cursor > 0) {
        $whereConditions[] = "id > ?";
        $params[] = $cursor;
        $types .= "i";
    }
    
    $whereClause = implode(" AND ", $whereConditions);
    
    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM conducted_trainings WHERE $whereClause";
    $countStmt = $con->prepare($countQuery);
    if (!empty($params)) {
        $countStmt->bind_param($types, ...$params);
    }
    $countStmt->execute();
    $totalResult = $countStmt->get_result();
    $totalCount = $totalResult->fetch_assoc()['total'];
    
    // Get records - order by id DESC to show newest first
    $orderBy = isset($data['order_by']) && $data['order_by'] === 'date' ? "date DESC" : "id DESC";
    $query = "SELECT * FROM conducted_trainings WHERE $whereClause ORDER BY $orderBy LIMIT ?";
    
    $stmt = $con->prepare($query);
    $params[] = $limit;
    $types .= "i";
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $records = [];
    $lastId = 0;
    
    while ($row = $result->fetch_assoc()) {
        // Decode JSON fields and transform to match frontend expectations
        $row['resourcePersons'] = json_decode($row['resource_persons'], true) ?: [];
        $row['participants'] = json_decode($row['participants'], true) ?: [];
        
        // Transform photos to match frontend structure
        $photosData = json_decode($row['photos'], true) ?: [];
        $photos = $photosData['urls'] ?? [];
        
        // Build paperTrailLinks object for frontend
        $row['paperTrailLinks'] = [
            'activityProposal' => $row['activity_proposal_url'] ?? null,
            'attendanceSheet' => $row['attendance_sheet_url'] ?? null,
            'activityReport' => $row['activity_report_url'] ?? null,
            'program' => $row['program_url'] ?? null,
            'photos' => $photos
        ];
        
        // Add budgetFundSource combined field
        $budget = $row['budget'] ? number_format($row['budget'], 2) : '0.00';
        $fundSource = $row['fund_source'] ?? '';
        $row['budgetFundSource'] = $fundSource ? "₱{$budget} ({$fundSource})" : "₱{$budget}";
        
        // Keep original fields
        $row['budgets'] = $row['budget'];
        $row['fund_source'] = $fundSource;
        $row['attendees'] = (int)$row['attendees'];
        
        $records[] = $row;
        $lastId = $row['id'];
    }
    
    $hasMore = ($limit > 0 && count($records) === $limit);
    
    // Get summary stats - use same WHERE conditions
    $statsQuery = "SELECT 
        COUNT(*) as total_trainings,
        COALESCE(SUM(attendees), 0) as total_attendees
    FROM conducted_trainings WHERE $whereClause";
    
    $statsStmt = $con->prepare($statsQuery);
    if (!empty($params)) {
        // Remove the limit parameter for stats query
        $statsParams = array_slice($params, 0, -1);
        $statsTypes = substr($types, 0, -1);
        if (!empty($statsParams)) {
            $statsStmt->bind_param($statsTypes, ...$statsParams);
        }
    }
    $statsStmt->execute();
    $statsResult = $statsStmt->get_result();
    $summary = $statsResult->fetch_assoc();
    
    return [
        'success' => true,
        'data' => $records,
        'pagination' => [
            'total' => $totalCount,
            'limit' => $limit,
            'next_cursor' => $hasMore ? $lastId : null,
            'has_more' => $hasMore
        ],
        'summary' => [
            'totalTrainings' => (int)($summary['total_trainings'] ?? 0),
            'totalAttendees' => (int)($summary['total_attendees'] ?? 0)
        ]
    ];
}

function handleUpdate($con, $driveService, $data, $files) {
    $userId = $_SESSION['userId'] ?? 0;
    $recordId = $data['id'] ?? 0;
    
    if (!$recordId) {
        return ['success' => false, 'message' => "Record ID is required for update"];
    }
    
    // Get existing record
    $query = "SELECT * FROM conducted_trainings WHERE id = ?";
    $stmt = $con->prepare($query);
    $stmt->bind_param("i", $recordId);
    $stmt->execute();
    $result = $stmt->get_result();
    $existing = $result->fetch_assoc();
    
    if (!$existing) {
        return ['success' => false, 'message' => "Record not found"];
    }
    
    // Check if folder structure needs to be updated
    $oldType = $existing['type'] ?? null;
    $oldLocation = $existing['location'] ?? null;
    $oldTitle = $existing['title'];
    $oldDate = $existing['date'];
    
    $titleChanged = isset($data['title']) && $data['title'] !== $oldTitle;
    $dateChanged = isset($data['date']) && $data['date'] !== $oldDate;
    $typeChanged = isset($data['type']) && $data['type'] !== $oldType;
    $locationChanged = isset($data['location']) && $data['location'] !== $oldLocation;
    
    $folderStructureChanged = $titleChanged || $dateChanged || $typeChanged || $locationChanged;
    
    $trainingFolderId = $existing['drive_entry_folder_id'];
    $photosFolderId = null;
    $newDriveFolders = [];
    
    if ($folderStructureChanged) {
        // Create new folder structure
        try {
            $newType = $data['type'] ?? $oldType;
            $newLocation = $data['location'] ?? $oldLocation;
            $newTitle = $data['title'] ?? $oldTitle;
            $newDate = $data['date'] ?? $oldDate;
            
            $newDriveFolders = createTrainingFolderStructure(
                $driveService,
                $newType,
                $newLocation,
                $newTitle,
                $newDate
            );
            
            $trainingFolderId = $newDriveFolders['training_folder_id'];
            $photosFolderId = $newDriveFolders['photos_folder_id'];
            
        } catch (Exception $e) {
            error_log("Failed to create new folder structure: " . $e->getMessage());
            $trainingFolderId = $existing['drive_entry_folder_id'];
        }
    } else {
        $trainingFolderId = $existing['drive_entry_folder_id'];
        // Find photos folder
        $photosFolderId = $driveService->findOrCreateFolder('photos', $trainingFolderId);
        $newDriveFolders = [
            'training_folder_id' => $existing['drive_folder_id'],
            'campus_folder_id' => $existing['drive_campus_folder_id'],
            'center_folder_id' => $existing['drive_center_folder_id'],
            'category_folder_id' => $existing['drive_category_folder_id'],
            'entry_folder_id' => $existing['drive_entry_folder_id']
        ];
    }
    
    // Build update query
    $updateFields = [];
    $params = [];
    $types = "";
    
    $updatableFields = ['type', 'location', 'title', 'date', 'budget', 'fund_source', 'topics_discussed', 'attendees'];
    foreach ($updatableFields as $field) {
        if (isset($data[$field])) {
            $updateFields[] = "$field = ?";
            $params[] = $data[$field];
            $types .= $field === 'budget' ? 'd' : 's';
        }
    }
    
    if (isset($data['resourcePersons'])) {
        $resourcePersons = is_string($data['resourcePersons']) 
            ? json_decode($data['resourcePersons'], true) 
            : $data['resourcePersons'];
        $updateFields[] = "resource_persons = ?";
        $params[] = json_encode($resourcePersons);
        $types .= "s";
    }
    
    if (isset($data['participants'])) {
        $participants = is_string($data['participants']) 
            ? json_decode($data['participants'], true) 
            : $data['participants'];
        $updateFields[] = "participants = ?";
        $params[] = json_encode($participants);
        $types .= "s";
    }
    
    // Handle file uploads
    $fileMapping = [
        'activity_proposal' => ['url_field' => 'activity_proposal_url', 'file_id_field' => 'activity_proposal_file_id', 'filename' => 'activity_proposal.pdf'],
        'attendance_sheet' => ['url_field' => 'attendance_sheet_url', 'file_id_field' => 'attendance_sheet_file_id', 'filename' => 'attendance_sheet.pdf'],
        'activity_report' => ['url_field' => 'activity_report_url', 'file_id_field' => 'activity_report_file_id', 'filename' => 'activity_report.pdf'],
        'program' => ['url_field' => 'program_url', 'file_id_field' => 'program_file_id', 'filename' => 'program.pdf']
    ];
    
    foreach ($fileMapping as $fieldName => $mapping) {
        if (isset($files[$fieldName]) && $files[$fieldName]['error'] === UPLOAD_ERR_OK && $trainingFolderId) {
            // Delete old file if exists
            if (!empty($existing[$mapping['file_id_field']])) {
                deleteTrainingFile($driveService, $existing[$mapping['file_id_field']]);
            }
            
            // Upload new file
            $uploaded = uploadTrainingFile(
                $driveService,
                $files[$fieldName]['tmp_name'],
                $mapping['filename'],
                $trainingFolderId
            );
            
            if ($uploaded) {
                $updateFields[] = "{$mapping['url_field']} = ?";
                $params[] = $uploaded['view_url'];
                $types .= "s";
                
                $updateFields[] = "{$mapping['file_id_field']} = ?";
                $params[] = $uploaded['file_id'];
                $types .= "s";
            }
        }
    }
    
    // Handle new photos
    $photoFiles = [];
    if (isset($files['photos']) && $trainingFolderId) {
        $photoInput = $files['photos'];
        if (isset($photoInput['tmp_name']) && is_array($photoInput['tmp_name'])) {
            $photoCount = count($photoInput['tmp_name']);
            for ($i = 0; $i < $photoCount; $i++) {
                if ($photoInput['error'][$i] === UPLOAD_ERR_OK) {
                    $photoFiles[] = [
                        'name' => $photoInput['name'][$i],
                        'tmp_name' => $photoInput['tmp_name'][$i],
                        'error' => $photoInput['error'][$i]
                    ];
                }
            }
        } elseif (isset($photoInput['error']) && $photoInput['error'] === UPLOAD_ERR_OK) {
            $photoFiles[] = $photoInput;
        }
    }
    
    $existingPhotos = json_decode($existing['photos'], true) ?: ['urls' => [], 'file_ids' => []];
    
    if (!empty($photoFiles) && $photosFolderId) {
        $newPhotos = uploadTrainingPhotos($driveService, $photoFiles, $photosFolderId);
        $existingPhotos['urls'] = array_merge($existingPhotos['urls'], $newPhotos['urls']);
        $existingPhotos['file_ids'] = array_merge($existingPhotos['file_ids'], $newPhotos['file_ids']);
    }
    
    // Handle removal of existing photos
    if (isset($data['remove_photo_indices'])) {
        $removeIndices = is_string($data['remove_photo_indices']) 
            ? json_decode($data['remove_photo_indices'], true) 
            : $data['remove_photo_indices'];
        
        if (is_array($removeIndices)) {
            // Delete from Drive first
            foreach ($removeIndices as $index) {
                if (isset($existingPhotos['file_ids'][$index])) {
                    deleteTrainingFile($driveService, $existingPhotos['file_ids'][$index]);
                }
            }
            
            // Remove from arrays
            foreach ($removeIndices as $index) {
                unset($existingPhotos['urls'][$index]);
                unset($existingPhotos['file_ids'][$index]);
            }
            $existingPhotos['urls'] = array_values($existingPhotos['urls']);
            $existingPhotos['file_ids'] = array_values($existingPhotos['file_ids']);
        }
    }
    
    $updateFields[] = "photos = ?";
    $params[] = json_encode($existingPhotos);
    $types .= "s";
    
    // Update folder IDs if changed
    if ($folderStructureChanged) {
        $updateFields[] = "drive_folder_id = ?";
        $params[] = $newDriveFolders['training_folder_id'] ?? null;
        $types .= "s";
        
        $updateFields[] = "drive_campus_folder_id = ?";
        $params[] = $newDriveFolders['campus_folder_id'] ?? null;
        $types .= "s";
        
        $updateFields[] = "drive_center_folder_id = ?";
        $params[] = $newDriveFolders['center_folder_id'] ?? null;
        $types .= "s";
        
        $updateFields[] = "drive_category_folder_id = ?";
        $params[] = $newDriveFolders['category_folder_id'] ?? null;
        $types .= "s";
        
        $updateFields[] = "drive_entry_folder_id = ?";
        $params[] = $newDriveFolders['entry_folder_id'] ?? null;
        $types .= "s";
    }
    
    $updateFields[] = "updated_at = NOW()";
    
    $updateQuery = "UPDATE conducted_trainings SET " . implode(", ", $updateFields) . " WHERE id = ?";
    $params[] = $recordId;
    $types .= "i";
    
    $stmt = $con->prepare($updateQuery);
    if (!$stmt) {
        return ['success' => false, 'message' => "Prepare failed: " . $con->error];
    }
    
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        return [
            'success' => true,
            'message' => "Training record updated successfully",
            'data' => ['id' => $recordId]
        ];
    } else {
        return ['success' => false, 'message' => "Update failed: " . $stmt->error];
    }
}

function trashTrainingFile($driveService, $fileId) {
    if (empty($fileId)) return true;
    
    try {
        return $driveService->trashFile($fileId);
    } catch (Exception $e) {
        error_log("Failed to trash file $fileId: " . $e->getMessage());
        return false;
    }
}

function trashTrainingFolder($driveService, $folderId) {
    if (empty($folderId)) return true;
    
    try {
        return $driveService->trashFile($folderId);
    } catch (Exception $e) {
        error_log("Failed to trash folder $folderId: " . $e->getMessage());
        return false;
    }
}

function handleDelete($con, $driveService, $data) {
    $recordId = $data['id'] ?? 0;
    
    if (!$recordId) {
        return ['success' => false, 'message' => "Record ID is required for delete"];
    }
    
    // Get existing record to delete Drive files
    $query = "SELECT drive_entry_folder_id, activity_proposal_file_id, attendance_sheet_file_id, 
                     activity_report_file_id, program_file_id, photos 
              FROM conducted_trainings WHERE id = ?";
    $stmt = $con->prepare($query);
    $stmt->bind_param("i", $recordId);
    $stmt->execute();
    $result = $stmt->get_result();
    $existing = $result->fetch_assoc();
    
    if (!$existing) {
        return ['success' => false, 'message' => "Record not found"];
    }
    
    // Move Drive folder to trash
    if (!empty($existing['drive_entry_folder_id'])) {
        trashTrainingFolder($driveService, $existing['drive_entry_folder_id']);
    } else {
        // Fallback: trash individual files
        $fileFields = ['activity_proposal_file_id', 'attendance_sheet_file_id', 'activity_report_file_id', 'program_file_id'];
        foreach ($fileFields as $field) {
            if (!empty($existing[$field])) {
                trashTrainingFile($driveService, $existing[$field]);
            }
        }
        
        // Trash photos
        $photos = json_decode($existing['photos'], true) ?: [];
        if (!empty($photos['file_ids'])) {
            foreach ($photos['file_ids'] as $fileId) {
                trashTrainingFile($driveService, $fileId);
            }
        }
    }
    $deleteQuery = "DELETE FROM conducted_trainings WHERE id = ?";
    $deleteStmt = $con->prepare($deleteQuery);
    $deleteStmt->bind_param("i", $recordId);
    
    if ($deleteStmt->execute()) {
        return [
            'success' => true, 
            'message' => "Training record deleted successfully (files moved to Google Drive trash)"
        ];
    } else {
        return ['success' => false, 'message' => "Delete failed: " . $deleteStmt->error];
    }
}

function handleGetImage($con, $data) {
    $fileId = $data['fileId'] ?? '';
    $size = isset($data['size']) ? (int)$data['size'] : 400;
    
    if (empty($fileId)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'File ID is required']);
        exit();
    }
    
    if (!preg_match('/^[a-zA-Z0-9_-]+$/', $fileId)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Invalid file ID format']);
        exit();
    }
    
    // Try to get the image using multiple methods
    $imageData = null;
    $contentType = null;
    
    // Method 1: Try direct download with export=download
    $urls = [
        "https://drive.google.com/uc?export=download&id={$fileId}",
        "https://drive.google.com/uc?export=view&id={$fileId}",
        "https://drive.google.com/thumbnail?id={$fileId}&sz={$size}",
        "https://drive.google.com/file/d/{$fileId}/view"
    ];
    
    foreach ($urls as $url) {
        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
            // Get the content
            $response = curl_exec($ch);
            $info = curl_getinfo($ch);
            $contentType = $info['content_type'] ?? '';
            
            // Check if we got a valid image
            if ($response && strpos($contentType, 'image/') !== false) {
                $imageData = $response;
                break;
            }
            
            // If content-type is not image, check the actual content
            if ($response) {
                $finfo = new finfo(FILEINFO_MIME_TYPE);
                $mimeType = $finfo->buffer($response);
                if (strpos($mimeType, 'image/') === 0) {
                    $imageData = $response;
                    $contentType = $mimeType;
                    break;
                }
                
                // Check if it's an HTML page (Google Drive confirmation page)
                if (strpos($response, 'confirm') !== false) {
                    // Extract the confirmation token
                    preg_match('/confirm=([a-zA-Z0-9_-]+)/', $response, $matches);
                    if (isset($matches[1])) {
                        $confirmUrl = "https://drive.google.com/uc?export=download&id={$fileId}&confirm={$matches[1]}";
                        $ch2 = curl_init();
                        curl_setopt($ch2, CURLOPT_URL, $confirmUrl);
                        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
                        curl_setopt($ch2, CURLOPT_FOLLOWLOCATION, true);
                        curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
                        curl_setopt($ch2, CURLOPT_SSL_VERIFYHOST, false);
                        curl_setopt($ch2, CURLOPT_TIMEOUT, 30);
                        curl_setopt($ch2, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
                        $imageData = curl_exec($ch2);
                        $contentType = curl_getinfo($ch2, CURLINFO_CONTENT_TYPE);
                        curl_close($ch2);
                        
                        if ($imageData && strpos($contentType, 'image/') !== false) {
                            break;
                        }
                    }
                }
            }
            
        } catch (Exception $e) {
            error_log("Failed to fetch image from $url: " . $e->getMessage());
            continue;
        } finally {
            if (isset($ch)) {
                curl_close($ch);
            }
        }
    }
    
    // If no image found, try one more time with a different approach
    if (!$imageData || !$contentType || strpos($contentType, 'image/') === false) {
        try {
            // Try using file_get_contents with stream context
            $context = stream_context_create([
                'http' => [
                    'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\n",
                    'timeout' => 30,
                    'follow_location' => 1,
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false
                    ]
                ]
            ]);
            
            $url = "https://drive.google.com/uc?export=download&id={$fileId}";
            $imageData = @file_get_contents($url, false, $context);
            
            if ($imageData) {
                $finfo = new finfo(FILEINFO_MIME_TYPE);
                $mimeType = $finfo->buffer($imageData);
                if (strpos($mimeType, 'image/') === 0) {
                    $contentType = $mimeType;
                }
            }
        } catch (Exception $e) {
            error_log("Failed with file_get_contents: " . $e->getMessage());
        }
    }
    
    // If still no image, check if it's stored in our database with a different format
    if (!$imageData || !$contentType || strpos($contentType, 'image/') === false) {
        // Try to get the original URL from the database and redirect
        try {
            $query = "SELECT photos FROM conducted_trainings WHERE photos LIKE ?";
            $searchPattern = "%{$fileId}%";
            $stmt = $con->prepare($query);
            $stmt->bind_param("s", $searchPattern);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($row = $result->fetch_assoc()) {
                $photos = json_decode($row['photos'], true);
                if ($photos && isset($photos['urls'])) {
                    foreach ($photos['urls'] as $url) {
                        if (strpos($url, $fileId) !== false) {
                            // Redirect to the original Google Drive URL
                            header("Location: " . $url);
                            exit();
                        }
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Database lookup failed: " . $e->getMessage());
        }
        
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Image not found or not accessible']);
        exit();
    }
    
    // Set proper headers for image delivery
    header('Content-Type: ' . $contentType);
    header('Content-Length: ' . strlen($imageData));
    header('Cache-Control: public, max-age=86400');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept');
    
    // For debugging - log the content type
    error_log("Serving image with content type: " . $contentType);
    
    echo $imageData;
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($action === 'get_image' || $action === 'getImage')) {
    handleGetImage($con, $_GET);
    exit(); // handleGetImage already exits, but this ensures we stop here
}
if (!isset($conn)) {
    global $conn;
}
$con = $conn;

if (!$con || $con->connect_error) {
    $response = ['success' => false, 'message' => "Database connection failed: " . ($con ? $con->connect_error : "No connection")];
    echo json_encode($response);
    exit();
}

try {
    if (!class_exists('GoogleDriveService')) {
        throw new Exception("GoogleDriveService class not found. Please check driver_config.php");
    }
    
    $driveService = new GoogleDriveService();

    $response = ['success' => false, 'message' => 'No action specified'];

    if ($_SERVER['REQUEST_METHOD'] === 'GET' || $action === 'fetch_conducted') {
        $data = $_GET;
        if ($action === 'fetch_conducted') {
            $data = array_merge($data, $_POST);
        }
        $response = handleFetch($con, $data);

    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {

        if ($action === 'update_conducted') {
            $response = handleUpdate($con, $driveService, $_POST, $_FILES);
        } elseif ($action === 'delete_conducted') {
            $response = handleDelete($con, $driveService, $_POST);
        } elseif ($action === 'add_conducted') {
            $response = handleInsert($con, $driveService, $_POST, $_FILES);
        } else {
            $response = handleInsert($con, $driveService, $_POST, $_FILES);
        }
    } else {
        $response = ['success' => false, 'message' => "Invalid request method: " . $_SERVER['REQUEST_METHOD']];
    }
    
} catch (Exception $e) {
    error_log("Training API Error: " . $e->getMessage());
    $response = [
        'success' => false,
        'message' => "Server error: " . $e->getMessage()
    ];
}

while (ob_get_level()) ob_end_clean();
header('Content-Type: application/json; charset=utf-8');
echo json_encode($response);
exit();