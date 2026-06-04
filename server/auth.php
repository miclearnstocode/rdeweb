<?php
// Start output buffering to prevent any accidental output
ob_start();

include ('db.php');

if(!isset($_SESSION['login'])){
    ob_clean();
    header('location:/account/Login?');
    exit();
}

if(isset($_SESSION['login'])){

    if($_SESSION['login']){

        // Check for Extension Chair first (before other cases)
        if(isset($_SESSION['isExtensionChair']) && $_SESSION['isExtensionChair'] === true) {
            ob_clean();
            header("location:/extension-chair/submittedDocs/submittedFiles");
            exit();
        }
        
        // Check for Research Chair
        if(isset($_SESSION['isResearchChair']) && $_SESSION['isResearchChair'] === true) {
            ob_clean();
            header("location:/research-chair/submittedDocs/submittedFiles");
            exit();
        }

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
                
            case 'EXTENSION':
                // Extension users (non-chair) go to /extension
                ob_clean();
                header("location:/extension");
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
                
            default:
                // If no matching case and not Extension/Research Chair, logout
                ob_clean();
                session_destroy();
                header('location:/account/Login?');
                exit();
                break;
        }

    }else{
        ob_clean();
        header('location:/account/Login?');
        exit();
    }
}