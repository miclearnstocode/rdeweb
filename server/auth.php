<?php
// Start output buffering to prevent any accidental output
ob_start();

include ('db.php');

if(!isset($_SESSION['login'])){
    ob_clean();
    header('location:/account/Login?');
    exit();
}

/*

                           $_SESSION['login']=true;

                            $_SESSION['userId']=$id;

                            $_SESSION['userName']=$userName;

                            $_SESSION['userType']=$_POST['userType'];

                            $_SESSION['userFulname']=$fullName;

                            $_SESSION['userEsign']=json_encode($signature);

                            $_SESSION['userOffice']=$campus;

                            $_SESSION['userEmail']=$emailAdd;

                            $_SESSION['userType']=$userType;

 */

/* Checking if the user is logged in. If the user is logged in, it will redirect the user to the appropriate page. */

if(isset($_SESSION['login'])){

   // $session=unserialize($_SESSION['isLog']);

    if($_SESSION['login']){

        switch ($_SESSION['userType']){

            case 'ADMIN':
                ob_clean();
                header('location:/admin/addAccount');
                exit();
                break;

            case 'CAPSUUSERS':
                ob_clean();
                header("location:/user/create/share");
                exit();
                break;

            case 'EVALUATOR':
                ob_clean();
                header("location:/evaluator");
                exit();
                break;

            case 'RESEARCHER':
                ob_clean();
                header("location:/researcher");
                exit();
                break;

            case 'RDEOFFICE':
                ob_clean();
                header("location:/rdeOffice/communication");
                exit();
                break;
            case 'EXTERNAL':
                ob_clean();
                header("location:/external/users/a/b/c/b/c/d/e/v1");
                exit();
                break;
        }

    }else{
        ob_clean();
        header('location:/account/Login?');
        exit();
    }

}

