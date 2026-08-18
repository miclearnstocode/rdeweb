<?php
set_time_limit(300);
header('Content-Type: application/json');

// Include your project-specific configs
require_once __DIR__ . '/../config/driver_config.php';
include('db.php');

$response = new stdClass();
$response->status = false;
$response->message = '';
$response->data = [];

$action = $_POST['action'] ?? '';

function updateEventStatuses($conn) {
    $conn->query("SET time_zone = '+08:00'");

    // We use STR_TO_DATE() to convert the text string into a real date format
    $checkSt = $conn->prepare("
        UPDATE announcements 
        SET status = CASE
            WHEN STR_TO_DATE(event_date, '%M %d, %Y') < CURDATE() THEN 'Ended'
            WHEN STR_TO_DATE(event_date, '%M %d, %Y') = CURDATE() THEN 'Ongoing'
            WHEN STR_TO_DATE(event_date, '%M %d, %Y') > CURDATE() THEN 'Upcoming'
            ELSE 'Upcoming'
        END
        WHERE 1=1
    ");
    
    $checkSt->execute();
    $checkSt->close();
}

// Validate Database connection
if (!$conn) {
    $response->message = "Database connection failed.";
    echo json_encode($response);
    exit;
}

// 1. FETCH ANNOUNCEMENTS
if ($action === 'getAll') {
    updateEventStatuses($conn);
    // Fetch all announcements including the new is_visible column
    $result = $conn->query("SELECT * FROM announcements ORDER BY created_at DESC");
    $data = [];
    while ($row = $result->fetch_assoc()) {
        if (!empty($row['gallery_images'])) {
            $row['gallery_images'] = json_decode($row['gallery_images'], true);
        } else {
            $row['gallery_images'] = [];
        }
        // Ensure is_visible is returned as an integer (0 or 1)
        $row['is_visible'] = (int)$row['is_visible'];
        $data[] = $row;
    }
    $response->status = true;
    $response->data = $data;
    echo json_encode($response);
    exit;
}

// 2. CREATE NEW ANNOUNCEMENT
if ($action === 'create') {
    $title = $_POST['title'] ?? '';
    $event_date = $_POST['event_date'] ?? '';
    $venue = $_POST['venue'] ?? '';
    $short_description = $_POST['short_description'] ?? '';
    $body = $_POST['body'] ?? '';
    $hashtags = $_POST['hashtags'] ?? '';
    $facebook_link = $_POST['facebook_link'] ?? '';
    $uploadedFiles = $_FILES['photos'] ?? [];

    if (empty($title) || empty($event_date)) {
        $response->message = "Title and Date are required.";
        echo json_encode($response);
        exit;
    }

    $gdriveFolderId = null;
    $galleryImages = [];

    if (!empty($uploadedFiles) && isset($uploadedFiles['name'][0]) && !empty($uploadedFiles['name'][0])) {
        try {
            $httpClient = new \GuzzleHttp\Client([
                'timeout' => 300, 
                'connect_timeout' => 60,
                'read_timeout' => 300,
                'retries' => 3 
            ]);

            $drive = new GoogleDriveService($httpClient);
            $rootFolderId = $drive->getRootFolderId();

            if (!$rootFolderId) {
                throw new Exception("Could not retrieve root folder ID.");
            }

            $baseFolderName = 'Announcements';
            $baseFolderId = $drive->findOrCreateFolder($baseFolderName, $rootFolderId);

            if (!$baseFolderId) {
                throw new Exception("Failed to create base Announcements folder.");
            }

            $cleanEventName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $title) . '_' . date('Y-m-d');
            $eventFolderId = $drive->findOrCreateFolder($cleanEventName, $baseFolderId);

            if (!$eventFolderId) {
                throw new Exception("Failed to create event sub-folder.");
            }

            $gdriveFolderId = $eventFolderId;

            $fileCount = count($uploadedFiles['name']);
            for ($i = 0; $i < $fileCount; $i++) {
                $tempFilePath = $uploadedFiles['tmp_name'][$i];
                $originalName = $uploadedFiles['name'][$i];
                $fileSize = $uploadedFiles['size'][$i];

                if ($fileSize > 0 && file_exists($tempFilePath)) {
                    $uploadResult = $drive->uploadFile($tempFilePath, $originalName, $eventFolderId);

                    if ($uploadResult['success'] && !empty($uploadResult['id'])) {
                        $drive->makeFilePublic($uploadResult['id']);
                        $galleryImages[] = [
                            'id' => $uploadResult['id'],
                            'viewUrl' => "https://drive.google.com/file/d/{$uploadResult['id']}/preview",
                            'downloadUrl' => "https://drive.google.com/uc?id={$uploadResult['id']}&export=download",
                            'name' => $originalName
                        ];
                    } else {
                        error_log("Failed to upload photo: " . ($uploadResult['error'] ?? 'Unknown error'));
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Google Drive upload error: " . $e->getMessage());
        }
    }

    $galleryImagesJson = !empty($galleryImages) ? json_encode($galleryImages) : null;
    $is_visible = 1; // Set default visibility to 1 (visible)

    $stmt = $conn->prepare("INSERT INTO announcements (title, event_date, venue, short_description, body, hashtags, facebook_link, gdrive_folder_id, gallery_images, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssssss", $title, $event_date, $venue, $short_description, $body, $hashtags, $facebook_link, $gdriveFolderId, $galleryImagesJson, $is_visible);
            
    if ($stmt->execute()) {
        updateEventStatuses($conn);
        $response->status = true;
        $response->message = "Announcement created with " . count($galleryImages) . " images!";
    } else {
        $response->message = "Database Error: " . $stmt->error;
    }
    $stmt->close();
    echo json_encode($response);
    exit;
}

// 3. TOGGLE VISIBILITY (New Action)
if ($action === 'toggleVisibility') {
    $id = $_POST['id'] ?? 0;
    $currentStatus = $_POST['currentStatus'] ?? 0;
    
    // Toggle 0 to 1, or 1 to 0
    $newStatus = $currentStatus == 1 ? 0 : 1;

    $stmt = $conn->prepare("UPDATE announcements SET is_visible = ? WHERE id = ?");
    $stmt->bind_param("ii", $newStatus, $id);
    
    if ($stmt->execute()) {
        $response->status = true;
        $response->message = "Visibility updated successfully.";
        $response->newStatus = $newStatus;
    } else {
        $response->message = "Failed to update visibility.";
    }
    $stmt->close();
    echo json_encode($response);
    exit;
}

// 4. DELETE ANNOUNCEMENT
if ($action === 'delete') {
    $id = $_POST['id'] ?? 0;
    $stmt = $conn->prepare("DELETE FROM announcements WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        $response->status = true;
        $response->message = "Announcement deleted.";
    } else {
        $response->message = "Failed to delete.";
    }
    $stmt->close();
    echo json_encode($response);
    exit;
}