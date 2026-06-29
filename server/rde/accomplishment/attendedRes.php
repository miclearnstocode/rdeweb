<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/drive_errors.log');

header('Content-Type: application/json; charset=utf-8');

// Start output buffering to catch errors
ob_start(function($buffer) {
    if (strpos($buffer, '<b>Warning</b>') !== false || 
        strpos($buffer, '<b>Notice</b>') !== false ||
        strpos($buffer, '<b>Fatal error</b>') !== false) {
        error_log("HTML error in output buffer: " . substr($buffer, 0, 500));
        return json_encode([
            'success' => false,
            'message' => 'Server error occurred',
            'error_type' => 'html_error_in_response'
        ]);
    }
    return $buffer;
});

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/driver_config.php';
require_once __DIR__ . '/../../db.php';

date_default_timezone_set('Asia/Manila');

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

function cleanAttendedFolderName($name) {
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

function uploadAttendedFileToDrive($tempFilePath, $fileName, $documentType, $type, $location, $category, $title) {
    try {
        if (!file_exists($tempFilePath)) {
            throw new Exception("Temporary file not found: $tempFilePath");
        }
        
        $fileSize = filesize($tempFilePath);
        if ($fileSize > 10 * 1024 * 1024) {
            throw new Exception("File too large: " . round($fileSize / 1024 / 1024, 2) . "MB (max 10MB)");
        }
        
        if (!class_exists('GoogleDriveService')) {
            throw new Exception("GoogleDriveService class not found");
        }
        
        $drive = new GoogleDriveService();
        
        // Get current quarter folder name (e.g., "2026 RDE 2nd Quarter Accomplishment Report")
        $quarterFolderName = getCurrentQuarter();
        $cleanLocation = cleanAttendedFolderName($location);
        $cleanCategory = cleanAttendedFolderName($category);
        $cleanTitle = cleanAttendedFolderName($title);
        
        // Get or create quarter root folder
        $quarterFolderId = getOrCreateRootFolder($drive, $quarterFolderName);
        
        // Get or create "Faculty Research Training Attended" folder
        $attendedResearchFolderId = getOrCreateSubFolder($drive, $quarterFolderId, 'Faculty Research Training Attended');
        
        // ADDED: Get or create location/campus folder based on type and location
        $locationFolderName = '';
        if ($type === 'campus') {
            $locationFolderName = $cleanLocation . ' Campus';
        } elseif ($type === 'center') {
            $locationFolderName = $cleanLocation;
        } else {
            $locationFolderName = $cleanLocation;
        }
        
        $locationFolderId = getOrCreateSubFolder($drive, $attendedResearchFolderId, $locationFolderName);
        
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
        $embedUrl = "https://drive.google.com/file/d/{$fileId}/preview";
        $downloadUrl = "https://drive.google.com/uc?id={$fileId}&export=download";
        
        $result = [
            'success' => true,
            'drive_file_id' => $uploadResult['id'],
            'drive_view_url' => $embedUrl,
            'drive_download_url' => $downloadUrl,
            'drive_quarter_folder_id' => $quarterFolderId,
            'drive_attended_folder_id' => $attendedResearchFolderId,
            'drive_location_folder_id' => $locationFolderId,
            'drive_title_folder_id' => $titleFolderId,
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
    // Use findOrCreateFolder which supports Shared Drives
    if (method_exists($drive, 'findOrCreateFolder')) {
        try {
            // Pass the root folder ID from the drive service
            $rootFolderId = $drive->getRootFolderId();
            $folderId = $drive->findOrCreateFolder($folderName, $rootFolderId);
            error_log("Root folder found/created: $folderName with ID: $folderId");
            return $folderId;
        } catch (Exception $e) {
            error_log("Error with findOrCreateFolder: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Fallback: Use createFolder with root folder ID
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
    }
    
    // Use findOrCreateFolder which supports Shared Drives
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
    
    // Fallback: Use createFolder
    if (method_exists($drive, 'createFolder')) {
        $folderId = $drive->createFolder($folderName, $parentId);
        error_log("Created subfolder: $folderName in parent: $parentId");
        return $folderId;
    }
    
    throw new Exception("GoogleDriveService does not have required methods for Shared Drive");
}

// Process fetch attended data request
if (isset($_POST['action']) && $_POST['action'] === 'fetch_attended') {
    $response = ['success' => false, 'message' => '', 'data' => [], 'summary' => [], 'pagination' => []];
    
    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        if (!$con || $con->connect_error) {
            throw new Exception("Database connection failed: " . ($con->connect_error ?? 'Unknown error'));
        }
        
        $cursor = isset($_POST['cursor']) ? intval($_POST['cursor']) : 0;
        $limit = 50;

        $whereConditions = [];
        $params = [];
        $types = "";
        
        if (isset($_POST['campus']) && !empty($_POST['campus']) && $_POST['campus'] !== 'All Campuses') {
            $whereConditions[] = "type = 'campus' AND location = ?";
            $params[] = $_POST['campus'];
            $types .= "s";
        }
        
        if (isset($_POST['center']) && !empty($_POST['center']) && $_POST['center'] !== 'All Centers') {
            $whereConditions[] = "type = 'center' AND location = ?";
            $params[] = $_POST['center'];
            $types .= "s";
        }
        
        if (isset($_POST['category']) && !empty($_POST['category']) && $_POST['category'] !== 'All Categories') {
            $whereConditions[] = "category = ?";
            $params[] = $_POST['category'];
            $types .= "s";
        }
        
        $whereClause = empty($whereConditions) ? "" : "WHERE " . implode(" AND ", $whereConditions);
        
        // Get total count for summary
        $countQuery = "SELECT COUNT(*) as total FROM attended_trainings $whereClause";
        $countStmt = $con->prepare($countQuery);
        if (!empty($params)) {
            $countStmt->bind_param($types, ...$params);
        }
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $totalCount = $countResult->fetch_assoc()['total'];
        
        // Get summary statistics
        $summaryQuery = "SELECT 
            COUNT(*) as totalTrainings,
            COALESCE(SUM(JSON_LENGTH(attendees)), 0) as totalAttendees,
            SUM(CASE WHEN category = 'Institutional' THEN 1 ELSE 0 END) as institutional,
            SUM(CASE WHEN category = 'National' THEN 1 ELSE 0 END) as national,
            SUM(CASE WHEN category = 'Regional' THEN 1 ELSE 0 END) as regional,
            SUM(CASE WHEN category = 'Local' THEN 1 ELSE 0 END) as local
        FROM attended_trainings $whereClause";
        
        $summaryStmt = $con->prepare($summaryQuery);
        if (!empty($params)) {
            $summaryStmt->bind_param($types, ...$params);
        }
        $summaryStmt->execute();
        $summaryResult = $summaryStmt->get_result();
        $summary = $summaryResult->fetch_assoc();
        
        // Get paginated data - Select all columns including the document URLs
        $dataQuery = "SELECT * FROM attended_trainings $whereClause ORDER BY id DESC LIMIT ? OFFSET ?";
        $dataStmt = $con->prepare($dataQuery);
        
        $offset = $cursor;
        $dataParams = array_merge($params, [$limit, $offset]);
        $dataTypes = $types . "ii";
        $dataStmt->bind_param($dataTypes, ...$dataParams);
        $dataStmt->execute();
        $dataResult = $dataStmt->get_result();
        
        $data = [];
        while ($row = $dataResult->fetch_assoc()) {
            // Decode JSON fields
            $row['attendees'] = json_decode($row['attendees'], true);
            // The document URLs are already available in the row:
            // memorandum_drive_view_url
            // invitation_drive_view_url
            // certificate_drive_view_url
            // program_drive_view_url
            $data[] = $row;
        }
        
        $hasMore = ($offset + $limit) < $totalCount;
        $nextCursor = $hasMore ? $offset + $limit : null;
        
        $response['success'] = true;
        $response['data'] = $data;
        $response['summary'] = $summary;
        $response['pagination'] = [
            'has_more' => $hasMore,
            'next_cursor' => $nextCursor,
            'total' => $totalCount,
            'limit' => $limit
        ];
        
    } catch (Exception $e) {
        error_log("Fetch attended data error: " . $e->getMessage());
        $response['message'] = $e->getMessage();
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}

// Process add attended training request
if (isset($_POST['action']) && $_POST['action'] === 'add_attended') {
    $response = ['success' => false, 'message' => ''];
    
    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        if (!$con || $con->connect_error) {
            throw new Exception("Database connection failed");
        }
        
        $type = $_POST['type'] ?? '';
        $location = $_POST['location'] ?? '';
        $attendeesJson = $_POST['attendees'] ?? '[]';
        $title = $_POST['title'] ?? '';
        $category = $_POST['category'] ?? '';
        $date = $_POST['date'] ?? '';
        $venue = $_POST['venue'] ?? '';
        $sponsoringAgency = $_POST['sponsoringAgency'] ?? '';
        $createdBy = $_SESSION['userId'] ?? null;
        
        // Validate required fields
        if (empty($type) || empty($location) || empty($title) || empty($category) || empty($date) || empty($venue) || empty($sponsoringAgency)) {
            throw new Exception("Please fill in all required fields");
        }
        
        // Validate attendees - accepts both array format and comma-separated string
        $attendeesArray = [];
        
        // Check if attendees is already a JSON array
        if (!empty($attendeesJson) && $attendeesJson !== '[]') {
            $decodedAttendees = json_decode($attendeesJson, true);
            if (is_array($decodedAttendees) && !empty($decodedAttendees)) {
                // Handle both formats: array of objects [{name: "..."}] or array of strings ["..."]
                foreach ($decodedAttendees as $attendee) {
                    if (is_string($attendee)) {
                        // Already a string
                        $attendeesArray[] = $attendee;
                    } elseif (is_array($attendee) && isset($attendee['name'])) {
                        // Object with name property
                        $attendeesArray[] = $attendee['name'];
                    }
                }
            }
        }
        
        // If not parsed from JSON, try processing as comma-separated string
        if (empty($attendeesArray) && isset($_POST['attendees_input'])) {
            $attendeesInput = trim($_POST['attendees_input']);
            if (!empty($attendeesInput)) {
                // Split by comma and clean up names
                $names = array_map('trim', explode(',', $attendeesInput));
                $attendeesArray = array_filter($names, function($name) {
                    return !empty($name);
                });
            }
        }
        
        // Validate that we have at least one attendee
        if (empty($attendeesArray)) {
            throw new Exception("Please add at least one attendee. Enter names separated by commas (e.g., Dr. Michael John, Juan Tamad, Juan Pusong)");
        }
        
        // Clean and normalize all names
        $attendeesArray = array_values(array_map('trim', $attendeesArray));
        
        // Convert to JSON array of strings for database storage
        $attendees = json_encode($attendeesArray);
        
        // Upload files to Google Drive
        $memorandumResult = null;
        $invitationResult = null;
        $certificateResult = null;
        $programResult = null;
        
        // Upload Memorandum to Attend
        if (isset($_FILES['memorandum_file']) && $_FILES['memorandum_file']['error'] === UPLOAD_ERR_OK) {
            $memorandumResult = uploadAttendedFileToDrive(
                $_FILES['memorandum_file']['tmp_name'],
                $_FILES['memorandum_file']['name'],
                'Memorandum',
                $type,
                $location,
                $category,
                $title
            );
        }
        
        // Upload Invitation
        if (isset($_FILES['invitation_file']) && $_FILES['invitation_file']['error'] === UPLOAD_ERR_OK) {
            $invitationResult = uploadAttendedFileToDrive(
                $_FILES['invitation_file']['tmp_name'],
                $_FILES['invitation_file']['name'],
                'Invitation',
                $type,
                $location,
                $category,
                $title
            );
        }
        
        // Upload Certificate
        if (isset($_FILES['certificate_file']) && $_FILES['certificate_file']['error'] === UPLOAD_ERR_OK) {
            $certificateResult = uploadAttendedFileToDrive(
                $_FILES['certificate_file']['tmp_name'],
                $_FILES['certificate_file']['name'],
                'Certificate',
                $type,
                $location,
                $category,
                $title
            );
        }
        
        // Upload Program
        if (isset($_FILES['program_file']) && $_FILES['program_file']['error'] === UPLOAD_ERR_OK) {
            $programResult = uploadAttendedFileToDrive(
                $_FILES['program_file']['tmp_name'],
                $_FILES['program_file']['name'],
                'Program',
                $type,
                $location,
                $category,
                $title
            );
        }
        
        // Prepare insert query
        $query = "INSERT INTO attended_trainings (
            type, location, attendees, title, category, date, venue, 
            sponsoring_agency, memorandum_drive_file_id, memorandum_drive_view_url,
            invitation_drive_file_id, invitation_drive_view_url,
            certificate_drive_file_id, certificate_drive_view_url,
            program_drive_file_id, program_drive_view_url,
            created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $con->prepare($query);
        
        $memorandumFileId = $memorandumResult['drive_file_id'] ?? null;
        $memorandumViewUrl = $memorandumResult['drive_view_url'] ?? null;
        $invitationFileId = $invitationResult['drive_file_id'] ?? null;
        $invitationViewUrl = $invitationResult['drive_view_url'] ?? null;
        $certificateFileId = $certificateResult['drive_file_id'] ?? null;
        $certificateViewUrl = $certificateResult['drive_view_url'] ?? null;
        $programFileId = $programResult['drive_file_id'] ?? null;
        $programViewUrl = $programResult['drive_view_url'] ?? null;
        
        $stmt->bind_param(
            "ssssssssssssssssi",
            $type, $location, $attendees, $title, $category, $date, $venue,
            $sponsoringAgency,
            $memorandumFileId, $memorandumViewUrl,
            $invitationFileId, $invitationViewUrl,
            $certificateFileId, $certificateViewUrl,
            $programFileId, $programViewUrl,
            $createdBy
        );
        
        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = "Training/Seminar added successfully";
            $response['id'] = $con->insert_id;
        } else {
            throw new Exception("Database insert failed: " . $stmt->error);
        }
        
    } catch (Exception $e) {
        error_log("Add attended training error: " . $e->getMessage());
        $response['message'] = $e->getMessage();
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}

// Process update attended training request
if (isset($_POST['action']) && $_POST['action'] === 'update_attended') {
    $response = ['success' => false, 'message' => ''];
    
    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        if (!$con || $con->connect_error) {
            throw new Exception("Database connection failed");
        }
        
        $id = $_POST['id'] ?? 0;
        $type = $_POST['type'] ?? '';
        $location = $_POST['location'] ?? '';
        $attendeesJson = $_POST['attendees'] ?? '[]';
        $title = $_POST['title'] ?? '';
        $category = $_POST['category'] ?? '';
        $date = $_POST['date'] ?? '';
        $venue = $_POST['venue'] ?? '';
        $sponsoringAgency = $_POST['sponsoringAgency'] ?? '';
        
        // Validate required fields
        if (empty($id)) {
            throw new Exception("Record ID is required");
        }
        
        if (empty($type) || empty($location) || empty($title) || empty($category) || empty($date) || empty($venue) || empty($sponsoringAgency)) {
            throw new Exception("Please fill in all required fields");
        }
        
        // Get existing record
        $existingStmt = $con->prepare("SELECT * FROM attended_trainings WHERE id = ?");
        $existingStmt->bind_param("i", $id);
        $existingStmt->execute();
        $existing = $existingStmt->get_result()->fetch_assoc();
        
        if (!$existing) {
            throw new Exception("Record not found");
        }
        
        // Validate attendees - accepts both array format and comma-separated string
        $attendeesArray = [];
        
        // Check if attendees is already a JSON array
        if (!empty($attendeesJson) && $attendeesJson !== '[]') {
            $decodedAttendees = json_decode($attendeesJson, true);
            if (is_array($decodedAttendees) && !empty($decodedAttendees)) {
                // Handle both formats: array of objects [{name: "..."}] or array of strings ["..."]
                foreach ($decodedAttendees as $attendee) {
                    if (is_string($attendee)) {
                        // Already a string
                        $attendeesArray[] = $attendee;
                    } elseif (is_array($attendee) && isset($attendee['name'])) {
                        // Object with name property
                        $attendeesArray[] = $attendee['name'];
                    }
                }
            }
        }
        
        // If not parsed from JSON, try processing as comma-separated string
        if (empty($attendeesArray) && isset($_POST['attendees_input'])) {
            $attendeesInput = trim($_POST['attendees_input']);
            if (!empty($attendeesInput)) {
                // Split by comma and clean up names
                $names = array_map('trim', explode(',', $attendeesInput));
                $attendeesArray = array_filter($names, function($name) {
                    return !empty($name);
                });
            }
        }
        
        // Validate that we have at least one attendee
        if (empty($attendeesArray)) {
            throw new Exception("Please add at least one attendee. Enter names separated by commas (e.g., Dr. Michael John, Juan Tamad, Juan Pusong)");
        }
        
        // Clean and normalize all names
        $attendeesArray = array_values(array_map('trim', $attendeesArray));
        
        // Convert to JSON array of strings for database storage
        $attendees = json_encode($attendeesArray);
        
        // Upload new files if provided
        $memorandumResult = null;
        $invitationResult = null;
        $certificateResult = null;
        $programResult = null;
        
        if (isset($_FILES['memorandum_file']) && $_FILES['memorandum_file']['error'] === UPLOAD_ERR_OK) {
            $memorandumResult = uploadAttendedFileToDrive(
                $_FILES['memorandum_file']['tmp_name'],
                $_FILES['memorandum_file']['name'],
                'Memorandum',
                $type,
                $location,
                $category,
                $title
            );
        }
        
        if (isset($_FILES['invitation_file']) && $_FILES['invitation_file']['error'] === UPLOAD_ERR_OK) {
            $invitationResult = uploadAttendedFileToDrive(
                $_FILES['invitation_file']['tmp_name'],
                $_FILES['invitation_file']['name'],
                'Invitation',
                $type,
                $location,
                $category,
                $title
            );
        }
        
        if (isset($_FILES['certificate_file']) && $_FILES['certificate_file']['error'] === UPLOAD_ERR_OK) {
            $certificateResult = uploadAttendedFileToDrive(
                $_FILES['certificate_file']['tmp_name'],
                $_FILES['certificate_file']['name'],
                'Certificate',
                $type,
                $location,
                $category,
                $title
            );
        }
        
        if (isset($_FILES['program_file']) && $_FILES['program_file']['error'] === UPLOAD_ERR_OK) {
            $programResult = uploadAttendedFileToDrive(
                $_FILES['program_file']['tmp_name'],
                $_FILES['program_file']['name'],
                'Program',
                $type,
                $location,
                $category,
                $title
            );
        }
        
        // Build update query dynamically
        $updates = [];
        $params = [];
        $types = "";
        
        $updates[] = "type = ?";
        $params[] = $type;
        $types .= "s";
        
        $updates[] = "location = ?";
        $params[] = $location;
        $types .= "s";
        
        $updates[] = "attendees = ?";
        $params[] = $attendees;
        $types .= "s";
        
        $updates[] = "title = ?";
        $params[] = $title;
        $types .= "s";
        
        $updates[] = "category = ?";
        $params[] = $category;
        $types .= "s";
        
        $updates[] = "date = ?";
        $params[] = $date;
        $types .= "s";
        
        $updates[] = "venue = ?";
        $params[] = $venue;
        $types .= "s";
        
        $updates[] = "sponsoring_agency = ?";
        $params[] = $sponsoringAgency;
        $types .= "s";
        
        if ($memorandumResult) {
            $updates[] = "memorandum_drive_file_id = ?";
            $params[] = $memorandumResult['drive_file_id'];
            $types .= "s";
            
            $updates[] = "memorandum_drive_view_url = ?";
            $params[] = $memorandumResult['drive_view_url'];
            $types .= "s";
        }
        
        if ($invitationResult) {
            $updates[] = "invitation_drive_file_id = ?";
            $params[] = $invitationResult['drive_file_id'];
            $types .= "s";
            
            $updates[] = "invitation_drive_view_url = ?";
            $params[] = $invitationResult['drive_view_url'];
            $types .= "s";
        }
        
        if ($certificateResult) {
            $updates[] = "certificate_drive_file_id = ?";
            $params[] = $certificateResult['drive_file_id'];
            $types .= "s";
            
            $updates[] = "certificate_drive_view_url = ?";
            $params[] = $certificateResult['drive_view_url'];
            $types .= "s";
        }
        
        if ($programResult) {
            $updates[] = "program_drive_file_id = ?";
            $params[] = $programResult['drive_file_id'];
            $types .= "s";
            
            $updates[] = "program_drive_view_url = ?";
            $params[] = $programResult['drive_view_url'];
            $types .= "s";
        }
        
        $updates[] = "updated_at = NOW()";
        $params[] = $id;
        $types .= "i";
        
        $query = "UPDATE attended_trainings SET " . implode(", ", $updates) . " WHERE id = ?";
        $stmt = $con->prepare($query);
        $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = "Training/Seminar updated successfully";
        } else {
            throw new Exception("Database update failed: " . $stmt->error);
        }
        
    } catch (Exception $e) {
        error_log("Update attended training error: " . $e->getMessage());
        $response['message'] = $e->getMessage();
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}

// Process delete attended training request
if (isset($_POST['action']) && $_POST['action'] === 'delete_attended') {
    $response = ['success' => false, 'message' => ''];
    
    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        if (!$con || $con->connect_error) {
            throw new Exception("Database connection failed");
        }
        
        $id = $_POST['id'] ?? 0;
        
        // Get file IDs to delete from Google Drive
        $stmt = $con->prepare("SELECT 
            memorandum_drive_file_id, invitation_drive_file_id,
            certificate_drive_file_id, program_drive_file_id
        FROM attended_trainings WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $record = $result->fetch_assoc();
        
        // Delete from database
        $deleteStmt = $con->prepare("DELETE FROM attended_trainings WHERE id = ?");
        $deleteStmt->bind_param("i", $id);
        
        if ($deleteStmt->execute()) {
            $response['success'] = true;
            $response['message'] = "Training/Seminar deleted successfully";
        } else {
            throw new Exception("Database delete failed: " . $deleteStmt->error);
        }
        
    } catch (Exception $e) {
        error_log("Delete attended training error: " . $e->getMessage());
        $response['message'] = $e->getMessage();
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}

// If no action matched
$response = ['success' => false, 'message' => 'Invalid action'];
ob_clean();
echo json_encode($response);
exit();