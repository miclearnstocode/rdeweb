<?php
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);


// Serve static files directly
$static_ext = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'html', 'pdf', 'svg', 'woff', 'woff2', 'ttf', 'eot', 'map', 'json', 'txt'];
$ext = pathinfo($path, PATHINFO_EXTENSION);

if (in_array($ext, $static_ext)) {
    if ($ext === 'js') {
        header('Content-Type: application/javascript');
    } elseif ($ext === 'css') {
        header('Content-Type: text/css');
    } elseif ($ext === 'json') {
        header('Content-Type: application/json');
    } elseif (in_array($ext, ['png', 'jpg', 'jpeg', 'gif', 'ico', 'svg'])) {
        header('Content-Type: image/' . ($ext === 'svg' ? 'svg+xml' : $ext));
    } else {
        // Use mime_content_type only as a last resort
        $mime = mime_content_type(__DIR__ . $path);
        if ($mime) {
            header('Content-Type: ' . $mime);
        }
    }

    readfile(__DIR__ . $path);
    exit();
}

// Check if file exists
if (file_exists(__DIR__ . $path) && $path !== '/') {
    return false;
}

require_once __DIR__ . '/server/router.php';
require_once __DIR__ . '/server/routes.php';

// If no route matched by now, serve 404
header("HTTP/1.0 404 Not Found");
echo "404 - Page not found";
exit();