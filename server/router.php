<?php

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
function get($route, $path_to_include){
  if( $_SERVER['REQUEST_METHOD'] == 'GET' ){ route($route, $path_to_include); }
}
function post($route, $path_to_include){
  if( $_SERVER['REQUEST_METHOD'] == 'POST' ){ route($route, $path_to_include); }
}

function put($route, $path_to_include){
  if( $_SERVER['REQUEST_METHOD'] == 'PUT' ){ route($route, $path_to_include); }
}

function patch($route, $path_to_include){
  if( $_SERVER['REQUEST_METHOD'] == 'PATCH' ){ route($route, $path_to_include); }
}

function delete($route, $path_to_include){
  if( $_SERVER['REQUEST_METHOD'] == 'DELETE' ){ route($route, $path_to_include); }
}
function any($route, $path_to_include){ route($route, $path_to_include); 
}

function route($route, $path_to_include){
  $ROOT = $_SERVER['DOCUMENT_ROOT'];

  $request_url = filter_var($_SERVER['REQUEST_URI'], FILTER_SANITIZE_URL);
  $request_url = rtrim($request_url, '/');
  $request_url = strtok($request_url, '?');
    // DEBUG: Fix the static file check
  // error_log("=== ROUTE CHECK: $route for URL: $request_url ===");
  if ($request_url === '') {
      $request_url = '/';
  }
  // Skip static files
  $static_ext = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'html', 'pdf', 'svg', 'woff', 'woff2', 'ttf', 'eot', 'map', 'json', 'txt'];
  // Then the static file check:
  if ($request_url !== '/') {
      $ext = pathinfo($request_url, PATHINFO_EXTENSION);
      if (in_array($ext, $static_ext) && file_exists($ROOT . $request_url)) {
          return false;
      }
  }
  // error_log("Static file check for: $request_url, ext: $ext");
  
  if (in_array($ext, $static_ext)) {
    // error_log("Skipping static file: $request_url");
    return false; // Let PHP serve it
  }
  
  // Also check if it's a direct file that exists
  if (file_exists($ROOT . $request_url) && $request_url !== '/') {
    // error_log("File exists, skipping route: $request_url");
    return false;
  }
  // error_log("Processed URL: $request_url");

  $route_parts = explode('/', $route);
  $request_url_parts = explode('/', $request_url);
    
  // error_log("Route parts: " . print_r($route_parts, true));
  // error_log("URL parts: " . print_r($request_url_parts, true));

  array_shift($route_parts);
  array_shift($request_url_parts);

  if( $route_parts[0] == '' && count($request_url_parts) == 0 ){
    include_once("$ROOT/$path_to_include");
    exit();
  }
  if( count($route_parts) != count($request_url_parts) ){
    // error_log("Count mismatch: " . count($route_parts) . " != " . count($request_url_parts));
    return; 
  }
  

  $parameters = [];
  for( $__i__ = 0; $__i__ < count($route_parts); $__i__++ ){
    $route_part = $route_parts[$__i__];
    if( preg_match("/^[$]/", $route_part) ){
      $route_part = ltrim($route_part, '$');
      array_push($parameters, $request_url_parts[$__i__]);
      $$route_part=$request_url_parts[$__i__];
    }
    else if( $route_parts[$__i__] != $request_url_parts[$__i__] ){
      return;
    }
  }
  // error_log("Route matched! Including: $ROOT/$path_to_include");
  include_once("$ROOT/$path_to_include");
  exit();

}
function out($text){echo htmlspecialchars($text);}
function set_csrf(){
  $csrf_token = bin2hex(random_bytes(25));
  $_SESSION['csrf'] = $csrf_token;
  echo '<input type="hidden" name="csrf" value="'.$csrf_token.'">';
}
function is_csrf_valid(){
  if( ! isset($_SESSION['csrf']) || ! isset($_POST['csrf'])){ return false; }
  if( $_SESSION['csrf'] != $_POST['csrf']){ return false; }
  return true;
}
