<?php
require_once('c:/Users/Cogito/Documents/rdeweb/server/db.php');

$con = new mysqli($host, $username, $pass, $dbName);
if ($con->connect_error) {
    die("Connection failed: " . $con->connect_error);
}

echo "--- Checking endorsement status for 2026 research papers ---\n";
$query = "SELECT rf.id, rf.title, rf.endorsementid, e.status, e.date 
          FROM researchfile rf 
          LEFT JOIN endorsement e ON rf.endorsementid = e.id 
          WHERE rf.id IN (536, 537, 538)";
$result = $con->query($query);
while ($row = $result->fetch_assoc()) {
    echo "RF ID: {$row['id']} | Endorsement ID: {$row['endorsementid']} | Status: '{$row['status']}' | Date: {$row['date']}\n";
}

echo "\n--- Checking all accepted endorsements ---\n";
$query = "SELECT COUNT(*) as c FROM endorsement WHERE status = 'accepted'";
$res = $con->query($query);
$row = $res->fetch_assoc();
echo "Total accepted endorsements: " . $row['c'] . "\n";

echo "\n--- Sample accepted endorsements ---\n";
$query = "SELECT id, status, date FROM endorsement WHERE status = 'accepted' LIMIT 5";
$result = $con->query($query);
while ($row = $result->fetch_assoc()) {
    echo "ID: {$row['id']} | Status: {$row['status']} | Date: {$row['date']}\n";
}

$con->close();
