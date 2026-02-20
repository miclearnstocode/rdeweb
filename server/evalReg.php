<?php

// Set header FIRST before any output
header('Content-Type: application/json; charset=utf-8');

// Start output buffering to catch any notices/warnings
ob_start();

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include('db.php');

/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

// Helper function to log memory usage
function logMemoryUsage($functionName) {
    $memoryUsage = memory_get_usage(true);
    $peakMemory = memory_get_peak_usage(true);
    $memoryInMB = round($memoryUsage / 1024 / 1024, 2);
    $peakInMB = round($peakMemory / 1024 / 1024, 2);
    error_log("[Memory Debug] $functionName - Current: {$memoryInMB}MB, Peak: {$peakInMB}MB");
}

// Helper function to get script start time
$scriptStartTime = microtime(true);

function logExecutionTime($functionName) {
    global $scriptStartTime;
    $currentTime = microtime(true);
    $executionTime = round(($currentTime - $scriptStartTime) * 1000, 2); // in milliseconds
    error_log("[Time Debug] $functionName - Execution time so far: {$executionTime}ms");
}

logMemoryUsage('Script Start');
logExecutionTime('Script Start');

if (isset($_POST['evaluatorRegister'])) {
    logMemoryUsage('evaluatorRegister - Start');
    logExecutionTime('evaluatorRegister');
    
    $responce = new stdClass();
    $responce->status = false;
    $responce->message = 'Server connection failed..!';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        logMemoryUsage('evaluatorRegister - After DB Connection');

        $responce = new stdClass();
        $user = $_POST['username'];
        $pass = password_hash($_POST['password'], PASSWORD_DEFAULT);
        $fullname = $_POST['fullname'];
        $category = $_POST['category'];
        $center = isset($_POST['center']) ? $_POST['center'] : null;
        $eventType = $_POST['eventTYpe'];

        $id = round(microtime(true) * 1000) . '';

        // Updated query to include center_id
        if ($center) {
            $newQuery = "INSERT INTO `evaluator` 
            (evaluator.fullname, evaluator.username, evaluator.password, evaluator.category, evaluator.eventid, evaluator.center_id) 
            VALUES ('$fullname','$user','$pass','$category','$eventType','$center')";
        } else {
            $newQuery = "INSERT INTO `evaluator` 
            (evaluator.fullname, evaluator.username, evaluator.password, evaluator.category, evaluator.eventid) 
            VALUES ('$fullname','$user','$pass','$category','$eventType')";
        }

        logMemoryUsage('evaluatorRegister - Before Query Execution');

        if ($con->query($newQuery)) {
            $responce->status = true;
            $responce->message = 'Save successfully..!';
        } else {
            $responce->message = $con->error;
        }

        logMemoryUsage('evaluatorRegister - After Query Execution');
        $con->close();
    }

    logMemoryUsage('evaluatorRegister - End');
    ob_clean();
    echo json_encode($responce);
    ob_end_flush();
    exit();
}

if (isset($_POST['auth'])) {
    logMemoryUsage('auth - Start');
    logExecutionTime('auth');

    $response = new stdClass();
    $response->status = false;
    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        logMemoryUsage('auth - After DB Connection');

        $username = trim($_POST['username']);
        $password = trim($_POST['password']); 

        $newQuery = "SELECT
            evaluator.id,
            evaluator.fullname,
            evaluator.password,
            evaluator.center_id,
            center.name,
            evaluator.eventid,
            event_list.name
            FROM
            evaluator
            LEFT JOIN
            center
            ON center.id = evaluator.center_id
            LEFT JOIN
            event_list
            ON event_list.id = evaluator.eventid
            WHERE evaluator.username = ?";

        logMemoryUsage('auth - Before Prepare Statement');

        if ($statement = $con->prepare($newQuery)) {
            logMemoryUsage('auth - After Prepare Statement');

            $statement->bind_param("s", $username);
            $statement->execute();
            $statement->store_result();

            logMemoryUsage('auth - After Execute');

            if ($statement->num_rows > 0) {
                $statement->bind_result($id, $acnem, $pass, $centerId, $centerName, $evId, $evName);
                $statement->fetch();

                if (password_verify($password, $pass)) {
                    $response->message = '/evaluator';
                    
                    // Fix: Removed duplicate parameters in serialize
                    $_SESSION['isLog'] = serialize(new Auth(true, $_POST['userType'], $username, $centerName, $id, $acnem,'',$acnem,''));
                    
                    $_SESSION['eventTYpe'] = $evName;
                    $_SESSION['eventId'] = $evId;
                    $_SESSION['login'] = true;
                    $_SESSION['userId'] = $id;
                    $_SESSION['userName'] = $username;
                    $_SESSION['userType'] = $_POST['userType'];
                    $_SESSION['userFulname'] = $acnem;
                    $_SESSION['userEsign'] = '';
                    $_SESSION['userOffice'] = 'CENTRAL OFFICE';
                    $_SESSION['center'] = $centerName;
                    $_SESSION['centerId'] = $centerId;
                    $_SESSION['userEmail'] = '';
                    $_SESSION['userType'] = 'EVALUATOR';

                    $response->status = true;
                    logMemoryUsage('auth - Login Successful');
                } else {
                    $response->message = 'Password is incorrect';
                }
            } else {
                $response->message = 'ID/Username not found..!';
            }

            $statement->close();
        } else {
            $response->message = 'Something went wrong..!';
            logMemoryUsage('auth - Prepare Statement Failed');
        }

        $con->close();
    }

    logMemoryUsage('auth - End');
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}

if (isset($_POST['evaluatorsList'])) {
    logMemoryUsage('evaluatorsList - Start');
    logExecutionTime('evaluatorsList');

    $res = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        logMemoryUsage('evaluatorsList - After DB Connection');

        $query = "SELECT * FROM `evaluator`";
        $result = $con->query($query);
        
        logMemoryUsage('evaluatorsList - Before Fetch');

        if ($result) {
            while ($val = $result->fetch_assoc()) {
                $res[] = $val;
            }
            $result->free();
        }

        logMemoryUsage('evaluatorsList - After Fetch');
        $con->close();
    }

    logMemoryUsage('evaluatorsList - End');
    ob_clean();
    echo json_encode($res);
    ob_end_flush();
    exit();
}

if (isset($_POST['deleteEval'])) {
    logMemoryUsage('deleteEval - Start');
    logExecutionTime('deleteEval');

    $res = new stdClass();
    $res->status = false;
    $res->message = '';
    $userId = $_POST['id'];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        logMemoryUsage('deleteEval - After DB Connection');

        $query = "DELETE FROM `evaluator` WHERE `id` = '$userId'";
        
        if ($con->query($query)) {
            $res->status = true;
            $res->message = "Deleted...!";
            logMemoryUsage('deleteEval - Delete Successful');
        } else {
            $res->message = $con->error;
            logMemoryUsage('deleteEval - Delete Failed');
        }

        $con->close();
    } else {
        $res->message = 'Database connection failed';
    }

    logMemoryUsage('deleteEval - End');
    ob_clean();
    echo json_encode($res);
    ob_end_flush();
    exit();
}

// Endpoint to fetch centers
if (isset($_POST['getCenters'])) {
    logMemoryUsage('getCenters - Start');
    logExecutionTime('getCenters');

    $res = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        logMemoryUsage('getCenters - After DB Connection');

        $query = "SELECT id, code, name FROM center ORDER BY name";
        $result = $con->query($query);
        
        logMemoryUsage('getCenters - Before Fetch');

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $res[] = $row;
            }
            $result->free();
        }

        logMemoryUsage('getCenters - After Fetch');
        $con->close();
    }

    logMemoryUsage('getCenters - End');
    ob_clean();
    echo json_encode($res);
    ob_end_flush();
    exit();
}

// Endpoint to fetch categories
if (isset($_POST['getCategoriesByCenter'])) {
    logMemoryUsage('getCategoriesByCenter - Start');
    logExecutionTime('getCategoriesByCenter');

    $res = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        logMemoryUsage('getCategoriesByCenter - After DB Connection');

        $query = "SELECT id, name FROM category ORDER BY name";
        $result = $con->query($query);
        
        logMemoryUsage('getCategoriesByCenter - Before Fetch');

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $res[] = $row;
            }
            $result->free();
        }

        logMemoryUsage('getCategoriesByCenter - After Fetch');
        $con->close();
    }

    logMemoryUsage('getCategoriesByCenter - End');
    ob_clean();
    echo json_encode($res);
    ob_end_flush();
    exit();
}

if (isset($_POST['evalLeb'])) {
    logMemoryUsage('evalLeb - Start');
    logExecutionTime('evalLeb');
    
    $res = new stdClass();
    
    // Get event info
    $res->event = $_SESSION['eventTYpe'] ?? '';
    $res->eventId = $_SESSION['eventId'] ?? '';
    
    // Get evaluator's center info
    $centerId = $_SESSION['centerId'] ?? '';
    
    // Fetch center details from database to get name and code
    if (!empty($centerId) && $con = new mysqli($host, $username, $pass, $dbName)) {
        logMemoryUsage('evalLeb - After DB Connection');
        
        $query = "SELECT name, code FROM center WHERE id = ?";
        $stmt = $con->prepare($query);
        $stmt->bind_param("s", $centerId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        logMemoryUsage('evalLeb - Before Fetch Center Details');
        
        if ($row = $result->fetch_assoc()) {
            // Format: "Center Name (CODE)"
            $centerName = $row['name'] . " (" . $row['code'] . ")";
            
            // Store both formats for different uses
            $res->center = $centerName; // Full display name: "Center Name (CODE)"
            $res->centerId = $centerId; // Center ID for database queries
            $res->centerName = $row['name']; // Just the name
            $res->centerCode = $row['code']; // Just the code
            $res->filterCenter = $centerName;
            
            logMemoryUsage('evalLeb - Center Details Found');
        } else {
            // Fallback if center not found
            $res->center = $_SESSION['center'] ?? '';
            $res->centerId = $centerId;
            $res->filterCenter = $_SESSION['center'] ?? '';
            logMemoryUsage('evalLeb - Center Not Found');
        }
        
        $stmt->close();
        $con->close();
    } else {
        // Fallback if no connection or no centerId
        $res->center = $_SESSION['center'] ?? '';
        $res->centerId = $centerId;
        $res->filterCenter = $_SESSION['center'] ?? '';
        logMemoryUsage('evalLeb - Using Session Data Only');
    }

    logMemoryUsage('evalLeb - End');
    ob_clean();
    echo json_encode($res);
    ob_end_flush();
    exit();
}

if (isset($_POST['resetEvaluatorPassword'])) {
    logMemoryUsage('resetEvaluatorPassword - Start');
    logExecutionTime('resetEvaluatorPassword');

    $res = new stdClass();
    $res->status = false;
    $res->message = '';
    
    $id = $_POST['id'];
    $newPassword = trim($_POST['newPassword']); // TRIM HERE
    
    // Add validation
    if (empty($newPassword)) {
        $res->message = 'Password cannot be empty';
        ob_clean();
        echo json_encode($res);
        exit();
    }
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        logMemoryUsage('resetEvaluatorPassword - After DB Connection');
        
        // Hash the new password
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        $query = "UPDATE `evaluator` SET `password` = ? WHERE `id` = ?";
        $stmt = $con->prepare($query);
        $stmt->bind_param("ss", $hashedPassword, $id);
        
        if ($stmt->execute()) {
            $res->status = true;
            $res->message = "Password reset successfully";
            logMemoryUsage('resetEvaluatorPassword - Update Successful');
        } else {
            $res->message = $con->error;
            logMemoryUsage('resetEvaluatorPassword - Update Failed');
        }
        
        $stmt->close();
        $con->close();
    } else {
        $res->message = 'Database connection failed';
    }

    logMemoryUsage('resetEvaluatorPassword - End');
    ob_clean();
    echo json_encode($res);
    ob_end_flush();
    exit();
}

// Log final memory usage if no endpoint matched
logMemoryUsage('No Endpoint Matched');
logExecutionTime('Script End');