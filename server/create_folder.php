<?php
require_once 'config/drive_config.php';

header('Content-Type: application/json');

try {
    $drive = new GoogleDriveService();
    $service = $drive->getService();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $eventName = $data['event'] ?? '';
    $centerName = $data['center'] ?? '';
    
    if (empty($eventName)) {
        throw new Exception('Event name is required');
    }
    
    // 1. Check if event folder exists or create it
    $eventFolderId = $this->findOrCreateFolder($service, $eventName, null);
    
    // 2. Create center folder inside event folder
    $centerFolderId = $this->findOrCreateFolder($service, $centerName, $eventFolderId);
    
    echo json_encode([
        'success' => true,
        'event_folder_id' => $eventFolderId,
        'center_folder_id' => $centerFolderId,
        'message' => 'Folders created successfully'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

function findOrCreateFolder($service, $folderName, $parentId = null) {
    // Search for existing folder
    $query = "name='$folderName' and mimeType='application/vnd.google-apps.folder'";
    if ($parentId) {
        $query .= " and '$parentId' in parents";
    }
    $query .= " and trashed=false";
    
    $result = $service->files->listFiles([
        'q' => $query,
        'fields' => 'files(id, name)'
    ]);
    
    if (count($result->getFiles()) > 0) {
        return $result->getFiles()[0]->getId();
    }
    
    // Create new folder
    $fileMetadata = new Google_Service_Drive_DriveFile([
        'name' => $folderName,
        'mimeType' => 'application/vnd.google-apps.folder',
        'parents' => $parentId ? [$parentId] : []
    ]);
    
    $folder = $service->files->create($fileMetadata, ['fields' => 'id']);
    return $folder->id;
}
?>