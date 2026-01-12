<?php
include_once('server/db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
$con = new mysqli($host, $username, $pass, $dbName);
if(isset($_POST['receive'])){
    $response=[];
    if($con){
        $user=unserialize($_SESSION['isLog']);
        $id=$user->getId();
        $query="SELECT  `sender`, `title`, `description`, `status`, `source`, `year`, `month`, `day`, `idocs` FROM `files` WHERE `id`='$id'";
        $selectQuery="SELECT * FROM `files`";

        foreach ($con->query($selectQuery) as $val)
        {
            $idList=json_decode($val['id']);
            foreach ($idList as $v){
                if($v===$id){
                    $data=new stdClass();
                    $data->sender=$val['sender'];
                    $data->date=$val['day'].'/'.$val['month'].'/'.$val['year'];
                    $data->title=$val['title'];
                    $data->source=$val['source'];
                    $data->uniqueid=$val['idocs'];
                    $response[]=$data;
                }
                break;
            }

        }

    }
    echo json_encode($response);
}