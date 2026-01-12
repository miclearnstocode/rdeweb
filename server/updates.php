<?php
include_once('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */


if (isset($_POST['updateName'])) {
    $response = new stdClass();
    $response->status = false;
    $response->messages = 'Unable connected...!';
    $data = unserialize($_SESSION['isLog']);
    $id = $data->getId();
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $response->messages = 'Connected Successfully..!';
        //UPDATE `account` SET `data`='[value-8]' WHERE `id`='$id'
        $fullName = $_POST['fullname'];
        $query = "UPDATE `account` SET `fullname`='$fullName' WHERE `id`='$id'";
        if ($con->query($query)) {
            $response->status = true;
            $response->messages = 'Updated successfully..!';
        }
    }
    echo json_encode($response);
}

if (isset($_POST['deleteUser'])) {
    $response = new stdClass();
    $response->status = false;
    $response->messages = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $userId = $_POST['userID'];

        $query = "DELETE FROM account_detail WHERE account_detail.id=?";
        $statement= $con->prepare($query);
        $statement->bind_param('s',$userId);
        $statement->execute();
        $result= $statement->execute();
        if($result){

            $response->status = true;
        }else{
            $response->messages = 'Failed to delete ...! ' . $con->error;
        }

    } else {
        $response->messages = 'Unable to connect...!' . $con->error;
    }
    echo json_encode($response);
}


if (isset($_POST['addOffice'])) {
    $response = new stdClass();
    $response->status = false;
    $response->messages = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $officeName = $_POST['officeName'];
        $abbrev = $_POST['abbrev'];
        $timeStamp = round(microtime(true) * 1000) . '';
        $query = "INSERT INTO `office`( `id`,`officename`, `abbrev`) VALUES ('$timeStamp','$officeName','$abbrev')";
        if ($con->query($query)) {
            $response->status = true;
        } else {
            $response->messages = 'Failed save ...! ' . $con->error;
        }
    } else {
        $response->messages = 'Unable to connect...!' . $con->error;
    }
    echo json_encode($response);
}
if (isset($_POST['getOffice'])) {
    $list = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT * FROM `office` ";
        //`id`, `officename`, `abbrev`, `email`
        foreach ($con->query($query) as $val) {
            $data = new stdClass();
            $data->officeName = $val['officename'];
            $data->abbrevation = $val['abbrev'];
            $list[] = $data;
        }
    }
    echo json_encode($list);
}