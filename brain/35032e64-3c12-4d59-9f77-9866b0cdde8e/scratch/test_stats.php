<?php
require_once('c:/Users/Cogito/Documents/rdeweb/server/db.php');

$con = new mysqli($host, $username, $pass, $dbName);
if ($con->connect_error) {
    die("Connection failed: " . $con->connect_error);
}

echo "--- Testing getStatistics query ---\n";
$query = "SELECT 
            rf.id,
            rf.event_id,
            rf.event as event_name,
            en.date as endorsement_date,
            e.date as event_date
        FROM researchfile rf
        LEFT JOIN endorsement en ON rf.endorsementid = en.id
        LEFT JOIN event_list e ON rf.event_id = e.id
        WHERE en.status = 'accepted' OR e.status = 1";

$result = $con->query($query);
if ($result) {
    echo "Rows found: " . $result->num_rows . "\n";
} else {
    echo "Query failed: " . $con->error . "\n";
}

$con->close();
