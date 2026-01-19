<?php

include('db.php');

/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

if(isset($_POST['requestCat'])){
    $response=[];
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $query="SELECT * FROM `category`";
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
        $query="SELECT category.name FROM category WHERE category.id=?";
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
