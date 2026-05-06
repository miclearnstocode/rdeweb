<?php
require_once('c:/Users/Cogito/Documents/rdeweb/server/db.php');

$con = new mysqli($host, $username, $pass, $dbName);
if ($con->connect_error) {
    die("Connection failed: " . $con->connect_error);
}

echo "--- Checking revised file URLs for 2026 papers ---\n";
$query = "SELECT id, title, revised_drive_view_url, revised_drive_download_url 
          FROM researchfile 
          WHERE id IN (536, 537, 538)";
$result = $con->query($query);
while ($row = $result->fetch_assoc()) {
    echo "ID: {$row['id']} | View: '{$row['revised_drive_view_url']}' | Download: '{$row['revised_drive_download_url']}'\n";
}

$con->close();
