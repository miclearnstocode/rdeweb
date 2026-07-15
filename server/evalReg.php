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
    
    $response = new stdClass();
    $response->status = false;
    $response->message = 'Server connection failed..!';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        logMemoryUsage('evaluatorRegister - After DB Connection');

        $response = new stdClass();
        $user = trim($_POST['username']);
        $pass = password_hash(trim($_POST['password']), PASSWORD_DEFAULT);
        $fullname = trim($_POST['fullname']);
        $center = isset($_POST['center']) && !empty($_POST['center']) ? trim($_POST['center']) : null;
        $eventType = trim($_POST['eventTYpe']);
        $registrationType = isset($_POST['registrationType']) ? $_POST['registrationType'] : 'center';
        
        // Handle categories - ensure they're integers
        $categories = [];
        if (isset($_POST['categories']) && !empty($_POST['categories'])) {
            // If categories is a JSON string
            if (is_string($_POST['categories'])) {
                $categories = json_decode($_POST['categories'], true);
            } 
            // If categories is an array
            else if (is_array($_POST['categories'])) {
                $categories = $_POST['categories'];
            }
            // If categories is a comma-separated string
            else if (is_string($_POST['categories']) && strpos($_POST['categories'], ',') !== false) {
                $categories = explode(',', $_POST['categories']);
            }
            
            // Ensure all categories are integers
            $categories = array_map('intval', $categories);
            // Remove any empty or zero values
            $categories = array_filter($categories, function($id) {
                return $id > 0;
            });
            // Re-index the array
            $categories = array_values($categories);
        }

        // Debug log
        error_log("Registration Type: " . $registrationType);
        error_log("Categories: " . print_r($categories, true));
        error_log("Categories count: " . count($categories));

        $id = round(microtime(true) * 1000) . '';

        // Start transaction
        $con->begin_transaction();

        try {
            // Query without category field
            if ($center) {
                $newQuery = "INSERT INTO `evaluator` 
                (evaluator.fullname, evaluator.username, evaluator.password, evaluator.eventid, evaluator.center_id) 
                VALUES (?, ?, ?, ?, ?)";
                
                $stmt = $con->prepare($newQuery);
                $stmt->bind_param("sssss", $fullname, $user, $pass, $eventType, $center);
            } else {
                $newQuery = "INSERT INTO `evaluator` 
                (evaluator.fullname, evaluator.username, evaluator.password, evaluator.eventid) 
                VALUES (?, ?, ?, ?)";
                
                $stmt = $con->prepare($newQuery);
                $stmt->bind_param("ssss", $fullname, $user, $pass, $eventType);
            }

            logMemoryUsage('evaluatorRegister - Before Query Execution');

            if ($stmt->execute()) {
                $evaluatorId = $stmt->insert_id;
                
                // If category-based registration, insert into evaluator_categories
                if ($registrationType === 'category' && !empty($categories)) {
                    // First, validate that all category IDs exist
                    $placeholders = implode(',', array_fill(0, count($categories), '?'));
                    $checkQuery = "SELECT id FROM category WHERE id IN ($placeholders)";
                    $checkStmt = $con->prepare($checkQuery);
                    
                    if ($checkStmt) {
                        // Prepare types for bind_param
                        $types = str_repeat('i', count($categories));
                        $checkStmt->bind_param($types, ...$categories);
                        $checkStmt->execute();
                        $result = $checkStmt->get_result();
                        
                        $validCategories = [];
                        while ($row = $result->fetch_assoc()) {
                            $validCategories[] = (int)$row['id'];
                        }
                        $checkStmt->close();
                        
                        // Check if all categories are valid
                        if (count($validCategories) !== count($categories)) {
                            $invalidCategories = array_diff($categories, $validCategories);
                            throw new Exception("Invalid category IDs: " . implode(', ', $invalidCategories) . ". Valid IDs are: 1,2,3,4,5");
                        }
                        
                        // Now insert the valid categories
                        $categoryInsertQuery = "INSERT INTO `evaluator_categories` (evaluator_id, category_id) VALUES (?, ?)";
                        $categoryStmt = $con->prepare($categoryInsertQuery);
                        
                        if ($categoryStmt) {
                            foreach ($categories as $categoryId) {
                                $cleanCategoryId = (int)$categoryId;
                                $cleanEvaluatorId = (int)$evaluatorId;
                                $categoryStmt->bind_param("ii", $cleanEvaluatorId, $cleanCategoryId);
                                if (!$categoryStmt->execute()) {
                                    throw new Exception("Failed to insert category ID $categoryId: " . $categoryStmt->error);
                                }
                                error_log("Inserted category: evaluator_id=$cleanEvaluatorId, category_id=$cleanCategoryId");
                            }
                            $categoryStmt->close();
                        } else {
                            throw new Exception("Failed to prepare category insert statement");
                        }
                    } else {
                        throw new Exception("Failed to prepare category validation statement");
                    }
                }
                
                $con->commit();
                $response->status = true;
                $response->message = 'Save successfully..!';
                $response->evaluatorId = $evaluatorId;
                $response->categoriesAdded = count($categories);
            } else {
                throw new Exception($stmt->error);
            }

            $stmt->close();
        } catch (Exception $e) {
            $con->rollback();
            $response->message = $e->getMessage();
            error_log("Error in evaluatorRegister: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
        }

        logMemoryUsage('evaluatorRegister - After Query Execution');
        $con->close();
    }

    logMemoryUsage('evaluatorRegister - End');
    ob_clean();
    echo json_encode($response);
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
            center.name as center_name,
            evaluator.eventid,
            event_list.name as event_name
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

                    // Get categories for this evaluator (if any)
                    $categoryQuery = "SELECT c.id, c.name 
                                     FROM evaluator_categories ec 
                                     JOIN category c ON ec.category_id = c.id 
                                     WHERE ec.evaluator_id = ?";
                    $catStmt = $con->prepare($categoryQuery);
                    $catStmt->bind_param("i", $id);
                    $catStmt->execute();
                    $catResult = $catStmt->get_result();
                    
                    $categories = [];
                    while ($catRow = $catResult->fetch_assoc()) {
                        $categories[] = $catRow;
                    }
                    $_SESSION['userCategories'] = $categories;
                    $catStmt->close();

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

        $query = "SELECT 
                    e.*,
                    c.name as center_name,
                    GROUP_CONCAT(cat.name SEPARATOR ', ') as category_names
                  FROM `evaluator` e
                  LEFT JOIN `center` c ON e.center_id = c.id
                  LEFT JOIN `evaluator_categories` ec ON e.id = ec.evaluator_id
                  LEFT JOIN `category` cat ON ec.category_id = cat.id
                  GROUP BY e.id";
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

        // Start transaction
        $con->begin_transaction();

        try {
            // Delete from evaluator_categories first (foreign key constraint)
            $deleteCategories = "DELETE FROM `evaluator_categories` WHERE `evaluator_id` = ?";
            $stmt = $con->prepare($deleteCategories);
            $stmt->bind_param("s", $userId);
            if (!$stmt->execute()) {
                throw new Exception($stmt->error);
            }
            $stmt->close();

            // Then delete the evaluator
            $query = "DELETE FROM `evaluator` WHERE `id` = ?";
            $stmt = $con->prepare($query);
            $stmt->bind_param("s", $userId);
            if ($stmt->execute()) {
                $con->commit();
                $res->status = true;
                $res->message = "Deleted...!";
                logMemoryUsage('deleteEval - Delete Successful');
            } else {
                throw new Exception($stmt->error);
            }
            $stmt->close();
        } catch (Exception $e) {
            $con->rollback();
            $res->message = $e->getMessage();
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
if (isset($_POST['getCategories'])) {
    logMemoryUsage('getCategories - Start');
    logExecutionTime('getCategories');

    $res = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        logMemoryUsage('getCategories - After DB Connection');

        $query = "SELECT id, name FROM category ORDER BY name";
        $result = $con->query($query);
        
        logMemoryUsage('getCategories - Before Fetch');

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $res[] = $row;
            }
            $result->free();
        }

        logMemoryUsage('getCategories - After Fetch');
        $con->close();
    }

    logMemoryUsage('getCategories - End');
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

    // Also fetch categories for this evaluator if they have any
    if (isset($_SESSION['userId'])) {
        $userId = $_SESSION['userId'];
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            $categoryQuery = "SELECT c.id, c.name 
                             FROM evaluator_categories ec 
                             JOIN category c ON ec.category_id = c.id 
                             WHERE ec.evaluator_id = ?";
            $stmt = $con->prepare($categoryQuery);
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $categories = [];
            while ($row = $result->fetch_assoc()) {
                $categories[] = $row;
            }
            $res->categories = $categories;
            $stmt->close();
            $con->close();
        }
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