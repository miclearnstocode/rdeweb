<?php
session_start();
$_SESSION['test'] = 'working';
echo json_encode(['session' => $_SESSION]);
?>