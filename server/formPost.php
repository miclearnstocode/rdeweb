<?php
$host='localhost';
$username='capsued_rde';
$pass='capsurde123456';
$dbName='capsued_rdesystem';

if(true){
    $response=new stdClass();
    $response->status=false;
    $response->message='no';
    if($con=new mysqli($host,$username,$pass,$dbName)){
        echo "done";
    }
}