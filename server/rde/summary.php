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
            'authors_list' => implode('|', $allResearchers), 
            'faculty_researchers' => implode('|', $allResearchers),
            'all_researchers' => $allResearchers 
        ];
    }
    
    private function getEvents() {
        $events = [];
        $query = "SELECT id, name, date FROM event_list WHERE status = 0 ORDER BY date DESC";
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
        if (empty($researchIds)) return $positions;

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
            $filters = [
                'utilization_type' => $_POST['utilization_type'] ?? 'All',
                'search' => $_POST['search'] ?? ''
            ];

            $whereClauses = ["e.status = 'accepted'"];
            $params = [];
            $types = "";

            if ($filters['utilization_type'] !== 'All') {
                $type = $filters['utilization_type'];
                // Normalize 'UM' to 'Utility Models' if that's what's in DB
                if ($type === 'UM') {
                    $whereClauses[] = "(util.utilizationType = 'UM' OR util.utilizationType = 'Utility Models' OR util.utilizationType = 'Utility Model')";
                } else {
                    $whereClauses[] = "util.utilizationType = ?";
                    $params[] = $type;
                    $types .= "s";
                }
            }

            if (!empty($filters['search'])) {
                $searchTerm = "%" . $filters['search'] . "%";
                $whereClauses[] = "(rf.title LIKE ? OR rf.author LIKE ? OR rf.paper_trail_no LIKE ?)";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $types .= "sss";
            }

            $whereSql = implode(" AND ", $whereClauses);

            // For "Completed", we fetch all accepted research.
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
                        e.id as endorsement_id,
                        e.status as endorsement_status,
                        e.date as endorsement_date,
                        YEAR(e.date) as endorsement_year,
                        
                        -- Presentation info (taking one)
                        pr.date_completed as dateCompletedVal,
                        pr.forum_title as forumTitleVal,
                        pr.venue as venueVal,
                        pr.forum_type as forumTypeVal,
                        pr.presentation_date as presentationDateVal,
                        
                        -- Publication info (taking one)
                        pub.published_title as publishedTitleVal,
                        pub.publication_date as publicationDateVal,
                        pub.journal_title as journalTitleVal,
                        pub.volume as volumeVal,
                        pub.issue as issueVal,
                        pub.issn as issnVal,
                        pub.index_type as indexTypeVal,
                        
                        -- Utilization info (taking one)
                        util.utilizationType as utilizationTypeVal,
                        util.dateConducted as dateConductedVal,
                        util.traineesCount as traineesCountVal,
                        util.supportDocsMetadata as supportDocs2Val,

                        -- Patent Product info (from patent, utility_model, industrial_design)
                        COALESCE(p.technologyName, um.technologyNameUM, idesign.idTitle) as productNameVal,
                        COALESCE(p.registrationNumber, um.registrationNumber, idesign.registrationNumber) as registrationNumberVal,
                        COALESCE(p.applicationNumber, um.applicationNumberUM, idesign.applicationNumber) as applicationNumberVal,
                        COALESCE(p.benefitingIndustry, um.benefitingIndustryUM) as benefitingIndustryVal,
                        p.patentFormURL as patentFormURL,
                        p.abstractURL as patentAbstractURL,
                        p.claimsURL as patentClaimsURL,
                        p.technicalDescriptionURL as patentTechnicalDescriptionURL,
                        p.technicalDrawingURL as patentTechnicalDrawingURL,
                        p.photoTechnologyURL as patentPhotoTechnologyURL,
                        um.patentFormURLUM as patentFormURLUM,
                        um.abstractURLUM as patentAbstractURLUM,
                        um.claimsURLUM as patentClaimsURLUM,
                        um.technicalDescriptionURLUM as patentTechnicalDescriptionURLUM,
                        um.technicalDrawingURLUM as patentTechnicalDrawingURLUM,
                        um.photoTechnologyURLUM as patentPhotoTechnologyURLUM,
                        idesign.applicationFormURL as idFormURL,
                        idesign.abstractURL as idAbstractURL,
                        idesign.claimsURL as idClaimsURL,
                        idesign.technicalDescriptionURL as idTechnicalDescriptionURL,
                        idesign.technicalDrawingURL as idTechnicalDrawingURL,
                        idesign.photoTechnologyURL as idPhotoTechnologyURL
                        
                    FROM endorsement e
                    INNER JOIN researchfile rf ON e.id = rf.endorsementid
                    LEFT JOIN presentation_research pr ON rf.id = pr.research_id
                    LEFT JOIN publications pub ON rf.id = pub.research_id
                    LEFT JOIN utilization_programs util ON rf.id = util.research_id
                    LEFT JOIN patent p ON rf.id = p.research_id
                    LEFT JOIN utility_model um ON rf.id = um.research_id
                    LEFT JOIN industrial_design idesign ON rf.id = idesign.research_id
                    
                    WHERE $whereSql
                    
                    GROUP BY rf.title
                    ORDER BY
                        CAST(SUBSTRING_INDEX(rf.paper_trail_no, '-', 1) AS UNSIGNED) ASC,
                        CAST(SUBSTRING_INDEX(rf.paper_trail_no, '-', -1) AS UNSIGNED) ASC,
                        rf.paper_trail_no ASC";
            
            $stmt = $this->con->prepare($query);
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            if (!$result) throw new Exception("Query failed: " . $this->con->error);
            
            $researchData = [];
            $stats = [
                'total' => 0, 
                'thisYear' => 0,
                'patents' => 0,
                'utilityModels' => 0,
                'copyrights' => 0,
                'extensionServices' => 0
            ];

            $researchData = [];
            $stats = [
                'total' => 0, 
                'thisYear' => 0,
                'patents' => 0,
                'utilityModels' => 0,
                'copyrights' => 0,
                'extensionServices' => 0
            ];

            // Use the actual number of unique titles found by the main query
            $stats['total'] = $result->num_rows;

            // 2. Get specific utilization stats (Accepted only, counting unique project titles per category)
            $utilStatsQuery = "SELECT util.utilizationType, COUNT(DISTINCT rf.title) as count 
                               FROM utilization_programs util
                               JOIN endorsement e ON util.endorsement_id = e.id
                               LEFT JOIN researchfile rf ON util.research_id = rf.id
                               WHERE e.status = 'accepted'
                               GROUP BY util.utilizationType";
            
            $utilStatsRes = $this->con->query($utilStatsQuery);
            if ($utilStatsRes) {
                while ($uRow = $utilStatsRes->fetch_assoc()) {
                    $uType = $uRow['utilizationType'];
                    $uCount = (int)$uRow['count'];
                    
                    if ($uType === 'Patent') $stats['patents'] += $uCount;
                    else if (in_array($uType, ['UM', 'Utility Models', 'Utility Model'])) $stats['utilityModels'] += $uCount;
                    else if ($uType === 'Copyright') $stats['copyrights'] += $uCount;
                    else if ($uType === 'Extension Services') $stats['extensionServices'] += $uCount;
                }
            }

            $researchIds = [];
            $rows = [];
            
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
                $researchIds[] = $row['id'];
                
                if ($row['endorsement_year'] == date('Y')) $stats['thisYear']++;
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
                        'programTitle' => $row['programTitleVal'] ?? '—',
                        'dateConducted' => $formatDate($row['dateConductedVal']),
                        'traineesCount' => $row['traineesCountVal'] ?? '—',
                        'supportDocs2' => $utilLinks
                    ];
                    
                    $researchData[] = $researchEntry;
                    $paperIndex++;
                }
            }
            
            $this->response->status = true;
            $this->response->message = 'Completed research data fetched';
            $this->response->data = $researchData;
            $this->response->stats = $stats;
            
        } catch (Exception $e) {
            $this->response->message = 'Error: ' . $e->getMessage();
        }
        echo json_encode($this->response);
    }
}

// Global Connection assumed from require once
$con = $conn; 
$api = new CompletedResearchAPI($con);
$api->fetchCompletedResearch();