<?php
error_reporting(E_ALL);
ini_set('display_errors', 0); 
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/drive_errors.log');

header('Content-Type: application/json; charset=utf-8');

// Start output buffering with callback to catch errors
ob_start(function($buffer) {
    // Check if the buffer contains HTML error messages
    if (strpos($buffer, '<b>Warning</b>') !== false || 
        strpos($buffer, '<b>Notice</b>') !== false ||
        strpos($buffer, '<b>Fatal error</b>') !== false) {
        
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

require_once(__DIR__ . '/../db.php');

/** @var TYPE_NAME $host */

/** @var TYPE_NAME $username */

/** @var TYPE_NAME $pass */

/** @var TYPE_NAME $dbName */

/** @var TYPE_NAME $rdeEmail */

/** @var TYPE_NAME $emailPassword */

// Database connection is available as $conn from db.php

$action = $_POST['action'] ?? '';

if ($action === 'fetch' || $action === 'search_monitoring') {
    $cursor = $_POST['cursor'] ?? null;
    $direction = $_POST['direction'] ?? 'next';
    $search = $_POST['search'] ?? null;
    $year = $_POST['year'] ?? null;
    $category = $_POST['category'] ?? null;
    $center = $_POST['center'] ?? null;
    $campus = $_POST['campus'] ?? null;
    $limit = 20;

    $whereClauses = ["(el.name LIKE '%In-House Review%' OR el.name LIKE '%In House Review%')"];
    $params = [];
    $types = "";

    if ($year && $year !== 'All') {
        $whereClauses[] = "YEAR(el.date) = ?";
        $params[] = $year;
        $types .= "i";
    }

    if ($search) {
        $whereClauses[] = "(rf.title LIKE ? OR rf.author LIKE ? OR rf.coauthor LIKE ?)";
        $searchParam = "%$search%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
        $types .= "sss";
    }

    // Center to Category mapping
    $centerMapping = [
        "Crop Science Research & Developement Center (CSRDC)" => ["Natural / Biological"],
        "Livestock Research & Development Center (LRDC)" => ["Natural / Biological"],
        "Fisheries Research & Development Center (FRDC)" => ["Natural / Biological"],
        "Food and Industrial Technology Research & Development Center (FITRDC)" => ["Food"],
        "Social Science Research & Development Center (SSRDC)" => ["Social Science"],
        "Machinery and Agricultural Technology Engineering Center (MATEC)" => ["Industrial", "Engineering", "Information Technology", "Development", "Agricultural Machinery"],
        "Coconut Research and Development Center (Coco RDC)" => ["Natural / Biological"],
        "Extension (Extension)" => ["Extension"]
    ];

    if ($category && $category !== 'All' && $category !== 'All Categories') {
        $categoryList = explode(',', $category);
        if (count($categoryList) > 1) {
            $placeholders = implode(',', array_fill(0, count($categoryList), '?'));
            $whereClauses[] = "rf.category IN ($placeholders)";
            foreach ($categoryList as $cat) {
                $params[] = trim($cat);
                $types .= "s";
            }
        } else {
            $whereClauses[] = "rf.category = ?";
            $params[] = $category;
            $types .= "s";
        }
    }

    if ($center && $center !== 'All' && $center !== 'All Centers') {
        // Try to extract the code from parentheses, e.g., "Extension (Extension)" -> "Extension"
        $centerCode = $center;
        if (preg_match('/\(([^)]+)\)/', $center, $matches)) {
            $centerCode = $matches[1];
        }

        $mappedCategories = $centerMapping[$center] ?? [];
        
        if (!empty($mappedCategories)) {
            $placeholders = implode(',', array_fill(0, count($mappedCategories), '?'));
            $whereClauses[] = "((rf.center = ? OR rf.center = ? OR rf.center LIKE ? OR rf.center IS NULL OR rf.center = '') AND rf.category IN ($placeholders))";
            $params[] = $center;
            $params[] = $centerCode;
            $params[] = "%$centerCode%";
            $types .= "sss";
            foreach ($mappedCategories as $cat) {
                $params[] = $cat;
                $types .= "s";
            }
        } else {
            if ($centerCode !== $center) {
                $whereClauses[] = "(rf.center = ? OR rf.center = ? OR rf.center LIKE ?)";
                $params[] = $center;
                $params[] = $centerCode;
                $params[] = "%$centerCode%";
                $types .= "sss";
            } else {
                $whereClauses[] = "rf.center = ?";
                $params[] = $center;
                $types .= "s";
            }
        }
    }

    if ($campus && $campus !== 'All' && $campus !== 'All Campuses') {
        $whereClauses[] = "rf.campus = ?";
        $params[] = $campus;
        $types .= "s";
    }

    $baseWhereSql = implode(" AND ", $whereClauses);
    $baseParams = $params;
    $baseTypes = $types;

    if ($cursor) {
        $whereClauses[] = $direction === 'next' ? "rf.id < ?" : "rf.id > ?";
        $params[] = $cursor;
        $types .= "i";
    }

    $whereSql = implode(" AND ", $whereClauses);
    $orderSql = $direction === 'next' ? "DESC" : "ASC";

    $query = "SELECT 
                rf.id,
                rf.title,
                rf.author,
                rf.coauthor,
                rf.category,
                rf.center,
                rf.campus,
                rm.fund_source,
                rm.start_date,
                rm.location,
                rm.q1_completion, rm.q1_status, rm.q1_remarks, rm.q1_measures,
                rm.q2_completion, rm.q2_status, rm.q2_remarks, rm.q2_measures,
                rm.q3_completion, rm.q3_status, rm.q3_remarks, rm.q3_measures,
                rm.q4_completion, rm.q4_status, rm.q4_remarks, rm.q4_measures,
                rm.official_completion_date,
                rm.final_completion_remarks
              FROM researchfile rf
              INNER JOIN event_list el ON rf.event_id = el.id
              LEFT JOIN research_monitoring rm ON rf.id = rm.research_id
              WHERE $whereSql
              ORDER BY rf.id $orderSql
              LIMIT " . ($limit + 1);

    $stmt = $conn->prepare($query);
    if ($types) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $researcherList = [ucwords(strtolower(trim($row['author'])))];
        $coauthorData = json_decode($row['coauthor'], true);
        if (is_array($coauthorData)) {
            foreach ($coauthorData as $ca) {
                if (!empty(trim($ca))) {
                    $researcherList[] = ucwords(strtolower(trim($ca)));
                }
            }
        } elseif (!empty(trim($row['coauthor'])) && $row['coauthor'] !== '[]') {
             $researcherList[] = ucwords(strtolower(trim($row['coauthor'])));
        }
        $researchersDisplay = implode(', ', array_filter($researcherList));

        $item = [
            'id' => $row['id'],
            'title' => $row['title'],
            'researchers' => $researchersDisplay,
            'startDate' => $row['start_date'],
            'fundSource' => $row['fund_source'],
            'category' => $row['category'],
            'center' => $row['center'],
            'campus' => $row['campus'],
            'location' => $row['location'] ?? '—',
            'readyForSymposium' => !empty($row['official_completion_date']),
            'quarters' => [
                'q1' => [
                    'completion' => $row['q1_completion'],
                    'status' => $row['q1_status'],
                    'remarks' => $row['q1_remarks'],
                    'measures' => $row['q1_measures']
                ],
                'q2' => [
                    'completion' => $row['q2_completion'],
                    'status' => $row['q2_status'],
                    'remarks' => $row['q2_remarks'],
                    'measures' => $row['q2_measures']
                ],
                'q3' => [
                    'completion' => $row['q3_completion'],
                    'status' => $row['q3_status'],
                    'remarks' => $row['q3_remarks'],
                    'measures' => $row['q3_measures']
                ],
                'q4' => [
                    'completion' => $row['q4_completion'],
                    'status' => $row['q4_status'],
                    'remarks' => $row['q4_remarks'],
                    'measures' => $row['q4_measures']
                ]
            ]
        ];
        $data[] = $item;
    }

    $hasMore = count($data) > $limit;
    if ($hasMore) {
        array_pop($data);
    }

    if ($direction === 'prev') {
        $data = array_reverse($data);
    }

    $nextCursor = !empty($data) ? $data[count($data) - 1]['id'] : null;

    // Fetch Summary Stats using the same filters
    $statsQuery = "SELECT 
                    COUNT(*) as totalOngoing,
                    SUM(CASE WHEN rm.final_completion_remarks = 'Ready for Official Completion' THEN 1 ELSE 0 END) as completed
                  FROM researchfile rf
                  INNER JOIN event_list el ON rf.event_id = el.id
                  LEFT JOIN research_monitoring rm ON rf.id = rm.research_id
                  WHERE $baseWhereSql";
    
    $statsStmt = $conn->prepare($statsQuery);
    if ($baseTypes) {
        $statsStmt->bind_param($baseTypes, ...$baseParams);
    }
    $statsStmt->execute();
    $statsResult = $statsStmt->get_result();
    $stats = $statsResult->fetch_assoc();

    echo json_encode([
        'success' => true,
        'data' => $data,
        'pagination' => [
            'has_more' => $hasMore,
            'next_cursor' => $nextCursor
        ],
        'summary' => [
            'totalOngoing' => (int)$stats['totalOngoing'],
            'completed' => (int)$stats['completed'],
        ]
    ]);
} elseif ($action === 'save') {
    $researchId = $_POST['project_id'] ?? $_POST['projectId'] ?? '';
    $startDate = $_POST['startDate'] ?? null;
    $location = $_POST['location'] ?? '';
    $fundSource = $_POST['fundSource'] ?? '';
    $completion = (isset($_POST['completion']) && $_POST['completion'] !== '') ? (float)$_POST['completion'] : null;
    $status = $_POST['status'] ?? '';
    $remarks = $_POST['remarks'] ?? '';
    $measures = $_POST['measures'] ?? '';
    $quarter = $_POST['quarter'] ?? 'Q1';

    if (!$researchId) {
        echo json_encode(['success' => false, 'message' => 'Missing Project ID']);
        exit;
    }

    $qPrefix = strtolower($quarter);
    $completionCol = $qPrefix . "_completion";
    $statusCol = $qPrefix . "_status";
    $remarksCol = $qPrefix . "_remarks";
    $measuresCol = $qPrefix . "_measures";

    // Check if record exists
    $check = $conn->prepare("SELECT id, start_date, location, fund_source FROM research_monitoring WHERE research_id = ?");
    $check->bind_param("i", $researchId);
    $check->execute();
    $existing = $check->get_result()->fetch_assoc();

    if ($existing) {
        $finalStartDate = $startDate ?: $existing['start_date'];
        $finalLocation = $location ?: $existing['location'];
        $finalFundSource = $fundSource ?: $existing['fund_source'];
        
        $update = $conn->prepare("UPDATE research_monitoring SET 
                                    start_date = ?,
                                    location = ?, 
                                    fund_source = ?,
                                    $completionCol = ?, 
                                    $statusCol = ?, 
                                    $remarksCol = ?, 
                                    $measuresCol = ? 
                                  WHERE research_id = ?");
        $update->bind_param("sssdsssi", $finalStartDate, $finalLocation, $finalFundSource, $completion, $status, $remarks, $measures, $researchId);
        $res = $update->execute();
    } else {
        // Get metadata from researchfile
        $meta = $conn->prepare("SELECT title, author, coauthor, date_started FROM researchfile WHERE id = ?");
        $meta->bind_param("i", $researchId);
        $meta->execute();
        $metaData = $meta->get_result()->fetch_assoc();
        
        $projectTitle = $metaData['title'] ?? 'Untitled Project';
        
        $researcherList = [ucwords(strtolower(trim($metaData['author'] ?? '')))];
        $coauthorData = json_decode($metaData['coauthor'] ?? '[]', true);
        if (is_array($coauthorData)) {
            foreach ($coauthorData as $ca) {
                if (!empty(trim($ca))) {
                    $researcherList[] = ucwords(strtolower(trim($ca)));
                }
            }
        }
        $researchers = implode(', ', array_filter($researcherList));
        
        $finalStartDate = $startDate ?: ($metaData['date_started'] ?? date('Y-m-d'));
        $finalLocation = $location ?: '';
        $finalFundSource = $fundSource ?: '';

        $insert = $conn->prepare("INSERT INTO research_monitoring 
                                    (research_id, project_title, researchers, fund_source, start_date, location, $completionCol, $statusCol, $remarksCol, $measuresCol) 
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $insert->bind_param("issssdssss", $researchId, $projectTitle, $researchers, $finalFundSource, $finalStartDate, $finalLocation, $completion, $status, $remarks, $measures);
        $res = $insert->execute();
    }

    echo json_encode(['success' => $res]);
} elseif ($action === 'markReadyForSymposium') {
    $researchId = $_POST['projectId'] ?? '';
    $isReady = $_POST['isReady'] === 'true';
    $completionDate = $isReady ? date('Y-m-d') : null;

    $update = $conn->prepare("UPDATE research_monitoring SET official_completion_date = ? WHERE research_id = ?");
    $update->bind_param("si", $completionDate, $researchId);
    $res = $update->execute();

    echo json_encode(['success' => $res]);
} elseif ($action === 'fetch_years') {
    $query = "SELECT DISTINCT YEAR(date) as year 
              FROM event_list 
              WHERE name LIKE '%In-House Review%' OR name LIKE '%In House Review%' 
              ORDER BY year DESC";
    $result = $conn->query($query);
    $years = [];
    while ($row = $result->fetch_assoc()) {
        if ($row['year']) $years[] = (string)$row['year'];
    }
    echo json_encode(['success' => true, 'years' => $years]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid Action']);
}
