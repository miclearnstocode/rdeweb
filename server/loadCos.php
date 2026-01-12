<?php

include ('db.php');

/** @var TYPE_NAME $host */

/** @var TYPE_NAME $username */

/** @var TYPE_NAME $pass */

/** @var TYPE_NAME $dbName */

if(isset($_POST['loadCos'])){

    $result=[];

    if($con=new mysqli($host,$username,$pass,$dbName)){
        $useId=$_SESSION['userId'];
        $query="SELECT account_detail.campus,

account_detail.id,

account_detail.email,

capsu_user.username,

account_detail.fullName

FROM account_detail

LEFT JOIN capsu_user ON account_detail.id=capsu_user.id
WHERE account_detail.id <> '$useId' 
";

        foreach ($con->query($query) as $val){

            if($val['username']!==null){

                $res=new stdClass();

                $res->username=$val['username'];

                $res->fullname=$val['fullName'];

                $res->id=$val['id'];

                $res->email=$val['email'];

                $result[]=$res;

            }

        }

    }

    echo json_encode($result);

}