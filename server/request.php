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



if (isset($_POST['getDocRequest'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $userId = $_SESSION['userId'];
        $query = "SELECT 
doc_request.id,
doc_request.sender_id,
doc_request.docId,
account_detail.center,
account_detail.fullName,
doc_request.date
FROM doc_request
LEFT JOIN account_detail ON doc_request.sender_id=account_detail.id
WHERE doc_request.owner_id=? AND doc_request.id NOT IN (SELECT shared_docs.id FROM shared_docs )";
        $statement = $con->prepare($query);
        $statement->bind_param('s', $userId);
        $statement->execute();
        $res = $statement->get_result();
        while ($val = $res->fetch_assoc()) {
            $response[] = $val;
        }
    }
    echo json_encode($response);
}
if (isset($_POST['checkAccess'])) {
    $response = new stdClass();
    $response->status = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $userId = $_SESSION['userId'];
        $docId = $_POST['docId'];
        $query = "SELECT COUNT(*) FROM shared_docs WHERE shared_docs.doc_id=? AND shared_docs.user_request_id=?";
        $statement = $con->prepare($query);
        $statement->bind_param('ss', $docId, $userId);
        $statement->execute();
        $status = $statement->get_result()->fetch_row();

        if ($status[0] > 0) {
            $response->status = 'allowed';
        } else {
            $querys = "SELECT COUNT(*) FROM doc_request WHERE doc_request.docId=? AND doc_request.sender_id=?";
            $statement = $con->prepare($querys);
            $statement->bind_param('ss', $docId, $userId);
            $ss = $statement->execute();
            $status = $statement->get_result()->fetch_row();
            if ($status[0] > 0) {
                $response->status = "requested";
            }
        }
    }
    echo json_encode($response);
}

if (isset($_POST['sendRequest'])) {
    $response = new stdClass();
    $response->status = false;
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "INSERT INTO doc_request (doc_request.sender_id,doc_request.owner_id,doc_request.docId)
SELECT ?,researchfile.senderid,? FROM researchfile WHERE researchfile.id=?";
        $userId = $_SESSION['userId'];
        $docId = $_POST['docId'];
        $statement = $con->prepare($query);
        $statement->bind_param("sss", $userId, $docId, $docId);
        $status = $statement->execute();
        if ($status) {
            $response->status = true;
            $response->message = "Request sent..!";
        } else {
            $response->message = $statement->errno;
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['allowAccess'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $requestId = $_POST['requestId'];
        $userId = $_SESSION['userId'];
        $query = "INSERT INTO shared_docs(shared_docs.id,shared_docs.owner_id,shared_docs.doc_id,shared_docs.user_request_id)
SELECT doc_request.id,?,doc_request.docId,doc_request.sender_id FROM doc_request WHERE doc_request.id=?";
        $statement = $con->prepare($query);
        $statement->bind_param("ss", $userId, $requestId);
        $status = $statement->execute();
        if ($status) {
            $response->status = true;
            $response->message = "Success..!";
        } else {
            $response->message = $statement->error;
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['reqAllowedList'])) {
    $response = new stdClass();
    $response->docs = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $userId = $_SESSION['userId'];
        $query = "SELECT shared_docs.id,shared_docs.doc_id,shared_docs.date,researchfile.event,researchfile.title,researchfile.file FROM shared_docs
LEFT JOIN researchfile ON shared_docs.doc_id=researchfile.id
WHERE shared_docs.owner_id=? 
GROUP BY shared_docs.doc_id ";
        $statement = $con->prepare($query);
        $statement->bind_param('s', $userId);
        $statement->execute();
        $res = $statement->get_result();
        while ($val = $res->fetch_assoc()) {
            $document = new stdClass();
            $document->reqId = $val['id'];
            $document->event = $val['event'];
            $document->title = $val['title'];
            $document->file = $val['file'];
            $document->docId = $val['doc_id'];
            $document->allowedUser = [];
            $alUseQuery = "SELECT shared_docs.user_request_id,account_detail.fullName FROM shared_docs
LEFT JOIN account_detail ON shared_docs.user_request_id=account_detail.id
WHERE shared_docs.doc_id=?";
            $stm = $con->prepare($alUseQuery);
            $stm->bind_param('s', $val['doc_id']);
            $stm->execute();
            $rs = $stm->get_result();
            while ($v = $rs->fetch_assoc()) {
                $document->allowedUser[] = $v['fullName'];
            }
            $response->docs[] = $document;
        }

    }
    echo json_encode($response);
}

if (isset($_POST['deleteFileAccess'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docId = $_POST['docId'];
        $query = "DELETE FROM doc_request WHERE doc_request.docId=?";
        $statement = $con->prepare($query);
        $statement->bind_param("s", $docId);
        if ($statement->execute()) {
            $response->status = true;
        } else {
            $response->message = $statement->error;
        }

    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}

if (isset($_POST['declinedFileRequest'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $reqId = $_POST['reqId'];
        $query = "DELETE FROM doc_request WHERE  doc_request.id=?";
        $statement = $con->prepare($query);
        $statement->bind_param("s", $reqId);
        if ($statement->execute()) {
            $response->status = true;
        } else {
            $response->message = $statement->error;
        }

    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
}