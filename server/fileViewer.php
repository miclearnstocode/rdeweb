<?php
include_once('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
$con = new mysqli($host, $username, $pass, $dbName);


if(isset($_POST['view'])) {
    $response=[];
    if($con){
      //  $data=(isset($_SESSION['isLog']))? unserialize($_SESSION['isLog']):"";
        $id=(isset($_SESSION['login']))?$_SESSION['userId']:"";
        //SELECT `id`, `sender`, `doctype`, `docid`, `title`, `description`, `status`, `source`, `year`, `month`, `day`, `idocs` FROM `files` WHERE 1
        $query="SELECT * FROM `files`";
        foreach($con->query($query) as $val){
            if($id===$val['userid']){
                $file=new stdClass();
                $file->id=$val['id'];
                $file->sender=$val['sender'];
                $file->description=$val['description'];
                $file->url=$val['url'];
                $file->date=$val['date'];
                $response[]=$file;
            }
        }

    }
    echo json_encode($response);

}
