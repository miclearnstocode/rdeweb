<?php
require_once('c:/Users/Cogito/Documents/rdeweb/server/db.php');

$con = new mysqli($host, $username, $pass, $dbName);
if ($con->connect_error) {
    die("Connection failed: " . $con->connect_error);
}

echo "--- Status counts in endorsement table ---\n";
$query = "SELECT status, COUNT(*) as c FROM endorsement GROUP BY status";
$result = $con->query($query);
while ($row = $result->fetch_assoc()) {
    echo "Status: '" . $row['status'] . "' | Count: " . $row['c'] . "\n";
}

$con->close();
