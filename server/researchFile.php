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

    /** @var TYPE_NAME $rdeEmail */

    /** @var TYPE_NAME $emailPassword */
    include_once('Mailer/mailTemplate.php');
    include_once('Mailer/MailSender.php');
date_default_timezone_set('Asia/Manila');



if (isset($_POST['uploadResearch'])) {



    $campus = $_SESSION['userOffice'];

    $serderId = $_SESSION['userId'];

    $response = new stdClass();

    $response->message = '';

    $response->serverMessage = "";

    $response->status = false;

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $eventType = $_POST['eventType'];

        $checkQuery = "SELECT COUNT(*) FROM event_list WHERE event_list.name=? AND event_list.dead_line>CURRENT_TIMESTAMP";

        $checkStatement = $con->prepare($checkQuery);

        $checkStatement->bind_param("s", $eventType);

        $checkStatement->execute();

        $resss = $checkStatement->get_result()->fetch_row();

        if ($resss[0] !== 0) {

            $userDisignation = $_SESSION['userDesignation'];

         //   if ($userDisignation === 'Research Chair' || $userDisignation === 'Extension Chair') {

            if(true){

                $countResearch = count($_FILES['researchDocs']['name']);

                // Create base directory if it doesn't exist
                $baseDir = $_SERVER['DOCUMENT_ROOT'] . '/client/Files/endorsement/';
                if (!is_dir($baseDir)) {
                    mkdir($baseDir, 0755, true);
                }

                // Create user subdirectory if it doesn't exist
                $userDir = $baseDir . $serderId . '/';
                if (!is_dir($userDir)) {
                    mkdir($userDir, 0755, true);
                }

                $endorsementFile = $userDir . $_FILES['uploadedFileEndorsement']['name'];

                if (move_uploaded_file($_FILES['uploadedFileEndorsement']['tmp_name'], $endorsementFile)) {

                    $idEn = round(microtime(true) * 1000) . '';

                    $defaultTime=date('Y-m-d H:i:s');

                    $endorsementId = $idEn;

                    $query2 = "INSERT INTO endorsement ( endorsement.senderid,endorsement.campus,endorsement.file, endorsement.event,endorsement.status,endorsement.date) VALUE (?,?,?,?,?,?)";

                    $stateM = $con->prepare($query2);

                    $sta = NULL;

                    $stateM->bind_param('ssssss',  $serderId, $campus, $endorsementFile, $eventType, $sta,$defaultTime);

                    $st = $stateM->execute();

                    if ($st) {

                        for ($x = 0; $x < $countResearch; $x++) {

                            // Create base directory if it doesn't exist
                            $researchBaseDir = $_SERVER['DOCUMENT_ROOT'] . '/client/Files/researchPaper/';
                            if (!is_dir($researchBaseDir)) {
                                mkdir($researchBaseDir, 0755, true);
                            }

                            // Create user subdirectory if it doesn't exist
                            $researchUserDir = $researchBaseDir . $serderId . '/';
                            if (!is_dir($researchUserDir)) {
                                mkdir($researchUserDir, 0755, true);
                            }

                            $researchPaper = $researchUserDir . $_FILES['researchDocs']['name'][$x];

                            $title = $_POST['title'][$x];

                            $category = $_POST['category'][$x];

                            $author = $_POST['author'][$x];

                            $coAuthor = $_POST['coAuthor'][$x];

                       //     $id = round(microtime(true) * 1000) . '';

                            $fileStatusMessage = "";

                            if (move_uploaded_file($_FILES['researchDocs']['tmp_name'][$x], $researchPaper)) {

                                $fileStatusMessage .= $_FILES['researchDocs']['name'][$x] . " uploaded..\n";

                                $dataState = new stdClass();

                                $query = "INSERT INTO researchfile(researchfile.id,researchfile.senderid , researchfile.endorsementid,researchfile.author, researchfile.title, researchfile.file, researchfile.event, researchfile.campus, researchfile.coauthor, researchfile.category,researchfile.reviews) VALUES (?,?,?,?,?,?,?,?,?,?,?)";

                                $querV2="INSERT INTO 

researchfile(

    researchfile.senderid ,

    researchfile.endorsementid,

    researchfile.author,

    researchfile.title,

    researchfile.file,

    researchfile.event,

    researchfile.campus,

    researchfile.coauthor, 

    researchfile.category,

    researchfile.reviews

) 

SELECT ?,endorsement.id,?,?,?,?,?,?,?,?

FROM endorsement WHERE endorsement.senderid=? 

ORDER BY endorsement.id DESC LIMIT 1";

                                $stementResNew = $con->prepare($querV2);

                                $rev = "[]";

                                $stementResNew->bind_param('ssssssssss',  $serderId, $author, $title, $researchPaper, $eventType, $campus, $coAuthor, $category, $rev,$serderId);

                                $state = $stementResNew->execute();

                                if ($state) {

                                    $response->message .= $fileStatusMessage;

                                    $response->status = true;

                                } else {

                                    $response->serverMessage .= $con->error . "\n";

                                }

                            } else {

                                $response->serverMessage .= $con->error . "\n";

                            }

                        }

                    } else {

                        $response->serverMessage .= $con->error . "\n";

                    }

                } else {

                    $response->message = 'something went wrong during saving' . $con->error;

                }

            } else {

                $response->message = "This account is currently unable to submit endorsement letter.\n Please contact system administrator for permission...!";

            }

        } else {

            $response->message = "Sorry..., The event has closed.";

        }

    } else {

        $response->serverMessage .= $con->error . "\n";

    }

    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();

}





if (isset($_POST['acceptRequest'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $docId = $_POST['docId'];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $rdeStaff = $_SESSION['userEmail'];
        $logDate = date("Y-m-d");
        $event = $_POST['eventType'];
        $campus = $_POST['campus'];

        if ($con->query("UPDATE `endorsement` SET `status`='accepted'  WHERE `id`='$docId'")) {
            $details = "RDE staff: $rdeStaff accepted endorsement letter for $event from $campus";
            $userId = $_SESSION['userId'];
            $logQuery = "INSERT INTO document_log (document_log.user_id,document_log.doc_id,document_log.details,document_log.date) VALUES (?,?,?,?)";
            $stm = $con->prepare($logQuery);
            $defaultTime = date('Y-m-d H:i:s');
            $stm->bind_param('ssss', $userId, $docId, $details, $defaultTime);
            $status = $stm->execute();

            if ($status) {
                $response->status = true;
                
                // ============================================
                // UNCOMMENTED AND FIXED EMAIL SENDING CODE
                // ============================================
                
                $from = new stdClass();
                $from->email = $rdeEmail;
                $from->password = $emailPassword;
                $from->name = 'Research, Development and Extension';
                
                // Get the research papers under this endorsement
                $emailStatement = $con->prepare("SELECT 
                    DISTINCT account_detail.email, 
                    account_detail.fullName, 
                    researchfile.title, 
                    researchfile.event 
                FROM researchfile 
                LEFT JOIN account_detail ON account_detail.id = researchfile.senderid 
                WHERE researchfile.endorsementid=?");
                
                $emailStatement->bind_param("s", $docId);
                $emailStatement->execute();
                $emRes = $emailStatement->get_result();
                
                $emailCount = 0;
                while ($row = $emRes->fetch_assoc()) {
                    $to = new stdClass();
                    $to->name = $row['fullName'];
                    $to->email = $row['email'];
                    
                    // Send acceptance email
                    $emailResult = SendEmail($from, $to, AcceptedEntry($row['event'], $row['title']));
                    
                    if ($emailResult) {
                        $emailCount++;
                    }
                }
                
                if ($emailCount > 0) {
                    $response->message = "Document Accepted and email notifications sent to $emailCount submitter(s)";
                } else {
                    $response->message = "Document Accepted but no email notifications sent";
                }
            } else {
                $response->message = $stm->error;
            }
        } else {
            $response->message = $con->error;
        }
    } else {
        $response->message = $con->error;
    }
    
    echo json_encode($response);
}




if (isset($_POST['researchSubmit'])) {

    $response = new stdClass();

    $response->list = [];

    $response->userName = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        // Use passed category and event, fallback to session if not provided
        $category = isset($_POST['category']) ? $_POST['category'] : (isset($_SESSION['category']) ? $_SESSION['category'] : $_SESSION['center']);
        $event = isset($_POST['event']) ? $_POST['event'] : $_SESSION['eventTYpe'];
        $eventId = isset($_POST['eventId']) ? $_POST['eventId'] : $_SESSION['eventId'];
        $response->userName = $_SESSION['userName'];

        $evalId = $_SESSION['userId'];

        // Always use eventId since we always have it
        $sqlQueries = "SELECT 
    researchfile.id,
    researchfile.author,
    researchfile.file,
    researchfile.title,
    researchfile.event,
    researchfile.category,
    endorsement.campus,
    event_list.id as eventId,
    category.id as catId
FROM researchfile
LEFT JOIN endorsement ON endorsement.id = researchfile.endorsementid
LEFT JOIN event_list ON researchfile.event = event_list.name
LEFT JOIN category ON researchfile.category = category.name
WHERE endorsement.status = ? 
  AND (researchfile.category = ? OR researchfile.category LIKE CONCAT(?, '%') OR category.name = ? OR category.name LIKE CONCAT(?, '%')) 
  AND event_list.id = ? 
  AND event_list.dead_line > CURRENT_TIMESTAMP";

        $stm = $con->prepare($sqlQueries);

        $stat = 'accepted';

        // Bind parameters: status, category (5 times), eventId
        $stm->bind_param("ssssss", $stat, $category, $category, $category, $category, $eventId);

        $stm->execute();

        $resultRes = $stm->get_result();

        while ($val = $resultRes->fetch_assoc()) {

            $data = new stdClass();

            $data->status = NULL;

            $data->id = $val['id'];

            $data->author = $val['author'];

            $data->file = $val['file'];

            $data->title = $val['title'];

            $data->event = $val['event'];

            $data->category = $val['category'];

            $data->campus = $val['campus'];
            $data->eventId = $val['eventId'];
            $data->catId = $val['catId'];

            $data->intro = '';

            $data->abstract = '';

            $data->objective = '';

            $data->methodology = '';

            $data->results = '';

            $data->recommendation = '';

            $data->literature = '';

            $data->other = '';

            $comquery = "SELECT 
    comments.intro,
    comments.abstract,
    comments.objective,
    comments.methodology,
    comments.results,
    comments.recommendation,
    comments.literature,
    comments.other,
    comments.date
FROM comments WHERE comments.resid = ? AND comments.evalid = ? AND comments.eventType = ?";

            $statement = $con->prepare($comquery);

            $statement->bind_param('sss', $val['id'], $evalId, $val['event']);

            $statement->execute();

            $res = $statement->get_result();

            while ($v = $res->fetch_assoc()) {

                $data->status = 'updated';

                $data->intro = $v['intro'];

                $data->abstract = $v['abstract'];

                $data->objective = $v['objective'];

                $data->methodology = $v['methodology'];

                $data->results = $v['results'];

                $data->recommendation = $v['recommendation'];

                $data->literature = $v['literature'];

                $data->other = $v['other'];

            }

            $response->list[] = $data;

        }

    }

    echo json_encode($response);

}





if (isset($_POST['updateReview'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        //   $dataUser = unserialize($_SESSION['isLog']);

        $category = $_SESSION['category'];

        $response->userName = $_SESSION['userName'];

        $evalId = $_SESSION['userId'];

        $evalName = $_SESSION['userFulname'];

        $docsId = $_POST['docsId'];

        $title = $_POST['title'];

        $intro = $_POST['intro'];

        $abstract = $_POST['abstract'];

        $objective = $_POST['objective'];

        $methodology = $_POST['methodology'];

        $results = $_POST['results'];

        $recommendation = $_POST['recommendation'];

        $literature = $_POST['literature'];

        $other = $_POST['other'];



        $eventTYpe = $_SESSION['eventTYpe'];

        $eventId = $_SESSION['eventId'];



        $found = mysqli_num_rows($con->query("SELECT * FROM `comments` WHERE  `evalid`='$evalId' AND  `resid`='$docsId'"));

        if ($found) {

       //     $commentQuery = "UPDATE comments SET `intro`='$intro',`abstract`='$abstract',`objective`='$objective',`methodology`='$methodology',`results`='$results',`recommendation`='$recommendation',`literature`='$literature',`other`='$other' WHERE `resid`='$docsId' AND `evalid`='$evalId'";
            $comQ="UPDATE comments SET 
comments.title=?,
comments.intro=?,
comments.abstract=?,
comments.objective=?,
comments.methodology=?,
comments.results=?,
comments.recommendation=?,
comments.literature=?,
comments.other=?
WHERE comments.resid=? AND comments.evalid=?";
            $statement=$con->prepare($comQ);
            $statement->bind_param("sssssssssss",$title,$intro,$abstract,$objective,$methodology,$results,$recommendation,$literature,$other,$docsId,$evalId);
            $status=$statement->execute();
            if($status){
                $response->status = true;
                $response->message = "Comments Updated successfully..!";
            }else{
                $response->message = $statement->error;
            }
            /*
             * if ($con->query($commentQuery)) {

                $response->status = true;

                $response->message = "Comments Updated successfully..!";

            } else {

                $response->message = $con->error;
            }
             */

        } else {

           // $commentQuery = "INSERT INTO `comments`(`resid`, `evalid`,`eventTYpe`,`intro`, `abstract`, `objective`, `methodology`, `results`,`recommendation`, `literature`, `other`) VALUES ('$docsId','$evalId','$eventTYpe','$intro','$abstract','$objective','$methodology','$results','$recommendation','$literature','$other')";
            $comQuery="INSERT INTO comments
(
    comments.resid,
    comments.evalid,
    comments.eventType,
    comments.title,
    comments.intro,
    comments.abstract,
    comments.objective,
    comments.methodology,
    comments.results,
    comments.recommendation,
    comments.literature,
    comments.other
) VALUES
(?,?,?,?,?,?,?,?,?,?,?,?)";

            $statementQ=$con->prepare($comQuery);
            $statementQ->bind_param("ssssssssssss",$docsId , $evalId , $eventTYpe , $title, $intro , $abstract , $objective , $methodology , $results , $recommendation , $literature , $other );
            $statusIn=$statementQ->execute();
            if($statusIn){
                $response->status = true;

                $response->message = "Comments Save successfully..!";
            }else{
                $response->message = $statementQ->error;
            }
            /*
             * if ($con->query($commentQuery)) {

                $response->status = true;

                $response->message = "Comments Save successfully..!";

            } else {

                $response->message = $con->error;

            }
             */

        }



    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}





if (isset($_POST['researchReviewed'])) {

    $response = new stdClass();

    $response->list = [];



    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        // $data = unserialize($_SESSION['isLog']);

        $userId = $_SESSION['userId'];



        $queryEndorsement = "SELECT * FROM `endorsement` WHERE `senderid`='$userId'";

        foreach ($con->query($queryEndorsement) as $val) {

            $endorsement = new stdClass();

            $endorsement->endorsementFile = $val['file'];

            $endorsement->eventType = $val['event'];

            $endorsement->date = $val['date'];

            $endorsement->status = $val['status'];

            $endorsement->id = $val['id'];

            $endorsement->ResearchDocs = [];

            $enID = $val['id'];

            $queryResearch = "SELECT * FROM `researchfile` WHERE `senderid`='$userId' AND `endorsementid`='$enID'";

            foreach ($con->query($queryResearch) as $res) {

                $researchDocs = new stdClass();

                $researchDocs->author = $res['author'];

                $researchDocs->coauthor = $res['coauthor'];

                $researchDocs->title = $res['title'];

                $researchDocs->docId = $res['id'];

                $researchDocs->category = $res['category'];

                $researchDocs->comment = $res['reviews'];

                $researchDocs->researchFile = $res['file'];

                $researchDocs->deleteState = $res['deletestate'];



                $endorsement->ResearchDocs[] = $researchDocs;

            }

            $response->list[] = $endorsement;

        }

    }

    echo json_encode($response);

}



if (isset($_POST['accessPermission'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $account = $_POST['userId'];

        $query = "UPDATE `account` SET `researchaccess`='allow' WHERE `id`='$account'";

        if ($con->query($query)) {

            $response->status = true;

            $response->message = 'Account added successfully..!';

        } else {

            $response->message = 'Something went wrong ' . $con->error;

        }

    } else {

        $response->message = 'failed to connect...!';

    }

    echo json_encode($response);

}



if (isset($_POST['endorsementApproval'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $accountID = $_POST['accountID'];

        $query = "UPDATE `account` SET `endorsement`='allow' WHERE `id`='$accountID'";

        if ($con->query($query)) {

            $response->status = true;

            $response->message = 'Account added..!';

        } else {

            $response->message = 'Something went wrong ' . $con->error;

        }

    } else {

        $response->message = 'failed to connect...!';

    }

    echo json_encode($response);

}



if (isset($_POST['accessGrantEndorsement'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $response->data = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        //`id`, `username`, `name`, `password`, `office`, `signature`, `position`, `data`, `researchaccess`

        $query = "SELECT * FROM `account`";



        foreach ($con->query($query) as $val) {

            if ($val['endorsement'] !== null) {

                $da = new stdClass();

                $da->email = $val['email'];

                $da->id = $val['id'];

                $da->office = $val['office'];

                $da->fullname = $val['fullname'];

                $response->data[] = $da;

            }

        }

    } else {

        $response->message = 'Connection failed..!';

    }

    echo json_encode($response);

}



if (isset($_POST['accessGrant'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $response->data = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        //`id`, `username`, `name`, `password`, `office`, `signature`, `position`, `data`, `researchaccess`

        $query = "SELECT * FROM `account` WHERE  `researchaccess` IS NOT NULL ";



        foreach ($con->query($query) as $val) {

            $da = new stdClass();

            $da->name = $val['name'];

            $da->fullName = $val['fullname'];

            $da->id = $val['id'];

            $da->office = $val['office'];

            $response->data[] = $da;

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}



if (isset($_POST['allaccount'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $response->data = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        //`id`, `username`, `name`, `password`, `office`, `signature`, `position`, `data`, `researchaccess`

        $query = "SELECT * FROM `account` ";



        foreach ($con->query($query) as $val) {

            $da = new stdClass();

            $da->name = $val['name'];

            $da->id = $val['id'];

            $da->office = $val['office'];

            $response->data[] = $da;

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}



if (isset($_POST['removeAccess'])) {

    //UPDATE `account` SET `researchaccess`=[value-9] WHERE `id`

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $accountID = $_POST['accountID'];

        $query = "UPDATE `account` SET `endorsement`=null WHERE `id`='$accountID'";

        if ($con->query($query)) {

            $response->status = true;

        } else {

            $response->message = $con->error;

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}



if (isset($_POST['removeAccessRes'])) {

    //UPDATE `account` SET `researchaccess`=[value-9] WHERE `id`

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $accountID = $_POST['accountID'];



        $query = "UPDATE `account` SET `researchaccess`=null WHERE `id`='$accountID'";

        if ($con->query($query)) {

            $response->status = true;

        } else {

            $response->message = $con->error;

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}



//This method was used befor for viewing of endorsement letter

if (isset($_POST['researchFileAdmin'])) {

    $response = new stdClass();

    $response->list = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $queryAd = "SELECT * FROM `researchfile`";

        foreach ($con->query($queryAd) as $val) {

            $data = new stdClass();

            $data->id = $val['id'];

            $data->senderId = $val['senderid'];

            $data->author = $val['author'];

            $data->file = $val['file'];

            $data->title = $val['title'];

            $data->category = $val['category'];

            $data->campus = $val['campus'];

            $data->proponent = $val['coauthor'];

            $data->date = $val['date'];

            $data->reviews = $val['reviews'];

            $data->status = $val['status'];

            $data->event = $val['event'];

            $data->deletestate = $val['deletestate'];

            if (is_null($val['status'])) {

                array_splice($response->list, 0, 0, [$data]);

            } else {

                $response->list[] = $data;

            }





        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}





if (isset($_POST['getResearch'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $response->list = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        // $dataUser = unserialize($_SESSION['isLog']);

        $serderId = $_SESSION['userId'];

        foreach ($con->query("SELECT  `researchaccess` FROM `account` WHERE `id`='$serderId'") as $val) {

            if ($val['researchaccess'] !== null) {

                $response->message = 'somehting';

                foreach ($con->query("SELECT * FROM `researchfile`") as $v) {

                    $data = new stdClass();

                    $data->id = $v['id'];

                    $data->author = $v['author'];

                    $data->file = $v['file'];

                    $data->title = $v['title'];

                    $data->category = $v['category'];

                    $data->campus = $v['campus'];

                    $data->proponent = $v['coauthor'];

                    $data->year = $v['year'];

                    $data->month = $v['month'];

                    $data->date = $v['month'] . '/' . $v['date'] . '/' . $v['year'];

                    $data->reviews = $v['reviews'];

                    $data->status = $v['status'];

                    $response->list[] = $data;

                }

            } else {

                $response->message = 'somehting';

                foreach ($con->query("SELECT * FROM `researchfile` WHERE `senderid`='$serderId'") as $v) {

                    $data = new stdClass();

                    $data->id = $v['id'];

                    $data->sender = $v['author'];

                    $data->file = $v['file'];

                    $data->title = $v['title'];

                    $data->category = $v['category'];

                    $data->campus = $v['campus'];

                    $data->proponent = $v['coauthor'];

                    $data->year = $v['year'];

                    $data->month = $v['month'];

                    $data->date = $v['month'] . '/' . $v['date'] . '/' . $v['year'];

                    $data->reviews = $v['reviews'];

                    $data->status = $v['status'];

                    $response->list[] = $data;

                }

            }

        }

    }

    echo json_encode($response);

}





if (isset($_POST['getEndorse'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $response->list = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        // $dataUser = unserialize($_SESSION['isLog']);

        $serderId = $_SESSION['userId'];

        foreach ($con->query("SELECT  `endorsement` FROM `account` WHERE `id`='$serderId'") as $val) {

            if ($val['endorsement'] !== null) {





                foreach ($con->query("SELECT * FROM `researchfile`") as $v) {

                    $data = new stdClass();

                    $data->id = $v['id'];

                    $data->author = $v['author'];

                    $data->file = $v['file'];

                    $data->endorsement = $v['endorsement'];

                    $data->userId = $serderId;

                    $data->signurl = $_SESSION['userEsign'];





                    if ($v['approval'] === null) {

                        $v['approval'] = json_encode([]);

                    }

                    $app = json_decode($v['approval']);

                    $data->approval = false;

                    for ($x = 0; $x < sizeof($app); $x++) {

                        if ($serderId === $app[$x]->id) {

                            $data->approval = true;

                        }

                    }



                    $data->title = $v['title'];

                    $data->category = $v['category'];

                    $data->campus = $v['campus'];

                    $data->proponent = $v['coauthor'];

                    $data->year = $v['year'];

                    $data->month = $v['month'];

                    $data->date = $v['month'] . '/' . $v['date'] . '/' . $v['year'];

                    $data->reviews = $v['reviews'];

                    $data->status = $v['status'];

                    $response->list[] = $data;



                }

            }

        }

    }

    echo json_encode($response);

}





if (isset($_POST['deleteRequest'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $docId = $_POST['docId'];

        if ($con->query("DELETE FROM `researchfile` WHERE `id`='$docId'")) {

            $response->status = false;

            $response->message = unlink($_POST['file']);

        } else {

            $response->message = 'Failed to delete';

        }

    } else {

        $response->message = "Failed to connect";

    }

    echo json_encode($response);

}





if (isset($_POST['approve'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';



    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        //  $dataUser = unserialize($_SESSION['isLog']);



        $sig = new stdClass();

        $sig->name = $_SESSION['userFulname'];

        $sig->id = $_SESSION['userId'];

        $sig->email = $_SESSION['userEmail'];





        $signUrl = new stdClass();

        $s = json_decode($_SESSION['userEsign']);



        $signUrl->url = $s->url;

        $signUrl->scale = $s->scale;



        $signLoc = json_decode($_POST['signLoc']);



        $signature = new stdClass();

        $signature->left = $signLoc->left;

        $signature->top = $signLoc->top;

        $signature->page = $signLoc->page;



        $sig->signature = $signature;

        $sig->signurl = $signUrl;

        $sig->status = 'approve';

        $sig->note = '';



        //





        $userId = $_SESSION['userId'];

        $docsId = $_POST['docId'];

        foreach ($con->query("SELECT  `approval` FROM `researchfile` WHERE `id`='$docsId'") as $val) {

            if ($val['approval'] === null) {

                $val['approval'] = '[]';

            }

            $data = json_decode($val['approval']);

            $accCheck = false;

            for ($x = 0; $x < sizeof($data); $x++) {

                if ($data[$x]->id === $userId) {

                    $data[$x] = $sig;

                    $accCheck = true;

                    break;

                }

            }



            if (!$accCheck) {

                $data[] = $sig;

            }



            $dataEncoded = json_encode($data);

            if ($con->query("UPDATE `researchfile` SET `approval`='$dataEncoded' WHERE `id`='$docsId'")) {

                $response->status = true;

                $response->message = 'Success..!';

            }

        }



    } else {

        $response->message = 'Connection Failed..!';

    }



    echo json_encode($response);



}



if (isset($_POST['researchPropApp'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $docId = $_POST['docId'];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query = "UPDATE `researchfile` SET `approval`='approve' WHERE `id`='$docId'";

        if ($con->query($query)) {

            $response->status = true;

        } else {

            $response->message .= 'Failed to update';

        }

    } else {

        $response->message .= "Failed to connect";

    }

    echo json_encode($response);

}



if (isset($_POST['delResearch'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $docId = $_POST['docId'];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $researchFile = "";



        $reviews = [];





        foreach ($con->query("SELECT `file`,`approval` ,`reviews` FROM `researchfile` WHERE `id`='$docId'") as $val) {

            $researchFile = $val['file'];

            if ($val['reviews'] !== null) {

                $reviews = json_decode($val['reviews']);

            }

        }

        if (count($reviews) <= 0) {

            if ($con->query("DELETE FROM `researchfile` WHERE `id`='$docId'")) {

                if (unlink($_POST['fileUrl'])) {

                    $response->status = true;

                    $response->message = "File deleted..!";

                } else {

                    $response->message = $con->error;

                }

            } else {

                $response->message = $con->error;

            }

        } else {

            $response->message = "Unable to delete. This file is already in process..!";

        }



    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}



if (isset($_POST['saveToSystem'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $docId = $_POST['docId'];

    $category = $_POST['category'];

    $title = $_POST['researchTitle'];

    $author = $_POST['author'];

    $coAuthor = $_POST['coAuthor'];

    //   $dataUser = unserialize($_SESSION['isLog']);

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $review = 0;

        foreach ($con->query("SELECT * FROM `evaluator`") as $val) {

            if ($val['category'] === $category) {

                $review++;

            }

        }



        //client/ResearchFile





        foreach ($con->query("SELECT * FROM `researchfile` WHERE `id`='$docId'") as $val) {

            $rev = json_decode($val['reviews']);

            if ($review === sizeof($rev)) {

                $docArray = explode('/', $val['file']);

                $docNem = $docArray[sizeof($docArray) - 1];

                $researchFileState = false;

                if (!file_exists("../client/ResearchFile/" . $docNem)) {

                    if (rename($val['file'], "../client/ResearchFile/" . $docNem)) {

                        $researchFileState = true;

                    }

                }

                $docenArray = explode('/', $val['endorsement']);

                $docEnNem = $docenArray[sizeof($docenArray) - 1];

                $endorsementState = false;

                if (!file_exists("../client/AllEndorsement/" . $docEnNem)) {

                    if (rename($val['endorsement'], "../client/AllEndorsement/" . $docEnNem)) {

                        $endorsementState = true;

                    }

                }

                if ($endorsementState && $researchFileState) {

                    $researchFile = "../client/ResearchFile/" . $docNem;

                    $endorsement = "../client/AllEndorsement/" . $docEnNem;

                    $reviews = $val['reviews'];

                    $authorId = $val['senderid'];

                    $docIdMain = $docId;



                    //INSERT INTO `researchallfile`(`docid`, `authorid`, `researchfile`, `endoresment`, `comments`, `date`) VALUES ('','','','','','')

                    if ($con->query("INSERT INTO `researchallfile`(`docid`, `author`,authorid,`coauthor`,`title` ,`researchfile`, `endoresment`, `comments`) VALUES ('$docIdMain','$author','$authorId','$coAuthor','$title','$researchFile','$endorsement','$reviews')")) {

                        $response->status = true;

                        $response->message = 'Success';

                    } else {

                        $response->message .= $con->error;

                    }

                } else {

                    $response->message .= "Files can't be move...!";

                }

            } else {

                $response->message .= "Unable to save this file. ";

            }

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}



//This request was modified





if (isset($_POST['systemResearchFile'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $response->list = [];

    //  $dataUser = unserialize($_SESSION['isLog']);

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        foreach ($con->query("SELECT * FROM `researchallfile`") as $val) {

            if ($val['authorid'] === $_SESSION['userId']) {

                $data = new stdClass();

                $data->researchFile = $val['researchfile'];

                $data->endorsementFile = $val['endoresment'];

                $data->title = $val['title'];

                $data->reviews = $val['comments'];

                $data->author = $val['author'];

                $data->authorId = $val['authorid'];

                $data->date = $val['date'];

                $data->coAuthor = json_decode($val['coauthor']);

                $response->list[] = $data;

            }

        }

    } else {

        $response->message .= $con->error;

    }

    echo json_encode($response);

}



if (isset($_POST['researchDeleteRequest'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $docId = $_POST['docId'];

    $reason = $_POST['reason'];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query = "UPDATE `researchfile` SET `deletestate`='$reason' WHERE`id`='$docId'";

        if ($con->query($query)) {

            $response->status = 'true';

            $response->message = "Request Sent...!";

        } else {

            $response->message = $con->error;

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}





//==============================================================================================================

if (isset($_POST['saveResearchPer'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $response->data = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query = "INSERT INTO researchallfile

(

    researchallfile.docid,

    researchallfile.author,

    researchallfile.title,

    researchallfile.researchfile,

    researchallfile.eventType,

    researchallfile.date

) SELECT 

researchfile.id,

researchfile.author,

researchfile.title,

researchfile.file,

researchfile.event,

endorsement.date

FROM researchfile 

LEFT JOIN endorsement ON researchfile.endorsementid=endorsement.id

WHERE researchfile.endorsementid=?";

        $endorId = $_POST['endorseId'];

        $statement = $con->prepare($query);

        $statement->bind_param("s", $endorId);

        $result = $statement->execute();

        if ($result) {

            $logReq = "INSERT INTO document_log (document_log.user_id,document_log.doc_id,document_log.details)

SELECT 

?,

researchfile.id,

?

FROM researchfile 

LEFT JOIN endorsement ON researchfile.endorsementid=endorsement.id

WHERE researchfile.endorsementid=?";



            $userId = $_SESSION['userId'];

            $rdeStaff = $_SESSION['userEmail'];

            $event = $_POST['eventType'];

            $campus = $_POST['campus'];

            $details = "RDE staff: $rdeStaff store files of $campus  for $event";



            $stm = $con->prepare($logReq);

            $stm->bind_param("sss", $userId, $details, $endorId);

            $stat = $stm->execute();

            if ($stat) {

                // Fetch and return the saved research data with center information
                $fetchQuery = "SELECT 
                    researchfile.id,
                    researchfile.author,
                    researchfile.title,
                    researchfile.file,
                    researchfile.event,
                    researchfile.campus,
                    researchfile.category,
                    endorsement.date
                FROM researchfile 
                LEFT JOIN endorsement ON researchfile.endorsementid=endorsement.id
                WHERE researchfile.endorsementid=?";
                
                $fetchStmt = $con->prepare($fetchQuery);
                $fetchStmt->bind_param("s", $endorId);
                $fetchStmt->execute();
                $fetchRes = $fetchStmt->get_result();
                
                while ($row = $fetchRes->fetch_assoc()) {
                    $data = new stdClass();
                    $data->id = $row['id'];
                    $data->author = $row['author'];
                    $data->title = $row['title'];
                    $data->file = $row['file'];
                    $data->event = $row['event'];
                    $data->campus = $row['campus'];
                    $data->center = $row['category']; // Map category to center for front-end
                    $data->date = $row['date'];
                    $response->data[] = $data;
                }

                $response->status = true;

                $response->message = 'Saved';

            } else {

                $response->message = $stm->error;

            }

        } else {

            $response->message = $statement->error;

        }



    } else {

        $response->message = $con->error;

    }

    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();



}



if (isset($_POST['researchFile'])) {

    // $dataUser = unserialize($_SESSION['isLog']);

    $userId = $_SESSION['userId'];

    $response = new stdClass();

    $response->status = false;

    $response->list = [];

    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query = "SELECT 

researchfile.campus,

researchallfile.title,

researchallfile.author,

researchallfile.docid,

researchfile.category,

researchfile.file,

researchallfile.date

FROM

researchfile

INNER JOIN researchallfile ON researchfile.id=researchallfile.docid

WHERE researchfile.campus=? AND researchfile.event=? AND researchfile.senderid <> ? ";

        $statement = $con->prepare($query);

        $reqCount = count($_POST['capName']);

        $eventType = $_POST['eventType'];

        for ($x = 0; $x < $reqCount; $x++) {

            $perCamp = new stdClass();

            $perCamp->name = $_POST['capName'][$x];

            $perCamp->list = [];

            $campName = $_POST['capName'][$x];

            $statement->bind_param('sss', $campName, $eventType, $userId);

            $statement->execute();

            $res = $statement->get_result();

            while ($val = $res->fetch_assoc()) {

                $data = new stdClass();

                $data->author = $val['author'];

                $data->title = $val['title'];

                $data->id = $val['docid'];

                $data->file = $val['file'];

                $data->category = $val['category'];

                $perCamp->list[] = $data;

            }

            if (sizeof($perCamp->list) > 0) {

                $response->list[] = $perCamp;

            }

        }



    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}





if (isset($_POST['declineDel'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $docId = $_POST['docId'];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        if ($con->query("UPDATE `researchfile` SET `deletestate`=null WHERE `id`='$docId'")) {

            $response->status = true;

        } else {

            $response->message = $con->error;

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}



if (isset($_POST['acceptDel'])) {

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    $docId = $_POST['docId'];

    $fileUrl = $_POST['fileUrl'];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        if ($con->query("DELETE FROM `researchfile` WHERE `id`='$docId'")) {

            if (unlink($fileUrl)) {

                $response->status = true;

            } else {

                $response->message = $con->error;

            }

        } else {

            $response->message = $con->error;

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}





//new Request

if (isset($_POST['incomingEndorsement'])) {

    $response = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $queries = "SELECT endorsement.id, 

       endorsement.senderid,

       endorsement.campus, 

       endorsement.file, 

       endorsement.event, 

       endorsement.date,

       account_detail.usertype,

       account_detail.email

FROM endorsement

LEFT JOIN account_detail ON endorsement.senderid=account_detail.id

WHERE `status`='forwarded' OR `status` IS NULL";

        foreach ($con->query($queries) as $val) {

            $data = new stdClass();

            $data->id = $val['id'];

            $data->senderid = $val['senderid'];

            $data->campus = $val['campus'];

            $data->file = $val['file'];

            $data->event = $val['event'];

            $data->date = $val['date'];

            $data->senderType=$val['usertype'];

            $data->senderEmail=$val['email'];



            $data->researchDocs = [];





//SELECT `id`, `senderid`, `author`, `title`, `file`, `event`,  `status`, `campus`,  `category` FROM `researchfile` WHERE `endorsementid`

            $que = "";

            foreach ($con->query("SELECT `id`, `senderid`, `author`, `title`, `file`, `event`,  `status`, `campus`, `coauthor`, `category` FROM `researchfile` WHERE `endorsementid`='$data->id'") as $v) {

                $research = new stdClass();

                $research->id = $v['id'];

                $research->senderid = $v['senderid'];

                $research->author = $v['author'];

                $research->title = $v['title'];

                $research->file = $v['file'];

                $research->event = $v['event'];

                $research->status = $v['status'];

                $research->campus = $v['campus'];

                $research->coauthor = $v['coauthor'];

                $research->category = $v['category'];

                $data->researchDocs[] = $research;

            }

            $response[] = $data;

        }

    }

    echo json_encode($response);

}





if (isset($_POST['researchDocsNew'])) {

    $response = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query = "

    SELECT

researchfile.id,

researchfile.senderid,

researchfile.author,

researchfile.title,

researchfile.file,

researchfile.status,

researchfile.category,

researchfile.deletestate,           

endorsement.campus,

endorsement.event,

endorsement.date,
researchfile.endorsementid

FROM

researchfile

LEFT JOIN 

endorsement

ON endorsement.id=researchfile.endorsementid

WHERE endorsement.status='accepted' ";

        foreach ($con->query($query) as $val) {

            $data = new stdClass();

            $data->id = $val['id'];

            $data->senderid = $val['senderid'];

            $data->deletestate = $val['deletestate'];

            $data->author = $val['author'];

            $data->title = $val['title'];

            $data->file = $val['file'];

            $data->status = $val['status'];

            $data->category = $val['category'];

            $data->campus = $val['campus'];

            $data->event = $val['event'];

            $data->date = $val['date'];
            $data->endorsId=$val['endorsementid'];

            $response[] = $data;

        }

    }





    echo json_encode($response);

}





if (isset($_POST['commentRequest'])) {

    $response = [];

    $docId = $_POST['docId'];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query = "SELECT

comments.intro,

comments.abstract,

comments.objective,

comments.methodology,

comments.results,

comments.recommendation,

comments.literature,

comments.other,

comments.date,

evaluator.fullname

FROM

comments

LEFT JOIN

evaluator

ON evaluator.id=comments.evalid

WHERE comments.resid='$docId'";

        foreach ($con->query($query) as $val) {

            $data = new stdClass();

            $data->intro = $val['intro'];

            $data->abstract = $val['abstract'];

            $data->objective = $val['objective'];

            $data->methodology = $val['methodology'];

            $data->results = $val['results'];

            $data->recommendation = $val['recommendation'];

            $data->literature = $val['literature'];

            $data->other = $val['other'];

            $data->date = $val['date'];

            $data->evalName = $val['fullname'];

            $response[] = $data;

        }



    }

    echo json_encode($response);

}



if (isset($_POST['getDeleteRequest'])) {

    $response = new stdClass();

    $response->message = "";

    $docId = $_POST['docId'];

    $query = "SELECT

researchfile.deletestate

FROM

researchfile

WHERE researchfile.id='$docId'";

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        foreach ($con->query($query) as $val) {

            $response->message = $val['deletestate'];

        }

    }

    echo json_encode($response);

}





if (isset($_POST['grantDeleteResearchRequest'])) {

    $response = new stdClass();

    $response->message = "";

    $response->status = false;

    if ($con = new mysqli($host, $username, $pass, $dbName)) {



        $docId = $_POST['docId'];

        $fileLocation = $_POST['fileLocation'];

        if ($con->query("DELETE FROM researchfile WHERE id='$docId'")) {

            $campus = $_POST['campus'];

            $account = $_POST['accountName'];

            $rdeStaff = $_POST['rdeStaff'];

            $reason = $_POST['reason'];

            $eventName = $_POST['eventName'];

            $title = $_POST['title'];

            $statement = $con->prepare("INSERT INTO deletedresearch(deletedresearch.id,deletedresearch.title,deletedresearch.event,deletedresearch.campus,deletedresearch.accountuser,deletedresearch.reason,deletedresearch.rdeStaff) VALUES (?,?,?,?,?)");

            $statement->bind_param("sssss", $docId, $title, $eventName, $campus, $account, $reason, $rdeStaff);

            $status = $statement->execute();

            if ($status) {

                $response->message = unlink($fileLocation);

                $response->status = true;

            } else {

                $response->message = $statement->error;

            }

        } else {

            $response->message = $con->error;

        }

    }



    echo json_encode($response);

}





if (isset($_POST['rejectIndorse'])) {
    $response = new stdClass();
    $response->message = "";
    $response->status = false;
    $response->emailStat = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "UPDATE endorsement SET endorsement.status=? WHERE endorsement.id=?";
        $statement = $con->prepare($query);
        $state = "rejected";
        $docId = $_POST['docId'];
        $statement->bind_param("ss", $state, $docId);
        $status = $statement->execute();

        if ($status) {
            $query = "INSERT INTO `rejecteddocs`(`id`, `docid`, `url`, `type`, `reason`) VALUES ( ? , ? , ? , ? , ? )";
            $docId = $_POST['docId'];
            $fileUrl = $_POST['fileUrl'];
            $type = $_POST['fileType'];
            $reason = $_POST['reasonEnd'];
            $idEn = round(microtime(true) * 1000) . '';

            $statement2 = $con->prepare($query);
            $statement2->bind_param("sssss", $idEn, $docId, $fileUrl, $type, $reason);
            $status = $statement2->execute();

            if ($status) {
                $response->status = true;
                
                // Save to abstain table
                $evalId = $_SESSION['userId'];
                $abstainQuery = "INSERT INTO abstain (eval_id, doc_id, reason, date) VALUES (?, ?, ?, NOW())";
                $abstainStmt = $con->prepare($abstainQuery);
                $abstainStmt->bind_param("iss", $evalId, $docId, $reason);
                $abstainStmt->execute();
                
                // Send email notification
                $from = new stdClass();
                $from->email = $rdeEmail;
                $from->password = $emailPassword;
                $from->name = 'Research, Development and Extension';
                
                // FIXED QUERY: Get research titles instead of campus
                $emailStatement = $con->prepare("SELECT 
                    account_detail.email, 
                    account_detail.fullName, 
                    endorsement.event,
                    GROUP_CONCAT(researchfile.title SEPARATOR ', ') as research_titles
                FROM endorsement 
                LEFT JOIN account_detail ON endorsement.senderid = account_detail.id 
                LEFT JOIN researchfile ON researchfile.endorsementid = endorsement.id
                WHERE endorsement.id=?
                GROUP BY account_detail.email, account_detail.fullName, endorsement.event");
                
                $emailStatement->bind_param("s", $docId);
                $emailStatement->execute();
                $emRes = $emailStatement->get_result();
                
                if ($row = $emRes->fetch_assoc()) {
                    $to = new stdClass();
                    $to->name = $row['fullName'];
                    $to->email = $row['email'];
                    
                    // Pass the research titles to the email template
                    $emailResult = SendEmail($from, $to, RejectedEntry($reason, $row['event'], $row['research_titles']));
                    
                    if ($emailResult) {
                        $response->emailStat = 'Email sent successfully to ' . $row['email'];
                    } else {
                        $response->emailStat = 'Failed to send email to ' . $row['email'];
                    }
                } else {
                    $response->emailStat = 'Could not find sender information for email';
                }
                
                $response->message = "Document Rejected";
            } else {
                $response->message = $statement2->error;
            }
        } else {
            $response->message = $statement->error;
        }
    } else {
        $response->message = $con->error;
    }
    
    echo json_encode($response);
}



if (isset($_POST['deleteEndorsement'])) {

    $response = new stdClass();

    $response->message = '';

    $response->status = false;

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query = "DELETE FROM endorsement WHERE endorsement.status=? AND endorsement.id=?";

        $statement = $con->prepare($query);

        $status = 'rejected';

        $docId = $_POST['docId'];

        $file = $_POST['fileUrl'];

        $resUrl = json_decode($_POST['researchFileUrl']);

        $statement->bind_param('ss', $status, $docId);

        $statusStatement = $statement->execute();

        if ($statusStatement) {

            if ($statement->affected_rows > 0) {

                $response->status = true;

                $response->message = 'Document deleted successfully..!';

                if (!unlink($file)) {

                    $response->message .= "\n But failed to remove file from web storage...";

                }

                for ($x = 0; $x < sizeof($resUrl); $x++) {

                    if (!unlink($resUrl[$x])) {

                        $response->message .= "\n But failed to remove file from web storage...";

                    }

                }

            } else {

                $response->message = 'Unable to delete this document...!';

            }

        } else {

            $response->message = $statement->error;

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}



if (isset($_POST['rejectRequest'])) {

    $response = new stdClass();

    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $docId = $_POST['dicId'];

        $query = "SELECT rejecteddocs.rejectedby,rejecteddocs.reason FROM rejecteddocs WHERE rejecteddocs.docid=?";

        $statement = $con->prepare($query);

        $statement->bind_param("s", $docId);

        $statement->execute();

        $result = $statement->get_result();

        while ($val = $result->fetch_assoc()) {

            $response->message = $val['reason'];

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);

}



if (isset($_POST['fileReqRes'])) {

    $response = '';

    $docId = $_POST['docId'];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query = "SELECT researchallfile.researchfile FROM researchallfile WHERE researchallfile.docid=?";

        $statement = $con->prepare($query);

        $statement->bind_param('s', $docId);

        $statement->execute();

        $result = $statement->get_result();

        while ($val = $result->fetch_assoc()) {

            $response = $val['researchfile'];

        }

    }



    echo $response;

}



if (isset($_POST['viewDocReq'])) {

    $response = new stdClass();

    $response->status = false;

    $response->data = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query = "SELECT researchfile.file FROM researchfile WHERE researchfile.id=? LIMIT 1";

        $docId = $_POST['docId'];

        $statement = $con->prepare($query);

        $statement->bind_param('s', $docId);

        $statement->execute();

        $res = $statement->get_result();

        while ($val = $res->fetch_assoc()) {

            $response->data = $val['file'];

            $response->status = true;

        }

    } else {

        $response->message = $con->error;

    }

    echo json_encode($response);



}





if(isset($_POST['resetComments'])){

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query="DELETE FROM comments

WHERE comments.resid=? AND comments.evalid=?";

        $statement=$con->prepare($query);

        $statement->bind_param("ss",$_POST['docId'],$_SESSION['userId']);

        $status=$statement->execute();

        if($status){

            $response->status=true;

        }else{

            $response->message=$statement->error;

        }

    }else{

        $response->message=$con->error;

    }

    echo json_encode($response);

}