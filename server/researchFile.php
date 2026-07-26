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
        $center = isset($_POST['center']) ? $_POST['center'] : (isset($_SESSION['centerId']) ? $_SESSION['centerId'] : '');
        $event = isset($_POST['event']) ? $_POST['event'] : $_SESSION['eventTYpe'];
        $eventId = isset($_POST['eventId']) ? $_POST['eventId'] : $_SESSION['eventId'];
        $evalId = $_SESSION['userId'];
        $userType = isset($_POST['filterType']) ? $_POST['filterType'] : 'center';
        $categoryIds = isset($_POST['categoryIds']) ? json_decode($_POST['categoryIds'], true) : [];
        
        $response->userName = $_SESSION['userName'];
        $response->userType = $userType;

        error_log("User Type: $userType");
        error_log("Center: $center");
        error_log("Category IDs: " . print_r($categoryIds, true));
        error_log("Event ID: $eventId");

        // Build query based on user type
        $papers = [];
        
        if ($userType === 'category' && !empty($categoryIds)) {
            $categoryNames = [];
            $placeholders = implode(',', array_fill(0, count($categoryIds), '?'));
            $catNameQuery = "SELECT name FROM category WHERE id IN ($placeholders)";
            $catNameStmt = $con->prepare($catNameQuery);
            $types = str_repeat('i', count($categoryIds));
            $catNameStmt->bind_param($types, ...$categoryIds);
            $catNameStmt->execute();
            $catNameResult = $catNameStmt->get_result();
            
            while ($row = $catNameResult->fetch_assoc()) {
                $categoryNames[] = $row['name'];
            }
            $catNameStmt->close();
            
            error_log("Category Names: " . print_r($categoryNames, true));
            
            if (empty($categoryNames)) {
                error_log("No valid category names found for IDs: " . print_r($categoryIds, true));
                echo json_encode($response);
                exit();
            }
            
            $catPlaceholders = implode(',', array_fill(0, count($categoryNames), '?'));
            $sqlQueries = "SELECT 
                rf.id,
                rf.author,
                rf.presenter,
                rf.coauthor,
                rf.drive_view_url,
                rf.file as local_file,
                rf.title as research_title,
                rf.event,
                rf.event_id,      
                rf.category,
                rf.center as center_name,
                endorsement.center,
                event_list.id as eventId,
                category.id as catId,
                category.name as category_name
            FROM researchfile as rf
            LEFT JOIN endorsement ON endorsement.id = rf.endorsementid
            LEFT JOIN event_list ON rf.event_id = event_list.id
            LEFT JOIN category ON rf.category = category.name
            WHERE endorsement.status = ? 
            AND rf.event_id = ?
            AND rf.category IN ($catPlaceholders)";
            
            $params = array_merge(['accepted', $eventId], $categoryNames);
            $types = "si" . str_repeat('s', count($categoryNames));
            
            $stm = $con->prepare($sqlQueries);
            $stm->bind_param($types, ...$params);
            
            error_log("Category Query: " . $sqlQueries);
            error_log("Params: " . print_r($params, true));
            
        } else {
            $centerNameQuery = "SELECT name FROM center WHERE id = ? OR code = ? OR UPPER(code) = UPPER(?) OR name LIKE ? LIMIT 1";
            $centerStmt = $con->prepare($centerNameQuery);
            $searchTerm = "%$center%";
            $centerStmt->bind_param("ssss", $center, $center, $center, $searchTerm);
            $centerStmt->execute();
            $centerResult = $centerStmt->get_result();
            $centerRow = $centerResult->fetch_assoc();

            $dbCenterName = $centerRow ? $centerRow['name'] : $center;

            $sqlQueries = "SELECT 
                rf.id,
                rf.author,
                rf.presenter,
                rf.coauthor,
                rf.drive_view_url,
                rf.file as local_file,
                rf.title as research_title,
                rf.event,
                rf.event_id,      
                rf.category,
                rf.center as center_name,
                endorsement.center,
                event_list.id as eventId,
                category.id as catId,
                category.name as category_name
            FROM researchfile as rf
            LEFT JOIN endorsement ON endorsement.id = rf.endorsementid
            LEFT JOIN event_list ON rf.event_id = event_list.id
            LEFT JOIN category ON rf.category = category.name
            WHERE endorsement.status = ? 
            AND (rf.center = ? OR rf.center LIKE ? OR UPPER(rf.center) = UPPER(?) OR rf.center LIKE ?)
            AND rf.event_id = ?";  

            $stm = $con->prepare($sqlQueries);
            $stat = 'accepted';

            $centerExact = $dbCenterName;
            $centerLike = "%$dbCenterName%";
            $centerUpper = strtoupper($center);
            $centerLikeUpper = "%" . strtoupper($dbCenterName) . "%";

            $stm->bind_param("sssssi", $stat, $centerExact, $centerLike, $centerUpper, $centerLikeUpper, $eventId);
        }

        $stm->execute();
        $resultRes = $stm->get_result();

        // Store all papers in an array first
        $allPapers = [];
        
        while ($val = $resultRes->fetch_assoc()) {
            $data = new stdClass();
            $data->status = NULL;
            $data->id = $val['id'];
            $data->author = $val['author'];
            $data->presenter = $val['presenter'];
            $data->coauthor = $val['coauthor'];
            $data->category = $val['category'];
            $data->category_id = $val['catId'];
            $data->category_name = $val['category_name'];
            $data->center = $val['center'] ?? $val['center_name'] ?? '';
            
            if (!empty($val['drive_view_url'])) {
                $data->file = $val['drive_view_url']; 
                $data->file_type = 'drive';
            } else {
                $data->file = $val['local_file'];
                $data->file_type = 'local';
            }

            $data->title = $val['research_title'];
            $data->event = $val['event'];
            $data->campus = $val['campus'] ?? '';
            $data->eventId = $val['eventId'];
            $data->catId = $val['catId'];

            $data->comment_title = '';
            $data->intro = '';
            $data->abstract = '';
            $data->objective = '';
            $data->methodology = '';
            $data->results = '';
            $data->recommendation = '';
            $data->literature = '';
            $data->other = '';

            $data->hasComment = false;
            $data->hasScore = false;

            $comquery = "SELECT 
                comments.title as comment_title, 
                comments.intro,
                comments.abstract,
                comments.objective,
                comments.methodology,
                comments.results,
                comments.recommendation,
                comments.literature,
                comments.other,
                comments.date,
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
            FROM comments WHERE comments.resid = ? AND comments.evalid = ? AND comments.eventType = ?";

            $statement = $con->prepare($comquery);
            $statement->bind_param('sss', $val['id'], $evalId, $val['event']);
            $statement->execute();
            $res = $statement->get_result();

            while ($v = $res->fetch_assoc()) {
                $data->status = 'updated';
                $data->comment_title = $v['comment_title'];
                $data->intro = $v['intro'];
                $data->abstract = $v['abstract'];
                $data->objective = $v['objective'];
                $data->methodology = $v['methodology'];
                $data->results = $v['results'];
                $data->recommendation = $v['recommendation'];
                $data->literature = $v['literature'];
                $data->other = $v['other'];
                $data->hasComment = ($v['has_comment_content'] == 1);
            }

            $scoreQuery = "SELECT 
                COUNT(*) as score_count,
                CASE 
                    WHEN COUNT(*) > 0 AND SUM(CASE WHEN score IS NOT NULL THEN 1 ELSE 0 END) > 0
                    THEN 1 ELSE 0 
                END as has_score_content
            FROM score_board 
            WHERE doc_id = ? AND eval_id = ?";

            $scoreStmt = $con->prepare($scoreQuery);
            $scoreStmt->bind_param('ss', $val['id'], $evalId);
            $scoreStmt->execute();
            $scoreResult = $scoreStmt->get_result();

            if ($scoreRow = $scoreResult->fetch_assoc()) {
                $data->hasScore = ($scoreRow['has_score_content'] == 1);
            }

            $allPapers[] = $data;
        }

        // --- BEGIN DUPLICATE DETECTION ---
        $uniquePapers = [];
        $duplicateGroups = [];
        
        // Helper function to get all authors from a paper
        $getAllAuthors = function($paper) {
            $authors = [];
            
            if (!empty($paper->author)) {
                $cleanedAuthor = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $paper->author);
                $authorList = array_map('trim', explode(',', $cleanedAuthor));
                $authors = array_merge($authors, $authorList);
            }
            
            if (!empty($paper->presenter)) {
                $cleanedPresenter = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $paper->presenter);
                $authors[] = trim($cleanedPresenter);
            }
            
            if (!empty($paper->coauthor)) {
                $coauthorData = $paper->coauthor;
                if (is_string($coauthorData)) {
                    // Try to parse JSON
                    if (strpos($coauthorData, '[') === 0) {
                        $coauthorArray = json_decode($coauthorData, true);
                        if (is_array($coauthorArray)) {
                            foreach ($coauthorArray as $coauthor) {
                                $cleaned = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $coauthor);
                                $authors[] = trim($cleaned);
                            }
                        }
                    } else {
                        $coauthorList = array_map('trim', explode(',', $coauthorData));
                        $authors = array_merge($authors, $coauthorList);
                    }
                } else if (is_array($coauthorData)) {
                    foreach ($coauthorData as $coauthor) {
                        $cleaned = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $coauthor);
                        $authors[] = trim($cleaned);
                    }
                }
            }
            
            // Remove duplicates and empty values
            $authors = array_filter($authors);
            $authors = array_unique($authors);
            
            return $authors;
        };
        
        // First pass: Group by title similarity and author similarity
        foreach ($allPapers as $index => $paper) {
            $isDuplicate = false;
            $duplicateGroupId = null;
            $duplicateReason = '';
            
            // Check against existing unique papers
            foreach ($uniquePapers as $key => $uniquePaper) {
                // Check if title is similar
                $titleSimilar = isSimilarString($paper->title, $uniquePaper->title, 75);
                
                if ($titleSimilar) {
                    // Get all authors for both papers
                    $authors1 = $getAllAuthors($paper);
                    $authors2 = $getAllAuthors($uniquePaper);
                    
                    // Check if authors are similar
                    if (areAuthorsSimilar($authors1, $authors2, 70)) {
                        $isDuplicate = true;
                        $duplicateGroupId = $key;
                        $duplicateReason = 'Same title and authors';
                        break;
                    }
                }
            }
            
            if ($isDuplicate && $duplicateGroupId !== null) {
                // This is a duplicate - add to duplicate group
                if (!isset($duplicateGroups[$duplicateGroupId])) {
                    $duplicateGroups[$duplicateGroupId] = [
                        'original' => $uniquePapers[$duplicateGroupId],
                        'duplicates' => []
                    ];
                }
                // Mark as duplicate
                $paper->isDuplicate = true;
                $paper->duplicateOf = $uniquePapers[$duplicateGroupId]->id;
                $paper->duplicateReason = $duplicateReason;
                $duplicateGroups[$duplicateGroupId]['duplicates'][] = $paper;
            } else {
                // This is a unique paper
                $paper->isDuplicate = false;
                $paper->duplicateOf = null;
                $paper->duplicateReason = '';
                $uniquePapers[] = $paper;
            }
        }
        
        // Mark unique papers with duplicate info
        foreach ($uniquePapers as &$paper) {
            $paper->duplicateCount = 0;
            $paper->hasDuplicates = false;
            
            // Check if this paper has duplicates
            foreach ($duplicateGroups as $group) {
                if ($group['original']->id === $paper->id) {
                    $paper->hasDuplicates = true;
                    $paper->duplicateCount = count($group['duplicates']);
                    break;
                }
            }
        }
        
        // Log duplicate info for debugging
        $totalPapers = count($allPapers);
        $totalUnique = count($uniquePapers);
        $totalDuplicates = $totalPapers - $totalUnique;
        
        error_log("=== DUPLICATE DETECTION RESULTS (researchSubmit) ===");
        error_log("Total papers found: $totalPapers");
        error_log("Unique papers: $totalUnique");
        error_log("Duplicate papers removed: $totalDuplicates");
        error_log("Duplicate groups: " . count($duplicateGroups));
        
        // Log each duplicate group
        foreach ($duplicateGroups as $groupId => $group) {
            $originalTitle = $group['original']->title;
            $originalId = $group['original']->id;
            $dupCount = count($group['duplicates']);
            $dupIds = array_map(function($d) { return $d->id; }, $group['duplicates']);
            error_log("Group $groupId: Original ID $originalId '$originalTitle' has $dupCount duplicate(s): " . implode(', ', $dupIds));
        }
        
        // --- END DUPLICATE DETECTION ---
        
        // Only return unique papers
        $response->list = $uniquePapers;
        $response->totalUnique = $totalUnique;
        $response->totalDuplicateCount = $totalDuplicates;
        $response->hasDuplicates = count($duplicateGroups) > 0;
        $response->duplicateGroups = $duplicateGroups;

        $count = count($response->list);
        error_log("Found $count unique research files for user type: $userType");
    }
    echo json_encode($response);
}

//comments update
if (isset($_POST['updateReview'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $response->emailStatus = '';

    // Log all POST data for debugging
    error_log("=== updateReview called ===");
    error_log("POST data: " . print_r($_POST, true));

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $category = $_SESSION['category'] ?? $_SESSION['center'] ?? '';
        $response->userName = $_SESSION['userName'] ?? '';
        $evalId = $_SESSION['userId'] ?? 0;
        $evalName = $_SESSION['userFulname'] ?? '';
        $docsId = $_POST['docId'] ?? '';

        error_log("evalId: $evalId, docsId: $docsId");

        // Get the event ID and event name from the research file
        $eventId = 0;
        $eventType = '';
        if ($docsId) {
            $eventQuery = $con->prepare("SELECT rf.event_id, el.name as event_name FROM researchfile rf LEFT JOIN event_list el ON el.id = rf.event_id WHERE rf.id = ?");
            $eventQuery->bind_param("s", $docsId);
            $eventQuery->execute();
            $eventResult = $eventQuery->get_result();
            $eventRow = $eventResult->fetch_assoc();
            $eventId = $eventRow['event_id'] ?? $_SESSION['eventId'] ?? 0;
            $eventType = $eventRow['event_name'] ?? $_SESSION['eventTYpe'] ?? '';
            $eventQuery->close();
            error_log("eventId: $eventId, eventType: $eventType");
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

        // Get document details for email
        $docInfo = [];
        if ($docsId) {
            $documentDetails = $con->prepare("SELECT 
                researchfile.title, 
                researchfile.author, 
                researchfile.event_id,
                event_list.name as event_name,
                researchfile.category,
                researchfile.center,
                endorsement.center as endorsement_center,
                account_detail.email,
                account_detail.fullName
            FROM researchfile 
            LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
            LEFT JOIN account_detail ON researchfile.senderid = account_detail.id
            LEFT JOIN event_list ON researchfile.event_id = event_list.id
            WHERE researchfile.id = ?");

            $documentDetails->bind_param("s", $docsId);
            $documentDetails->execute();
            $docResult = $documentDetails->get_result();
            $docInfo = $docResult->fetch_assoc();
            $documentDetails->close();
        }

        // Check if comments exist for this evaluator and document
        $found = false;
        if ($docsId && $evalId) {
            $checkQuery = $con->prepare("SELECT COUNT(*) as count FROM comments WHERE evalid = ? AND resid = ?");
            $checkQuery->bind_param("ss", $evalId, $docsId);
            $checkQuery->execute();
            $checkResult = $checkQuery->get_result();
            $row = $checkResult->fetch_assoc();
            $found = ($row['count'] > 0);
            $checkQuery->close();
            error_log("Comments exist: " . ($found ? 'yes' : 'no'));
        }

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
            $statement->bind_param(
                "ssssssssssss",
                $title,
                $intro,
                $abstract,
                $objective,
                $methodology,
                $results,
                $recommendation,
                $literature,
                $other,
                $eventType,
                $docsId,
                $evalId
            );

            // Log the values being bound
            error_log("Binding values: title='$title', intro='$intro', abstract='$abstract', objective='$objective', methodology='$methodology', results='$results', recommendation='$recommendation', literature='$literature', other='$other', docsId='$docsId', evalId='$evalId'");

            $status = $statement->execute();

            if ($status) {
                $response->status = true;
                $response->message = "Comments Updated successfully..!";
                error_log("UPDATE successful");

                // Send email notification
                if (!empty($docInfo)) {
                    $response->emailStatus = sendCommentEmail($con, $evalName, $docInfo, [
                        'title' => $title,
                        'intro' => $intro,
                        'abstract' => $abstract,
                        'objective' => $objective,
                        'methodology' => $methodology,
                        'results' => $results,
                        'recommendation' => $recommendation,
                        'literature' => $literature,
                        'other' => $other
                    ], $docsId, $evalId, $rdeEmail, $emailPassword);
                }

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
            $statementQ->bind_param(
                "sssssssssssss",
                $docsId,
                $evalId,
                $eventId,
                $eventType,
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

            error_log("Binding values: docsId='$docsId', evalId='$evalId', eventId='$eventId', eventType='$eventType', title='$title', intro='$intro', abstract='$abstract', objective='$objective', methodology='$methodology', results='$results', recommendation='$recommendation', literature='$literature', other='$other'");

            $statusIn = $statementQ->execute();

            if ($statusIn) {
                $response->status = true;
                $response->message = "Comments Saved successfully..!";
                error_log("INSERT successful");

                // Send email notification
                if (!empty($docInfo)) {
                    $response->emailStatus = sendCommentEmail($con, $evalName, $docInfo, [
                        'title' => $title,
                        'intro' => $intro,
                        'abstract' => $abstract,
                        'objective' => $objective,
                        'methodology' => $methodology,
                        'results' => $results,
                        'recommendation' => $recommendation,
                        'literature' => $literature,
                        'other' => $other
                    ], $docsId, $evalId, $rdeEmail, $emailPassword);
                }

            } else {
                $response->message = "Insert failed: " . $statementQ->error;
                error_log("INSERT failed: " . $statementQ->error);
            }
            $statementQ->close();
        }
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

function sendCommentEmail($con, $evaluatorName, $docInfo, $comments, $docsId, $evalId, $rdeEmail, $emailPassword)
{

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

    // Generate email content - use event_name from the joined query
    $emailContent = CommentNotification(
        $evaluatorName,
        $docInfo['event_name'] ?? 'Research Event',
        $docInfo['title'],
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
                researchfile.endorsementid
            FROM researchfile
            LEFT JOIN endorsement ON endorsement.id=researchfile.endorsementid
            WHERE endorsement.status='accepted'";

        foreach ($con->query($query) as $val) {
            $data = new stdClass();
            $data->id = $val['id'];
            $data->senderid = $val['senderid'];
            $data->author = $val['author'];
            $data->title = $val['title'];

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
            $data->status = $val['status'];
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

if (isset($_POST['viewDocReq'])) {
    $response = new stdClass();
    $response->status = false;
    $response->data = '';
    $response->drive_file_id = '';
    $response->drive_view_url = '';
    $response->drive_download_url = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // UPDATED QUERY for Google Drive
        $query = "SELECT 
            researchfile.drive_view_url as file,
            researchfile.drive_file_id,
            researchfile.drive_view_url,
            researchfile.drive_download_url,
            researchfile.drive_folder_id,
            researchfile.drive_event_folder_id,
            researchfile.drive_center_folder_id
        FROM researchfile WHERE researchfile.id=? LIMIT 1";

        $docId = $_POST['docId'];
        $statement = $con->prepare($query);
        $statement->bind_param('s', $docId);
        $statement->execute();
        $res = $statement->get_result();

        while ($val = $res->fetch_assoc()) {
            $response->data = $val['file']; // Google Drive URL
            $response->drive_file_id = $val['drive_file_id'];
            $response->drive_view_url = $val['drive_view_url'];
            $response->drive_download_url = $val['drive_download_url'];
            $response->drive_folder_id = $val['drive_folder_id'];
            $response->drive_event_folder_id = $val['drive_event_folder_id'];
            $response->drive_center_folder_id = $val['drive_center_folder_id'];
            $response->status = true;
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
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
