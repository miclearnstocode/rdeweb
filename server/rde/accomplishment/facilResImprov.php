<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/facilities_errors.log');

header('Content-Type: application/json; charset=utf-8');

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

require_once __DIR__ . '/../../db.php';


try {
    if (!$conn || !($conn instanceof mysqli)) {
        throw new Exception('Database connection failed');
    }

    $action = isset($_POST['action']) ? $_POST['action'] : '';

    switch ($action) {
        case 'fetch_facility':
            handleFetchFacility($conn);
            break;
            
        case 'add_facility':
            handleAddFacility($conn);
            break;
            
        case 'update_facility':
            handleUpdateFacility($conn);
            break;
            
        case 'delete_facility':
            handleDeleteFacility($conn);
            break;
            
        default:
            handleFetchLaboratory($conn);
            break;
    }
} catch (Exception $e) {
    error_log('Facilities API Error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}


function handleFetchFacility($conn) {
    try {
        $campus = isset($_POST['campus']) ? trim($_POST['campus']) : '';
        $center = isset($_POST['center']) ? trim($_POST['center']) : '';
        $fundingType = isset($_POST['fundingType']) ? trim($_POST['fundingType']) : '';
        $cursor = isset($_POST['cursor']) ? intval($_POST['cursor']) : 0;
        $limit = 50;

        // Build the WHERE clause
        $whereClauses = [];
        $params = [];
        $types = "";

        if (!empty($campus)) {
            $whereClauses[] = "type = 'campus' AND location = ?";
            $params[] = $campus;
            $types .= "s";
        }

        if (!empty($center)) {
            $whereClauses[] = "type = 'center' AND location = ?";
            $params[] = $center;
            $types .= "s";
        }

        if (!empty($fundingType)) {
            if ($fundingType === 'Internal') {
                $whereClauses[] = "internal_funding > 0";
            } elseif ($fundingType === 'External') {
                $whereClauses[] = "external_funding > 0";
            }
        }

        $whereSQL = !empty($whereClauses) ? 'WHERE ' . implode(' AND ', $whereClauses) : '';

        // Get total count
        $countSQL = "SELECT COUNT(*) as total FROM lab_facility $whereSQL";
        $countStmt = $conn->prepare($countSQL);
        
        if (!empty($params)) {
            $countStmt->bind_param($types, ...$params);
        }
        
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $totalCount = $countResult->fetch_assoc()['total'];
        $countStmt->close();

        // Get data with pagination
        $offset = $cursor;
        $dataSQL = "SELECT 
            id,
            type,
            location,
            laboratory_type,
            facilities,
            total_units,
            date_acquired,
            internal_funding,
            external_funding,
            sponsoring_agency,
            purpose
        FROM lab_facility 
        $whereSQL 
        ORDER BY id ASC 
        LIMIT ? OFFSET ?";

        $stmt = $conn->prepare($dataSQL);
        
        // Bind parameters
        if (!empty($params)) {
            $stmt->bind_param($types . "ii", ...array_merge($params, [$limit, $offset]));
        } else {
            $stmt->bind_param("ii", $limit, $offset);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();

        $data = [];
        while ($row = $result->fetch_assoc()) {
            // Format the data to match frontend expectations
            $data[] = [
                'id' => $row['id'],
                'type' => $row['type'],
                'location' => $row['location'],
                'laboratoryType' => $row['laboratory_type'],
                'facilities' => $row['facilities'],
                'totalUnits' => intval($row['total_units']),
                'dateAcquired' => $row['date_acquired'],
                'internalFunding' => floatval($row['internal_funding']),
                'externalFunding' => floatval($row['external_funding']),
                'sponsoringAgency' => $row['sponsoring_agency'],
                'purpose' => $row['purpose']
            ];
        }
        $stmt->close();

        // Get summary statistics
        $summary = getSummaryStats($conn, $whereSQL, $params, $types);

        // Determine if there are more records
        $hasMore = ($offset + $limit) < $totalCount;
        $nextCursor = $hasMore ? ($offset + $limit) : null;

        echo json_encode([
            'success' => true,
            'data' => $data,
            'summary' => $summary,
            'pagination' => [
                'has_more' => $hasMore,
                'next_cursor' => $nextCursor,
                'total' => $totalCount,
                'limit' => $limit,
                'offset' => $offset
            ]
        ]);

    } catch (Exception $e) {
        error_log('Error in handleFetchFacilities: ' . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch facilities: ' . $e->getMessage()
        ]);
    }
}

function getSummaryStats($conn, $whereSQL, $params = [], $types = '') {
    try {
        $statsSQL = "SELECT 
            COUNT(*) as total_facilities,
            SUM(total_units) as total_equipment,
            SUM(internal_funding) as internal_funding,
            SUM(external_funding) as external_funding,
            SUM(total_units) as total_units
        FROM lab_facility 
        $whereSQL";

        $stmt = $conn->prepare($statsSQL);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $stats = $result->fetch_assoc();
        $stmt->close();

        return [
            'totalFacilities' => intval($stats['total_facilities'] ?? 0),
            'totalEquipment' => intval($stats['total_equipment'] ?? 0),
            'internalFunding' => floatval($stats['internal_funding'] ?? 0),
            'externalFunding' => floatval($stats['external_funding'] ?? 0),
            'totalUnits' => intval($stats['total_units'] ?? 0)
        ];
    } catch (Exception $e) {
        error_log('Error in getSummaryStats: ' . $e->getMessage());
        return [
            'totalFacilities' => 0,
            'totalEquipment' => 0,
            'internalFunding' => 0,
            'externalFunding' => 0,
            'totalUnits' => 0
        ];
    }
}

function handleAddFacility($conn) {
    try {
        // Validate required fields
        $type = isset($_POST['type']) ? trim($_POST['type']) : '';
        $location = isset($_POST['location']) ? trim($_POST['location']) : '';
        $purpose = isset($_POST['purpose']) ? trim($_POST['purpose']) : '';
        
        if (empty($type) || empty($location)) {
            echo json_encode([
                'success' => false,
                'message' => 'Type and Location are required'
            ]);
            return;
        }

        // Get other fields
        $laboratoryType = isset($_POST['laboratoryType']) ? trim($_POST['laboratoryType']) : null;
        $facilities = isset($_POST['facilities']) ? $_POST['facilities'] : null;
        $dateAcquired = isset($_POST['dateAcquired']) && !empty($_POST['dateAcquired']) ? $_POST['dateAcquired'] : null;
        $internalFunding = isset($_POST['internalFunding']) && !empty($_POST['internalFunding']) ? floatval($_POST['internalFunding']) : 0;
        $externalFunding = isset($_POST['externalFunding']) && !empty($_POST['externalFunding']) ? floatval($_POST['externalFunding']) : 0;
        $sponsoringAgency = isset($_POST['sponsoringAgency']) ? trim($_POST['sponsoringAgency']) : null;

        // Calculate total units from facilities JSON
        $totalUnits = 0;
        if ($facilities) {
            $facilitiesArray = json_decode($facilities, true);
            if (is_array($facilitiesArray)) {
                foreach ($facilitiesArray as $facility) {
                    $units = isset($facility['units']) ? intval($facility['units']) : 0;
                    $totalUnits += $units;
                }
            }
        }

        $sql = "INSERT INTO lab_facility (
            type,
            location,
            laboratory_type,
            facilities,
            total_units,
            date_acquired,
            internal_funding,
            external_funding,
            sponsoring_agency,
            purpose
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $stmt->bind_param(
            "ssssisddss",
            $type,
            $location,
            $laboratoryType,
            $facilities,
            $totalUnits,
            $dateAcquired,
            $internalFunding,
            $externalFunding,
            $sponsoringAgency,
            $purpose
        );

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Facility added successfully',
                'id' => $stmt->insert_id
            ]);
        } else {
            throw new Exception('Failed to insert: ' . $stmt->error);
        }
        
        $stmt->close();
    } catch (Exception $e) {
        error_log('Error in handleAddFacility: ' . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Failed to add facility: ' . $e->getMessage()
        ]);
    }
}

function handleUpdateFacility($conn) {
    try {
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        
        if ($id <= 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid facility ID'
            ]);
            return;
        }

        // Validate required fields
        $type = isset($_POST['type']) ? trim($_POST['type']) : '';
        $location = isset($_POST['location']) ? trim($_POST['location']) : '';
        $purpose = isset($_POST['purpose']) ? trim($_POST['purpose']) : '';
        
        if (empty($type) || empty($location)) {
            echo json_encode([
                'success' => false,
                'message' => 'Type and Location are required'
            ]);
            return;
        }

        // Get other fields
        $laboratoryType = isset($_POST['laboratoryType']) ? trim($_POST['laboratoryType']) : null;
        $facilities = isset($_POST['facilities']) ? $_POST['facilities'] : null;
        $dateAcquired = isset($_POST['dateAcquired']) && !empty($_POST['dateAcquired']) ? $_POST['dateAcquired'] : null;
        $internalFunding = isset($_POST['internalFunding']) && !empty($_POST['internalFunding']) ? floatval($_POST['internalFunding']) : 0;
        $externalFunding = isset($_POST['externalFunding']) && !empty($_POST['externalFunding']) ? floatval($_POST['externalFunding']) : 0;
        $sponsoringAgency = isset($_POST['sponsoringAgency']) ? trim($_POST['sponsoringAgency']) : null;

        // Calculate total units from facilities JSON
        $totalUnits = 0;
        if ($facilities) {
            $facilitiesArray = json_decode($facilities, true);
            if (is_array($facilitiesArray)) {
                foreach ($facilitiesArray as $facility) {
                    $units = isset($facility['units']) ? intval($facility['units']) : 0;
                    $totalUnits += $units;
                }
            }
        }

        $sql = "UPDATE lab_facility SET
            type = ?,
            location = ?,
            laboratory_type = ?,
            facilities = ?,
            total_units = ?,
            date_acquired = ?,
            internal_funding = ?,
            external_funding = ?,
            sponsoring_agency = ?,
            purpose = ?
        WHERE id = ?";

        $stmt = $conn->prepare($sql);
        
        $stmt->bind_param(
            "ssssidddss",
            $type,
            $location,
            $laboratoryType,
            $facilities,
            $totalUnits,
            $dateAcquired,
            $internalFunding,
            $externalFunding,
            $sponsoringAgency,
            $purpose
        );

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Facility updated successfully'
            ]);
        } else {
            throw new Exception('Failed to update: ' . $stmt->error);
        }
        
        $stmt->close();
    } catch (Exception $e) {
        error_log('Error in handleUpdateFacility: ' . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update facility: ' . $e->getMessage()
        ]);
    }
}

function handleDeleteFacility($conn) {
    try {
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        
        if ($id <= 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid facility ID'
            ]);
            return;
        }

        $sql = "DELETE FROM lab_facility WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Facility deleted successfully'
            ]);
        } else {
            throw new Exception('Failed to delete: ' . $stmt->error);
        }
        
        $stmt->close();
    } catch (Exception $e) {
        error_log('Error in handleDeleteFacility: ' . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete facility: ' . $e->getMessage()
        ]);
    }
}

function handleFetchLaboratory($conn) {
    try {
        $response = [];

        $query = "SELECT
            lf.id,
            lf.type,
            lf.location,
            lf.laboratory_type,
            lf.facilities,
            lf.total_units,
            lf.date_acquired,
            lf.internal_funding,
            lf.external_funding,
            lf.sponsoring_agency,
            lf.purpose
        FROM lab_facility as lf
        ORDER BY lf.id ASC";

        if ($result = $conn->query($query)) {
            while ($val = $result->fetch_assoc()) {
                $response[] = $val;
            }
            $result->close();
        } else {
            $response['error'] = $conn->error;
        }
        
        echo json_encode($response);
    } catch (Exception $e) {
        error_log('Error in handleFetchLaboratory: ' . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch data: ' . $e->getMessage()
        ]);
    }
}

// Close connection
if (isset($conn) && $conn instanceof mysqli) {
    $conn->close();}