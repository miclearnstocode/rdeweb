<?php
require_once(__DIR__ . '/../db.php');

header('Content-Type: application/json');

class DashboardAPI {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function fetchStats() {
        try {
            $data = [];

            // 1. Total accepted/active research (unique titles)
            $r = $this->con->query("SELECT COUNT(DISTINCT rf.id) as total
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE (en.status = 'accepted' OR e.status = 1)");
            $data['totalAccepted'] = (int)($r->fetch_assoc()['total'] ?? 0);

            // 2. Proposed (with valid event_id)
            $r = $this->con->query("SELECT COUNT(DISTINCT rf.id) as total
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE (en.status = 'accepted' OR e.status = 1) AND rf.event_id IS NOT NULL AND rf.event_id != 0");
            $data['totalProposed'] = (int)($r->fetch_assoc()['total'] ?? 0);

            // 3. In-House Reviews
            $r = $this->con->query("SELECT COUNT(DISTINCT rf.id) as total
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE (en.status = 'accepted' OR e.status = 1) AND (rf.event LIKE '%In-House%' OR (e.name LIKE '%In-House%' AND rf.event_id != 0))");
            $data['inHouseReview'] = (int)($r->fetch_assoc()['total'] ?? 0);

            // 4. Symposium
            $r = $this->con->query("SELECT COUNT(DISTINCT rf.id) as total
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE (en.status = 'accepted' OR e.status = 1) AND (rf.event LIKE '%Symposium%' OR (e.name LIKE '%Symposium%' AND rf.event_id != 0))");
            $data['symposium'] = (int)($r->fetch_assoc()['total'] ?? 0);

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
                WHERE (en.status = 'accepted' OR rf.status = 'accepted') 
                    AND rf.campus IS NOT NULL 
                    AND rf.campus NOT LIKE '%Center%'
                    AND rf.campus != '' 
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
            $r = $this->con->query("SELECT rf.center, COUNT(DISTINCT rf.id) as count
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE (en.status = 'accepted' OR rf.status = 'accepted') 
                    AND rf.center IS NOT NULL 
                    AND rf.center != 'Extension (Extension)'
                GROUP BY rf.center  
                ORDER BY count DESC
                LIMIT 10");
            $data['byCenter'] = [];
            if ($r) {
                while ($row = $r->fetch_assoc()) {
                    $data['byCenter'][] = ['center' => $row['center'], 'count' => (int)$row['count']];
                }
            }

            // 11. Research by Category
            $r = $this->con->query("SELECT rf.category, COUNT(DISTINCT rf.id) as count
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE (en.status = 'accepted' OR e.status = 1) 
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
                WHERE (en.status = 'accepted' OR e.status = 1) AND YEAR(COALESCE(e.date, en.date)) IS NOT NULL
                GROUP BY YEAR(COALESCE(e.date, en.date))
                ORDER BY year ASC");
            $data['byYear'] = [];
            if ($r) {
                while ($row = $r->fetch_assoc()) {
                    $data['byYear'][] = ['year' => $row['year'], 'count' => (int)$row['count']];
                }
            }

            // 13. Extension research
            $r = $this->con->query("SELECT COUNT(DISTINCT rf.id) as total
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE (en.status = 'accepted' OR e.status = 1) 
                    AND  rf.center = 'Extension (Extension)'");
            $data['extension'] = (int)($r->fetch_assoc()['total'] ?? 0);
                        
            // Get ALL campuses total per year (sum of ALL campuses)
            $campusByYearQuery = "SELECT YEAR(COALESCE(e.date, en.date)) as year, COUNT(DISTINCT rf.id) as total
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE (en.status = 'accepted' OR e.status = 1) 
                    AND YEAR(COALESCE(e.date, en.date)) IS NOT NULL
                    AND rf.campus IS NOT NULL 
                    AND rf.campus != '' 
                    AND rf.campus != 'Extension'
                GROUP BY YEAR(COALESCE(e.date, en.date))
                ORDER BY year ASC";

            $campusResult = $this->con->query($campusByYearQuery);
            $campusMap = [];
            while ($row = $campusResult->fetch_assoc()) {
                $campusMap[$row['year']] = (int)$row['total'];
            }

            // Get ALL centers total per year (sum of ALL centers)
            $centerByYearQuery = "SELECT YEAR(COALESCE(e.date, en.date)) as year, COUNT(DISTINCT rf.id) as total
                FROM researchfile rf
                LEFT JOIN endorsement en ON rf.endorsementid = en.id
                LEFT JOIN event_list e ON rf.event_id = e.id
                WHERE (en.status = 'accepted' OR e.status = 1) 
                    AND YEAR(COALESCE(e.date, en.date)) IS NOT NULL
                    AND rf.center IS NOT NULL 
                    AND rf.center != '' 
                    AND rf.center != 'Extension'
                GROUP BY YEAR(COALESCE(e.date, en.date))
                ORDER BY year ASC";

            $centerResult = $this->con->query($centerByYearQuery);
            $centerMap = [];
            while ($row = $centerResult->fetch_assoc()) {
                $centerMap[$row['year']] = (int)$row['total'];
            }

            // Combine into single array with ALL years
            $allYears = array_unique(array_merge(array_keys($campusMap), array_keys($centerMap)));
            sort($allYears);

            $campusCenterByYear = []; // <-- THIS WAS MISSING
            foreach ($allYears as $year) {
                $campusCenterByYear[] = [
                    'year' => (string)$year,
                    'campus' => $campusMap[$year] ?? 0,
                    'center' => $centerMap[$year] ?? 0
                ];
            }

            $data['campusCenterByYear'] = $campusCenterByYear; // <-- NOW THIS WILL WORK

            echo json_encode(['success' => true, 'data' => $data]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}

$api = new DashboardAPI($conn);
$action = $_POST['action'] ?? 'stats';

switch ($action) {
    case 'stats':
        $api->fetchStats();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}