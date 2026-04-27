<?php
require_once __DIR__ . '/../../config/driver_config.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$controlNo = $_POST['control_no'] ?? '';
$faculty = $_POST['faculty'] ?? '';
$dateStr = $_POST['date'] ?? ''; // e.g. 2026-03-25
$file = $_FILES['pdf'] ?? null;

if (!$controlNo || !$file) {
    echo json_encode(['success' => false, 'message' => 'Missing parameters: control_no or pdf file']);
    exit;
}

try {
    $drive = new GoogleDriveService();
    
    // Find or create the main folder for certificates
    $mainFolderId = $drive->findOrCreateFolder("Research Certification Files");
    
    // Format date for file name: March 25, 2026
    $dateObj = new DateTime($dateStr);
    $formattedDate = $dateObj->format('F d, Y');
    
    // Naming format: [control_no] [faculty] [date].pdf
    $fileName = "{$controlNo} {$faculty} {$formattedDate}.pdf";
    
    // Upload the file
    $uploadResult = $drive->uploadFile($file['tmp_name'], $fileName, $mainFolderId, 'application/pdf');
    
    if ($uploadResult['success']) {
        $fileUrl = $uploadResult['view_url'];
        
        // Make file public for viewing via system
        $drive->makeFilePublic($uploadResult['id']);
        
        // Update database with the Google Drive URL
        $stmt = $conn->prepare("UPDATE certification_log SET file_url = ? WHERE control_no = ?");
        $stmt->bind_param("ss", $fileUrl, $controlNo);
        $stmt->execute();
        
        echo json_encode([
            'success' => true, 
            'url' => $fileUrl,
            'fileName' => $fileName
        ]);
    } else {
        echo json_encode($uploadResult);
    }
} catch (Exception $e) {
    error_log("Certification Drive Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
