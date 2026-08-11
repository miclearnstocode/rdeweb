<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/drive_errors.log');

header('Content-Type: application/json; charset=utf-8');

// Start output buffering with callback to catch errors
ob_start(function ($buffer) {
    // Check if the buffer contains HTML error messages
    if (
        strpos($buffer, '<b>Warning</b>') !== false ||
        strpos($buffer, '<b>Notice</b>') !== false ||
        strpos($buffer, '<b>Fatal error</b>') !== false
    ) {

        // Log the error
        error_log("HTML error in output buffer: " . substr($buffer, 0, 500));

        // Return a clean JSON error
        return json_encode([
            'status' => false,
            'message' => 'Server error occurred',
            'error_type' => 'html_error_in_response'
        ]);
    }
    return $buffer;
});

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/../config/driver_config.php';
include(__DIR__ . '/db.php');

/** @var TYPE_NAME $host */

/** @var TYPE_NAME $username */

/** @var TYPE_NAME $pass */

/** @var TYPE_NAME $dbName */

/** @var TYPE_NAME $rdeEmail */

/** @var TYPE_NAME $emailPassword */

require_once __DIR__ . '/Mailer/mailTemplate.php';
require_once __DIR__ . '/Mailer/MailSender.php';
date_default_timezone_set('Asia/Manila');

function normalizeString($string) {
    // Convert to lowercase
    $string = strtolower($string);
    
    // Remove extra spaces
    $string = preg_replace('/\s+/', ' ', $string);
    
    // Remove special characters but keep letters and numbers
    $string = preg_replace('/[^a-z0-9\s]/', '', $string);
    
    // Trim
    $string = trim($string);
    
    return $string;
}

function isSimilarString($str1, $str2, $threshold = 80) {
    $str1 = normalizeString($str1);
    $str2 = normalizeString($str2);
    
    // If exactly the same after normalization, they're duplicates
    if ($str1 === $str2) {
        return true;
    }
    
    // Calculate Levenshtein distance
    $distance = levenshtein($str1, $str2);
    $maxLength = max(strlen($str1), strlen($str2));
    
    if ($maxLength === 0) {
        return true;
    }
    
    // Calculate similarity percentage
    $similarity = (1 - $distance / $maxLength) * 100;
    
    return $similarity >= $threshold;
}

function normalizeAuthorName($name) {
    // Remove titles
    $name = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $name);
    
    // Remove suffixes
    $name = preg_replace('/\s*(Ph\.?D\.?|MD|DVM|JD|LLB|LLM|RN|CPA|CMA|CFA|PE|Arch|Ed\.?D\.?|DBA|MPH|MS|MA|MBA|MFT|DrPH|PharmD|PT|OT|ECE|MCS|MAED|EDD)\s*/i', '', $name);
    
    // Convert to lowercase
    $name = strtolower($name);
    
    // Remove special characters
    $name = preg_replace('/[^a-z0-9\s]/', '', $name);
    
    // Remove extra spaces
    $name = preg_replace('/\s+/', ' ', $name);
    
    return trim($name);
}

function areAuthorsSimilar($authors1, $authors2, $threshold = 80) {
    // Normalize all authors
    $normalized1 = array_map('normalizeAuthorName', $authors1);
    $normalized2 = array_map('normalizeAuthorName', $authors2);
    
    // Sort them
    sort($normalized1);
    sort($normalized2);
    
    // If they have different lengths, they might still be similar
    // Check if one set is a subset of the other (some authors might be missing)
    if (count($normalized1) != count($normalized2)) {
        // Find common authors
        $common = array_intersect($normalized1, $normalized2);
        $minCount = min(count($normalized1), count($normalized2));
        $similarity = (count($common) / $minCount) * 100;
        return $similarity >= $threshold;
    }
    
    // Same length, compare each author
    $matches = 0;
    for ($i = 0; $i < count($normalized1); $i++) {
        if ($normalized1[$i] === $normalized2[$i]) {
            $matches++;
        } elseif (isSimilarString($normalized1[$i], $normalized2[$i], 85)) {
            $matches++;
        }
    }
    
    $similarity = ($matches / count($normalized1)) * 100;
    return $similarity >= $threshold;
}

// this is for evaluator
if (isset($_POST['researchSubmit'])) {
    $response = new stdClass();
    $response->list = [];
    $response->userName = '';
    $response->userType = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Get user info from session
        $center = isset($_POST['center']) ? $_POST['center'] : null;
        $eventId = isset($_POST['event']) ? intval($_POST['event']) : 0;
        $evalId = $_SESSION['userId'] ?? 0;
        $userType = isset($_POST['filterType']) ? $_POST['filterType'] : 'center';
        $categoryIds = isset($_POST['categoryIds']) ? json_decode($_POST['categoryIds'], true) : [];
        
        $response->userName = $_SESSION['userName'] ?? '';
        $response->userType = $userType;

        if (empty($eventId) || $eventId == 0) {
            error_log("No valid event ID provided");
            echo json_encode($response);
            exit();
        }

        // Get event name
        $eventName = '';
        $eventNameQuery = "SELECT name FROM event_list WHERE id = ?";
        $eventNameStmt = $con->prepare($eventNameQuery);
        if ($eventNameStmt) {
            $eventNameStmt->bind_param("i", $eventId);
            $eventNameStmt->execute();
            $eventNameResult = $eventNameStmt->get_result();
            if ($row = $eventNameResult->fetch_assoc()) {
                $eventName = $row['name'];
            }
            $eventNameStmt->close();
        }
        
        // Determine if it's a student event
        $isStudentEvent = false;
        if (!empty($eventName)) {
            $lowerEventName = strtolower($eventName);
            if (strpos($lowerEventName, 'undergraduate') !== false || 
                strpos($lowerEventName, 'graduate') !== false) {
                $isStudentEvent = true;
            }
        }
        
        error_log("researchSubmit - Event ID: $eventId, Event Name: $eventName, Is Student: " . ($isStudentEvent ? 'Yes' : 'No'));

        // Get category names from IDs
        $categoryNames = [];
        if ($userType === 'category' && !empty($categoryIds)) {
            $placeholders = implode(',', array_fill(0, count($categoryIds), '?'));
            $catNameQuery = "SELECT name FROM category WHERE id IN ($placeholders)";
            $catNameStmt = $con->prepare($catNameQuery);
            if ($catNameStmt) {
                $types = str_repeat('i', count($categoryIds));
                $catNameStmt->bind_param($types, ...$categoryIds);
                $catNameStmt->execute();
                $catNameResult = $catNameStmt->get_result();
                
                while ($row = $catNameResult->fetch_assoc()) {
                    $categoryNames[] = $row['name'];
                }
                $catNameStmt->close();
            }
            
            error_log("researchSubmit - Category Names: " . print_r($categoryNames, true));
            
            if (empty($categoryNames)) {
                error_log("No valid category names found");
                echo json_encode($response);
                exit();
            }
        }

        $allPapers = [];

        if ($isStudentEvent) {
            error_log("Querying student_research_papers for event $eventId");
            
            // Build query for student_research_papers - ONLY accepted status
            $sql = "SELECT 
                srp.id,
                srp.author,
                srp.presenter,
                srp.coauthor,
                srp.research_file_view_url as drive_view_url,
                srp.title as research_title,
                srp.event,
                srp.event_id,
                srp.category,
                srp.campus,
                srp.event_id as eventId,
                cat.id as catId,
                cat.name as category_name,
                srp.status
            FROM student_research_papers srp
            LEFT JOIN category cat ON srp.category = cat.name
            WHERE srp.event_id = ?
              AND srp.status = 'accepted'";
            
            $params = [$eventId];
            $types = "i";
            
            // Add category filter if needed
            if ($userType === 'category' && !empty($categoryNames)) {
                $catPlaceholders = implode(',', array_fill(0, count($categoryNames), '?'));
                $sql .= " AND srp.category IN ($catPlaceholders)";
                foreach ($categoryNames as $catName) {
                    $params[] = $catName;
                    $types .= "s";
                }
            }
            
            $sql .= " ORDER BY srp.title ASC";
            
            error_log("Student SQL: " . $sql);
            error_log("Student Params: " . print_r($params, true));
            
            $stmt = $con->prepare($sql);
            if ($stmt) {
                $stmt->bind_param($types, ...$params);
                $stmt->execute();
                $result = $stmt->get_result();
                
                while ($val = $result->fetch_assoc()) {
                    $allPapers[] = $val;
                }
                $stmt->close();
            } else {
                error_log("Student prepare failed: " . $con->error);
            }
            
            error_log("Student papers found: " . count($allPapers));
            
        } else {
            error_log("Querying researchfile for event $eventId");
            
            // Build query for researchfile (faculty) - ONLY accepted status
            $sql = "SELECT 
                rf.id,
                rf.author,
                rf.presenter,
                rf.coauthor,
                rf.drive_view_url,
                rf.file as local_file,
                rf.title as research_title,
                rf.final_symposium_title,
                rf.event,
                rf.event_id,      
                rf.category,
                rf.center as center_name,
                rf.campus,
                endorsement.center as endorsement_center,
                event_list.id as eventId,
                category.id as catId,
                category.name as category_name,
                rf.status as research_status,
                endorsement.status as endorsement_status
            FROM researchfile as rf
            LEFT JOIN endorsement ON endorsement.id = rf.endorsementid
            LEFT JOIN event_list ON rf.event_id = event_list.id
            LEFT JOIN category ON rf.category = category.name
            WHERE rf.event_id = ?
              AND (rf.status = 'accepted' OR endorsement.status = 'accepted')";
            
            $params = [$eventId];
            $types = "i";
            
            // Add category filter if needed
            if ($userType === 'category' && !empty($categoryNames)) {
                $catPlaceholders = implode(',', array_fill(0, count($categoryNames), '?'));
                $sql .= " AND rf.category IN ($catPlaceholders)";
                foreach ($categoryNames as $catName) {
                    $params[] = $catName;
                    $types .= "s";
                }
            }
            
            // Add center filter if needed
            if ($userType === 'center' && !empty($center)) {
                $sql .= " AND (rf.center = ? OR rf.center LIKE ?)";
                $params[] = $center;
                $params[] = "%" . $center . "%";
                $types .= "ss";
            }
            
            $sql .= " ORDER BY rf.title ASC";
            
            error_log("Faculty SQL: " . $sql);
            error_log("Faculty Params: " . print_r($params, true));
            
            $stmt = $con->prepare($sql);
            if ($stmt) {
                $stmt->bind_param($types, ...$params);
                $stmt->execute();
                $result = $stmt->get_result();
                
                while ($val = $result->fetch_assoc()) {
                    $allPapers[] = $val;
                }
                $stmt->close();
            } else {
                error_log("Faculty prepare failed: " . $con->error);
            }
            
            error_log("Faculty papers found: " . count($allPapers));
        }

        // Process papers with deduplication
        $processedPapers = [];
        $uniqueIds = [];
        $processedTitles = [];
        
        foreach ($allPapers as $paper) {
            // Skip duplicates by ID
            if (in_array($paper['id'], $uniqueIds)) {
                continue;
            }
            
            // For student papers, also check for title duplicates (fuzzy matching)
            if ($isStudentEvent) {
                $title = isset($paper['research_title']) ? $paper['research_title'] : '';
                $authors = [];
                if (!empty($paper['author'])) {
                    $authors[] = $paper['author'];
                }
                if (!empty($paper['coauthor'])) {
                    $coauthors = json_decode($paper['coauthor'], true);
                    if (is_array($coauthors)) {
                        $authors = array_merge($authors, $coauthors);
                    }
                }
                
                $isDuplicate = false;
                foreach ($processedTitles as $processed) {
                    $titleSimilar = isSimilarString($title, $processed['title'], 80);
                    $authorSimilar = areAuthorsSimilar($authors, $processed['authors'], 70);
                    
                    if ($titleSimilar && $authorSimilar) {
                        $isDuplicate = true;
                        break;
                    }
                }
                
                if ($isDuplicate) {
                    continue;
                }
                
                $processedTitles[] = [
                    'title' => $title,
                    'authors' => $authors
                ];
            }
            
            $uniqueIds[] = $paper['id'];
            
            $data = new stdClass();
            $data->status = isset($paper['status']) ? $paper['status'] : null;
            $data->id = (int)$paper['id'];
            $data->author = isset($paper['author']) ? $paper['author'] : '';
            $data->presenter = isset($paper['presenter']) ? $paper['presenter'] : '';
            $data->coauthor = isset($paper['coauthor']) ? $paper['coauthor'] : '';
            $data->category = isset($paper['category']) ? $paper['category'] : '';
            $data->category_id = isset($paper['catId']) ? $paper['catId'] : null;
            $data->category_name = isset($paper['category_name']) ? $paper['category_name'] : '';
            $data->center = isset($paper['center_name']) ? $paper['center_name'] : (isset($paper['center']) ? $paper['center'] : '');
            $data->campus = isset($paper['campus']) ? $paper['campus'] : '';
            $data->event_id = isset($paper['event_id']) ? $paper['event_id'] : $eventId;
            $data->event = isset($paper['event']) ? $paper['event'] : $eventName;
            
            // Handle file URL - check if drive_view_url exists
            if (isset($paper['drive_view_url']) && !empty($paper['drive_view_url'])) {
                $data->file = $paper['drive_view_url']; 
                $data->file_type = 'drive';
                $data->drive_view_url = $paper['drive_view_url'];
                $data->local_file = isset($paper['local_file']) ? $paper['local_file'] : null;
            } else {
                $data->file = isset($paper['local_file']) ? $paper['local_file'] : null;
                $data->file_type = 'local';
                $data->local_file = isset($paper['local_file']) ? $paper['local_file'] : null;
                $data->drive_view_url = null;
            }

            $data->title = isset($paper['final_symposium_title']) && !empty($paper['final_symposium_title']) 
                ? $paper['final_symposium_title'] 
                : (isset($paper['research_title']) ? $paper['research_title'] : 'Untitled');
            $data->original_title = isset($paper['research_title']) ? $paper['research_title'] : '';
            $data->final_symposium_title = isset($paper['final_symposium_title']) ? $paper['final_symposium_title'] : null;
            $data->eventId = isset($paper['eventId']) ? $paper['eventId'] : null;
            $data->catId = isset($paper['catId']) ? $paper['catId'] : null;
            $data->hasComment = false;
            $data->hasScore = false;

            // Check for comments
            if (!empty($paper['id']) && !empty($evalId)) {
                $comquery = "SELECT 
                    CASE 
                        WHEN COALESCE(comments.title, '') != '' 
                             OR COALESCE(comments.intro, '') != ''
                             OR COALESCE(comments.abstract, '') != ''
                             OR COALESCE(comments.objective, '') != ''
                             OR COALESCE(comments.methodology, '') != ''
                             OR COALESCE(comments.results, '') != ''
                             OR COALESCE(comments.recommendation, '') != ''
                             OR COALESCE(comments.literature, '') != ''
                             OR COALESCE(comments.other, '') != ''
                        THEN 1 ELSE 0 
                    END as has_comment_content
                FROM comments WHERE comments.resid = ? AND comments.evalid = ?";

                $statement = $con->prepare($comquery);
                if ($statement) {
                    $statement->bind_param('ii', $paper['id'], $evalId);
                    $statement->execute();
                    $res = $statement->get_result();

                    while ($v = $res->fetch_assoc()) {
                        $data->hasComment = ($v['has_comment_content'] == 1);
                    }
                    $statement->close();
                }
            }

            // Check for scores
            if (!empty($paper['id']) && !empty($evalId)) {
                $scoreQuery = "SELECT 
                    CASE 
                        WHEN COUNT(*) > 0 AND SUM(CASE WHEN score IS NOT NULL THEN 1 ELSE 0 END) > 0
                        THEN 1 ELSE 0 
                    END as has_score_content
                FROM score_board 
                WHERE doc_id = ? AND eval_id = ?";

                $scoreStmt = $con->prepare($scoreQuery);
                if ($scoreStmt) {
                    $scoreStmt->bind_param('ii', $paper['id'], $evalId);
                    $scoreStmt->execute();
                    $scoreResult = $scoreStmt->get_result();

                    if ($scoreRow = $scoreResult->fetch_assoc()) {
                        $data->hasScore = ($scoreRow['has_score_content'] == 1);
                    }
                    $scoreStmt->close();
                }
            }

            $processedPapers[] = $data;
        }
        
        $response->list = $processedPapers;
        $response->totalUnique = count($processedPapers);
        $response->totalDuplicateCount = count($allPapers) - count($processedPapers);
        $response->hasDuplicates = ($response->totalDuplicateCount > 0);
        $response->source_table = $isStudentEvent ? 'student_research_papers' : 'researchfile';
        $response->is_student_event = $isStudentEvent;
        $response->event_name = $eventName;
        $response->source_count = count($allPapers);
        $response->message = 'Successfully loaded ' . count($processedPapers) . ' papers from ' . ($isStudentEvent ? 'student' : 'faculty') . ' table';

        error_log("Total papers found: " . count($allPapers) . ", Unique: " . count($processedPapers) . ", Duplicates removed: " . (count($allPapers) - count($processedPapers)));
        
    } else {
        $response->message = 'Database connection failed';
        error_log("researchSubmit - Database connection failed");
    }
    
    // Ensure no extra output
    ob_clean();
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

if (isset($_POST['getDocTitle'])) {
    $response = new stdClass();
    $response->status = false;
    $response->title = '';
    $response->message = '';
    $response->source_table = '';
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docId = $_POST['docId'];
        
        // ============================================================
        // STEP 1: Check student_research_papers FIRST
        // ============================================================
        $studentQuery = "SELECT title, event_id, event, status, category, author, presenter 
                         FROM student_research_papers 
                         WHERE id = ?";
        $studentStmt = $con->prepare($studentQuery);
        if ($studentStmt) {
            $studentStmt->bind_param("s", $docId);
            $studentStmt->execute();
            $studentResult = $studentStmt->get_result();
            
            if ($row = $studentResult->fetch_assoc()) {
                $response->status = true;
                $response->title = $row['title'];
                $response->source_table = 'student_research_papers';
                $response->event_id = $row['event_id'];
                $response->event = $row['event'];
                $response->status_doc = $row['status'];
                $response->category = $row['category'];
                $response->author = $row['author'];
                $response->presenter = $row['presenter'];
                $response->final_symposium_title = null; // Student papers don't have this
                
                error_log("getDocTitle - Found in student_research_papers: Doc ID $docId, Title: " . $row['title']);
                
                $studentStmt->close();
                $con->close();
                header('Content-Type: application/json');
                echo json_encode($response);
                exit();
            }
            $studentStmt->close();
        }
        
        // ============================================================
        // STEP 2: If not found in student, check researchfile
        // ============================================================
        $query = "SELECT title, final_symposium_title, event_id, event, status, category, author, presenter 
                  FROM researchfile 
                  WHERE id = ?";
        $stmt = $con->prepare($query);
        if ($stmt) {
            $stmt->bind_param("s", $docId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($row = $result->fetch_assoc()) {
                $response->status = true;
                // Prioritize final_symposium_title, fallback to title
                $response->title = !empty($row['final_symposium_title']) 
                    ? $row['final_symposium_title'] 
                    : $row['title'];
                $response->source_table = 'researchfile';
                $response->event_id = $row['event_id'];
                $response->event = $row['event'];
                $response->status_doc = $row['status'];
                $response->category = $row['category'];
                $response->author = $row['author'];
                $response->presenter = $row['presenter'];
                $response->original_title = $row['title'];
                $response->final_symposium_title = $row['final_symposium_title'];
                
                error_log("getDocTitle - Found in researchfile: Doc ID $docId, Title: " . $row['title']);
                
                $stmt->close();
                $con->close();
                header('Content-Type: application/json');
                echo json_encode($response);
                exit();
            }
            $stmt->close();
        }
        
        // ============================================================
        // STEP 3: Document not found in either table
        // ============================================================
        $response->message = 'Document not found with ID: ' . $docId;
        error_log("getDocTitle - Document not found: Doc ID $docId");
        
        $con->close();
    } else {
        $response->message = 'Database connection failed';
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

if (isset($_POST['updateReview'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->queueStatus = '';

    // Log all POST data for debugging
    error_log("=== updateReview called ===");
    error_log("POST data: " . print_r($_POST, true));

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $category = $_SESSION['category'] ?? $_SESSION['center'] ?? '';
        $response->userName = $_SESSION['userName'] ?? '';
        $evalId = $_SESSION['userId'] ?? 0;
        $evalName = $_SESSION['userFulname'] ?? '';
        $docsId = $_POST['docId'] ?? '';
        $eventId = $_POST['eventId'] ?? null;

        error_log("evalId: $evalId, docsId: $docsId, eventId: $eventId");

        // Verify the document exists and get its details
        if (empty($docsId)) {
            $response->message = "Document ID is required";
            error_log("ERROR: Document ID is empty");
            echo json_encode($response);
            exit();
        }

        // Clean the docId
        if (strpos($docsId, '?') !== false) {
            $docsId = explode('?', $docsId)[0];
        }
        if (strpos($docsId, '&') !== false) {
            $docsId = explode('&', $docsId)[0];
        }
        $docsId = (int)preg_replace('/[^0-9]/', '', $docsId);
        
        if (empty($docsId)) {
            $response->message = "Invalid document ID";
            error_log("ERROR: Invalid document ID after cleaning");
            echo json_encode($response);
            exit();
        }

        // Determine which table to query based on event name
        $isStudent = false;
        $eventName = null;
        $sourceTable = 'researchfile';
        $docInfo = null;

        // If eventId is provided, get the event name
        if (!empty($eventId)) {
            $eventQuery = "SELECT name FROM event_list WHERE id = ? LIMIT 1";
            $eventStmt = $con->prepare($eventQuery);
            if ($eventStmt) {
                $eventStmt->bind_param("i", $eventId);
                $eventStmt->execute();
                $eventResult = $eventStmt->get_result();
                if ($row = $eventResult->fetch_assoc()) {
                    $eventName = $row['name'];
                    $lowerEventName = strtolower($eventName);
                    // Check if it's a student event
                    if (strpos($lowerEventName, 'undergraduate') !== false || 
                        strpos($lowerEventName, 'graduate') !== false ||
                        strpos($lowerEventName, 'student') !== false) {
                        $isStudent = true;
                        $sourceTable = 'student_research_papers';
                    }
                }
                $eventStmt->close();
            }
        }

        // If no eventId or not found, try to determine from the document
        if (!$eventName) {
            // Check student_research_papers first
            $studentCheck = "SELECT id, event, event_id FROM student_research_papers WHERE id = ? LIMIT 1";
            $studentStmt = $con->prepare($studentCheck);
            if ($studentStmt) {
                $studentStmt->bind_param("i", $docsId);
                $studentStmt->execute();
                $studentResult = $studentStmt->get_result();
                if ($row = $studentResult->fetch_assoc()) {
                    $eventName = $row['event'];
                    $eventId = $row['event_id'];
                    $isStudent = true;
                    $sourceTable = 'student_research_papers';
                    error_log("Document found in student_research_papers: docsId=$docsId");
                }
                $studentStmt->close();
            }
        }

        // If not found in student, check researchfile
        if (!$eventName) {
            $facultyCheck = "SELECT id, event, event_id FROM researchfile WHERE id = ? LIMIT 1";
            $facultyStmt = $con->prepare($facultyCheck);
            if ($facultyStmt) {
                $facultyStmt->bind_param("i", $docsId);
                $facultyStmt->execute();
                $facultyResult = $facultyStmt->get_result();
                if ($row = $facultyResult->fetch_assoc()) {
                    $eventName = $row['event'];
                    $eventId = $row['event_id'];
                    $isStudent = false;
                    $sourceTable = 'researchfile';
                    error_log("Document found in researchfile: docsId=$docsId");
                }
                $facultyStmt->close();
            }
        }

        // Get document info from the appropriate table
        if ($isStudent) {
            $docQuery = $con->prepare("SELECT 
                srp.id,
                srp.title,
                srp.event,
                srp.event_id,
                srp.author,
                srp.coauthor,
                srp.presenter,
                srp.category,
                srp.campus,
                NULL as final_symposium_title,
                NULL as center,
                NULL as file,
                NULL as drive_view_url,
                NULL as paper_trail_no,
                el.name as event_name
            FROM student_research_papers srp
            LEFT JOIN event_list el ON el.id = srp.event_id
            WHERE srp.id = ? LIMIT 1");
        } else {
            $docQuery = $con->prepare("SELECT 
                rf.id,
                rf.title,
                rf.final_symposium_title,
                rf.event,
                rf.event_id,
                rf.author,
                rf.coauthor,
                rf.presenter,
                rf.category,
                rf.center,
                rf.campus,
                rf.file,
                rf.drive_view_url,
                rf.paper_trail_no,
                el.name as event_name
            FROM researchfile rf
            LEFT JOIN event_list el ON el.id = rf.event_id
            WHERE rf.id = ? LIMIT 1");
        }

        if ($docQuery) {
            $docQuery->bind_param("i", $docsId);
            $docQuery->execute();
            $docResult = $docQuery->get_result();
            $docInfo = $docResult->fetch_assoc();
            $docQuery->close();
            
            if ($docInfo) {
                $eventName = $docInfo['event_name'] ?? $docInfo['event'] ?? $eventName;
                $eventId = $docInfo['event_id'] ?? $eventId;
                $researchTitle = $docInfo['title'] ?? '';
                $finalSymposiumTitle = $docInfo['final_symposium_title'] ?? '';
                error_log("Document info retrieved from $sourceTable");
            }
        }

        if (!$docInfo) {
            $response->message = "Document not found with ID: $docsId";
            error_log("ERROR: Document not found with ID: $docsId");
            echo json_encode($response);
            exit();
        }

        $title = $_POST['title'] ?? '';
        $intro = $_POST['intro'] ?? '';
        $abstract = $_POST['abstract'] ?? '';
        $objective = $_POST['objective'] ?? '';
        $methodology = $_POST['methodology'] ?? '';
        $results = $_POST['results'] ?? '';
        $recommendation = $_POST['recommendation'] ?? '';
        $literature = $_POST['literature'] ?? '';
        $other = $_POST['other'] ?? '';

        error_log("Comment data - title: '$title', intro: '$intro', abstract: '$abstract'");

        // Check if comments exist for this evaluator and document
        $found = false;
        if ($docsId && $evalId) {
            $checkQuery = $con->prepare("SELECT COUNT(*) as count FROM comments WHERE evalid = ? AND resid = ?");
            if ($checkQuery) {
                $checkQuery->bind_param("ii", $evalId, $docsId);
                $checkQuery->execute();
                $checkResult = $checkQuery->get_result();
                $row = $checkResult->fetch_assoc();
                $found = ($row['count'] > 0);
                $checkQuery->close();
                error_log("Comments exist: " . ($found ? 'yes' : 'no'));
            }
        }

        // Use the title from the database for display
        $displayTitle = !empty($finalSymposiumTitle) ? $finalSymposiumTitle : $researchTitle;
        error_log("Display title for document: $displayTitle");

        $saveSuccess = false;

        if ($found) {
            // Update existing comments
            $comQ = "UPDATE comments SET 
                comments.title = ?,
                comments.intro = ?,
                comments.abstract = ?,
                comments.objective = ?,
                comments.methodology = ?,
                comments.results = ?,
                comments.recommendation = ?,
                comments.literature = ?,
                comments.other = ?,
                comments.eventType = ?,
                comments.isCommented = 1,
                comments.date = NOW()
                WHERE comments.resid = ? AND comments.evalid = ?";

            error_log("UPDATE Query: " . $comQ);

            $statement = $con->prepare($comQ);
            if (!$statement) {
                $response->message = "Failed to prepare update query: " . $con->error;
                error_log("Failed to prepare update query: " . $con->error);
                echo json_encode($response);
                exit();
            }
            
            $statement->bind_param(
                "ssssssssssii",
                $title,
                $intro,
                $abstract,
                $objective,
                $methodology,
                $results,
                $recommendation,
                $literature,
                $other,
                $eventName,
                $docsId,
                $evalId
            );

            error_log("Binding values: title='$title', intro='$intro', abstract='$abstract', docsId='$docsId', evalId='$evalId'");

            $status = $statement->execute();

            if ($status) {
                $response->status = true;
                $response->message = "Comments Updated successfully..!";
                $saveSuccess = true;
                error_log("UPDATE successful");
            } else {
                $response->message = "Update failed: " . $statement->error;
                error_log("UPDATE failed: " . $statement->error);
            }
            $statement->close();
        } else {
            // Insert new comments
            $comQuery = "INSERT INTO comments (
                resid,
                evalid,
                evID,
                eventType,
                title,
                intro,
                abstract,
                objective,
                methodology,
                results,
                recommendation,
                literature,
                other,
                isCommented,
                date ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())";

            error_log("INSERT Query: " . $comQuery);

            $statementQ = $con->prepare($comQuery);
            if (!$statementQ) {
                $response->message = "Failed to prepare insert query: " . $con->error;
                error_log("Failed to prepare insert query: " . $con->error);
                echo json_encode($response);
                exit();
            }
            
            $statementQ->bind_param(
                "iiissssssssss",
                $docsId,
                $evalId,
                $eventId,
                $eventName,
                $title,
                $intro,
                $abstract,
                $objective,
                $methodology,
                $results,
                $recommendation,
                $literature,
                $other
            );

            error_log("Binding values: docsId='$docsId', evalId='$evalId', eventId='$eventId', eventType='$eventName'");

            $statusIn = $statementQ->execute();

            if ($statusIn) {
                $response->status = true;
                $response->message = "Comments Saved successfully..!";
                $saveSuccess = true;
                error_log("INSERT successful");
            } else {
                $response->message = "Insert failed: " . $statementQ->error;
                error_log("INSERT failed: " . $statementQ->error);
            }
            $statementQ->close();
        }

        // If comments were saved successfully, queue for scheduled email
        if ($saveSuccess && !empty($docInfo)) {
            $queueResult = queueCommentForEmail($con, $docsId, $evalId, $evalName, $docInfo, $displayTitle, $eventId, $eventName);
            
            if ($queueResult['status']) {
                $response->queueStatus = $queueResult['message'];
                error_log("Email queued: " . $queueResult['message']);
            } else {
                $response->queueStatus = "Warning: " . $queueResult['message'];
                error_log("Email queue warning: " . $queueResult['message']);
            }
        } else {
            $response->queueStatus = "Comments saved but no email notification queued (no author email found).";
        }

        $con->close();

    } else {
        $response->message = "Database connection error";
        error_log("Database connection error");
    }

    // Ensure we always return JSON
    header('Content-Type: application/json');
    $jsonResponse = json_encode($response);
    error_log("Response: " . $jsonResponse);
    echo $jsonResponse;
    exit();
}

function queueCommentForEmail($con, $docsId, $evalId, $evalName, $docInfo, $displayTitle, $eventId, $eventType)
{
    $result = ['status' => false, 'message' => ''];

    try {
        // Check if there are actual comments
        $commentQuery = "SELECT 
            c.intro, c.abstract, c.objective, c.methodology, 
            c.results, c.recommendation, c.literature, c.other,
            r.author, r.coauthor, r.presenter, r.campus,
            a.id as acceptance_id, a.date_to_be_held
        FROM comments c
        LEFT JOIN researchfile r ON c.resid = r.id
        LEFT JOIN acceptance_letter_data a ON r.event_id = a.event_id
        WHERE c.resid = ? AND c.evalid = ?";
        
        $commentStmt = $con->prepare($commentQuery);
        $commentStmt->bind_param("si", $docsId, $evalId);
        $commentStmt->execute();
        $commentResult = $commentStmt->get_result();
        $commentData = $commentResult->fetch_assoc();
        $commentStmt->close();

        if (!$commentData) {
            return ['status' => false, 'message' => 'No comments found'];
        }

        // Check if there are actual comments (not empty)
        $hasComments = false;
        $sections = ['intro', 'abstract', 'objective', 'methodology', 'results', 'recommendation', 'literature', 'other'];
        foreach ($sections as $section) {
            if (!empty($commentData[$section]) && trim($commentData[$section]) !== '') {
                $hasComments = true;
                break;
            }
        }

        if (!$hasComments) {
            return ['status' => false, 'message' => 'No comments have been added'];
        }

        // Get author emails from account_detail
        $authorEmails = [];
        $authorName = '';

        // Get author
        if (!empty($docInfo['author'])) {
            $authorName = $docInfo['author'];
            $authQuery = "SELECT email FROM account_detail WHERE fullName = ? AND (usertype = 'Research Chair' OR usertype = 'User')";
            $authStmt = $con->prepare($authQuery);
            $authStmt->bind_param("s", $docInfo['author']);
            $authStmt->execute();
            $authResult = $authStmt->get_result();
            while ($row = $authResult->fetch_assoc()) {
                if (!in_array($row['email'], $authorEmails)) {
                    $authorEmails[] = $row['email'];
                }
            }
            $authStmt->close();
        }

        // Get presenter
        if (!empty($docInfo['presenter'])) {
            if (empty($authorName)) $authorName = $docInfo['presenter'];
            $presQuery = "SELECT email FROM account_detail WHERE fullName = ? AND (usertype = 'Research Chair' OR usertype = 'User')";
            $presStmt = $con->prepare($presQuery);
            $presStmt->bind_param("s", $docInfo['presenter']);
            $presStmt->execute();
            $presResult = $presStmt->get_result();
            while ($row = $presResult->fetch_assoc()) {
                if (!in_array($row['email'], $authorEmails)) {
                    $authorEmails[] = $row['email'];
                }
            }
            $presStmt->close();
        }

        // If no emails found, return warning
        if (empty($authorEmails)) {
            return ['status' => false, 'message' => 'No author emails found to notify'];
        }

        // Get acceptance letter date
        $acceptanceId = $commentData['acceptance_id'] ?? null;
        $eventDate = $commentData['date_to_be_held'] ?? null;

        // If no event date found, use current date + 1 day as fallback
        if (empty($eventDate)) {
            $eventDate = date('Y-m-d H:i:s', strtotime('+1 day'));
        }

        // Calculate scheduled date (event date + 1 day after by default)
        $scheduledDateTime = new DateTime($eventDate);
        $scheduledDateTime->modify('+1 day');
        $scheduledDate = $scheduledDateTime->format('Y-m-d H:i:s');

        // Get comment sections that have content
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

        // Insert into email_queue for each author email
        $queuedCount = 0;
        foreach ($authorEmails as $email) {
            if (empty($email)) continue;

            // Check if already queued for this document and evaluator
            $checkQueueQuery = "SELECT id FROM email_queue 
                               WHERE document_id = ? AND evaluator_id = ? AND author_email = ? 
                               AND status IN ('pending', 'processing')";
            $checkQueueStmt = $con->prepare($checkQueueQuery);
            $checkQueueStmt->bind_param("iis", $docsId, $evalId, $email);
            $checkQueueStmt->execute();
            $checkQueueResult = $checkQueueStmt->get_result();

            if ($checkQueueResult->num_rows > 0) {
                // Already queued, skip
                $checkQueueStmt->close();
                continue;
            }
            $checkQueueStmt->close();

            // Insert into email_queue
            $insertQuery = "INSERT INTO email_queue 
                            (document_id, document_title, evaluator_id, evaluator_name, 
                             author_name, author_email, event_id, acceptance_letter_id,
                             scheduled_date, status, email_type, comment_sections, created_at) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'comment_notification', ?, NOW())";

            $insertStmt = $con->prepare($insertQuery);
            
            // Use the display title from docInfo
            $docTitleForQueue = $displayTitle ?: ($docInfo['title'] ?? 'Untitled Document');
            
            $insertStmt->bind_param("isissiisss", 
                $docsId, 
                $docTitleForQueue,
                $evalId, 
                $evalName ?: 'Unknown Evaluator',
                $authorName,
                $email, 
                $eventId, 
                $acceptanceId,
                $scheduledDate,
                $commentSectionsStr
            );

            if ($insertStmt->execute()) {
                $queuedCount++;
            }
            $insertStmt->close();
        }

        // Log to email_log for tracking
        if ($queuedCount > 0) {
            foreach ($authorEmails as $email) {
                $logQuery = "INSERT INTO email_log 
                             (document_id, evaluator_id, author_email, sent_date, email_type, status) 
                             VALUES (?, ?, ?, NOW(), 'comment_queued', 0)";
                $logStmt = $con->prepare($logQuery);
                $logStmt->bind_param("iis", $docsId, $evalId, $email);
                $logStmt->execute();
                $logStmt->close();
            }

            return [
                'status' => true, 
                'message' => "Comments queued for scheduled email (" . $queuedCount . " recipient(s)) on " . $scheduledDate
            ];
        } else {
            return ['status' => false, 'message' => 'No new email queue entries added'];
        }

    } catch (Exception $e) {
        error_log('queueCommentForEmail error: ' . $e->getMessage());
        return ['status' => false, 'message' => 'Error queueing email: ' . $e->getMessage()];
    }
}

function sendCommentEmail($con, $evaluatorName, $docInfo, $comments, $docsId, $evalId, $rdeEmail, $emailPassword)
{
    // Use the display title (final_symposium_title if available)
    $displayTitle = !empty($docInfo['display_title']) 
        ? $docInfo['display_title'] 
        : (!empty($docInfo['final_symposium_title']) 
            ? $docInfo['final_symposium_title'] 
            : $docInfo['title'] ?? 'Research Document');

    if (empty($docInfo) || empty($docInfo['email'])) {
        return "Could not send email: No author email found.";
    }

    // Clean the comments before sending
    $cleanedComments = [];
    foreach ($comments as $key => $comment) {
        $cleanedComments[$key] = cleanCommentHtml($comment);
    }

    // Check if there are any actual comments after cleaning
    $hasComments = false;
    foreach ($cleanedComments as $comment) {
        if (!empty(trim(strip_tags($comment)))) {
            $hasComments = true;
            break;
        }
    }

    if (!$hasComments) {
        return "No email sent: No comments were added.";
    }

    // Get the system base URL
    $baseUrl = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https://" : "http://";
    $baseUrl .= $_SERVER['HTTP_HOST'];
    $documentUrl = $baseUrl . "/account/Login?redirect=";

    // Prepare the email
    $from = new stdClass();
    $from->email = $rdeEmail;
    $from->password = $emailPassword;
    $from->name = 'CAPSU RDE System';

    $to = new stdClass();
    $to->name = $docInfo['fullName'] ?? $docInfo['author'];
    $to->email = $docInfo['email'];

    // Generate email content - use display title
    $emailContent = CommentNotification(
        $evaluatorName,
        $docInfo['event_name'] ?? 'Research Event',
        $displayTitle, // Use the display title
        $docInfo['center'] ?? $docInfo['endorsement_center'],
        $docInfo['author'],
        $cleanedComments,
        $documentUrl
    );

    // Send email
    $mailResult = SendEmail($from, $to, $emailContent);

    if ($mailResult->status) {
        // Log the email sending
        $logQuery = "INSERT INTO email_log (document_id, evaluator_id, author_email, sent_date, email_type) 
                     VALUES (?, ?, ?, NOW(), 'comment_notification')";
        $logStmt = $con->prepare($logQuery);
        $logStmt->bind_param("sss", $docsId, $evalId, $to->email);
        $logStmt->execute();

        return "Email notification sent to author.";
    } else {
        return "Failed to send email: " . ($mailResult->message ?? 'Unknown error');
    }
}

function cleanCommentHtml($html)
{
    if (empty($html)) {
        return '';
    }
    $html = html_entity_decode($html, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $html = str_replace('&nbsp;', ' ', $html);
    $html = preg_replace('/\s+/', ' ', $html);
    $html = trim($html);
    $html = preg_replace('/<(\w+)[^>]*>\s*<\/\1>/', '', $html);
    $html = preg_replace('/<(\w+)[^>]*>(\s|&nbsp;)*<\/\1>/', '', $html);
    $html = str_replace(['<br>', '<br/>', '<br />'], "\n", $html);
    $plainText = strip_tags($html);

    return $plainText;
}

if (isset($_POST['getEventInfo'])) {
    $response = ['status' => false, 'event_id' => null, 'event_name' => null, 'source_table' => null];
    
    try {
        $docId = $_POST['docId'] ?? 0;
        
        if (empty($docId)) {
            throw new Exception('Document ID required');
        }
        
        $con = new mysqli($host, $username, $pass, $dbName);
        
        if ($con->connect_error) {
            throw new Exception('Database connection failed: ' . $con->connect_error);
        }
        
        // ============================================================
        // STEP 1: Check student_research_papers FIRST
        // ============================================================
        $query = "SELECT event_id, event, status FROM student_research_papers WHERE id = ?";
        $stmt = $con->prepare($query);
        if ($stmt) {
            $stmt->bind_param("i", $docId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($row = $result->fetch_assoc()) {
                $response['status'] = true;
                $response['event_id'] = (int)$row['event_id'];
                $response['event_name'] = $row['event'];
                $response['source_table'] = 'student_research_papers';
                $response['doc_status'] = $row['status'];
                error_log("getEventInfo - Found in student_research_papers: Doc ID $docId, Event ID " . $row['event_id']);
                $stmt->close();
                $con->close();
                header('Content-Type: application/json');
                echo json_encode($response);
                exit();
            }
            $stmt->close();
        }
        
        // ============================================================
        // STEP 2: If not found in student, check researchfile
        // ============================================================
        $query = "SELECT r.event_id, r.event, r.status FROM researchfile r WHERE r.id = ?";
        $stmt = $con->prepare($query);
        if ($stmt) {
            $stmt->bind_param("i", $docId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($row = $result->fetch_assoc()) {
                $response['status'] = true;
                $response['event_id'] = (int)$row['event_id'];
                $response['event_name'] = $row['event'];
                $response['source_table'] = 'researchfile';
                $response['doc_status'] = $row['status'];
                error_log("getEventInfo - Found in researchfile: Doc ID $docId, Event ID " . $row['event_id']);
                $stmt->close();
                $con->close();
                header('Content-Type: application/json');
                echo json_encode($response);
                exit();
            }
            $stmt->close();
        }
        
        // ============================================================
        // STEP 3: Document not found in either table
        // ============================================================
        $response['status'] = false;
        $response['message'] = 'Document not found in either table (ID: ' . $docId . ')';
        error_log("getEventInfo - Document not found: Doc ID $docId");
        
        $con->close();
        
    } catch (Exception $e) {
        error_log('getEventInfo error: ' . $e->getMessage());
        $response['status'] = false;
        $response['message'] = $e->getMessage();
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

if (isset($_POST['accessPermission'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $account = $_POST['userId'];

        $query = "UPDATE `account` SET `researchaccess`='allow' WHERE `id`='$account'";

        if ($con->query($query)) {

            $response->status = true;

            $response->message = 'Account added successfully..!';

        } else {

            $response->message = 'Something went wrong ' . $con->error;

        }

    } else {

        $response->message = 'failed to connect...!';

    }

    echo json_encode($response);

}

if (isset($_POST['endorsementApproval'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $accountID = $_POST['accountID'];

        $query = "UPDATE `account` SET `endorsement`='allow' WHERE `id`='$accountID'";

        if ($con->query($query)) {

            $response->status = true;

            $response->message = 'Account added..!';

        } else {

            $response->message = 'Something went wrong ' . $con->error;

        }

    } else {

        $response->message = 'failed to connect...!';

    }

    echo json_encode($response);

}

if (isset($_POST['accessGrantEndorsement'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $response->data = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        //`id`, `username`, `name`, `password`, `office`, `signature`, `position`, `data`, `researchaccess`

        $query = "SELECT * FROM `account`";



        foreach ($con->query($query) as $val) {

            if ($val['endorsement'] !== null) {

                $da = new stdClass();

                $da->email = $val['email'];

                $da->id = $val['id'];

                $da->office = $val['office'];

                $da->fullname = $val['fullname'];

                $response->data[] = $da;

            }

        }

    } else {

        $response->message = 'Connection failed..!';

    }

    echo json_encode($response);

}

if (isset($_POST['accessGrant'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $response->data = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        //`id`, `username`, `name`, `password`, `office`, `signature`, `position`, `data`, `researchaccess`

        $query = "SELECT * FROM `account` WHERE  `researchaccess` IS NOT NULL ";



        foreach ($con->query($query) as $val) {

            $da = new stdClass();

            $da->name = $val['name'];

            $da->fullName = $val['fullname'];

            $da->id = $val['id'];

            $da->office = $val['office'];

            $response->data[] = $da;

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}

if (isset($_POST['allaccount'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $response->data = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        //`id`, `username`, `name`, `password`, `office`, `signature`, `position`, `data`, `researchaccess`

        $query = "SELECT * FROM `account` ";



        foreach ($con->query($query) as $val) {

            $da = new stdClass();

            $da->name = $val['name'];

            $da->id = $val['id'];

            $da->office = $val['office'];

            $response->data[] = $da;

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}

if (isset($_POST['removeAccess'])) {
    //UPDATE `account` SET `researchaccess`=[value-9] WHERE `id`
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $accountID = $_POST['accountID'];
        $query = "UPDATE `account` SET `endorsement`=null WHERE `id`='$accountID'";
        if ($con->query($query)) {
            $response->status = true;
        } else {
            $response->message = $con->error;
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['removeAccessRes'])) {
    //UPDATE `account` SET `researchaccess`=[value-9] WHERE `id`
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $accountID = $_POST['accountID'];
        $query = "UPDATE `account` SET `researchaccess`=null WHERE `id`='$accountID'";
        if ($con->query($query)) {
            $response->status = true;
        } else {
            $response->message = $con->error;
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

//This method was used befor for viewing of endorsement letter
if (isset($_POST['researchFileAdmin'])) {
    $response = new stdClass();
    $response->list = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        // UPDATED QUERY for Google Drive
        $queryAd = "SELECT 
            researchfile.id,
            researchfile.senderid,
            researchfile.author,
            researchfile.drive_view_url as file,
            researchfile.drive_file_id,
            researchfile.drive_download_url,
            researchfile.drive_folder_id,
            researchfile.drive_event_folder_id,
            researchfile.drive_center_folder_id,
            researchfile.title,
            researchfile.category,
            researchfile.campus,
            researchfile.coauthor as proponent,
            researchfile.status,
            researchfile.event
        FROM `researchfile`";

        foreach ($con->query($queryAd) as $val) {
            $data = new stdClass();
            $data->id = $val['id'];
            $data->senderId = $val['senderid'];
            $data->author = $val['author'];
            $data->file = $val['file']; // Google Drive URL
            $data->drive_file_id = $val['drive_file_id'];
            $data->drive_download_url = $val['drive_download_url'];
            $data->drive_folder_id = $val['drive_folder_id'];
            $data->drive_event_folder_id = $val['drive_event_folder_id'];
            $data->drive_center_folder_id = $val['drive_center_folder_id'];
            $data->title = $val['title'];
            $data->category = $val['category'];
            $data->campus = $val['campus'];
            $data->proponent = $val['proponent'];
            $data->date = $val['date'] ?? null;
            $data->status = $val['status'];
            $data->event = $val['event'];

            if (is_null($val['status'])) {
                array_splice($response->list, 0, 0, [$data]);
            } else {
                $response->list[] = $data;
            }
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['getResearch'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->list = [];
    $response->hasMore = false;
    $response->lastId = 0;

    // Pagination parameters
    $limit = isset($_POST['limit']) ? intval($_POST['limit']) : 20;
    $lastId = isset($_POST['lastId']) ? intval($_POST['lastId']) : 0;

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $serderId = $_SESSION['userId'] ?? 0;

        // Check user access
        $accessQuery = "SELECT `researchaccess` FROM `account` WHERE `id`='$serderId'";
        $accessResult = $con->query($accessQuery);
        $accessRow = $accessResult->fetch_assoc();

        // Helper function to determine status
        $getDisplayStatus = function ($status, $revisionStatus, $presentationDate) {
            $currentDate = date('Y-m-d H:i:s');

            // If date_of_presentation is NULL, use rf.status
            if (empty($presentationDate)) {
                return $status ?? 'pending';
            }

            // If date_of_presentation has value
            if (!empty($presentationDate)) {
                // Check if presentation date has passed
                if ($presentationDate < $currentDate) {
                    // Event already presented - use revision_status
                    return !empty($revisionStatus) ? $revisionStatus : 'revision_pending';
                } else {
                    // Future presentation date - use original status
                    return $status ?? 'pending';
                }
            }

            // Fallback
            return $status ?? 'pending';
        };

        $statusUpdateFilter = ($accessRow && $accessRow['researchaccess'] !== null) ? "" : " AND rf.senderid = '$serderId'";

        if ($accessRow && $accessRow['researchaccess'] !== null) {
            // Query for users with research access - keyset pagination
            $query = "SELECT 
                rf.id,
                rf.author,
                rf.drive_view_url as file_url,
                rf.title,
                rf.category,
                rf.campus,
                rf.coauthor,
                rf.presenter,
                rf.status,
                rf.revision_status,
                rf.revision_count,
                rf.title_changed,
                el.date_of_presentation
            FROM `researchfile` rf
            LEFT JOIN `event_list` el ON rf.event_id = el.id
            WHERE rf.id > $lastId
            ORDER BY rf.id ASC
            LIMIT $limit";

            $result = $con->query($query);

            while ($row = $result->fetch_assoc()) {
                $data = new stdClass();
                $data->id = $row['id'];
                $data->author = $row['author'];
                $data->file = $row['file_url'];
                $data->title = $row['title'];
                $data->category = $row['category'];
                $data->campus = $row['campus'];
                $data->coauthor = $row['coauthor'];
                $data->presenter = $row['presenter'];

                // Calculate display status on server
                $data->status = $getDisplayStatus(
                    $row['status'],
                    $row['revision_status'],
                    $row['date_of_presentation']
                );

                $data->revision_status = $row['revision_status'];
                $data->revision_count = $row['revision_count'];
                $data->title_changed = $row['title_changed'];
                $data->file_type = 'drive';
                $response->list[] = $data;
                $response->lastId = $row['id'];
            }

            // Check if more records exist
            $checkQuery = "SELECT COUNT(*) as count FROM `researchfile` WHERE id > " . $response->lastId;
            $checkResult = $con->query($checkQuery);
            $checkRow = $checkResult->fetch_assoc();
            $response->hasMore = ($checkRow['count'] > 0);

        } else {
            // Query for regular users - keyset pagination
            $query = "SELECT 
                rf.id,
                rf.author,
                rf.drive_view_url as file_url,
                rf.title,
                rf.category,
                rf.campus,
                rf.coauthor,
                rf.presenter,
                rf.status,
                rf.year,
                rf.month,
                rf.date,
                rf.revision_status,
                rf.revision_count,
                rf.title_changed,
                el.date_of_presentation
            FROM `researchfile` rf
            LEFT JOIN `event_list` el ON rf.event_id = el.id
            WHERE rf.senderid='$serderId' AND rf.id > $lastId
            ORDER BY rf.id ASC
            LIMIT $limit";

            $result = $con->query($query);

            while ($row = $result->fetch_assoc()) {
                $data = new stdClass();
                $data->id = $row['id'];
                $data->sender = $row['author'];
                $data->file = $row['file_url'];
                $data->title = $row['title'];
                $data->category = $row['category'];
                $data->campus = $row['campus'];
                $data->coauthor = $row['coauthor'];
                $data->presenter = $row['presenter'];

                // Calculate display status on server
                $data->status = $getDisplayStatus(
                    $row['status'],
                    $row['revision_status'],
                    $row['date_of_presentation']
                );

                $data->revision_status = $row['revision_status'];
                $data->revision_count = $row['revision_count'];
                $data->title_changed = $row['title_changed'];
                $data->year = $row['year'];
                $data->month = $row['month'];
                $data->date = $row['month'] . '/' . $row['date'] . '/' . $row['year'];
                $data->file_type = 'drive';

                $response->list[] = $data;
                $response->lastId = $row['id'];
            }

            // Check if more records exist
            $checkQuery = "SELECT COUNT(*) as count FROM `researchfile` WHERE `senderid`='$serderId' AND id > " . $response->lastId;
            $checkResult = $con->query($checkQuery);
            $checkRow = $checkResult->fetch_assoc();
            $response->hasMore = ($checkRow['count'] > 0);
        }

        $response->status = true;
        $con->close();
    }

    echo json_encode($response);
}

if (isset($_POST['getEndorse'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->list = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $serderId = $_SESSION['userId'];

        foreach ($con->query("SELECT  `endorsement` FROM `account` WHERE `id`='$serderId'") as $val) {
            if ($val['endorsement'] !== null) {

                // UPDATED QUERY for Google Drive
                foreach ($con->query("SELECT 
                    researchfile.id,
                    researchfile.author,
                    researchfile.drive_view_url as file,
                    researchfile.drive_file_id,
                    researchfile.drive_download_url,
                    researchfile.endorsement,
                    researchfile.title,
                    researchfile.category,
                    researchfile.campus,
                    researchfile.coauthor,
                    researchfile.presenter,
                    researchfile.status
                FROM `researchfile`") as $v) {

                    $data = new stdClass();
                    $data->id = $v['id'];
                    $data->author = $v['author'];
                    $data->file = $v['file']; // Google Drive URL
                    $data->drive_file_id = $v['drive_file_id'];
                    $data->drive_download_url = $v['drive_download_url'];
                    $data->endorsement = $v['endorsement'];
                    $data->userId = $serderId;
                    $data->signurl = $_SESSION['userEsign'];

                    if ($v['approval'] === null) {
                        $v['approval'] = json_encode([]);
                    }

                    $app = json_decode($v['approval']);
                    $data->approval = false;

                    for ($x = 0; $x < sizeof($app); $x++) {
                        if ($serderId === $app[$x]->id) {
                            $data->approval = true;
                        }
                    }

                    $data->title = $v['title'];
                    $data->category = $v['category'];
                    $data->campus = $v['campus'];
                    $data->proponent = $v['coauthor'];
                    $data->year = $v['year'];
                    $data->month = $v['month'];
                    $data->date = $v['month'] . '/' . $v['date'] . '/' . $v['year'];
                    $data->status = $v['status'];
                    $response->list[] = $data;
                }
            }
        }
    }
    echo json_encode($response);
    exit();
}

if (isset($_POST['deleteRequest'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docId = $_POST['docId'];
        if ($con->query("DELETE FROM `researchfile` WHERE `id`='$docId'")) {
            $response->status = false;
            $response->message = unlink($_POST['file']);
        } else {
            $response->message = 'Failed to delete';
        }
    } else {
        $response->message = "Failed to connect";
    }
    echo json_encode($response);
}

if (isset($_POST['approve'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        //  $dataUser = unserialize($_SESSION['isLog']);
        $sig = new stdClass();
        $sig->name = $_SESSION['userFulname'];
        $sig->id = $_SESSION['userId'];
        $sig->email = $_SESSION['userEmail'];
        $signUrl = new stdClass();
        $s = json_decode($_SESSION['userEsign']);
        $signUrl->url = $s->url;
        $signUrl->scale = $s->scale;
        $signLoc = json_decode($_POST['signLoc']);
        $signature = new stdClass();
        $signature->left = $signLoc->left;
        $signature->top = $signLoc->top;
        $signature->page = $signLoc->page;
        $sig->signature = $signature;
        $sig->signurl = $signUrl;
        $sig->status = 'approve';
        $sig->note = '';
        $userId = $_SESSION['userId'];
        $docsId = $_POST['docId'];
        foreach ($con->query("SELECT  `approval` FROM `researchfile` WHERE `id`='$docsId'") as $val) {
            if ($val['approval'] === null) {
                $val['approval'] = '[]';
            }
            $data = json_decode($val['approval']);
            $accCheck = false;
            for ($x = 0; $x < sizeof($data); $x++) {
                if ($data[$x]->id === $userId) {
                    $data[$x] = $sig;
                    $accCheck = true;
                    break;
                }
            }
            if (!$accCheck) {
                $data[] = $sig;
            }
            $dataEncoded = json_encode($data);
            if ($con->query("UPDATE `researchfile` SET `approval`='$dataEncoded' WHERE `id`='$docsId'")) {
                $response->status = true;
                $response->message = 'Success..!';
            }
        }
    } else {
        $response->message = 'Connection Failed..!';
    }
    echo json_encode($response);
}

if (isset($_POST['researchPropApp'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $docId = $_POST['docId'];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "UPDATE `researchfile` SET `approval`='approve' WHERE `id`='$docId'";
        if ($con->query($query)) {
            $response->status = true;
        } else {
            $response->message .= 'Failed to update';
        }
    } else {
        $response->message .= "Failed to connect";
    }
    echo json_encode($response);
}

if (isset($_POST['delResearch'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $docId = $_POST['docId'];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $researchFile = "";
        foreach ($con->query("SELECT `file` FROM `researchfile` WHERE `id`='$docId'") as $val) {
            $researchFile = $val['file'];
        }
        if (count($reviews) <= 0) {
            if ($con->query("DELETE FROM `researchfile` WHERE `id`='$docId'")) {
                if (unlink($_POST['fileUrl'])) {
                    $response->status = true;
                    $response->message = "File deleted..!";
                } else {
                    $response->message = $con->error;
                }
            } else {
                $response->message = $con->error;
            }
        } else {
            $response->message = "Unable to delete. This file is already in process..!";
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['saveToSystem'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $docId = $_POST['docId'];
    $category = $_POST['category'];
    $title = $_POST['researchTitle'];
    $author = $_POST['author'];
    $coAuthor = $_POST['coAuthor'];
    //   $dataUser = unserialize($_SESSION['isLog']);
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $review = 0;
        foreach ($con->query("SELECT * FROM `evaluator`") as $val) {
            if ($val['category'] === $category) {
                $review++;
            }
        }

        //client/ResearchFile
        foreach ($con->query("SELECT * FROM `researchfile` WHERE `id`='$docId'") as $val) {
            $rev = json_decode($val['reviews']);
            if ($review === sizeof($rev)) {
                $docArray = explode('/', $val['file']);
                $docNem = $docArray[sizeof($docArray) - 1];
                $researchFileState = false;
                if (!file_exists("../client/ResearchFile/" . $docNem)) {
                    if (rename($val['file'], "../client/ResearchFile/" . $docNem)) {
                        $researchFileState = true;
                    }
                }
                $docenArray = explode('/', $val['endorsement']);
                $docEnNem = $docenArray[sizeof($docenArray) - 1];
                $endorsementState = false;
                if (!file_exists("../client/AllEndorsement/" . $docEnNem)) {
                    if (rename($val['endorsement'], "../client/AllEndorsement/" . $docEnNem)) {
                        $endorsementState = true;
                    }
                }
                if ($endorsementState && $researchFileState) {
                    $researchFile = "../client/ResearchFile/" . $docNem;
                    $endorsement = "../client/AllEndorsement/" . $docEnNem;
                    $reviews = $val['reviews'];
                    $authorId = $val['senderid'];
                    $docIdMain = $docId;
                    //INSERT INTO `researchallfile`(`docid`, `authorid`, `researchfile`, `endoresment`, `comments`, `date`) VALUES ('','','','','','')
                    if ($con->query("INSERT INTO `researchallfile`(`docid`, `author`,authorid,`coauthor`,`title` ,`researchfile`, `endoresment`, `comments`) VALUES ('$docIdMain','$author','$authorId','$coAuthor','$title','$researchFile','$endorsement','$reviews')")) {
                        $response->status = true;
                        $response->message = 'Success';
                    } else {
                        $response->message .= $con->error;
                    }
                } else {
                    $response->message .= "Files can't be move...!";
                }
            } else {
                $response->message .= "Unable to save this file. ";
            }
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

//This request was modified
if (isset($_POST['systemResearchFile'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->list = [];
    //  $dataUser = unserialize($_SESSION['isLog']);
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        foreach ($con->query("SELECT * FROM `researchallfile`") as $val) {
            if ($val['authorid'] === $_SESSION['userId']) {
                $data = new stdClass();
                $data->researchFile = $val['researchfile'];
                $data->endorsementFile = $val['endoresment'];
                $data->title = $val['title'];
                $data->reviews = $val['comments'];
                $data->author = $val['author'];
                $data->authorId = $val['authorid'];
                $data->date = $val['date'];
                $data->coAuthor = json_decode($val['coauthor']);
                $response->list[] = $data;
            }
        }
    } else {
        $response->message .= $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['saveResearchPer'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->data = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "INSERT INTO researchallfile
        (
            researchallfile.docid,
            researchallfile.author,
            researchallfile.title,
            researchallfile.researchfile,
            researchallfile.eventType,
            researchallfile.date
        ) SELECT 
        researchfile.id,
        researchfile.author,
        researchfile.title,
        researchfile.file,
        researchfile.event,
        endorsement.date
        FROM researchfile 
        LEFT JOIN endorsement ON researchfile.endorsementid=endorsement.id
        WHERE researchfile.endorsementid=?";
        $endorId = $_POST['endorseId'];
        $statement = $con->prepare($query);
        $statement->bind_param("s", $endorId);
        $result = $statement->execute();
        if ($result) {
            $logReq = "INSERT INTO document_log (document_log.user_id,document_log.doc_id,document_log.details)
            SELECT 
            ?,
            researchfile.id,
            ?
            FROM researchfile 
            LEFT JOIN endorsement ON researchfile.endorsementid=endorsement.id
            WHERE researchfile.endorsementid=?";
            $userId = $_SESSION['userId'];
            $rdeStaff = $_SESSION['userEmail'];
            $event = $_POST['eventType'];
            $campus = $_POST['campus'];
            $details = "RDE staff: $rdeStaff store files of $campus  for $event";
            $stm = $con->prepare($logReq);
            $stm->bind_param("sss", $userId, $details, $endorId);
            $stat = $stm->execute();
            if ($stat) {
                // Fetch and return the saved research data with center information
                $fetchQuery = "SELECT 
                    researchfile.id,
                    researchfile.author,
                    researchfile.title,
                    researchfile.file,
                    researchfile.event,
                    researchfile.campus,
                    researchfile.category,
                    endorsement.date
                FROM researchfile 
                LEFT JOIN endorsement ON researchfile.endorsementid=endorsement.id
                WHERE researchfile.endorsementid=?";

                $fetchStmt = $con->prepare($fetchQuery);
                $fetchStmt->bind_param("s", $endorId);
                $fetchStmt->execute();
                $fetchRes = $fetchStmt->get_result();

                while ($row = $fetchRes->fetch_assoc()) {
                    $data = new stdClass();
                    $data->id = $row['id'];
                    $data->author = $row['author'];
                    $data->title = $row['title'];
                    $data->file = $row['file'];
                    $data->event = $row['event'];
                    $data->campus = $row['campus'];
                    $data->center = $row['category']; // Map category to center for front-end
                    $data->date = $row['date'];
                    $response->data[] = $data;
                }
                $response->status = true;
                $response->message = 'Saved';
            } else {
                $response->message = $stm->error;
            }
        } else {
            $response->message = $statement->error;
        }
    } else {
        $response->message = $con->error;
    }
    ob_clean();
    echo json_encode($response);
    exit();
}

if (isset($_POST['searchResearch'])) {

    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->list = [];

    try {
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            $searchTerm = $_POST['searchTerm'] ?? '';
            $userId = $_SESSION['userId'] ?? null;

            // Debug logging
            error_log("Search term received: " . $searchTerm);

            // Clean search term for SQL
            $searchTerm = $con->real_escape_string($searchTerm);

            // UPDATED QUERY: Handle both Google Drive and local files
            $query = "
                SELECT DISTINCT
                    event_list.id as event_id,
                    event_list.name as event_name,
                    researchfile.id,
                    researchfile.author,
                    researchfile.title,
                    researchfile.drive_view_url as drive_view_url,
                    researchfile.drive_file_id,
                    researchfile.drive_download_url,
                    researchfile.file as local_file,
                    researchfile.category,
                    researchfile.center,
                    endorsement.center,
                    researchfile.event,
                    researchfile.drive_folder_id,
                    researchfile.drive_event_folder_id,
                    researchfile.drive_center_folder_id
                FROM researchfile
                LEFT JOIN endorsement ON endorsement.id = researchfile.endorsementid
                LEFT JOIN event_list ON researchfile.event = event_list.name
                WHERE endorsement.status = 'accepted'
                AND (
                    researchfile.title LIKE '%$searchTerm%'
                    OR researchfile.author LIKE '%$searchTerm%'
                    OR researchfile.category LIKE '%$searchTerm%'
                    OR researchfile.center LIKE '%$searchTerm%'
                    OR researchfile.event LIKE '%$searchTerm%'
                    OR endorsement.center LIKE '%$searchTerm%'
                )
                ORDER BY event_list.name, researchfile.title";

            error_log("Executing query: " . $query);
            $result = $con->query($query);

            if ($result) {
                $groupedResults = [];

                while ($row = $result->fetch_assoc()) {
                    $eventId = $row['event_id'];
                    $eventName = $row['event_name'];

                    // Initialize event group if not exists
                    if (!isset($groupedResults[$eventId])) {
                        $groupedResults[$eventId] = [
                            'id' => $eventId,
                            'name' => $eventName,
                            'list' => []
                        ];
                    }

                    // Add research file to event group
                    $researchData = new stdClass();
                    $researchData->id = $row['id'];
                    $researchData->author = $row['author'];
                    $researchData->title = $row['title'];

                    // BACKWARD COMPATIBILITY: Use Google Drive URL if available, otherwise local file
                    if (!empty($row['drive_view_url'])) {
                        $researchData->file = $row['drive_view_url'];
                        $researchData->file_type = 'drive';
                        $researchData->drive_file_id = $row['drive_file_id'];
                        $researchData->drive_download_url = $row['drive_download_url'];
                        $researchData->local_file = $row['local_file'];
                    } else if (!empty($row['local_file'])) {
                        $researchData->file = $row['local_file'];
                        $researchData->file_type = 'local';
                        $researchData->drive_file_id = null;
                        $researchData->drive_download_url = null;
                        $researchData->local_file = $row['local_file'];
                    } else {
                        // No file available
                        $researchData->file = null;
                        $researchData->file_type = 'none';
                        $researchData->drive_file_id = null;
                        $researchData->drive_download_url = null;
                        $researchData->local_file = null;
                    }

                    $researchData->category = $row['category'];
                    $researchData->center = $row['center'];
                    $researchData->event = $row['event'];
                    $researchData->drive_folder_id = $row['drive_folder_id'];
                    $researchData->drive_event_folder_id = $row['drive_event_folder_id'];
                    $researchData->drive_center_folder_id = $row['drive_center_folder_id'];

                    $groupedResults[$eventId]['list'][] = $researchData;
                }

                // Convert to simple array
                $response->list = array_values($groupedResults);
                $response->status = true;
                $response->message = 'Search completed. Found ' . count($response->list) . ' events with matching files.';

                error_log("Search successful: " . count($response->list) . " events found");

            } else {
                $response->message = 'Query failed: ' . $con->error;
                error_log("Query failed: " . $con->error);
            }
        } else {
            $response->message = 'Database connection failed';
            error_log("Database connection failed");
        }
    } catch (Exception $e) {
        $response->message = 'Server error: ' . $e->getMessage();
        error_log("Search exception: " . $e->getMessage());
    }

    // Ensure no output before this
    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

if (isset($_POST['acceptDel'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $docId = $_POST['docId'];
    $fileUrl = $_POST['fileUrl'];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        if ($con->query("DELETE FROM `researchfile` WHERE `id`='$docId'")) {
            if (unlink($fileUrl)) {
                $response->status = true;
            } else {
                $response->message = $con->error;
            }
        } else {
            $response->message = $con->error;
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['researchDocsNew'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Query remains the same
        $query = "
            SELECT
                researchfile.id,
                researchfile.senderid,
                researchfile.author,
                researchfile.presenter,
                researchfile.title,
                researchfile.file,                    
                researchfile.drive_view_url,        
                researchfile.drive_file_id,
                researchfile.drive_download_url,
                researchfile.drive_folder_id,
                researchfile.drive_event_folder_id,
                researchfile.drive_center_folder_id,
                researchfile.program_drive_view_url,
                researchfile.program_drive_file_id,
                researchfile.category,
                researchfile.center,       
                endorsement.center,
                endorsement.campus,
                endorsement.event,
                endorsement.date,
                endorsement.status,
                researchfile.endorsementid,
                researchfile.final_symposium_title,
                researchfile.status as rf_status
            FROM researchfile
            LEFT JOIN endorsement ON endorsement.id = researchfile.endorsementid
            WHERE endorsement.status = 'accepted' OR researchfile.status = 'accepted' OR researchfile.status IS NULL";

        foreach ($con->query($query) as $val) {
            $data = new stdClass();
            $data->id = $val['id'];
            $data->senderid = $val['senderid'];
            $data->author = $val['author'];
            $data->title = $val['title'];
            $data->final_symposium_title = $val['final_symposium_title'];
            $data->rf_status = $val['rf_status'];

            // For backward compatibility with existing frontend
            // Use Google Drive URL if available, otherwise local file
            if (!empty($val['drive_view_url'])) {
                $data->file = $val['drive_view_url'];  // Google Drive URL
            } else {
                $data->file = $val['file'];  // Local file path
            }

            // Add separate fields for clarity
            $data->local_file = $val['file'];
            $data->drive_view_url = $val['drive_view_url'];
            $data->drive_file_id = $val['drive_file_id'];
            $data->drive_download_url = $val['drive_download_url'];
            $data->drive_folder_id = $val['drive_folder_id'];
            $data->drive_event_folder_id = $val['drive_event_folder_id'];
            $data->drive_center_folder_id = $val['drive_center_folder_id'];
            $data->program_drive_view_url = $val['program_drive_view_url'];
            $data->program_drive_file_id = $val['program_drive_file_id'];
            $data->center = $val['center'];
            $data->endorsement_status = $val['status'];
            $data->category = $val['category'];
            $data->campus = $val['campus'];
            $data->event = $val['event'];
            $data->date = $val['date'];
            $data->endorsId = $val['endorsementid'];
            $response[] = $data;
        }
    }
    echo json_encode($response);
}

if (isset($_POST['viewDocReq'])) {
    $response = new stdClass();
    $response->status = false;
    $response->data = '';
    $response->file_type = '';
    $response->drive_file_id = '';
    $response->drive_view_url = '';
    $response->drive_download_url = '';
    $response->local_file = '';
    $response->message = '';
    $response->source_table = '';
    $response->title = '';
    $response->final_symposium_title = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docId = $_POST['docId'];

        // ============================================================
        // STEP 1: Check student_research_papers FIRST
        // ============================================================
        $studentQuery = "SELECT 
            srp.id,
            srp.title,
            srp.research_file_view_url as drive_view_url,
            srp.research_file_download_url as drive_download_url,
            NULL as drive_file_id,
            srp.drive_entry_folder_id as drive_folder_id,
            srp.drive_event_folder_id,
            srp.drive_category_folder_id as drive_center_folder_id,
            NULL as local_file,
            srp.status as doc_status,
            srp.event_id,
            srp.event,
            srp.category,
            srp.author,
            srp.presenter,
            srp.coauthor,
            'student_research_papers' as source_table
        FROM student_research_papers srp
        WHERE srp.id = ? 
        AND srp.status IN ('pending', 'accepted')
        LIMIT 1";

        $studentStmt = $con->prepare($studentQuery);
        if ($studentStmt) {
            $studentStmt->bind_param('i', $docId);
            $studentStmt->execute();
            $studentRes = $studentStmt->get_result();

            if ($studentRes->num_rows > 0) {
                $val = $studentRes->fetch_assoc();
                $response->source_table = 'student_research_papers';
                $response->title = $val['title'];
                $response->final_symposium_title = null;
                $response->doc_status = $val['doc_status'];
                $response->event_id = $val['event_id'];
                $response->event = $val['event'];
                $response->category = $val['category'];
                $response->author = $val['author'];
                $response->presenter = $val['presenter'];
                $response->coauthor = $val['coauthor'];
                
                // Use the research_file_view_url from student table
                if (!empty($val['drive_view_url'])) {
                    $response->data = $val['drive_view_url'];
                    $response->file_type = 'drive';
                    $response->drive_view_url = $val['drive_view_url'];
                    $response->drive_download_url = $val['drive_download_url'];
                    $response->drive_file_id = $val['drive_file_id'];
                    $response->local_file = $val['local_file'];
                    $response->status = true;
                    error_log("viewDocReq - Found in student_research_papers: ID=$docId, File URL=" . $val['drive_view_url']);
                } else {
                    $response->data = '';
                    $response->file_type = 'none';
                    $response->message = 'No file available for this student document.';
                    $response->status = false;
                }
                
                $response->drive_folder_id = $val['drive_folder_id'] ?? null;
                $response->drive_event_folder_id = $val['drive_event_folder_id'] ?? null;
                $response->drive_center_folder_id = $val['drive_center_folder_id'] ?? null;
                
                $studentStmt->close();
                $con->close();
                header('Content-Type: application/json');
                echo json_encode($response);
                exit();
            }
            $studentStmt->close();
        }

        // ============================================================
        // STEP 2: If not found in student, check researchfile
        // ============================================================
        $query = "SELECT 
            researchfile.id,
            researchfile.title,
            researchfile.final_symposium_title,
            researchfile.drive_view_url,
            researchfile.drive_file_id,
            researchfile.drive_download_url,
            researchfile.drive_folder_id,
            researchfile.drive_event_folder_id,
            researchfile.drive_center_folder_id,
            researchfile.file as local_file,
            researchfile.status as doc_status,
            researchfile.event_id,
            researchfile.event,
            researchfile.category,
            researchfile.author,
            researchfile.presenter,
            researchfile.coauthor,
            endorsement.status as endorsement_status,
            'researchfile' as source_table
        FROM researchfile 
        LEFT JOIN endorsement ON endorsement.id = researchfile.endorsementid
        WHERE researchfile.id = ? 
        AND (researchfile.status = 'accepted' OR endorsement.status = 'accepted' OR researchfile.status IS NULL)
        LIMIT 1";

        $statement = $con->prepare($query);
        if ($statement) {
            $statement->bind_param('i', $docId);
            $statement->execute();
            $res = $statement->get_result();

            if ($res->num_rows > 0) {
                $val = $res->fetch_assoc();
                $response->source_table = 'researchfile';
                $response->title = $val['title'];
                $response->final_symposium_title = $val['final_symposium_title'];
                $response->doc_status = $val['doc_status'];
                $response->endorsement_status = $val['endorsement_status'];
                $response->event_id = $val['event_id'];
                $response->event = $val['event'];
                $response->category = $val['category'];
                $response->author = $val['author'];
                $response->presenter = $val['presenter'];
                $response->coauthor = $val['coauthor'];
                
                if (!empty($val['drive_view_url'])) {
                    $response->data = $val['drive_view_url'];
                    $response->file_type = 'drive';
                    $response->drive_view_url = $val['drive_view_url'];
                    $response->drive_file_id = $val['drive_file_id'];
                    $response->drive_download_url = $val['drive_download_url'];
                    $response->local_file = $val['local_file'];
                    $response->status = true;
                    error_log("viewDocReq - Found in researchfile (drive): ID=$docId, URL=" . $val['drive_view_url']);
                } else if (!empty($val['local_file'])) {
                    $response->data = $val['local_file'];
                    $response->file_type = 'local';
                    $response->local_file = $val['local_file'];
                    $response->drive_view_url = null;
                    $response->drive_file_id = null;
                    $response->drive_download_url = null;
                    $response->status = true;
                    error_log("viewDocReq - Found in researchfile (local): ID=$docId, File=" . $val['local_file']);
                } else {
                    $response->data = '';
                    $response->file_type = 'none';
                    $response->message = 'No file available for this document.';
                    $response->status = false;
                }
                
                $response->drive_folder_id = $val['drive_folder_id'] ?? null;
                $response->drive_event_folder_id = $val['drive_event_folder_id'] ?? null;
                $response->drive_center_folder_id = $val['drive_center_folder_id'] ?? null;
                
                $statement->close();
                $con->close();
                header('Content-Type: application/json');
                echo json_encode($response);
                exit();
            }
            $statement->close();
        }
        
        // ============================================================
        // STEP 3: Document not found in either table
        // ============================================================
        $response->message = 'Document not found. (Document ID: ' . $docId . ')';
        $response->status = false;
        error_log("viewDocReq - Document not found in either table: ID=" . $docId);
        
        $con->close();
    } else {
        $response->message = 'Database connection failed: ' . $con->connect_error;
        $response->status = false;
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

if (isset($_POST['grantDeleteResearchRequest'])) {
    $response = new stdClass();
    $response->message = "";
    $response->status = false;
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docId = $_POST['docId'];
        $fileLocation = $_POST['fileLocation'];
        if ($con->query("DELETE FROM researchfile WHERE id='$docId'")) {
            $campus = $_POST['campus'];
            $account = $_POST['accountName'];
            $rdeStaff = $_POST['rdeStaff'];
            $reason = $_POST['reason'];
            $eventName = $_POST['eventName'];
            $title = $_POST['title'];
            $statement = $con->prepare("INSERT INTO deletedresearch(deletedresearch.id,deletedresearch.title,deletedresearch.event,deletedresearch.campus,deletedresearch.accountuser,deletedresearch.reason,deletedresearch.rdeStaff) VALUES (?,?,?,?,?)");
            $statement->bind_param("sssss", $docId, $title, $eventName, $campus, $account, $reason, $rdeStaff);
            $status = $statement->execute();
            if ($status) {
                $response->message = unlink($fileLocation);
                $response->status = true;
            } else {
                $response->message = $statement->error;
            }
        } else {
            $response->message = $con->error;
        }
    }
    echo json_encode($response);

}

if (isset($_POST['rejectRequest'])) {
    $response = new stdClass();
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docId = $_POST['dicId'];
        $query = "SELECT rejecteddocs.rejectedby,rejecteddocs.reason FROM rejecteddocs WHERE rejecteddocs.docid=?";
        $statement = $con->prepare($query);
        $statement->bind_param("s", $docId);
        $statement->execute();
        $result = $statement->get_result();
        while ($val = $result->fetch_assoc()) {
            $response->message = $val['reason'];
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['fileReqRes'])) {
    $response = '';
    $docId = $_POST['docId'];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Updated query to get Google Drive URL from researchfile table
        $query = "SELECT 
            researchfile.drive_view_url as researchfile,
            researchfile.drive_file_id,
            researchfile.drive_download_url,
            researchfile.drive_folder_id,
            researchfile.author,
            researchfile.title
        FROM researchfile WHERE researchfile.id=?";

        $statement = $con->prepare($query);
        $statement->bind_param('s', $docId);
        $statement->execute();
        $result = $statement->get_result();

        if ($result->num_rows > 0) {
            $val = $result->fetch_assoc();

            // Return JSON with all Google Drive metadata
            $response = [
                'drive_view_url' => $val['researchfile'],
                'drive_file_id' => $val['drive_file_id'],
                'drive_download_url' => $val['drive_download_url'],
                'drive_folder_id' => $val['drive_folder_id'],
                'author' => $val['author'],
                'title' => $val['title']
            ];

            // If no drive_view_url exists, check if there's a local file
            if (empty($val['researchfile'])) {
                // Fallback to old logic (for backward compatibility)
                $fallbackQuery = "SELECT researchallfile.researchfile FROM researchallfile WHERE researchallfile.docid=?";
                $fallbackStatement = $con->prepare($fallbackQuery);
                $fallbackStatement->bind_param('s', $docId);
                $fallbackStatement->execute();
                $fallbackResult = $fallbackStatement->get_result();

                if ($fallbackResult->num_rows > 0) {
                    $fallbackVal = $fallbackResult->fetch_assoc();
                    $response = [
                        'local_file' => $fallbackVal['researchfile'],
                        'type' => 'local'
                    ];
                }
            }
        } else {
            // Check researchallfile as fallback (for older records)
            $fallbackQuery = "SELECT researchallfile.researchfile FROM researchallfile WHERE researchallfile.docid=?";
            $fallbackStatement = $con->prepare($fallbackQuery);
            $fallbackStatement->bind_param('s', $docId);
            $fallbackStatement->execute();
            $fallbackResult = $fallbackStatement->get_result();

            if ($fallbackResult->num_rows > 0) {
                $fallbackVal = $fallbackResult->fetch_assoc();
                $response = [
                    'local_file' => $fallbackVal['researchfile'],
                    'type' => 'local'
                ];
            }
        }
    }

    // Return JSON response
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
    exit();
}

if (isset($_POST['resetComments'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "DELETE FROM comments
        WHERE comments.resid=? AND comments.evalid=?";
        $statement = $con->prepare($query);
        $sessionUserId = $_SESSION['userId'] ?? 0;
        $statement->bind_param("ss", $_POST['docId'], $sessionUserId);
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
    exit();
}
