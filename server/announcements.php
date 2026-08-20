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

if ($action === 'create') {
    $title = $_POST['title'] ?? '';
    $event_date = $_POST['event_date'] ?? '';
    $venue = $_POST['venue'] ?? '';
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

            // --- ROUND ROBIN UPLOAD LOOP ---
            $fileCount = count($uploadedFiles['name']);
            $remainingIndices = range(0, $fileCount - 1); // [0, 1, 2, ...]

            // Continue looping until all files are processed
            while (!empty($remainingIndices)) {
                // Take the first index in the queue
                $i = array_shift($remainingIndices);
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
                        error_log("Failed to upload photo (attempt): " . ($uploadResult['error'] ?? 'Unknown error'));
                        $remainingIndices[] = $i;
                        usleep(200000);
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Google Drive upload error: " . $e->getMessage());
        }
    }

    $galleryImagesJson = !empty($galleryImages) ? json_encode($galleryImages) : null;
    $is_visible = 1; // Set default visibility to 1 (visible)

    $stmt = $conn->prepare("INSERT INTO announcements (title, event_date, venue, body, hashtags, facebook_link, gdrive_folder_id, gallery_images, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssss", $title, $event_date, $venue, $body, $hashtags, $facebook_link, $gdriveFolderId, $galleryImagesJson, $is_visible);
            
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
if ($action === 'getById') {
    $id = $_POST['id'] ?? 0;

    if (!$id) {
        $response->message = "Announcement ID is required.";
        echo json_encode($response);
        exit;
    }

    $stmt = $conn->prepare("SELECT * FROM announcements WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();

    if ($data) {
        // Decode gallery images into an array
        if (!empty($data['gallery_images'])) {
            $data['gallery_images'] = json_decode($data['gallery_images'], true);
        } else {
            $data['gallery_images'] = [];
        }
        $data['is_visible'] = (int)$data['is_visible'];

        $response->status = true;
        $response->data = $data;
    } else {
        $response->message = "Announcement not found.";
    }

    $stmt->close();
    echo json_encode($response);
    exit;
}

if ($action === 'update') {
    $id = $_POST['id'] ?? 0;
    $title = $_POST['title'] ?? '';
    $event_date = $_POST['event_date'] ?? '';
    $venue = $_POST['venue'] ?? '';
    $body = $_POST['body'] ?? '';
    $hashtags = $_POST['hashtags'] ?? '';
    $facebook_link = $_POST['facebook_link'] ?? '';
    $uploadedFiles = $_FILES['photos'] ?? [];
    $deleteImageIds = isset($_POST['delete_image_ids']) ? json_decode($_POST['delete_image_ids'], true) : [];
    $existingImagesJson = $_POST['existing_images_json'] ?? '[]';

    if (empty($title) || empty($event_date) || empty($id)) {
        $response->message = "Title, Date, and ID are required.";
        echo json_encode($response);
        exit;
    }

    // Fetch the existing data
    $existingStmt = $conn->prepare("SELECT gdrive_folder_id, gallery_images FROM announcements WHERE id = ?");
    $existingStmt->bind_param("i", $id);
    $existingStmt->execute();
    $existingResult = $existingStmt->get_result();
    $existingData = $existingResult->fetch_assoc();
    $gdriveFolderId = $existingData['gdrive_folder_id'] ?? null;
    $existingGalleryImages = json_decode($existingData['gallery_images'] ?? '[]', true) ?: [];
    $existingStmt->close();

    // --- HANDLE DELETED IMAGES (User clicked X) ---
    if (!empty($deleteImageIds)) {
        try {
            $httpClient = new \GuzzleHttp\Client(['timeout' => 30]);
            $drive = new GoogleDriveService($httpClient);
            foreach ($deleteImageIds as $fileId) {
                $drive->deleteFile($fileId); // Move to Trash
                error_log("Deleted image from GDrive: $fileId");
            }
        } catch (Exception $e) {
            error_log("Failed to delete images from GDrive: " . $e->getMessage());
        }
    }

    // --- HANDLE UPDATED EXISTING IMAGES ---
    $finalGalleryImages = json_decode($existingImagesJson, true);
    if (!is_array($finalGalleryImages)) {
        $finalGalleryImages = [];
    }

    // --- HANDLE NEW IMAGES (Uploaded via DragDropUpload) ---
    if (!empty($uploadedFiles) && isset($uploadedFiles['name'][0]) && !empty($uploadedFiles['name'][0])) {
        try {
            // Ensure we have a folder to upload to
            if (!$gdriveFolderId) {
                // If the announcement had no folder, create a new one
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
                $cleanEventName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $title) . '_' . date('Y-m-d');
                $eventFolderId = $drive->findOrCreateFolder($cleanEventName, $baseFolderId);
                $gdriveFolderId = $eventFolderId;
            }

            $drive = new GoogleDriveService(new \GuzzleHttp\Client([
                'timeout' => 300,
                'connect_timeout' => 60,
                'read_timeout' => 300,
                'retries' => 3
            ]));

            // --- ROUND ROBIN UPLOAD LOOP ---
            $fileCount = count($uploadedFiles['name']);
            $remainingIndices = range(0, $fileCount - 1);

            while (!empty($remainingIndices)) {
                $i = array_shift($remainingIndices);
                $tempFilePath = $uploadedFiles['tmp_name'][$i];
                $originalName = $uploadedFiles['name'][$i];
                $fileSize = $uploadedFiles['size'][$i];

                if ($fileSize > 0 && file_exists($tempFilePath)) {
                    $uploadResult = $drive->uploadFile($tempFilePath, $originalName, $gdriveFolderId);

                    if ($uploadResult['success'] && !empty($uploadResult['id'])) {
                        $drive->makeFilePublic($uploadResult['id']);
                        $finalGalleryImages[] = [
                            'id' => $uploadResult['id'],
                            'viewUrl' => "https://drive.google.com/file/d/{$uploadResult['id']}/preview",
                            'downloadUrl' => "https://drive.google.com/uc?id={$uploadResult['id']}&export=download",
                            'name' => $originalName
                        ];
                    } else {
                        error_log("Failed to upload photo (attempt): " . ($uploadResult['error'] ?? 'Unknown error'));
                        $remainingIndices[] = $i;
                        usleep(200000);
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Google Drive upload error during update: " . $e->getMessage());
            // If upload fails, do not destroy the existing data
        }
    }

    $galleryImagesJson = !empty($finalGalleryImages) ? json_encode($finalGalleryImages) : null;

    $stmt = $conn->prepare("UPDATE announcements SET title = ?, event_date = ?, venue = ?, body = ?, hashtags = ?, facebook_link = ?, gdrive_folder_id = ?, gallery_images = ? WHERE id = ?");
    $stmt->bind_param("ssssssssi", $title, $event_date, $venue, $body, $hashtags, $facebook_link, $gdriveFolderId, $galleryImagesJson, $id);

    if ($stmt->execute()) {
        updateEventStatuses($conn);
        $response->status = true;
        $response->message = "Announcement updated successfully!";
    } else {
        $response->message = "Database Error: " . $stmt->error;
    }
    $stmt->close();
    echo json_encode($response);
    exit;
}

if ($action === 'delete') {
    $id = $_POST['id'] ?? 0;

    // Fetch the folder ID first to delete it from Google Drive
    $fetchStmt = $conn->prepare("SELECT gdrive_folder_id FROM announcements WHERE id = ?");
    $fetchStmt->bind_param("i", $id);
    $fetchStmt->execute();
    $fetchResult = $fetchStmt->get_result();
    $folderId = null;
    if ($row = $fetchResult->fetch_assoc()) {
        $folderId = $row['gdrive_folder_id'];
    }
    $fetchStmt->close();

    // Delete from database
    $stmt = $conn->prepare("DELETE FROM announcements WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        // Attempt to delete the folder from Google Drive (Move to Trash)
        if ($folderId) {
            try {
                $httpClient = new \GuzzleHttp\Client([
                    'timeout' => 30
                ]);
                $drive = new GoogleDriveService($httpClient);
                $drive->deleteFile($folderId); // Assuming your service has a delete method
            } catch (Exception $e) {
                error_log("Failed to delete Google Drive folder during announcement deletion: " . $e->getMessage());
                // We don't fail the operation, just log it
            }
        }
        $response->status = true;
        $response->message = "Announcement deleted.";
    } else {
        $response->message = "Failed to delete.";
    }
    $stmt->close();
    echo json_encode($response);
    exit;
}
