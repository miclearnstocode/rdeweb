<?php
// Absolute path to db.php
require_once('c:/Users/Cogito/Documents/rdeweb/server/db.php');

$con = new mysqli($host, $username, $pass, $dbName);
if ($con->connect_error) {
    die("Connection failed: " . $con->connect_error);
}

echo "--- Research counts by year in event_list ---\n";
$query = "SELECT YEAR(date) as yr, COUNT(*) as count FROM event_list GROUP BY yr ORDER BY yr DESC";
$result = $con->query($query);
while ($row = $result->fetch_assoc()) {
    echo "Year: " . ($row['yr'] ?? 'NULL') . " - Count: " . $row['count'] . "\n";
}

echo "\n--- Research papers and their event/endorsement years ---\n";
$query = "SELECT 
            rf.id, 
            rf.title, 
            rf.event_id, 
            el.name as event_name, 
            el.date as event_date,
            e.date as endorsement_date,
            e.status as endorsement_status
          FROM researchfile rf
          LEFT JOIN endorsement e ON rf.endorsementid = e.id
          LEFT JOIN event_list el ON rf.event_id = el.id
          WHERE el.date >= '2025-01-01' OR e.date >= '2025-01-01'
          LIMIT 20";
$result = $con->query($query);
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "ID: {$row['id']} | Event ID: {$row['event_id']} | Event: {$row['event_name']} | Event Date: {$row['event_date']} | Endorsement Date: {$row['endorsement_date']} | Status: {$row['endorsement_status']}\n";
    }
} else {
    echo "No papers found for 2025+.\n";
}

echo "\n--- Checking 2026 events specifically ---\n";
$query = "SELECT * FROM event_list WHERE date >= '2026-01-01'";
$result = $con->query($query);
while ($row = $result->fetch_assoc()) {
    echo "Event ID: {$row['id']} | Name: {$row['name']} | Date: {$row['date']}\n";
    
    // Check if any research is linked to this event
    $countQuery = "SELECT COUNT(*) as c FROM researchfile WHERE event_id = " . $row['id'];
    $cRes = $con->query($countQuery);
    $cRow = $cRes->fetch_assoc();
    echo "  -> Linked papers in researchfile: " . $cRow['c'] . "\n";
}

$con->close();
