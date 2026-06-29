<?php
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 0);

session_start();
require_once __DIR__ . '/../../db.php';

$response = [
    'status' => false,
    'message' => '',
    'data' => []
];

try {
    $con = new mysqli($host, $username, $pass, $dbName);
    
    if ($con->connect_error) {
        throw new Exception("Database connection failed: " . $con->connect_error);
    }
    
    $action = $_POST['action'] ?? $_GET['action'] ?? '';
    
    if ($action === 'trainingConducted') {
        // Get filter parameters
        $filterType = $_POST['type'] ?? $_GET['type'] ?? 'All'; // 'All', 'campus', 'center'
        $filterLocation = $_POST['location'] ?? $_GET['location'] ?? ''; // specific campus or center name
        
        // Base query for conducted trainings
        $query = "SELECT COUNT(id) as total FROM conducted_trainings WHERE 1=1";
        $params = [];
        $types = "";
        
        // Apply type filter
        if ($filterType !== 'All' && in_array($filterType, ['campus', 'center'])) {
            $query .= " AND type = ?";
            $params[] = $filterType;
            $types .= "s";
        }
        
        // Apply location filter
        if (!empty($filterLocation) && $filterLocation !== 'All') {
            $query .= " AND location = ?";
            $params[] = $filterLocation;
            $types .= "s";
        }
        
        $stmt = $con->prepare($query);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        $totalCount = (int)($row['total'] ?? 0);
        
        $response['status'] = true;
        $response['message'] = 'Training conducted count retrieved successfully';
        $response['data'] = [
            'count' => $totalCount,
            'filters_applied' => [
                'type' => $filterType,
                'location' => $filterLocation
            ]
        ];
        
        $stmt->close();
        
    } elseif ($action === 'countAttendedTrainings') {
        // Get filter parameters
        $filterType = $_POST['type'] ?? $_GET['type'] ?? 'All'; // 'All', 'campus', 'center'
        $filterLocation = $_POST['location'] ?? $_GET['location'] ?? ''; // specific campus or center name
        
        // Base query for attended trainings
        $query = "SELECT COUNT(id) as total FROM attended_trainings WHERE 1=1";
        $params = [];
        $types = "";
        
        // Apply type filter
        if ($filterType !== 'All' && in_array($filterType, ['campus', 'center'])) {
            $query .= " AND type = ?";
            $params[] = $filterType;
            $types .= "s";
        }
        
        // Apply location filter
        if (!empty($filterLocation) && $filterLocation !== 'All') {
            $query .= " AND location = ?";
            $params[] = $filterLocation;
            $types .= "s";
        }
        
        $stmt = $con->prepare($query);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        $totalCount = (int)($row['total'] ?? 0);
        
        // If filtering by type, also get counts per location
        $locationBreakdown = [];
        if (!empty($filterType) && $filterType !== 'All') {
            $breakdownQuery = "SELECT location, COUNT(id) as count FROM attended_trainings WHERE type = ?";
            $breakdownParams = [$filterType];
            $breakdownTypes = "s";
            
            if (!empty($filterLocation) && $filterLocation !== 'All') {
                $breakdownQuery .= " AND location = ?";
                $breakdownParams[] = $filterLocation;
                $breakdownTypes .= "s";
            }
            
            $breakdownQuery .= " GROUP BY location ORDER BY count DESC";
            
            $breakdownStmt = $con->prepare($breakdownQuery);
            $breakdownStmt->bind_param($breakdownTypes, ...$breakdownParams);
            $breakdownStmt->execute();
            $breakdownResult = $breakdownStmt->get_result();
            
            while ($locationRow = $breakdownResult->fetch_assoc()) {
                $locationBreakdown[] = [
                    'location' => $locationRow['location'],
                    'count' => (int)$locationRow['count']
                ];
            }
            
            $breakdownStmt->close();
        }
        
        $response['status'] = true;
        $response['message'] = 'Attended trainings count retrieved successfully';
        $response['data'] = [
            'total' => $totalCount,
            'location_breakdown' => $locationBreakdown,
            'filters_applied' => [
                'type' => $filterType,
                'location' => $filterLocation
            ]
        ];
        
        $stmt->close();
        
    } elseif ($action === 'bothCounts') {
        // Get counts for both conducted and attended trainings
        $filterType = $_POST['type'] ?? $_GET['type'] ?? 'All';
        $filterLocation = $_POST['location'] ?? $_GET['location'] ?? '';
        
        // Conducted trainings count
        $conductedQuery = "SELECT COUNT(id) as total FROM conducted_trainings WHERE 1=1";
        $conductedParams = [];
        $conductedTypes = "";
        
        if ($filterType !== 'All' && in_array($filterType, ['campus', 'center'])) {
            $conductedQuery .= " AND type = ?";
            $conductedParams[] = $filterType;
            $conductedTypes .= "s";
        }
        
        if (!empty($filterLocation) && $filterLocation !== 'All') {
            $conductedQuery .= " AND location = ?";
            $conductedParams[] = $filterLocation;
            $conductedTypes .= "s";
        }
        
        $conductedStmt = $con->prepare($conductedQuery);
        if (!empty($conductedParams)) {
            $conductedStmt->bind_param($conductedTypes, ...$conductedParams);
        }
        $conductedStmt->execute();
        $conductedResult = $conductedStmt->get_result();
        $conductedRow = $conductedResult->fetch_assoc();
        
        // Attended trainings count
        $attendedQuery = "SELECT COUNT(id) as total FROM attended_trainings WHERE 1=1";
        $attendedParams = [];
        $attendedTypes = "";
        
        if ($filterType !== 'All' && in_array($filterType, ['campus', 'center'])) {
            $attendedQuery .= " AND type = ?";
            $attendedParams[] = $filterType;
            $attendedTypes .= "s";
        }
        
        if (!empty($filterLocation) && $filterLocation !== 'All') {
            $attendedQuery .= " AND location = ?";
            $attendedParams[] = $filterLocation;
            $attendedTypes .= "s";
        }
        
        $attendedStmt = $con->prepare($attendedQuery);
        if (!empty($attendedParams)) {
            $attendedStmt->bind_param($attendedTypes, ...$attendedParams);
        }
        $attendedStmt->execute();
        $attendedResult = $attendedStmt->get_result();
        $attendedRow = $attendedResult->fetch_assoc();
        
        $response['status'] = true;
        $response['message'] = 'Both training counts retrieved successfully';
        $response['data'] = [
            'conducted' => (int)($conductedRow['total'] ?? 0),
            'attended' => (int)($attendedRow['total'] ?? 0),
            'filters_applied' => [
                'type' => $filterType,
                'location' => $filterLocation
            ]
        ];
        
        $conductedStmt->close();
        $attendedStmt->close();
        
    } else {
        $response['message'] = 'Invalid action. Use action=trainingConducted, action=countAttendedTrainings, or action=bothCounts';
    }
    
    $con->close();
    
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    error_log("summaryAccomplishment.php error: " . $e->getMessage());
}

echo json_encode($response);
exit();