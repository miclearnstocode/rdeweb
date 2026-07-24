<?php

include('db.php');
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

// Get all categories (for symposium)
if (isset($_POST['criteriaList'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT id, name FROM category ORDER BY name";
        $statement = $con->prepare($query);
        $statement->execute();
        $result = $statement->get_result();
        while ($val = $result->fetch_assoc()) {
            $response[] = $val;
        }
    }
    echo json_encode($response);
}

// Get all centers (for in-house)
if (isset($_POST['getCenters'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT id, code, name FROM center ORDER BY name";
        $statement = $con->prepare($query);
        $statement->execute();
        $result = $statement->get_result();
        while ($val = $result->fetch_assoc()) {
            $response[] = $val;
        }
    }
    echo json_encode($response);
}

// Get criteria for a specific category (symposium)
if (isset($_POST['criteriaRequest'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $catId = $_POST['catId'];
        $eventId = $_POST['eventId'];
        
        $query = "SELECT 
            criteria.id,
            criteria.name,
            criteria.description,
            criteria.percentage,
            criteria.category_id as catId,
            category.name as category_name
        FROM criteria
        LEFT JOIN category ON criteria.category_id = category.id
        WHERE criteria.category_id = ? AND criteria.event_id = ?";

        $statement = $con->prepare($query);
        $statement->bind_param('ss', $catId, $eventId);
        $statement->execute();
        $result = $statement->get_result();
        
        while ($val = $result->fetch_assoc()) {
            $response[] = $val;
        }
    }
    echo json_encode($response);
}

// Get all criteria for an event (symposium with categories)
if (isset($_POST['criteriaListAll'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventId = $_POST['eventId'];
        
        $query = "SELECT 
            criteria.id,
            criteria.name,
            criteria.description,
            criteria.percentage,
            criteria.category_id as catId,
            category.name as category_name
        FROM criteria
        LEFT JOIN category ON criteria.category_id = category.id
        WHERE criteria.event_id = ?";

        $statement = $con->prepare($query);
        $statement->bind_param('s', $eventId);
        $statement->execute();
        $result = $statement->get_result();
        
        while ($val = $result->fetch_assoc()) {
            $response[] = $val;
        }
    }
    echo json_encode($response);
}

// Get all criteria for in-house event (with centers)
if (isset($_POST['criteriaListAllInHouse'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventId = $_POST['eventId'];
        
        $query = "SELECT 
            criteria.id,
            criteria.name,
            criteria.description,
            criteria.percentage,
            criteria.center_id,
            center.name as center_name,
            center.code as center_code
        FROM criteria
        LEFT JOIN center ON criteria.center_id = center.id
        WHERE criteria.event_id = ?";

        $statement = $con->prepare($query);
        $statement->bind_param('s', $eventId);
        $statement->execute();
        $result = $statement->get_result();
        
        while ($val = $result->fetch_assoc()) {
            $response[] = $val;
        }
    }
    echo json_encode($response);
}

// Add criteria for symposium
if (isset($_POST['addCriteriaV2'])) {
    $response = ['status' => false, 'message' => 'Unknown error'];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventId = $_POST['eventId'];
        $scoreId = $_POST['scoreId'];
        $categoryId = $_POST['categoryId'];
        
        $names = $_POST['name'];
        $descriptions = $_POST['description'];
        $percentages = $_POST['percentage'];
        
        // Check if criteria already exist for this category and event
        $checkQuery = "SELECT COUNT(*) as count FROM criteria WHERE event_id = ? AND category_id = ?";
        $checkStmt = $con->prepare($checkQuery);
        $checkStmt->bind_param('ss', $eventId, $categoryId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        $countRow = $checkResult->fetch_assoc();
        
        if ($countRow['count'] > 0) {
            // Delete existing criteria for this category and event
            $deleteQuery = "DELETE FROM criteria WHERE event_id = ? AND category_id = ?";
            $deleteStmt = $con->prepare($deleteQuery);
            $deleteStmt->bind_param('ss', $eventId, $categoryId);
            $deleteStmt->execute();
        }
        
        $insertQuery = "INSERT INTO criteria (event_id, score_sheet_id, category_id, name, description, percentage) VALUES (?, ?, ?, ?, ?, ?)";
        $insertStmt = $con->prepare($insertQuery);
        
        $success = true;
        for ($i = 0; $i < count($names); $i++) {
            $insertStmt->bind_param('ssssss', $eventId, $scoreId, $categoryId, $names[$i], $descriptions[$i], $percentages[$i]);
            if (!$insertStmt->execute()) {
                $success = false;
                $response['message'] = $insertStmt->error;
                break;
            }
        }
        
        if ($success) {
            $response['status'] = true;
            $response['message'] = 'Criteria added successfully';
        }
    }
    echo json_encode($response);
}

// Add criteria for in-house
if (isset($_POST['addCriteriaInHouse'])) {
    $response = ['status' => false, 'message' => 'Unknown error'];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventId = $_POST['eventId'];
        $scoreId = $_POST['scoreId'];
        $centerId = $_POST['centerId'];
        
        $names = $_POST['name'];
        $descriptions = $_POST['description'];
        $percentages = $_POST['percentage'];
        
        // Check if criteria already exist for this center and event
        $checkQuery = "SELECT COUNT(*) as count FROM criteria WHERE event_id = ? AND center_id = ?";
        $checkStmt = $con->prepare($checkQuery);
        $checkStmt->bind_param('ss', $eventId, $centerId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        $countRow = $checkResult->fetch_assoc();
        
        if ($countRow['count'] > 0) {
            // Delete existing criteria for this center and event
            $deleteQuery = "DELETE FROM criteria WHERE event_id = ? AND center_id = ?";
            $deleteStmt = $con->prepare($deleteQuery);
            $deleteStmt->bind_param('ss', $eventId, $centerId);
            $deleteStmt->execute();
        }
        
        $insertQuery = "INSERT INTO criteria (event_id, score_sheet_id, center_id, name, description, percentage) VALUES (?, ?, ?, ?, ?, ?)";
        $insertStmt = $con->prepare($insertQuery);
        
        $success = true;
        for ($i = 0; $i < count($names); $i++) {
            $insertStmt->bind_param('ssssss', $eventId, $scoreId, $centerId, $names[$i], $descriptions[$i], $percentages[$i]);
            if (!$insertStmt->execute()) {
                $success = false;
                $response['message'] = $insertStmt->error;
                break;
            }
        }
        
        if ($success) {
            $response['status'] = true;
            $response['message'] = 'Criteria added successfully';
        }
    }
    echo json_encode($response);
}

// Delete criteria
if (isset($_POST['deleteCriteria'])) {
    $response = ['status' => false, 'message' => 'Unknown error'];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $criteriaId = $_POST['criteriaId'];
        
        $query = "DELETE FROM criteria WHERE id = ?";
        $statement = $con->prepare($query);
        $statement->bind_param('s', $criteriaId);
        
        if ($statement->execute()) {
            $response['status'] = true;
            $response['message'] = 'Criteria deleted successfully';
        } else {
            $response['message'] = $statement->error;
        }
    }
    echo json_encode($response);
}