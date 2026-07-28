<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);

// Clear all output buffers
while (ob_get_level() > 0) {
    ob_end_clean();
}
ob_start();

// Check session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Include database config and mail template
require_once(__DIR__ . '/db.php');
require_once __DIR__ . '/Mailer/mailTemplate.php';
require_once __DIR__ . '/Mailer/MailSender.php';

// Error handler
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    return true;
});

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        ob_clean();
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Internal server error', 'details' => $error['message']]);
        exit();
    }
});

/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

if (isset($_POST['sendScheduledEmails'])) {
    $response = [
        'status' => false,
        'message' => '',
        'sent_count' => 0,
        'failed_count' => 0,
        'pending_count' => 0,
        'skipped_count' => 0,
        'errors' => []
    ];
    
    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }
        
        $con->set_charset('utf8mb4');
        
        // Get pending jobs that are due - WITH JOINs
        $batchSize = 10; // Send 10 emails per cron run
        $query = "SELECT 
                    eq.id,
                    eq.document_id,
                    eq.evaluator_id,
                    eq.event_id,
                    eq.acceptance_letter_id,
                    eq.scheduled_date,
                    eq.sent_date,
                    eq.status,
                    eq.retry_count,
                    eq.error_message,
                    eq.created_at,
                    eq.updated_at,
                    rf.id as research_id,
                    rf.title,
                    rf.final_symposium_title,
                    rf.author,
                    rf.presenter,
                    rf.campus,
                    rf.center,
                    rf.event,
                    COALESCE(rf.final_symposium_title, rf.title) as display_title,
                    ev.fullname as evaluator_name,
                    ad.email as author_email,
                    ad.fullName as author_name,
                    ad.center as author_center,
                    a.date_to_be_held,
                    c.intro,
                    c.abstract,
                    c.objective,
                    c.methodology,
                    c.results,
                    c.recommendation,
                    c.literature,
                    c.other,
                    c.title as comment_title
                  FROM email_queue eq
                  LEFT JOIN researchfile rf ON eq.document_id = rf.id
                  LEFT JOIN evaluator ev ON eq.evaluator_id = ev.id
                  LEFT JOIN account_detail ad ON rf.senderid = ad.id
                  LEFT JOIN acceptance_letter_data a ON eq.acceptance_letter_id = a.id
                  LEFT JOIN comments c ON c.resid = eq.document_id AND c.evalid = eq.evaluator_id
                  WHERE eq.status = 'pending' 
                  AND eq.scheduled_date <= NOW()
                  AND eq.retry_count < 5
                  ORDER BY eq.scheduled_date ASC, eq.id ASC
                  LIMIT ?";
        
        $stmt = $con->prepare($query);
        $stmt->bind_param("i", $batchSize);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $jobs = [];
        while ($row = $result->fetch_assoc()) {
            $jobs[] = $row;
        }
        $stmt->close();
        
        if (empty($jobs)) {
            $response['message'] = 'No pending emails to send';
            $response['status'] = true;
            ob_clean();
            echo json_encode($response);
            exit();
        }
        
        $response['pending_count'] = count($jobs);
        $processedCount = 0;
        
        // Process each job
        foreach ($jobs as $job) {
            $processedCount++;
            
            // Mark as processing
            $updateQuery = "UPDATE email_queue SET status = 'processing', retry_count = retry_count + 1, updated_at = NOW() WHERE id = ?";
            $updateStmt = $con->prepare($updateQuery);
            $updateStmt->bind_param("i", $job['id']);
            $updateStmt->execute();
            $updateStmt->close();
            
            // Check if there are actual comments
            $hasComments = false;
            $sections = ['intro', 'abstract', 'objective', 'methodology', 'results', 'recommendation', 'literature', 'other'];
            foreach ($sections as $section) {
                if (!empty($job[$section]) && trim($job[$section]) !== '') {
                    $hasComments = true;
                    break;
                }
            }
            
            if (!$hasComments) {
                // No actual comments, mark as failed
                $finalUpdate = "UPDATE email_queue SET status = 'failed', error_message = 'No actual comments found', updated_at = NOW() WHERE id = ?";
                $finalStmt = $con->prepare($finalUpdate);
                $finalStmt->bind_param("i", $job['id']);
                $finalStmt->execute();
                $finalStmt->close();
                $response['failed_count']++;
                continue;
            }
            
            // Prepare comments array for the mail template
            $commentsData = [
                'title' => $job['comment_title'] ?? '',
                'abstract' => $job['abstract'] ?? '',
                'intro' => $job['intro'] ?? '',
                'objective' => $job['objective'] ?? '',
                'methodology' => $job['methodology'] ?? '',
                'results' => $job['results'] ?? '',
                'recommendation' => $job['recommendation'] ?? '',
                'literature' => $job['literature'] ?? '',
                'other' => $job['other'] ?? ''
            ];
            
            // Get document title
            $title = $job['display_title'] ?? $job['title'] ?? 'Untitled';
            
            // Get author names
            $authorNames = $job['author_name'] ?? $job['author'] ?? 'Unknown';
            
            // Get evaluator name
            $evaluatorName = $job['evaluator_name'] ?? 'Unknown Evaluator';
            
            // Get campus
            $campus = $job['campus'] ?? 'Unknown Campus';
            
            // Get event name
            $eventName = $job['event'] ?? 'Research Event';
            
            // Build the document URL
            $documentUrl = '/evaluator/viewdocs/' . $job['document_id'];
            
            // Use the CommentNotification function from mailTemplate.php
            $emailBody = CommentNotification(
                $evaluatorName,
                $eventName,
                $title,
                $campus,
                $authorNames,
                $commentsData,
                $documentUrl
            );
            
            $subject = "Research Paper Evaluation Comments - " . $title;
            
            // Send email
            $headers = "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
            $headers .= "From: CapSU RDE System <noreply@capsu.edu.ph>\r\n";
            $headers .= "Reply-To: rde@capsu.edu.ph\r\n";
            $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
            
            $mailSent = mail($job['author_email'], $subject, $emailBody, $headers);
            
            // Log the result
            if ($mailSent) {
                $finalStatus = 'sent';
                $errorMsg = null;
                $response['sent_count']++;
                
                // Log to email_log table
                $logQuery = "INSERT INTO email_log 
                             (document_id, evaluator_id, author_email, sent_date, email_type, status) 
                             VALUES (?, ?, ?, NOW(), 'comment_notification', 1)";
                $logStmt = $con->prepare($logQuery);
                $logStmt->bind_param("iis", $job['document_id'], $job['evaluator_id'], $job['author_email']);
                $logStmt->execute();
                $logStmt->close();
                
            } else {
                $finalStatus = 'failed';
                $errorMsg = 'Mail send failed - PHP mail() returned false';
                $response['failed_count']++;
                
                // Log to email_log as failed
                $logQuery = "INSERT INTO email_log 
                             (document_id, evaluator_id, author_email, sent_date, email_type, status) 
                             VALUES (?, ?, ?, NOW(), 'comment_notification', 0)";
                $logStmt = $con->prepare($logQuery);
                $logStmt->bind_param("iis", $job['document_id'], $job['evaluator_id'], $job['author_email']);
                $logStmt->execute();
                $logStmt->close();
            }
            
            // Update job status
            $finalUpdate = "UPDATE email_queue 
                            SET status = ?, sent_date = NOW(), error_message = ?, updated_at = NOW() 
                            WHERE id = ?";
            $finalStmt = $con->prepare($finalUpdate);
            $finalStmt->bind_param("ssi", $finalStatus, $errorMsg, $job['id']);
            $finalStmt->execute();
            $finalStmt->close();
        }
        
        // Get remaining pending count
        $pendingQuery = "SELECT COUNT(*) as pending FROM email_queue WHERE status = 'pending' AND scheduled_date <= NOW()";
        $pendingResult = $con->query($pendingQuery);
        $pendingRow = $pendingResult->fetch_assoc();
        $remainingPending = $pendingRow['pending'] ?? 0;
        $pendingResult->free();
        
        $response['status'] = true;
        $response['message'] = "Processed " . $processedCount . " jobs: " . 
                               $response['sent_count'] . " sent, " . 
                               $response['failed_count'] . " failed. " .
                               $remainingPending . " remaining pending.";
        $response['remaining_pending'] = $remainingPending;
        
    } catch (Exception $e) {
        $response['message'] = 'Error: ' . $e->getMessage();
        $response['errors'][] = $e->getMessage();
        error_log('sendScheduledEmails error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
    }
    
    if (isset($con)) {
        $con->close();
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}


if (isset($_POST['getEmailQueueStatus'])) {
    $response = [
        'status' => true,
        'data' => [],
        'counts' => [
            'pending' => 0,
            'processing' => 0,
            'sent' => 0,
            'failed' => 0,
            'total' => 0
        ],
        'event_info' => null
    ];
    
    $eventId = isset($_POST['eventId']) ? (int)$_POST['eventId'] : 0;
    $limit = isset($_POST['limit']) ? (int)$_POST['limit'] : 50;
    
    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }
        
        $con->set_charset('utf8mb4');
        
        // Get event info if eventId provided
        if ($eventId > 0) {
            $eventQuery = "SELECT e.id, e.name, a.date_to_be_held 
                           FROM event_list e
                           LEFT JOIN acceptance_letter_data a ON e.id = a.event_id
                           WHERE e.id = ?";
            $eventStmt = $con->prepare($eventQuery);
            $eventStmt->bind_param("i", $eventId);
            $eventStmt->execute();
            $eventResult = $eventStmt->get_result();
            $response['event_info'] = $eventResult->fetch_assoc();
            $eventStmt->close();
        }
        
        // Build query with JOINs to get all related data
        $query = "SELECT 
                    eq.id,
                    eq.document_id,
                    eq.evaluator_id,
                    eq.event_id,
                    eq.acceptance_letter_id,
                    eq.scheduled_date,
                    eq.sent_date,
                    eq.status,
                    eq.retry_count,
                    eq.error_message,
                    eq.created_at,
                    eq.updated_at,
                    COALESCE(rf.final_symposium_title, rf.title, 'Untitled') as document_title,
                    rf.title as original_title,
                    rf.final_symposium_title,
                    ad.fullName as author_name,
                    ad.email as author_email,
                    ad.center as author_center,
                    ev.fullname as evaluator_name
                  FROM email_queue eq
                  LEFT JOIN researchfile rf ON eq.document_id = rf.id
                  LEFT JOIN account_detail ad ON rf.senderid = ad.id
                  LEFT JOIN evaluator ev ON eq.evaluator_id = ev.id";
        
        if ($eventId > 0) {
            $query .= " WHERE eq.event_id = ?";
        }
        
        $query .= " ORDER BY eq.created_at DESC LIMIT ?";
        
        $stmt = $con->prepare($query);
        if ($eventId > 0) {
            $stmt->bind_param("ii", $eventId, $limit);
        } else {
            $stmt->bind_param("i", $limit);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            // If document_title is null or empty, use a fallback
            if (empty($row['document_title']) || $row['document_title'] === 'Untitled') {
                $row['document_title'] = $row['original_title'] ?? 'Untitled';
            }
            if (empty($row['author_name'])) {
                $row['author_name'] = 'N/A';
            }
            if (empty($row['author_email'])) {
                $row['author_email'] = 'N/A';
            }
            if (empty($row['evaluator_name'])) {
                $row['evaluator_name'] = 'Unknown Evaluator';
            }
            $response['data'][] = $row;
        }
        $stmt->close();
        $result->free();
        
        // Get counts
        $countQuery = "SELECT status, COUNT(*) as count FROM email_queue";
        if ($eventId > 0) {
            $countQuery .= " WHERE event_id = ?";
        }
        $countQuery .= " GROUP BY status";
        
        $countStmt = $con->prepare($countQuery);
        if ($eventId > 0) {
            $countStmt->bind_param("i", $eventId);
        }
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        
        while ($row = $countResult->fetch_assoc()) {
            $response['counts'][$row['status']] = (int)$row['count'];
            $response['counts']['total'] += (int)$row['count'];
        }
        $countStmt->close();
        $countResult->free();
        
    } catch (Exception $e) {
        $response['status'] = false;
        $response['message'] = $e->getMessage();
        error_log('getEmailQueueStatus error: ' . $e->getMessage());
    }
    
    if (isset($con)) {
        $con->close();
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}

if (isset($_POST['retryFailedEmails'])) {
    $response = [
        'status' => false,
        'message' => '',
        'retried_count' => 0
    ];
    
    $eventId = isset($_POST['eventId']) ? (int)$_POST['eventId'] : 0;
    $maxRetries = 3;
    
    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }
        
        $con->set_charset('utf8mb4');
        
        $query = "UPDATE email_queue 
                  SET status = 'pending', updated_at = NOW() 
                  WHERE status = 'failed' 
                  AND retry_count < ?";
        
        if ($eventId > 0) {
            $query .= " AND event_id = ?";
            $stmt = $con->prepare($query);
            $stmt->bind_param("ii", $maxRetries, $eventId);
        } else {
            $stmt = $con->prepare($query);
            $stmt->bind_param("i", $maxRetries);
        }
        
        $stmt->execute();
        $affectedRows = $stmt->affected_rows;
        $stmt->close();
        
        $response['status'] = true;
        $response['message'] = "Reset $affectedRows failed emails to pending status";
        $response['retried_count'] = $affectedRows;
        
    } catch (Exception $e) {
        $response['message'] = 'Error: ' . $e->getMessage();
        error_log('retryFailedEmails error: ' . $e->getMessage());
    }
    
    if (isset($con)) {
        $con->close();
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}
if (isset($_POST['getAllAcceptanceLetters'])) {
    $response = ['status' => false, 'message' => '', 'data' => []];
    
    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }
        
        $result = $con->query("
            SELECT 
                id,
                event_id,
                event_name,
                event_type,
                date_to_be_held,
                drive_link,
                venue,
                ppt_deadline,
                zoom_time,
                zoom_link,
                meeting_id,
                passcode,
                created_at,
                updated_at
            FROM acceptance_letter_data 
            ORDER BY created_at DESC
        ");
        
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $response['data'][] = $row;
            }
            $response['status'] = true;
            $response['message'] = count($response['data']) . ' record(s) found';
        } else {
            $response['status'] = true;
            $response['message'] = 'No records found';
        }
        
        $con->close();
        
    } catch (Exception $e) {
        error_log("getAllAcceptanceLetters error: " . $e->getMessage());
        $response['status'] = false;
        $response['message'] = $e->getMessage();
    }
    
    echo json_encode($response);
    exit();
}

if (isset($_POST['deleteAcceptanceLetter'])) {
    $response = ['status' => false, 'message' => ''];
    
    try {
        $eventId = isset($_POST['eventId']) ? intval($_POST['eventId']) : 0;
        
        if ($eventId <= 0) {
            throw new Exception('Invalid event ID');
        }
        
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }
        
        $stmt = $con->prepare("DELETE FROM acceptance_letter_data WHERE event_id = ?");
        $stmt->bind_param("i", $eventId);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                $response['status'] = true;
                $response['message'] = 'Acceptance letter data deleted successfully';
            } else {
                $response['status'] = false;
                $response['message'] = 'No data found for this event';
            }
        } else {
            throw new Exception('Failed to delete data: ' . $stmt->error);
        }
        
        $stmt->close();
        $con->close();
        
    } catch (Exception $e) {
        error_log("deleteAcceptanceLetter error: " . $e->getMessage());
        $response['status'] = false;
        $response['message'] = $e->getMessage();
    }
    
    echo json_encode($response);
    exit();
}

if (isset($_POST['getAcceptanceLettersWithEvent'])) {
    $response = ['status' => false, 'message' => '', 'data' => []];
    
    try {
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }
        
        $result = $con->query("
            SELECT 
                a.id,
                a.event_id,
                a.event_name,
                a.event_type,
                a.date_to_be_held,
                a.drive_link,
                a.venue,
                a.ppt_deadline,
                a.zoom_time,
                a.zoom_link,
                a.meeting_id,
                a.passcode,
                a.created_at,
                a.updated_at,
                e.name as event_name_from_list,
                e.id as event_list_id
            FROM acceptance_letter_data a
            LEFT JOIN event_list e ON a.event_id = e.id
            ORDER BY a.created_at DESC
        ");
        
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Use event_id as the actual event ID
                $row['event_id'] = (int)$row['event_id'];
                $response['data'][] = $row;
            }
            $response['status'] = true;
            $response['message'] = count($response['data']) . ' record(s) found';
        } else {
            $response['status'] = true;
            $response['message'] = 'No records found';
        }
        
        $con->close();
        
    } catch (Exception $e) {
        error_log("getAcceptanceLettersWithEvent error: " . $e->getMessage());
        $response['status'] = false;
        $response['message'] = $e->getMessage();
    }
    
    ob_clean();
    echo json_encode($response);
    exit();
}

ob_clean();
echo json_encode(['error' => 'Invalid request']);
exit();