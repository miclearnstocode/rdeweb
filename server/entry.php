<?php

include ('db.php');


/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */


function isScientificName($text) {
    if (!$text || strlen(trim($text)) < 2) return false;
    $text = trim($text);

    // ── Hard exclusions ───────────────────────────────────────────────────
    if (preg_match('/\d/', $text)) return false;
    if (preg_match('/^[A-Z]{2,}$/', $text)) return false; // pure acronyms

    // ── Known scientific name patterns ────────────────────────────────────

    // Binomial: "Genus species", "Genus Species" (with or without capital)
    if (preg_match('/^[A-Z][a-z]{1,20}\s+[A-Z]?[a-z]{3,25}$/', $text)) return true;

    // Binomial + author: "Genus species L.", "Genus Species Linn."
    if (preg_match('/^[A-Z][a-z]{1,20}\s+[A-Z]?[a-z]{3,25}\s+[A-Z][a-zA-Z\.]{0,15}$/', $text)) return true;

    // Trinomial: "Genus species var. subspecies"
    if (preg_match('/^[A-Z][a-z]+\s+[A-Z]?[a-z]+\s+(var\.|subsp\.|ssp\.|f\.|cv\.)\s+[a-z]+$/i', $text)) return true;

    // Single word genus with strong Latin/Greek suffixes
    if (preg_match('/^[A-Z][a-z]{3,25}$/', $text)) {
        // Strong Latin/Greek genus endings used in taxonomy
        $latinGenusEndings = [
            // Animals
            'idae', 'inae', 'ini', 'oidea', 'iformes',
            // Plants  
            'aceae', 'ales', 'opsida', 'ophyta',
            // General Latin/Greek endings common in genus names
            'ia', 'ium', 'ius', 'ella', 'illa', 'ula', 'ulus',
            'aster', 'oides', 'opsis', 'phora', 'fera',
            'dendron', 'phyllum', 'carpus', 'anthus', 'spora',
            'myces', 'mycin', 'plasma', 'coccus', 'bacillus',
            'monas', 'vibrio', 'bacter',
        ];

        // Blocklist of common words that match the pattern
        $commonWords = [
            'Africa', 'America', 'Arabia', 'Armenia', 'Asia', 'Australia',
            'Austria', 'Bulgaria', 'Canada', 'China', 'Croatia', 'Cuba',
            'Russia', 'Serbia', 'Sierra', 'Syria', 'Tunisia', 'Uganda',
            'Victoria', 'Virginia', 'Bolivia', 'Colombia', 'Georgia',
            // Common English
            'Innovation', 'Development', 'Education', 'Production',
            'Assessment', 'Management', 'Research', 'Science', 'Health',
            'Program', 'Project', 'System', 'Design', 'Analysis',
            'Philippines', 'Western', 'Central', 'Northern', 'Southern',
            'Eastern', 'National', 'Regional', 'Provincial', 'Municipal',
            // Local places
            'Pilar', 'Tapaz', 'Sigma', 'Dayao', 'Capiz', 'Roxas', 'Burias',
            'Visayas', 'Pontevedra', 'Mambusao', 'Dumarao',
            // Common nouns
            'Food', 'Fish', 'Rice', 'Corn', 'Soil', 'Water', 'Plant',
            'Grass', 'Fruit', 'Meat', 'Milk', 'Chicken', 'Coconut',
            'Sugar', 'Banana', 'Mango', 'Guava', 'Garlic', 'Onion',
            'Pepper', 'Ginger', 'Coffee', 'Cacao', 'Bamboo', 'Bread',
        ];

        if (!in_array($text, $commonWords)) {
            foreach ($latinGenusEndings as $ending) {
                if (str_ends_with(strtolower($text), $ending)) {
                    return true;
                }
            }
        }
    }

    // Species epithet Latin suffixes (works inside multi-word names too)
    $latinSpeciesSuffixes = [
        // Very strong indicators - rarely appear in common words
        'rhynchos', 'platyrhynch', 'orhynchus',     // beak-related
        'pteryx', 'ptera', 'pteron',                 // wing-related  
        'cephalus', 'cephala',                       // head-related
        'phyllus', 'phylla', 'phyllum',              // leaf-related
        'carpus', 'carpa', 'carpum',                 // fruit-related
        'spermus', 'sperma',                         // seed-related
        'phyta', 'phytum',                           // plant-related
        'mycota', 'mycetes', 'myces',                // fungi-related
        'aceae', 'phyceae',                          // family endings
        // Species epithets
        'nucifera', 'officinalis', 'officinale',
        'vulgaris', 'vulgare', 'communis', 'commune',
        'sativus', 'sativa', 'sativum',
        'domesticus', 'domestica', 'domesticum',
        'sylvestris', 'sylvestre',
        'japonica', 'japonicum', 'japonicus',
        'chinensis', 'sinensis',
        'indica', 'indicus', 'indicum',
        'africana', 'africanus', 'africanum',
        'australis', 'australis',
        'orientalis', 'occidentalis',
        'maximus', 'maxima', 'maximum',
        'minor', 'minus', 'minimus', 'minima',
        'major', 'majus',
        'niger', 'nigra', 'nigrum',
        'alba', 'albus', 'album',
        'rubra', 'ruber', 'rubrum',
        'viridis', 'viride',
        'flavus', 'flava', 'flavum',
        'roseus', 'rosea', 'roseum',
        'aureus', 'aurea', 'aureum',
        'platensis', 'muricata', 'charantia',
        'annuum', 'canephora', 'umbellata',
        'miliaceum', 'platyrhynchos',
    ];

    $textLower = strtolower($text);
    foreach ($latinSpeciesSuffixes as $suffix) {
        if (str_contains($textLower, $suffix)) {
            return true;
        }
    }

    return false;
}

function formatScientificNames($text) {
    if (!$text || !is_string($text)) return '';
    
    // Pattern to find content within parentheses
    $pattern = '/\(([^)]+)\)/';
    
    $result = preg_replace_callback($pattern, function($matches) {
        $fullMatch = $matches[0];
        $content = trim($matches[1]);
        
        if (isScientificName($content)) {
            return '(' . '<i>' . $content . '</i>' . ')';
        }
        
        return $fullMatch;
    }, $text);
    
    return $result ?: $text; 
}

function formatDocumentTitle($title) {
    if (!$title || !is_string($title)) return '';
    return formatScientificNames($title);
}

function formatName($name) {
    if (!$name) return '';
    
    // First, clean up the entire string by removing common patterns
    
    // Remove "by - " or "by " at the beginning
    $name = preg_replace('/^by\s+-?\s*/i', '', $name);
    
    // Remove standalone dash at the beginning or end
    $name = preg_replace('/^\s*-\s*|\s*-\s*$/', '', $name);
    
    // Remove dash followed by title (like "- Dr." or "-Dr.")
    $name = preg_replace('/-\s*(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $name);
    
    // Remove dash followed by anything that looks like a position description
    $name = preg_replace('/-\s*[A-Za-z\s]+$/', '', $name);
    
    // Remove everything after a slash (position descriptions)
    if (strpos($name, '/') !== false) {
        $parts = explode('/', $name);
        // Take the first part, but also check if it contains "by" or other patterns
        $name = trim($parts[0]);
    }
    
    // Remove everything after a dash ONLY if it's followed by a space and a word that looks like a title/position
    if (preg_match('/\s+-\s+(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Extension|Development|Research)/i', $name)) {
        $name = trim(explode(' - ', $name)[0]);
    }
    
    // Also handle dash without spaces
    if (preg_match('/-(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Extension|Development|Research)/i', $name)) {
        $parts = preg_split('/-(?=Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Extension|Development|Research)/i', $name);
        $name = trim($parts[0]);
    }
    
    // List of titles to remove from the beginning
    $titlesToRemove = [
        '^dr\.?\s+',
        '^prof\.?\s+',
        '^professor\s+',
        '^assoc\.?\s*prof\.?\s+',
        '^asso\.?\s*prof\.?\s+',
        '^associate\s+professor\s+',
        '^asst\.?\s*prof\.?\s+',
        '^assistant\s+professor\s+',
        '^instructor\s+',
        '^lecturer\s+',
        '^mr\.?\s+',
        '^mrs\.?\s+',
        '^ms\.?\s+',
        '^miss\s+'
    ];
    
    // Academic suffixes to remove from the end
    $suffixesToRemove = [
        ',\s*ph\.?d\.?',
        ',\s*md',
        ',\s*dvm',
        ',\s*jd',
        ',\s*llb',
        ',\s*llm',
        ',\s*rn',
        ',\s*cpa',
        ',\s*cma',
        ',\s*cfa',
        ',\s*pe',
        ',\s*arch',
        ',\s*ed\.?d\.?',
        ',\s*dba',
        ',\s*mph',
        ',\s*ms',
        ',\s*ma',
        ',\s*mba',
        ',\s*mft',
        ',\s*drph',
        ',\s*pharmd',
        ',\s*pt',
        ',\s*ot',
        ',\s*ece',
        ',\s*mcs',
        ',\s*maed',
        ',\s*edd',
        '\s+iii$',
        '\s+iv$',
        '\s+v$',
        '\s+vi$',
        '\s+vii$',
        '\s+viii$',
        '\s+ix$',
        '\s+x$'
    ];
    
    // Remove titles from the beginning
    foreach ($titlesToRemove as $pattern) {
        $name = preg_replace('/' . $pattern . '/i', '', $name);
    }
    
    // Remove suffixes from the end
    foreach ($suffixesToRemove as $pattern) {
        $name = preg_replace('/' . $pattern . '$/i', '', $name);
    }
    
    // Remove standalone academic abbreviations that might be in the middle
    $academicAbbr = [
        '\s+ph\.?d\.?',
        '\s+md',
        '\s+dvm',
        '\s+jd',
        '\s+llb',
        '\s+llm',
        '\s+rn',
        '\s+cpa',
        '\s+cma',
        '\s+cfa',
        '\s+pe',
        '\s+arch',
        '\s+ed\.?d\.?',
        '\s+dba',
        '\s+mph',
        '\s+ms',
        '\s+ma',
        '\s+mba',
        '\s+mft',
        '\s+drph',
        '\s+pharmd',
        '\s+pt',
        '\s+ot',
        '\s+ece',
        '\s+mcs',
        '\s+maed',
        '\s+edd'
    ];
    
    foreach ($academicAbbr as $pattern) {
        $name = preg_replace('/' . $pattern . '\b/i', '', $name);
    }
    
    // Remove common titles with dots
    $name = preg_replace('/\b(Dr\.|Asso\.|Assoc\.|Asst\.|Prof\.|Professor|Instructor|Lecturer|Mr\.|Mrs\.|Ms\.)\s*/i', '', $name);
    
    // Trim any remaining whitespace
    $name = trim($name);
    
    // Clean up multiple spaces
    $name = preg_replace('/\s+/', ' ', $name);
    
    // Remove any remaining standalone dash at the beginning
    $name = preg_replace('/^\s*-\s*/', '', $name);
    
    // Handle name formatting for uppercase names
    if (preg_match('/[A-Z]{2,}/', $name)) {
        $words = explode(' ', $name);
        $formattedWords = [];
        
        foreach ($words as $word) {
            // Skip empty words
            if (empty($word)) continue;
            
            // Check if word is all uppercase (and longer than 1 character)
            if ($word === strtoupper($word) && strlen($word) > 1) {
                // Handle hyphenated names like "R-Jun"
                if (strpos($word, '-') !== false) {
                    $hyphenParts = explode('-', $word);
                    $formattedHyphenParts = [];
                    foreach ($hyphenParts as $part) {
                        // If it's a single letter like "R", keep it uppercase
                        if (strlen($part) === 1) {
                            $formattedHyphenParts[] = strtoupper($part);
                        } else {
                            $formattedHyphenParts[] = ucwords(strtolower($part));
                        }
                    }
                    $formattedWords[] = implode('-', $formattedHyphenParts);
                } else {
                    // Convert to proper case but preserve known name prefixes
                    $lowercaseWord = strtolower($word);
                    // Common name prefixes that should remain lowercase
                    $prefixes = ['de', 'del', 'dela', 'van', 'von', 'da', 'do', 'dos', 'das'];
                    if (in_array($lowercaseWord, $prefixes)) {
                        $formattedWords[] = $lowercaseWord;
                    } else {
                        $formattedWords[] = ucwords($lowercaseWord);
                    }
                }
            } else {
                // Handle hyphenated names that might already be mixed case
                if (strpos($word, '-') !== false) {
                    $hyphenParts = explode('-', $word);
                    $formattedHyphenParts = [];
                    foreach ($hyphenParts as $part) {
                        if (strlen($part) === 1 && ctype_upper($part)) {
                            $formattedHyphenParts[] = $part;
                        } else {
                            $formattedHyphenParts[] = ucwords(strtolower($part));
                        }
                    }
                    $formattedWords[] = implode('-', $formattedHyphenParts);
                } else {
                    $formattedWords[] = $word;
                }
            }
        }
        
        $name = implode(' ', $formattedWords);
    }
    
    // Final cleanup
    $name = trim($name);
    $name = preg_replace('/\s+/', ' ', $name);
    $name = preg_replace('/\s*-\s*/', '-', $name); // Clean up spaces around hyphens
    
    return $name;
}

function formatAuthors($authors) {
    if (!$authors || !is_array($authors) || count($authors) === 0) return [];
    
    // Handle cases where authors might be a single string with multiple authors
    if (count($authors) === 1) {
        $authorString = $authors[0];
        
        // Split by comma, but be careful with "Dr." which contains a dot
        // First, temporarily replace "Dr." with a placeholder
        $authorString = str_replace('Dr.', '___DR___', $authorString);
        
        // Now split by comma
        if (strpos($authorString, ',') !== false) {
            $splitAuthors = explode(',', $authorString);
            $result = [];
            
            foreach ($splitAuthors as $author) {
                // Restore "Dr." and format
                $author = str_replace('___DR___', 'Dr.', trim($author));
                $result[] = formatName($author);
            }
            
            return $result;
        }
        
        // Restore if no split happened
        $authorString = str_replace('___DR___', 'Dr.', $authorString);
        return [formatName($authorString)];
    }
    
    return array_map('formatName', $authors);
}

function sortContentAlphabetically($data) {
    if (!$data || count($data) === 0) return [];
    
    return array_map(function($event) {
        // First, filter and sort all centers
        $sortedCenters = array_map(function($center) {
            // Filter categories with docs
            $center->categories = array_filter($center->categories, function($cat) {
                return isset($cat->docs) && count($cat->docs) > 0;
            });
            
            // Sort categories alphabetically
            usort($center->categories, function($a, $b) {
                return strcmp($a->category, $b->category);
            });
            
            // Sort docs alphabetically by title within each category
            foreach ($center->categories as $cat) {
                if (isset($cat->docs) && count($cat->docs) > 0) {
                    usort($cat->docs, function($a, $b) {
                        return strcmp($a->title, $b->title);
                    });
                }
            }
            
            return $center;
        }, $event->centers);
        
        // Remove centers with no docs
        $sortedCenters = array_filter($sortedCenters, function($center) {
            return count($center->categories) > 0;
        });
        
        // Separate Extension center and other centers
        $extensionCenter = null;
        $otherCenters = [];
        
        foreach ($sortedCenters as $center) {
            if (stripos($center->name, 'extension') !== false) {
                $extensionCenter = $center;
                $extensionCenter->displayName = 'Extension';
            } else {
                $otherCenters[] = $center;
            }
        }
        
        // Sort other centers alphabetically
        usort($otherCenters, function($a, $b) {
            return strcmp($a->name, $b->name);
        });
        
        // Combine with Extension first
        $finalCenters = [];
        if ($extensionCenter) {
            $finalCenters[] = $extensionCenter;
        }
        $finalCenters = array_merge($finalCenters, $otherCenters);
        
        $event->centers = $finalCenters;
        return $event;
    }, $data);
}

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
                    $resData->title = formatDocumentTitle($resRow['title']);
                    
                    // Format presenter name using helper function
                    $resData->presenter = formatName($resRow['presenter'] ?: 'Not specified');
                    $resData->category = $resRow['category'];
                    
                    // Combine author and coauthors and format them
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
                    
                    // Format all author names
                    $resData->authors = formatAuthors($authors);
                    $cat->docs[] = $resData;
                }
                
                $resStmt->close();
                
                // Only add category if it has documents
                if (count($cat->docs) > 0) {
                    $center->categories[] = $cat;
                }
            }
            
            // Only add center if it has categories with documents
            if (count($center->categories) > 0) {
                $data->centers[] = $center;
            }
        }
        
        // Apply sorting to the data before sending
        $sortedData = sortContentAlphabetically([$data]);
        $response = $sortedData;
        
        $eventStmt->close();
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}