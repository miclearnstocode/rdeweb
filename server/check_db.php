<?php
include('db.php');
$con = new mysqli($host, $username, $pass, $dbName);
if ($con->connect_error) die("Connection failed: " . $con->connect_error);
$res = $con->query("DESC researchfile");
$fields = [];
while($row = $res->fetch_assoc()) $fields[] = $row['Field'];
echo implode(', ', $fields);
?>
