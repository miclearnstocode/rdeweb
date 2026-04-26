<?php
require 'server/db.php';
echo "--- Utilization Programs ---\n";
$res = $conn->query("SELECT id, research_id, endorsement_id, utilizationType FROM utilization_programs");
while($row = $res->fetch_assoc()) {
    print_r($row);
}
echo "\n--- Research Files (IDs from above) ---\n";
$res = $conn->query("SELECT id, title, event FROM researchfile WHERE id IN (SELECT research_id FROM utilization_programs WHERE research_id IS NOT NULL)");
while($row = $res->fetch_assoc()) {
    print_r($row);
}
