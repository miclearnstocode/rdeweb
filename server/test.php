<?php
header('Content-Type: application/json');
echo json_encode([
    'status' => 'API is working',
    'timestamp' => time(),
    'request' => $_SERVER['REQUEST_METHOD']
]);
exit();