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
                $certData['issueDate'] = $row['date']; // override with the actual log date
                $logs[] = [
                    'date' => date('M d, Y', strtotime($row['date'])),
                    'controlNo' => $row['control_no'],
                    'requestingFaculty' => $row['requesting_faculty'],
                    'campus' => $row['campus'],
                    'dateTimeRelease' => $row['dateTimeRelease'] ? date('M d, Y h:i A', strtotime($row['dateTimeRelease'])) : '—',
                    'certificateData' => $certData
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

        $sql = "SELECT rf.id, rf.title, rf.author, rf.coauthor, rf.presenter, rf.campus, rf.center
                FROM researchfile rf
                INNER JOIN endorsement e ON rf.endorsementid = e.id
                WHERE e.status = 'accepted'";
        
        $result = $conn->query($sql);
        $found = [];
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $a = decodeAuthors($row['author']);
                $ca = decodeAuthors($row['coauthor']);
                $p = decodeAuthors($row['presenter']);
                
                $members = array_merge($a, $ca, $p);
                $isPart = false;
                foreach ($members as $m) {
                    if (trim(strtolower($m)) === trim(strtolower($name))) {
                        $isPart = true;
                        break;
                    }
                }
                
                if ($isPart) {
                    // Combine all contributors into a single unique list
                    $allAuthors = array_unique(array_map('trim', array_merge($a, $ca, $p)));
                    $found[] = [
                        'id' => $row['id'],
                        'title' => $row['title'],
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

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}
?>