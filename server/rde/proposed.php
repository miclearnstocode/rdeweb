<?php

require_once(__DIR__ . '/../db.php');

// Set header for JSON response
header('Content-Type: application/json');

class ProposedResearchAPI {
    private $con;
    private $response;
    
    public function __construct($dbConnection) {
        $this->con = $dbConnection;
        $this->response = new stdClass();
        $this->response->status = false;
        $this->response->message = '';
        $this->response->data = [];
        $this->response->stats = [
            'total' => 0,
            'inHouseReview' => 0,
            'symposium' => 0,
            'thisYear' => 0
        ];
    }

    private function getEventYear($eventDate) {
        if (empty($eventDate)) return date('Y');
        return date('Y', strtotime($eventDate));
    }
    
    private function generatePaperTrailNo($index, $year) {
        $sequence = str_pad($index, 2, '0', STR_PAD_LEFT);
        $yearShort = substr($year, -2);
        return $sequence . '-' . $yearShort;
    }
    
    private function parseAuthorsAndFaculty($author, $coauthor) {
        $allResearchers = [];
        
        // Add main author if exists
        if (!empty($author) && $author !== 'NULL' && $author !== null) {
            $allResearchers[] = trim($author);
        }
        
        // Add co-authors if they exist
        if (!empty($coauthor) && $coauthor !== 'NULL' && $coauthor !== null) {
            // Check if coauthor is a JSON array
            if (is_string($coauthor) && (strpos($coauthor, '[') === 0 || strpos($coauthor, '{') === 0)) {
                $coauthors = json_decode($coauthor, true);
                if (is_array($coauthors)) {
                    foreach ($coauthors as $co) {
                        if (!empty($co) && $co !== 'NULL') {
                            $allResearchers[] = trim($co);
                        }
                    }
                }
            } else if (!empty($coauthor)) {
                // Handle comma-separated list
                $coauthorList = explode(',', $coauthor);
                foreach ($coauthorList as $co) {
                    $co = trim($co);
                    if (!empty($co) && $co !== 'NULL') {
                        $allResearchers[] = $co;
                    }
                }
            }
        }
        
        // Remove duplicates and re-index
        $allResearchers = array_values(array_unique($allResearchers));
        
        // Build faculty_researchers string without modifying the original array
        $facultyResearchers = '';
        if (count($allResearchers) > 0) {
            if (count($allResearchers) === 1) {
                $facultyResearchers = $allResearchers[0];
            } else {
                // Create a copy for manipulation
                $temp = $allResearchers;
                $last = array_pop($temp);
                $facultyResearchers = implode(', ', $temp) . ' & ' . $last;
            }
        }
        
        return [
            'authors_list' => implode(', ', $allResearchers),
            'faculty_researchers' => $facultyResearchers,
            'all_researchers' => $allResearchers
        ];
    }
    
    private function getEventType($eventName) {
        $eventName = strtolower($eventName);
        if (strpos($eventName, 'symposium') !== false) {
            return 'symposium';
        } elseif (strpos($eventName, 'in-house') !== false || strpos($eventName, 'inhouse') !== false) {
            return 'inhouse';
        }
        return 'other';
    }
    
    private function getRevisionStatusDisplay($revisionStatus) {
        $statusMap = [
            'revision_pending' => 'Pending Paper Revision',
            'revision_submitted' => 'Revision Paper Submitted',
            'revision_accepted' => 'Accepted Paper Revision',
            'revision_rejected' => 'Paper Revision Rejected'
        ];
        
        return $statusMap[$revisionStatus] ?? $revisionStatus;
    }
    
    private function getEvents() {
        $events = [];
        $query = "SELECT id, name, date FROM event_list ORDER BY date DESC";
        $result = $this->con->query($query);
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $events[$row['id']] = [
                    'name' => $row['name'],
                    'date' => $row['date'],
                    'year' => $this->getEventYear($row['date'])
                ];
            }
        }
        
        return $events;
    }
    
    private function getAcademicPositions($researchIds) {
        if (empty($researchIds)) return [];
        
        $positions = [];
        $ids = implode(',', array_map('intval', $researchIds));
        $query = "SELECT * FROM academic_position WHERE research_id IN ($ids)";
        $result = $this->con->query($query);
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $positions[$row['research_id']][] = [
                    'faculty_name' => $row['faculty_name'],
                    'academic_rank' => $row['academic_rank'],
                    'non_academic_rank' => $row['non_academic_rank'],
                    'job_order' => $row['job_order']
                ];
            }
        }
        
        return $positions;
    }
    
    public function fetchProposedResearch() {
        try {
            $events = $this->getEvents();
            
            $statsQuery = "SELECT 
                            rf.id,
                            rf.event as event_name,
                            rf.presented_inhouse,
                            rf.completion_status,
                            en.date as endorsement_date,
                            e.date as event_date,
                            YEAR(COALESCE(e.date, en.date)) as endorsement_year
                        FROM researchfile rf
                        LEFT JOIN endorsement en ON rf.endorsementid = en.id
                        LEFT JOIN event_list e ON rf.event_id = e.id
                        WHERE (en.status = 'accepted' OR e.status = 1 OR rf.status = 'accepted')";
            
            $statsResult = $this->con->query($statsQuery);
            
            $stats = [
                'total' => 0,
                'inHouseReview' => 0,
                'symposium' => 0,
                'thisYear' => 0,
                // Additional stats for the cards
                'inHousePresented' => 0,
                'inHousePending' => 0,
                'inHouseNotPresented' => 0,
                'symposiumCompleted' => 0,
                'symposiumPending' => 0
            ];
            
            if ($statsResult) {
                while ($row = $statsResult->fetch_assoc()) {
                    $eventName = $row['event_name'] ?? '';
                    $eventNameLower = strtolower($eventName);
                    $year = $row['endorsement_year'];
                    
                    if (!$year && !empty($row['endorsement_date'])) {
                        $year = (int)date('Y', strtotime($row['endorsement_date']));
                    }
                    if (!$year) {
                        $year = (int)date('Y');
                    }
                    
                    $isInHouse = strpos($eventNameLower, 'in-house') !== false || 
                                strpos($eventNameLower, 'inhouse') !== false || 
                                strpos($eventNameLower, 'in house') !== false;
                    
                    $isSymposium = strpos($eventNameLower, 'symposium') !== false;
                    
                    if ($isInHouse) {
                        $stats['inHouseReview']++;
                        $presentedStatus = $row['presented_inhouse'] ?? 'pending_confirmation';
                        
                        if ($presentedStatus === 'proposal_presented') {
                            $stats['inHousePresented']++;
                        } elseif ($presentedStatus === 'proposal_not_presented') {
                            $stats['inHouseNotPresented']++;
                        } else {
                            $stats['inHousePending']++;
                        }
                    } elseif ($isSymposium) {
                        $stats['symposium']++;
                        $completionStatus = $row['completion_status'] ?? 'pending_confirmation';
                        
                        if ($completionStatus === 'completed') {
                            $stats['symposiumCompleted']++;
                        } else {
                            $stats['symposiumPending']++;
                        }
                    }
                    
                    $stats['total']++;
                    if ($year == (int)date('Y')) {
                        $stats['thisYear']++;
                    }
                }
            }
            
            $query = "SELECT 
                        rf.id,
                        rf.senderid,
                        rf.event_id,
                        rf.author,
                        rf.coauthor,
                        rf.title,
                        rf.event as event_name,
                        rf.category,
                        rf.campus,
                        rf.center,
                        rf.file,
                        rf.paper_trail_no,
                        rf.revision_status,
                        rf.revised_drive_view_url,
                        rf.revised_drive_download_url,
                        rf.date_started,
                        rf.date_completed,
                        rf.presented_inhouse,
                        rf.confirm_by_inhouse,
                        rf.completion_status,
                        en.id as endorsement_id,
                        en.status as endorsement_status,
                        en.date as endorsement_date,
                        en.event as endorsement_event_name,
                        YEAR(COALESCE(e.date, en.date)) as endorsement_year
                    FROM researchfile rf
                    LEFT JOIN endorsement en ON rf.endorsementid = en.id
                    LEFT JOIN event_list e ON rf.event_id = e.id
                    WHERE (en.status = 'accepted' OR e.status = 1 OR rf.status = 'accepted')
                    AND (
                        -- In-House Review: must be presented
                        ((rf.event LIKE '%in-house review%' OR rf.event LIKE '%In-house review%' OR rf.event LIKE '%In House Review%')
                        AND rf.presented_inhouse = 'proposal_presented')
                        OR
                        -- Symposium: must be completed
                        ((rf.event LIKE '%symposium%' OR rf.event LIKE '%Symposium%')
                        AND rf.completion_status = 'completed')
                    )
                    ORDER BY COALESCE(e.date, en.date) DESC, rf.id ASC";
            
            $result = $this->con->query($query);
            
            if (!$result) {
                throw new Exception("Query failed: " . $this->con->error);
            }
            
            $researchData = [];
            
            $researchIds = [];
            $rows = [];
            
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
                $researchIds[] = $row['id'];
            }
            
            $academicPositions = $this->getAcademicPositions($researchIds);
            
            $papersByYear = [];
            
            foreach ($rows as $row) {
                $eventType = 'other';
                $eventNameForType = '';
                
                if (!empty($row['event_name'])) {
                    $eventNameForType = $row['event_name'];
                    $eventType = $this->getEventType($row['event_name']);
                }
                
                if ($eventType === 'other' && !empty($row['endorsement_event_name'])) {
                    $eventNameForType = $row['endorsement_event_name'];
                    $eventType = $this->getEventType($row['endorsement_event_name']);
                }
                
                if ($eventType === 'other' && $row['event_id'] && isset($events[$row['event_id']])) {
                    $eventNameForType = $events[$row['event_id']]['name'];
                    $eventType = $this->getEventType($eventNameForType);
                }
                
                $year = $row['endorsement_year'];
                
                if (!$year && !empty($row['endorsement_date'])) {
                    $year = (int)date('Y', strtotime($row['endorsement_date']));
                    error_log("Fallback year from endorsement_date for ID {$row['id']}: $year");
                }
                
                if (!$year) {
                    $year = (int)date('Y');
                    error_log("WARNING: No year found for ID {$row['id']}, using current year: $year");
                }
                
                $eventInfo = [
                    'name' => $eventNameForType ?: $row['event_name'] ?: $row['endorsement_event_name'] ?: '',
                    'date' => $row['endorsement_date'] ?? $row['date_started'] ?? '',
                    'year' => $year
                ];
                
                if ($row['event_id'] && isset($events[$row['event_id']])) {
                    $eventInfo['name'] = $eventInfo['name'] ?: $events[$row['event_id']]['name'];
                    $eventInfo['date'] = $eventInfo['date'] ?: $events[$row['event_id']]['date'];
                }
                
                if (!isset($papersByYear[$year])) {
                    $papersByYear[$year] = [];
                }
                
                $papersByYear[$year][] = [
                    'row' => $row,
                    'eventInfo' => $eventInfo,
                    'eventType' => $eventType,
                    'year' => $year
                ];
            }
            
            krsort($papersByYear);
            
            error_log("Years found: " . implode(', ', array_keys($papersByYear)));
            error_log("Papers per year: " . print_r(array_map('count', $papersByYear), true));
            
            foreach ($papersByYear as $year => $yearPapers) {
                usort($yearPapers, function($a, $b) {
                    $dateA = $a['row']['endorsement_date'] ?? $a['row']['date_started'] ?? '';
                    $dateB = $b['row']['endorsement_date'] ?? $b['row']['date_started'] ?? '';
                    
                    if ($dateA != $dateB) {
                        return strtotime($dateB) - strtotime($dateA);
                    }
                    return $b['row']['id'] - $a['row']['id'];
                });
                
                $paperIndex = 1;
                
                foreach ($yearPapers as $paperData) {
                    $row = $paperData['row'];
                    $eventType = $paperData['eventType'];
                    $eventInfo = $paperData['eventInfo'];
                    
                    $parsedAuthors = $this->parseAuthorsAndFaculty($row['author'], $row['coauthor']);
                    
                    $paperPositions = $academicPositions[$row['id']] ?? [];
                    
                    $alignedPositions = [];
                    foreach ($parsedAuthors['all_researchers'] as $researcher) {
                        $found = null;
                        foreach ($paperPositions as $pos) {
                            if ($pos['faculty_name'] === $researcher) {
                                $found = $pos;
                                break;
                            }
                        }
                        
                        $alignedPositions[] = [
                            'academic_rank' => $found['academic_rank'] ?? '—',
                            'non_academic_rank' => $found['non_academic_rank'] ?? '—',
                            'job_order' => $found['job_order'] ?? '—'
                        ];
                    }
                    
                    $dateStarted = '';
                    if (!empty($row['endorsement_date'])) {
                        $dateStarted = date('M j, Y', strtotime($row['endorsement_date']));
                    } elseif (!empty($row['date_started'])) {
                        $dateStarted = date('M j, Y', strtotime($row['date_started']));
                    }
                    
                    $revisionStatus = $row['revision_status'] ?? 'revision_pending';
                    $revisionStatusDisplay = $this->getRevisionStatusDisplay($revisionStatus);
                    
                    $confirmByEmail = '';
                    if (!empty($row['confirm_by_inhouse'])) {
                        $confirmByEmail = $this->getUserEmail($row['confirm_by_inhouse']);
                    }
                    
                    $researchEntry = [
                        'id' => $row['id'],
                        'endorsement_id' => $row['endorsement_id'],
                        'year' => $year,
                        'paperTrailNo' => !empty($row['paper_trail_no']) ? $row['paper_trail_no'] : $this->generatePaperTrailNo($paperIndex, $year),
                        'campus' => $row['campus'] ?? '',
                        'category' => $row['category'] ?? '',
                        'title' => $row['title'] ?? '',
                        'authors' => $parsedAuthors['authors_list'],
                        'facultyResearcher' => $parsedAuthors['faculty_researchers'],
                        'all_researchers' => $parsedAuthors['all_researchers'],
                        'academic_positions' => $alignedPositions,
                        'inhouseLocal' => '',
                        'inhouseUniversity' => '',
                        'symposiumLocal' => '',
                        'symposiumUniversity' => '',
                        'dateStarted' => $dateStarted,
                        'eventType' => $eventType,
                        'eventName' => $eventInfo['name'] ?? '',
                        'endorsement_status' => $row['endorsement_status'],
                        'revision_status' => $revisionStatus,
                        'revision_status_display' => $revisionStatusDisplay,
                        'revised_drive_view_url' => $row['revised_drive_view_url'] ?? '',
                        'revised_drive_download_url' => $row['revised_drive_download_url'] ?? '',
                        'has_positions' => !empty($paperPositions),
                        'endorsement_date' => $row['endorsement_date'] ?? '',
                        'presented_inhouse' => $row['presented_inhouse'] ?? 'pending_confirmation',
                        'confirm_by_inhouse' => $row['confirm_by_inhouse'] ?? '',
                        'confirm_by_email' => $confirmByEmail,
                        'completion_status' => $row['completion_status'] ?? ''
                    ];
                    
                    if ($eventType === 'inhouse') {
                        $researchEntry['inhouseUniversity'] = $revisionStatusDisplay;
                        $researchEntry['symposiumUniversity'] = '';
                    } elseif ($eventType === 'symposium') {
                        $researchEntry['symposiumUniversity'] = $revisionStatusDisplay;
                        $researchEntry['inhouseUniversity'] = '';
                    } else {
                        $eventNameLower = strtolower($eventInfo['name'] ?? '');
                        if (strpos($eventNameLower, 'in-house') !== false || strpos($eventNameLower, 'inhouse') !== false) {
                            $researchEntry['inhouseUniversity'] = $revisionStatusDisplay;
                            $researchEntry['symposiumUniversity'] = '';
                        } elseif (strpos($eventNameLower, 'symposium') !== false) {
                            $researchEntry['symposiumUniversity'] = $revisionStatusDisplay;
                            $researchEntry['inhouseUniversity'] = '';
                        } else {
                            $researchEntry['inhouseUniversity'] = $revisionStatusDisplay;
                            $researchEntry['symposiumUniversity'] = $revisionStatusDisplay;
                        }
                    }
                    
                    $researchData[] = $researchEntry;
                    $paperIndex++;
                }
            }
            
            $filteredTotal = count($researchData);
            $stats['total'] = $filteredTotal;  // Override total with filtered count
            
            $this->response->status = true;
            $this->response->message = 'Proposed research fetched successfully';
            $this->response->data = $researchData;      // Filtered data for table
            $this->response->stats = $stats;            // Stats with total = filtered count
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
            error_log("Error in fetchProposedResearch: " . $e->getMessage());
        }
        
        echo json_encode($this->response);
    }

    public function fetchInhouseProposals() {
        try {
            $statusFilter = $_GET['status'] ?? $_POST['status'] ?? 'pending_confirmation';
            
            // Build query to fetch in-house review proposals with JOIN to get staff info
            $query = "SELECT 
                        rf.id,
                        rf.title,
                        rf.author,
                        rf.coauthor,
                        rf.paper_trail_no,
                        rf.event as event_name,
                        rf.category,
                        rf.campus,
                        rf.center,
                        rf.presented_inhouse,
                        rf.confirm_by_inhouse,
                        rf.date_started,
                        en.id as endorsement_id,
                        en.date as endorsement_date,
                        en.status as endorsement_status,
                        rd.email as confirm_by_email,
                        rd.username as confirm_by_username
                    FROM researchfile rf
                    LEFT JOIN endorsement en ON rf.endorsementid = en.id
                    LEFT JOIN rdestaff rd ON rf.confirm_by_inhouse = rd.id
                    WHERE rf.event LIKE '%in-house%' OR rf.event LIKE '%In-house%' OR rf.event LIKE '%In House%'
                    AND en.status = 'accepted'";
            
            // Add status filter
            if ($statusFilter === 'pending_confirmation') {
                $query .= " AND (rf.presented_inhouse IS NULL OR rf.presented_inhouse = '' OR rf.presented_inhouse = 'pending_confirmation')";
            } elseif ($statusFilter === 'presented') {
                $query .= " AND rf.presented_inhouse = 'proposal_presented'";
            } elseif ($statusFilter === 'not_presented') {
                $query .= " AND rf.presented_inhouse = 'proposal_not_presented'";
            }
            
            $query .= " ORDER BY rf.date_started DESC, rf.id ASC";
            
            $result = $this->con->query($query);
            
            if (!$result) {
                throw new Exception("Query failed: " . $this->con->error);
            }
            
            $proposals = [];
            $stats = [
                'pending' => 0,
                'presented' => 0,
                'not_presented' => 0,
                'total' => 0
            ];
            
            while ($row = $result->fetch_assoc()) {
                // Parse authors
                $parsedAuthors = $this->parseAuthorsAndFaculty($row['author'], $row['coauthor']);
                
                // Determine presenter (first author or main author)
                $presenter = $row['author'] ?? $parsedAuthors['all_researchers'][0] ?? 'N/A';
                
                // Get status display
                $statusDisplay = $row['presented_inhouse'] ?? 'pending_confirmation';
                $statusLabel = $this->getPresentationStatusLabel($statusDisplay);
                
                // Get confirm by info - prefer email, fallback to username
                $confirmByDisplay = '';
                if (!empty($row['confirm_by_email'])) {
                    $confirmByDisplay = $row['confirm_by_email'];
                } elseif (!empty($row['confirm_by_username'])) {
                    $confirmByDisplay = $row['confirm_by_username'];
                } elseif (!empty($row['confirm_by_inhouse'])) {
                    // If we have an ID but no email/username, try to fetch it
                    $confirmByDisplay = $this->getUserDisplayName($row['confirm_by_inhouse']);
                }
                
                $proposals[] = [
                    'id' => $row['id'],
                    'paper_trail_no' => $row['paper_trail_no'] ?? 'N/A',
                    'title' => $row['title'] ?? 'Untitled',
                    'authors' => $parsedAuthors['authors_list'],
                    'all_researchers' => $parsedAuthors['all_researchers'],
                    'presenter' => $presenter,
                    'status' => $statusDisplay,
                    'status_label' => $statusLabel,
                    'campus' => $row['campus'] ?? '',
                    'category' => $row['category'] ?? '',
                    'event_name' => $row['event_name'] ?? '',
                    'endorsement_id' => $row['endorsement_id'],
                    'endorsement_date' => $row['endorsement_date'],
                    'confirm_by' => $row['confirm_by_inhouse'] ?? '',
                    'confirm_by_display' => $confirmByDisplay,
                    'date_started' => $row['date_started'] ?? ''
                ];
                
                // Update stats
                $stats['total']++;
                if ($statusDisplay === 'pending_confirmation' || empty($statusDisplay)) {
                    $stats['pending']++;
                } elseif ($statusDisplay === 'proposal_presented') {
                    $stats['presented']++;
                } elseif ($statusDisplay === 'proposal_not_presented') {
                    $stats['not_presented']++;
                }
            }
            
            $this->response->status = true;
            $this->response->message = 'In-house proposals fetched successfully';
            $this->response->data = $proposals;
            $this->response->stats = $stats;
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
            error_log("Error in fetchInhouseProposals: " . $e->getMessage());
        }
        
        echo json_encode($this->response);
    }

    private function getUserDisplayName($userId) {
        if (empty($userId)) {
            return '';
        }
        
        try {
            // First try to get email
            $query = "SELECT email, username FROM rdestaff WHERE id = ?";
            $stmt = $this->con->prepare($query);
            $stmt->bind_param("s", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($row = $result->fetch_assoc()) {
                if (!empty($row['email'])) {
                    return $row['email'];
                }
                if (!empty($row['username'])) {
                    return $row['username'];
                }
            }
            
            // If not found in rdestaff, try account_detail
            $query2 = "SELECT email, fullName FROM account_detail WHERE id = ?";
            $stmt2 = $this->con->prepare($query2);
            $stmt2->bind_param("s", $userId);
            $stmt2->execute();
            $result2 = $stmt2->get_result();
            
            if ($row2 = $result2->fetch_assoc()) {
                if (!empty($row2['email'])) {
                    return $row2['email'];
                }
                if (!empty($row2['fullName'])) {
                    return $row2['fullName'];
                }
            }
            
            // If no email/username found, return the ID itself
            return $userId;
            
        } catch (Exception $e) {
            error_log("Error fetching user display name: " . $e->getMessage());
            return $userId;
        }
    }

    private function getUserEmail($userId) {
        if (empty($userId)) {
            return '';
        }
        
        try {
            $query = "SELECT email FROM rdestaff WHERE id = ?";
            $stmt = $this->con->prepare($query);
            $stmt->bind_param("s", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($row = $result->fetch_assoc()) {
                return $row['email'] ?? '';
            }
            
            // If not found in rdestaff, try account_detail
            $query2 = "SELECT email FROM account_detail WHERE id = ?";
            $stmt2 = $this->con->prepare($query2);
            $stmt2->bind_param("s", $userId);
            $stmt2->execute();
            $result2 = $stmt2->get_result();
            
            if ($row2 = $result2->fetch_assoc()) {
                return $row2['email'] ?? '';
            }
            
            return '';
        } catch (Exception $e) {
            error_log("Error fetching user email: " . $e->getMessage());
            return '';
        }
    }

    private function getPresentationStatusLabel($status) {
        $labels = [
            'proposal_presented' => 'Presented',
            'proposal_not_presented' => 'Not Presented',
            'pending_confirmation' => 'Pending Confirmation'
        ];
        return $labels[$status] ?? 'Pending Confirmation';
    }

    public function updatePresentationStatus() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                $input = $_POST;
            }
            
            $researchId = $input['research_id'] ?? 0;
            $status = $input['status'] ?? ''; // 'proposal_presented' or 'proposal_not_presented'
            $confirmBy = $input['confirm_by'] ?? '';
            
            if (!$researchId) {
                $this->response->message = 'Research ID is required';
                echo json_encode($this->response);
                return;
            }
            
            if (!in_array($status, ['proposal_presented', 'proposal_not_presented'])) {
                $this->response->message = 'Invalid status. Must be proposal_presented or proposal_not_presented';
                echo json_encode($this->response);
                return;
            }
            
            // Get user info if not provided
            if (empty($confirmBy)) {
                if (session_status() === PHP_SESSION_NONE) {
                    session_start();
                }
                // Store the rdestaff.id in confirm_by_inhouse
                $userId = $_SESSION['userId'] ?? $_SESSION['user_id'] ?? $_SESSION['username'] ?? '';
                $confirmBy = $userId;
            }
            
            // Update the researchfile - store the user ID (rdestaff.id)
            $updateQuery = "UPDATE researchfile SET 
                            presented_inhouse = ?, 
                            confirm_by_inhouse = ?
                        WHERE id = ?";
            
            $stmt = $this->con->prepare($updateQuery);
            $stmt->bind_param("ssi", $status, $confirmBy, $researchId);
            
            if ($stmt->execute()) {
                // Get the user's display name for the response
                $displayName = $this->getUserDisplayName($confirmBy);
                
                $this->response->status = true;
                $this->response->message = 'Presentation status updated successfully';
                $this->response->data = [
                    'research_id' => $researchId,
                    'presented_inhouse' => $status,
                    'confirm_by' => $confirmBy,
                    'confirm_by_display' => $displayName,
                    'status_label' => $this->getPresentationStatusLabel($status)
                ];
            } else {
                throw new Exception("Failed to update status: " . $stmt->error);
            }
            
            $stmt->close();
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
            error_log("Update presentation status error: " . $e->getMessage());
        }
        
        echo json_encode($this->response);
    }
    
    // Get single research paper details with academic positions
    public function getResearchPaper($id) {
        try {
            $query = "SELECT 
                        rf.id,
                        rf.title,
                        rf.author,
                        rf.coauthor,
                        rf.category,
                        rf.campus,
                        rf.center,
                        rf.event_id,
                        rf.revision_status,
                        rf.revised_drive_view_url,
                        rf.revised_drive_download_url,
                        rf.presented_inhouse,
                        rf.confirm_by_inhouse,
                        en.id as endorsement_id,
                        en.status as endorsement_status
                    FROM researchfile rf
                    LEFT JOIN endorsement en ON rf.endorsementid = en.id
                    LEFT JOIN event_list e ON rf.event_id = e.id
                    WHERE rf.id = ? AND (en.status = 'accepted' OR e.status = 1)
                    LIMIT 1";
            
            $stmt = $this->con->prepare($query);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($row = $result->fetch_assoc()) {
                // Get event details
                $eventQuery = "SELECT name, date FROM event_list WHERE id = ?";
                $eventStmt = $this->con->prepare($eventQuery);
                $eventStmt->bind_param("i", $row['event_id']);
                $eventStmt->execute();
                $eventResult = $eventStmt->get_result();
                $event = $eventResult->fetch_assoc();
                
                $eventYear = $event ? $this->getEventYear($event['date']) : date('Y');
                $eventType = $event ? $this->getEventType($event['name']) : 'other';
                
                // Parse authors and faculty researchers
                $parsedAuthors = $this->parseAuthorsAndFaculty($row['author'], $row['coauthor']);
                
                // Get academic positions for this research paper
                $positionsQuery = "SELECT * FROM academic_position WHERE research_id = ?";
                $positionsStmt = $this->con->prepare($positionsQuery);
                $positionsStmt->bind_param("i", $id);
                $positionsStmt->execute();
                $positionsResult = $positionsStmt->get_result();
                
                $academicPositions = [];
                while ($position = $positionsResult->fetch_assoc()) {
                    $academicPositions[] = [
                        'faculty_name' => $position['faculty_name'],
                        'academic_rank' => $position['academic_rank'],
                        'non_academic_rank' => $position['non_academic_rank'],
                        'job_order' => $position['job_order']
                    ];
                }
                
                $paperDetails = [
                    'id' => $row['id'],
                    'endorsement_id' => $row['endorsement_id'],
                    'year' => $eventYear,
                    'event_name' => $event ? $event['name'] : '',
                    'event_type' => $eventType,
                    'title' => $row['title'],
                    'author' => $row['author'],
                    'coauthor' => json_decode($row['coauthor'], true),
                    'authors' => $parsedAuthors['authors_list'],
                    'facultyResearcher' => $parsedAuthors['faculty_researchers'],
                    'all_researchers' => $parsedAuthors['all_researchers'],
                    'category' => $row['category'],
                    'campus' => $row['campus'],
                    'center' => $row['center'],
                    'endorsement_status' => $row['endorsement_status'],
                    'revision_status' => $row['revision_status'] ?? 'revision_pending',
                    'revised_drive_view_url' => $row['revised_drive_view_url'] ?? '',
                    'revised_drive_download_url' => $row['revised_drive_download_url'] ?? '',
                    'academic_positions' => $academicPositions,
                    'presented_inhouse' => $row['presented_inhouse'] ?? 'pending_confirmation',
                    'confirm_by_inhouse' => $row['confirm_by_inhouse'] ?? ''
                ];
                
                $this->response->status = true;
                unset($this->response->stats);
                $this->response->data = $paperDetails;
            } else {
                $this->response->message = 'Research paper not found';
            }
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
        }
        
        echo json_encode($this->response);
    }
    
    // Get comments for a research paper
    public function getResearchComments() {
        try {
            $researchId = $_POST['research_id'] ?? $_GET['research_id'] ?? 0;
            $eventType = $_POST['event_type'] ?? $_GET['event_type'] ?? '';
            
            if (!$researchId) {
                $this->response->message = 'Research ID is required';
                echo json_encode($this->response);
                return;
            }
            
            $query = "SELECT 
                        comments.title,
                        comments.intro,
                        comments.abstract,
                        comments.objective,
                        comments.methodology,
                        comments.results,
                        comments.recommendation,
                        comments.literature,
                        comments.other,
                        comments.isCommented,
                        evaluator.fullname
                    FROM comments
                    LEFT JOIN evaluator ON evaluator.id = comments.evalid
                    WHERE comments.resid = ?";
            
            $params = [$researchId];
            $types = "i";
            
            if (!empty($eventType)) {
                $query .= " AND (comments.eventType = ? OR comments.eventType LIKE ?)";
                $params[] = $eventType;
                $params[] = "%$eventType%";
                $types .= "ss";
            }
            
            $stmt = $this->con->prepare($query);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $comments = [];
            while ($row = $result->fetch_assoc()) {
                $comments[] = [
                    'title' => $row['title'] ?? '',
                    'intro' => $row['intro'] ?? '',
                    'abstract' => $row['abstract'] ?? '',
                    'objective' => $row['objective'] ?? '',
                    'methodology' => $row['methodology'] ?? '',
                    'results' => $row['results'] ?? '',
                    'recommendation' => $row['recommendation'] ?? '',
                    'literature' => $row['literature'] ?? '',
                    'other' => $row['other'] ?? '',
                    'isCommented' => $row['isCommented'] ?? 0,
                    'evaluator_name' => $row['fullname'] ?? ''
                ];
            }
            
            $this->response->status = true;
            unset($this->response->stats);
            $this->response->data = $comments;
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
        }
        
        echo json_encode($this->response);
    }
    
    // Update revision status
    public function updateRevisionStatus() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                $input = $_POST;
            }
            
            $researchId = $input['research_id'] ?? 0;
            $status = $input['status'] ?? '';
            
            if (!$researchId) {
                $this->response->message = 'Research ID is required';
                echo json_encode($this->response);
                return;
            }
            
            if (!in_array($status, ['revision_accepted', 'revision_rejected'])) {
                $this->response->message = 'Invalid status. Must be revision_accepted or revision_rejected';
                echo json_encode($this->response);
                return;
            }
            
            $fundedUpdate = "";
            if ($status === 'revision_accepted') {
                $fundedUpdate = ", is_internally_funded = 1";
            }
            
            $updateQuery = "UPDATE researchfile SET revision_status = ?, last_revision_date = NOW() $fundedUpdate WHERE id = ?";
            $stmt = $this->con->prepare($updateQuery);
            $stmt->bind_param("si", $status, $researchId);
            
            if ($stmt->execute()) {
                $this->response->status = true;
                $this->response->message = 'Revision status updated successfully';
                $this->response->data = [
                    'research_id' => $researchId,
                    'revision_status' => $status,
                    'is_internally_funded' => $status === 'revision_accepted' ? 1 : 0,
                    'display_status' => $status === 'revision_accepted' ? 'Revision Accepted' : 'Revision Rejected'
                ];
            } else {
                throw new Exception("Failed to update revision status: " . $stmt->error);
            }
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
            error_log("Update revision status error: " . $e->getMessage());
        }
        
        echo json_encode($this->response);
    }
    
    public function rejectRevisedDocument() {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                $input = $_POST;
            }
            
            $researchId = $input['doc_id'] ?? 0;
            $reason = $input['reason'] ?? '';
            $type = $input['type'] ?? '';
            $url = $input['url'] ?? '';
            $rejectedById = $_SESSION['userId'] ?? $_SESSION['user_id'] ?? '';
            
            if (!$researchId) {
                throw new Exception("Research ID or Endorsement ID is required");
            }

            $infoQuery = "SELECT rf.id as research_id, rf.endorsementid, rf.event, rf.title FROM researchfile rf WHERE rf.id = ? OR rf.endorsementid = ?";
            $infoStmt = $this->con->prepare($infoQuery);
            $infoStmt->bind_param("ii", $researchId, $researchId);
            $infoStmt->execute();
            $infoResult = $infoStmt->get_result();
            $infoRow = $infoResult->fetch_assoc();
            
            if (!$infoRow) {
                throw new Exception("Research record not found for ID: " . $researchId);
            }
            
            $researchId = $infoRow['research_id'];
            $endorsementId = $infoRow['endorsementid'];
            if (empty($type)) {
                $type = 'Rejected Revised Submission: ' . ($infoRow['event'] ?? 'Unknown Event');
            }
            $infoStmt->close();
            
            $rejectedByName = 'Unknown';
            if (!empty($rejectedById)) {
                $userQuery = "SELECT username, email FROM rdestaff WHERE id = ?";
                $userStmt = $this->con->prepare($userQuery);
                $userStmt->bind_param("s", $rejectedById);
                $userStmt->execute();
                $userResult = $userStmt->get_result();
                if ($userRow = $userResult->fetch_assoc()) {
                    $rejectedByName = $userRow['email'] ?: $userRow['username'];
                } else {
                    $userQuery2 = "SELECT fullName, email FROM account_detail WHERE id = ?";
                    $userStmt2 = $this->con->prepare($userQuery2);
                    $userStmt2->bind_param("s", $rejectedById);
                    $userStmt2->execute();
                    $userResult2 = $userStmt2->get_result();
                    if ($userRow2 = $userResult2->fetch_assoc()) {
                        $rejectedByName = $userRow2['email'] ?: $userRow2['fullName'];
                    }
                    $userStmt2->close();
                }
                $userStmt->close();
            }
            
            $this->con->begin_transaction();

            $updateQuery = "UPDATE researchfile SET revision_status = 'revision_rejected', last_revision_date = NOW() WHERE id = ?";
            $updateStmt = $this->con->prepare($updateQuery);
            $updateStmt->bind_param("i", $researchId);
            if (!$updateStmt->execute()) {
                throw new Exception("Failed to update research status: " . $updateStmt->error);
            }
            $updateStmt->close();

            $rejectedId = round(microtime(true) * 1000) . '';
            $insertQuery = "INSERT INTO rejecteddocs (id, docid, url, type, rejectedby, reason, date) VALUES (?, ?, ?, ?, ?, ?, NOW())";
            $insertStmt = $this->con->prepare($insertQuery);
            $insertStmt->bind_param("sissss", $rejectedId, $endorsementId, $url, $type, $rejectedByName, $reason);
            
            if (!$insertStmt->execute()) {
                throw new Exception("Failed to record rejection: " . $insertStmt->error);
            }
            $insertStmt->close();

            $this->con->commit();

            $this->response->status = true;
            $this->response->message = 'Document rejected successfully';
            $this->response->data = [
                'research_id' => $researchId,
                'rejected_by' => $rejectedByName,
                'reason' => $reason,
                'type' => $type
            ];
            
        } catch (Exception $e) {
            @$this->con->rollback();
            $this->response->status = false;
            $this->response->message = 'Error: ' . $e->getMessage();
            error_log("Reject document error: " . $e->getMessage());
        }
        
        echo json_encode($this->response);
    }
    
    public function saveAcademicPositions() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                $input = $_POST;
            }
            
            $researchId = $input['research_id'] ?? 0;
            $facultyData = $input['faculty_data'] ?? [];
            $duplicateGroupId = $input['duplicate_group_id'] ?? $researchId;
            
            if (is_string($facultyData)) {
                $facultyData = json_decode($facultyData, true);
            }
            
            if (!is_array($facultyData)) {
                $facultyData = [];
            }
            
            error_log("Research ID: " . $researchId);
            error_log("Duplicate Group ID: " . $duplicateGroupId);
            error_log("Faculty Data received: " . print_r($facultyData, true));
            
            if (!$researchId) {
                $this->response->message = 'Research ID is required';
                echo json_encode($this->response);
                return;
            }
            
            $filteredFacultyData = array_filter($facultyData, function($faculty) {
                return !empty($faculty['faculty_name']);
            });
            
            error_log("Filtered Faculty Data: " . print_r($filteredFacultyData, true));
            
            $this->con->begin_transaction();
            
            $deleteQuery = "DELETE FROM academic_position WHERE research_id = ?";
            $deleteStmt = $this->con->prepare($deleteQuery);
            $deleteStmt->bind_param("i", $researchId);
            $deleteStmt->execute();
            $deletedCount = $deleteStmt->affected_rows;
            error_log("Deleted $deletedCount existing records for ID: $researchId");
            $deleteStmt->close();
            
            $insertedCount = 0;
            
            if (!empty($filteredFacultyData)) {
                $insertQuery = "INSERT INTO academic_position (research_id, faculty_name, academic_rank, non_academic_rank, job_order) VALUES (?, ?, ?, ?, ?)";
                $insertStmt = $this->con->prepare($insertQuery);
                
                foreach ($filteredFacultyData as $faculty) {
                    $facultyName = $faculty['faculty_name'] ?? '';
                    $academicRank = $faculty['academic_rank'] ?? '';
                    $nonAcademicRank = $faculty['non_academic_rank'] ?? '';
                    $jobOrder = $faculty['job_order'] ?? '';
                    
                    error_log("Inserting for ID $researchId: $facultyName, $academicRank, $nonAcademicRank, $jobOrder");
                    
                    $insertStmt->bind_param("issss", $researchId, $facultyName, $academicRank, $nonAcademicRank, $jobOrder);
                    if ($insertStmt->execute()) {
                        $insertedCount++;
                    } else {
                        error_log("Insert error for ID $researchId: " . $insertStmt->error);
                    }
                }
                
                $insertStmt->close();
            }
            
            $this->con->commit();
            
            $this->response->status = true;
            $this->response->message = 'Academic positions saved successfully';
            $this->response->debug = [
                'research_id' => $researchId,
                'duplicate_group_id' => $duplicateGroupId,
                'deleted_count' => $deletedCount,
                'inserted_count' => $insertedCount,
                'received_count' => count($facultyData),
                'filtered_count' => count($filteredFacultyData)
            ];
            
        } catch (Exception $e) {
            $this->con->rollback();
            $this->response->message = 'Error: ' . $e->getMessage();
            error_log("Save positions error: " . $e->getMessage());
        }
        
        echo json_encode($this->response);
    }
    
    // Get statistics only
    public function getStatistics() {
        try {
            $stats = [
                'total' => 0,
                'inHouseReview' => 0,
                'symposium' => 0,
                'thisYear' => 0
            ];
            
            $events = $this->getEvents();
            
            $query = "SELECT 
                        rf.id,
                        rf.event_id,
                        rf.event as event_name,
                        en.date as endorsement_date,
                        e.date as event_date
                    FROM researchfile rf
                    LEFT JOIN endorsement en ON rf.endorsementid = en.id
                    LEFT JOIN event_list e ON rf.event_id = e.id
                    WHERE en.status = 'accepted' OR e.status = 1";
            
            $result = $this->con->query($query);
            
            if ($result) {
                while ($row = $result->fetch_assoc()) {
                    $eventType = 'other';
                    
                    if ($row['event_id'] && isset($events[$row['event_id']])) {
                        $eventType = $this->getEventType($events[$row['event_id']]['name']);
                    } elseif (!empty($row['event_name'])) {
                        $eventType = $this->getEventType($row['event_name']);
                    }
                    
                    $stats['total']++;
                    
                    if ($eventType === 'inhouse') {
                        $stats['inHouseReview']++;
                    } elseif ($eventType === 'symposium') {
                        $stats['symposium']++;
                    }
                    
                    $year = null;
                    if (!empty($row['event_date'])) {
                        $year = date('Y', strtotime($row['event_date']));
                    } elseif (!empty($row['endorsement_date'])) {
                        $year = date('Y', strtotime($row['endorsement_date']));
                    }
                    
                    if ($year == date('Y')) {
                        $stats['thisYear']++;
                    }
                }
            }
            
            $this->response->status = true;
            $this->response->message = 'Statistics fetched successfully';
            $this->response->stats = $stats;
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
        }
        
        echo json_encode($this->response);
    }

    public function importProposedResearch() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['data']) || empty($input['data'])) {
                $this->response->message = 'No data to import';
                echo json_encode($this->response);
                return;
            }
            
            $importData = $input['data'];
            $eventId = isset($input['event_id']) ? intval($input['event_id']) : 0;
            $importedCount = 0;
            $skippedCount = 0;
            $errors = [];
            
            // Get event details if event_id is provided - use deadline for year
            $eventName = '';
            $eventYear = date('Y');
            if ($eventId > 0) {
                $eventQuery = "SELECT name, YEAR(dead_line) as year FROM event_list WHERE id = ?";
                $eventStmt = $this->con->prepare($eventQuery);
                $eventStmt->bind_param("i", $eventId);
                $eventStmt->execute();
                $eventResult = $eventStmt->get_result();
                if ($eventRow = $eventResult->fetch_assoc()) {
                    $eventName = $eventRow['name'];
                    $eventYear = $eventRow['year'] ?? date('Y');
                }
                $eventStmt->close();
            }
            
            // Start transaction
            $this->con->begin_transaction();
            
            try {
                foreach ($importData as $row) {
                    // Skip invalid rows
                    if (isset($row['valid']) && $row['valid'] === false) {
                        $skippedCount++;
                        continue;
                    }
                    
                    $title = $row['title'] ?? '';
                    $author = $row['author'] ?? '';
                    $coauthor = $row['coauthor'] ?? '';
                    $category = $row['category'] ?? '';
                    $campus = $row['campus'] ?? '';
                    $code = $row['code'] ?? '';
                    
                    // Validate required fields
                    if (empty($title) || empty($author) || empty($campus)) {
                        $skippedCount++;
                        $errors[] = "Row {$row['row']}: Missing required fields (Title, Author, or Campus)";
                        continue;
                    }
                    
                    // Generate paper trail number
                    $paperTrailNo = '';
                    try {
                        // If Code column exists, use it to generate paper trail number
                        if (!empty($code)) {
                            $paperTrailNo = $this->generatePaperTrailNumberFromCode($code, $campus);
                        } else {
                            // Fallback: generate from scratch using campus code and event year from deadline
                            $paperTrailNo = $this->generatePaperTrailNumber($this->con, $eventId, $campus, $title, $author);
                        }
                    } catch (Exception $e) {
                        error_log("Paper trail generation error: " . $e->getMessage());
                        // If generation fails, use a temporary number with event year from deadline
                        $paperTrailNo = $eventYear . '-X-001';
                    }
                    
                    // Insert into researchfile with event_id and event_name
                    if ($eventId > 0 && !empty($eventName)) {
                        $insertQuery = "INSERT INTO researchfile (
                            title, author, coauthor, category, campus,
                            event_id, event, paper_trail_no, date_started, 
                            status, revision_status, completion_status
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 
                            'accepted', 'revision_pending', 'pending_confirmation')";
                        
                        $stmt = $this->con->prepare($insertQuery);
                        $stmt->bind_param("sssssiss", $title, $author, $coauthor, $category, $campus, $eventId, $eventName, $paperTrailNo);
                    } else {
                        // Fallback: insert without event
                        $insertQuery = "INSERT INTO researchfile (
                            title, author, coauthor, category, campus,
                            paper_trail_no, date_started, 
                            status, revision_status, completion_status
                        ) VALUES (?, ?, ?, ?, ?, ?, NULL, 
                            'accepted', 'revision_pending', 'pending_confirmation')";
                        
                        $stmt = $this->con->prepare($insertQuery);
                        $stmt->bind_param("ssssss", $title, $author, $coauthor, $category, $campus, $paperTrailNo);
                    }
                    
                    if ($stmt->execute()) {
                        $importedCount++;
                    } else {
                        $skippedCount++;
                        $errors[] = "Row {$row['row']}: " . $stmt->error;
                    }
                    
                    $stmt->close();
                }
                
                // Commit transaction
                $this->con->commit();
                
                $this->response->status = true;
                $this->response->message = "Import completed: $importedCount imported, $skippedCount skipped";
                $this->response->imported_count = $importedCount;
                $this->response->skipped_count = $skippedCount;
                $this->response->errors = $errors;
                
            } catch (Exception $e) {
                $this->con->rollback();
                throw $e;
            }
            
        } catch (Exception $e) {
            $this->response->message = 'Error during import: ' . $e->getMessage();
            error_log("Import error: " . $e->getMessage());
        }
        
        echo json_encode($this->response);
    }

    public function getEventsList() {
        try {
            $query = "SELECT id, name, date, dead_line, status FROM event_list ORDER BY date DESC";
            $result = $this->con->query($query);
            
            if (!$result) {
                throw new Exception("Failed to fetch events: " . $this->con->error);
            }
            
            $events = [];
            while ($row = $result->fetch_assoc()) {
                $events[] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'date' => date('Y-m-d', strtotime($row['date'])),
                    'deadline' => !empty($row['dead_line']) ? date('Y-m-d', strtotime($row['dead_line'])) : null,
                    'status' => $row['status']
                ];
            }
            
            $this->response->status = true;
            $this->response->message = 'Events fetched successfully';
            $this->response->data = $events;
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
            error_log("Error fetching events: " . $e->getMessage());
        }
        
        echo json_encode($this->response);
    }

    function generatePaperTrailNumber($con, $eventId, $campus, $title, $author)
    {
        // Campus codes mapping (based on your CASE statement)
        $campusCodes = [
            'Burias' => 'A',
            'Dayao' => 'B',
            'Dumarao' => 'C',
            'Mambusao' => 'D',
            'Pilar' => 'E',
            'Pontevedra' => 'F',
            'Roxas City Main' => 'G',
            'Central Office' => 'G',
            'Sigma' => 'H',
            'Tapaz' => 'I'
        ];

        // Normalize campus name - trim and handle variations
        $normalizedCampus = trim($campus);
        
        // Get campus code - if not found, default to 'X' for unknown
        $campusCode = $campusCodes[$normalizedCampus] ?? 'X';

        // FIRST: Check if this research already has a paper trail number from a previous submission
        // Match by title and author (case-insensitive, trimmed)
        $checkExistingQuery = "SELECT paper_trail_no, campus, event_id 
                            FROM researchfile 
                            WHERE TRIM(LOWER(title)) = TRIM(LOWER(?)) 
                            AND TRIM(LOWER(author)) = TRIM(LOWER(?))
                            AND paper_trail_no IS NOT NULL 
                            AND paper_trail_no != ''
                            LIMIT 1";

        $checkStmt = $con->prepare($checkExistingQuery);
        if (!$checkStmt) {
            throw new Exception("Failed to prepare existing check query: " . $con->error);
        }

        $checkStmt->bind_param("ss", $title, $author);
        $checkStmt->execute();
        $existingResult = $checkStmt->get_result();
        $existingPaper = $existingResult->fetch_assoc();

        // If existing paper trail number found, return it (maintain consistency)
        if ($existingPaper && !empty($existingPaper['paper_trail_no'])) {
            return $existingPaper['paper_trail_no'];
        }

        // SECOND: If no existing paper trail number, check for duplicate submissions
        // (same title and author but no paper trail number yet - should use same campus logic)
        $checkDuplicateQuery = "SELECT id, campus, event_id 
                            FROM researchfile 
                            WHERE TRIM(LOWER(title)) = TRIM(LOWER(?)) 
                            AND TRIM(LOWER(author)) = TRIM(LOWER(?))
                            LIMIT 1";

        $dupStmt = $con->prepare($checkDuplicateQuery);
        if (!$dupStmt) {
            throw new Exception("Failed to prepare duplicate check query: " . $con->error);
        }

        $dupStmt->bind_param("ss", $title, $author);
        $dupStmt->execute();
        $dupResult = $dupStmt->get_result();
        $duplicate = $dupResult->fetch_assoc();

        // If duplicate found but no paper trail number, we need to generate one
        // Use the original submission's campus (not the current one) for consistency
        if ($duplicate) {
            // Use the campus from the original submission
            $originalCampus = $duplicate['campus'];
            $normalizedOriginalCampus = trim($originalCampus);
            $campusCode = $campusCodes[$normalizedOriginalCampus] ?? 'X';

            // Get the original submission's event year from deadline
            $originalEventId = $duplicate['event_id'];
            $yearQuery = "SELECT YEAR(dead_line) as year FROM event_list WHERE id = ? LIMIT 1";
            $yearStmt = $con->prepare($yearQuery);
            if ($yearStmt) {
                $yearStmt->bind_param("i", $originalEventId);
                $yearStmt->execute();
                $yearResult = $yearStmt->get_result();
                $yearRow = $yearResult->fetch_assoc();
                $eventYear = $yearRow['year'] ?? date('Y');
                $yearStmt->close();
            } else {
                $eventYear = date('Y');
            }
        } else {
            // THIRD: No existing paper trail number and no duplicate - generate new one
            // Get event year from event_list using deadline for the current submission
            $yearQuery = "SELECT YEAR(dead_line) as year FROM event_list WHERE id = ? LIMIT 1";
            $yearStmt = $con->prepare($yearQuery);
            if (!$yearStmt) {
                throw new Exception("Failed to prepare year query: " . $con->error);
            }

            $yearStmt->bind_param("i", $eventId);
            $yearStmt->execute();
            $yearResult = $yearStmt->get_result();
            $yearRow = $yearResult->fetch_assoc();

            if (!$yearRow || !$yearRow['year']) {
                throw new Exception("Could not determine event year for event ID: $eventId");
            }

            $eventYear = $yearRow['year'];
            $yearStmt->close();
        }

        // Get the next sequence number for this year and campus code
        $pattern = $eventYear . '-' . $campusCode . '-%';

        $seqQuery = "SELECT MAX(CAST(SUBSTRING_INDEX(paper_trail_no, '-', -1) AS UNSIGNED)) as max_seq 
                    FROM researchfile 
                    WHERE paper_trail_no LIKE ?";

        $seqStmt = $con->prepare($seqQuery);
        if (!$seqStmt) {
            throw new Exception("Failed to prepare sequence query: " . $con->error);
        }

        $seqStmt->bind_param("s", $pattern);
        $seqStmt->execute();
        $seqResult = $seqStmt->get_result();
        $seqRow = $seqResult->fetch_assoc();

        $nextSeq = ($seqRow['max_seq'] ?? 0) + 1;

        // Format with leading zeros (3 digits)
        $formattedSeq = str_pad($nextSeq, 3, '0', STR_PAD_LEFT);

        // Generate the paper trail number
        $paperTrailNo = $eventYear . '-' . $campusCode . '-' . $formattedSeq;

        // Clean up statements
        $checkStmt->close();
        if (isset($dupStmt)) {
            $dupStmt->close();
        }
        if (isset($seqStmt)) {
            $seqStmt->close();
        }

        return $paperTrailNo;
    }

    private function generatePaperTrailNumberFromCode($code, $campus) {
        // Campus codes mapping
        $campusCodes = [
            'Burias' => 'A',
            'Dayao' => 'B',
            'Dumarao' => 'C',
            'Mambusao' => 'D',
            'Pilar' => 'E',
            'Pontevedra' => 'F',
            'Roxas City Main' => 'G',
            'Central Office' => 'G',
            'Sigma' => 'H',
            'Tapaz' => 'I'
        ];
        
        // Normalize campus name
        $normalizedCampus = trim($campus);
        $campusCode = $campusCodes[$normalizedCampus] ?? 'X';
        
        // Parse the code (e.g., "2020-83" -> year = "2020", seq = "83")
        $parts = explode('-', $code);
        
        // Always expect valid format, no else fallback
        $year = $parts[0];
        $seq = $parts[1] ?? '001';
        
        // Format sequence with leading zeros (3 digits)
        $formattedSeq = str_pad($seq, 3, '0', STR_PAD_LEFT);
        
        // Generate paper trail number
        return $year . '-' . $campusCode . '-' . $formattedSeq;
    }

}

// Initialize database connection
$con = new mysqli($host, $username, $pass, $dbName);

if ($con->connect_error) {
    $response = new stdClass();
    $response->status = false;
    $response->message = 'Database connection failed: ' . $con->connect_error;
    echo json_encode($response);
    exit;
}

$con->set_charset("utf8mb4");

$api = new ProposedResearchAPI($con);

$action = $_POST['action'] ?? $_GET['action'] ?? '';

if (empty($action)) {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input && isset($input['action'])) {
        $action = $input['action'];
    }
}

switch ($action) {
    case 'fetch':
        $api->fetchProposedResearch();
        break;
        
    case 'fetch_inhouse':
        $api->fetchInhouseProposals();
        break;
        
    case 'update_presentation':
        $api->updatePresentationStatus();
        break;

    case 'get_events':
        $api->getEventsList();
        break;

    case 'import_proposed':
        $api->importProposedResearch();
        break;
        
    case 'get':
        $id = $_POST['id'] ?? $_GET['id'] ?? 0;
        if ($id) {
            $api->getResearchPaper($id);
        } else {
            $response = new stdClass();
            $response->status = false;
            $response->message = 'Research paper ID is required';
            echo json_encode($response);
        }
        break;
        
    case 'get_comments':
        $api->getResearchComments();
        break;
        
    case 'update_revision_status':
        $api->updateRevisionStatus();
        break;
        
    case 'reject_revised':
        $api->rejectRevisedDocument();
        break;
        
    case 'save_positions':
        $api->saveAcademicPositions();
        break;
        
    case 'stats':
        $api->getStatistics();
        break;
        
    default:
        if (empty($action)) {
            $api->fetchProposedResearch();
        } else {
            $response = new stdClass();
            $response->status = false;
            $response->message = 'Invalid action: ' . $action;
            echo json_encode($response);
        }
}