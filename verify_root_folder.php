<?php
// verify_root_folder.php
require_once './config/drive_config.php';

header('Content-Type: text/html; charset=utf-8');
echo "<h2>Google Drive Root Folder Verification</h2>";

try {
    $drive = new GoogleDriveService();
    $service = $drive->getService();
    
    // Test 1: Try to access the folder
    $folderId = '1CzaefvD9Xw9uHwlAfYWM7evCSIBUPjt2';
    
    echo "<h3>Test 1: Accessing Folder ID: $folderId</h3>";
    
    try {
        $file = $service->files->get($folderId, ['fields' => 'id,name,mimeType,trashed']);
        
        echo "<p style='color: green;'>✓ Success! Folder found.</p>";
        echo "<ul>";
        echo "<li><strong>ID:</strong> " . $file->getId() . "</li>";
        echo "<li><strong>Name:</strong> " . $file->getName() . "</li>";
        echo "<li><strong>Type:</strong> " . $file->getMimeType() . "</li>";
        echo "<li><strong>Trashed:</strong> " . ($file->getTrashed() ? 'Yes' : 'No') . "</li>";
        echo "</ul>";
        
        // Check if it's actually a folder
        if ($file->getMimeType() !== 'application/vnd.google-apps.folder') {
            echo "<p style='color: orange;'>⚠ Warning: This is not a folder! It's a " . $file->getMimeType() . "</p>";
        }
        
    } catch (Google_Service_Exception $e) {
        echo "<p style='color: red;'>✗ Error accessing folder: " . $e->getMessage() . "</p>";
        
        // Check error details
        $errors = $e->getErrors();
        if (!empty($errors)) {
            echo "<ul>";
            foreach ($errors as $error) {
                echo "<li><strong>" . $error['domain'] . ":</strong> " . $error['message'] . "</li>";
            }
            echo "</ul>";
        }
    }
    
    // Test 2: List contents of the folder
    echo "<h3>Test 2: Listing Folder Contents</h3>";
    
    $query = "'$folderId' in parents and trashed=false";
    $result = $service->files->listFiles([
        'q' => $query,
        'fields' => 'files(id, name, mimeType)',
        'pageSize' => 10
    ]);
    
    $files = $result->getFiles();
    
    if (count($files) > 0) {
        echo "<p>Found " . count($files) . " items in folder:</p>";
        echo "<ul>";
        foreach ($files as $file) {
            $type = ($file->getMimeType() === 'application/vnd.google-apps.folder') ? '📁 Folder' : '📄 File';
            echo "<li>$type: <strong>" . $file->getName() . "</strong> (ID: " . $file->getId() . ")</li>";
        }
        echo "</ul>";
    } else {
        echo "<p>Folder is empty (no subfolders or files found)</p>";
    }
    
    // Test 3: Try to create a test folder
    echo "<h3>Test 3: Creating Test Folder</h3>";
    
    $testFolderName = 'TEST_FOLDER_' . date('Ymd_His');
    $fileMetadata = new Google_Service_Drive_DriveFile([
        'name' => $testFolderName,
        'mimeType' => 'application/vnd.google-apps.folder',
        'parents' => [$folderId]
    ]);
    
    try {
        $folder = $service->files->create($fileMetadata, ['fields' => 'id,name']);
        echo "<p style='color: green;'>✓ Success! Created test folder: " . $folder->getName() . " (ID: " . $folder->getId() . ")</p>";
        
        // Clean up: Delete test folder
        $service->files->delete($folder->getId());
        echo "<p>✓ Test folder deleted successfully</p>";
        
    } catch (Exception $e) {
        echo "<p style='color: red;'>✗ Failed to create test folder: " . $e->getMessage() . "</p>";
    }
    
    // Test 4: Check permissions
    echo "<h3>Test 4: Checking Service Account Permissions</h3>";
    
    try {
        $permissions = $service->permissions->listPermissions($folderId, ['fields' => 'permissions(emailAddress, role)']);
        $perms = $permissions->getPermissions();
        
        echo "<p>Found " . count($perms) . " permissions:</p>";
        echo "<ul>";
        foreach ($perms as $perm) {
            $email = $perm->getEmailAddress() ?: '(No email)';
            echo "<li><strong>" . $email . "</strong>: " . $perm->getRole() . "</li>";
        }
        echo "</ul>";
        
        // Check if service account has write access
        $hasWriteAccess = false;
        foreach ($perms as $perm) {
            if ($perm->getRole() === 'owner' || $perm->getRole() === 'writer' || $perm->getRole() === 'fileOrganizer') {
                $hasWriteAccess = true;
                break;
            }
        }
        
        if ($hasWriteAccess) {
            echo "<p style='color: green;'>✓ Service account has write access</p>";
        } else {
            echo "<p style='color: orange;'>⚠ Service account may not have write access</p>";
        }
        
    } catch (Exception $e) {
        echo "<p style='color: orange;'>⚠ Could not check permissions: " . $e->getMessage() . "</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'><strong>Fatal Error:</strong> " . $e->getMessage() . "</p>";
    echo "<p>Check:</p>";
    echo "<ol>";
    echo "<li>Service account JSON file exists</li>";
    echo "<li>Service account has Drive API access</li>";
    echo "<li>Service account has access to the folder</li>";
    echo "</ol>";
}

// Test 5: Simple folder creation test
echo "<h3>Test 5: Testing Folder Creation Function</h3>";

$drive->setRootFolderId($folderId);
$testEvent = 'Test_Event_' . date('Ymd');
$testCenter = 'CSRDC';

try {
    $folders = $drive->createResearchFolderStructure($testEvent, $testCenter);
    
    echo "<p style='color: green;'>✓ Folder structure created successfully!</p>";
    echo "<ul>";
    echo "<li><strong>Event Folder ID:</strong> " . $folders['event_folder_id'] . "</li>";
    echo "<li><strong>Center Folder ID:</strong> " . $folders['center_folder_id'] . "</li>";
    echo "</ul>";
    
    // Clean up test folders
    echo "<p>Cleaning up test folders...</p>";
    try {
        $service->files->delete($folders['event_folder_id']);
        echo "<p>✓ Test folders cleaned up</p>";
    } catch (Exception $e) {
        echo "<p style='color: orange;'>⚠ Could not delete test folders: " . $e->getMessage() . "</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Failed to create folder structure: " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<h3>Summary:</h3>";
echo "<p>If all tests pass, your root folder ID is correct and ready to use!</p>";
echo "<p><strong>Your Root Folder ID:</strong> <code>$folderId</code></p>";
?>