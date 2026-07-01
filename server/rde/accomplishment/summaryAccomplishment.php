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
    
    // ========== BOTH COUNTS ACTION (Trainings only) ==========
    if ($action === 'bothCounts') {
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
            'attended' => $attendedCount,
            'filters_applied' => [
                'type' => $filterType,
                'location' => $filterLocation
            ]
        ];
        
    // ========== IGP COUNT ACTION ==========
    } elseif ($action === 'igpCount') {
        $igpQuery = "SELECT COUNT(id) as total FROM igp_research_projects";
        $igpParams = [];
        $igpTypes = "";
        $igpWhere = [];
        
        if ($filterType !== 'All' && in_array($filterType, ['campus', 'center'])) {
            $igpWhere[] = "type = ?";
            $igpParams[] = $filterType;
            $igpTypes .= "s";
        }
        
        if (!empty($filterLocation) && $filterLocation !== 'All') {
            $igpWhere[] = "location = ?";
            $igpParams[] = $filterLocation;
            $igpTypes .= "s";
        }
        
        if (!empty($igpWhere)) {
            $igpQuery .= " WHERE " . implode(" AND ", $igpWhere);
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
        
        $response['status'] = true;
        $response['message'] = 'IGP count retrieved successfully';
        $response['data'] = [
            'igpResearch' => $igpCount,
            'filters_applied' => [
                'type' => $filterType,
                'location' => $filterLocation
            ]
        ];
        
    // ========== FETCH SUMMARY ACTION (without ongoing/completed) ==========
    } elseif ($action === 'fetch') {
        // Get IGP Count with filters
        $igpQuery = "SELECT COUNT(id) as total FROM igp_research_projects";
        $igpParams = [];
        $igpTypes = "";
        $igpWhere = [];
        
        if ($filterType !== 'All' && in_array($filterType, ['campus', 'center'])) {
            $igpWhere[] = "type = ?";
            $igpParams[] = $filterType;
            $igpTypes .= "s";
        }
        
        if (!empty($filterLocation) && $filterLocation !== 'All') {
            $igpWhere[] = "location = ?";
            $igpParams[] = $filterLocation;
            $igpTypes .= "s";
        }
        
        if (!empty($igpWhere)) {
            $igpQuery .= " WHERE " . implode(" AND ", $igpWhere);
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
        
        // Get Training counts
        $trainingQuery = "SELECT 
                            (SELECT COUNT(id) FROM conducted_trainings) as conducted,
                            (SELECT COUNT(id) FROM attended_trainings) as attended";
        $trainingStmt = $con->prepare($trainingQuery);
        $trainingStmt->execute();
        $trainingResult = $trainingStmt->get_result();
        $trainingRow = $trainingResult->fetch_assoc();
        $conductedCount = (int)($trainingRow['conducted'] ?? 0);
        $attendedCount = (int)($trainingRow['attended'] ?? 0);
        $trainingStmt->close();
        
        // Get Participation Research Count
        $participationQuery = "SELECT COUNT(id) as total FROM participation_research";
        $participationStmt = $con->prepare($participationQuery);
        $participationStmt->execute();
        $participationResult = $participationStmt->get_result();
        $participationRow = $participationResult->fetch_assoc();
        $participationCount = (int)($participationRow['total'] ?? 0);
        $participationStmt->close();
        
        // Get Facilities Improvement Count
        $facilitiesQuery = "SELECT COUNT(id) as total FROM facilities_improvement";
        $facilitiesStmt = $con->prepare($facilitiesQuery);
        $facilitiesStmt->execute();
        $facilitiesResult = $facilitiesStmt->get_result();
        $facilitiesRow = $facilitiesResult->fetch_assoc();
        $facilitiesCount = (int)($facilitiesRow['total'] ?? 0);
        $facilitiesStmt->close();
        
        // Get Faculty Presentations Count
        $presentationQuery = "SELECT COUNT(id) as total FROM faculty_presentations";
        $presentationStmt = $con->prepare($presentationQuery);
        $presentationStmt->execute();
        $presentationResult = $presentationStmt->get_result();
        $presentationRow = $presentationResult->fetch_assoc();
        $presentationCount = (int)($presentationRow['total'] ?? 0);
        $presentationStmt->close();
        
        // Get Publications Count
        $publicationQuery = "SELECT COUNT(id) as total FROM publications";
        $publicationStmt = $con->prepare($publicationQuery);
        $publicationStmt->execute();
        $publicationResult = $publicationStmt->get_result();
        $publicationRow = $publicationResult->fetch_assoc();
        $publicationCount = (int)($publicationRow['total'] ?? 0);
        $publicationStmt->close();
        
        // Get Research Citations Count
        $citationsQuery = "SELECT COUNT(id) as total FROM research_citations";
        $citationsStmt = $con->prepare($citationsQuery);
        $citationsStmt->execute();
        $citationsResult = $citationsStmt->get_result();
        $citationsRow = $citationsResult->fetch_assoc();
        $citationsCount = (int)($citationsRow['total'] ?? 0);
        $citationsStmt->close();
        
        // Get IP Assets Count
        $ipAssetsQuery = "SELECT COUNT(id) as total FROM ip_assets";
        $ipAssetsStmt = $con->prepare($ipAssetsQuery);
        $ipAssetsStmt->execute();
        $ipAssetsResult = $ipAssetsStmt->get_result();
        $ipAssetsRow = $ipAssetsResult->fetch_assoc();
        $ipAssetsCount = (int)($ipAssetsRow['total'] ?? 0);
        $ipAssetsStmt->close();
        
        $response['status'] = true;
        $response['message'] = 'Summary data retrieved successfully';
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
        $response['message'] = 'Invalid action. Available: bothCounts, igpCount, fetch';
    }
    
    $con->close();
    
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    error_log("summaryAccomplishment.php error: " . $e->getMessage());
}

echo json_encode($response);
exit();