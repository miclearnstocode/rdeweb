<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/igp_errors.log');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start output buffering with callback to catch errors
ob_start(function ($buffer) {
    if (
        strpos($buffer, '<b>Warning</b>') !== false ||
        strpos($buffer, '<b>Notice</b>') !== false ||
        strpos($buffer, '<b>Fatal error</b>') !== false
    ) {
        error_log("HTML error in output buffer: " . substr($buffer, 0, 500));
        return json_encode([
            'success' => false,
            'message' => 'Server error occurred',
            'error_type' => 'html_error_in_response'
        ]);
    }
    return $buffer;
});

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/driver_config.php';
require_once __DIR__ . '/../../db.php';

// Define the database connection variable
global $con;
if (!isset($con) && isset($db)) {
    $con = $db;
} elseif (!isset($con) && isset($conn)) {
    $con = $conn;
}

if (!isset($con) || !$con instanceof mysqli) {
    try {
        if (isset($host, $username, $pass, $dbName)) {
            $con = new mysqli($host, $username, $pass, $dbName);
            if ($con->connect_error) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Database connection failed: ' . $con->connect_error
                ]);
                exit();
            }
            $con->set_charset('utf8mb4');
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Database configuration not available'
            ]);
            exit();
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Database connection error: ' . $e->getMessage()
        ]);
        exit();
    }
}

$requestMethod = $_SERVER['REQUEST_METHOD'];
$action = isset($_POST['action']) ? sanitizeInput($_POST['action']) : (isset($_GET['action']) ? sanitizeInput($_GET['action']) : '');

try {
    // Route the request based on method and action
    switch ($requestMethod) {
        case 'GET':
            if ($action === 'fetch_igp') {
                handleFetchIGP();
            } elseif ($action === 'fetch_completed_research') {
                handleFetchCompletedResearch();
            } else {
                handleGetIGP($_GET);
            }
            break;
            
        case 'POST':
            if ($action === 'add_igp') {
                handleAddIGP($_POST);
            } elseif ($action === 'update_igp') {
                handleUpdateIGP($_POST);
            } elseif ($action === 'delete_igp') {
                handleDeleteIGP($_POST);
            } elseif ($action === 'fetch_igp') {
                handleFetchIGP();
            } elseif ($action === 'fetch_completed_research') {
                handleFetchCompletedResearch();
            } else {
                throw new Exception('Invalid action for POST request');
            }
            break;
            
        case 'PUT':
            $putData = json_decode(file_get_contents('php://input'), true);
            if ($action === 'update_igp') {
                handleUpdateIGP($putData);
            } else {
                throw new Exception('Invalid action for PUT request');
            }
            break;
            
        case 'DELETE':
            $deleteData = json_decode(file_get_contents('php://input'), true);
            if ($action === 'delete_igp') {
                handleDeleteIGP($deleteData);
            } else {
                throw new Exception('Invalid action for DELETE request');
            }
            break;
            
        default:
            throw new Exception('Unsupported request method');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

ob_end_flush();

function getDb() {
    global $con;
    return $con;
}

function sanitizeInput($input) {
    if (is_string($input)) {
        $input = trim($input);
        $input = strip_tags($input);
        $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
        return $input;
    }
    return $input;
}

function sanitizeArray($array) {
    if (!is_array($array)) {
        // If it's a string that looks like JSON, don't sanitize it as a regular string
        if (is_string($array) && (strpos($array, '{') === 0 || strpos($array, '[') === 0)) {
            // It might be JSON, try to decode and re-encode to validate
            $decoded = json_decode($array, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                // It's valid JSON, return it as-is
                return $array;
            }
        }
        return sanitizeInput($array);
    }
    $sanitized = [];
    foreach ($array as $key => $value) {
        $sanitizedKey = sanitizeInput($key);
        if (is_array($value)) {
            $sanitized[$sanitizedKey] = sanitizeArray($value);
        } else {
            // If value is a string that looks like JSON, preserve it
            if (is_string($value) && (strpos($value, '{') === 0 || strpos($value, '[') === 0)) {
                $decoded = json_decode($value, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $sanitized[$sanitizedKey] = $value;
                    continue;
                }
            }
            $sanitized[$sanitizedKey] = sanitizeInput($value);
        }
    }
    return $sanitized;
}

function sanitizeDecimal($value) {
    if ($value === null || $value === '') {
        return 0;
    }
    $value = preg_replace('/[^0-9.\-]/', '', $value);
    return floatval($value);
}

function sanitizeInt($value) {
    if ($value === null || $value === '') {
        return 0;
    }
    return intval($value);
}

function validateLocation($type, $location) {
    $campuses = [
        'Roxas City Main', 'Tapaz', 'Burias', 'Dumarao', 
        'Pontevedra', 'Mambusao', 'Sigma', 'Pilar', 'Dayao'
    ];
    
    $centers = [
        'Crop Science Research & Development Center (CSRDC)',
        'Livestock Research & Development Center (LRDC)',
        'Fisheries Research & Development Center (FRDC)',
        'Food and Industrial Technology Research & Development Center (FITRDC)',
        'Social Science Research & Development Center (SSRDC)',
        'Machinery and Agricultural Technology Engineering Center (MATEC)',
        'Coconut Research and Development Center (Coco RDC)',
        'Extension'
    ];
    
    // Trim the location
    $location = trim($location);
    
    // Debug log
    error_log("=== validateLocation ===");
    error_log("Type: " . $type);
    error_log("Location: '" . $location . "'");
    error_log("Location length: " . strlen($location));
    
    // Convert to lowercase for case-insensitive comparison
    $locationLower = strtolower($location);
    
    if ($type === 'campus') {
        // Check if location matches any campus (case-insensitive)
        foreach ($campuses as $campus) {
            if (strtolower($campus) === $locationLower) {
                error_log("Found matching campus: " . $campus);
                return true;
            }
        }
        error_log("No matching campus found");
        error_log("Valid campuses: " . implode(', ', $campuses));
        return false;
    } elseif ($type === 'center') {
        // Check if location matches any center (case-insensitive)
        foreach ($centers as $center) {
            if (strtolower($center) === $locationLower) {
                error_log("Found matching center: " . $center);
                return true;
            }
        }
        
        // Also try matching by the code in parentheses (e.g., FITRDC)
        foreach ($centers as $center) {
            // Extract the code from parentheses
            if (preg_match('/\(([^)]+)\)/', $center, $matches)) {
                $code = $matches[1];
                if (strtolower($code) === $locationLower || strpos($locationLower, strtolower($code)) !== false) {
                    error_log("Found center by code: " . $code . " in " . $center);
                    return true;
                }
            }
        }
        
        error_log("No matching center found");
        error_log("Valid centers: " . implode(', ', $centers));
        return false;
    }
    
    error_log("Invalid type: " . $type);
    return false;
}

function handleFetchCompletedResearch() {
    try {
        $db = getDb();
        if (!$db) {
            throw new Exception('Database connection not available');
        }
        
        // Get filters
        $filters = array_merge($_POST, $_GET);
        $filters = sanitizeArray($filters);
        
        // Build query conditions
        $whereConditions = [];
        $params = [];
        $types = '';
        
        // Always filter by completion_status = 'completed'
        $whereConditions[] = "completion_status = 'completed'";
        
        // Filter by campus
        if (!empty($filters['campus']) && $filters['campus'] !== 'All Campuses') {
            $whereConditions[] = "campus = ?";
            $params[] = $filters['campus'];
            $types .= 's';
        }
        
        // Filter by center
        if (!empty($filters['center']) && $filters['center'] !== 'All Centers') {
            $whereConditions[] = "center = ?";
            $params[] = $filters['center'];
            $types .= 's';
        }
        
        // Filter by search term (title, author, event)
        if (!empty($filters['search'])) {
            $whereConditions[] = "(title LIKE ? OR author LIKE ? OR event LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $types .= 'sss';
        }
        
        // Build WHERE clause
        $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);
        
        // Query to get completed research projects - FIXED: removed trailing comma after date_completed
        $query = "SELECT 
                    id,
                    title,
                    author,
                    coauthor,
                    presenter,
                    event,
                    center,
                    campus,
                    completion_status,
                    date_completed
                  FROM researchfile 
                  $whereClause 
                  ORDER BY date_completed DESC";
        
        $stmt = $db->prepare($query);
        if ($stmt === false) {
            throw new Exception('Database prepare error: ' . $db->error);
        }
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = [
                'id' => intval($row['id']),
                'title' => $row['title'],
                'author' => $row['author'],
                'coauthor' => $row['coauthor'],
                'presenter' => $row['presenter'],
                'event' => $row['event'],
                'center' => $row['center'],
                'campus' => $row['campus'],
                'completion_status' => $row['completion_status'],
                'date_completed' => $row['date_completed'],
                'created_at' => $row['created_at']
            ];
        }
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'data' => $data,
            'total' => count($data)
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching completed research: ' . $e->getMessage()
        ]);
    }
}

function handleFetchIGP() {
    try {
        $db = getDb();
        if (!$db) {
            throw new Exception('Database connection not available');
        }
        
        // Sanitize and validate pagination parameters
        $page = isset($_GET['page']) ? max(1, sanitizeInt($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? min(100, max(1, sanitizeInt($_GET['limit']))) : 20;
        $offset = ($page - 1) * $limit;
        
        // Get filters from POST or GET and sanitize
        $filters = array_merge($_POST, $_GET);
        $filters = sanitizeArray($filters);
        
        // Build query conditions with prepared statements
        $whereConditions = [];
        $params = [];
        $types = '';
        
        // Type filter (campus/center)
        if (!empty($filters['type'])) {
            if (in_array($filters['type'], ['campus', 'center'])) {
                $whereConditions[] = "igp.type = ?";
                $params[] = $filters['type'];
                $types .= 's';
            }
        }
        
        // Location filter
        if (!empty($filters['location'])) {
            if (validateLocation($filters['type'] ?? 'campus', $filters['location'])) {
                $whereConditions[] = "igp.location = ?";
                $params[] = $filters['location'];
                $types .= 's';
            }
        } elseif (!empty($filters['campus']) && $filters['campus'] !== 'All Campuses') {
            if (validateLocation('campus', $filters['campus'])) {
                $whereConditions[] = "igp.location = ? AND igp.type = 'campus'";
                $params[] = $filters['campus'];
                $types .= 's';
            }
        } elseif (!empty($filters['center']) && $filters['center'] !== 'All Centers') {
            if (validateLocation('center', $filters['center'])) {
                $whereConditions[] = "igp.location = ? AND igp.type = 'center'";
                $params[] = $filters['center'];
                $types .= 's';
            }
        }
        
        // Search term
        if (!empty($filters['search']) && strlen($filters['search']) <= 255) {
            $searchTerm = '%' . $filters['search'] . '%';
            $whereConditions[] = "(igp.title LIKE ? OR igp.researchers LIKE ? OR igp.description LIKE ?)";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $types .= 'sss';
        }
        
        // Build WHERE clause
        $whereClause = '';
        if (!empty($whereConditions)) {
            $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);
        }
        
        // Get total count
        $countQuery = "SELECT COUNT(*) as total FROM igp_research_projects igp $whereClause";
        $stmt = $db->prepare($countQuery);
        if ($stmt === false) {
            throw new Exception('Database prepare error: ' . $db->error);
        }
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $countResult = $stmt->get_result();
        $totalCount = $countResult->fetch_assoc()['total'];
        $stmt->close();
        
        // Get paginated data with JOIN to researchfile
        $query = "SELECT 
                    igp.id, 
                    igp.type, 
                    igp.location, 
                    igp.number, 
                    igp.title, 
                    igp.researchers, 
                    igp.description, 
                    igp.technology, 
                    igp.clients,
                    igp.q1_income, 
                    igp.q2_income, 
                    igp.q3_income, 
                    igp.q4_income,
                    (COALESCE(igp.q1_income, 0) + COALESCE(igp.q2_income, 0) + COALESCE(igp.q3_income, 0) + COALESCE(igp.q4_income, 0)) as total_income,
                    igp.created_at, 
                    igp.updated_at,
                    igp.researchfile_id,
                    rf.title as research_title,
                    rf.author,
                    rf.event,
                    rf.completion_status,
                    rf.date_completed
                  FROM igp_research_projects igp
                  LEFT JOIN researchfile rf ON igp.researchfile_id = rf.id
                  $whereClause 
                  ORDER BY igp.created_at DESC 
                  LIMIT ? OFFSET ?";
        
        $stmt = $db->prepare($query);
        if ($stmt === false) {
            throw new Exception('Database prepare error: ' . $db->error);
        }
        
        $params[] = $limit;
        $params[] = $offset;
        $types .= 'ii';
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $data = [];
        while ($row = $result->fetch_assoc()) {
            // Decode clients JSON safely
            $clients = [];
            if (!empty($row['clients'])) {
                $decoded = json_decode($row['clients'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $clients = $decoded;
                }
            }
            
            $data[] = [
                'id' => intval($row['id']),
                'type' => $row['type'],
                'location' => $row['location'],
                'number' => $row['number'],
                'title' => $row['title'],
                'researchers' => $row['researchers'],
                'description' => $row['description'],
                'technology' => $row['technology'],
                'clients' => $clients,
                'q1Income' => floatval($row['q1_income']),
                'q2Income' => floatval($row['q2_income']),
                'q3Income' => floatval($row['q3_income']),
                'q4Income' => floatval($row['q4_income']),
                'totalIncome' => floatval($row['total_income']),
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
                'researchfile_id' => $row['researchfile_id'] ? intval($row['researchfile_id']) : null,
                'research_title' => $row['research_title'],
                'research_author' => $row['author'],
                'research_event' => $row['event'],
                'completion_status' => $row['completion_status'],
                'date_completed' => $row['date_completed']
            ];
        }
        $stmt->close();
        
        // Calculate summary statistics
        $summary = getSummaryStatistics($whereClause, $params, $types);
        
        echo json_encode([
            'success' => true,
            'data' => $data,
            'total' => $totalCount,
            'page' => $page,
            'limit' => $limit,
            'summary' => $summary
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching IGP data: ' . $e->getMessage()
        ]);
    }
}

function getSummaryStatistics($whereClause, $params, $types) {
    try {
        $db = getDb();
        if (!$db) {
            return getDefaultSummary();
        }
        
        // Remove limit and offset parameters for summary
        $summaryParams = $params;
        $summaryTypes = $types;
        if (!empty($summaryParams) && count($summaryParams) >= 2) {
            $summaryParams = array_slice($summaryParams, 0, -2);
            if (!empty($summaryTypes)) {
                $summaryTypes = substr($summaryTypes, 0, -2);
            }
        }
        
        $query = "SELECT 
                    COUNT(*) as total_projects,
                    COALESCE(SUM(COALESCE(q1_income, 0) + COALESCE(q2_income, 0) + COALESCE(q3_income, 0) + COALESCE(q4_income, 0)), 0) as total_income,
                    COALESCE(SUM(COALESCE(q1_income, 0)), 0) as q1_income,
                    COALESCE(SUM(COALESCE(q2_income, 0)), 0) as q2_income,
                    COALESCE(SUM(COALESCE(q3_income, 0)), 0) as q3_income,
                    COALESCE(SUM(COALESCE(q4_income, 0)), 0) as q4_income
                  FROM igp_research_projects igp
                  $whereClause";
        
        $stmt = $db->prepare($query);
        if ($stmt === false) {
            return getDefaultSummary();
        }
        
        if (!empty($summaryParams)) {
            $stmt->bind_param($summaryTypes, ...$summaryParams);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $summary = $result->fetch_assoc();
        $stmt->close();
        
        if ($summary) {
            return [
                'totalProjects' => intval($summary['total_projects']),
                'totalIncome' => floatval($summary['total_income']),
                'q1Income' => floatval($summary['q1_income']),
                'q2Income' => floatval($summary['q2_income']),
                'q3Income' => floatval($summary['q3_income']),
                'q4Income' => floatval($summary['q4_income'])
            ];
        }
        
        return getDefaultSummary();
        
    } catch (Exception $e) {
        return getDefaultSummary();
    }
}

function getDefaultSummary() {
    return [
        'totalProjects' => 0,
        'totalIncome' => 0,
        'q1Income' => 0,
        'q2Income' => 0,
        'q3Income' => 0,
        'q4Income' => 0
    ];
}

function handleGetIGP($params) {
    try {
        $db = getDb();
        if (!$db) {
            throw new Exception('Database connection not available');
        }
        
        $id = isset($params['id']) ? sanitizeInt($params['id']) : 0;
        
        if ($id <= 0) {
            throw new Exception('Invalid ID provided');
        }
        
        $query = "SELECT 
                    igp.id, 
                    igp.type, 
                    igp.location, 
                    igp.number, 
                    igp.title, 
                    igp.researchers, 
                    igp.description, 
                    igp.technology, 
                    igp.clients,
                    igp.q1_income, 
                    igp.q2_income, 
                    igp.q3_income, 
                    igp.q4_income,
                    (COALESCE(igp.q1_income, 0) + COALESCE(igp.q2_income, 0) + COALESCE(igp.q3_income, 0) + COALESCE(igp.q4_income, 0)) as total_income,
                    igp.created_at, 
                    igp.updated_at,
                    igp.researchfile_id,
                    rf.title as research_title,
                    rf.author,
                    rf.event,
                    rf.completion_status,
                    rf.date_completed
                  FROM igp_research_projects igp
                  LEFT JOIN researchfile rf ON igp.researchfile_id = rf.id
                  WHERE igp.id = ?";
        
        $stmt = $db->prepare($query);
        if ($stmt === false) {
            throw new Exception('Database prepare error: ' . $db->error);
        }
        
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            $clients = [];
            if (!empty($row['clients'])) {
                $decoded = json_decode($row['clients'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $clients = $decoded;
                }
            }
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'id' => intval($row['id']),
                    'type' => $row['type'],
                    'location' => $row['location'],
                    'number' => $row['number'],
                    'title' => $row['title'],
                    'researchers' => $row['researchers'],
                    'description' => $row['description'],
                    'technology' => $row['technology'],
                    'clients' => $clients,
                    'q1Income' => floatval($row['q1_income']),
                    'q2Income' => floatval($row['q2_income']),
                    'q3Income' => floatval($row['q3_income']),
                    'q4Income' => floatval($row['q4_income']),
                    'totalIncome' => floatval($row['total_income']),
                    'researchfile_id' => $row['researchfile_id'] ? intval($row['researchfile_id']) : null,
                    'research_title' => $row['research_title'],
                    'research_author' => $row['author'],
                    'research_event' => $row['event'],
                    'completion_status' => $row['completion_status'],
                    'date_completed' => $row['date_completed']
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Record not found'
            ]);
        }
        $stmt->close();
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching IGP record: ' . $e->getMessage()
        ]);
    }
}

function handleAddIGP($data) {
    try {
        $db = getDb();
        if (!$db) {
            throw new Exception('Database connection not available');
        }
        
        // Don't sanitize the entire array, it breaks JSON
        // Instead, sanitize each field individually
        $data['type'] = sanitizeInput($data['type'] ?? '');
        $data['location'] = sanitizeInput($data['location'] ?? '');
        $data['title'] = sanitizeInput($data['title'] ?? '');
        $data['researchers'] = sanitizeInput($data['researchers'] ?? '');
        $data['description'] = sanitizeInput($data['description'] ?? '');
        $data['technology'] = sanitizeInput($data['technology'] ?? '');
        $data['number'] = sanitizeInput($data['number'] ?? '');
        $data['researchfile_id'] = sanitizeInput($data['researchfile_id'] ?? '');
        
        // Handle clients separately - don't sanitize as string
        $clientsRaw = isset($_POST['clients']) ? $_POST['clients'] : '[]';
        error_log("Raw clients from POST: " . $clientsRaw);
        
        // Try to decode the clients
        $clients = [];
        if (!empty($clientsRaw)) {
            $decoded = json_decode($clientsRaw, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $clients = $decoded;
                error_log("Decoded clients successfully: " . print_r($clients, true));
            } else {
                error_log("Failed to decode clients: " . json_last_error_msg());
                $clients = [];
            }
        }
        
        // Validate required fields
        $requiredFields = ['type', 'location', 'title', 'researchers'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field]) || trim($data[$field]) === '') {
                throw new Exception("Field '$field' is required");
            }
        }
        
        // Trim and validate
        $data['type'] = trim($data['type']);
        $data['location'] = trim($data['location']);
        
        // Validate type
        if (!in_array($data['type'], ['campus', 'center'])) {
            throw new Exception('Invalid type. Must be "campus" or "center"');
        }
        
        // Validate location
        if (!validateLocation($data['type'], $data['location'])) {
            throw new Exception("Invalid location for the selected type");
        }
        
        // Sanitize text fields
        $title = substr(trim($data['title']), 0, 500);
        $researchers = substr(trim($data['researchers']), 0, 500);
        $description = substr(trim($data['description'] ?? ''), 0, 5000);
        $technology = substr(trim($data['technology'] ?? ''), 0, 5000);
        $number = isset($data['number']) ? substr(trim($data['number']), 0, 50) : '';
        $researchfileId = isset($data['researchfile_id']) && !empty($data['researchfile_id']) ? sanitizeInt($data['researchfile_id']) : null;
        
        // Generate number if not provided
        if (empty($number)) {
            $number = generateProjectNumber($data['type'], $data['location']);
        }
        
        // Validate and sanitize each client
        $validatedClients = [];
        foreach ($clients as $client) {
            if (is_array($client)) {
                $clientName = isset($client['name']) ? substr(trim($client['name']), 0, 255) : '';
                $clientType = isset($client['type']) ? substr(trim($client['type']), 0, 50) : '';
                if (!empty($clientName)) {
                    $validatedClients[] = [
                        'name' => $clientName,
                        'type' => $clientType
                    ];
                }
            } elseif (is_string($client)) {
                $clientName = substr(trim($client), 0, 255);
                if (!empty($clientName)) {
                    $validatedClients[] = [
                        'name' => $clientName,
                        'type' => ''
                    ];
                }
            }
        }
        
        error_log("Validated clients: " . print_r($validatedClients, true));
        
        $clientsJson = json_encode($validatedClients, JSON_UNESCAPED_UNICODE);
        error_log("Clients JSON to save: " . $clientsJson);
        
        // Quarter incomes
        $q1Income = sanitizeDecimal($data['q1Income'] ?? 0);
        $q2Income = sanitizeDecimal($data['q2Income'] ?? 0);
        $q3Income = sanitizeDecimal($data['q3Income'] ?? 0);
        $q4Income = sanitizeDecimal($data['q4Income'] ?? 0);
        
        // Insert
        $query = "INSERT INTO igp_research_projects 
                  (type, location, number, title, researchers, description, technology, 
                   clients, q1_income, q2_income, q3_income, q4_income, researchfile_id) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $db->prepare($query);
        if ($stmt === false) {
            throw new Exception('Database prepare error: ' . $db->error);
        }
        
        $stmt->bind_param(
            'ssssssssddddi',
            $data['type'],
            $data['location'],
            $number,
            $title,
            $researchers,
            $description,
            $technology,
            $clientsJson,
            $q1Income,
            $q2Income,
            $q3Income,
            $q4Income,
            $researchfileId
        );
        
        if ($stmt->execute()) {
            $id = $db->insert_id;
            echo json_encode([
                'success' => true,
                'message' => 'IGP project added successfully',
                'id' => $id,
                'number' => $number
            ]);
        } else {
            throw new Exception('Failed to insert record: ' . $stmt->error);
        }
        $stmt->close();
        
    } catch (Exception $e) {
        error_log("Error in handleAddIGP: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Error adding IGP project: ' . $e->getMessage()
        ]);
    }
}

function handleUpdateIGP($data) {
    try {
        $db = getDb();
        if (!$db) {
            throw new Exception('Database connection not available');
        }
        
        $data = sanitizeArray($data);
        
        $id = isset($data['id']) ? sanitizeInt($data['id']) : 0;
        if ($id <= 0) {
            throw new Exception('Invalid ID provided');
        }
        
        // Validate required fields
        $requiredFields = ['type', 'location', 'title', 'researchers'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field]) || trim($data[$field]) === '') {
                throw new Exception("Field '$field' is required");
            }
        }
        
        // Validate type
        if (!in_array($data['type'], ['campus', 'center'])) {
            throw new Exception('Invalid type. Must be "campus" or "center"');
        }
        
        // Validate location
        if (!validateLocation($data['type'], $data['location'])) {
            throw new Exception('Invalid location for the selected type');
        }
        
        // Sanitize text fields
        $title = substr(trim($data['title']), 0, 500);
        $researchers = substr(trim($data['researchers']), 0, 500);
        $description = substr(trim($data['description'] ?? ''), 0, 5000);
        $technology = substr(trim($data['technology'] ?? ''), 0, 5000);
        $researchfileId = isset($data['researchfile_id']) && !empty($data['researchfile_id']) ? sanitizeInt($data['researchfile_id']) : null;
        
        // ========== FIX: Handle clients properly ==========
        $clients = isset($data['clients']) ? $data['clients'] : [];
        
        if (is_string($clients)) {
            $decoded = json_decode($clients, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $clients = $decoded;
            } else {
                $clients = [];
            }
        }
        
        if (!is_array($clients)) {
            $clients = [];
        }
        
        $validatedClients = [];
        foreach ($clients as $client) {
            if (is_array($client)) {
                $clientName = isset($client['name']) ? substr(trim($client['name']), 0, 255) : '';
                $clientType = isset($client['type']) ? substr(trim($client['type']), 0, 50) : '';
                if (!empty($clientName)) {
                    $validatedClients[] = [
                        'name' => $clientName,
                        'type' => $clientType
                    ];
                }
            } elseif (is_string($client)) {
                $clientName = substr(trim($client), 0, 255);
                if (!empty($clientName)) {
                    $validatedClients[] = [
                        'name' => $clientName,
                        'type' => ''
                    ];
                }
            }
        }
        
        $clientsJson = json_encode($validatedClients, JSON_UNESCAPED_UNICODE);
        
        // Quarter incomes
        $q1Income = sanitizeDecimal($data['q1Income'] ?? 0);
        $q2Income = sanitizeDecimal($data['q2Income'] ?? 0);
        $q3Income = sanitizeDecimal($data['q3Income'] ?? 0);
        $q4Income = sanitizeDecimal($data['q4Income'] ?? 0);
        
        // Update
        $query = "UPDATE igp_research_projects 
                  SET type = ?, location = ?, title = ?, researchers = ?, 
                      description = ?, technology = ?, clients = ?,
                      q1_income = ?, q2_income = ?, q3_income = ?, q4_income = ?,
                      researchfile_id = ?,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE id = ?";
        
        $stmt = $db->prepare($query);
        if ($stmt === false) {
            throw new Exception('Database prepare error: ' . $db->error);
        }
        
        $stmt->bind_param(
            'sssssssddddii',
            $data['type'],
            $data['location'],
            $title,
            $researchers,
            $description,
            $technology,
            $clientsJson,
            $q1Income,
            $q2Income,
            $q3Income,
            $q4Income,
            $researchfileId,
            $id
        );
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'IGP project updated successfully'
            ]);
        } else {
            throw new Exception('Failed to update record: ' . $stmt->error);
        }
        $stmt->close();
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error updating IGP project: ' . $e->getMessage()
        ]);
    }
}

function handleDeleteIGP($data) {
    try {
        $db = getDb();
        if (!$db) {
            throw new Exception('Database connection not available');
        }
        
        $id = isset($data['id']) ? sanitizeInt($data['id']) : 0;
        
        if ($id <= 0) {
            throw new Exception('Invalid ID provided');
        }
        
        $query = "DELETE FROM igp_research_projects WHERE id = ?";
        $stmt = $db->prepare($query);
        if ($stmt === false) {
            throw new Exception('Database prepare error: ' . $db->error);
        }
        
        $stmt->bind_param('i', $id);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'IGP project deleted successfully'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Record not found'
                ]);
            }
        } else {
            throw new Exception('Failed to delete record: ' . $stmt->error);
        }
        $stmt->close();
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting IGP project: ' . $e->getMessage()
        ]);
    }
}

function generateProjectNumber($type, $location) {
    try {
        $db = getDb();
        if (!$db) {
            return 'IGP-' . date('YmdHis') . '-' . rand(1000, 9999);
        }
        
        if (!in_array($type, ['campus', 'center'])) {
            return 'IGP-' . date('YmdHis') . '-' . rand(1000, 9999);
        }
        
        $query = "SELECT COUNT(*) as count FROM igp_research_projects WHERE type = ? AND location = ?";
        $stmt = $db->prepare($query);
        if ($stmt === false) {
            return 'IGP-' . date('YmdHis') . '-' . rand(1000, 9999);
        }
        
        $stmt->bind_param('ss', $type, $location);
        $stmt->execute();
        $result = $stmt->get_result();
        $count = $result->fetch_assoc()['count'] + 1;
        $stmt->close();
        
        $year = date('Y');
        $locationAbbr = getLocationAbbreviation($location);
        $typeAbbr = $type === 'campus' ? 'CMP' : 'CTR';
        $sequence = str_pad($count, 4, '0', STR_PAD_LEFT);
        
        return $locationAbbr . '-' . $typeAbbr . '-' . $year . '-' . $sequence;
        
    } catch (Exception $e) {
        return 'IGP-' . date('YmdHis') . '-' . rand(1000, 9999);
    }
}

function getLocationAbbreviation($location) {
    $abbreviations = [
        'Roxas City Main' => 'RCM',
        'Tapaz' => 'TAP',
        'Burias' => 'BUR',
        'Dumarao' => 'DUM',
        'Pontevedra' => 'PON',
        'Mambusao' => 'MAM',
        'Sigma' => 'SIG',
        'Pilar' => 'PIL',
        'Dayao' => 'DAY',
        'Crop Science Research & Development Center (CSRDC)' => 'CSRDC',
        'Livestock Research & Development Center (LRDC)' => 'LRDC',
        'Fisheries Research & Development Center (FRDC)' => 'FRDC',
        'Food and Industrial Technology Research & Development Center (FITRDC)' => 'FITRDC',
        'Social Science Research & Development Center (SSRDC)' => 'SSRDC',
        'Machinery and Agricultural Technology Engineering Center (MATEC)' => 'MATEC',
        'Coconut Research and Development Center (Coco RDC)' => 'COCO-RDC',
        'Extension' => 'EXT'
    ];
    
    return $abbreviations[$location] ?? substr(preg_replace('/[^A-Za-z]/', '', $location), 0, 4);
}

function logError($message, $data = null) {
    $logEntry = date('Y-m-d H:i:s') . " - ERROR: " . $message;
    if ($data !== null) {
        $logEntry .= " - Data: " . print_r($data, true);
    }
    error_log($logEntry);
}