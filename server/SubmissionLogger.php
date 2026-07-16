<?php
/**
 * Centralized Submission Logger
 * Logs all submission attempts, successes, failures, and duplicates
 */
class SubmissionLogger {
    private $con;
    private $logId = null;
    private $startTime = null;
    private $requestData = [];
    private $fileData = [];
    private $responseData = [];

    public function __construct($dbConnection) {
        $this->con = $dbConnection;
        $this->startTime = microtime(true);
    }

    /**
     * Start a new log entry
     */
    public function startLog($userId, $submissionType, $presentationType = null, $eventId = null) {
        $this->requestData = [
            'post' => $this->sanitizePostData($_POST),
            'get' => $_GET,
            'server' => [
                'request_uri' => $_SERVER['REQUEST_URI'] ?? '',
                'http_method' => $_SERVER['REQUEST_METHOD'] ?? 'POST'
            ]
        ];

        // Capture file information (without the actual content)
        $this->fileData = $this->captureFileInfo();

        $query = "INSERT INTO submission_logs (
            user_id, submission_type, presentation_type, event_id,
            request_method, request_data, file_data,
            ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $this->con->prepare($query);
        $requestMethod = 'POST';
        $ipAddress = $this->getClientIP();
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        $requestDataJson = json_encode($this->requestData);
        $fileDataJson = json_encode($this->fileData);

        $stmt->bind_param(
            "issssssss",
            $userId,
            $submissionType,
            $presentationType,
            $eventId,
            $requestMethod,
            $requestDataJson,
            $fileDataJson,
            $ipAddress,
            $userAgent
        );

        if ($stmt->execute()) {
            $this->logId = $this->con->insert_id;
        }

        $stmt->close();
        return $this->logId;
    }

    /**
     * Log a successful submission
     */
    public function logSuccess($researchId = null, $endorsementId = null, $localInhouseId = null, $additionalData = []) {
        if (!$this->logId) return false;

        $responseTime = $this->calculateResponseTime();
        $this->responseData = array_merge(['success' => true], $additionalData);

        $query = "UPDATE submission_logs SET 
            status = 'success',
            research_id = ?,
            endorsement_id = ?,
            local_inhouse_id = ?,
            response_data = ?,
            response_time_ms = ?,
            updated_at = NOW()
        WHERE id = ?";

        $stmt = $this->con->prepare($query);
        $responseDataJson = json_encode($this->responseData);
        $stmt->bind_param(
            "iiisii",
            $researchId,
            $endorsementId,
            $localInhouseId,
            $responseDataJson,
            $responseTime,
            $this->logId
        );

        $result = $stmt->execute();
        $stmt->close();

        // Update statistics
        if ($result) {
            $this->updateStatistics('success');
        }

        return $result;
    }

    /**
     * Log a failed submission
     */
    public function logFailure($errorMessage, $errorCode = null, $researchId = null, $additionalData = []) {
        if (!$this->logId) return false;

        $responseTime = $this->calculateResponseTime();
        $this->responseData = array_merge(['success' => false, 'error' => $errorMessage], $additionalData);

        $query = "UPDATE submission_logs SET 
            status = 'failed',
            error_message = ?,
            error_code = ?,
            research_id = ?,
            response_data = ?,
            response_time_ms = ?,
            updated_at = NOW()
        WHERE id = ?";

        $stmt = $this->con->prepare($query);
        $responseDataJson = json_encode($this->responseData);
        $stmt->bind_param(
            "ssisii",
            $errorMessage,
            $errorCode,
            $researchId,
            $responseDataJson,
            $responseTime,
            $this->logId
        );

        $result = $stmt->execute();
        $stmt->close();

        // Update statistics and error aggregation
        if ($result) {
            $this->updateStatistics('failed');
            $this->aggregateError($errorCode, $errorMessage);
        }

        return $result;
    }

    /**
     * Log a duplicate detection
     */
    public function logDuplicate($duplicateType, $duplicateRecordId, $duplicateUserId, $isBlocked = true, $message = '') {
        if (!$this->logId) return false;

        $status = $isBlocked ? 'duplicate_blocked' : 'duplicate_warning';

        $query = "UPDATE submission_logs SET 
            status = ?,
            duplicate_detected = 1,
            duplicate_type = ?,
            duplicate_record_id = ?,
            duplicate_user_id = ?,
            error_message = ?,
            updated_at = NOW()
        WHERE id = ?";

        $stmt = $this->con->prepare($query);
        $stmt->bind_param(
            "ssiiss",
            $status,
            $duplicateType,
            $duplicateRecordId,
            $duplicateUserId,
            $message,
            $this->logId
        );

        $result = $stmt->execute();
        $stmt->close();

        if ($result) {
            $this->updateStatistics($status);
        }

        return $result;
    }

    /**
     * Log file upload result
     */
    public function logFileUpload($fileType, $fileName, $fileSize, $uploadStatus, $driveFileId = null, $driveFolderId = null, $driveViewUrl = null, $errorMessage = null) {
        if (!$this->logId) return false;

        $query = "INSERT INTO file_upload_logs (
            submission_log_id, file_type, file_name, file_size,
            upload_status, drive_file_id, drive_folder_id, drive_view_url,
            error_message, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $this->con->prepare($query);
        $stmt->bind_param(
            "ississsss",
            $this->logId,
            $fileType,
            $fileName,
            $fileSize,
            $uploadStatus,
            $driveFileId,
            $driveFolderId,
            $driveViewUrl,
            $errorMessage
        );

        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    /**
     * Update submission statistics
     */
    private function updateStatistics($status) {
        $statDate = date('Y-m-d');
        $userId = $_SESSION['userId'] ?? 0;
        $submissionType = $this->getSubmissionType();

        // Get the current log to know the submission type
        $logQuery = "SELECT submission_type FROM submission_logs WHERE id = ?";
        $logStmt = $this->con->prepare($logQuery);
        $logStmt->bind_param("i", $this->logId);
        $logStmt->execute();
        $logResult = $logStmt->get_result();
        $logRow = $logResult->fetch_assoc();
        $submissionType = $logRow['submission_type'] ?? $submissionType;
        $logStmt->close();

        $responseTime = $this->calculateResponseTime();

        $query = "INSERT INTO submission_statistics (
            stat_date, user_id, submission_type,
            total_attempts, successful, failed, duplicates_blocked, duplicates_warning,
            avg_response_time_ms, updated_at
        ) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            total_attempts = total_attempts + 1,
            successful = successful + ?,
            failed = failed + ?,
            duplicates_blocked = duplicates_blocked + ?,
            duplicates_warning = duplicates_warning + ?,
            avg_response_time_ms = (avg_response_time_ms + ?) / 2,
            updated_at = NOW()";

        $successCount = ($status === 'success') ? 1 : 0;
        $failedCount = ($status === 'failed') ? 1 : 0;
        $blockedCount = ($status === 'duplicate_blocked') ? 1 : 0;
        $warningCount = ($status === 'duplicate_warning') ? 1 : 0;

        $stmt = $this->con->prepare($query);
        $stmt->bind_param(
            "sissiiiiiiiii",
            $statDate,
            $userId,
            $submissionType,
            $successCount,
            $failedCount,
            $blockedCount,
            $warningCount,
            $responseTime,
            $successCount,
            $failedCount,
            $blockedCount,
            $warningCount,
            $responseTime
        );

        $stmt->execute();
        $stmt->close();
    }

    /**
     * Aggregate errors for monitoring
     */
    private function aggregateError($errorCode, $errorMessage) {
        if (empty($errorCode) && empty($errorMessage)) return;

        $submissionType = $this->getSubmissionType();

        $query = "INSERT INTO error_aggregations (
            error_code, error_message, submission_type,
            occurrence_count, last_occurrence, updated_at
        ) VALUES (?, ?, ?, 1, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
            occurrence_count = occurrence_count + 1,
            last_occurrence = NOW(),
            updated_at = NOW()";

        $stmt = $this->con->prepare($query);
        $errorCode = $errorCode ?? 'UNKNOWN_ERROR';
        $stmt->bind_param(
            "sss",
            $errorCode,
            $errorMessage,
            $submissionType
        );

        $stmt->execute();
        $stmt->close();
    }

    /**
     * Get submission type from current log
     */
    private function getSubmissionType() {
        if ($this->logId) {
            $query = "SELECT submission_type FROM submission_logs WHERE id = ?";
            $stmt = $this->con->prepare($query);
            $stmt->bind_param("i", $this->logId);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $stmt->close();
            return $row['submission_type'] ?? 'unknown';
        }
        return 'unknown';
    }

    /**
     * Sanitize POST data for logging (remove sensitive info)
     */
    private function sanitizePostData($postData) {
        $sanitized = [];
        $sensitiveKeys = ['password', 'confirm_password', 'token', 'secret', 'api_key'];
        
        foreach ($postData as $key => $value) {
            if (in_array(strtolower($key), $sensitiveKeys)) {
                $sanitized[$key] = '***REDACTED***';
            } else {
                $sanitized[$key] = $value;
            }
        }
        return $sanitized;
    }

    /**
     * Capture file information without the actual binary data
     */
    private function captureFileInfo() {
        $fileInfo = [];
        foreach ($_FILES as $key => $file) {
            if (isset($file['error']) && $file['error'] === UPLOAD_ERR_OK) {
                $fileInfo[$key] = [
                    'name' => $file['name'],
                    'type' => $file['type'],
                    'size' => $file['size'],
                    'tmp_name' => basename($file['tmp_name'])
                ];
            } elseif (isset($file['error'])) {
                $fileInfo[$key] = [
                    'name' => $file['name'] ?? 'unknown',
                    'error_code' => $file['error'],
                    'error_message' => $this->getUploadErrorMessage($file['error'])
                ];
            }
        }
        return $fileInfo;
    }

    /**
     * Get upload error message
     */
    private function getUploadErrorMessage($errorCode) {
        $messages = [
            UPLOAD_ERR_OK => 'No error',
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize directive',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE directive',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
        ];
        return $messages[$errorCode] ?? 'Unknown upload error';
    }

    /**
     * Calculate response time in milliseconds
     */
    private function calculateResponseTime() {
        $endTime = microtime(true);
        return round(($endTime - $this->startTime) * 1000);
    }

    /**
     * Get client IP address
     */
    private function getClientIP() {
        $ip = '0.0.0.0';
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
    }

    /**
     * Get log ID
     */
    public function getLogId() {
        return $this->logId;
    }
}