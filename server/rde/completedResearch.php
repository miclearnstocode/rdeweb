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

            $whereClauses = ["e.status = 'accepted'"];
            
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

            // FIX: Use MAX() or MIN() aggregation functions for columns from joined tables
            // to satisfy ONLY_FULL_GROUP_BY mode
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
                        'programTitle' => $row['utilizationTypeVal'] ?? '—',  // Fixed: Use utilizationTypeVal
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
}

// Global Connection assumed from require once
$con = $conn; 
$api = new CompletedResearchAPI($con);
$api->fetchCompletedResearch();