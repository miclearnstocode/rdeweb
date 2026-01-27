<?php

include('db.php');

/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

// this post changes the center from category so to create a new list of criteria
if(isset($_POST['requestCat'])){
    $response=[];
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $query="SELECT * FROM `center`";
        $statement=$con->prepare($query);
        $statement->execute();
        $result=$statement->get_result();
        while ($val=$result->fetch_assoc()){
            $response[]=$val;
        }
    }
    echo json_encode($response);
}

if(isset($_POST['getCatName'])){
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $query="SELECT center.name FROM center WHERE center.id=?";
        $statement=$con->prepare($query);
        $statement->bind_param('s',$_POST['catId']);
        $statement->execute();
        $result=$statement->get_result();
        while ($val=$result->fetch_assoc()){
           echo $val['name'];
        }
    }

}

if(isset($_POST['changeCat'])){
    $response= new stdClass();
    $response->status=false;
    $response->message='';
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $statement=$con->prepare("UPDATE researchfile SET researchfile.category=? WHERE researchfile.id=?");
        $statement->bind_param("ss",$_POST['newCategory'],$_POST['docId']);
        $state=$statement->execute();
        if($state){
            $response->status=true;
        }else{
            $response->message=$statement->error;
        }
    }
    echo json_encode($response);
}
