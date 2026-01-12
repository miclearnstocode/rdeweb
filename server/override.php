<?php
include_once('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

if(isset($_POST['docsAll'])){
    $response=[];
    if($con = new mysqli($host, $username, $pass, $dbName)){
        $query="SELECT researchfile.id,
researchfile.author,
researchfile.title,
researchfile.campus,
researchfile.category 
FROM researchfile 
LEFT JOIN endorsement ON researchfile.endorsementid=endorsement.id
WHERE researchfile.event=? AND endorsement.status='accepted'";
        $statement = $con->prepare($query);
        $statement->bind_param("s",$_POST['eventName']);
        $statement->execute();
        $result=$statement->get_result();
        while ($row = $result->fetch_assoc()){
            $response[]=$row;
        }
    }
    echo json_encode($response);
}