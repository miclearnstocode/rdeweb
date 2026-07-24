<?php

include('db.php');
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

if (isset($_POST['criteriarequest'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT 
            criteria.id,
            criteria.name,
            criteria.description,
            criteria.percentage,
            center.name as center_name,
            center.code as center_code,
            category.name as category_name,
            category.id as category_id
        FROM criteria 
        LEFT JOIN score_sheet ON criteria.score_sheet_id = score_sheet.id
        LEFT JOIN center ON criteria.center_id = center.id
        LEFT JOIN category ON criteria.category_id = category.id
        WHERE score_sheet.event_id = ?";
        
        $statement = $con->prepare($query);
        $statement->bind_param("s", $_POST['scr_id']);
        $statement->execute();
        $result = $statement->get_result();
        
        while ($val = $result->fetch_assoc()) {
            $response[] = $val;
        }
    }
    echo json_encode($response);
}

if (isset($_POST['addCriteria'])) {
    $response = new stdClass();
    $response->message = '';
    $response->status = false;
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $centerId = $_POST['centerId'] ?? $_POST['center'] ?? null;
        $categoryId = $_POST['categoryId'] ?? $_POST['category'] ?? null;
        
        $idToUse = null;
        $idField = null;
        
        if ($centerId) {
            $idToUse = $centerId;
            $idField = 'center_id';
        } elseif ($categoryId) {
            $idToUse = $categoryId;
            $idField = 'category_id';
        } else {
            $response->message = 'Either Center ID or Category ID is required';
            echo json_encode($response);
            exit();
        }
        
        $query = "INSERT INTO criteria(
            criteria.score_sheet_id,
            criteria.event_id,
            criteria.{$idField},
            criteria.name,
            criteria.description,
            criteria.percentage
        ) 
        SELECT 
            score_sheet.id,
            ?,
            ?,
            ?,
            ?,
            ?
        FROM score_sheet 
        WHERE score_sheet.event_id = ?";
        
        $statement = $con->prepare($query);
        $statement->bind_param(
            "ssssss", 
            $_POST['eventId'],
            $idToUse,
            $_POST['name'],
            $_POST['description'],
            $_POST['percentage'],
            $_POST['eventId']
        );
        
        $status = $statement->execute();
        if ($status) {
            $response->status = true;
        } else {
            $response->message = $statement->error;
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['addCriteriaV2'])) {
    $response = new stdClass();
    $response->message = '';
    $response->status = false;
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $criteriaName = $_POST['name'];
        $description = $_POST['description'];
        $percentage = $_POST['percentage'];
        
        // Check for both centerId and categoryId
        $centerId = $_POST['centerId'] ?? $_POST['center'] ?? null;
        $categoryId = $_POST['categoryId'] ?? $_POST['category'] ?? null;
        
        // Determine which ID to use
        $idToUse = null;
        $idField = null;
        
        if ($centerId) {
            $idToUse = $centerId;
            $idField = 'center_id';
        } elseif ($categoryId) {
            $idToUse = $categoryId;
            $idField = 'category_id';
        } else {
            $response->message = 'Either Center ID or Category ID is required';
            echo json_encode($response);
            exit();
        }
        
        $eventId = $_POST['eventId'];
        $scoreId = $_POST['scoreId'];
        
        $insert = "INSERT INTO criteria (
            criteria.event_id,
            criteria.{$idField},
            criteria.score_sheet_id,
            criteria.name,
            criteria.description,
            criteria.percentage
        ) VALUES ";
        
        $rowVal = "";
        $rowValues = array("?", "?", "?", "?", "?", "?");
        $postData = [];
        
        foreach ($criteriaName as $key => $value) {
            $rowVal .= "(" . implode(",", $rowValues) . ")";
            if ($key < sizeof($criteriaName) - 1) {
                $rowVal .= ", ";
            }
            $postData[] = $eventId;
            $postData[] = $idToUse;
            $postData[] = $scoreId;
            $postData[] = $value;
            $postData[] = $description[$key];
            $postData[] = $percentage[$key];
        }
        
        $query = $insert . $rowVal;
        $statement = $con->prepare($query);
        $statement->bind_param(str_repeat("s", count($postData)), ...$postData);
        $status = $statement->execute();
        
        if ($status) {
            $response->status = true;
        } else {
            $response->message = $statement->error;
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['deleteCriteria'])) {
    $response = new stdClass();
    $response->message = '';
    $response->status = false;
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "DELETE FROM criteria WHERE criteria.id = ?";
        
        $statement = $con->prepare($query);
        $statement->bind_param("s", $_POST['criteriaId']);
        $status = $statement->execute();
        
        if ($status) {
            $response->status = true;
        } else {
            $response->message = $statement->error;
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['criteriaList'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT id, name FROM category ORDER BY name";
        $result = $con->query($query);
        
        while ($val = $result->fetch_assoc()) {
            $response[] = $val;
        }
    }
    echo json_encode($response);
}

if (isset($_POST['criteriaListAll'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Get criteria grouped by category
        // Research categories (1-4) share criteria, so we group them
        // Extension (5) has its own criteria
        $query = "SELECT 
            criteria.id,
            criteria.name,
            criteria.description,
            criteria.percentage,
            criteria.category_id as catId,
            category.name as category_name
        FROM criteria 
        LEFT JOIN category ON criteria.category_id = category.id
        WHERE criteria.event_id = ?
        ORDER BY criteria.category_id, criteria.id";
        
        $statement = $con->prepare($query);
        $statement->bind_param("s", $_POST['eventId']);
        $statement->execute();
        $result = $statement->get_result();
        
        while ($val = $result->fetch_assoc()) {
            $response[] = $val;
        }
    }
    echo json_encode($response);
}

if (isset($_POST['criteriaListAllInHouse'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
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
        WHERE criteria.event_id = ?
        ORDER BY criteria.center_id, criteria.id";
        
        $statement = $con->prepare($query);
        $statement->bind_param("s", $_POST['eventId']);
        $statement->execute();
        $result = $statement->get_result();
        
        while ($val = $result->fetch_assoc()) {
            $response[] = $val;
        }
    }
    echo json_encode($response);
}

if (isset($_POST['getCenters'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT id, name, code FROM center ORDER BY name";
        $result = $con->query($query);
        
        while ($val = $result->fetch_assoc()) {
            $response[] = $val;
        }
    }
    echo json_encode($response);
}