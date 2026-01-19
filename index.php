<?php
// D:\documents\rdeweb\index.php


$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// DEBUG
error_log("Main entry: $path");

// Serve static files directly - DO NOT PASS TO ROUTER
$static_ext = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'html', 'pdf', 'svg', 'woff', 'woff2', 'ttf', 'eot', 'map', 'json', 'txt'];
$ext = pathinfo($path, PATHINFO_EXTENSION);

if (in_array($ext, $static_ext)) {
    error_log("Serving static file: $path");
    // Let PHP serve it
    return false;
}

// Check if file exists
if (file_exists(__DIR__ . $path) && $path !== '/') {
    error_log("File exists, serving: $path");
    return false;
}

// For API and SPA routes, use the router
require_once __DIR__ . '/server/router.php';
require_once __DIR__ . '/server/routes.php';

// If no route matched by now, serve 404
header("HTTP/1.0 404 Not Found");
echo "404 - Page not found";
exit();