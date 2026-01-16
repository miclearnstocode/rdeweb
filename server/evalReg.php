<?php

// Set header FIRST before any output
header('Content-Type: application/json; charset=utf-8');

// Start output buffering to catch any notices/warnings
ob_start();

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include('db.php');

/** @var TYPE_NAME $host */

/** @var TYPE_NAME $username */

/** @var TYPE_NAME $pass */

/** @var TYPE_NAME $dbName */





if (isset($_POST['evaluatorRegister'])) {

    $responce = new stdClass();

    $responce->status = false;

    $responce->message = 'Server connection failed..!';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        //INSERT INTO `evaluator`(`id`, `fullname`, `username`, `password`, `category`) VALUES ('','','','','')

        $responce = new stdClass();

        $user = $_POST['username'];

        $pass = password_hash($_POST['password'], PASSWORD_DEFAULT);

        $fullname = $_POST['fullname'];

        $category = $_POST['category'];

        $center = isset($_POST['center']) ? $_POST['center'] : null;

        $eventType=$_POST['eventTYpe'];


        $id = round(microtime(true) * 1000) . '';

        $query = "INSERT INTO `evaluator`( `fullname`, `username`, `password`, `category`) VALUES ('$fullname','$user','$pass','$category')";

        // Updated query to include center_id
        if ($center) {
            $newQuery="INSERT INTO `evaluator` 

    (evaluator.fullname,evaluator.username,evaluator.password,evaluator.category,evaluator.eventid,evaluator.center_id) 

VALUES ('$fullname','$user','$pass','$category','$eventType','$center')";
        } else {
            $newQuery="INSERT INTO `evaluator` 

    (evaluator.fullname,evaluator.username,evaluator.password,evaluator.category,evaluator.eventid) 

VALUES ('$fullname','$user','$pass','$category','$eventType')";
        }

        if ($con->query($newQuery)) {

            $responce->status = true;

            $responce->message = 'Save successfully..!';

        } else {

            $responce->message = $con->error;

        }

    }

    ob_clean();
    echo json_encode($responce);
    ob_end_flush();
    exit();

}



//  form.append('auth','login')

//        form.append('username',userName.value)

//        form.append('password',passWord.value)

//        form.append('userType',userType.value.toUpperCase())



if (isset($_POST['auth'])) {

    //  $_SESSION['isLog']=serialize(new Auth(true,$_POST['userType'],$username,'office',$id,$acnem));

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $username = $_POST['username'];

        $password = $_POST['password'];

        $newQuery="SELECT

evaluator.id,

evaluator.fullname,

evaluator.password,

evaluator.center_id,

center.name,

evaluator.eventid,

event_list.name

FROM

evaluator

LEFT JOIN

center

ON center.id=evaluator.center_id

LEFT JOIN

event_list

ON event_list.id=evaluator.eventid

WHERE evaluator.username=?";

        if ($statement = $con->prepare($newQuery)) {

            $statement->bind_param("s", $username);

            $statement->execute();

            $statement->store_result();

            if ($statement->num_rows > 0) {

                $statement->bind_result($id, $acnem, $pass, $centerId, $centerName, $evId,$evName);

                $statement->fetch();

                if (password_verify($password, $pass)) {

                    $response->message = '/evaluator';

                    $_SESSION['isLog'] = serialize(new Auth(true, $_POST['userType'], $username, $centerName, $id, $acnem,'',$acnem,''));

                    $_SESSION['eventTYpe']=$evName;

                    $_SESSION['eventId']=$evId;

                    $_SESSION['login']=true;

                    $_SESSION['userId']=$id;

                    $_SESSION['userName']=$username;

                    $_SESSION['userType']=$_POST['userType'];

                    $_SESSION['userFulname']=$acnem;

                    $_SESSION['userEsign']='';

                    $_SESSION['userOffice']='CENTRAL OFFICE';

                    $_SESSION['center']=$centerName;

                    $_SESSION['centerId']=$centerId;

                    $_SESSION['userEmail']='';

                    $_SESSION['userType']='EVALUATOR';



                    $response->status = true;

                } else {

                    $response->message = 'Password is incorrect';

                }

            } else {

                $response->message = 'ID/Username not found..!';

            }

        } else {

            $response->message = 'Something went wrong..!';

        }

    }

    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();

}

if(isset($_POST['evaluatorsList'])){

    $res=[];

    if($con = new mysqli($host, $username, $pass, $dbName)){

        foreach ($con->query("SELECT * FROM `evaluator`") as $val){


            $res[]=$val;

        }

    }

    ob_clean();
    echo json_encode($res);
    ob_end_flush();
    exit();

}



if(isset($_POST['deleteEval'])){

    $res=new stdClass();

    $res->status=false;

    $res->message='';

    $userId=$_POST['id'];

    if($con = new mysqli($host, $username, $pass, $dbName)){

        if($con->query("DELETE FROM `evaluator` WHERE `id`='$userId'")){

            $res->status=true;

            $res->message="Deleted...!";

        }else{

            $res->message=$con->error;

        }

    }else{

        $res->message=$con->error;

    }

    ob_clean();
    echo json_encode($res);
    ob_end_flush();
    exit();

}





// Endpoint to fetch centers filtered by category
if(isset($_POST['getCenters'])){

    $res=[];

    if($con = new mysqli($host, $username, $pass, $dbName)){

        // Return all centers (no longer filtered by category)
        $query = "SELECT id, code, name FROM center ORDER BY name";
        $result = $con->query($query);
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $res[] = $row;
            }
        }

    }

    ob_clean();
    echo json_encode($res);
    ob_end_flush();
    exit();

}

// Endpoint to fetch categories filtered by center
if(isset($_POST['getCategoriesByCenter'])){

    $res=[];

    if($con = new mysqli($host, $username, $pass, $dbName)){

        // Return all categories (no longer filtered by center)
        $query = "SELECT id, name FROM category ORDER BY name";
        $result = $con->query($query);
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $res[] = $row;
            }
        }

    }

    ob_clean();
    echo json_encode($res);
    ob_end_flush();
    exit();

}

if(isset($_POST['evalLeb'])){
    $res = new stdClass();
    
    // Get event info
    $res->event = $_SESSION['eventTYpe'] ?? '';
    $res->eventId = $_SESSION['eventId'] ?? '';
    
    // Get category/center info with code
    $centerId = $_SESSION['centerId'] ?? '';
    $category = $_SESSION['center'] ?? '';
    
    // If we have centerId, fetch the full center name with code from database
    if (!empty($centerId) && $con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT name, code FROM center WHERE id = ?";
        $stmt = $con->prepare($query);
        $stmt->bind_param("s", $centerId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            // Format: "Coconut Research and Development Center (Coco RDC)"
            $category = $row['name'] . " (" . $row['code'] . ")";
        }
    }
    
    $res->category = $category;
    
    ob_clean();
    echo json_encode($res);
    ob_end_flush();
    exit();
}