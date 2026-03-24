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
    
    // Method to search for an existing folder without creating it
    public function findFolder($folderName, $parentId = null) {
        $service = $this->service;
        $parentId = $parentId ?: $this->rootFolderId;
        
        $escapedFolderName = str_replace("'", "\\'", $folderName);
        $query = "name='$escapedFolderName' and mimeType='application/vnd.google-apps.folder'";
        $query .= " and '$parentId' in parents and trashed=false";
        
        try {
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
            error_log("Folder search failed for $folderName: " . $e->getMessage());
        }
        return null;
    }

    // Method to find or create folder in Shared Drive
    public function findOrCreateFolder($folderName, $parentId = null) {
        $existingId = $this->findFolder($folderName, $parentId);
        if ($existingId) return $existingId;
        
        $parentId = $parentId ?: $this->rootFolderId;
        
        // Create new folder
        $fileMetadata = new Google_Service_Drive_DriveFile([
            'name' => $folderName,
            'mimeType' => 'application/vnd.google-apps.folder',
            'parents' => [$parentId]
        ]);
        
        $folder = $this->service->files->create($fileMetadata, [
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
            error_log("GDrive: Uploading $fileName to folder $folderId");
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
            
            $fileId = $file->getId();
            
            // Generate proper embed URL (the /preview URL for iframes)
            $embedUrl = "https://drive.google.com/file/d/{$fileId}/preview";
            
            return [
                'success' => true,
                'id' => $fileId,
                'name' => $file->getName(),
                'size' => $file->getSize(),
                'view_url' => $embedUrl,  // Use embed URL for iframe
                'direct_url' => $file->getWebViewLink(),  // Original Google Drive URL
                'download_url' => "https://drive.google.com/uc?id={$fileId}&export=download",
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
           //error_log("Event folder created: $eventFolderId for $eventName");
            
            // 2. Create or get center folder inside event folder
            $centerFolderId = $this->findOrCreateFolder($centerName, $eventFolderId);
            //error_log("Center folder created: $centerFolderId for $centerName");
            
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
            // First, check if the file already has public permission
            $permissions = $service->permissions->listPermissions($fileId, [
                'fields' => 'permissions(type,role)',
                'supportsAllDrives' => true
            ]);
            
            $alreadyPublic = false;
            foreach ($permissions->getPermissions() as $permission) {
                if ($permission->getType() === 'anyone' && $permission->getRole() === 'reader') {
                    $alreadyPublic = true;
                    error_log("File $fileId is already public");
                    break;
                }
            }
            
            if (!$alreadyPublic) {
                // Set permission to anyone can view
                $permission = new Google_Service_Drive_Permission([
                    'type' => 'anyone',
                    'role' => 'reader',
                    'allowFileDiscovery' => false]);
                
                $result = $service->permissions->create($fileId, $permission, [
                    'supportsAllDrives' => true,
                    'fields' => 'id']);
                
                error_log("File $fileId made public successfully, permission ID: " . $result->getId());
                return true;
            }
            
            return true; // Already public
            
        } catch (Exception $e) {
            error_log("Error making file public: " . $e->getMessage());
            // Log the full error for debugging
            //error_log("Error details: " . json_encode(['fileId' => $fileId,'error' => $e->getMessage(),'code' => $e->getCode(),'trace' => $e->getTraceAsString()]));
            return false;
        }
    }
    // Method to create complete folder structure
    public function createCompleteFolderStructure($eventName, $centerName, $categoryName, $entryFolderName) {
        try {
            //error_log("Starting folder structure creation: $eventName -> $centerName -> $categoryName -> $entryFolderName");
            
            // 1. Create or get event folder inside root
            $eventFolderId = $this->findOrCreateFolder($eventName, $this->rootFolderId);
            //error_log("Event folder created/retrieved: $eventFolderId for $eventName");
            
            // 2. Create or get center folder inside event folder
            $centerFolderId = $this->findOrCreateFolder($centerName, $eventFolderId);
            //error_log("Center folder created/retrieved: $centerFolderId for $centerName");
            
            // 3. Create or get category folder inside center folder
            $categoryFolderId = $this->findOrCreateFolder($categoryName, $centerFolderId);
            //error_log("Category folder created/retrieved: $categoryFolderId for $categoryName");
            
            // 4. Create entry folder inside category folder
            $entryFolderId = $this->findOrCreateFolder($entryFolderName, $categoryFolderId);
            //error_log("Entry folder created: $entryFolderId for $entryFolderName");
            
            return [
                'event_folder_id' => $eventFolderId,
                'center_folder_id' => $centerFolderId,
                'category_folder_id' => $categoryFolderId,
                'entry_folder_id' => $entryFolderId
            ];
            
        } catch (Exception $e) {
            //error_log("Failed to create complete folder structure: " . $e->getMessage());
            //error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception("Failed to create folder structure: " . $e->getMessage());
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
    public function trashFile($fileId) {
        try {
            $service = $this->service;
            
            // Check if file exists first
            try {
                $file = $service->files->get($fileId, [
                    'fields' => 'id, name, trashed',
                    'supportsAllDrives' => true
                ]);
                
                if ($file->getTrashed()) {
                    error_log("File $fileId is already in trash");
                    return true;
                }
                
            } catch (Exception $e) {
                if (strpos($e->getMessage(), 'File not found') !== false) {
                    error_log("File $fileId not found in Google Drive");
                    return true; // Consider it already gone
                }
                throw $e;
            }
            
            // Move to trash instead of permanent delete
            $file = new Google_Service_Drive_DriveFile();
            $file->setTrashed(true);
            
            $updatedFile = $service->files->update($fileId, $file, [
                'supportsAllDrives' => true,
                'fields' => 'id, trashed'
            ]);
            
            error_log("Successfully moved file to trash: $fileId");
            return true;
            
        } catch (Exception $e) {
            error_log("Google Drive trash error for file $fileId: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception("Failed to move file to trash in Google Drive: " . $e->getMessage());
        }
    }

    // Keep deleteFile for backward compatibility but use trashFile instead
    public function deleteFile($fileId) {
        return $this->trashFile($fileId);
    }
}
