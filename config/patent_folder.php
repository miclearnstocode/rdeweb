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

    // 2. Status Level (e.g., "Filed", "Registered", "Downgraded")
    $statusName = $status ?: "Unspecified Status";
    $statusLabel = ucwords($statusName);
    // User requested: "filed", "registered" and "downgraded"
    $statusFolderId = $drive->findOrCreateFolder($statusLabel, $ipMainFolderId);
    if (!$statusFolderId) { error_log("Failed to find/create Status Folder: $statusLabel"); return null; }

    // 3. IP Type Level (e.g., "Patents", "Utility Models")
    $ipTypeLabels = [
        'patent' => 'Patents',
        'utility_model' => 'Utility Models',
        'industrial_design' => 'Industrial Designs',
        'copyright' => 'Copyrights',
        'trademark' => 'Trademarks'
    ];
    $ipTypeName = $ipTypeLabels[$ipType] ?? ucwords(str_replace('_', ' ', $ipType));
    $typeFolderId = $drive->findOrCreateFolder($ipTypeName, $statusFolderId);
    if (!$typeFolderId) { error_log("Failed to find/create IP Type Folder: $ipTypeName"); return null; }

    // 4. Campus Level
    $campusName = $campus ?: "Unspecified Campus";
    $campusFolderId = $drive->findOrCreateFolder($campusName, $typeFolderId);
    if (!$campusFolderId) { error_log("Failed to find/create Campus Folder: $campusName"); return null; }

    // 5. Record Level (The final destination for all files)
    $finalRecordName = $productName ?: "Unnamed Record";
    $finalFolderId = $drive->findOrCreateFolder($finalRecordName, $campusFolderId);
    if (!$finalFolderId) { error_log("Failed to find/create Final Record Folder: $finalRecordName"); return null; }

    return $finalFolderId;
}
