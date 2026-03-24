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
        $programTitle = $_POST['programTitle'] ?? '';
        $dateConducted = $_POST['dateConducted'] ?? '';
        $traineesCount = $_POST['traineesCount'] ?? '';

        if (empty($programTitle) || empty($dateConducted) || empty($traineesCount)) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            return;
        }

        // Handle file uploads to Google Drive
        $supportDocsUrls = [];
        $supportDocsMetadata = [];

        if (isset($_FILES['supportDocs']) && !empty($_FILES['supportDocs']['name'][0])) {
            try {
                $drive = new GoogleDriveService();

                // Try to find the research's existing entry folder, or create a utilization folder
                $targetFolderId = $this->getResearchFolderId($research_id);

                if (empty($targetFolderId)) {
                    // No linked research or no folder found — create a utilization-specific folder
                    $cleanTitle = cleanNameForDrive($programTitle);
                    $utilizationRootId = $drive->findOrCreateFolder('Utilization Programs', $drive->getRootFolderId());
                    $targetFolderId = $drive->findOrCreateFolder($cleanTitle, $utilizationRootId);
                }

                $fileCount = count($_FILES['supportDocs']['name']);
                for ($i = 0; $i < $fileCount; $i++) {
                    if ($_FILES['supportDocs']['error'][$i] !== UPLOAD_ERR_OK) continue;

                    $tmpPath = $_FILES['supportDocs']['tmp_name'][$i];
                    $originalName = $_FILES['supportDocs']['name'][$i];
                    $fileSize = $_FILES['supportDocs']['size'][$i];

                    // Rename: utilization_ProgramTitle_N.pdf
                    $cleanProgTitle = cleanNameForDrive($programTitle);
                    $suffix = $fileCount > 1 ? '_' . ($i + 1) : '';
                    $driveFileName = "Utilization_{$cleanProgTitle}{$suffix}.pdf";

                    $uploadResult = $drive->uploadFile($tmpPath, $driveFileName, $targetFolderId, 'application/pdf');

                    if ($uploadResult['success']) {
                        $fileId = $uploadResult['id'];
                        $drive->makeFilePublic($fileId);
                        $viewUrl = "https://drive.google.com/file/d/{$fileId}/preview";
                        $downloadUrl = "https://drive.google.com/uc?id={$fileId}&export=download";

                        $supportDocsUrls[] = $viewUrl;
                        $supportDocsMetadata[] = [
                            'file_id' => $fileId,
                            'file_name' => $driveFileName,
                            'original_name' => $originalName,
                            'view_url' => $viewUrl,
                            'download_url' => $downloadUrl,
                            'size' => $fileSize,
                            'folder_id' => $targetFolderId
                        ];
                    } else {
                        error_log("Utilization file upload failed for {$originalName}: " . ($uploadResult['error'] ?? 'Unknown'));
                    }
                }
            } catch (Exception $e) {
                error_log("Utilization Drive upload error: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'File upload failed: ' . $e->getMessage()]);
                return;
            }
        }
        // Merge user-provided HTTP links with any Drive upload URLs
        $supportLinks = $_POST['supportLinks'] ?? '';
        $allUrls = [];

        // First, add user-submitted HTTP links
        if (!empty($supportLinks)) {
            $linkParts = array_map('trim', explode(',', $supportLinks));
            $allUrls = array_merge($allUrls, array_filter($linkParts));
        }
        // Then, add Drive upload URLs
        $allUrls = array_merge($allUrls, $supportDocsUrls);

        $supportDocs = implode(', ', $allUrls);
        $supportDocsMetaJson = !empty($supportDocsMetadata) ? json_encode($supportDocsMetadata) : null;

        $query = "INSERT INTO utilization_programs (research_id, endorsement_id, programTitle, dateConducted, traineesCount, supportDocs, supportDocsMetadata) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->con->prepare($query);
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'Statement preparation failed: ' . $this->con->error]);
            return;
        }
        
        $stmt->bind_param('iississ', $research_id, $endorsement_id, $programTitle, $dateConducted, $traineesCount, $supportDocs, $supportDocsMetaJson);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Program added successfully', 'id' => $this->con->insert_id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to add program: ' . $stmt->error]);
        }
        $stmt->close();
    }

    public function getAllPrograms() {
        $searchTerm = $_POST['search'] ?? '';
        $query = "SELECT u.*, r.title as research_title, r.author as research_author 
                  FROM utilization_programs u
                  LEFT JOIN researchfile r ON u.research_id = r.id";
        
        if (!empty($searchTerm)) {
            $query .= " WHERE u.programTitle LIKE ? 
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
    case 'delete':
        $api->deleteProgram();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}