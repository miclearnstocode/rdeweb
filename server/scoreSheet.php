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
            center.code as center_code
        FROM criteria 
        LEFT JOIN score_sheet ON criteria.score_sheet_id = score_sheet.id
        LEFT JOIN center ON criteria.center_id = center.id
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
        // FIXED: Check for centerId parameter
        $centerId = $_POST['centerId'] ?? $_POST['center'] ?? null;
        
        if (!$centerId) {
            $response->message = 'Center ID is required';
            echo json_encode($response);
            exit();
        }
        
        $query = "INSERT INTO criteria(
            criteria.score_sheet_id,
            criteria.event_id,
            criteria.center_id,
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
            $centerId,  // Use the extracted centerId
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
        
        // FIXED: Check for centerId parameter with fallback
        $centerId = $_POST['centerId'] ?? $_POST['center'] ?? null;
        
        if (!$centerId) {
            $response->message = 'Center ID is required';
            echo json_encode($response);
            exit();
        }
        
        $eventId = $_POST['eventId'];
        $scoreId = $_POST['scoreId'];
        
        $insert = "INSERT INTO criteria (
            criteria.event_id,
            criteria.center_id,
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
            $postData[] = $centerId;  // Use the extracted centerId
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