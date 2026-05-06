<?php
$c = new mysqli('localhost', 'root', '', 'capsued_rdesystem');
if ($c->connect_error) die("Connect Error: " . $c->connect_error);
$r = $c->query("SELECT DATABASE() as db, COUNT(*) as count FROM researchfile");
print_r($r->fetch_assoc());
$r = $c->query("SELECT COUNT(*) as count FROM endorsement WHERE status = 'accepted'");
echo "Endorsements accepted: " . $r->fetch_assoc()['count'] . "\n";
$r = $c->query("SELECT COUNT(*) as count FROM event_list WHERE status = 1");
echo "Active events: " . $r->fetch_assoc()['count'] . "\n";
