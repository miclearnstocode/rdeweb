<?php

$host='localhost';
$username='root';
$pass='';
$dbName='capsued_rdesystem';

// Create connection
$conn = new mysqli($host, $username, $pass, $dbName);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

//Email
$rdeEmail='capizstatecapsudayao@gmail.com';
$emailPassword='vuxbtbqimnjiawkw';

//CAPSU EMAIL
//$rdeEmail='rdesystem@capsu.edu.ph';
//$emailPassword='rd3LEAD$';

//Capsu BlueHOST

//$host='localhost';
//$username='app_rdeweb';
//$pass='we@re0neCapsu';
//$dbName='app_rdeweb_db';

//Capsu HOST

//$host='localhost';
//$username='capsued_rde';
//$pass='capsurde123456';
//$dbName='capsued_rdesystem';



//webhost app old server


//$host='localhost';
//$username='id17607253_researchcapsu';
//$pass='<d{>_N*/6lfui$28';
//$dbName='id17607253_rdecapsu';


// free infinity webserver
//$host='sql112.epizy.com';
//$username='epiz_30071363';
//$pass='rAtkvfKN3HZcR';
//$dbName='epiz_30071363_rdecentral';


// webhostapp new app
//$host='sql112.epizy.com';
//$username='epiz_30071363';
//$password='rAtkvfKN3HZcR';
//$dbname='^b?hhqNZdYL75?j2';
//$dbname='id17766983_rdecentral';

class Auth{
    private  $status;
    private  $userType;
    private  $userName;
    private  $accountName;
    private  $office;
    private  $id;
    private $email;
    private $fullName;
    private $signature;

    public function __construct($status,$userType,$userName,$office,$id,$accountName,$email,$fullName,$signature)
    {
        $this->status=$status;
        $this->userType=$userType;
        $this->userName=$userName;
        $this->office=$office;
        $this->id=$id;
        $this->accountName=$accountName;
        $this->email=$email;
        $this->fullName=$fullName;
        $this->signature=$signature;

    }

    /**
     * @return mixed
     */
    public function getSignature()
    {
        return $this->signature;
    }

    /**
     * @return mixed
     */
    public function getAccountName()
    {
        return $this->accountName;
    }

    /**
     * @return mixed
     */
    public function getFullName()
    {
        return $this->fullName;
    }

    /**
     * @return mixed
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return bool
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @return string
     */
    public function getUserType()
    {
        return $this->userType;
    }

    /**
     * @return string
     */
    public function getUserName()
    {
        return $this->userName;
    }

    /**
     * @return string
     */
    public function getOffice()
    {
        return $this->office;
    }
}


function deleteAll($dir) {
    foreach(glob($dir.'/*') as $file) {
        if(is_dir($file)) {
            deleteAll($file);
        }
        else {
            unlink($file);
        }
    }
    rmdir($dir);
}