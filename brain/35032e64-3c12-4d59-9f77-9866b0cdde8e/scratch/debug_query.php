<?php
require_once('c:/Users/Cogito/Documents/rdeweb/server/db.php');

$con = new mysqli($host, $username, $pass, $dbName);
if ($con->connect_error) {
    die("Connection failed: " . $con->connect_error);
}

echo "--- Testing the exact query from proposed.php ---\n";
$query = "SELECT 
            rf.id,
            en.status as en_status,
            e.status as e_status,
            e.date as e_date,
            en.date as en_date
        FROM researchfile rf
        INNER JOIN endorsement en ON rf.endorsementid = en.id
        LEFT JOIN event_list e ON rf.event_id = e.id
        WHERE en.status = 'accepted' OR e.status = 1";

$result = $con->query($query);
if ($result) {
    echo "Total rows found: " . $result->num_rows . "\n";
    while ($row = $result->fetch_assoc()) {
        echo "ID: {$row['id']} | Endorsement Status: '{$row['en_status']}' | Event Status: '{$row['e_status']}' | Event Date: {$row['e_date']}\n";
    }
} else {
    echo "Query failed: " . $con->error . "\n";
}

$con->close();
