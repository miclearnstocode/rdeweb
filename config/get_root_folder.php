<?php
// get_root_folder.php
require_once 'drive_config.php';

$drive = new GoogleDriveService();
$service = $drive->getService();

// Search for your rde_system folder
$query = "name='rde_events' and mimeType='application/vnd.google-apps.folder' and trashed=false";
$result = $service->files->listFiles([
    'q' => $query,
    'fields' => 'files(id, name)'
]);

if (count($result->getFiles()) > 0) {
    $rootFolderId = $result->getFiles()[0]->getId();
    echo "Root Folder ID: " . $rootFolderId;
    
    // Save to config file
    file_put_contents('root_folder_id.txt', $rootFolderId);
} else {
    echo "Folder not found. Creating new...";
    
    // Create root folder
    $fileMetadata = new Google_Service_Drive_DriveFile([
        'name' => 'rde_system',
        'mimeType' => 'application/vnd.google-apps.folder'
    ]);
    
    $folder = $service->files->create($fileMetadata, ['fields' => 'id']);
    echo "Created new root folder with ID: " . $folder->id;
    file_put_contents('root_folder_id.txt', $folder->id);
}
?>