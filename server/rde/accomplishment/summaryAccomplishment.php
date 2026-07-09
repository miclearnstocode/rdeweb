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
    $filterType = $_POST['type'] ?? $_GET['type'] ?? 'All';
    $filterLocation = $_POST['location'] ?? $_GET['location'] ?? '';
    
    // ========== CONDUCTED TRAININGS COUNT ==========
    if ($action === 'conductedCount') {
        $query = "SELECT COUNT(id) as total FROM conducted_trainings WHERE 1=1";
        $params = [];
        $types = "";
        
        if ($filterType !== 'All' && in_array($filterType, ['campus', 'center'])) {
            $query .= " AND type = ?";
            $params[] = $filterType;
            $types .= "s";
        }
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
        $count = (int)($row['total'] ?? 0);
        $stmt->close();
        
        $response['status'] = true;
        $response['message'] = 'Conducted trainings count retrieved successfully';
        $response['data'] = ['conducted' => $count];
        
    // ========== ATTENDED TRAININGS COUNT ==========
    } elseif ($action === 'attendedCount') {
        $query = "SELECT COUNT(id) as total FROM attended_trainings WHERE 1=1";
        $params = [];
        $types = "";
        
        if ($filterType !== 'All' && in_array($filterType, ['campus', 'center'])) {
            $query .= " AND type = ?";
            $params[] = $filterType;
            $types .= "s";
        }
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
        $count = (int)($row['total'] ?? 0);
        $stmt->close();
        
        $response['status'] = true;
        $response['message'] = 'Attended trainings count retrieved successfully';
        $response['data'] = ['attended' => $count];
        
    // ========== BOTH COUNTS (Conducted + Attended) ==========
    } elseif ($action === 'bothCounts') {
        // Conducted trainings
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
        $conductedCount = (int)($conductedRow['total'] ?? 0);
        $conductedStmt->close();
        
        // Attended trainings
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
        $attendedCount = (int)($attendedRow['total'] ?? 0);
        $attendedStmt->close();
        
        $response['status'] = true;
        $response['message'] = 'Training counts retrieved successfully';
        $response['data'] = [
            'conducted' => $conductedCount,
            'attended' => $attendedCount
        ];
        
    // ========== IGP COUNT ==========
    } elseif ($action === 'igpCount') {
        $query = "SELECT COUNT(id) as total FROM igp_research_projects WHERE 1=1";
        $params = [];
        $types = "";
        
        if ($filterType !== 'All' && in_array($filterType, ['campus', 'center'])) {
            $query .= " AND type = ?";
            $params[] = $filterType;
            $types .= "s";
        }
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
        $count = (int)($row['total'] ?? 0);
        $stmt->close();
        
        $response['status'] = true;
        $response['message'] = 'IGP count retrieved successfully';
        $response['data'] = ['igpResearch' => $count];
        
    // ========== PARTICIPATION COUNT ==========
    } elseif ($action === 'participationCount') {
        $query = "SELECT COUNT(id) as total FROM participation_research WHERE 1=1";
        $params = [];
        $types = "";
        
        if ($filterType !== 'All' && in_array($filterType, ['campus', 'center'])) {
            $query .= " AND type = ?";
            $params[] = $filterType;
            $types .= "s";
        }
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
        $count = (int)($row['total'] ?? 0);
        $stmt->close();
        
        $response['status'] = true;
        $response['message'] = 'Participation count retrieved successfully';
        $response['data'] = ['participation' => $count];
        
    // ========== FACILITIES IMPROVEMENT COUNT ==========
    } elseif ($action === 'facilitiesCount') {
        $query = "SELECT COUNT(id) as total FROM lab_facility WHERE 1=1";
        $params = [];
        $types = "";
        
        if ($filterType !== 'All' && in_array($filterType, ['campus', 'center'])) {
            $query .= " AND type = ?";
            $params[] = $filterType;
            $types .= "s";
        }
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
        $count = (int)($row['total'] ?? 0);
        $stmt->close();
        
        $response['status'] = true;
        $response['message'] = 'Facilities improvement count retrieved successfully';
        $response['data'] = ['facilities' => $count];
        
    // ========== FACULTY PRESENTATIONS COUNT ==========
    } elseif ($action === 'presentationCount') {
        $query = "SELECT COUNT(id) as total FROM faculty_presentations";
        $stmt = $con->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $count = (int)($row['total'] ?? 0);
        $stmt->close();
        
        $response['status'] = true;
        $response['message'] = 'Faculty presentations count retrieved successfully';
        $response['data'] = ['presentations' => $count];
        
    // ========== PUBLICATIONS COUNT ==========
    } elseif ($action === 'publicationCount') {
        $query = "SELECT COUNT(id) as total FROM publications";
        $stmt = $con->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $count = (int)($row['total'] ?? 0);
        $stmt->close();
        
        $response['status'] = true;
        $response['message'] = 'Publications count retrieved successfully';
        $response['data'] = ['publications' => $count];
        
    // ========== CITATIONS COUNT ==========
    } elseif ($action === 'citationsCount') {
        $query = "SELECT COUNT(id) as total FROM research_citations";
        $stmt = $con->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $count = (int)($row['total'] ?? 0);
        $stmt->close();
        
        $response['status'] = true;
        $response['message'] = 'Research citations count retrieved successfully';
        $response['data'] = ['citations' => $count];
        
    // ========== IP ASSETS COUNT ==========
    } elseif ($action === 'ipAssetsCount') {
        $query = "SELECT COUNT(id) as total FROM ip_assets";
        $stmt = $con->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $count = (int)($row['total'] ?? 0);
        $stmt->close();
        
        $response['status'] = true;
        $response['message'] = 'IP Assets count retrieved successfully';
        $response['data'] = ['ipAssets' => $count];
        
    // ========== FETCH ALL SUMMARY COUNTS ==========
    } elseif ($action === 'fetch') {
        // Get all counts from individual queries
        // Conducted trainings
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
        $conductedCount = (int)($conductedRow['total'] ?? 0);
        $conductedStmt->close();
        
        // Attended trainings
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
        $attendedCount = (int)($attendedRow['total'] ?? 0);
        $attendedStmt->close();
        
        // IGP
        $igpQuery = "SELECT COUNT(id) as total FROM igp_research_projects WHERE 1=1";
        $igpParams = [];
        $igpTypes = "";
        
        if ($filterType !== 'All' && in_array($filterType, ['campus', 'center'])) {
            $igpQuery .= " AND type = ?";
            $igpParams[] = $filterType;
            $igpTypes .= "s";
        }
        if (!empty($filterLocation) && $filterLocation !== 'All') {
            $igpQuery .= " AND location = ?";
            $igpParams[] = $filterLocation;
            $igpTypes .= "s";
        }
        
        $igpStmt = $con->prepare($igpQuery);
        if (!empty($igpParams)) {
            $igpStmt->bind_param($igpTypes, ...$igpParams);
        }
        $igpStmt->execute();
        $igpResult = $igpStmt->get_result();
        $igpRow = $igpResult->fetch_assoc();
        $igpCount = (int)($igpRow['total'] ?? 0);
        $igpStmt->close();
        
        // Participation
        $participationQuery = "SELECT COUNT(id) as total FROM participation_research WHERE 1=1";
        $participationParams = [];
        $participationTypes = "";
        
        if ($filterType !== 'All' && in_array($filterType, ['campus', 'center'])) {
            $participationQuery .= " AND type = ?";
            $participationParams[] = $filterType;
            $participationTypes .= "s";
        }
        if (!empty($filterLocation) && $filterLocation !== 'All') {
            $participationQuery .= " AND location = ?";
            $participationParams[] = $filterLocation;
            $participationTypes .= "s";
        }
        
        $participationStmt = $con->prepare($participationQuery);
        if (!empty($participationParams)) {
            $participationStmt->bind_param($participationTypes, ...$participationParams);
        }
        $participationStmt->execute();
        $participationResult = $participationStmt->get_result();
        $participationRow = $participationResult->fetch_assoc();
        $participationCount = (int)($participationRow['total'] ?? 0);
        $participationStmt->close();
        
        // Facilities
        $facilitiesQuery = "SELECT COUNT(id) as total FROM lab_facility WHERE 1=1";
        $facilitiesParams = [];
        $facilitiesTypes = "";
        
        if ($filterType !== 'All' && in_array($filterType, ['campus', 'center'])) {
            $facilitiesQuery .= " AND type = ?";
            $facilitiesParams[] = $filterType;
            $facilitiesTypes .= "s";
        }
        if (!empty($filterLocation) && $filterLocation !== 'All') {
            $facilitiesQuery .= " AND location = ?";
            $facilitiesParams[] = $filterLocation;
            $facilitiesTypes .= "s";
        }
        
        $facilitiesStmt = $con->prepare($facilitiesQuery);
        if (!empty($facilitiesParams)) {
            $facilitiesStmt->bind_param($facilitiesTypes, ...$facilitiesParams);
        }
        $facilitiesStmt->execute();
        $facilitiesResult = $facilitiesStmt->get_result();
        $facilitiesRow = $facilitiesResult->fetch_assoc();
        $facilitiesCount = (int)($facilitiesRow['total'] ?? 0);
        $facilitiesStmt->close();
        
        // Faculty Presentations
        $presentationQuery = "SELECT COUNT(id) as total FROM faculty_presentations";
        $presentationStmt = $con->prepare($presentationQuery);
        $presentationStmt->execute();
        $presentationResult = $presentationStmt->get_result();
        $presentationRow = $presentationResult->fetch_assoc();
        $presentationCount = (int)($presentationRow['total'] ?? 0);
        $presentationStmt->close();
        
        // Publications
        $publicationQuery = "SELECT COUNT(id) as total FROM publications";
        $publicationStmt = $con->prepare($publicationQuery);
        $publicationStmt->execute();
        $publicationResult = $publicationStmt->get_result();
        $publicationRow = $publicationResult->fetch_assoc();
        $publicationCount = (int)($publicationRow['total'] ?? 0);
        $publicationStmt->close();
        
        // Citations
        $citationsQuery = "SELECT COUNT(id) as total FROM research_citations";
        $citationsStmt = $con->prepare($citationsQuery);
        $citationsStmt->execute();
        $citationsResult = $citationsStmt->get_result();
        $citationsRow = $citationsResult->fetch_assoc();
        $citationsCount = (int)($citationsRow['total'] ?? 0);
        $citationsStmt->close();
        
        // IP Assets
        $ipAssetsQuery = "SELECT COUNT(id) as total FROM ip_assets";
        $ipAssetsStmt = $con->prepare($ipAssetsQuery);
        $ipAssetsStmt->execute();
        $ipAssetsResult = $ipAssetsStmt->get_result();
        $ipAssetsRow = $ipAssetsResult->fetch_assoc();
        $ipAssetsCount = (int)($ipAssetsRow['total'] ?? 0);
        $ipAssetsStmt->close();
        
        $response['status'] = true;
        $response['message'] = 'All summary data retrieved successfully';
        $response['summary'] = [
            'igpResearch' => $igpCount,
            'conductedResearch' => $conductedCount,
            'trainingsAttended' => $attendedCount,
            'participationResearch' => $participationCount,
            'facilitiesImprovement' => $facilitiesCount,
            'facultyPresentation' => $presentationCount,
            'publicationResearch' => $publicationCount,
            'citationsResearch' => $citationsCount,
            'ipAssets' => $ipAssetsCount
        ];
        $response['filters'] = [
            'type' => $filterType,
            'location' => $filterLocation
        ];
        
    } else {
        $response['message'] = 'Invalid action. Available actions: conductedCount, attendedCount, bothCounts, igpCount, participationCount, facilitiesCount, presentationCount, publicationCount, citationsCount, ipAssetsCount, fetch';
    }
    
    $con->close();
    
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    error_log("summaryAccomplishment.php error: " . $e->getMessage());
}

echo json_encode($response);
exit();