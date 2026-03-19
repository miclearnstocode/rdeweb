<?php
require_once(__DIR__ . '/../db.php');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

class PublicationAPI {
    private $con;
    
    public function __construct($dbConnection) {
        $this->con = $dbConnection;
    }

    /**
     * Search research file titles where endorsement status is 'accepted'
     * Uses endorsement.id as the reference, not senderid
     */
    public function searchResearchTitles() {
        $searchTerm = $_POST['search'] ?? '';
        
        if (empty($searchTerm)) {
            echo json_encode(['success' => false, 'message' => 'Search term is required']);
            return;
        }
        
        $response = [];
        
        // Search for research files with accepted endorsements
        $query = "
            SELECT 
                rf.id as research_id,
                rf.endorsementid as endorsement_id,
                rf.title as research_title,
                rf.author,
                rf.coauthor,
                rf.presenter,
                rf.category,
                rf.center,
                rf.campus,
                e.event,
                e.status as endorsement_status,
                e.date as endorsement_date
            FROM researchfile rf
            INNER JOIN endorsement e ON rf.endorsementid = e.id
            WHERE 
                e.status = 'accepted'
                AND rf.title LIKE ?
            ORDER BY rf.title ASC
            LIMIT 20
        ";
        
        $statement = $this->con->prepare($query);
        if (!$statement) {
            echo json_encode(['success' => false, 'message' => 'Query preparation failed: ' . $this->con->error]);
            return;
        }
        
        $searchParam = "%{$searchTerm}%";
        $statement->bind_param('s', $searchParam);
        $statement->execute();
        $result = $statement->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $response[] = [
                'id' => $row['research_id'],
                'endorsement_id' => $row['endorsement_id'],
                'title' => $row['research_title'],
                'author' => (function($raw) {
                    if (empty($raw)) return [];
                    $decoded = json_decode($raw, true);
                    if (is_array($decoded)) return $decoded;
                    // Plain string author name — wrap it
                    return [$raw];
                })($row['author'] ?? ''),
                'coauthor' => json_decode($row['coauthor'] ?? '[]'),
                'presenter' => $row['presenter'],
                'category' => $row['category'],
                'center' => $row['center'],
                'campus' => $row['campus'],
                'event' => $row['event']
            ];
        }
        
        $statement->close();
        
        echo json_encode([
            'success' => true,
            'data' => $response,
            'count' => count($response)
        ]);
    }

    /**
     * Add a new publication
     */
    public function addPublication() {
        // Get POST data
        $research_id = $_POST['research_id'] ?? '';
        $endorsement_id = $_POST['endorsement_id'] ?? '';
        $title = $_POST['title'] ?? '';
        $publishedTitle = $_POST['publishedTitle'] ?? '';
        $publicationDate = $_POST['publicationDate'] ?? '';
        $journalTitle = $_POST['journalTitle'] ?? '';
        $volume = $_POST['volume'] ?? '';
        $issue = $_POST['issue'] ?? '';
        $issn = $_POST['issn'] ?? '';
        $index_type = $_POST['index_type'] ?? '';
        $doi = $_POST['doi'] ?? '';
        $publication_link = $_POST['publication_link'] ?? '';
        
        // Validate required fields
        $required = [
            'research_id' => 'Research ID',
            'endorsement_id' => 'Endorsement ID',
            'title' => 'Title',
            'publishedTitle' => 'Published Title',
            'publicationDate' => 'Publication Date',
            'journalTitle' => 'Journal Title',
            'volume' => 'Volume',
            'issue' => 'Issue',
            'issn' => 'ISSN/ISBN',
            'index_type' => 'Index Type'
        ];
        
        $missing = [];
        foreach ($required as $field => $label) {
            if (empty($_POST[$field])) {
                $missing[] = $label;
            }
        }
        
        if (!empty($missing)) {
            echo json_encode([
                'success' => false, 
                'message' => 'Missing required fields: ' . implode(', ', $missing)
            ]);
            return;
        }
        

        
        $response = new stdClass();
        $response->success = false;
        $response->message = '';
        
        // Check if publication already exists for this research
        $checkQuery = "SELECT id FROM publications WHERE research_id = ?";
        $checkStmt = $this->con->prepare($checkQuery);
        if (!$checkStmt) {
            $response->message = 'Query preparation failed: ' . $this->con->error;
            echo json_encode($response);
            return;
        }
        
        $checkStmt->bind_param('s', $research_id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            $response->message = 'A publication already exists for this research';
            echo json_encode($response);
            $checkStmt->close();
            return;
        }
        $checkStmt->close();
        
        // Insert publication
        $query = "
            INSERT INTO publications (
                research_id,
                endorsement_id,
                title,
                published_title,
                publication_date,
                journal_title,
                volume,
                issue,
                issn,
                index_type,
                doi,
                publication_link,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ";
        
        $stmt = $this->con->prepare($query);
        if (!$stmt) {
            $response->message = 'Insert preparation failed: ' . $this->con->error;
            echo json_encode($response);
            return;
        }
        
        $stmt->bind_param(
            'ssssssssssss',
            $research_id,
            $endorsement_id,
            $title,
            $publishedTitle,
            $publicationDate,
            $journalTitle,
            $volume,
            $issue,
            $issn,
            $index_type,
            $doi,
            $publication_link
        );
        
        if ($stmt->execute()) {
            $publicationId = $this->con->insert_id;
            $response->success = true;
            $response->message = 'Publication added successfully';
            $response->data = [
                'id' => $publicationId,
                'research_id' => $research_id,
                'title' => $publishedTitle
            ];
        } else {
            $response->message = $stmt->error;
        }
        
        $stmt->close();
        
        echo json_encode($response);
    }

    /**
     * Get all publications
     */
    public function getAllPublications() {
        $index_filter = $_POST['index_filter'] ?? '';
        $searchTerm = $_POST['search'] ?? '';
        $response = [];
        
        $whereClauses = [];
        $params = [];
        $types = "";

        if (!empty($index_filter)) {
            $whereClauses[] = " p.index_type = ? ";
            $params[] = $index_filter;
            $types .= "s";
        }

        if (!empty($searchTerm)) {
            $whereClauses[] = " (p.published_title LIKE ? OR p.publication_date LIKE ? OR p.journal_title LIKE ? OR p.volume LIKE ? OR p.issue LIKE ?) ";
            $searchPattern = "%{$searchTerm}%";
            for ($i = 0; $i < 5; $i++) {
                $params[] = $searchPattern;
                $types .= "s";
            }
        }

        $whereSQL = !empty($whereClauses) ? " WHERE " . implode(" AND ", $whereClauses) : "";

        $query = "
            SELECT 
                p.*,
                rf.title as original_title,
                rf.author,
                rf.coauthor,
                rf.presenter,
                e.event as event_name
            FROM publications p
            LEFT JOIN researchfile rf ON p.research_id = rf.id
            LEFT JOIN endorsement e ON p.endorsement_id = e.id
            $whereSQL
            ORDER BY p.created_at DESC
        ";
        
        $statement = $this->con->prepare($query);
        if (!$statement) {
            echo json_encode(['success' => false, 'message' => 'Query preparation failed: ' . $this->con->error]);
            return;
        }

        if (!empty($params)) {
            $statement->bind_param($types, ...$params);
        }
        
        $statement->execute();
        $result = $statement->get_result();
        
        while ($pub = $result->fetch_assoc()) {
            $response[] = [
                'id' => $pub['id'],
                'research_id' => $pub['research_id'],
                'endorsement_id' => $pub['endorsement_id'],
                'title' => $pub['title'],
                'publishedTitle' => $pub['published_title'],
                'publicationDate' => $pub['publication_date'],
                'journalTitle' => $pub['journal_title'],
                'volume' => $pub['volume'],
                'issue' => $pub['issue'],
                'issn' => $pub['issn'],
                'index' => $pub['index_type'],
                'doi' => $pub['doi'],
                'publication_link' => $pub['publication_link'],
                'created_at' => $pub['created_at'],
                'original_title' => $pub['original_title'],
                'authors' => json_decode($pub['author'] ?? '[]'),
                'event' => $pub['event_name']
            ];
        }
        
        $statement->close();
        
        echo json_encode([
            'success' => true,
            'data' => $response,
            'count' => count($response)
        ]);
    }
    /**
     * Update an existing publication
     */
    public function updatePublication() {
        $id = $_POST['id'] ?? '';
        $published_title = $_POST['publishedTitle'] ?? '';
        $publication_date = $_POST['publicationDate'] ?? '';
        $journal_title = $_POST['journalTitle'] ?? '';
        $volume = $_POST['volume'] ?? '';
        $issue = $_POST['issue'] ?? '';
        $issn = $_POST['issn'] ?? '';
        $index_type = $_POST['index_type'] ?? '';
        $doi = $_POST['doi'] ?? '';
        $publication_link = $_POST['publication_link'] ?? '';

        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'Publication ID is required for update']);
            return;
        }

        $query = "
            UPDATE publications SET 
                published_title = ?,
                publication_date = ?,
                journal_title = ?,
                volume = ?,
                issue = ?,
                issn = ?,
                index_type = ?,
                doi = ?,
                publication_link = ?,
                updated_at = NOW()
            WHERE id = ?
        ";

        $stmt = $this->con->prepare($query);
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'Update preparation failed: ' . $this->con->error]);
            return;
        }

        $stmt->bind_param(
            'sssssssssi',
            $published_title,
            $publication_date,
            $journal_title,
            $volume,
            $issue,
            $issn,
            $index_type,
            $doi,
            $publication_link,
            $id
        );

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Publication updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Update failed: ' . $stmt->error]);
        }
        $stmt->close();
    }
}

// Initialize database connection
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
$con = new mysqli($host, $username, $pass, $dbName);

if ($con->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $con->connect_error]);
    exit;
}

// Set charset to utf8mb4
$con->set_charset("utf8mb4");

// Create API instance
$api = new PublicationAPI($con);

// Handle different actions based on request
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// For JSON requests, try to get action from JSON body
if (empty($action)) {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input && isset($input['action'])) {
        $action = $input['action'];
    }
}

switch ($action) {
    case 'search':
        $api->searchResearchTitles();
        break;
    case 'add':
        $api->addPublication();
        break;
    case 'update':
        $api->updatePublication();
        break;
    case 'getAll':
        $api->getAllPublications();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}