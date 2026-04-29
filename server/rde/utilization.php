<?php
require_once(__DIR__ . '/../db.php');
require_once(__DIR__ . '/../../config/driver_config.php');

header('Content-Type: application/json; charset=utf-8');

// Helper to clean names for Google Drive
function cleanNameForDrive($name) {
    if (empty($name)) return 'Untitled';
    $clean = preg_replace('/[^\w\s\-_.,()&]/', '', $name);
    $clean = preg_replace('/\s+/', ' ', $clean);
    $clean = trim($clean);
    $clean = rtrim($clean, '.,');
    if (strlen($clean) > 150) $clean = substr($clean, 0, 147) . '...';
    return $clean;
}

class UtilizationAPI {
    private $con;
    
    public function __construct($dbConnection) {
        $this->con = $dbConnection;
    }

    public function searchResearch() {
        $search = $_POST['search'] ?? '';
        $searchTerm = "%$search%";
        
        $sql = "SELECT r.id, r.title, r.author, e.event, r.endorsementid 
                FROM researchfile r 
                JOIN endorsement e ON r.endorsementid = e.id 
                WHERE e.status = 'accepted' AND r.title LIKE ? 
                LIMIT 10";
        
        $stmt = $this->con->prepare($sql);
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
    }

    /**
     * Find the entry folder for a research record so we can upload utilization files alongside the original research.
     */
    private function getResearchFolderId($research_id) {
        if (empty($research_id)) return null;

        // Look up the research's Drive entry folder from the endorsement record
        $sql = "SELECT e.drive_entry_folder_id 
                FROM researchfile r 
                JOIN endorsement e ON r.endorsementid = e.id 
                WHERE r.id = ? LIMIT 1";
        $stmt = $this->con->prepare($sql);
        if (!$stmt) return null;
        $stmt->bind_param('i', $research_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        return $row['drive_entry_folder_id'] ?? null;
    }

    public function addProgram() {
        $research_id = $_POST['research_id'] ?? null;
        $endorsement_id = $_POST['endorsement_id'] ?? null;
        $utilizationType = $_POST['utilizationType'] ?? '';
        $dateConducted = $_POST['dateConducted'] ?? '';
        $traineesCount = $_POST['traineesCount'] ?? 0;
        $programTitle = $_POST['programTitle'] ?? '';
        $productName = $_POST['productName'] ?? '';
        $patentNo = $_POST['patentNo'] ?? '';
        $benefitingIndustry = $_POST['benefitingIndustry'] ?? '';

        if (empty($utilizationType)) {
            echo json_encode(['success' => false, 'message' => 'Utilization type is required']);
            return;
        }
        
        // Context-aware validation
        if ($utilizationType === 'Research Utilization through Extension') {
            if (empty($programTitle) || empty($dateConducted) || empty($traineesCount)) {
                echo json_encode(['success' => false, 'message' => 'Program title, date conducted, and number of trainees are required for Extension Services']);
                return;
            }
        } else if (in_array($utilizationType, ['Patent', 'UM', 'Copyright'])) {
            if (empty($productName) || empty($patentNo) || empty($benefitingIndustry)) {
                echo json_encode(['success' => false, 'message' => 'Product name, patent number, and benefiting industry are required']);
                return;
            }
        }

        // Handle file uploads to Google Drive
        $supportDocsMetadata = [];
        $moaDocsMetadata = [];

        try {
            $drive = new GoogleDriveService();
            $targetFolderId = $this->getResearchFolderId($research_id);

            if (empty($targetFolderId)) {
                $cleanTitle = cleanNameForDrive($utilizationType);
                $utilizationRootId = $drive->findOrCreateFolder('Utilization Programs', $drive->getRootFolderId());
                $targetFolderId = $drive->findOrCreateFolder($cleanTitle, $utilizationRootId);
            }

            // Upload Support Docs
            if (isset($_FILES['supportDocs']) && !empty($_FILES['supportDocs']['name'][0])) {
                $fileCount = count($_FILES['supportDocs']['name']);
                for ($i = 0; $i < $fileCount; $i++) {
                    if ($_FILES['supportDocs']['error'][$i] !== UPLOAD_ERR_OK) continue;
                    $uploadResult = $drive->uploadFile($_FILES['supportDocs']['tmp_name'][$i], "Utilization_Support_{$_FILES['supportDocs']['name'][$i]}", $targetFolderId, 'application/pdf');
                    if ($uploadResult['success']) {
                        $drive->makeFilePublic($uploadResult['id']);
                        $supportDocsMetadata[] = [
                            'file_id' => $uploadResult['id'],
                            'file_name' => "Utilization_Support_{$_FILES['supportDocs']['name'][$i]}",
                            'view_url' => "https://drive.google.com/file/d/{$uploadResult['id']}/preview",
                            'size' => $_FILES['supportDocs']['size'][$i]
                        ];
                    }
                }
            }

            // Upload MOA Docs
            if (isset($_FILES['moaDocs']) && !empty($_FILES['moaDocs']['name'][0])) {
                $fileCount = count($_FILES['moaDocs']['name']);
                for ($i = 0; $i < $fileCount; $i++) {
                    if ($_FILES['moaDocs']['error'][$i] !== UPLOAD_ERR_OK) continue;
                    $uploadResult = $drive->uploadFile($_FILES['moaDocs']['tmp_name'][$i], "Utilization_MOA_{$_FILES['moaDocs']['name'][$i]}", $targetFolderId, 'application/pdf');
                    if ($uploadResult['success']) {
                        $drive->makeFilePublic($uploadResult['id']);
                        $moaDocsMetadata[] = [
                            'file_id' => $uploadResult['id'],
                            'file_name' => "Utilization_MOA_{$_FILES['moaDocs']['name'][$i]}",
                            'view_url' => "https://drive.google.com/file/d/{$uploadResult['id']}/preview",
                            'size' => $_FILES['moaDocs']['size'][$i]
                        ];
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Utilization Drive upload error: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'File upload failed: ' . $e->getMessage()]);
            return;
        }

        $supportLinks = $_POST['supportLinks'] ?? '';
        $driveUrls = array_map(function($f) { return $f['view_url']; }, $supportDocsMetadata);
        $allUrls = array_merge(array_filter(array_map('trim', explode(',', $supportLinks))), $driveUrls);
        $supportDocs = implode(', ', $allUrls);
        $supportDocsMetaJson = json_encode($supportDocsMetadata);
        $moaDocsMetaJson = json_encode($moaDocsMetadata);

        $query = "INSERT INTO utilization_programs (research_id, endorsement_id, utilizationType, programTitle, productName, patentNo, benefitingIndustry, dateConducted, traineesCount, supportDocs, supportDocsMetadata, moaDocs, moaDocsMetadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->con->prepare($query);
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'Preparation failed: ' . $this->con->error]);
            return;
        }
        
        $moaDocsStr = implode(', ', array_map(function($f) { return $f['view_url']; }, $moaDocsMetadata));
        $stmt->bind_param('iissssssissss', $research_id, $endorsement_id, $utilizationType, $programTitle, $productName, $patentNo, $benefitingIndustry, $dateConducted, $traineesCount, $supportDocs, $supportDocsMetaJson, $moaDocsStr, $moaDocsMetaJson);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Program added successfully', 'id' => $this->con->insert_id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Insert failed: ' . $stmt->error]);
        }
        $stmt->close();
    }

    public function getAllPrograms() {
        $searchTerm = $_POST['search'] ?? '';
        $query = "SELECT u.*, r.title as research_title, r.author as research_author 
                  FROM utilization_programs u
                  LEFT JOIN researchfile r ON u.research_id = r.id";
        
        if (!empty($searchTerm)) {
            $query .= " WHERE u.utilizationType LIKE ? 
                        OR u.supportDocs LIKE ? 
                        OR r.title LIKE ? 
                        OR r.author LIKE ?";
            $query .= " ORDER BY u.dateConducted DESC";
            $stmt = $this->con->prepare($query);
            if (!$stmt) {
                echo json_encode(['success' => false, 'message' => 'Query preparation failed: ' . $this->con->error]);
                return;
            }
            $searchPattern = "%$searchTerm%";
            $stmt->bind_param('ssss', $searchPattern, $searchPattern, $searchPattern, $searchPattern);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $query .= " ORDER BY u.dateConducted DESC";
            $result = $this->con->query($query);
        }

        $data = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        
        echo json_encode(['success' => true, 'data' => $data]);
    }

    public function deleteProgram() {
        $id = $_POST['id'] ?? '';
        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'ID is required']);
            return;
        }

        // Optionally trash files from Google Drive
        $metaQuery = "SELECT supportDocsMetadata FROM utilization_programs WHERE id = ?";
        $metaStmt = $this->con->prepare($metaQuery);
        $metaStmt->bind_param('i', $id);
        $metaStmt->execute();
        $metaResult = $metaStmt->get_result();
        $metaRow = $metaResult->fetch_assoc();

        if ($metaRow && !empty($metaRow['supportDocsMetadata'])) {
            $metadata = json_decode($metaRow['supportDocsMetadata'], true);
            if (is_array($metadata)) {
                try {
                    $drive = new GoogleDriveService();
                    foreach ($metadata as $fileMeta) {
                        if (!empty($fileMeta['file_id'])) {
                            $drive->trashFile($fileMeta['file_id']);
                        }
                    }
                } catch (Exception $e) {
                    error_log("Error trashing utilization files: " . $e->getMessage());
                }
            }
        }

        $query = "DELETE FROM utilization_programs WHERE id = ?";
        $stmt = $this->con->prepare($query);
        $stmt->bind_param('i', $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Program deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Delete failed: ' . $stmt->error]);
        }
        $stmt->close();
    }

    public function updateProgram() {
        $id = $_POST['id'] ?? null;
        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'ID is required']);
            return;
        }

        $research_id = $_POST['research_id'] ?? null;
        $endorsement_id = $_POST['endorsement_id'] ?? null;
        $utilizationType = $_POST['utilizationType'] ?? '';
        $dateConducted = $_POST['dateConducted'] ?? '';
        $traineesCount = $_POST['traineesCount'] ?? 0;
        $supportLinks = $_POST['supportLinks'] ?? '';
        $programTitle = $_POST['programTitle'] ?? '';
        $productName = $_POST['productName'] ?? '';
        $patentNo = $_POST['patentNo'] ?? '';
        $benefitingIndustry = $_POST['benefitingIndustry'] ?? '';

        if (empty($utilizationType)) {
            echo json_encode(['success' => false, 'message' => 'Utilization type is required']);
            return;
        }

        // Fetch existing record
        $existingQuery = "SELECT * FROM utilization_programs WHERE id = ?";
        $stmt = $this->con->prepare($existingQuery);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $existingRow = $stmt->get_result()->fetch_assoc();

        if (!$existingRow) {
            echo json_encode(['success' => false, 'message' => 'Record not found']);
            return;
        }

        $oldSupportMeta = json_decode($existingRow['supportDocsMetadata'] ?? '[]', true);
        $oldMoaMeta = json_decode($existingRow['moaDocsMetadata'] ?? '[]', true);
        
        $keptSupportMeta = isset($_POST['keptFilesMetadata']) ? json_decode($_POST['keptFilesMetadata'], true) : $oldSupportMeta;
        $keptMoaMeta = isset($_POST['keptMoaFilesMetadata']) ? json_decode($_POST['keptMoaFilesMetadata'], true) : $oldMoaMeta;

        try {
            $drive = new GoogleDriveService();
            
            // Trash removed Support Docs
            foreach ($oldSupportMeta as $oldFile) {
                $found = false;
                foreach ($keptSupportMeta as $kept) if ($kept['file_id'] === $oldFile['file_id']) { $found = true; break; }
                if (!$found) $drive->trashFile($oldFile['file_id']);
            }
            // Trash removed MOA Docs
            foreach ($oldMoaMeta as $oldFile) {
                $found = false;
                foreach ($keptMoaMeta as $kept) if ($kept['file_id'] === $oldFile['file_id']) { $found = true; break; }
                if (!$found) $drive->trashFile($oldFile['file_id']);
            }

            $targetFolderId = $this->getResearchFolderId($research_id);
            if (empty($targetFolderId)) {
                $utilizationRootId = $drive->findOrCreateFolder('Utilization Programs', $drive->getRootFolderId());
                $targetFolderId = $drive->findOrCreateFolder(cleanNameForDrive($utilizationType), $utilizationRootId);
            }

            // New Support Docs
            $newSupportMeta = [];
            if (isset($_FILES['supportDocs']) && !empty($_FILES['supportDocs']['name'][0])) {
                for ($i = 0; $i < count($_FILES['supportDocs']['name']); $i++) {
                    if ($_FILES['supportDocs']['error'][$i] !== UPLOAD_ERR_OK) continue;
                    $up = $drive->uploadFile($_FILES['supportDocs']['tmp_name'][$i], "Utilization_Support_{$_FILES['supportDocs']['name'][$i]}", $targetFolderId, 'application/pdf');
                    if ($up['success']) {
                        $drive->makeFilePublic($up['id']);
                        $newSupportMeta[] = ['file_id' => $up['id'], 'file_name' => "Utilization_Support_{$_FILES['supportDocs']['name'][$i]}", 'view_url' => "https://drive.google.com/file/d/{$up['id']}/preview", 'size' => $_FILES['supportDocs']['size'][$i]];
                    }
                }
            }

            // New MOA Docs
            $newMoaMeta = [];
            if (isset($_FILES['moaDocs']) && !empty($_FILES['moaDocs']['name'][0])) {
                for ($i = 0; $i < count($_FILES['moaDocs']['name']); $i++) {
                    if ($_FILES['moaDocs']['error'][$i] !== UPLOAD_ERR_OK) continue;
                    $up = $drive->uploadFile($_FILES['moaDocs']['tmp_name'][$i], "Utilization_MOA_{$_FILES['moaDocs']['name'][$i]}", $targetFolderId, 'application/pdf');
                    if ($up['success']) {
                        $drive->makeFilePublic($up['id']);
                        $newMoaMeta[] = ['file_id' => $up['id'], 'file_name' => "Utilization_MOA_{$_FILES['moaDocs']['name'][$i]}", 'view_url' => "https://drive.google.com/file/d/{$up['id']}/preview", 'size' => $_FILES['moaDocs']['size'][$i]];
                    }
                }
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Update failed: ' . $e->getMessage()]);
            return;
        }

        $finalSupportMeta = array_merge($keptSupportMeta, $newSupportMeta);
        $finalMoaMeta = array_merge($keptMoaMeta, $newMoaMeta);
        
        $driveUrls = array_map(function($f) { return $f['view_url']; }, $finalSupportMeta);
        $allUrls = array_merge(array_filter(array_map('trim', explode(',', $supportLinks))), $driveUrls);
        $supportDocs = implode(', ', $allUrls);
        $moaDocs = implode(', ', array_map(function($f) { return $f['view_url']; }, $finalMoaMeta));

        $query = "UPDATE utilization_programs SET 
                    research_id = ?, endorsement_id = ?, utilizationType = ?, 
                    programTitle = ?, productName = ?, patentNo = ?, benefitingIndustry = ?,
                    dateConducted = ?, traineesCount = ?, supportDocs = ?, 
                    supportDocsMetadata = ?, moaDocs = ?, moaDocsMetadata = ? 
                WHERE id = ?";
        
        $stmt = $this->con->prepare($query);
        $sm = json_encode($finalSupportMeta);
        $mm = json_encode($finalMoaMeta);
        $stmt->bind_param('iissssssissssi', $research_id, $endorsement_id, $utilizationType, $programTitle, $productName, $patentNo, $benefitingIndustry, $dateConducted, $traineesCount, $supportDocs, $sm, $moaDocs, $mm, $id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Program updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Update failed: ' . $stmt->error]);
        }
        $stmt->close();
    }
}

// Global $conn from db.php
$api = new UtilizationAPI($conn);
$action = $_POST['action'] ?? '';

switch ($action) {
    case 'search_research':
        $api->searchResearch();
        break;
    case 'add':
        $api->addProgram();
        break;
    case 'getAll':
        $api->getAllPrograms();
        break;
    case 'update':
        $api->updateProgram();
        break;
    case 'delete':
        $api->deleteProgram();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}