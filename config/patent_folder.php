<?php
// config/patent_folder.php
require_once 'drive_config.php';

/**
 * Creates and returns the folder ID for a specific Intellectual Property record on Google Drive.
 * Organizes files into a structured hierarchy: 
 * Intellectual Property Records > [IP Type]s > [Campus] > [Product Name]
 * 
 * @param string $ipType The type of IP (e.g., 'patent', 'utility_model')
 * @param string $campus The campus name
 * @param string $productName The name of the technology or product
 * @return string The ID of the record's specific folder on Google Drive
 */
function getIPFolderId($ipType, $campus, $productName)
{
    $drive = new GoogleDriveService();

    // Use root ID from file if available, otherwise fallback to service default
    $rootId = @file_get_contents(__DIR__ . '/root_folder_id.txt');
    if (!$rootId)
        $rootId = $drive->getRootFolderId();

    // 1. Main IP Collection Folder
    $ipMainFolderId = $drive->findOrCreateFolder("Intellectual Property Records", $rootId);

    // 2. IP Type Level (e.g., "Patents", "Utility Models")
    $ipTypeName = ucwords(str_replace('_', ' ', $ipType));
    // Pluralize for folder names
    if (!str_ends_with(strtolower($ipTypeName), 's')) {
        $ipTypeName .= 's';
    }
    $typeFolderId = $drive->findOrCreateFolder($ipTypeName, $ipMainFolderId);

    // 3. Campus Level
    $campusName = $campus ?: "Unspecified Campus";
    $campusFolderId = $drive->findOrCreateFolder($campusName, $typeFolderId);

    // 4. Record Level (The final destination for all files)
    $finalRecordName = $productName ?: "Unnamed Record";
    return $drive->findOrCreateFolder($finalRecordName, $campusFolderId);
}
