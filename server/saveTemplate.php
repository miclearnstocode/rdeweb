<?php
include_once('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
$con = new mysqli($host, $username, $pass, $dbName);
date_default_timezone_set('Asia/Manila');




if(isset($_POST['saveTemplate'])){
    if($con){
       // $user=unserialize($_SESSION['isLog']);
        $id=$_SESSION['userId'];
        $response=new stdClass();
        $response->message='';
        $response->status=false;
        $name=$_POST['name'];
        $type=$_POST['type'];
      //  $source=mysqli_escape_string($con,$_POST['source']);
        $source=$_POST['source'];
        $date=date('d').'/'.date('m').'/'.date('y');
        $query="INSERT INTO `systemfiles`(`id`, `name`, `type`, `source`, `date`) VALUES ('$id','$name','$type','$source','$date')";
        if($con->query($query)){
            $response->status=true;
            $response->message="Save Successfully..!";
        }else{
            $response->message="Failed to save.!";
        }
        echo json_encode($response);
    }
}




if(isset($_POST['systemFiles'])){
    $res=[];
    if($con){
       // $user=unserialize($_SESSION['isLog']);
        $id= $_SESSION['userId'];
        $query="SELECT `name`, `type`, `source`, `date` FROM `systemfiles` WHERE `id`='$id'";
        foreach ($con->query($query) as $val){
            $data=new stdClass();
            $data->name=$val['name'];
            $data->type=$val['type'];
            $data->source=$val['source'];
            $data->date=$val['date'];
            $res[]=$data;
        }
    }
    echo json_encode($res);
}
