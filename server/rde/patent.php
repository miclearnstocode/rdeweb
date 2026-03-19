<?php
require_once(__DIR__ . '/../db.php');
require_once(__DIR__ . '/../../config/driver_config.php');

header('Content-Type: application/json');

// Define allowed tables and their specific columns for centralized access
$table_map = [
    'patent' => [
        'research_id', 'endorsement_id', 'productName', 'patentNumber', 'productDescription', 
        'status', 'filingDate', 'grantDate', 'inventors', 'caseNumber', 'applicationNumber', 
        'publicationDate', 'agent', 'campus', 'image',
        'application_form_url', 'abstract_url', 'claims_url', 'drawing_url', 'description_file_url'
    ],
    'utility_model' => [
        'research_id', 'endorsement_id', 'productName', 'patentNumber', 'productDescription', 
        'status', 'filingDate', 'grantDate', 'inventors', 'caseNumber', 'applicationNumber', 
        'publicationDate', 'agent', 'campus', 'image',
        'application_form_url', 'abstract_url', 'claims_url', 'drawing_url', 'description_file_url'
    ],
    'copyright' => [
        'productName', 'patentNumber', 'productDescription', 'status', 'filingDate', 'grantDate', 
        'inventors', 'classOfWork', 'campus', 'image',
        'copyright_forms_url', 'supplemental_url', 'deed_assignment_url', 'affidavit_url', 'ids_authors_url', 'creative_work_url'
    ],
    'industrial_design' => [
        'research_id', 'endorsement_id', 'productName', 'patentNumber', 'productDescription', 
        'status', 'filingDate', 'grantDate', 'inventors', 'caseNumber', 'applicationNumber', 
        'publicationDate', 'expirationDate', 'campus', 'image',
        'application_form_url', 'specification_url', 'drawing_url'
    ],
    'trademark' => ['research_id', 'endorsement_id', 'productName', 'patentNumber', 'productDescription', 'status', 'filingDate', 'grantDate', 'registrant', 'applicationNumber', 'expirationDate', 'campus', 'image', 'application_form_url']
];

require_once(__DIR__ . '/../../config/patent_folder.php');

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'search_research':
        $search = $_POST['search'] ?? '';
        $searchTerm = "%$search%";
        
        $sql = "SELECT r.id, r.title, r.author, e.event, r.endorsementid 
                FROM researchfile r 
                JOIN endorsement e ON r.endorsementid = e.id 
                WHERE e.status = 'accepted' AND r.title LIKE ? 
                LIMIT 10";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $searchTerm);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $authors = json_decode($row['author'], true);
            $row['author'] = is_array($authors) ? implode(', ', $authors) : $row['author'];
            $row['endorsement_id'] = $row['endorsementid'];
            $data[] = $row;
        }
        
        echo json_encode(['success' => true, 'data' => $data]);
        break;

    case 'save':
    case 'update':
        $id = $_POST['id'] ?? 0;
        $type = $_POST['type'] ?? 'patent';
        
        $table = array_key_exists($type, $table_map) ? $type : 'patent';
        $columns = $table_map[$table];

        // Prepare data from POST
        $data = [];
        foreach ($columns as $col) {
            // Check for existing URLs passed from frontend
            if (strpos($col, '_url') !== false || $col === 'image') {
                $data[$col] = $_POST['current_' . $col] ?? null;
                continue;
            }
            $val = $_POST[$col] ?? null;
            if ($val === '' || $val === 'null') $val = null;
            $data[$col] = $val;
        }

        // Handle GDrive File Uploads
        $file_config = [
            'patent_image'          => 'image',
            'application_form_file' => 'application_form_url',
            'abstract_file'         => 'abstract_url',
            'claims_file'           => 'claims_url',
            'drawing_file'          => 'drawing_url',
            'description_file'      => 'description_file_url',
            'specification_file'    => 'specification_url',
            'copyright_forms_file'  => 'copyright_forms_url',
            'supplemental_file'     => 'supplemental_url',
            'deed_assignment_file'  => 'deed_assignment_url',
            'affidavit_file'        => 'affidavit_url',
            'ids_authors_file'      => 'ids_authors_url',
            'creative_work_file'    => 'creative_work_url'
        ];

        try {
            $drive = null;
            $image_product_name = $_POST['productName'] ?? 'Unnamed Product';
            $campus_name = $_POST['campus'] ?? 'Main Campus';

            // Get standard IP folder ID for this record (creates folders as needed)
            require_once(__DIR__ . '/../../config/patent_folder.php');
            $recordFolderId = getIPFolderId($table, $campus_name, $image_product_name);

            foreach ($file_config as $input_name => $db_col) {
                if (isset($_FILES[$input_name]) && $_FILES[$input_name]['error'] === UPLOAD_ERR_OK) {
                    if (!$drive) $drive = new GoogleDriveService();
                    
                    $uploadResult = $drive->uploadFile(
                        $_FILES[$input_name]['tmp_name'],
                        $_FILES[$input_name]['name'],
                        $recordFolderId
                    );
                    
                    if ($uploadResult['success']) {
                        $drive->makeFilePublic($uploadResult['id']);
                        $data[$db_col] = $uploadResult['view_url'];
                    }
                }
            }
        } catch (Exception $e) {
            error_log("GDrive Upload Error: " . $e->getMessage());
        }

        if ($action === 'save') {
            $cols_str = implode(', ', array_keys($data));
            $placeholders = implode(', ', array_fill(0, count($data), '?'));
            $sql = "INSERT INTO $table ($cols_str) VALUES ($placeholders)";
            
            $stmt = $conn->prepare($sql);
            $types = "";
            $values = [];
            foreach ($data as $k => $v) {
                $values[] = $v;
                $types .= (is_numeric($v) && $k !== 'patentNumber' && $k !== 'caseNumber' && $k !== 'applicationNumber') ? 'i' : 's';
            }
            $stmt->bind_param($types, ...$values);
        } else {
            $set_part = implode('=?, ', array_keys($data)) . '=?';
            $sql = "UPDATE $table SET $set_part WHERE id=?";
            
            $stmt = $conn->prepare($sql);
            $types = "";
            $values = [];
            foreach ($data as $k => $v) {
                $values[] = $v;
                $types .= (is_numeric($v) && $k !== 'patentNumber' && $k !== 'caseNumber' && $k !== 'applicationNumber') ? 'i' : 's';
            }
            $types .= "i";
            $values[] = $id;
            $stmt->bind_param($types, ...$values);
        }
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => "Record " . ($action === 'save' ? "saved" : "updated") . " in $table successfully"]);
        } else {
            echo json_encode(['success' => false, 'message' => $conn->error]);
        }
        break;

    case 'delete':
        $id = $_POST['id'] ?? 0;
        $type = $_POST['type'] ?? 'patent';
        $allowed = ['patent', 'utility_model', 'copyright', 'industrial_design', 'trademark'];
        $table = in_array($type, $allowed) ? $type : 'patent';

        $sql = "DELETE FROM $table WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Record deleted successfully from ' . $table]);
        } else {
            echo json_encode(['success' => false, 'message' => $conn->error]);
        }
        break;

    case 'getAll':
        $search = $_POST['search'] ?? '';
        $typeFilter = $_POST['type'] ?? '';
        $searchTerm = "%$search%";
        
        $tables_to_query = [];
        if ($typeFilter && $typeFilter !== 'all') {
            $tables_to_query = [$typeFilter];
        } else {
            $tables_to_query = ['patent', 'utility_model', 'copyright', 'industrial_design', 'trademark'];
        }

        $all_results = [];
        
        foreach ($tables_to_query as $table) {
            $has_research = isset($table_map[$table]) && in_array('research_id', $table_map[$table]);
            $select_fields = "p.*, '$table' as type";
            $select_fields .= $has_research ? ", r.title as research_title" : ", NULL as research_title";
            $join_sql = $has_research ? " LEFT JOIN researchfile r ON p.research_id = r.id" : "";
            
            $sql = "SELECT $select_fields FROM $table p $join_sql WHERE 1=1";
            
            if ($search) {
                $sql .= " AND (p.productName LIKE ? OR p.patentNumber LIKE ?)";
            }
            
            $stmt = $conn->prepare($sql);
            if ($search) {
                $stmt->bind_param('ss', $searchTerm, $searchTerm);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            
            while ($row = $result->fetch_assoc()) {
                $all_results[] = $row;
            }
        }
        
        echo json_encode(['success' => true, 'data' => $all_results]);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}