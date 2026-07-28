<?php
ob_start();
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
include('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
$con = new mysqli($host, $username, $pass, $dbName);

header('Content-Type: application/json; charset=utf-8');

if(isset($_POST['getCategories'])){
    $response = [];
    
    if($con){
        $query = "SELECT id, name FROM category ORDER BY name";
        $result = $con->query($query);
        
        if($result){
            while($row = $result->fetch_assoc()){
                $response[] = [
                    'id' => $row['id'],
                    'name' => $row['name']
                ];
            }
            $result->free();
        }
    }
    
    echo json_encode($response);
    exit();
}

if(isset($_POST['commentRequest'])){
    $eventType = $_POST['eventType'] ?? '';
    $categoryId = $_POST['categoryId'] ?? '';
    $categoryName = $_POST['categoryName'] ?? '';
    
    // If no event selected, return error
    if (empty($eventType) || $eventType === '-- Select Event type --') {
        echo json_encode(['error' => 'Please select an event']);
        exit();
    }
    
    $response = [];
    
    if($con){
        $query = "SELECT 
            c.resid,
            c.evalid,
            c.intro,
            c.abstract,
            c.objective,
            c.methodology,
            c.results,
            c.recommendation,
            c.literature,
            c.other,
            c.isCommented,
            c.date,
            e.fullname as evaluator_name,
            r.category,
            r.center,
            r.campus,
            r.title,
            r.author,
            r.coauthor,
            r.presenter,
            r.event,
            r.file,
            r.drive_view_url,
            r.paper_trail_no,
            r.final_symposium_title,
            cat.id as category_id,
            cat.name as category_name
        FROM comments c
        LEFT JOIN evaluator e ON e.id = c.evalid
        LEFT JOIN researchfile r ON r.id = c.resid
        LEFT JOIN category cat ON cat.name = r.category
        WHERE r.event = ?";
        
        $params = [$eventType];
        $types = "s";
        
        if (!empty($categoryId) && $categoryId !== 'Print All Category' && $categoryId !== '-- Select Category --') {
            $query .= " AND cat.id = ?";
            $params[] = $categoryId;
            $types .= "s";
        }
        
        $query .= " ORDER BY r.title, c.date DESC";
        
        $statement = $con->prepare($query);
        if ($statement) {
            $statement->bind_param($types, ...$params);
            $statement->execute();
            $result = $statement->get_result();
            
            // Group comments by research file ID
            $groupedComments = [];
            while ($val = $result->fetch_assoc()) {
                $resid = $val['resid'];
                
                if (!isset($groupedComments[$resid])) {
                    $groupedComments[$resid] = [
                        'resid' => $val['resid'],
                        'title' => $val['final_symposium_title'] ?? $val['title'] ?? 'Untitled',
                        'category' => $val['category_name'] ?? $val['category'] ?? '',
                        'category_id' => $val['category_id'] ?? '',
                        'center' => $val['center'] ?? '',
                        'campus' => $val['campus'] ?? '',
                        'author' => $val['author'] ?? '',
                        'coauthor' => $val['coauthor'] ?? '',
                        'presenter' => $val['presenter'] ?? '',
                        'event' => $val['event'] ?? '',
                        'file' => $val['file'] ?? '',
                        'drive_view_url' => $val['drive_view_url'] ?? '',
                        'paper_trail_no' => $val['paper_trail_no'] ?? '',
                        'comments' => []
                    ];
                }
                
                // Add comment if it exists
                $comment = [];
                if (!empty($val['intro'])) $comment['intro'] = $val['intro'];
                if (!empty($val['abstract'])) $comment['abstract'] = $val['abstract'];
                if (!empty($val['objective'])) $comment['objective'] = $val['objective'];
                if (!empty($val['methodology'])) $comment['methodology'] = $val['methodology'];
                if (!empty($val['results'])) $comment['results'] = $val['results'];
                if (!empty($val['recommendation'])) $comment['recommendation'] = $val['recommendation'];
                if (!empty($val['literature'])) $comment['literature'] = $val['literature'];
                if (!empty($val['other'])) $comment['other'] = $val['other'];
                $comment['evaluator_name'] = $val['evaluator_name'] ?? 'Unknown Evaluator';
                $comment['date'] = $val['date'] ?? '';
                
                if (count($comment) > 2) {
                    $groupedComments[$resid]['comments'][] = $comment;
                }
            }
            
            // Convert to array and filter out documents with no comments
            $response = array_values(array_filter($groupedComments, function($doc) {
                return !empty($doc['comments']);
            }));
            
            $statement->close();
        } else {
            echo json_encode(['error' => 'Database query failed: ' . $con->error]);
            exit();
        }
    }
    
    echo json_encode($response);
    exit();
}

if(isset($_POST['reqCommentIndiv2'])){
    $response = new stdClass();
    $response->name = '';
    $response->data = '';
    $response->isCommented = 0;
    $response->evID = null;
    $response->status = 'success';
    $response->message = 'No comments found';
    
    try {
        // Check if session exists
        if (!isset($_SESSION) || session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Check if userId is set in session
        if (!isset($_SESSION['userId'])) {
            error_log('userId not set in session');
            echo json_encode($response);
            exit();
        }
        
        $comName = $_POST['comName'] ?? '';
        $docId = $_POST['docId'] ?? '';
        $evalId = $_SESSION['userId'];
        
        // Validate inputs
        if (empty($comName) || empty($docId)) {
            $response->message = 'Missing required parameters';
            echo json_encode($response);
            exit();
        }
        
        // Map section names to database columns
        $columnMap = [
            'title' => 'title',
            'abstract' => 'abstract',
            'intro' => 'intro',
            'objective' => 'objective',
            'methodology' => 'methodology',
            'results' => 'results',
            'recommendation' => 'recommendation',
            'literature' => 'literature',
            'other' => 'other'
        ];
        
        if (isset($columnMap[$comName])) {
            $column = $columnMap[$comName];
            $query = "SELECT comments.$column as data, comments.isCommented, comments.evID 
                     FROM comments 
                     WHERE comments.resid = ? AND comments.evalid = ?";
            
            $cons = new mysqli($host, $username, $pass, $dbName);
            
            if ($cons->connect_error) {
                error_log('Database connection failed: ' . $cons->connect_error);
                $response->message = 'Database connection failed';
                echo json_encode($response);
                exit();
            }
            
            $statement = $cons->prepare($query);
            
            if (!$statement) {
                error_log('Prepare failed: ' . $cons->error);
                $response->message = 'Query preparation failed';
                echo json_encode($response);
                exit();
            }
            
            $statement->bind_param("ss", $docId, $evalId);
            
            if (!$statement->execute()) {
                error_log('Execute failed: ' . $statement->error);
                $response->message = 'Query execution failed';
                echo json_encode($response);
                exit();
            }
            
            $result = $statement->get_result();
            
            while ($val = $result->fetch_assoc()) {
                $response->name = $comName;
                // Return the data as-is (with HTML tags) - the frontend will render it
                $response->data = $val['data'] ?? '';
                $response->isCommented = (int)($val['isCommented'] ?? 0);
                $response->evID = $val['evID'] ?? null;
                $response->message = 'Comment loaded';
            }
            
            $statement->close();
            $cons->close();
        } else {
            $response->message = 'Invalid section name';
        }
    } catch (Exception $e) {
        error_log('Exception in reqCommentIndiv2: ' . $e->getMessage());
        $response->message = 'Server error: ' . $e->getMessage();
        $response->status = 'error';
    }
    
    echo json_encode($response);
    exit();
}

//endpoint to update isCommented status
if(isset($_POST['updateCommentStatus'])){
    $docId = $_POST['docId'];
    $evalId = $_SESSION['userId'];
    $isCommented = $_POST['isCommented'];
    
    if ($cons = new mysqli($host, $username, $pass, $dbName)) {
        $query = "UPDATE comments SET isCommented = ? WHERE resid = ? AND evalid = ?";
        $statement = $cons->prepare($query);
        $statement->bind_param("iss", $isCommented, $docId, $evalId);
        $statement->execute();
        
        echo json_encode(['success' => true]);
    }
}

if(isset($_POST['updateScoreStatus'])){
    $docId = $_POST['docId'];
    $evalId = $_SESSION['userId'];
    $isScored = $_POST['isScored'];
    
    if ($cons = new mysqli($host, $username, $pass, $dbName)) {
        $query = "UPDATE score_board SET isScored = ? WHERE doc_id = ? AND eval_id = ?";
        $statement = $cons->prepare($query);
        $statement->bind_param("iis", $isScored, $docId, $evalId);
        $statement->execute();
        
        echo json_encode(['success' => true]);
    }
}

if(isset($_POST['queueCommentForEmail'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->queued = 0;
    
    try {
        $docId = $_POST['docId'] ?? '';
        $evalId = $_SESSION['userId'] ?? 0;
        $eventId = $_POST['eventId'] ?? 0;
        $eventName = $_POST['eventName'] ?? '';
        
        if (empty($docId) || empty($evalId)) {
            throw new Exception('Missing required parameters');
        }
        
        $cons = new mysqli($host, $username, $pass, $dbName);
        
        if ($cons->connect_error) {
            throw new Exception('Database connection failed: ' . $cons->connect_error);
        }
        
        // Get comments and research data
        $checkQuery = "SELECT 
            c.resid, 
            c.evalid, 
            c.intro, 
            c.abstract, 
            c.objective, 
            c.methodology, 
            c.results, 
            c.recommendation, 
            c.literature, 
            c.other,
            r.author,
            r.coauthor,
            r.presenter,
            r.title,
            r.final_symposium_title,
            r.campus,
            r.event_id,
            r.event,
            r.senderid,
            a.id as acceptance_id,
            a.date_to_be_held
        FROM comments c
        LEFT JOIN researchfile r ON c.resid = r.id
        LEFT JOIN acceptance_letter_data a ON r.event_id = a.event_id
        WHERE c.resid = ? AND c.evalid = ?";
        
        $stmt = $cons->prepare($checkQuery);
        $stmt->bind_param("si", $docId, $evalId);
        $stmt->execute();
        $result = $stmt->get_result();
        $commentData = $result->fetch_assoc();
        $stmt->close();
        
        if (!$commentData) {
            throw new Exception('No comments found for this document');
        }
        
        // Use event info from database if not provided
        if (empty($eventId) && !empty($commentData['event_id'])) {
            $eventId = $commentData['event_id'];
        }
        if (empty($eventName) && !empty($commentData['event'])) {
            $eventName = $commentData['event'];
        }
        
        // Check if there are actual comments
        $hasComments = false;
        $sections = ['intro', 'abstract', 'objective', 'methodology', 'results', 'recommendation', 'literature', 'other'];
        foreach ($sections as $section) {
            if (!empty($commentData[$section]) && trim($commentData[$section]) !== '') {
                $hasComments = true;
                break;
            }
        }
        
        if (!$hasComments) {
            throw new Exception('No comments have been added');
        }
        
        // Get evaluator name
        $evalQuery = "SELECT fullname FROM evaluator WHERE id = ?";
        $evalStmt = $cons->prepare($evalQuery);
        $evalStmt->bind_param("i", $evalId);
        $evalStmt->execute();
        $evalResult = $evalStmt->get_result();
        $evaluator = $evalResult->fetch_assoc();
        $evalStmt->close();
        
        $senderId = $commentData['senderid'] ?? 0;
        $chairEmails = [];
        $chairName = '';
        
        if (!empty($senderId)) {
            $chairQuery = "SELECT email, fullName, campus FROM account_detail WHERE id = ?";
            $chairStmt = $cons->prepare($chairQuery);
            $chairStmt->bind_param("i", $senderId);
            $chairStmt->execute();
            $chairResult = $chairStmt->get_result();
            
            while ($row = $chairResult->fetch_assoc()) {
                if (!empty($row['email'])) {
                    $chairEmails[] = $row['email'];
                    $chairName = $row['fullName'] ?? 'Research Chair';
                }
            }
            $chairStmt->close();
        }
        
        // If no email from senderid, try author name
        if (empty($chairEmails) && !empty($commentData['author'])) {
            $chairQuery = "SELECT email, fullName FROM account_detail WHERE fullName = ? AND (usertype = 'Research Chair' OR usertype = 'User')";
            $chairStmt = $cons->prepare($chairQuery);
            $chairStmt->bind_param("s", $commentData['author']);
            $chairStmt->execute();
            $chairResult = $chairStmt->get_result();
            while ($row = $chairResult->fetch_assoc()) {
                if (!empty($row['email'])) {
                    $chairEmails[] = $row['email'];
                    if (empty($chairName)) $chairName = $row['fullName'];
                }
            }
            $chairStmt->close();
        }
        
        if (empty($chairEmails)) {
            throw new Exception('No Research Chair email found to notify');
        }
        
        $chairEmails = array_unique($chairEmails);
        
        $acceptanceId = $commentData['acceptance_id'] ?? null;
        $eventDateRaw = $commentData['date_to_be_held'] ?? null;
        $scheduledDate = null;
        
        if (!empty($eventDateRaw)) {
            error_log("Raw date_to_be_held: " . $eventDateRaw);
            
            if (preg_match('/([A-Za-z]+)\s+(\d+)-(\d+),\s+(\d{4})(?:\s+at\s+(\d{1,2}:\d{2}\s*[AP]M))?/i', $eventDateRaw, $matches)) {
                $month = $matches[1];
                $dayEnd = (int)$matches[3]; 
                $year = (int)$matches[4];
                $time = isset($matches[5]) ? $matches[5] : '8:00 AM';
                
                $time = str_replace('at ', '', $time);
                $time = trim($time);
                
                // Build date string: "July 30, 2026 8:00 AM"
                $dateStr = "$month $dayEnd, $year $time";
                error_log("Formatted date string: $dateStr");
                
                // Parse using DateTime
                $eventDateTime = new DateTime($dateStr);
                // Add 1 day after the event
                $eventDateTime->modify('+1 day');
                $scheduledDate = $eventDateTime->format('Y-m-d H:i:s');
                error_log("Scheduled date (after +1 day): $scheduledDate");
            } else {
                $cleanDate = str_replace(' at ', ' ', $eventDateRaw);
                $cleanDate = str_replace('at ', '', $cleanDate);
                try {
                    $eventDateTime = new DateTime($cleanDate);
                    $eventDateTime->modify('+1 day');
                    $scheduledDate = $eventDateTime->format('Y-m-d H:i:s');
                } catch (Exception $e) {
                    error_log("Regular date parsing failed: " . $e->getMessage());
                    $scheduledDate = date('Y-m-d H:i:s', strtotime('+1 day'));
                }
            }
        }
        
        // Fallback if no date found
        if (empty($scheduledDate)) {
            $scheduledDate = date('Y-m-d H:i:s', strtotime('+1 day'));
            error_log("Using fallback date: $scheduledDate");
        }
        
        // Get document title
        $documentTitle = $commentData['final_symposium_title'] ?? $commentData['title'] ?? 'Untitled';
        
        // Get comment sections
        $commentSections = [];
        $sectionNames = [
            'intro' => 'Introduction',
            'abstract' => 'Abstract',
            'objective' => 'Objectives',
            'methodology' => 'Methodology',
            'results' => 'Results and Discussion',
            'recommendation' => 'Conclusions and Recommendation',
            'literature' => 'Literature',
            'other' => 'Other Comments'
        ];
        
        foreach ($sectionNames as $key => $name) {
            if (!empty($commentData[$key]) && trim($commentData[$key]) !== '') {
                $commentSections[] = $name;
            }
        }
        
        $commentSectionsStr = implode(', ', $commentSections);
        
        // Insert into email_queue
        $queuedCount = 0;
        foreach ($chairEmails as $email) {
            if (empty($email)) continue;
            
            // Check if already queued
            $checkQueueQuery = "SELECT id FROM email_queue 
                               WHERE document_id = ? AND evaluator_id = ? 
                               AND status IN ('pending', 'processing')";
            $checkQueueStmt = $cons->prepare($checkQueueQuery);
            $checkQueueStmt->bind_param("ii", $docId, $evalId);
            $checkQueueStmt->execute();
            $checkQueueResult = $checkQueueStmt->get_result();
            
            if ($checkQueueResult->num_rows > 0) {
                $checkQueueStmt->close();
                continue;
            }
            $checkQueueStmt->close();
            
            // Insert into email_queue
            $insertQuery = "INSERT INTO email_queue 
                            (document_id, evaluator_id, event_id, acceptance_letter_id, scheduled_date, status) 
                            VALUES (?, ?, ?, ?, ?, 'pending')";
            
            $insertStmt = $cons->prepare($insertQuery);
            $insertStmt->bind_param("iiiss", 
                $docId, 
                $evalId, 
                $eventId, 
                $acceptanceId,
                $scheduledDate
            );
            
            if ($insertStmt->execute()) {
                $queuedCount++;
                error_log("Queued email for doc $docId to Research Chair: $email on $scheduledDate");
            } else {
                error_log("Failed to insert email_queue: " . $insertStmt->error);
            }
            $insertStmt->close();
        }
        
        // Log to email_log
        if ($queuedCount > 0) {
            foreach ($chairEmails as $email) {
                $logQuery = "INSERT INTO email_log 
                             (document_id, evaluator_id, author_email, sent_date, email_type, status) 
                             VALUES (?, ?, ?, NOW(), 'comment_queued', 0)";
                $logStmt = $cons->prepare($logQuery);
                $logStmt->bind_param("iis", $docId, $evalId, $email);
                $logStmt->execute();
                $logStmt->close();
            }
        }
        
        $response->status = true;
        $response->message = "Comments saved";
        $response->queued = $queuedCount;
        $response->scheduled_date = $scheduledDate;
        
        $cons->close();
        
    } catch (Exception $e) {
        error_log('queueCommentForEmail error: ' . $e->getMessage());
        $response->status = false;
        $response->message = $e->getMessage();
    }
    
    echo json_encode($response);
    exit();
}