<?php
require_once('c:/Users/Cogito/Documents/rdeweb/server/db.php');

$con = new mysqli($host, $username, $pass, $dbName);
if ($con->connect_error) {
    die("Connection failed: " . $con->connect_error);
}

// Exactly the same query as in proposed.php
$query = "SELECT 
            rf.id,
            en.status as en_status,
            e.status as e_status
        FROM researchfile rf
        LEFT JOIN endorsement en ON rf.endorsementid = en.id
        LEFT JOIN event_list e ON rf.event_id = e.id
        WHERE en.status = 'accepted' OR e.status = 1";

$result = $con->query($query);
echo "Query: $query\n";
if ($result) {
    echo "Num rows: " . $result->num_rows . "\n";
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo "Sample row ID: " . $row['id'] . "\n";
    }
} else {
    echo "Error: " . $con->error . "\n";
}

$con->close();
