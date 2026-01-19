<?php
if(isset($_POST['codeSession'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='';
    $response->userName=$_SESSION['userName'];
    if($_SESSION['code_expire']>300){
        if(isset($_SESSION['rdeSecurityCode'])){
            if($_SESSION['rdeSecurityCode']*1===$_POST['securityCode']*1){
                $response->status=true;
                $_SESSION['code_expire']=0;
            }else{
                $response->message='Code is incorrect';
            }
        }
    }else{
        $response->message='Code was expired..!';
    }
    echo json_encode($response);
}