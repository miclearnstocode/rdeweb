<?php
require_once('c:/Users/Cogito/Documents/rdeweb/server/db.php');

$con = new mysqli($host, $username, $pass, $dbName);
if ($con->connect_error) {
    die("Connection failed: " . $con->connect_error);
}

echo "--- Columns in researchfile table ---\n";
$query = "SHOW COLUMNS FROM researchfile";
$result = $con->query($query);
while ($row = $result->fetch_assoc()) {
    echo "Field: " . $row['Field'] . " | Type: " . $row['Type'] . "\n";
}

$con->close();
