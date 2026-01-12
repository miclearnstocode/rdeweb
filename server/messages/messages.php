<?php
include_once('server/db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
$con = new mysqli($host, $username, $pass, $dbName);

if(isset($_POST['document'])){
    $messages=[];

    if($con){
        $data=unserialize($_SESSION['isLog']);
        $sender=$data->getAccountName();
        $query="SELECT   `title`, `description`, `status`, `source`, `year`, `month`, `day`, `idocs` FROM `files` WHERE `sender`='$sender'";
        foreach($con->query($query) as $val)
        {
            $content=new stdClass();
            $content->title=$val['title'];
            $content->description=$val['description'];
            $content->status=$val['status'];
            $content->url=$val['source'];
            $content->year=$val['year'];
            $content->month=$val['month'];
            $content->day=$val['day'];
            $content->idocs=$val['idocs'];
            $messages[]=$content;
        }
        echo json_encode($messages);
    }
}

