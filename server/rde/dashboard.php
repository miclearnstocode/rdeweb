<?php
require_once(__DIR__ . '/../db.php');

header('Content-Type: application/json');

class DashboardAPI {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    private function getFilterCondition($filter) {
        switch ($filter) {
            case 'extension':
                return "AND (rf.center = 'Extension (Extension)' OR rf.category = 'Extension')";
            case 'inhouse':
                return "AND (rf.event LIKE '%In-House%' OR e.name LIKE '%In-House%')";
            case 'symposium':
                return "AND (rf.event LIKE '%Symposium%' OR e.name LIKE '%Symposium%')";
            case 'undergraduate':
                return "AND rf.paper_type = 'undergraduate'";
            case 'graduate':
                return "AND rf.paper_type = 'graduate'";
            default:
                return "";
        }
    }

    private function getFilterLabel($filter) {
        switch ($filter) {
            case 'extension':
                return 'Extension';
            case 'inhouse':
                return 'In-House Review';
            case 'symposium':
                return 'Symposium';
            case 'undergraduate':
                return 'Undergraduate';
            case 'graduate':
                return 'Graduate';
            default:
                return 'Research';
        }
    }

    public function fetchStats($filter = null) {
        try {
            $data = [];
            $filterCondition = $this->getFilterCondition($filter);
            $filterLabel = $this->getFilterLabel($filter);
            $baseCondition = "(en.status = 'accepted' AND (rf.status = 'accepted' OR rf.status IS NULL))";
            
            // 1. Total accepted/active research
            $r = $this->con->query("SELECT COUNT(DISTINCT rf.id) as total
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE $baseCondition $filterCondition");
            $data['totalAccepted'] = (int)($r->fetch_assoc()['total'] ?? 0);

            // 2. Proposed
            $r = $this->con->query("SELECT COUNT(DISTINCT rf.id) as total
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE $baseCondition AND rf.event_id IS NOT NULL AND rf.event_id != 0 $filterCondition");
            $data['totalProposed'] = (int)($r->fetch_assoc()['total'] ?? 0);

            // 3. In-House Reviews
            if ($filter === null || $filter === '') {
                $r = $this->con->query("SELECT COUNT(DISTINCT rf.id) as total
                    FROM researchfile rf
                    LEFT JOIN endorsement en ON rf.endorsementid = en.id
                    LEFT JOIN event_list e ON rf.event_id = e.id
                    WHERE $baseCondition AND (rf.event LIKE '%In-House%' OR (e.name LIKE '%In-House%' AND rf.event_id != 0))
                    AND is_internally_funded = 1");
                $data['inHouseReview'] = (int)($r->fetch_assoc()['total'] ?? 0);
            } else {
                $data['inHouseReview'] = 0;
            }

            // 4. Symposium
            if ($filter === 'symposium') {
                $r = $this->con->query("SELECT COUNT(DISTINCT rf.id) as total
                    FROM researchfile rf
                    LEFT JOIN endorsement en ON rf.endorsementid = en.id
                    LEFT JOIN event_list e ON rf.event_id = e.id
                    WHERE $baseCondition 
                        AND (rf.event LIKE '%Symposium%' OR (e.name LIKE '%Symposium%' AND rf.event_id != 0))");
                $data['symposium'] = (int)($r->fetch_assoc()['total'] ?? 0);
            } else if ($filter === null || $filter === '') {
                $r = $this->con->query("SELECT COUNT(DISTINCT rf.id) as total
                    FROM researchfile rf
                    LEFT JOIN endorsement en ON rf.endorsementid = en.id
                    LEFT JOIN event_list e ON rf.event_id = e.id
                    WHERE $baseCondition 
                        AND (rf.event LIKE '%Symposium%' OR (e.name LIKE '%Symposium%' AND rf.event_id != 0))");
                $data['symposium'] = (int)($r->fetch_assoc()['total'] ?? 0);
            } else {
                $data['symposium'] = 0;
            }

            // 5. Presented research count
            $r = $this->con->query("SELECT COUNT(DISTINCT research_id) as total FROM presentation_research");
            $data['presented'] = (int)($r->fetch_assoc()['total'] ?? 0);

            // 6. Publications
            $r = $this->con->query("SELECT COUNT(DISTINCT research_id) as total FROM publications");
            $data['published'] = (int)($r->fetch_assoc()['total'] ?? 0);

            // 7. Patent / UM / IP Assets
            $r = $this->con->query("SELECT COUNT(DISTINCT research_id) as total FROM patent");
            $data['patents'] = (int)($r->fetch_assoc()['total'] ?? 0);

            $r = $this->con->query("SELECT COUNT(DISTINCT research_id) as total FROM utility_model");
            $data['utilityModels'] = (int)($r->fetch_assoc()['total'] ?? 0);

            // 8. Utilization breakdown
            $r = $this->con->query("SELECT utilizationType, COUNT(*) as count FROM utilization_programs GROUP BY utilizationType");
            $data['utilization'] = [];
            if ($r) {
                while ($row = $r->fetch_assoc()) {
                    $data['utilization'][] = ['type' => $row['utilizationType'], 'count' => (int)$row['count']];
                }
            }

            // 9. Research by Campus
            $r = $this->con->query("SELECT rf.campus, COUNT(DISTINCT rf.id) as count
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE (en.status = 'accepted' OR rf.status = 'accepted') $filterCondition
                    AND rf.campus IS NOT NULL 
                    AND rf.campus NOT LIKE '%Center%'
                    AND rf.campus != '' 
                    AND rf.campus != 'Extension'
                    AND rf.campus != 'Extension (Extension)'
                GROUP BY rf.campus
                ORDER BY count DESC
                LIMIT 10");
            $data['byCampus'] = [];
            if ($r) {
                while ($row = $r->fetch_assoc()) {
                    $data['byCampus'][] = ['campus' => $row['campus'], 'count' => (int)$row['count']];
                }
            }

            // 10. Research by Center
            $r = $this->con->query("SELECT rf.center as raw_center, COUNT(DISTINCT rf.id) as count
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE $baseCondition $filterCondition
                    AND rf.center IS NOT NULL 
                    AND TRIM(rf.center) != ''
                    AND rf.center != 'Extension (Extension)'
                GROUP BY rf.center");

            $data['byCenter'] = [];
            $mergedCenters = [];

            if ($r) {
                while ($row = $r->fetch_assoc()) {
                    $rawName = trim($row['raw_center']);
                    $count = (int)$row['count'];
                    
                    $normalizedKey = preg_replace('/\([^)]*\)/', '', $rawName);
                    $normalizedKey = strtoupper(trim(preg_replace('/\s+/', ' ', $normalizedKey)));
                    
                    if (isset($mergedCenters[$normalizedKey])) {
                        $mergedCenters[$normalizedKey]['count'] += $count;
                        
                        if (strlen($rawName) > strlen($mergedCenters[$normalizedKey]['display_name'])) {
                            $mergedCenters[$normalizedKey]['display_name'] = $rawName;
                        }
                    } else {
                        $mergedCenters[$normalizedKey] = [
                            'display_name' => $rawName,
                            'count' => $count
                        ];
                    }
                }

                foreach ($mergedCenters as $item) {
                    $data['byCenter'][] = [
                        'center' => $item['display_name'], 
                        'count' => $item['count']
                    ];
                }
                
                // Sort by count DESC and Limit to top 10
                usort($data['byCenter'], function($a, $b) {
                    return $b['count'] - $a['count'];
                });
                $data['byCenter'] = array_slice($data['byCenter'], 0, 10);
            }

            // 11. Research by Category
            $r = $this->con->query("SELECT rf.category, COUNT(DISTINCT rf.id) as count
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE $baseCondition $filterCondition
                    AND rf.category IS NOT NULL 
                    AND rf.category != ''
                GROUP BY rf.category
                ORDER BY count DESC");
            $data['byCategory'] = [];
            if ($r) {
                while ($row = $r->fetch_assoc()) {
                    $data['byCategory'][] = ['category' => $row['category'], 'count' => (int)$row['count']];
                }
            }

            // 12. Research trend by year
            $r = $this->con->query("SELECT YEAR(COALESCE(e.date, en.date)) as year, COUNT(DISTINCT rf.id) as count
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE $baseCondition $filterCondition 
                    AND YEAR(COALESCE(e.date, en.date)) IS NOT NULL
                GROUP BY YEAR(COALESCE(e.date, en.date))
                ORDER BY year ASC");
            $data['byYear'] = [];
            if ($r) {
                while ($row = $r->fetch_assoc()) {
                    $data['byYear'][] = ['year' => $row['year'], 'count' => (int)$row['count']];
                }
            }

            // 13. Extension research (TOTAL count)
            $r = $this->con->query("SELECT COUNT(DISTINCT rf.id) as total
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE $baseCondition 
                    AND (rf.center = 'Extension (Extension)' OR rf.category = 'Extension')");
            $data['extension'] = (int)($r->fetch_assoc()['total'] ?? 0);

            // 14. Extension by Campus (breakdown by campus)
            $r = $this->con->query("SELECT rf.campus, COUNT(DISTINCT rf.id) as count
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE $baseCondition 
                    AND (rf.center = 'Extension (Extension)' OR rf.category = 'Extension')
                    AND rf.campus IS NOT NULL 
                    AND rf.campus != ''
                    AND rf.campus != 'Extension'
                GROUP BY rf.campus
                ORDER BY count DESC
                LIMIT 10");
            $data['extensionByCampus'] = [];
            if ($r) {
                while ($row = $r->fetch_assoc()) {
                    $data['extensionByCampus'][] = ['campus' => $row['campus'], 'count' => (int)$row['count']];
                }
            }

            $campusByYearQuery = "SELECT YEAR(COALESCE(e.date, en.date)) as year, COUNT(DISTINCT rf.id) as total
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE $baseCondition
                    AND YEAR(COALESCE(e.date, en.date)) IS NOT NULL
                    AND rf.campus IS NOT NULL 
                    AND rf.campus != '' 
                    AND rf.campus != 'Extension'
                    AND rf.campus != 'Extension (Extension)'
                GROUP BY YEAR(COALESCE(e.date, en.date))
                ORDER BY year ASC";

            $campusResult = $this->con->query($campusByYearQuery);
            $campusMap = [];
            while ($row = $campusResult->fetch_assoc()) {
                $campusMap[$row['year']] = (int)$row['total'];
            }

            $centerByYearQuery = "SELECT YEAR(COALESCE(e.date, en.date)) as year, COUNT(DISTINCT rf.id) as total
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE $baseCondition
                    AND YEAR(COALESCE(e.date, en.date)) IS NOT NULL
                    AND rf.center IS NOT NULL 
                    AND rf.center != '' 
                    AND rf.center != 'Extension'
                    AND rf.center != 'Extension (Extension)'
                GROUP BY YEAR(COALESCE(e.date, en.date))
                ORDER BY year ASC";

            $centerResult = $this->con->query($centerByYearQuery);
            $centerMap = [];
            while ($row = $centerResult->fetch_assoc()) {
                $centerMap[$row['year']] = (int)$row['total'];
            }

            $allYears = array_unique(array_merge(array_keys($campusMap), array_keys($centerMap)));
            sort($allYears);

            $campusCenterByYear = [];
            foreach ($allYears as $year) {
                $campusCenterByYear[] = [
                    'year' => (string)$year,
                    'campus' => $campusMap[$year] ?? 0,
                    'center' => $centerMap[$year] ?? 0
                ];
            }

            $data['campusCenterByYear'] = $campusCenterByYear;
            $data['currentFilter'] = $filterLabel;

            echo json_encode(['success' => true, 'data' => $data]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}

$api = new DashboardAPI($conn);
$action = $_POST['action'] ?? 'stats';
$filter = $_POST['filter'] ?? null;

switch ($action) {
    case 'stats':
        $api->fetchStats($filter);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}