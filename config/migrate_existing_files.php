<?php
// migrate_existing_files.php
require_once 'drive_config.php';
include('../server/db.php');

$drive = new GoogleDriveService();
$rootFolderId = file_get_contents(__DIR__ . '/root_folder_id.txt');
$drive->setRootFolderId($rootFolderId);

$con = new mysqli($host, $username, $pass, $dbName);

// Migrate research files
$researchQuery = "SELECT id, file, event, category, senderid FROM researchfile 
                  WHERE drive_file_id IS NULL AND file IS NOT NULL";
$result = $con->query($researchQuery);

while ($row = $result->fetch_assoc()) {
    $localPath = $row['file'];
    
    if (file_exists($localPath)) {
        $fileName = basename($localPath);
        $eventName = $row['event'];
        $centerName = $row['category'];
        
        try {
            // Create folder structure
            $folders = $drive->createResearchFolderStructure($eventName, $centerName);
            
            // Upload to Drive
            $uploadResult = $drive->uploadFile($localPath, $fileName, $folders['center_folder_id']);
            
            // Make public
            $drive->makeFilePublic($uploadResult['id']);
            
            // Update database
            $updateQuery = "UPDATE researchfile SET 
                drive_file_id = ?,
                drive_view_url = ?,
                drive_download_url = ?,
                drive_folder_id = ?,
                drive_event_folder_id = ?,
                drive_center_folder_id = ?
                WHERE id = ?";
            
            $stmt = $con->prepare($updateQuery);
            $stmt->bind_param('sssssss',
                $uploadResult['id'],
                $uploadResult['view_url'],
                $uploadResult['download_url'],
                $folders['center_folder_id'],
                $folders['event_folder_id'],
                $folders['center_folder_id'],
                $row['id']
            );
            $stmt->execute();
            
            echo "Migrated: {$row['id']} - {$fileName}\n";
            
        } catch (Exception $e) {
            echo "Error migrating {$row['id']}: " . $e->getMessage() . "\n";
        }
    }
}
?>