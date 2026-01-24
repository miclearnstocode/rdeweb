<?php
require_once __DIR__ . '/vendor/autoload.php';

if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    throw new Exception("Google API Client not installed. Run 'composer require google/apiclient:^2.0'");
}

class GoogleDriveService {
    private $service;
    private $serviceAccountFile = __DIR__ . '/rdesystem-secret.json';
    private $rootFolderId = '1CzaefvD9Xw9uHwlAfYWM7evCSIBUPjt2'; // Shared Drive folder ID
    
    public function __construct() {
        try {
            if (!file_exists($this->serviceAccountFile)) {
                throw new Exception("Service account file not found: " . $this->serviceAccountFile);
            }
            
            $client = new Google_Client();
            $client->setAuthConfig($this->serviceAccountFile);
            $client->addScope(Google_Service_Drive::DRIVE);
            $client->setApplicationName("RDE System");
            
            $this->service = new Google_Service_Drive($client);
            
        } catch (Exception $e) {
            error_log("Google Drive Service initialization failed: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function getService() {
        return $this->service;
    }
    
    public function getRootFolderId() {
        return $this->rootFolderId;
    }
    
    public function setRootFolderId($folderId) {
        $this->rootFolderId = $folderId;
    }
    
    // Method to find or create folder in Shared Drive
    public function findOrCreateFolder($folderName, $parentId = null) {
        $service = $this->service;
        $parentId = $parentId ?: $this->rootFolderId;
        
        // Clean folder name for query
        $escapedFolderName = str_replace("'", "\\'", $folderName);
        
        // Search for existing folder
        $query = "name='$escapedFolderName' and mimeType='application/vnd.google-apps.folder'";
        $query .= " and '$parentId' in parents";
        $query .= " and trashed=false";
        
        try {
            // First try without driveId (simpler search)
            $result = $service->files->listFiles([
                'q' => $query,
                'fields' => 'files(id, name)',
                'supportsAllDrives' => true,
                'includeItemsFromAllDrives' => true
            ]);
            
            if (count($result->getFiles()) > 0) {
                return $result->getFiles()[0]->getId();
            }
        } catch (Exception $e) {
            // If that fails, try with driveId if we can extract it
            error_log("Simple search failed, trying with driveId: " . $e->getMessage());
        }
        
        // Create new folder
        $fileMetadata = new Google_Service_Drive_DriveFile([
            'name' => $folderName,
            'mimeType' => 'application/vnd.google-apps.folder',
            'parents' => [$parentId]
        ]);
        
        $folder = $service->files->create($fileMetadata, [
            'fields' => 'id',
            'supportsAllDrives' => true
        ]);
        return $folder->id;
    }
    
    // Method to upload file to specific folder in Shared Drive
    public function uploadFile($filePath, $fileName, $folderId, $mimeType = null) {
        $service = $this->service;
        
        if (!file_exists($filePath)) {
            throw new Exception("Local file not found: $filePath");
        }
        
        if (!$mimeType) {
            $mimeType = mime_content_type($filePath);
            if (!$mimeType) {
                $mimeType = 'application/octet-stream';
            }
        }
        
        try {
            $fileMetadata = new Google_Service_Drive_DriveFile([
                'name' => $fileName,
                'parents' => [$folderId]
            ]);
            
            $content = file_get_contents($filePath);
            
            if ($content === false) {
                throw new Exception("Failed to read file contents: $filePath");
            }
            
            $file = $service->files->create($fileMetadata, [
                'data' => $content,
                'mimeType' => $mimeType,
                'uploadType' => 'multipart',
                'fields' => 'id, name, size, webViewLink, webContentLink, thumbnailLink',
                'supportsAllDrives' => true
            ]);
            
            return [
                'success' => true,
                'id' => $file->getId(),
                'name' => $file->getName(),
                'size' => $file->getSize(),
                'view_url' => $file->getWebViewLink(),
                'download_url' => $file->getWebContentLink(),
                'thumbnail_url' => $file->getThumbnailLink()
            ];
            
        } catch (Exception $e) {
            error_log("Google Drive upload error: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'code' => $e->getCode()
            ];
        }
    }
    
    // Method to create complete folder structure in Shared Drive
    public function createResearchFolderStructure($eventName, $centerName) {
        try {
            // 1. Create or get event folder inside root
            $eventFolderId = $this->findOrCreateFolder($eventName, $this->rootFolderId);
            error_log("Event folder created: $eventFolderId for $eventName");
            
            // 2. Create or get center folder inside event folder
            $centerFolderId = $this->findOrCreateFolder($centerName, $eventFolderId);
            error_log("Center folder created: $centerFolderId for $centerName");
            
            return [
                'event_folder_id' => $eventFolderId,
                'center_folder_id' => $centerFolderId
            ];
            
        } catch (Exception $e) {
            error_log("Failed to create folder structure: " . $e->getMessage());
            throw new Exception("Failed to create folder structure: " . $e->getMessage());
        }
    }
    
    // Method to generate shareable link in Shared Drive
    public function makeFilePublic($fileId) {
        $service = $this->service;
        
        try {
            // Set permission to anyone can view
            $permission = new Google_Service_Drive_Permission([
                'type' => 'anyone',
                'role' => 'reader'
            ]);
            
            $service->permissions->create($fileId, $permission, [
                'supportsAllDrives' => true
            ]);
            return true;
        } catch (Exception $e) {
            error_log("Error making file public: " . $e->getMessage());
            return false;
        }
    }
    
    // Helper method to get drive ID from folder ID (not always needed)
    private function getDriveId($folderId) {
        try {
            $service = $this->service;
            $file = $service->files->get($folderId, [
                'fields' => 'driveId',
                'supportsAllDrives' => true
            ]);
            return $file->getDriveId();
        } catch (Exception $e) {
            error_log("Could not get drive ID for folder $folderId: " . $e->getMessage());
            return null;
        }
    }
}
?>