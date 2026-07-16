<?php

include_once('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

// ===== SYSTEM LOGS (Existing) =====
if (isset($_POST['logRequest'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT 
            document_log.id,
            document_log.user_id as userID,
            document_log.doc_id as docId,
            rdestaff.email as rdeName,
            document_log.details,
            document_log.date
            FROM document_log
            LEFT JOIN rdestaff ON document_log.user_id = rdestaff.id
            ORDER BY document_log.date DESC
            LIMIT 500";
        $statement = $con->prepare($query);
        $statement->execute();
        $res = $statement->get_result();
        while ($row = $res->fetch_assoc()) {
            $response[] = $row;
        }
    }
    echo json_encode($response);
    exit();
}

// ===== EMAIL LOGS (Existing) =====
if (isset($_POST['emailLogRequest'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT * FROM `email_log` ORDER BY sent_date DESC LIMIT 500";
        $statement = $con->prepare($query);
        $statement->execute();
        $res = $statement->get_result();
        while ($row = $res->fetch_assoc()) {
            $response[] = $row;
        }
    }
    echo json_encode($response);
    exit();
}

// ===== NEW: SUBMISSION LOGS =====
if (isset($_POST['submissionLogRequest'])) {
    $response = [];
    $limit = isset($_POST['limit']) ? (int)$_POST['limit'] : 100;
    $status = isset($_POST['status']) ? $_POST['status'] : '';
    $submissionType = isset($_POST['submission_type']) ? $_POST['submission_type'] : '';
    $userId = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;
    $dateFrom = isset($_POST['date_from']) ? $_POST['date_from'] : '';
    $dateTo = isset($_POST['date_to']) ? $_POST['date_to'] : '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT 
            sl.id,
            sl.user_id,
            sl.research_id,
            sl.endorsement_id,
            sl.local_inhouse_id,
            sl.event_id,
            sl.submission_type,
            sl.presentation_type,
            sl.status,
            sl.error_message,
            sl.error_code,
            sl.request_method,
            sl.ip_address,
            sl.duplicate_detected,
            sl.duplicate_type,
            sl.duplicate_record_id,
            sl.duplicate_user_id,
            sl.response_time_ms,
            sl.created_at,
            sl.updated_at,
            ad.fullName as user_fullname,
            ad.email as user_email,
            ad.center,
            ad.campus,
            ad.usertype,
            el.name as event_name,
            (SELECT COUNT(*) FROM file_upload_logs WHERE submission_log_id = sl.id) as file_count
        FROM submission_logs sl
        LEFT JOIN account_detail ad ON sl.user_id = ad.id
        LEFT JOIN event_list el ON sl.event_id = el.id
        WHERE 1=1";

        $params = [];
        $types = "";

        if (!empty($status)) {
            $query .= " AND sl.status = ?";
            $params[] = $status;
            $types .= "s";
        }

        if (!empty($submissionType)) {
            $query .= " AND sl.submission_type = ?";
            $params[] = $submissionType;
            $types .= "s";
        }

        if (!empty($userId)) {
            $query .= " AND sl.user_id = ?";
            $params[] = $userId;
            $types .= "i";
        }

        if (!empty($dateFrom)) {
            $query .= " AND DATE(sl.created_at) >= ?";
            $params[] = $dateFrom;
            $types .= "s";
        }

        if (!empty($dateTo)) {
            $query .= " AND DATE(sl.created_at) <= ?";
            $params[] = $dateTo;
            $types .= "s";
        }

        $query .= " ORDER BY sl.created_at DESC LIMIT ?";
        $params[] = $limit;
        $types .= "i";

        $statement = $con->prepare($query);
        if (!empty($params)) {
            $statement->bind_param($types, ...$params);
        }
        $statement->execute();
        $res = $statement->get_result();
        
        while ($row = $res->fetch_assoc()) {
            // Decode request_data and response_data for display
            if (!empty($row['request_data'])) {
                $row['request_data'] = json_decode($row['request_data'], true);
            }
            if (!empty($row['response_data'])) {
                $row['response_data'] = json_decode($row['response_data'], true);
            }
            
            // Get file upload details
            $fileQuery = "SELECT file_type, file_name, upload_status, drive_file_id, created_at 
                          FROM file_upload_logs 
                          WHERE submission_log_id = ?";
            $fileStmt = $con->prepare($fileQuery);
            $fileStmt->bind_param("i", $row['id']);
            $fileStmt->execute();
            $fileRes = $fileStmt->get_result();
            $row['files'] = [];
            while ($fileRow = $fileRes->fetch_assoc()) {
                $row['files'][] = $fileRow;
            }
            $fileStmt->close();

            $response[] = $row;
        }
        $statement->close();
    }
    echo json_encode($response);
    exit();
}

// ===== NEW: SUBMISSION STATISTICS =====
if (isset($_POST['submissionStats'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Overall stats
        $query = "SELECT 
            COUNT(*) as total_submissions,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
            SUM(CASE WHEN status = 'duplicate_blocked' THEN 1 ELSE 0 END) as blocked,
            SUM(CASE WHEN status = 'duplicate_warning' THEN 1 ELSE 0 END) as duplicate_warnings,
            SUM(CASE WHEN duplicate_detected = 1 THEN 1 ELSE 0 END) as total_duplicates,
            AVG(response_time_ms) as avg_response_time
        FROM submission_logs";
        
        $result = $con->query($query);
        $response['overall'] = $result->fetch_assoc();

        // Stats by submission type
        $query = "SELECT 
            submission_type,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
        FROM submission_logs 
        GROUP BY submission_type";
        $result = $con->query($query);
        $response['by_type'] = [];
        while ($row = $result->fetch_assoc()) {
            $response['by_type'][] = $row;
        }

        // Today's stats
        $query = "SELECT 
            COUNT(*) as today_total,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as today_success,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as today_failed,
            SUM(CASE WHEN duplicate_detected = 1 THEN 1 ELSE 0 END) as today_duplicates
        FROM submission_logs 
        WHERE DATE(created_at) = CURDATE()";
        $result = $con->query($query);
        $response['today'] = $result->fetch_assoc();

        // Last 7 days trend
        $query = "SELECT 
            DATE(created_at) as date,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
        FROM submission_logs 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC";
        $result = $con->query($query);
        $response['trend'] = [];
        while ($row = $result->fetch_assoc()) {
            $response['trend'][] = $row;
        }
    }
    echo json_encode($response);
    exit();
}

// ===== NEW: SUBMISSION LOG DETAILS =====
if (isset($_POST['submissionLogDetail'])) {
    $logId = isset($_POST['log_id']) ? (int)$_POST['log_id'] : 0;
    $response = null;
    
    if ($logId > 0 && $con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT 
            sl.*,
            ad.fullName as user_fullname,
            ad.email as user_email,
            ad.center,
            ad.campus,
            ad.usertype,
            el.name as event_name
        FROM submission_logs sl
        LEFT JOIN account_detail ad ON sl.user_id = ad.id
        LEFT JOIN event_list el ON sl.event_id = el.id
        WHERE sl.id = ?";
        
        $statement = $con->prepare($query);
        $statement->bind_param("i", $logId);
        $statement->execute();
        $res = $statement->get_result();
        $response = $res->fetch_assoc();
        
        if ($response) {
            // Decode JSON fields
            if (!empty($response['request_data'])) {
                $response['request_data'] = json_decode($response['request_data'], true);
            }
            if (!empty($response['response_data'])) {
                $response['response_data'] = json_decode($response['response_data'], true);
            }
            if (!empty($response['file_data'])) {
                $response['file_data'] = json_decode($response['file_data'], true);
            }
            
            // Get file upload details
            $fileQuery = "SELECT * FROM file_upload_logs WHERE submission_log_id = ?";
            $fileStmt = $con->prepare($fileQuery);
            $fileStmt->bind_param("i", $logId);
            $fileStmt->execute();
            $fileRes = $fileStmt->get_result();
            $response['files'] = [];
            while ($fileRow = $fileRes->fetch_assoc()) {
                $response['files'][] = $fileRow;
            }
            $fileStmt->close();
        }
        $statement->close();
    }
    echo json_encode($response);
    exit();
}