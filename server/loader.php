<?php
include ('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

if(isset($_POST['load'])){
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $result=[];
        foreach ($con->query('SELECT account_detail.center,account_detail.id,account_detail.email FROM account_detail') as $val){
            $res=new stdClass();
            $res->office=$val['center'];
            $res->id=$val['id'];
            $res->email=$val['email'];
            $result[]=$res;
        }
        echo json_encode($result);
    }
}
if(isset($_POST['allUserAdmin'])){
    $result=[];
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $query="SELECT 
        account_detail.center, 
        account_detail.id,
        account_detail.email,
        capsu_user.username,
        account_detail.fullName,
        account_detail.usertype
        FROM account_detail
        LEFT JOIN capsu_user ON account_detail.id=capsu_user.id
        ";
        $statement=$con->prepare($query);
        $statement->execute();
        $resultVal=$statement->get_result();
        while ($val=$resultVal->fetch_assoc()){
            $result[]=$val;
        }
    }
    echo json_encode($result);
}

if(isset($_POST['allUser'])){
    $result=[];
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $query="SELECT account_detail.center,
            account_detail.id,
            account_detail.email,
            capsu_user.username,
            account_detail.fullName
            FROM account_detail
            LEFT JOIN capsu_user ON account_detail.id=capsu_user.id";
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

// Checking for New Files =====================================================

if(isset($_POST['files'])){
    if($con=new mysqli($host,$username,$pass,$dbName)){
        if($statement=$con->prepare("SELECT `id`, `description`, `status`, `url` FROM `files` WHERE `id`=?")){

        }
    }
}
if(isset($_POST['getTotalUser'])){
    $response= new stdClass();
    $response->total=0;
    $response->list=[];
    $camp=count($_POST['campusName']);

    if($con=new mysqli($host,$username,$pass,$dbName)){
        for($x=0;$x<$camp;$x++) {
            $campusName=$_POST['campusName'][$x];
            $query="SELECT COUNT(*) FROM account_detail WHERE account_detail.center=?";
            $statement=$con->prepare($query);
            $statement->bind_param("s",$campusName);
            $statement->execute();
            $res=$statement->get_result()->fetch_row();
            $data=new stdClass();
            $data->CampusName=$campusName;
            $data->Total=$res[0].'';
            $response->list[]=$data;
            $response->total=$response->total+$res[0];
        }
    }
    echo json_encode($response);
}

if(isset($_POST['communication'])){
    $response= new stdClass();
    $response->list=[];
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $counter=count($_POST['campusName']);
        for($x=0;$x<$counter;$x++){
            $query="SELECT COUNT(*) FROM approval WHERE approval.office=?";
            $statement=$con->prepare($query);
            $statement->bind_param("s",$_POST['campusName'][$x]);
            $statement->execute();
            $res=$statement->get_result()->fetch_row();
            $data= new stdClass();
            $data->CampusName=$_POST['campusName'][$x];
            $data->Total=$res[0].'';
            $response->list[]=$data;
        }
    }
    echo json_encode($response);
}
//SELECT approval.file,approval.date,approval.info FROM approval WHERE approval.office=?

if(isset($_POST['getFiles'])){
    $response= new stdClass();
    $response->list=[];
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $campus=$_POST['campusName'];
        $query="SELECT approval.file,approval.date,approval.info,approval.froms FROM approval WHERE approval.office=?";
        $statement=$con->prepare($query);
        $statement->bind_param("s",$campus);
        $statement->execute();
        $res=$statement->get_result();
        while ($val=$res->fetch_assoc()){
            $data=new stdClass();
            $data->name=$val['info'];
            $data->file=$val['file'];
            $data->date=$val['date'];
            $data->sender=$val['froms'];
            $response->list[]=$data;
        }

    }
    echo json_encode($response);
}

if(isset($_POST['eventRequest'])){
    $response= [];
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $query="SELECT * FROM event_list";
        $statement=$con->prepare($query);
        $statement->execute();
        $res=$statement->get_result();
        while ($val=$res->fetch_assoc()){
            $response[]=$val;
        }
    }
    echo json_encode($response);
}

if(isset($_POST['documentRequest'])){
    $response=[];
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $query="SELECT 
COUNT(researchallfile.eventType) as total,
researchallfile.eventType as event,
event_list.id 
FROM researchallfile
LEFT JOIN researchfile ON researchallfile.docid=researchfile.id
LEFT JOIN event_list ON researchallfile.eventType=event_list.name
GROUP BY researchallfile.eventType";
        $statement=$con->prepare($query);
        $statement->execute();
        $res=$statement->get_result();
        while ($val=$res->fetch_assoc()){
            $response[]=$val;
        }
    }
    echo json_encode($response);
}


if(isset($_POST['docPerEvent'])){
    $response=[];
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $query="SELECT
researchallfile.docid,
researchallfile.title,
researchallfile.author,
researchfile.category,
researchfile.campus
FROM event_list
RIGHT JOIN researchallfile ON event_list.name=researchallfile.eventType
LEFT JOIN researchfile ON researchallfile.docid=researchfile.id
WHERE event_list.id=?";
        $eventId=$_POST['eventId'];
        $statement=$con->prepare($query);
        $statement->bind_param('s',$eventId);
        $statement->execute();
        $res=$statement->get_result();
        while ($val=$res->fetch_assoc()){
            $response[]=$val;
        }
    }
    echo json_encode($response);

}

if(isset($_POST['docViewRequest'])){
    $response=new stdClass();
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $query="SELECT 
researchallfile.author,
researchallfile.title,
researchallfile.eventType as event,
researchfile.coauthor,
researchallfile.researchfile as file
FROM researchallfile
LEFT JOIN researchfile ON researchallfile.docid=researchfile.id
WHERE researchallfile.docid=?";
        $docId=$_POST['docId'];
        $statement=$con->prepare($query);
        $statement->bind_param('s',$docId);
        $statement->execute();
        $res=$statement->get_result();
        while ($val=$res->fetch_assoc()){
            $response=$val;
        }
    }
    echo json_encode($response);
}