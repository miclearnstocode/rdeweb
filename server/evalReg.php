<?php
header('Content-Type: application/json; charset=utf-8');
ob_start();

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include('db.php');

/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
function logMemoryUsage($functionName) {
    $memoryUsage = memory_get_usage(true);
    $peakMemory = memory_get_peak_usage(true);
    $memoryInMB = round($memoryUsage / 1024 / 1024, 2);
    $peakInMB = round($peakMemory / 1024 / 1024, 2);
    error_log("[Memory Debug] $functionName - Current: {$memoryInMB}MB, Peak: {$peakInMB}MB");
}
$scriptStartTime = microtime(true);
function logExecutionTime($functionName) {
    global $scriptStartTime;
    $currentTime = microtime(true);
    $executionTime = round(($currentTime - $scriptStartTime) * 1000, 2); 
    error_log("[Time Debug] $functionName - Execution time so far: {$executionTime}ms");
}

function normalizeString($string) {
    // Convert to lowercase
    $string = strtolower($string);
    
    // Remove extra spaces
    $string = preg_replace('/\s+/', ' ', $string);
    
    // Remove special characters but keep letters and numbers
    $string = preg_replace('/[^a-z0-9\s]/', '', $string);
    
    // Trim
    $string = trim($string);
    
    return $string;
}

function isSimilarString($str1, $str2, $threshold = 80) {
    $str1 = normalizeString($str1);
    $str2 = normalizeString($str2);
    
    // If exactly the same after normalization, they're duplicates
    if ($str1 === $str2) {
        return true;
    }
    
    // Calculate Levenshtein distance
    $distance = levenshtein($str1, $str2);
    $maxLength = max(strlen($str1), strlen($str2));
    
    if ($maxLength === 0) {
        return true;
    }
    
    // Calculate similarity percentage
    $similarity = (1 - $distance / $maxLength) * 100;
    
    return $similarity >= $threshold;
}

function normalizeAuthorName($name) {
    // Remove titles
    $name = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $name);
    
    // Remove suffixes
    $name = preg_replace('/\s*(Ph\.?D\.?|MD|DVM|JD|LLB|LLM|RN|CPA|CMA|CFA|PE|Arch|Ed\.?D\.?|DBA|MPH|MS|MA|MBA|MFT|DrPH|PharmD|PT|OT|ECE|MCS|MAED|EDD)\s*/i', '', $name);
    
    // Convert to lowercase
    $name = strtolower($name);
    
    // Remove special characters
    $name = preg_replace('/[^a-z0-9\s]/', '', $name);
    
    // Remove extra spaces
    $name = preg_replace('/\s+/', ' ', $name);
    
    return trim($name);
}

function areAuthorsSimilar($authors1, $authors2, $threshold = 80) {
    // Normalize all authors
    $normalized1 = array_map('normalizeAuthorName', $authors1);
    $normalized2 = array_map('normalizeAuthorName', $authors2);
    
    // Sort them
    sort($normalized1);
    sort($normalized2);
    
    // If they have different lengths, they might still be similar
    // Check if one set is a subset of the other (some authors might be missing)
    if (count($normalized1) != count($normalized2)) {
        // Find common authors
        $common = array_intersect($normalized1, $normalized2);
        $minCount = min(count($normalized1), count($normalized2));
        $similarity = (count($common) / $minCount) * 100;
        return $similarity >= $threshold;
    }
    
    // Same length, compare each author
    $matches = 0;
    for ($i = 0; $i < count($normalized1); $i++) {
        if ($normalized1[$i] === $normalized2[$i]) {
            $matches++;
        } elseif (isSimilarString($normalized1[$i], $normalized2[$i], 85)) {
            $matches++;
        }
    }
    
    $similarity = ($matches / count($normalized1)) * 100;
    return $similarity >= $threshold;
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
                $response->message = 'Evaluator Account is Registered Successfully';
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
                    $_SESSION['hasCategories'] = !empty($categories);
                    $_SESSION['userType'] = !empty($centerId) ? 'center' : 'category';
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
//return the list of paper to be comment and score
if (isset($_POST['evalLeb'])) {
    logMemoryUsage('evalLeb - Start');
    logExecutionTime('evalLeb');
    
    $res = new stdClass();
    $res->status = true;
    $res->message = '';
    $res->papers = [];
    $res->userType = '';
    $res->centerId = '';
    $res->categoryIds = [];
    $res->categories = [];
    $res->displayCenter = '';
    $res->event = $_SESSION['eventTYpe'] ?? '';
    $res->eventId = $_SESSION['eventId'] ?? '';
    $res->userName = $_SESSION['userName'] ?? '';
    $res->userFullname = $_SESSION['userFulname'] ?? '';
    
    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        if ($con->connect_error) {
            throw new Exception("Database connection failed: " . $con->connect_error);
        }
        
        // Get evaluator's center and categories
        $userId = $_SESSION['userId'] ?? '';
        $centerId = $_SESSION['centerId'] ?? '';
        $categories = [];
        $categoryNames = [];
        $categoryIds = [];
        
        // Get categories for this evaluator
        if (!empty($userId)) {
            $categoryQuery = "SELECT c.id, c.name 
                             FROM evaluator_categories ec 
                             JOIN category c ON ec.category_id = c.id 
                             WHERE ec.evaluator_id = ?";
            $catStmt = $con->prepare($categoryQuery);
            if ($catStmt) {
                $catStmt->bind_param("i", $userId);
                $catStmt->execute();
                $catResult = $catStmt->get_result();
                
                while ($catRow = $catResult->fetch_assoc()) {
                    $categories[] = $catRow;
                    $categoryIds[] = (int)$catRow['id'];
                    $categoryNames[] = $catRow['name'];
                }
                $catStmt->close();
            }
        }
        
        // Determine user type
        if (!empty($centerId)) {
            // Center-based evaluator
            $res->userType = 'center';
            $res->centerId = $centerId;
            $res->categoryIds = [];
            $res->categories = [];
            $res->displayCenter = '';
            
            // Fetch center details
            $query = "SELECT name, code FROM center WHERE id = ?";
            $stmt = $con->prepare($query);
            if ($stmt) {
                $stmt->bind_param("s", $centerId);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($row = $result->fetch_assoc()) {
                    $res->displayCenter = $row['name'] . " (" . $row['code'] . ")";
                    $res->centerName = $row['name'];
                    $res->centerCode = $row['code'];
                }
                $stmt->close();
            }
        } else if (!empty($categories)) {
            // Category-based evaluator
            $res->userType = 'category';
            $res->categoryIds = $categoryIds;
            $res->categories = $categories;
            $res->centerId = null;
            $res->displayCenter = 'Category: ' . implode(', ', $categoryNames);
            $res->categoryNames = $categoryNames;
        } else {
            // No access
            $res->userType = 'none';
            $res->papers = [];
            ob_clean();
            echo json_encode($res);
            ob_end_flush();
            exit();
        }
        
        // Build query to get papers - USE rf.id directly
        $whereConditions = [];
        $params = [];
        $types = "";
        
        if ($res->userType === 'center' && !empty($centerId)) {
            // Get center name for filtering
            $centerNameQuery = "SELECT name FROM center WHERE id = ?";
            $centerStmt = $con->prepare($centerNameQuery);
            $centerStmt->bind_param("s", $centerId);
            $centerStmt->execute();
            $centerResult = $centerStmt->get_result();
            $centerRow = $centerResult->fetch_assoc();
            $centerName = $centerRow['name'] ?? $centerId;
            $centerStmt->close();
            
            // Use rf.center which is a string column
            $whereConditions[] = "rf.center = ?";
            $params[] = $centerName;
            $types .= "s";
        } else if ($res->userType === 'category' && !empty($categoryNames)) {
            // Use rf.category which is a string column
            $placeholders = implode(',', array_fill(0, count($categoryNames), '?'));
            $whereConditions[] = "rf.category IN ($placeholders)";
            foreach ($categoryNames as $catName) {
                $params[] = $catName;
                $types .= "s";
            }
        } else {
            $res->papers = [];
            ob_clean();
            echo json_encode($res);
            ob_end_flush();
            exit();
        }
        
        // Add event filter - use rf.event_id
        if (!empty($res->eventId)) {
            $whereConditions[] = "rf.event_id = ?";
            $params[] = $res->eventId;
            $types .= "i";
        }
        
        // Add status filter - only accepted papers
        $whereConditions[] = "rf.status = 'accepted'";
        
        $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
        
        // Query to get all papers with their data - USE rf.id
        $query = "SELECT 
                    rf.id,
                    rf.title,
                    rf.final_symposium_title,
                    rf.author,
                    rf.presenter,
                    rf.coauthor,
                    rf.center,
                    rf.category,
                    rf.event_id,
                    rf.status
                  FROM researchfile rf
                  $whereClause
                  ORDER BY rf.id ASC";
        
        $stmt = $con->prepare($query);
        if (!$stmt) {
            throw new Exception("Failed to prepare query: " . $con->error);
        }
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        // Get all papers first
        $allPapers = [];
        while ($row = $result->fetch_assoc()) {
            $allPapers[] = $row;
        }
        $stmt->close();
        
        // --- DUPLICATE DETECTION ---
        $uniquePapers = [];
        $duplicateGroups = [];
        $paperIds = [];
        
        // Helper function to get all authors from a paper
        $getAllAuthors = function($paper) {
            $authors = [];
            
            if (!empty($paper['author'])) {
                $cleanedAuthor = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $paper['author']);
                $authorList = array_map('trim', explode(',', $cleanedAuthor));
                $authors = array_merge($authors, $authorList);
            }
            
            if (!empty($paper['presenter'])) {
                $cleanedPresenter = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $paper['presenter']);
                $authors[] = trim($cleanedPresenter);
            }
            
            if (!empty($paper['coauthor'])) {
                $coauthorData = $paper['coauthor'];
                if (is_string($coauthorData)) {
                    if (strpos($coauthorData, '[') === 0) {
                        $coauthorArray = json_decode($coauthorData, true);
                        if (is_array($coauthorArray)) {
                            foreach ($coauthorArray as $coauthor) {
                                $cleaned = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $coauthor);
                                $authors[] = trim($cleaned);
                            }
                        }
                    } else {
                        $coauthorList = array_map('trim', explode(',', $coauthorData));
                        $authors = array_merge($authors, $coauthorList);
                    }
                } else if (is_array($coauthorData)) {
                    foreach ($coauthorData as $coauthor) {
                        $cleaned = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $coauthor);
                        $authors[] = trim($cleaned);
                    }
                }
            }
            
            $authors = array_filter($authors);
            $authors = array_unique($authors);
            return $authors;
        };
        
        // First pass: Group by title similarity and author similarity
        foreach ($allPapers as $paper) {
            $displayTitle = !empty($paper['final_symposium_title']) 
                ? $paper['final_symposium_title'] 
                : $paper['title'];
            
            $isDuplicate = false;
            $duplicateGroupId = null;
            
            // Check against existing unique papers
            foreach ($uniquePapers as $key => $uniquePaper) {
                $uniqueDisplayTitle = !empty($uniquePaper['final_symposium_title']) 
                    ? $uniquePaper['final_symposium_title'] 
                    : $uniquePaper['title'];
                
                // Check if title is similar
                $titleSimilar = isSimilarString($displayTitle, $uniqueDisplayTitle, 75);
                
                if ($titleSimilar) {
                    // Get all authors for both papers
                    $authors1 = $getAllAuthors($paper);
                    $authors2 = $getAllAuthors($uniquePaper);
                    
                    // Check if authors are similar
                    if (areAuthorsSimilar($authors1, $authors2, 70)) {
                        $isDuplicate = true;
                        $duplicateGroupId = $key;
                        break;
                    }
                }
            }
            
            if ($isDuplicate && $duplicateGroupId !== null) {
                // This is a duplicate - add to duplicate group
                if (!isset($duplicateGroups[$duplicateGroupId])) {
                    $duplicateGroups[$duplicateGroupId] = [
                        'original' => $uniquePapers[$duplicateGroupId],
                        'duplicates' => []
                    ];
                }
                $duplicateGroups[$duplicateGroupId]['duplicates'][] = $paper;
            } else {
                // This is a unique paper
                $uniquePapers[] = $paper;
            }
        }
        
        // --- Build response with duplicate information ---
        $processedPapers = [];
        
        // Process unique papers and their duplicates
        foreach ($uniquePapers as $index => $paper) {
            // Get category ID and name
            $categoryId = null;
            $categoryName = $paper['category'] ?? null;
            
            if (!empty($categoryName)) {
                $catQuery = "SELECT id, name FROM category WHERE name = ?";
                $catStmt = $con->prepare($catQuery);
                if ($catStmt) {
                    $catStmt->bind_param("s", $categoryName);
                    $catStmt->execute();
                    $catResult = $catStmt->get_result();
                    if ($catRow = $catResult->fetch_assoc()) {
                        $categoryId = (int)$catRow['id'];
                        $categoryName = $catRow['name'];
                    }
                    $catStmt->close();
                }
            }
            
            // Check if evaluator has comments for this paper
            $hasComment = false;
            $commentData = null;
            
            $commentQuery = "SELECT 
                                comments.title as comment_title,
                                comments.intro,
                                comments.abstract,
                                comments.objective,
                                comments.methodology,
                                comments.results,
                                comments.recommendation,
                                comments.literature,
                                comments.other,
                                comments.isCommented,
                                CASE 
                                    WHEN COALESCE(comments.title, '') != '' 
                                         OR COALESCE(comments.intro, '') != ''
                                         OR COALESCE(comments.abstract, '') != ''
                                         OR COALESCE(comments.objective, '') != ''
                                         OR COALESCE(comments.methodology, '') != ''
                                         OR COALESCE(comments.results, '') != ''
                                         OR COALESCE(comments.recommendation, '') != ''
                                         OR COALESCE(comments.literature, '') != ''
                                         OR COALESCE(comments.other, '') != ''
                                    THEN 1 ELSE 0 
                                END as has_comment_content
                            FROM comments 
                            WHERE comments.resid = ? AND comments.evalid = ?";
            
            $commentStmt = $con->prepare($commentQuery);
            if ($commentStmt) {
                $commentStmt->bind_param("si", $paper['id'], $userId);
                $commentStmt->execute();
                $commentResult = $commentStmt->get_result();
                
                if ($commentRow = $commentResult->fetch_assoc()) {
                    $hasComment = ($commentRow['has_comment_content'] == 1);
                    $commentData = $commentRow;
                }
                $commentStmt->close();
            }
            
            // Check if evaluator has scores for this paper
            $hasScore = false;
            $scoreQuery = "SELECT 
                                COUNT(*) as score_count,
                                CASE 
                                    WHEN COUNT(*) > 0 AND SUM(CASE WHEN score IS NOT NULL THEN 1 ELSE 0 END) > 0
                                    THEN 1 ELSE 0 
                                END as has_score_content
                           FROM score_board 
                           WHERE doc_id = ? AND eval_id = ?";
            
            $scoreStmt = $con->prepare($scoreQuery);
            if ($scoreStmt) {
                $scoreStmt->bind_param("ii", $paper['id'], $userId);
                $scoreStmt->execute();
                $scoreResult = $scoreStmt->get_result();
                
                if ($scoreRow = $scoreResult->fetch_assoc()) {
                    $hasScore = ($scoreRow['has_score_content'] == 1);
                }
                $scoreStmt->close();
            }
            
            // Build paper object with original rf.id
            $paperObj = new stdClass();
            $paperObj->id = (int)$paper['id'];
            $paperObj->title = !empty($paper['final_symposium_title']) ? $paper['final_symposium_title'] : $paper['title'];
            $paperObj->original_title = $paper['title'];
            $paperObj->final_symposium_title = $paper['final_symposium_title'];
            $paperObj->author = $paper['author'];
            $paperObj->presenter = $paper['presenter'];
            $paperObj->coauthor = $paper['coauthor'];
            $paperObj->center = $paper['center'];
            $paperObj->category = $paper['category'];
            $paperObj->category_id = $categoryId;
            $paperObj->category_name = $categoryName;
            $paperObj->event_id = $paper['event_id'];
            $paperObj->status = $paper['status'];
            $paperObj->hasComment = $hasComment;
            $paperObj->hasScore = $hasScore;
            $paperObj->comment_data = $commentData;
            
            // Add duplicate information
            if (isset($duplicateGroups[$index])) {
                $paperObj->isDuplicate = false; // This is the original
                $paperObj->hasDuplicates = true;
                $paperObj->duplicateCount = count($duplicateGroups[$index]['duplicates']);
                $paperObj->duplicateIds = array_column($duplicateGroups[$index]['duplicates'], 'id');
                $paperObj->duplicateGroup = $duplicateGroups[$index];
            } else {
                $paperObj->isDuplicate = false;
                $paperObj->hasDuplicates = false;
                $paperObj->duplicateCount = 0;
                $paperObj->duplicateIds = [];
                $paperObj->duplicateGroup = null;
            }
            
            $processedPapers[] = $paperObj;
        }
        
        // Mark duplicate papers that are not originals
        foreach ($duplicateGroups as $group) {
            foreach ($group['duplicates'] as $dupPaper) {
                // Create a paper object for the duplicate (marked as duplicate)
                $dupObj = new stdClass();
                $dupObj->id = (int)$dupPaper['id'];
                $dupObj->title = !empty($dupPaper['final_symposium_title']) ? $dupPaper['final_symposium_title'] : $dupPaper['title'];
                $dupObj->original_title = $dupPaper['title'];
                $dupObj->final_symposium_title = $dupPaper['final_symposium_title'];
                $dupObj->author = $dupPaper['author'];
                $dupObj->presenter = $dupPaper['presenter'];
                $dupObj->coauthor = $dupPaper['coauthor'];
                $dupObj->center = $dupPaper['center'];
                $dupObj->category = $dupPaper['category'];
                $dupObj->category_id = null; // Will be filled if needed
                $dupObj->category_name = null;
                $dupObj->event_id = $dupPaper['event_id'];
                $dupObj->status = $dupPaper['status'];
                $dupObj->hasComment = false; // Will be filled if needed
                $dupObj->hasScore = false;
                $dupObj->comment_data = null;
                $dupObj->isDuplicate = true;
                $dupObj->hasDuplicates = false;
                $dupObj->duplicateCount = 0;
                $dupObj->duplicateIds = [];
                $dupObj->duplicateGroup = null;
                $dupObj->originalId = (int)$group['original']['id'];
                
                $processedPapers[] = $dupObj;
            }
        }
        
        $con->close();
        
        $res->papers = $processedPapers;
        $res->totalUnique = count($uniquePapers);
        $res->totalDuplicateCount = count($allPapers) - count($uniquePapers);
        $res->hasDuplicates = count($duplicateGroups) > 0;
        $res->duplicateGroups = $duplicateGroups;
        $res->message = 'Successfully loaded ' . count($processedPapers) . ' papers (' . count($uniquePapers) . ' unique, ' . (count($allPapers) - count($uniquePapers)) . ' duplicates)';
        
        logMemoryUsage('evalLeb - End');
        logExecutionTime('evalLeb - End');
        
    } catch (Exception $e) {
        $res->status = false;
        $res->message = $e->getMessage();
        $res->papers = [];
        error_log("evalLeb Error: " . $e->getMessage());
        error_log("evalLeb Stack trace: " . $e->getTraceAsString());
    }

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