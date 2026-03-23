<?php
// event_folder_creator.php
require_once 'drive_config.php';

/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

function createEventFolders($eventName)
{
    $drive = new GoogleDriveService();
    $rootFolderId = file_get_contents(__DIR__ . '/root_folder_id.txt');
    $drive->setRootFolderId($rootFolderId);

    // Centers to create under each event
    $centers = [
        'CSRDC', 'LRDC', 'FRDC', 'FITRDC',
        'SSRDC', 'MATEC', 'COCO RDC', 'Extension Office'
    ];

    // Create event folder
    $eventFolderId = $drive->findOrCreateFolder($eventName, $rootFolderId);

    // Create all center folders under this event
    $createdFolders = [];
    foreach ($centers as $center) {
        $centerFolderId = $drive->findOrCreateFolder($center, $eventFolderId);
        $createdFolders[$center] = $centerFolderId;
    }

    // Save to database or cache
    saveEventFolders($eventName, $eventFolderId, $createdFolders);

    return [
        'event_folder_id' => $eventFolderId,
        'center_folders' => $createdFolders
    ];
}

function saveEventFolders($eventName, $eventFolderId, $centerFolders)
{

    global $host, $username, $pass, $dbName;
    // Save to database table
    $con = new mysqli($host, $username, $pass, $dbName);

    $query = "INSERT INTO event_folders (event_name, drive_event_id, center_folders) 
              VALUES (?, ?, ?) 
              ON DUPLICATE KEY UPDATE drive_event_id = ?, center_folders = ?";

    $centerJson = json_encode($centerFolders);
    $stmt = $con->prepare($query);
    $stmt->bind_param('sssss', $eventName, $eventFolderId, $centerJson,
        $eventFolderId, $centerJson);
    $stmt->execute();
}
