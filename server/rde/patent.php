<?php
require_once(__DIR__ . '/../db.php');
require_once(__DIR__ . '/../../config/driver_config.php');

header('Content-Type: application/json');

// Define allowed tables and their specific columns for centralized access
$table_map = [
    'patent' => [
        'research_id', 'endorsement_id', 'caseNumber', 'technologyName', 'inventors', 
        'campus', 'agent', 'applicationDate', 'applicationNumber', 'publicationDate', 
        'status', 'patentFormURL', 'abstractURL', 'claimsURL', 
        'technicalDescriptionURL', 'technicalDrawingURL', 'photoTechnologyURL',
        'registrationNumber', 'registrationDate'
    ],
    'utility_model' => [
        'research_id', 'endorsement_id', 'caseNumberUM', 'technologyNameUM', 'inventorsUM', 
        'campusUM', 'agentUM', 'applicationDateUM', 'applicationNumberUM', 'publicationDateUM', 
        'statusUM', 'patentFormURLUM', 'abstractURLUM', 'claimsURLUM', 
        'technicalDescriptionURLUM', 'technicalDrawingURLUM', 'photoTechnologyURLUM',
        'registrationNumber', 'registrationDate'
    ],
    'copyright' => [
        'title', 'author', 'campus', 'applicationDate', 'classOfWork', 'status', 'photoWorksURL', 
        'copyrightFormsURL', 'supplementalDocumentURL', 'deedAssignmentURL', 'affidavitOwnershipURL', 
        'idAuthorURL', 'creativeWorksURL', 'registrationNumber', 'registrationDate'
    ],
    'industrial_design' => [
        'research_id', 'endorsement_id', 'caseNumber', 'idTitle', 'invertors', 'campus', 'agent', 
        'applicationDate', 'applicationNumber', 'publicationDate', 'status', 'applicationFormURL', 
        'abstractURL', 'claimsURL', 'technicalDescriptionURL', 'technicalDrawingURL', 'photoTechnologyURL',
        'registrationNumber', 'registrationDate'
    ],
    'trademark' => [
        'title', 'registrant', 'applicationDate', 'applicationNumber', 'status', 
        'trademarkFormURL', 'photoTrademarkURL', 'registrationNumber', 'registrationDate'
    ]
];

require_once(__DIR__ . '/../../config/patent_folder.php');

$action = $_POST['action'] ?? '';

switch ($action) {
    case '':
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($_POST) && $_SERVER['CONTENT_LENGTH'] > 0) {
            echo json_encode(['success' => false, 'message' => 'The uploaded file/s or post request is too large for the server. Check post_max_size and upload_max_filesize in php.ini.']);
            exit;
        }
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;

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
            if (strpos($col, 'URL') !== false || $col === 'photoTechnologyURL' || $col === 'patent_image' || strpos($col, '_url') !== false) {
                $data[$col] = $_POST['current_' . $col] ?? null;
                continue;
            }
            $val = $_POST[$col] ?? null;
            if ($val === '' || $val === 'null') $val = null;
            $data[$col] = $val;
        }

        // Handle GDrive File Uploads
        $file_config = [];
        $mappings = [
            'photoTechnologyURL_file'      => 'photoTechnologyURL',
            'photoTechnologyURLUM_file'    => 'photoTechnologyURLUM',
            'patentFormURL_file'           => 'patentFormURL',
            'patentFormURLUM_file'         => 'patentFormURLUM',
            'abstractURL_file'             => 'abstractURL',
            'abstractURLUM_file'           => 'abstractURLUM',
            'claimsURL_file'               => 'claimsURL',
            'claimsURLUM_file'             => 'claimsURLUM',
            'technicalDrawingURL_file'     => 'technicalDrawingURL',
            'technicalDrawingURLUM_file'   => 'technicalDrawingURLUM',
            'technicalDescriptionURL_file' => 'technicalDescriptionURL',
            'technicalDescriptionURLUM_file' => 'technicalDescriptionURLUM',
            'application_form_file'        => 'applicationFormURL',
            'copyright_forms_file'         => 'copyrightFormsURL',
            'supplemental_file'            => 'supplementalDocumentURL',
            'deed_assignment_file'         => 'deedAssignmentURL',
            'affidavit_file'               => 'affidavitOwnershipURL',
            'ids_authors_file'             => 'idAuthorURL',
            'creative_work_file'           => 'creativeWorksURL',
            'photo_works_file'             => 'photoWorksURL',
            'trademark_form_file'          => 'trademarkFormURL',
            'photo_trademark_file'         => 'photoTrademarkURL'
        ];

        // Legacy fallbacks
        // Legacy fallbacks (No change needed as they might still be sent from other forms if any)
        $legacy = [
            'photoTechnologyURL'       => 'photoTechnologyURL',
            'patentFormURL'            => 'applicationFormURL',
            'abstractURL'              => 'abstractURL',
            'claimsURL'                => 'claimsURL',
            'technicalDrawingURL'      => 'technicalDrawingURL',
            'technicalDescriptionURL'  => 'technicalDescriptionURL'
        ];

        foreach ($mappings as $input => $db_col) {
            if (in_array($db_col, $columns)) {
                $file_config[$input] = $db_col;
            } elseif (isset($legacy[$db_col]) && in_array($legacy[$db_col], $columns)) {
                $file_config[$input] = $legacy[$db_col];
            }
        }

        try {
            $drive = null;
            $sfx = ($table === 'utility_model') ? 'UM' : (($table === 'industrial_design') ? 'Indus' : '');
            $image_product_name = $_POST['title'] ?? $_POST['technologyName' . $sfx] ?? $_POST['technologyName'] ?? $_POST['idTitle'] ?? $_POST['productName'] ?? 'Sample Only';
            $campus_name = $_POST['campus' . $sfx] ?? $_POST['campus'] ?? 'Main Campus';
            $status = $_POST['status' . $sfx] ?? $_POST['status'] ?? 'Filed';

            $recordFolderId = getIPFolderId($table, $campus_name, $image_product_name, $status);

            if (!$recordFolderId) {
                throw new Exception("Google Drive Error: Could not determine or create the destination folder ('$image_product_name') in the Shared Drive.");
            }

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
                    } else {
                        throw new Exception("GDrive Upload Failed for $input_name: " . ($uploadResult['error'] ?? 'Unknown error'));
                    }
                }
            }
        } catch (Exception $e) {
            error_log("GDrive Upload Error: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => "File Upload Error: " . $e->getMessage()]);
            exit;
        }

        if ($action === 'save') {
             // Check for missing mandatory fields before execution (only for Patent/UM where they are NOT NULL)
            if ($table === 'patent' || $table === 'utility_model' || $table === 'industrial_design') {
                $isID = ($table === 'industrial_design');
                $isUM = ($table === 'utility_model');
                $sfx = $isUM ? 'UM' : '';
                
                $mandatory_files = [
                    ($isID ? 'applicationFormURL' : 'patentFormURL' . $sfx),
                    'abstractURL' . $sfx,
                    'claimsURL' . $sfx,
                    'technicalDrawingURL' . $sfx,
                    'photoTechnologyURL' . $sfx
                ];
                
                foreach ($mandatory_files as $mand) {
                    if (empty($data[$mand])) {
                        echo json_encode(['success' => false, 'message' => "Mandatory file URL is missing for $mand."]);
                        exit;
                    }
                }
            }

            $cols_str = implode(', ', array_keys($data));
            $placeholders = implode(', ', array_fill(0, count($data), '?'));
            $sql = "INSERT INTO $table ($cols_str) VALUES ($placeholders)";
            $stmt = $conn->prepare($sql);
            $types = "";
            $values = [];
            foreach ($data as $k => $v) {
                $values[] = $v;
                $types .= ($k === 'research_id' || $k === 'endorsement_id' || $k === 'id') ? 'i' : 's';
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
                $types .= ($k === 'research_id' || $k === 'endorsement_id' || $k === 'id') ? 'i' : 's';
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

        // 1. Fetch record first to get file URLs
        $stmt = $conn->prepare("SELECT * FROM $table WHERE id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $record = $stmt->get_result()->fetch_assoc();

        if ($record) {
            $drive = new GoogleDriveService();
            
            // Reconstruct folder search parameters
            $sfx = ($table === 'utility_model') ? 'UM' : (($table === 'industrial_design') ? 'Indus' : '');
            $image_product_name = $record['title'] ?? $record['technologyName' . $sfx] ?? $record['technologyName'] ?? $record['idTitle'] ?? $record['productName'] ?? 'Sample Only';
            $campus_name = $record['campus' . $sfx] ?? $record['campus'] ?? 'Main Campus';
            $status = $record['status' . $sfx] ?? $record['status'] ?? 'Filed';

            // 1. Identify the record's main folder and trash it (Search only)
            require_once(__DIR__ . '/../../config/patent_folder.php');
            $recordFolderId = findIPFolder($drive, $table, $campus_name, $image_product_name, $status);
            if ($recordFolderId) {
                try {
                    $drive->trashFile($recordFolderId);
                } catch (Exception $e) {
                    error_log("Failed to trash folder $recordFolderId for record $id: " . $e->getMessage());
                }
            }

            // Helper function to extract Drive ID from URL
            $extractId = function($url) {
                if (!$url) return null;
                if (preg_match('/\/d\/([^\/]+)\//', $url, $matches)) return $matches[1];
                if (preg_match('/id=([^&]+)/', $url, $matches)) return $matches[1];
                return null;
            };

            // 2. Trash individual files (belt and suspenders)
            foreach ($record as $key => $value) {
                if (strpos($key, 'URL') !== false || $key === 'patent_image' || strpos($key, '_url') !== false) {
                    $fileId = $extractId($value);
                    if ($fileId && $fileId !== $recordFolderId) {
                        try {
                            $drive->trashFile($fileId);
                        } catch (Exception $e) {
                            error_log("Failed to trash file $fileId for record $id: " . $e->getMessage());
                        }
                    }
                }
            }
        }

        // 3. Delete from database
        $sql = "DELETE FROM $table WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Record and associated files removed successfully']);
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
                if ($table === 'industrial_design') {
                    $sql .= " AND (p.idTitle LIKE ? OR p.caseNumber LIKE ? OR p.invertors LIKE ? OR p.applicationNumber LIKE ?)";
                    $num_params = 4;
                } elseif ($table === 'utility_model') {
                    $sql .= " AND (p.technologyNameUM LIKE ? OR p.caseNumberUM LIKE ? OR p.inventorsUM LIKE ? OR p.applicationNumberUM LIKE ?)";
                    $num_params = 4;
                } elseif ($table === 'patent') {
                    $sql .= " AND (p.technologyName LIKE ? OR p.caseNumber LIKE ? OR p.inventors LIKE ? OR p.applicationNumber LIKE ?)";
                    $num_params = 4;
                } elseif ($table === 'copyright') {
                    $sql .= " AND (p.title LIKE ? OR p.author LIKE ? OR p.registrationNumber LIKE ?)";
                    $num_params = 3;
                } elseif ($table === 'trademark') {
                    $sql .= " AND (p.title LIKE ? OR p.registrant LIKE ? OR p.registrationNumber LIKE ?)";
                    $num_params = 3;
                } else {
                    $sql .= " AND (p.productName LIKE ? OR p.patentNumber LIKE ?)";
                    $num_params = 2;
                }
            }
            
            $stmt = $conn->prepare($sql);
            if ($search) {
                $types = str_repeat('s', $num_params);
                $params = array_fill(0, $num_params, $searchTerm);
                $stmt->bind_param($types, ...$params);
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
