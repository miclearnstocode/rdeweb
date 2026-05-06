<?php
include('db.php');
$con = new mysqli($host, $username, $pass, $dbName);
if ($con->connect_error) die("Connection failed: " . $con->connect_error);

$queries = [
    "ALTER TABLE researchfile ADD COLUMN revised_title VARCHAR(500) DEFAULT NULL AFTER revision_count",
    "ALTER TABLE researchfile ADD COLUMN title_changed TINYINT(1) DEFAULT 0 AFTER revised_title"
];

foreach ($queries as $q) {
    if ($con->query($q)) {
        echo "Success: $q\n";
    } else {
        echo "Error: " . $con->error . " for query: $q\n";
    }
}
?>
