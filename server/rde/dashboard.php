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

            // 1. Total accepted research (unique titles)
            $r = $this->con->query("SELECT COUNT(DISTINCT rf.title) as total
                FROM researchfile rf
                JOIN endorsement e ON rf.endorsementid = e.id
                WHERE e.status = 'accepted'");
            $data['totalAccepted'] = (int)($r->fetch_assoc()['total'] ?? 0);

            // 2. Proposed (accepted, with valid event_id)
            $r = $this->con->query("SELECT COUNT(DISTINCT rf.id) as total
                FROM researchfile rf
                JOIN endorsement e ON rf.endorsementid = e.id
                WHERE e.status = 'accepted' AND rf.event_id IS NOT NULL AND rf.event_id != 0");
            $data['totalProposed'] = (int)($r->fetch_assoc()['total'] ?? 0);

            // 3. In-House Reviews
            $r = $this->con->query("SELECT COUNT(DISTINCT rf.id) as total
                FROM researchfile rf
                JOIN endorsement e ON rf.endorsementid = e.id
                WHERE e.status = 'accepted' AND rf.event LIKE '%In-House%'");
            $data['inHouseReview'] = (int)($r->fetch_assoc()['total'] ?? 0);

            // 4. Symposium
            $r = $this->con->query("SELECT COUNT(DISTINCT rf.id) as total
                FROM researchfile rf
                JOIN endorsement e ON rf.endorsementid = e.id
                WHERE e.status = 'accepted' AND rf.event LIKE '%Symposium%'");
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

            // 9. Research by campus (accepted)
            $r = $this->con->query("SELECT rf.campus, COUNT(DISTINCT rf.id) as count
                FROM researchfile rf
                JOIN endorsement e ON rf.endorsementid = e.id
                WHERE e.status = 'accepted' AND rf.campus IS NOT NULL AND rf.campus != ''
                GROUP BY rf.campus
                ORDER BY count DESC
                LIMIT 10");
            $data['byCampus'] = [];
            if ($r) {
                while ($row = $r->fetch_assoc()) {
                    $data['byCampus'][] = ['campus' => $row['campus'], 'count' => (int)$row['count']];
                }
            }

            // 10. Research by category (accepted)
            $r = $this->con->query("SELECT rf.category, COUNT(DISTINCT rf.id) as count
                FROM researchfile rf
                JOIN endorsement e ON rf.endorsementid = e.id
                WHERE e.status = 'accepted' AND rf.category IS NOT NULL AND rf.category != ''
                GROUP BY rf.category
                ORDER BY count DESC");
            $data['byCategory'] = [];
            if ($r) {
                while ($row = $r->fetch_assoc()) {
                    $data['byCategory'][] = ['category' => $row['category'], 'count' => (int)$row['count']];
                }
            }

            // 11. Research trend by year (from endorsement.date)
            $r = $this->con->query("SELECT YEAR(e.date) as year, COUNT(DISTINCT rf.id) as count
                FROM researchfile rf
                JOIN endorsement e ON rf.endorsementid = e.id
                WHERE e.status = 'accepted' AND YEAR(e.date) IS NOT NULL
                GROUP BY YEAR(e.date)
                ORDER BY year ASC");
            $data['byYear'] = [];
            if ($r) {
                while ($row = $r->fetch_assoc()) {
                    $data['byYear'][] = ['year' => $row['year'], 'count' => (int)$row['count']];
                }
            }

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
