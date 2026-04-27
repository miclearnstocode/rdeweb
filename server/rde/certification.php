<?php
require_once(__DIR__ . '/../db.php');

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

// Helper function to decode JSON or treat as single string array
function decodeAuthors($raw) {
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    if ($decoded !== null && is_array($decoded)) {
        return $decoded;
    }
    // If not JSON or not an array, treat as single string
    return [$raw];
}


function cleanName($name) {
    if (!$name) return '';
    // Standardize to uppercase
    $name = strtoupper($name);
    // Remove punctuation
    $name = str_replace(['.', ',', '-', '(', ')', '/', ';', ':'], ' ', $name);
    // Common honorifics and suffixes to strip
    $titles = [
        'DR', 'PROF', 'ENGR', 'ARCH', 'ATTY', 'HON', 'MR', 'MS', 'MRS',
        'PHD', 'EDD', 'MSC', 'MA', 'BSC', 'BS', 'MD', 'PA', 'LPT', 'RN', 'RT',
        'PH D', 'ED D'
    ];
    // Use word boundaries to avoid stripping letters from names
    foreach ($titles as $t) {
        $name = preg_replace('/\b' . $t . '\b/', ' ', $name);
    }
    // Collapse whitespace
    return trim(preg_replace('/\s+/', ' ', $name));
}


function isSameName($n1, $n2, $cleanedQuery = null) {
    $c1 = cleanName($n1);
    $c2 = $cleanedQuery ?: cleanName($n2);
    
    if (!$c1 || !$c2) return false;
    if ($c1 === $c2) return true;
    
    // If they aren't exactly the same, check similarity
    // Minimum length check to avoid matching short names incorrectly
    if (strlen($c1) > 5 && strlen($c2) > 5) {
        similar_text($c1, $c2, $percent);
        if ($percent >= 90) return true;
    }
    
    return false;
}

switch ($action) {
    case 'searchFaculty':
        $query = $_GET['query'] ?? '';
        if (strlen($query) < 2) {
            echo json_encode([]);
            exit;
        }

        // Search in unique names from author, coauthor, presenter
        // Only from accepted endorsements
        $sql = "SELECT rf.author, rf.coauthor, rf.presenter 
                FROM researchfile rf
                INNER JOIN endorsement e ON rf.endorsementid = e.id
                WHERE e.status = 'accepted'";
        $result = $conn->query($sql);
        
        $names = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $a = decodeAuthors($row['author']);
                $ca = decodeAuthors($row['coauthor']);
                $p = decodeAuthors($row['presenter']);
                
                foreach (array_merge($a, $ca, $p) as $name) {
                    if ($name && stripos($name, $query) !== false) {
                        $names[trim($name)] = true;
                    }
                }
            }
        }
        
        echo json_encode(array_keys($names));
        break;

    case 'getReports':
        // Fetch existing certification logs from the database
        $sql = "SELECT * FROM certification_log ORDER BY date DESC, id DESC";
        $result = $conn->query($sql);
        $logs = [];
        if ($result && $result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $certData = json_decode($row['certificate_data'], true);
                if (!is_array($certData)) {
                    $certData = [];
                }
                $certData['issueDate'] = $row['date']; // override with the actual log date
                $logs[] = [
                    'date' => date('M d, Y', strtotime($row['date'])),
                    'controlNo' => $row['control_no'],
                    'requestingFaculty' => $row['requesting_faculty'],
                    'campus' => $row['campus'],
                    'dateTimeRelease' => $row['dateTimeRelease'] ? date('M d, Y h:i A', strtotime($row['dateTimeRelease'])) : '—',
                    'certificateData' => $certData,
                    'fileUrl' => $row['file_url'] ?? ''
                ];
            }
        }
        echo json_encode($logs);
        break;

    case 'getFacultyResearch':
        $name = $_GET['name'] ?? '';
        if (!$name) {
            echo json_encode([]);
            exit;
        }

        $sql = "SELECT rf.id, rf.title, rf.author, rf.coauthor, rf.presenter, rf.campus, rf.center, rf.date_completed
                FROM researchfile rf
                INNER JOIN endorsement e ON rf.endorsementid = e.id
                WHERE e.status = 'accepted'";
        
        $result = $conn->query($sql);
        $found = [];
        $cleanedQuery = cleanName($name);
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $a = decodeAuthors($row['author']);
                $ca = decodeAuthors($row['coauthor']);
                $p = decodeAuthors($row['presenter']);
                
                $members = array_merge($a, $ca, $p);
                $isPart = false;
                foreach ($members as $m) {
                    if (isSameName($m, $name, $cleanedQuery)) {
                        $isPart = true;
                        break;
                    }
                }
                
                if ($isPart) {
                    // Combine all contributors into a single unique list
                    $allAuthors = array_unique(array_map('trim', array_merge($a, $ca, $p)));
                    // Format the date_completed (year only)
                    $dateFormat = $row['date_completed'] ? date('Y', strtotime($row['date_completed'])) : '';
                    $found[] = [
                        'id' => $row['id'],
                        'title' => $row['title'],
                        'dateCompleted' => $dateFormat,
                        'authors' => implode(', ', $allAuthors),
                        'campus' => $row['campus'] ?: $row['center'] ?: '—'
                    ];
                }
            }
        }
        
        echo json_encode($found);
        break;

    case 'saveCertificate':
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        if (!$data) {
            echo json_encode(['success' => false, 'message' => 'No data received']);
            exit;
        }

        $controlNo = $conn->real_escape_string($data['controlNo']);
        $fullName = $conn->real_escape_string($data['fullName']);
        $campus = $conn->real_escape_string($data['campus']);
        $date = $conn->real_escape_string($data['issueDate']);
        $certificateData = $conn->real_escape_string(json_encode($data));

        $sql = "INSERT INTO certification_log (date, control_no, requesting_faculty, campus, dateTimeRelease, certificate_data) 
                VALUES ('$date', '$controlNo', '$fullName', '$campus', CURRENT_TIMESTAMP, '$certificateData')";
        
        if ($conn->query($sql)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => $conn->error]);
        }
        break;

    case 'getLatestControlNo':
        $sql = "SELECT control_no FROM certification_log WHERE control_no LIKE 'RES%-%' ORDER BY id DESC LIMIT 1";
        $result = $conn->query($sql);
        $next = "001-" . date('y');
        
        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $latest = $row['control_no'];
            
            if (preg_match('/RES(\d+)-(\d+)/', $latest, $matches)) {
                $num = intval($matches[1]);
                $lastYear = $matches[2];
                $currentYear = date('y');
                
                if ($lastYear == $currentYear) {
                    $nextNum = $num + 1;
                } else {
                    $nextNum = 1;
                }
                $next = str_pad($nextNum, 3, '0', STR_PAD_LEFT) . '-' . $currentYear;
            }
        }
        echo json_encode(['success' => true, 'next' => $next]);
        break;
        
        case 'getStats':
            // Get total certificates from certification_log
            $totalCertSql = "SELECT COUNT(*) as total FROM certification_log";
            $totalResult = $conn->query($totalCertSql);
            $totalCertificates = ($totalResult && $row = $totalResult->fetch_assoc()) ? $row['total'] : 0;
            
            // Get this month's certificates
            $currentMonth = date('Y-m');
            $thisMonthSql = "SELECT COUNT(*) as total FROM certification_log WHERE DATE_FORMAT(date, '%Y-%m') = '$currentMonth'";
            $thisMonthResult = $conn->query($thisMonthSql);
            $thisMonth = ($thisMonthResult && $row = $thisMonthResult->fetch_assoc()) ? $row['total'] : 0;
            
            // Get this year's certificates
            $currentYear = date('Y');
            $thisYearSql = "SELECT COUNT(*) as total FROM certification_log WHERE YEAR(date) = '$currentYear'";
            $thisYearResult = $conn->query($thisYearSql);
            $thisYear = ($thisYearResult && $row = $thisYearResult->fetch_assoc()) ? $row['total'] : 0;
            
            // Get unique faculty from researchfile (author, coauthor, presenter)
            // Only from accepted endorsements
            $uniqueFacultySql = "SELECT author, coauthor, presenter FROM researchfile rf
                                INNER JOIN endorsement e ON rf.endorsementid = e.id
                                WHERE e.status = 'accepted'";
            $facultyResult = $conn->query($uniqueFacultySql);
            
            $uniqueFacultyNames = [];
            if ($facultyResult) {
                while ($row = $facultyResult->fetch_assoc()) {
                    $authors = decodeAuthors($row['author']);
                    $coauthors = decodeAuthors($row['coauthor']);
                    $presenters = decodeAuthors($row['presenter']);
                    
                    foreach (array_merge($authors, $coauthors, $presenters) as $name) {
                        $c = cleanName($name);
                        if ($c) {
                            $uniqueFacultyNames[$c] = true;
                        }
                    }
                }
            }
            
            $uniqueFaculty = count($uniqueFacultyNames);
            
            echo json_encode([
                'success' => true,
                'total' => $totalCertificates,
                'thisMonth' => $thisMonth,
                'thisYear' => $thisYear,
                'uniqueFaculty' => $uniqueFaculty
            ]);
            break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}