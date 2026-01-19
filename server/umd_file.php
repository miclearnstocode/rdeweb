<?php
include ('db.php');

/** @var TYPE_NAME $username */

/** @var TYPE_NAME $host */

/** @var TYPE_NAME $pass */

/** @var TYPE_NAME $dbName */

/** @var TYPE_NAME $rdeEmail */

/** @var TYPE_NAME $emailPassword */

if(isset($_POST['category'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='';
    $category=$_POST['category'];
    $userId=$_SESSION['userId'];
    $eventName=$_POST['event_name'];
    $path="../server/umdFiles/";

    $file_url=$path.$userId.time().$_FILES['file_url']['name'];
    $title=$_POST['title'];
    if($con=new mysqli($host,$username,$pass,$dbName)){
        if (move_uploaded_file($_FILES['file_url']['tmp_name'],$file_url)) {
            $statement=$con->prepare("INSERT INTO umd_files (umd_files.user_id,umd_files.title,umd_files.file_url,umd_files.category,umd_files.event_id) VALUES (?,?,?,?,?)");
            $statement->bind_param("sssss",$userId,$title,$file_url,$category,$eventName);
            $status=$statement->execute();
            if($status){
                $response->status=true;
            }else{
                $response->message=$statement->error;
            }
        }else{
            $response->message='Failed to upload file';
        }
    }else{
        $response->message='Connection failed...';
    }
    echo json_encode($response);
}

if(isset($_POST['get_umd_file'])){

    $response=[];
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $query="SELECT 
umd_files.id,
umb_user.account_name,
umb_user.email,
umd_files.title,
umd_files.file_url,
umd_files.category
FROM umd_files
LEFT JOIN umb_user ON umd_files.user_id=umb_user.id";
        $statement=$con->prepare($query);
        $statement->execute();
        $result= $statement->get_result();
        while ($val=$result->fetch_assoc()){
            $response[]=$val;
        }
    }
    echo json_encode($response);
}

if(isset($_POST['fileId'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='';
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $statement=$con->prepare("DELETE FROM umd_files WHERE  umd_files.id=?");
        $statement->bind_param("s",$_POST['fileId']);
        $stat=$statement->execute();
        if($stat){
            $response->status=true;
        }else{
            $response->message=$statement->error;
        }
    }
    echo json_encode($response);
}