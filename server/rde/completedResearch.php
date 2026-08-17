<?php
require_once(__DIR__ . '/../db.php');

// Set header for JSON response
header('Content-Type: application/json');

class CompletedResearchAPI {
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
        
        if (!empty($author) && $author !== 'NULL' && $author !== null) {
            $allResearchers[] = trim($author);
        }
        
        if (!empty($coauthor) && $coauthor !== 'NULL' && $coauthor !== null) {
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
                $coauthorList = explode(',', $coauthor);
                foreach ($coauthorList as $co) {
                    $co = trim($co);
                    if (!empty($co) && $co !== 'NULL') {
                        $allResearchers[] = $co;
                    }
                }
            }
        }
        
        $allResearchers = array_values(array_unique($allResearchers));
        
        $facultyResearchers = '';
        if (count($allResearchers) > 0) {
            if (count($allResearchers) === 1) {
                $facultyResearchers = $allResearchers[0];
            } else {
                $temp = $allResearchers;
                $last = array_pop($temp);
                $facultyResearchers = implode(', ', $temp) . ' & ' . $last;
            }
        }
        
        return [
            'authors_list' => implode('|', $allResearchers), 
            'faculty_researchers' => implode('|', $allResearchers),
            'all_researchers' => $allResearchers 
        ];
    }
    
    private function getEvents() {
        $events = [];
        $query = "SELECT id, name, date FROM event_list 
                  WHERE name LIKE '%Symposium%' 
                  AND name NOT LIKE '%In-House%' 
                  AND name NOT LIKE '%In House%'
                  ORDER BY date DESC";
        $result = $this->con->query($query);
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $events[$row['id']] = [
                    'id' => $row['id'],
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
    
    public function fetchCompletedResearch() {
        try {
            $events = $this->getEvents();
            $symposiumIds = array_keys($events);
            
            $filters = [
                'event_id' => $_POST['event_id'] ?? null,
                'center' => $_POST['center'] ?? null,
                'campus' => $_POST['campus'] ?? null,
                'category' => $_POST['category'] ?? null,
                'search' => $_POST['search'] ?? null
            ];

            $whereClauses = [
                "e.status = 'accepted'",
                "rf.completion_status = 'completed'" 
            ];
            
            if (!empty($symposiumIds)) {
                $idsList = implode(',', array_map('intval', $symposiumIds));
                $whereClauses[] = "(rf.event_id IN ($idsList) OR LOWER(rf.event) LIKE '%symposium%')";
            } else {
                $whereClauses[] = "LOWER(rf.event) LIKE '%symposium%'";
            }
            $params = [];
            $types = "";

            if ($filters['event_id'] && $filters['event_id'] !== 'All') {
                $whereClauses[] = "rf.event_id = ?";
                $params[] = $filters['event_id'];
                $types .= "i";
            }

            if ($filters['center'] && $filters['center'] !== 'All') {
                $whereClauses[] = "rf.center = ?";
                $params[] = $filters['center'];
                $types .= "s";
            }

            if ($filters['campus'] && $filters['campus'] !== 'All') {
                $whereClauses[] = "rf.campus = ?";
                $params[] = $filters['campus'];
                $types .= "s";
            }

            if ($filters['category'] && $filters['category'] !== 'All') {
                $whereClauses[] = "rf.category = ?";
                $params[] = $filters['category'];
                $types .= "s";
            }

            if ($filters['search']) {
                $searchTerm = "%" . $filters['search'] . "%";
                $whereClauses[] = "(rf.title LIKE ? OR rf.author LIKE ? OR rf.coauthor LIKE ? OR rf.paper_trail_no LIKE ?)";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $types .= "ssss";
            }

            $whereSql = implode(" AND ", $whereClauses);
            $query = "SELECT 
                        rf.id,
                        rf.senderid,
                        rf.event_id,
                        rf.author,
                        rf.coauthor,
                        rf.title,
                        rf.category,
                        rf.campus,
                        rf.center,
                        rf.date_started,
                        rf.date_completed,
                        rf.paper_trail_no,
                        rf.completion_status,
                        e.id as endorsement_id,
                        e.status as endorsement_status,
                        e.date as endorsement_date,
                        YEAR(e.date) as endorsement_year,
                        
                        -- Use MAX() to get one value per group
                        MAX(pr.date_completed) as dateCompletedVal,
                        MAX(pr.forum_title) as forumTitleVal,
                        MAX(pr.venue) as venueVal,
                        MAX(pr.forum_type) as forumTypeVal,
                        MAX(pr.presentation_date) as presentationDateVal,
                        
                        MAX(pub.published_title) as publishedTitleVal,
                        MAX(pub.publication_date) as publicationDateVal,
                        MAX(pub.journal_title) as journalTitleVal,
                        MAX(pub.volume) as volumeVal,
                        MAX(pub.issue) as issueVal,
                        MAX(pub.issn) as issnVal,
                        MAX(pub.index_type) as indexTypeVal,
                        
                        MAX(util.utilizationType) as utilizationTypeVal,
                        MAX(util.dateConducted) as dateConductedVal,
                        MAX(util.traineesCount) as traineesCountVal,
                        MAX(util.supportDocsMetadata) as supportDocs2Val,

                        -- For patent/utility/design, also use MAX
                        MAX(COALESCE(p.technologyName, um.technologyNameUM, idesign.idTitle)) as productNameVal,
                        MAX(COALESCE(p.registrationNumber, um.registrationNumber, idesign.registrationNumber)) as registrationNumberVal,
                        MAX(COALESCE(p.applicationNumber, um.applicationNumberUM, idesign.applicationNumber)) as applicationNumberVal,
                        MAX(COALESCE(p.benefitingIndustry, um.benefitingIndustryUM)) as benefitingIndustryVal,
                        MAX(p.patentFormURL) as patentFormURL,
                        MAX(p.abstractURL) as patentAbstractURL,
                        MAX(p.claimsURL) as patentClaimsURL,
                        MAX(p.technicalDescriptionURL) as patentTechnicalDescriptionURL,
                        MAX(p.technicalDrawingURL) as patentTechnicalDrawingURL,
                        MAX(p.photoTechnologyURL) as patentPhotoTechnologyURL,
                        MAX(um.patentFormURLUM) as patentFormURLUM,
                        MAX(um.abstractURLUM) as patentAbstractURLUM,
                        MAX(um.claimsURLUM) as patentClaimsURLUM,
                        MAX(um.technicalDescriptionURLUM) as patentTechnicalDescriptionURLUM,
                        MAX(um.technicalDrawingURLUM) as patentTechnicalDrawingURLUM,
                        MAX(um.photoTechnologyURLUM) as patentPhotoTechnologyURLUM,
                        MAX(idesign.applicationFormURL) as idFormURL,
                        MAX(idesign.abstractURL) as idAbstractURL,
                        MAX(idesign.claimsURL) as idClaimsURL,
                        MAX(idesign.technicalDescriptionURL) as idTechnicalDescriptionURL,
                        MAX(idesign.technicalDrawingURL) as idTechnicalDrawingURL,
                        MAX(idesign.photoTechnologyURL) as idPhotoTechnologyURL
                        
                    FROM endorsement e
                    INNER JOIN researchfile rf ON e.id = rf.endorsementid
                    LEFT JOIN presentation_research pr ON rf.id = pr.research_id
                    LEFT JOIN publications pub ON rf.id = pub.research_id
                    LEFT JOIN utilization_programs util ON rf.id = util.research_id
                    LEFT JOIN patent p ON rf.id = p.research_id
                    LEFT JOIN utility_model um ON rf.id = um.research_id
                    LEFT JOIN industrial_design idesign ON rf.id = idesign.research_id
                    
                    WHERE $whereSql
                    
                    GROUP BY rf.id
                    ORDER BY
                        CAST(SUBSTRING_INDEX(rf.paper_trail_no, '-', 1) AS UNSIGNED) ASC,
                        CAST(SUBSTRING_INDEX(rf.paper_trail_no, '-', -1) AS UNSIGNED) ASC,
                        rf.paper_trail_no ASC";
            
            $stmt = $this->con->prepare($query);
            if ($types) {
                $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();

            if (!$result) throw new Exception("Query failed: " . $this->con->error);
            
            $researchData = [];
            $stats = ['total' => 0, 'thisYear' => 0];
            $researchIds = [];
            $rows = [];
            
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
                $researchIds[] = $row['id'];
            }
            
            $academicPositions = $this->getAcademicPositions($researchIds);
            
            $papersByYear = [];
            foreach ($rows as $row) {
                $year = $row['endorsement_year'];
                if (!$year) continue;
                if (!isset($papersByYear[$year])) $papersByYear[$year] = [];
                $papersByYear[$year][] = $row;
                $stats['total']++;
                if ($year == date('Y')) $stats['thisYear']++;
            }
            
            krsort($papersByYear);
            
            foreach ($papersByYear as $year => $yearPapers) {
                $paperIndex = 1;
                foreach ($yearPapers as $row) {
                    $parsedAuthors = $this->parseAuthorsAndFaculty($row['author'], $row['coauthor']);
                    $paperPositions = $academicPositions[$row['id']] ?? [];
                    
                    $academicRanks = [];
                    $nonAcademicRanks = [];
                    $jobOrders = [];
                    
                    foreach ($parsedAuthors['all_researchers'] as $researcher) {
                        $found = null;
                        if (!empty($paperPositions)) {
                            foreach ($paperPositions as $pos) {
                                if ($pos['faculty_name'] === $researcher) {
                                    $found = $pos;
                                    break;
                                }
                            }
                        }
                        $academicRanks[] = $found['academic_rank'] ?? '—';
                        $nonAcademicRanks[] = $found['non_academic_rank'] ?? '—';
                        $jobOrders[] = $found['job_order'] ?? '—';
                    }
                    
                    $formatDate = function($date) {
                        if (empty($date) || $date === '—' || $date === 'NULL') return '—';
                        return date('M-d-Y', strtotime($date));
                    };

                    // Parse Utilization Support Docs Metadata
                    $utilLinks = $row['supportDocs2Val'] ?? '—';
                    if (!empty($utilLinks) && $utilLinks !== '—' && (strpos($utilLinks, '[') === 0 || strpos($utilLinks, '{') === 0)) {
                        $meta = json_decode($utilLinks, true);
                        if (is_array($meta)) {
                            $links = [];
                            foreach ($meta as $file) {
                                if (isset($file['view_url'])) {
                                    $links[] = [
                                        'name' => $file['file_name'] ?? 'Support Document',
                                        'url' => $file['view_url']
                                    ];
                                }
                            }
                            $utilLinks = !empty($links) ? json_encode($links) : '—';
                        }
                    }

                    $supportDocs = [];
                    $docFields = [
                        'patentFormURL' => 'Application Form',
                        'patentAbstractURL' => 'Abstract',
                        'patentClaimsURL' => 'Claims',
                        'patentTechnicalDescriptionURL' => 'Technical Description',
                        'patentTechnicalDrawingURL' => 'Technical Drawing',
                        'patentPhotoTechnologyURL' => 'Photo of Technology',
                        'patentFormURLUM' => 'Application Form (UM)',
                        'patentAbstractURLUM' => 'Abstract (UM)',
                        'patentClaimsURLUM' => 'Claims (UM)',
                        'patentTechnicalDescriptionURLUM' => 'Technical Description (UM)',
                        'patentTechnicalDrawingURLUM' => 'Technical Drawing (UM)',
                        'patentPhotoTechnologyURLUM' => 'Photo of Technology (UM)',
                        'idFormURL' => 'Application Form (ID)',
                        'idAbstractURL' => 'Abstract (ID)',
                        'idClaimsURL' => 'Claims (ID)',
                        'idTechnicalDescriptionURL' => 'Technical Description (ID)',
                        'idTechnicalDrawingURL' => 'Technical Drawing (ID)',
                        'idPhotoTechnologyURL' => 'Photo of Technology (ID)'
                    ];

                    foreach ($docFields as $field => $label) {
                        if (!empty($row[$field]) && $row[$field] !== 'NULL') {
                            $supportDocs[] = [
                                'name' => $label,
                                'url' => $row[$field]
                            ];
                        }
                    }

                    $researchEntry = [
                        'paperTrailNo' => $row['paper_trail_no'] ?? $this->generatePaperTrailNo($paperIndex, $year),
                        'campus' => $row['campus'] ?? '',
                        'category' => $row['category'] ?? '',
                        'title' => $row['title'] ?? '',
                        'authors' => $parsedAuthors['authors_list'],
                        'facultyResearcher' => $parsedAuthors['faculty_researchers'],
                        'academicRank' => implode('|', $academicRanks),
                        'nonAcademicRank' => implode('|', $nonAcademicRanks),
                        'jobOrder' => implode('|', $jobOrders),
                        'dateStarted' => $formatDate($row['date_started']),
                        'dateCompleted' => $formatDate($row['date_completed']),
                        'forumTitle' => $row['forumTitleVal'] ?? '—',
                        'venue' => $row['venueVal'] ?? '—',
                        'forumType' => $row['forumTypeVal'] ?? '—',
                        'presentationDate' => $formatDate($row['presentationDateVal']),
                        'publishedTitle' => $row['publishedTitleVal'] ?? '—',
                        'publicationDate' => $formatDate($row['publicationDateVal']),
                        'journalTitle' => $row['journalTitleVal'] ?? '—',
                        'volumeIssue' => ($row['volumeVal'] || $row['issueVal']) ? ($row['volumeVal'] . ($row['issueVal'] ? ' & ' . $row['issueVal'] : '')) : '—',
                        'issn' => $row['issnVal'] ?? '—',
                        'index' => $row['indexTypeVal'] ?? '—',
                        'productName' => $row['productNameVal'] ?? '—',
                        'patentNumber' => (function($row) {
                            $app = $row['applicationNumberVal'] ?? '';
                            return ($app && $app !== 'NULL') ? $app : '—';
                        })($row),
                        'benefitingIndustry' => $row['benefitingIndustryVal'] ?? '—',
                        'supportDocs1' => !empty($supportDocs) ? json_encode($supportDocs) : '—',
                        'programTitle' => $row['utilizationTypeVal'] ?? '—',
                        'dateConducted' => $formatDate($row['dateConductedVal']),
                        'traineesCount' => $row['traineesCountVal'] ?? '—',
                        'supportDocs2' => $utilLinks
                    ];
                    
                    $researchData[] = $researchEntry;
                    $paperIndex++;
                }
            }
            
            // Fetch list of centers and campuses for filters
            $centersQuery = "SELECT DISTINCT center FROM researchfile WHERE center IS NOT NULL AND center != '' ORDER BY center ASC";
            $centersResult = $this->con->query($centersQuery);
            $centers = [];
            while ($c = $centersResult->fetch_assoc()) $centers[] = $c['center'];

            $campusesQuery = "SELECT DISTINCT campus FROM researchfile WHERE campus IS NOT NULL AND campus != '' ORDER BY campus ASC";
            $campusesResult = $this->con->query($campusesQuery);
            $campuses = [];
            while ($c = $campusesResult->fetch_assoc()) $campuses[] = $c['campus'];

            $categoriesQuery = "SELECT DISTINCT category FROM researchfile WHERE category IS NOT NULL AND category != '' ORDER BY category ASC";
            $categoriesResult = $this->con->query($categoriesQuery);
            $categories = [];
            while ($c = $categoriesResult->fetch_assoc()) $categories[] = $c['category'];

            $this->response->status = true;
            $this->response->message = 'Completed research data fetched';
            $this->response->data = $researchData;
            $this->response->stats = $stats;
            $this->response->filters = [
                'events' => array_values($events),
                'centers' => $centers,
                'campuses' => $campuses,
                'categories' => $categories
            ];
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
        }
        echo json_encode($this->response);
    }

    public function updateCompletedResearch() {
        try {
            // Get POST data
            $researchId = isset($_POST['research_id']) ? intval($_POST['research_id']) : 0;
            $action = isset($_POST['action_type']) ? $_POST['action_type'] : ''; // 'confirm' or 'not_presented'
            
            if (!$researchId) {
                throw new Exception("Research ID is required");
            }
            
            if (!in_array($action, ['confirm', 'not_presented'])) {
                throw new Exception("Invalid action type");
            }
            
            // Get staff ID from session or POST
            $confirmedBy = isset($_POST['confirmed_by']) ? intval($_POST['confirmed_by']) : 0;
            if (!$confirmedBy) {
                // Try to get from session
                session_start();
                $confirmedBy = $_SESSION['staff_id'] ?? 0;
            }
            
            if (!$confirmedBy) {
                throw new Exception("Confirmation staff ID is required");
            }
            
            // Determine new status
            $newStatus = ($action === 'confirm') ? 'completed' : 'not_presented';
            
            // Update the research file
            $query = "UPDATE researchfile 
                      SET completion_status = ?, confirmed_by = ? 
                      WHERE id = ?";
            
            $stmt = $this->con->prepare($query);
            $stmt->bind_param("sii", $newStatus, $confirmedBy, $researchId);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to update: " . $stmt->error);
            }
            
            if ($stmt->affected_rows === 0) {
                throw new Exception("No record found with ID: " . $researchId);
            }
            
            $this->response->status = true;
            $this->response->message = "Research successfully marked as '" . ($action === 'confirm' ? 'completed' : 'not presented') . "'";
            $this->response->data = [
                'research_id' => $researchId,
                'new_status' => $newStatus,
                'confirmed_by' => $confirmedBy
            ];
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
        }
        echo json_encode($this->response);
    }

    public function fetchConfirmResearch() {
        try {
            // Get staff ID from session
            $staffId = 0;
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            
            // Get staff ID from session
            if (isset($_SESSION['staff_id'])) {
                $staffId = intval($_SESSION['staff_id']);
            } else {
                // Try to get staff ID from rdestaff table using username
                if (isset($_SESSION['userName']) && !empty($_SESSION['userName']) && $_SESSION['userName'] !== 'UNKNOWN') {
                    $username = $_SESSION['userName'];
                    $staffQuery = "SELECT id FROM rdestaff WHERE username = ? LIMIT 1";
                    $stmt = $this->con->prepare($staffQuery);
                    if ($stmt) {
                        $stmt->bind_param("s", $username);
                        $stmt->execute();
                        $staffResult = $stmt->get_result();
                        if ($staffRow = $staffResult->fetch_assoc()) {
                            $staffId = intval($staffRow['id']);
                            $_SESSION['staff_id'] = $staffId;
                        }
                        $stmt->close();
                    }
                }
            }

            // First, get all Symposium event IDs
            $events = $this->getEvents();
            $symposiumIds = array_keys($events);
            
            // Build the WHERE clause to only include Symposium events
            $eventCondition = "";
            if (!empty($symposiumIds)) {
                $idsList = implode(',', array_map('intval', $symposiumIds));
                $eventCondition = " AND (rf.event_id IN ($idsList) OR LOWER(rf.event) LIKE '%symposium%')";
            } else {
                $eventCondition = " AND LOWER(rf.event) LIKE '%symposium%'";
            }

            // Only fetch pending confirmation for SYMPOSIUM events
            $query = "SELECT 
                        rf.id,
                        rf.author,
                        rf.coauthor,
                        rf.title,
                        rf.paper_trail_no,
                        rf.completion_status,
                        rf.confirmed_by,
                        rf.event,
                        rf.event_id,
                        e.id as endorsement_id,
                        e.date as endorsement_date,
                        e.status as endorsement_status
                    FROM endorsement e
                    INNER JOIN researchfile rf ON e.id = rf.endorsementid
                    WHERE e.status = 'accepted' 
                    AND (rf.completion_status IS NULL 
                        OR rf.completion_status = '' 
                        OR rf.completion_status = 'pending_confirmation')
                    $eventCondition
                    ORDER BY rf.id DESC";
            
            $result = $this->con->query($query);
            
            if (!$result) {
                throw new Exception("Query failed: " . $this->con->error);
            }
            
            $data = [];
            while ($row = $result->fetch_assoc()) {
                // Parse authors
                $authors = [];
                
                if (!empty($row['author']) && $row['author'] !== 'NULL' && $row['author'] !== null) {
                    $authors[] = trim($row['author']);
                }

                if (!empty($row['coauthor']) && $row['coauthor'] !== 'NULL' && $row['coauthor'] !== null) {
                    $coauthorData = $row['coauthor'];
        
                    if (is_string($coauthorData) && (strpos($coauthorData, '[') === 0 || strpos($coauthorData, '{') === 0)) {
                        $coauthors = json_decode($coauthorData, true);
                        if (is_array($coauthors)) {
                            foreach ($coauthors as $co) {
                                if (!empty($co) && $co !== 'NULL') {
                                    $authors[] = trim($co);
                                }
                            }
                        }
                    } else {
                        $coauthorList = explode(',', $coauthorData);
                        foreach ($coauthorList as $co) {
                            $co = trim($co);
                            if (!empty($co) && $co !== 'NULL') {
                                $authors[] = $co;
                            }
                        }
                    }
                }
                
                $authors = array_values(array_unique(array_filter($authors)));
                
                // Determine presenter (first author)
                $presenter = !empty($authors) ? $authors[0] : '—';
                
                // Determine status display
                $statusDisplay = 'Pending Confirmation';
                if ($row['completion_status'] === 'pending_confirmation') {
                    $statusDisplay = 'Pending';
                } elseif ($row['completion_status'] === 'not_presented') {
                    $statusDisplay = 'Not Presented';
                } elseif ($row['completion_status'] === 'completed') {
                    $statusDisplay = 'Completed';
                } else {
                    $statusDisplay = 'Pending Confirmation'; // For NULL or empty
                }
                
                // Determine event type for display
                $eventType = 'Symposium';
                if (stripos($row['event'] ?? '', 'In-House') !== false) {
                    $eventType = 'In-House';
                }
                
                $data[] = [
                    'id' => intval($row['id']),
                    'paper_trail_no' => $row['paper_trail_no'] ?? '—',
                    'title' => $row['title'] ?? '—',
                    'authors' => implode(', ', $authors),
                    'author_count' => count($authors),
                    'presenter' => $presenter,
                    'completion_status' => $row['completion_status'] ?? 'pending_confirmation',
                    'status_display' => $statusDisplay,
                    'endorsement_date' => $row['endorsement_date'] ?? '—',
                    'endorsement_status' => $row['endorsement_status'] ?? '—',
                    'confirmed_by' => $row['confirmed_by'] ?? null,
                    'event' => $row['event'] ?? '—',
                    'event_type' => $eventType,
                    'event_id' => $row['event_id'] ?? null
                ];
            }
            
            // Get statistics
            $stats = [
                'total' => count($data),
                'pending' => 0,
                'not_presented' => 0,
                'completed' => 0
            ];
            
            foreach ($data as $item) {
                if ($item['completion_status'] === 'pending_confirmation' || $item['completion_status'] === null || $item['completion_status'] === '') {
                    $stats['pending']++;
                } elseif ($item['completion_status'] === 'not_presented') {
                    $stats['not_presented']++;
                } elseif ($item['completion_status'] === 'completed') {
                    $stats['completed']++;
                }
            }
            
            $this->response->status = true;
            $this->response->message = 'Pending confirmation data fetched successfully';
            $this->response->data = $data;
            $this->response->stats = $stats;
            $this->response->staff_id = $staffId ?: null;
            $this->response->record_count = count($data);
            $this->response->event_filter = 'Symposium only';
            
        } catch (Exception $e) {
            $this->response->status = false;
            $this->response->message = 'Error: ' . $e->getMessage();
            $this->response->data = [];
            $this->response->stats = ['total' => 0, 'pending' => 0, 'not_presented' => 0, 'completed' => 0];
            $this->response->staff_id = null;
            $this->response->record_count = 0;
        }
        
        echo json_encode($this->response);
    }

    public function exportToExcel() {
        try {
            // Read from POST (since route is registered as POST)
            $startYear = isset($_POST['start_year']) ? intval($_POST['start_year']) : date('Y') - 3;
            $endYear = isset($_POST['end_year']) ? intval($_POST['end_year']) : date('Y');
            
            // Validate years
            if ($startYear > $endYear) {
                throw new Exception("Start year must be less than or equal to end year");
            }
            
            // Get all Symposium events
            $events = $this->getEvents();
            $symposiumIds = array_keys($events);
            
            // Build query for completed research with symposium events only
            $whereClauses = [
                "e.status = 'accepted'",
                "(rf.completion_status = 'completed' OR rf.completion_status IS NULL OR rf.completion_status = '')",
                "(rf.status = 'accepted' OR rf.status = '' OR rf.status IS NULL)"
            ];
            
            // Filter by symposium events only
            if (!empty($symposiumIds)) {
                $idsList = implode(',', array_map('intval', $symposiumIds));
                $whereClauses[] = "(rf.event_id IN ($idsList) OR LOWER(rf.event) LIKE '%symposium%')";
            } else {
                $whereClauses[] = "LOWER(rf.event) LIKE '%symposium%'";
            }
            
            // Filter by year range
            $whereClauses[] = "YEAR(e.date) BETWEEN $startYear AND $endYear";
            
            $whereSql = implode(" AND ", $whereClauses);
            
            // FIX: Use MAX(el.date) or remove el.date from SELECT if not needed
            $query = "SELECT 
                        rf.id,
                        rf.author,
                        rf.coauthor,
                        rf.title,
                        rf.campus,
                        rf.center,
                        e.date as endorsement_date,
                        MAX(el.date) as event_date
                    FROM endorsement e
                    INNER JOIN researchfile rf ON e.id = rf.endorsementid
                    LEFT JOIN event_list el ON rf.event = el.name
                    WHERE $whereSql
                    GROUP BY rf.id
                    ORDER BY YEAR(e.date) DESC, rf.id ASC";
            
            $result = $this->con->query($query);
            
            if (!$result) {
                throw new Exception("Query failed: " . $this->con->error);
            }
            
            // Collect data grouped by faculty
            $facultyData = [];
            
            while ($row = $result->fetch_assoc()) {
                // Get all faculty members (author, coauthors, presenter)
                $facultyMembers = [];
                
                // Add author
                if (!empty($row['author']) && $row['author'] !== 'NULL') {
                    $cleaned = $this->cleanName($row['author']);
                    if ($cleaned) {
                        $facultyMembers[] = $cleaned;
                    }
                }
                
                // Add coauthors (handle JSON or comma-separated)
                if (!empty($row['coauthor']) && $row['coauthor'] !== 'NULL') {
                    $coauthorData = $row['coauthor'];
                    if (is_string($coauthorData) && (strpos($coauthorData, '[') === 0 || strpos($coauthorData, '{') === 0)) {
                        $coauthors = json_decode($coauthorData, true);
                        if (is_array($coauthors)) {
                            foreach ($coauthors as $co) {
                                if (!empty($co) && $co !== 'NULL') {
                                    $cleaned = $this->cleanName($co);
                                    if ($cleaned) {
                                        $facultyMembers[] = $cleaned;
                                    }
                                }
                            }
                        }
                    } else {
                        $coauthorList = explode(',', $coauthorData);
                        foreach ($coauthorList as $co) {
                            $co = trim($co);
                            if (!empty($co) && $co !== 'NULL') {
                                $cleaned = $this->cleanName($co);
                                if ($cleaned) {
                                    $facultyMembers[] = $cleaned;
                                }
                            }
                        }
                    }
                }
                
                // Remove duplicates
                $facultyMembers = array_values(array_unique($facultyMembers));
                
                // Get year from event date
                $yearCompleted = !empty($row['event_date']) ? date('Y', strtotime($row['event_date'])) : date('Y', strtotime($row['endorsement_date']));
                
                // For each faculty member, add this research
                foreach ($facultyMembers as $faculty) {
                    if (empty($faculty)) continue;
                    
                    // Use a composite key to group by faculty and year
                    $key = md5($faculty . '|' . $yearCompleted);
                    
                    if (!isset($facultyData[$key])) {
                        $facultyData[$key] = [
                            'faculty' => $faculty,
                            'year' => $yearCompleted,
                            'campus' => $row['campus'] ?? '—',
                            'titles' => [],
                            'faculty_researchers' => [],
                            'faculty_researchers_set' => []
                        ];
                    }
                    
                    // Add title
                    if (!empty($row['title']) && !in_array($row['title'], $facultyData[$key]['titles'])) {
                        $facultyData[$key]['titles'][] = $row['title'];
                    }
                    
                    // Add all faculty members as researchers
                    foreach ($facultyMembers as $researcher) {
                        if (!empty($researcher) && !in_array($researcher, $facultyData[$key]['faculty_researchers_set'])) {
                            $facultyData[$key]['faculty_researchers_set'][] = $researcher;
                        }
                    }
                }
            }
            
            // Build the final dataset
            $exportData = [];
            foreach ($facultyData as $data) {
                $exportData[] = [
                    'Faculty' => $data['faculty'],
                    'List of Research/Research Title' => implode('; ', $data['titles']),
                    'Faculty Researcher' => implode(', ', $data['faculty_researchers_set']),
                    'Campus' => $data['campus'],
                    'Year Completed/Year of Symposium' => $data['year']
                ];
            }
            
            // Sort by faculty name then year
            usort($exportData, function($a, $b) {
                $cmp = strcmp($a['Faculty'], $b['Faculty']);
                if ($cmp === 0) {
                    return $b['Year Completed/Year of Symposium'] - $a['Year Completed/Year of Symposium'];
                }
                return $cmp;
            });
            
            // Return JSON data
            $this->response->status = true;
            $this->response->message = 'Export data fetched successfully';
            $this->response->data = $exportData;
            $this->response->start_year = $startYear;
            $this->response->end_year = $endYear;
            $this->response->record_count = count($exportData);
            
            echo json_encode($this->response);
            
        } catch (Exception $e) {
            $this->response->status = false;
            $this->response->message = 'Error: ' . $e->getMessage();
            $this->response->data = [];
            echo json_encode($this->response);
        }
    }

    private function cleanName($name) {
        if (empty($name) || $name === 'NULL' || $name === null) {
            return '';
        }
        
        // Convert to string and trim
        $name = trim((string)$name);
        if (empty($name)) {
            return '';
        }
        
        // Common titles and honorifics to remove (case insensitive)
        $titles = [
            // Academic titles
            'Dr.', 'Dr', 'Drs.', 'Drs',
            'Prof.', 'Prof', 'Professor',
            'Asst. Prof.', 'Asst Prof', 'Assistant Professor',
            'Assoc. Prof.', 'Assoc Prof', 'Associate Professor',
            'Dean', 'Dir.', 'Dir', 'Director',
            'Chair', 'Chairman', 'Chairperson',
            'Asst.', 'Asst', 'Assistant',
            'Assoc.', 'Assoc', 'Associate',
            
            // Professional titles
            'Engr.', 'Engr', 'Engineer',
            'Arch.', 'Arch', 'Architect',
            'Atty.', 'Atty', 'Attorney',
            'CPA', 'C.P.A.',
            'RN', 'R.N.',
            'LPT', 'L.P.T.',
            'MD', 'M.D.',
            'PA', 'P.A.',
            'RT', 'R.T.',
            
            // Academic degrees (suffixes)
            'PhD', 'Ph.D.', 'Ph D',
            'EdD', 'Ed.D.', 'Ed D',
            'DSc', 'D.Sc.', 'D Sc',
            'MS', 'M.S.', 'M Sc',
            'MA', 'M.A.',
            'MBA', 'M.B.A.',
            'MEd', 'M.Ed.', 'M Ed',
            'MSc', 'M.Sc.', 'M Sc',
            'BS', 'B.S.',
            'BA', 'B.A.',
            'BSc', 'B.Sc.',
            'BEd', 'B.Ed.',
            
            // Honorifics
            'Mr.', 'Mr',
            'Mrs.', 'Mrs',
            'Ms.', 'Ms',
            'Miss',
            'Sir', 'Madam', 'Ma\'am',
            
            // Other common prefixes
            'Hon.', 'Hon'
        ];
        
        // Sort titles by length (longest first) to prevent partial matches
        usort($titles, function($a, $b) {
            return strlen($b) - strlen($a);
        });
        
        // Remove titles from the beginning of the name
        foreach ($titles as $title) {
            // Pattern: title at start of string, optionally followed by space
            $pattern = '/^' . preg_quote($title, '/') . '\s+/i';
            $name = preg_replace($pattern, '', $name);
            
            // Pattern: title anywhere with space before and after (for titles in middle)
            $pattern = '/\s+' . preg_quote($title, '/') . '\s+/i';
            $name = preg_replace($pattern, ' ', $name);
            
            // Pattern: title at end with space before (for suffix degrees)
            $pattern = '/\s+' . preg_quote($title, '/') . '$/i';
            $name = preg_replace($pattern, '', $name);
            
            // Pattern: title with periods variations
            $titleWithPeriod = str_replace('.', '\.', $title);
            $pattern = '/^' . $titleWithPeriod . '\s+/i';
            $name = preg_replace($pattern, '', $name);
        }
        
        // Remove multiple spaces
        $name = preg_replace('/\s+/', ' ', $name);
        
        // Remove trailing periods, commas, spaces
        $name = trim($name, '., ');
        
        // If after cleaning, the name is empty or just single character, return original
        if (strlen($name) < 2) {
            return trim((string)$name);
        }
        
        return $name;
    }

}

$action = $_POST['action'] ?? $_GET['action'] ?? 'fetch';

$con = $conn; 
$api = new CompletedResearchAPI($con);

switch ($action) {
    case 'fetch':
        $api->fetchCompletedResearch();
        break;
    case 'fetch_confirm':
        $api->fetchConfirmResearch();
        break;
    case 'update':
        $api->updateCompletedResearch();
        break;
    case 'export_excel':
        $api->exportToExcel();
        break;
    default:
        echo json_encode(['status' => false, 'message' => 'Invalid action']);
        break;
}