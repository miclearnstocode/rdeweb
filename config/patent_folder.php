<?php
// config/patent_folder.php
require_once __DIR__ . '/driver_config.php';

function getIPFolderId($ipType, $campus, $productName, $status)
{
    $drive = new GoogleDriveService();

    // Use service default Shared Drive ID
    $rootId = $drive->getRootFolderId();

    // 1. Main IP Collection Folder
    $ipMainFolderId = $drive->findOrCreateFolder("Intellectual Property Records", $rootId);
    if (!$ipMainFolderId) { error_log("Failed to find/create Main IP Folder"); return null; }

    // 2. IP Type Level (e.g., "Patents", "Utility Models")
    $ipTypeLabels = [
        'patent' => 'Patents',
        'utility_model' => 'Utility Models',
        'industrial_design' => 'Industrial Designs',
        'copyright' => 'Copyrights',
        'trademark' => 'Trademarks'
    ];
    $ipTypeName = $ipTypeLabels[$ipType] ?? ucwords(str_replace('_', ' ', $ipType));
    $ipTypeFolderId = $drive->findOrCreateFolder($ipTypeName, $ipMainFolderId);
    if (!$ipTypeFolderId) { error_log("Failed to find/create IP Type Folder: $ipTypeName"); return null; }

    // 3. Status Level (e.g., "Filed", "Registered", "Downgraded")
    $statusName = $status ?: "Unspecified Status";
    $statusLabel = cleanFolderNameForDrive(ucwords($statusName));
    $statusFolderId = $drive->findOrCreateFolder($statusLabel, $ipTypeFolderId);
    if (!$statusFolderId) { error_log("Failed to find/create Status Folder: $statusLabel"); return null; }

    // 4. Campus Level
    $campusName = cleanFolderNameForDrive($campus ?: "Unspecified Campus");
    $campusFolderId = $drive->findOrCreateFolder($campusName, $statusFolderId);
    if (!$campusFolderId) { error_log("Failed to find/create Campus Folder: $campusName"); return null; }

    // 5. Record Level (The final destination for all files)
    $finalRecordName = cleanFolderNameForDrive($productName ?: "Sample Only");
    $finalFolderId = $drive->findOrCreateFolder($finalRecordName, $campusFolderId);
    if (!$finalFolderId) { error_log("Failed to find/create Final Record Folder: $finalRecordName"); return null; }

    return $finalFolderId;
}

function cleanFolderNameForDrive($name) {
    $clean = preg_replace('/[^\w\s\-_.,()&]/', '', $name);
    $clean = preg_replace('/\s+/', ' ', $clean);
    $clean = trim($clean);
    $clean = rtrim($clean, '.,');
    if (strlen($clean) > 200) {
        $clean = substr($clean, 0, 197) . '...';
    }
    return $clean;
}

function findIPFolder($drive, $ipType, $campus, $productName, $status)
{
    $rootId = $drive->getRootFolderId();

    // 1. Intellectual Property Records
    $ipMainFolderId = $drive->findFolder("Intellectual Property Records", $rootId);
    if (!$ipMainFolderId) return null;

    // 2. IP Type
    $ipTypeLabels = [
        'patent' => 'Patents',
        'utility_model' => 'Utility Models',
        'industrial_design' => 'Industrial Designs',
        'copyright' => 'Copyrights',
        'trademark' => 'Trademarks'
    ];
    $ipTypeName = $ipTypeLabels[$ipType] ?? ucwords(str_replace('_', ' ', $ipType));
    $ipTypeFolderId = $drive->findFolder($ipTypeName, $ipMainFolderId);
    if (!$ipTypeFolderId) return null;

    // 3. Status
    $statusName = $status ?: "Unspecified Status";
    $statusLabel = cleanFolderNameForDrive(ucwords($statusName));
    $statusFolderId = $drive->findFolder($statusLabel, $ipTypeFolderId);
    if (!$statusFolderId) return null;

    // 4. Campus
    $campusName = cleanFolderNameForDrive($campus ?: "Unspecified Campus");
    $campusFolderId = $drive->findFolder($campusName, $statusFolderId);
    if (!$campusFolderId) return null;

    // 5. Record
    $finalRecordName = cleanFolderNameForDrive($productName ?: "Sample Only");
    return $drive->findFolder($finalRecordName, $campusFolderId);
}

