<?php

include('db.php');

/** @var TYPE_NAME $host */

/** @var TYPE_NAME $username */

/** @var TYPE_NAME $pass */

/** @var TYPE_NAME $dbName */


if (isset($_POST[''])) {

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query = "CREATE TABLE `logs` (

  `id` bigint(200) NOT NULL,

  `user_id` bigint(200) NOT NULL,

  `details` text NOT NULL,

  `date` datetime NOT NULL DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";


        $statement = $con->prepare($query);

        $stat = $statement->execute();

        if ($stat) {

            $query2 = "ALTER TABLE `logs`

  ADD PRIMARY KEY (`id`),

  ADD KEY `user_id` (`user_id`)";


            $stm = $con->prepare($query2);

            $stat2 = $stm->execute();

            if ($stat2) {

                $query3 = "ALTER TABLE `logs`

  MODIFY `id` bigint(200) NOT NULL AUTO_INCREMENT";

                $stm3 = $con->prepare($query3);

                $stat3 = $stm3->execute();

                if ($stat3) {

                    $query4 = "ALTER TABLE `logs`

  ADD CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `account_detail` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION";

                    $stm4 = $con->prepare($query4);

                    $stat4 = $stm4->execute();

                    if ($stat4) {

                        echo "Successfully created";

                    } else {

                        $stm4->error;

                    }

                } else {

                    echo $stm3->error;

                }

            } else {

                $stm->error;

            }


        } else {

            echo $statement->error;

        }

    }


}


if (isset($_POST['modifydb'])) {

    $response = [];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $query = "SELECT logs.id,account_detail.fullName,logs.details,logs.date FROM logs 

LEFT JOIN account_detail ON logs.user_id=account_detail.id

";

        $statement = $con->prepare($query);

        $status = $statement->execute();

        if ($status) {

            $res = $statement->get_result();

            while ($row = $res->fetch_assoc()) {

                $response[] = $row;

            }

        } else {

            echo $statement->error;

        }


    }

    echo json_encode($response);

}


//ALTER TABLE `communication` CHANGE `doc_type` `doc_type` BIGINT(200) NULL

//ALTER TABLE `communication` ADD `doc_type` INT NOT NULL AFTER `title`;

if (isset($_POST['doctypeMod'])) {

    $response = "";

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $queryArray = array(

            "ALTER TABLE `admin` CHANGE `id` `id` BIGINT(200) NOT NULL AUTO_INCREMENT",

        );


        $count = 1;

        foreach ($queryArray as $query) {

            $statement = $con->prepare($query);

            $state = $statement->execute();

            if ($state) {


                $response .= "Success" . $count . "\n\n";

            } else {

                $response .= $statement->error . "\n\n";

            }

            $count++;

        }


    } else {

        $response = $con->error;

    }

    echo $response;

}


if (isset($_POST['dbUpload'])) {


    $query = [];

    $query[] = "CREATE TABLE `account_detail` (

  `id` bigint(200) NOT NULL,

  `fullName` text DEFAULT NULL,

  `campus` text DEFAULT NULL,

  `email` text DEFAULT NULL,

  `usertype` text DEFAULT NULL,

  `date` datetime NOT NULL DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "INSERT INTO `account_detail` (`id`, `fullName`, `campus`, `email`, `usertype`, `date`) VALUES

(1, 'Andy Mark Servania', 'Dayao', 'warzservania@gmail.com', 'Research Chair', '2022-06-23 09:19:12');";


    $query[] = "CREATE TABLE `admin` (

  `id` bigint(200) NOT NULL,

  `username` varchar(20) DEFAULT NULL,

  `password` varchar(20) DEFAULT NULL,

  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`))

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";


    $query[] = "INSERT INTO `admin` (`id`, `username`, `password`, `data`) VALUES

(2017, 'admin', '12345', NULL)";


    $query[] = "CREATE TABLE `approval` (

  `id` bigint(200) NOT NULL,

  `senderId` text DEFAULT NULL,

  `senderemail` text DEFAULT NULL,

  `froms` text DEFAULT NULL,

  `file` text DEFAULT NULL,

  `status` text DEFAULT NULL,

  `note` text DEFAULT NULL,

  `approvalName` text DEFAULT NULL,

  `approvalEmail` text DEFAULT NULL,

  `approvalSignLeft` text DEFAULT NULL,

  `approvalSignTop` text DEFAULT NULL,

  `approvalPage` text DEFAULT NULL,

  `approvalSignUrl` text DEFAULT NULL,

  `approvalSignScale` text DEFAULT NULL,

  `approvalStatus` text DEFAULT NULL,

  `approvalNote` text DEFAULT NULL,

  `approvalId` text DEFAULT NULL,

  `approvalDate` datetime DEFAULT NULL ON UPDATE current_timestamp(),

  `info` text DEFAULT NULL,

  `doc_type` text DEFAULT NULL,

  `office` text DEFAULT NULL,

  `responsedocs` text DEFAULT NULL,

  `save` text DEFAULT NULL,

  `date` datetime DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `capsu_user` (

  `id` bigint(200) NOT NULL,

  `username` text NOT NULL,

  `password` longtext DEFAULT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4

";

    $query[] = "CREATE TABLE `chat` (

  `id` int(200) NOT NULL,

  `convo_id` int(200) NOT NULL,

  `message` longtext DEFAULT NULL,

  `sender` bigint(200) DEFAULT NULL,

  `date` datetime NOT NULL DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "

CREATE TABLE `chatall` (

  `id` bigint(200) NOT NULL,

  `senderid` bigint(200) NOT NULL,

  `message` longtext NOT NULL,

  `date` datetime NOT NULL DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `chat_file` (

  `id` int(200) NOT NULL,

  `convoid` bigint(200) NOT NULL,

  `file_name` text DEFAULT NULL,

  `file_type` text DEFAULT NULL,

  `url` text NOT NULL,

  `sender` bigint(200) DEFAULT NULL,

  `date` datetime NOT NULL DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `comments` (

  `resid` bigint(200) NOT NULL,

  `evalid` bigint(200) NOT NULL,

  `eventType` text DEFAULT NULL,

  `intro` text DEFAULT NULL,

  `abstract` text DEFAULT NULL,

  `objective` text DEFAULT NULL,

  `methodology` text DEFAULT NULL,

  `results` text DEFAULT NULL,

  `recommendation` text DEFAULT NULL,

  `literature` text DEFAULT NULL,

  `other` text DEFAULT NULL,

  `date` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `communication` (

  `docid` bigint(200) DEFAULT NULL,

  `campus` text DEFAULT NULL,

  `senderid` bigint(200) DEFAULT NULL,

  `rdeStaff` text DEFAULT NULL,

  `file` text DEFAULT NULL,

  `title` text DEFAULT NULL,

  `doc_type` text DEFAULT NULL,

  `date` datetime DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `convo_pair` (

  `id` int(11) NOT NULL,

  `user_a` text DEFAULT NULL,

  `user_b` text DEFAULT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `convo_session` (

  `session_id` int(200) NOT NULL,

  `convo_id` int(200) NOT NULL,

  `user` text DEFAULT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `deletedresearch` (

  `id` bigint(200) DEFAULT NULL,

  `title` text DEFAULT NULL,

  `event` text DEFAULT NULL,

  `campus` text DEFAULT NULL,

  `accountuser` text DEFAULT NULL,

  `reason` text DEFAULT NULL,

  `rdeStaff` text NOT NULL,

  `date` datetime DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `document` (

  `id` int(11) NOT NULL,

  `docid` text DEFAULT NULL,

  `name` text DEFAULT NULL,

  `file` text DEFAULT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `documenttravel` (

  `docid` bigint(200) NOT NULL,

  `userid` text DEFAULT NULL,

  `currentloc` text DEFAULT NULL,

  `date` datetime DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `document_log` (

  `id` bigint(200) NOT NULL,

  `user_id` bigint(200) NOT NULL,

  `doc_id` bigint(200) NOT NULL,

  `details` text NOT NULL,

  `date` datetime NOT NULL DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `document_type` (

  `id` bigint(20) NOT NULL,

  `name` text DEFAULT NULL,

  `date` datetime NOT NULL DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `doc_request` (

  `id` int(11) NOT NULL,

  `sender_id` bigint(200) NOT NULL,

  `owner_id` bigint(200) NOT NULL,

  `docId` bigint(200) NOT NULL,

  `date` datetime NOT NULL DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `endorsement` (

  `id` bigint(200) NOT NULL,

  `senderid` text DEFAULT NULL,

  `campus` text DEFAULT NULL,

  `file` text DEFAULT NULL,

  `event` text NOT NULL,

  `status` text DEFAULT NULL,

  `date` datetime DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `evaluator` (

  `id` bigint(200) NOT NULL,

  `fullname` text DEFAULT NULL,

  `username` text DEFAULT NULL,

  `password` text DEFAULT NULL,

  `category` text DEFAULT NULL,

  `eventid` bigint(200) DEFAULT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `event` (

  `id` bigint(200) NOT NULL,

  `name` text DEFAULT NULL,

  `dead_line` datetime NOT NULL DEFAULT current_timestamp(),

  `status` tinyint(1) DEFAULT NULL,

  `date` datetime NOT NULL DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `files` (

  `id` text DEFAULT NULL,

  `sender` text DEFAULT NULL,

  `userid` text DEFAULT NULL,

  `description` text DEFAULT NULL,

  `url` text DEFAULT NULL,

  `date` text DEFAULT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `rdestaff` (

  `id` bigint(200) NOT NULL,

  `email` text DEFAULT NULL,

  `username` text DEFAULT NULL,

  `password` text DEFAULT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `recomendation` (

  `id` bigint(200) NOT NULL,

  `userid` bigint(200) DEFAULT NULL,

  `recom` text DEFAULT NULL,

  `date` datetime NOT NULL DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `rejecteddocs` (

  `id` bigint(200) NOT NULL,

  `docid` bigint(200) NOT NULL,

  `url` text DEFAULT NULL,

  `type` text DEFAULT NULL,

  `rejectedby` text DEFAULT NULL,

  `reason` text DEFAULT NULL,

  `date` timestamp NOT NULL DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "

CREATE TABLE `researchallfile` (

  `docid` bigint(200) NOT NULL,

  `author` text DEFAULT NULL,

  `title` text DEFAULT NULL,

  `researchfile` text DEFAULT NULL,

  `eventType` text DEFAULT NULL,

  `date` datetime DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "

CREATE TABLE `researchfile` (

  `id` bigint(200) NOT NULL,

  `senderid` text DEFAULT NULL,

  `endorsementid` bigint(200) DEFAULT NULL,

  `author` text DEFAULT NULL,

  `title` text DEFAULT NULL,

  `file` text DEFAULT NULL,

  `deletestate` text DEFAULT NULL,

  `event` text DEFAULT NULL,

  `viewer` text DEFAULT NULL,

  `status` text DEFAULT NULL,

  `campus` text DEFAULT NULL,

  `coauthor` text DEFAULT NULL,

  `category` text DEFAULT NULL,

  `year` text DEFAULT NULL,

  `month` text DEFAULT NULL,

  `date` date DEFAULT NULL,

  `reviews` longtext DEFAULT NULL,

  `save` text DEFAULT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "

CREATE TABLE `shared_docs` (

  `id` int(11) NOT NULL,

  `owner_id` bigint(20) NOT NULL,

  `doc_id` bigint(200) NOT NULL,

  `user_request_id` bigint(200) NOT NULL,

  `date` datetime NOT NULL DEFAULT current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `signature` (

  `user_id` bigint(100) NOT NULL,

  `signature_url` text DEFAULT NULL,

  `scale` int(100) DEFAULT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `systemfiles` (

  `id` text DEFAULT NULL,

  `origin` text DEFAULT NULL,

  `office` text DEFAULT NULL,

  `name` text DEFAULT NULL,

  `type` text DEFAULT NULL,

  `source` longtext DEFAULT NULL,

  `date` text DEFAULT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "CREATE TABLE `userapproval` (

  `docid` bigint(200) DEFAULT NULL,

  `fileUrl` text DEFAULT NULL,

  `office` text DEFAULT NULL,

  `userid` text DEFAULT NULL,

  `fullname` text DEFAULT NULL,

  `email` text DEFAULT NULL,

  `signLeft` text DEFAULT NULL,

  `signTop` text DEFAULT NULL,

  `signPage` text DEFAULT NULL,

  `status` text DEFAULT NULL,

  `signurl` text DEFAULT NULL,

  `scale` text DEFAULT NULL,

  `note` text DEFAULT NULL,

  `date` datetime DEFAULT current_timestamp(),

  `updated` datetime DEFAULT NULL ON UPDATE current_timestamp()

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $query[] = "ALTER TABLE `account_detail`

  ADD PRIMARY KEY (`id`)";

    $query[] = "ALTER TABLE `admin`

  ADD PRIMARY KEY (`id`)";

    $query[] = "ALTER TABLE `approval`

  ADD PRIMARY KEY (`id`)";

    $query[] = "ALTER TABLE `capsu_user`

  ADD PRIMARY KEY (`id`),

  ADD KEY `id` (`id`)";

    $query[] = "ALTER TABLE `chat`

  ADD PRIMARY KEY (`id`)";

    $query[] = "ALTER TABLE `comments`

  ADD KEY `resid` (`resid`),

  ADD KEY `evalid` (`evalid`)";

    $query[] = "ALTER TABLE `communication`

  ADD KEY `docid` (`docid`)";

    $query[] = "ALTER TABLE `convo_pair`

  ADD PRIMARY KEY (`id`)";

    $query[] = "ALTER TABLE `convo_session`

  ADD PRIMARY KEY (`session_id`)";

    $query[] = "ALTER TABLE `document`

  ADD PRIMARY KEY (`id`)";

    $query[] = "ALTER TABLE `documenttravel`

  ADD KEY `docid` (`docid`)";

    $query[] = "ALTER TABLE `document_log`

  ADD PRIMARY KEY (`id`)";

    $query[] = "ALTER TABLE `document_type`

  ADD PRIMARY KEY (`id`)";

    $query[] = "ALTER TABLE `doc_request`

  ADD PRIMARY KEY (`id`)";

    $query[] = "ALTER TABLE `endorsement`

  ADD PRIMARY KEY (`id`)";

    $query[] = "ALTER TABLE `evaluator`

  ADD PRIMARY KEY (`id`)";

    $query[] = "ALTER TABLE `event`

  ADD PRIMARY KEY (`id`)";

    $query[] = "ALTER TABLE `rdestaff`

  ADD PRIMARY KEY (`id`)";

    $query[] = "ALTER TABLE `recomendation`

  ADD PRIMARY KEY (`id`)";

    $query[] = "ALTER TABLE `rejecteddocs`

  ADD PRIMARY KEY (`id`),

  ADD KEY `docid` (`docid`)";

    $query[] = "ALTER TABLE `researchallfile`

  ADD PRIMARY KEY (`docid`),

  ADD KEY `docid` (`docid`)";

    $query[] = "ALTER TABLE `researchfile`

  ADD PRIMARY KEY (`id`),

  ADD KEY `endorsementid` (`endorsementid`)";

    $query[] = "ALTER TABLE `shared_docs`

  ADD PRIMARY KEY (`id`),

  ADD KEY `id` (`id`)";

    $query[] = "ALTER TABLE `signature`

  ADD PRIMARY KEY (`user_id`),

  ADD KEY `user_id` (`user_id`),

  ADD KEY `user_id_2` (`user_id`)";

    $query[] = "ALTER TABLE `userapproval`

  ADD KEY `docid` (`docid`)";

    $query[] = "ALTER TABLE `account_detail`

  MODIFY `id` bigint(200) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2";

    $query[] = "ALTER TABLE `approval`

  MODIFY `id` bigint(200) NOT NULL AUTO_INCREMENT";

    $query[] = "ALTER TABLE `chat`

  MODIFY `id` int(200) NOT NULL AUTO_INCREMENT";

    $query[] = "ALTER TABLE `convo_pair`

  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT";

    $query[] = "ALTER TABLE `convo_session`

  MODIFY `session_id` int(200) NOT NULL AUTO_INCREMENT";

    $query[] = "ALTER TABLE `document`

  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT";

    $query[] = "ALTER TABLE `document_log`

  MODIFY `id` bigint(200) NOT NULL AUTO_INCREMENT";

    $query[] = "ALTER TABLE `document_type`

  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT";

    $query[] = "ALTER TABLE `doc_request`

  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT";

    $query[] = "ALTER TABLE `endorsement`

  MODIFY `id` bigint(200) NOT NULL AUTO_INCREMENT";

    $query[] = "ALTER TABLE `event`

  MODIFY `id` bigint(200) NOT NULL AUTO_INCREMENT";

    $query[] = "ALTER TABLE `recomendation`

  MODIFY `id` bigint(200) NOT NULL AUTO_INCREMENT";

    $query[] = "ALTER TABLE `researchfile`

  MODIFY `id` bigint(200) NOT NULL AUTO_INCREMENT";

    $query[] = "ALTER TABLE `capsu_user`

  ADD CONSTRAINT `capsu_user_ibfk_1` FOREIGN KEY (`id`) REFERENCES `account_detail` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION";

    $query[] = "ALTER TABLE `comments`

  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`evalid`) REFERENCES `evaluator` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,

  ADD CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`resid`) REFERENCES `researchfile` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION";

    $query[] = "ALTER TABLE `documenttravel`

  ADD CONSTRAINT `documenttravel_ibfk_1` FOREIGN KEY (`docid`) REFERENCES `approval` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION";

    $query[] = "ALTER TABLE `rejecteddocs`

  ADD CONSTRAINT `rejecteddocs_ibfk_1` FOREIGN KEY (`docid`) REFERENCES `endorsement` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION";

    $query[] = "ALTER TABLE `researchallfile`

  ADD CONSTRAINT `researchallfile_ibfk_1` FOREIGN KEY (`docid`) REFERENCES `researchfile` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION";

    $query[] = "ALTER TABLE `researchfile`

  ADD CONSTRAINT `researchfile_ibfk_1` FOREIGN KEY (`endorsementid`) REFERENCES `endorsement` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION";

    $query[] = "ALTER TABLE `shared_docs`

  ADD CONSTRAINT `shared_docs_ibfk_1` FOREIGN KEY (`id`) REFERENCES `doc_request` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION";

    $query[] = "ALTER TABLE `signature`

  ADD CONSTRAINT `signature_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `account_detail` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION";


    /*

     * if ($con = new mysqli($host, $username, $pass, $dbName)) {

        foreach($query as $val){

            $statement=$con->prepare($val);

            $stat=$statement->execute();

            if(!$stat){

                echo $statement->error;

            }

        }

    }

     */


}


if (isset($_POST['timeZone'])) {

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $statement = $con->prepare("SET time_zone = '+08:00'");

        $status = $statement->execute();

        if (!$status) {

            echo $statement->error;

        }

    }

}