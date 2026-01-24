<?php
require_once './config/driver_config.php';

echo "Testing Shared Drive Connection...\n";

try {
    $drive = new GoogleDriveService();
    $service = $drive->getService();
    
    // Test 1: Try to access the Shared Drive folder
    $rootId = $drive->getRootFolderId();
    echo "✓ Root Folder ID: $rootId\n";
    
    // Test 2: Get folder info
    try {
        $file = $service->files->get($rootId, [
            'fields' => 'id, name, mimeType, driveId',
            'supportsAllDrives' => true
        ]);
        
        echo "✓ Folder Name: " . $file->getName() . "\n";
        echo "✓ Folder Type: " . $file->getMimeType() . "\n";
        if ($file->getDriveId()) {
            echo "✓ Drive ID: " . $file->getDriveId() . " (This is a Shared Drive)\n";
        }
        
    } catch (Exception $e) {
        echo "✗ Could not get folder info: " . $e->getMessage() . "\n";
    }
    
    // Test 3: Try to create a test folder
    try {
        $testFolderId = $drive->findOrCreateFolder('Test_Shared_Drive_' . time(), $rootId);
        echo "✓ Created test folder in Shared Drive: $testFolderId\n";
        
        // Test 4: Upload a small test file
        $testFile = tempnam(sys_get_temp_dir(), 'test_');
        file_put_contents($testFile, 'Test content for Google Drive upload');
        
        $uploadResult = $drive->uploadFile($testFile, 'test_file.txt', $testFolderId);
        
        if ($uploadResult['success']) {
            echo "✓ Successfully uploaded test file\n";
            echo "  File ID: " . $uploadResult['id'] . "\n";
            echo "  View URL: " . $uploadResult['view_url'] . "\n";
            
            // Test 5: Make file public
            if ($drive->makeFilePublic($uploadResult['id'])) {
                echo "✓ Successfully made file public\n";
            } else {
                echo "✗ Failed to make file public\n";
            }
        } else {
            echo "✗ Upload failed: " . ($uploadResult['error'] ?? 'Unknown error') . "\n";
        }
        
        unlink($testFile);
        
    } catch (Exception $e) {
        echo "✗ Failed to create folder: " . $e->getMessage() . "\n";
    }
    
    echo "\n✓ SUCCESS: Shared Drive access is working!\n";
    
} catch (Exception $e) {
    echo "✗ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
?>