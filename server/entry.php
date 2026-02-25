<?php

include ('db.php');

/** @var TYPE_NAME $host */

/** @var TYPE_NAME $username */

/** @var TYPE_NAME $pass */

/** @var TYPE_NAME $dbName */

if(isset($_POST['entryCounter'])){
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        
        // Define category mapping per center - using the EXACT format from researchfile.center
        $centerCategoryMapping = [
            "Coconut Research and Development Center (Coco RDC)" => ["Natural / Biological"],
            "Crop Science Research & Developement Center (CSRDC)" => ["Natural / Biological"],
            "Extension (Extension)" => ["Extension"],
            "Fisheries Research & Development Center (FRDC)" => ["Natural / Biological"],
            "Food and Industrial Technology Research & Development Center (FITRDC)" => ["Food"],
            "Livestock Research & Development Center (LRDC)" => ["Natural / Biological"],
            "Machinery and Agricultural Technology Engineering Center (MATEC)" => ["Industrial", "Engineering", "Information Technology", "Development", "Agricultural Machinery"],
            "Social Science Research & Development Center (SSRDC)" => ["Social Science"]
        ];
        
        // Get all centers from the center table
        $centerQuery = "SELECT id, code, name FROM center ORDER BY name ASC";
        $centerResult = $con->query($centerQuery);
        
        while ($centerRow = $centerResult->fetch_assoc()) {
            // Construct the center name in the format used by researchfile.center
            $centerFullName = $centerRow['name'] . " (" . $centerRow['code'] . ")";
            
            $centerObj = new stdClass();
            $centerObj->name = $centerFullName;
            $centerObj->total = 0;
            $centerObj->categories = [];
            
            // Get categories for this center from mapping using the full name
            $categories = isset($centerCategoryMapping[$centerFullName]) 
                ? $centerCategoryMapping[$centerFullName] 
                : [];
            
            // If no categories defined for this center, use a default
            if (empty($categories)) {
                $categories = ["Uncategorized"];
            }
            
            // For each category, get its count
            foreach ($categories as $categoryName) {
                $catObj = new stdClass();
                $catObj->name = $categoryName;
                
                // Get count for this category in this center for the selected event
                $catQuery = "SELECT COUNT(*) as total FROM researchfile
                    WHERE researchfile.status = 'accepted' 
                    AND researchfile.event = ? 
                    AND researchfile.center = ?
                    AND researchfile.category = ?";
                
                $catStmt = $con->prepare($catQuery);
                $catStmt->bind_param("sss", $_POST['eventType'], $centerFullName, $categoryName);
                $catStmt->execute();
                $catResult = $catStmt->get_result();
                $catTotal = $catResult->fetch_assoc();
                $catObj->total = $catTotal['total'] ? (int)$catTotal['total'] : 0;
                
                // Add to center total
                $centerObj->total += $catObj->total;
                
                $centerObj->categories[] = $catObj;
                $catStmt->close();
            }
            
            $response[] = $centerObj;
        }
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

if(isset($_POST['perCenterReport'])){
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        
        // Get all campuses
        $campusList = ['Central Office', 'Roxas City Main', 'Dayao', 'Pontevedra', 'Pilar', 
                      'Dumarao', 'Burias', 'Mambusao', 'Tapaz', 'Sigma'];
        
        $centerName = $_POST['center'];
        $categoryName = $_POST['category'];
        $eventType = $_POST['eventType'];
        
        foreach ($campusList as $campus) {
            $obj = new stdClass();
            $obj->name = $campus;
            $obj->total = 0;
            
            $query = "SELECT COUNT(*) as total FROM researchfile
                LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
                WHERE endorsement.status = 'accepted'
                AND researchfile.event = ?
                AND researchfile.center = ?
                AND researchfile.category = ?
                AND researchfile.campus = ?";
            
            $statement = $con->prepare($query);
            $statement->bind_param("ssss", $eventType, $centerName, $categoryName, $campus);
            $statement->execute();
            $result = $statement->get_result();
            
            if ($row = $result->fetch_assoc()) {
                $obj->total = $row['total'] ?: 0;
            }
            
            $response[] = $obj;
            $statement->close();
        }
    }
    
    echo json_encode($response);
}

if(isset($_POST['perCampReport'])){

    $response=[];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $camp= ['Central Office','Roxas City Main','Dayao','Pontevedra','Pilar','Dumarao','Burias','Mambusao','Tapaz','Sigma'];

        foreach ($camp as $v){

            $obj= new stdClass();

            $obj->name=$v;

            $obj->total='0';

            $response[]=$obj;

        }

        $query="SELECT researchfile.id, researchfile.category,researchfile.campus,COUNT(*) as total FROM researchfile

        LEFT JOIN endorsement ON researchfile.endorsementid=endorsement.id

        WHERE endorsement.status='accepted'AND researchfile.category=? AND researchfile.event=?

        GROUP BY researchfile.campus ";

        $statement=$con->prepare($query);

        $statement->bind_param("ss",$_POST['category'],$_POST['eventType']);

        $statement->execute();

        $result=$statement->get_result();

        while ($val=$result->fetch_assoc()){

            for($x=0;$x<sizeof($response);$x++){

                if($response[$x]->name===$val['campus']){

                    $response[$x]->total=$val['total'];

                }

            }

        }





    }

    echo json_encode($response);



}

if(isset($_POST['printSum'])) {
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        
        // First, get all centers from the center table
        $centerQuery = "SELECT id, code, name FROM center ORDER BY name ASC";
        $centerResult = $con->query($centerQuery);
        
        $centers = [];
        while ($centerRow = $centerResult->fetch_assoc()) {
            $centers[] = [
                'id' => $centerRow['id'],
                'code' => $centerRow['code'],
                'name' => $centerRow['name']
            ];
        }
        
        // Define category mapping per center (based on your centerCategoryMapping)
        $centerCategoryMapping = [
            "Crop Science Research & Developement Center (CSRDC)" => ["Natural / Biological"],
            "Livestock Research & Development Center (LRDC)" => ["Natural / Biological"],
            "Fisheries Research & Development Center (FRDC)" => ["Natural / Biological"],
            "Food and Industrial Technology Research & Development Center (FITRDC)" => ["Food"],
            "Social Science Research & Development Center (SSRDC)" => ["Social Science"],
            "Machinery and Agricultural Technology Engineering Center (MATEC)" => ["Industrial", "Engineering", "Information Technology", "Development", "Agricultural Machinery"],
            "Coconut Research and Development Center (Coco RDC)" => ["Natural / Biological"],
            "Extension (Extension)" => ["Extension"]
        ];
        
        // Get all unique categories from the mapping
        $allCategories = [];
        foreach ($centerCategoryMapping as $categories) {
            foreach ($categories as $category) {
                if (!in_array($category, $allCategories)) {
                    $allCategories[] = $category;
                }
            }
        }
        sort($allCategories); // Sort alphabetically
        
        // Get accepted research files for the specified event
        $query = "SELECT 
                    researchfile.id,
                    researchfile.center,
                    researchfile.category,
                    researchfile.campus,
                    researchfile.title,
                    researchfile.author,
                    endorsement.event
                  FROM researchfile
                  LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
                  WHERE endorsement.status = 'accepted' 
                  AND endorsement.event = ?";
        
        $statement = $con->prepare($query);
        $statement->bind_param("s", $_POST['eventName']);
        $statement->execute();
        $result = $statement->get_result();
        
        // Group by center
        $centerData = [];
        while ($row = $result->fetch_assoc()) {
            $centerName = $row['center'];
            $campus = $row['campus'] ?: 'Main Campus';
            $category = $row['category'];
            
            if (!isset($centerData[$centerName])) {
                $centerData[$centerName] = [
                    'center' => $centerName,
                    'campuses' => []
                ];
            }
            
            if (!isset($centerData[$centerName]['campuses'][$campus])) {
                $centerData[$centerName]['campuses'][$campus] = [
                    'campus' => $campus,
                    'categories' => []
                ];
                
                // Initialize all categories with 0
                foreach ($allCategories as $cat) {
                    $centerData[$centerName]['campuses'][$campus]['categories'][$cat] = 0;
                }
            }
            
            // Increment the count for this category
            if (isset($centerData[$centerName]['campuses'][$campus]['categories'][$category])) {
                $centerData[$centerName]['campuses'][$campus]['categories'][$category]++;
            }
        }
        
        // Format response for frontend
        foreach ($centerData as $centerName => $centerInfo) {
            $centerObj = new stdClass();
            $centerObj->center = $centerName;
            $centerObj->campuses = [];
            
            foreach ($centerInfo['campuses'] as $campusName => $campusInfo) {
                $campusObj = new stdClass();
                $campusObj->campus = $campusName;
                $campusObj->categories = [];
                
                foreach ($campusInfo['categories'] as $catName => $count) {
                    $catObj = new stdClass();
                    $catObj->name = $catName;
                    $catObj->total = $count;
                    $campusObj->categories[] = $catObj;
                }
                
                $centerObj->campuses[] = $campusObj;
            }
            
            $response[] = $centerObj;
        }
    }
    
    echo json_encode($response);
}

if(isset($_POST['entryView'])){
    $response=[];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="SELECT 
    researchfile.id,
    researchfile.file,
    researchfile.category
    FROM researchfile
    LEFT JOIN endorsement ON researchfile.endorsementid=endorsement.id
    WHERE  researchfile.id=? AND endorsement.status='accepted' LIMIT 1";
        $statement=$con->prepare($query);
        $statement->bind_param("s",$_POST['docId']);
        $statement->execute();
        $result=$statement->get_result();
        while ($val=$result->fetch_assoc()){
            $response[]= $val;
        }
    }
    echo json_encode($response);
}

if(isset($_POST['printEntry'])){
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventName = $_POST['eventName'];
        
        // Get event ID
        $eventQuery = "SELECT id, name FROM event_list WHERE name = ?";
        $eventStmt = $con->prepare($eventQuery);
        $eventStmt->bind_param("s", $eventName);
        $eventStmt->execute();
        $eventResult = $eventStmt->get_result();
        $eventRow = $eventResult->fetch_assoc();
        
        if (!$eventRow) {
            echo json_encode(['error' => 'Event not found']);
            return;
        }
        
        $data = new stdClass();
        $data->event = $eventRow['name'];
        $data->event_id = $eventRow['id'];
        $data->centers = [];
        
        // Get all centers from center table
        $centerQuery = "SELECT id, code, name FROM center ORDER BY name ASC";
        $centerResult = $con->query($centerQuery);
        
        // Define category mapping per center - using the EXACT format from researchfile.center
        $centerCategoryMapping = [
            "Coconut Research and Development Center (Coco RDC)" => ["Natural / Biological"],
            "Crop Science Research & Developement Center (CSRDC)" => ["Natural / Biological"],
            "Extension (Extension)" => ["Extension"],
            "Fisheries Research & Development Center (FRDC)" => ["Natural / Biological"],
            "Food and Industrial Technology Research & Development Center (FITRDC)" => ["Food"],
            "Livestock Research & Development Center (LRDC)" => ["Natural / Biological"],
            "Machinery and Agricultural Technology Engineering Center (MATEC)" => ["Industrial", "Engineering", "Information Technology", "Development", "Agricultural Machinery"],
            "Social Science Research & Development Center (SSRDC)" => ["Social Science"]
        ];
        
        while ($centerRow = $centerResult->fetch_assoc()) {
            // Construct the full center name with code in parentheses
            $centerFullName = $centerRow['name'] . " (" . $centerRow['code'] . ")";
            
            $center = new stdClass();
            $center->id = $centerRow['id'];
            $center->code = $centerRow['code'];
            $center->name = $centerFullName; // Use the full name with code
            $center->categories = [];
            
            // Get categories for this center based on mapping using the full name
            $centerCategories = isset($centerCategoryMapping[$centerFullName]) 
                ? $centerCategoryMapping[$centerFullName] 
                : [];
            
            foreach ($centerCategories as $categoryName) {
                $cat = new stdClass();
                $cat->category = $categoryName;
                $cat->docs = [];
                
                // Get research documents for this category and center
                // FIXED: Using researchfile.status instead of endorsement.status
                $resQuery = "SELECT 
                    researchfile.id,
                    researchfile.campus,
                    researchfile.title,
                    researchfile.author,
                    researchfile.coauthor,
                    researchfile.presenter,
                    researchfile.category
                FROM researchfile
                WHERE researchfile.category = ? 
                    AND researchfile.center = ?
                    AND researchfile.status = 'accepted' 
                    AND researchfile.event = ?";
                
                $resStmt = $con->prepare($resQuery);
                $resStmt->bind_param("sss", $categoryName, $centerFullName, $eventName);
                $resStmt->execute();
                $researchRes = $resStmt->get_result();
                
                while ($resRow = $researchRes->fetch_assoc()) {
                    $resData = new stdClass();
                    $resData->id = $resRow['id'];
                    $resData->campus = $resRow['campus'] ?: 'Main Campus';
                    $resData->title = $resRow['title'];
                    $resData->presenter = $resRow['presenter'] ?: 'Not specified';
                    $resData->category = $resRow['category'];
                    
                    // Combine author and coauthors
                    $authors = [];
                    if (!empty($resRow['author'])) {
                        $authors[] = $resRow['author'];
                    }
                    
                    if (!empty($resRow['coauthor'])) {
                        $coauthors = json_decode($resRow['coauthor'], true);
                        if (is_array($coauthors)) {
                            $authors = array_merge($authors, $coauthors);
                        }
                    }
                    
                    $resData->authors = $authors;
                    $cat->docs[] = $resData;
                }
                
                $resStmt->close();
                $center->categories[] = $cat;
            }
            
            $data->centers[] = $center;
        }
        
        $response[] = $data;
        $eventStmt->close();
    }
    echo json_encode($response);
}
