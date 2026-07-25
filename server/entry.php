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


function normalizeString($string) {
    // Convert to lowercase
    $string = strtolower($string);
    
    // Remove extra spaces
    $string = preg_replace('/\s+/', ' ', $string);
    
    // Remove special characters but keep letters and numbers
    $string = preg_replace('/[^a-z0-9\s]/', '', $string);
    
    // Trim
    $string = trim($string);
    
    return $string;
}


function isSimilarString($str1, $str2, $threshold = 80) {
    $str1 = normalizeString($str1);
    $str2 = normalizeString($str2);
    
    // If exactly the same after normalization, they're duplicates
    if ($str1 === $str2) {
        return true;
    }
    
    // Calculate Levenshtein distance
    $distance = levenshtein($str1, $str2);
    $maxLength = max(strlen($str1), strlen($str2));
    
    if ($maxLength === 0) {
        return true;
    }
    
    // Calculate similarity percentage
    $similarity = (1 - $distance / $maxLength) * 100;
    
    return $similarity >= $threshold;
}

function normalizeAuthorName($name) {
    // Remove titles
    $name = preg_replace('/\b(Dr\.|Prof\.|Professor|Asso\.|Assoc\.|Asst\.|Mr\.|Mrs\.|Ms\.)\s*/i', '', $name);
    
    // Remove suffixes
    $name = preg_replace('/\s*(Ph\.?D\.?|MD|DVM|JD|LLB|LLM|RN|CPA|CMA|CFA|PE|Arch|Ed\.?D\.?|DBA|MPH|MS|MA|MBA|MFT|DrPH|PharmD|PT|OT|ECE|MCS|MAED|EDD)\s*/i', '', $name);
    
    // Convert to lowercase
    $name = strtolower($name);
    
    // Remove special characters
    $name = preg_replace('/[^a-z0-9\s]/', '', $name);
    
    // Remove extra spaces
    $name = preg_replace('/\s+/', ' ', $name);
    
    return trim($name);
}

function areAuthorsSimilar($authors1, $authors2, $threshold = 80) {
    // Normalize all authors
    $normalized1 = array_map('normalizeAuthorName', $authors1);
    $normalized2 = array_map('normalizeAuthorName', $authors2);
    
    // Sort them
    sort($normalized1);
    sort($normalized2);
    
    // If they have different lengths, they might still be similar
    // Check if one set is a subset of the other (some authors might be missing)
    if (count($normalized1) != count($normalized2)) {
        // Find common authors
        $common = array_intersect($normalized1, $normalized2);
        $minCount = min(count($normalized1), count($normalized2));
        $similarity = (count($common) / $minCount) * 100;
        return $similarity >= $threshold;
    }
    
    // Same length, compare each author
    $matches = 0;
    for ($i = 0; $i < count($normalized1); $i++) {
        if ($normalized1[$i] === $normalized2[$i]) {
            $matches++;
        } elseif (isSimilarString($normalized1[$i], $normalized2[$i], 85)) {
            $matches++;
        }
    }
    
    $similarity = ($matches / count($normalized1)) * 100;
    return $similarity >= $threshold;
}


if(isset($_POST['entryCounter'])){
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        
        // Get all categories from the category table
        $categoryQuery = "SELECT id, name FROM category ORDER BY name ASC";
        $categoryResult = $con->query($categoryQuery);
        
        while ($categoryRow = $categoryResult->fetch_assoc()) {
            $categoryName = $categoryRow['name'];
            
            $catObj = new stdClass();
            $catObj->name = $categoryName;
            $catObj->total = 0;
            
            $query = "SELECT 
                researchfile.id,
                researchfile.title,
                researchfile.final_symposium_title,
                researchfile.author,
                researchfile.coauthor,
                researchfile.presenter,
                researchfile.category,
                researchfile.status as research_status,
                endorsement.status as endorsement_status
            FROM researchfile
            LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
            WHERE researchfile.event = ? 
                AND researchfile.category = ?
                AND (
                    researchfile.status = 'accepted'
                    OR (researchfile.status IS NULL AND endorsement.status = 'accepted')
                )
            ORDER BY researchfile.title ASC";
            
            $stmt = $con->prepare($query);
            $stmt->bind_param("ss", $_POST['eventType'], $categoryName);
            $stmt->execute();
            $result = $stmt->get_result();
            
            // Track unique documents using fuzzy matching
            $processedDocs = [];
            $uniqueCount = 0;
            
            while ($row = $result->fetch_assoc()) {
                // Format authors
                $authors = [];
                if (!empty($row['author'])) {
                    $authors[] = $row['author'];
                }
                
                if (!empty($row['coauthor'])) {
                    $coauthors = json_decode($row['coauthor'], true);
                    if (is_array($coauthors)) {
                        $authors = array_merge($authors, $coauthors);
                    }
                }
                
                // Use final_symposium_title if exists, otherwise use title
                $displayTitle = !empty($row['final_symposium_title']) 
                    ? $row['final_symposium_title'] 
                    : $row['title'];
                
                // Check if this is a duplicate using fuzzy matching
                $isDuplicate = false;
                foreach ($processedDocs as $processed) {
                    // Check title similarity (80% threshold)
                    $titleSimilar = isSimilarString($displayTitle, $processed['title'], 80);
                    
                    // Check author similarity (70% threshold for authors)
                    $authorSimilar = areAuthorsSimilar($authors, $processed['authors'], 70);
                    
                    // If both title and authors are similar, it's a duplicate
                    if ($titleSimilar && $authorSimilar) {
                        $isDuplicate = true;
                        break;
                    }
                }
                
                // Only count if not a duplicate
                if (!$isDuplicate) {
                    $uniqueCount++;
                    $processedDocs[] = [
                        'title' => $displayTitle,
                        'authors' => $authors
                    ];
                }
            }
            
            $catObj->total = $uniqueCount;
            $response[] = $catObj;
            $stmt->close();
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
        
        // ============================================================
        // STEP 1: Get ALL accepted documents with GLOBAL duplicate detection
        // EXACTLY like entryCounter
        // ============================================================
        $query = "SELECT 
                    researchfile.id,
                    researchfile.center,
                    researchfile.category,
                    researchfile.campus,
                    researchfile.title,
                    researchfile.final_symposium_title,
                    researchfile.author,
                    researchfile.coauthor,
                    researchfile.presenter,
                    researchfile.status as research_status,
                    endorsement.status as endorsement_status
                  FROM researchfile
                  LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
                  WHERE researchfile.event = ?
                  AND (
                      researchfile.status = 'accepted'
                      OR (researchfile.status IS NULL AND endorsement.status = 'accepted')
                  )";
        
        $statement = $con->prepare($query);
        $statement->bind_param("s", $_POST['eventName']);
        $statement->execute();
        $result = $statement->get_result();
        
        // ============================================================
        // STEP 2: Process with GLOBAL duplicate detection (same as entryCounter)
        // ============================================================
        $globalProcessedDocs = [];
        $uniqueDocs = [];
        
        while ($row = $result->fetch_assoc()) {
            // Format authors
            $authors = [];
            if (!empty($row['author'])) {
                $authors[] = $row['author'];
            }
            if (!empty($row['coauthor'])) {
                $coauthors = json_decode($row['coauthor'], true);
                if (is_array($coauthors)) {
                    $authors = array_merge($authors, $coauthors);
                }
            }
            
            // Use final_symposium_title if exists
            $displayTitle = !empty($row['final_symposium_title']) 
                ? $row['final_symposium_title'] 
                : $row['title'];
            
            // Check for GLOBAL duplicates using fuzzy matching (same as entryCounter)
            $isDuplicate = false;
            foreach ($globalProcessedDocs as $processed) {
                // Check title similarity (80% threshold)
                $titleSimilar = isSimilarString($displayTitle, $processed['title'], 80);
                
                // Check author similarity (70% threshold for authors)
                $authorSimilar = areAuthorsSimilar($authors, $processed['authors'], 70);
                
                // If both title and authors are similar, it's a duplicate
                if ($titleSimilar && $authorSimilar) {
                    $isDuplicate = true;
                    break;
                }
            }
            
            // Only store if not a duplicate
            if (!$isDuplicate) {
                $globalProcessedDocs[] = [
                    'title' => $displayTitle,
                    'authors' => $authors
                ];
                
                // Store the unique document with its metadata
                $uniqueDocs[] = [
                    'category' => $row['category'],
                    'campus' => $row['campus'] ?: 'Main Campus',
                    'center' => $row['center'] ?: 'Unassigned',
                    'title' => $displayTitle,
                    'authors' => $authors
                ];
            }
        }
        
        // ============================================================
        // STEP 3: Count unique documents by category (like entryCounter)
        // ============================================================
        $categoryTotals = [];
        foreach ($uniqueDocs as $doc) {
            $category = $doc['category'];
            if (!isset($categoryTotals[$category])) {
                $categoryTotals[$category] = 0;
            }
            $categoryTotals[$category]++;
        }
        
        // ============================================================
        // STEP 4: Build response for display
        // ============================================================
        $isSymposiumEvent = strpos(strtolower($_POST['eventName']), 'symposium') !== false;
        
        if ($isSymposiumEvent) {
            // ===== SYMPOSIUM VIEW - Group by Category =====
            $allCampuses = ['Roxas City Main', 'Dayao', 'Pontevedra', 'Pilar', 'Dumarao', 'Burias', 'Mambusao', 'Tapaz', 'Sigma', 'Central Office'];
            
            // Get all unique categories from unique docs
            $allCategories = array_keys($categoryTotals);
            sort($allCategories);
            
            // Initialize data structure
            $categoryData = [];
            foreach ($allCategories as $cat) {
                $categoryData[$cat] = [
                    'category' => $cat,
                    'campuses' => []
                ];
                foreach ($allCampuses as $campus) {
                    $categoryData[$cat]['campuses'][$campus] = 0;
                }
            }
            
            // Count by category and campus
            foreach ($uniqueDocs as $doc) {
                $category = $doc['category'];
                $campus = $doc['campus'];
                
                if (isset($categoryData[$category]['campuses'][$campus])) {
                    $categoryData[$category]['campuses'][$campus]++;
                }
            }
            
            // Format response
            $allCategoriesSorted = array_keys($categoryData);
            sort($allCategoriesSorted);
            
            foreach ($allCategoriesSorted as $categoryName) {
                $centerObj = new stdClass();
                $centerObj->center = $categoryName;
                $centerObj->campuses = [];
                
                foreach ($allCampuses as $campusName) {
                    $campusObj = new stdClass();
                    $campusObj->campus = $campusName;
                    $campusObj->categories = [];
                    
                    $catObj = new stdClass();
                    $catObj->name = $categoryName;
                    $catObj->total = $categoryData[$categoryName]['campuses'][$campusName];
                    $campusObj->categories[] = $catObj;
                    
                    $centerObj->campuses[] = $campusObj;
                }
                
                $response[] = $centerObj;
            }
            
        } else {
            // ===== IN-HOUSE VIEW - Group by Center =====
            // Get all unique categories from unique docs
            $allCategories = array_keys($categoryTotals);
            sort($allCategories);
            
            $centerData = [];
            
            foreach ($uniqueDocs as $doc) {
                $centerName = $doc['center'] ?: 'Unassigned';
                $campus = $doc['campus'];
                $category = $doc['category'];
                
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
                    
                    foreach ($allCategories as $cat) {
                        $centerData[$centerName]['campuses'][$campus]['categories'][$cat] = 0;
                    }
                }
                
                if (isset($centerData[$centerName]['campuses'][$campus]['categories'][$category])) {
                    $centerData[$centerName]['campuses'][$campus]['categories'][$category]++;
                }
            }
            
            // Format response
            foreach ($centerData as $centerName => $centerInfo) {
                $centerObj = new stdClass();
                $centerObj->center = $centerName;
                $centerObj->campuses = [];
                
                foreach ($centerInfo['campuses'] as $campusName => $campusInfo) {
                    $campusObj = new stdClass();
                    $campusObj->campus = $campusName;
                    $campusObj->categories = [];
                    
                    foreach ($campusInfo['categories'] as $catName => $count) {
                        if ($count > 0) {
                            $catObj = new stdClass();
                            $catObj->name = $catName;
                            $catObj->total = $count;
                            $campusObj->categories[] = $catObj;
                        }
                    }
                    
                    $centerObj->campuses[] = $campusObj;
                }
                
                $response[] = $centerObj;
            }
        }
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
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
        
        // ============================================================
        // STEP 1: Get ALL accepted documents with GLOBAL duplicate detection
        // EXACTLY like entryCounter
        // ============================================================
        $query = "SELECT 
                    researchfile.id,
                    researchfile.campus,
                    researchfile.title,
                    researchfile.final_symposium_title,
                    researchfile.author,
                    researchfile.coauthor,
                    researchfile.presenter,
                    researchfile.category,
                    researchfile.status as research_status,
                    endorsement.status as endorsement_status
                  FROM researchfile
                  LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
                  WHERE researchfile.event = ?
                  AND (
                      researchfile.status = 'accepted'
                      OR (researchfile.status IS NULL AND endorsement.status = 'accepted')
                  )
                  ORDER BY researchfile.title ASC";
        
        $stmt = $con->prepare($query);
        $stmt->bind_param("s", $eventName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        // ============================================================
        // STEP 2: Process with GLOBAL duplicate detection (same as entryCounter)
        // ============================================================
        $globalProcessedDocs = [];
        $uniqueDocs = [];
        
        while ($row = $result->fetch_assoc()) {
            // Format authors
            $authors = [];
            if (!empty($row['author'])) {
                $authors[] = $row['author'];
            }
            if (!empty($row['coauthor'])) {
                $coauthors = json_decode($row['coauthor'], true);
                if (is_array($coauthors)) {
                    $authors = array_merge($authors, $coauthors);
                }
            }
            
            // Use final_symposium_title if exists
            $displayTitle = !empty($row['final_symposium_title']) 
                ? $row['final_symposium_title'] 
                : $row['title'];
            
            // Check for GLOBAL duplicates using fuzzy matching (same as entryCounter)
            $isDuplicate = false;
            foreach ($globalProcessedDocs as $processed) {
                // Check title similarity (80% threshold)
                $titleSimilar = isSimilarString($displayTitle, $processed['title'], 80);
                
                // Check author similarity (70% threshold for authors)
                $authorSimilar = areAuthorsSimilar($authors, $processed['authors'], 70);
                
                // If both title and authors are similar, it's a duplicate
                if ($titleSimilar && $authorSimilar) {
                    $isDuplicate = true;
                    break;
                }
            }
            
            // Only store if not a duplicate
            if (!$isDuplicate) {
                $globalProcessedDocs[] = [
                    'title' => $displayTitle,
                    'authors' => $authors
                ];
                
                // Store the unique document with its metadata
                $uniqueDocs[] = [
                    'id' => $row['id'],
                    'campus' => $row['campus'] ?: 'Main Campus',
                    'title' => $displayTitle,
                    'original_title' => $row['title'],
                    'final_symposium_title' => $row['final_symposium_title'],
                    'presenter' => $row['presenter'] ?: 'Not specified',
                    'category' => $row['category'],
                    'authors' => $authors
                ];
            }
        }
        
        // ============================================================
        // STEP 3: Group unique documents by category
        // ============================================================
        $data = new stdClass();
        $data->event = $eventRow['name'];
        $data->event_id = $eventRow['id'];
        $data->categories = [];
        
        // Group by category
        $groupedByCategory = [];
        foreach ($uniqueDocs as $doc) {
            $category = $doc['category'];
            if (!isset($groupedByCategory[$category])) {
                $groupedByCategory[$category] = [];
            }
            $groupedByCategory[$category][] = $doc;
        }
        
        // Sort categories alphabetically
        ksort($groupedByCategory);
        
        // Build response
        foreach ($groupedByCategory as $categoryName => $docs) {
            $cat = new stdClass();
            $cat->category = $categoryName;
            $cat->docs = [];
            
            foreach ($docs as $doc) {
                $resData = new stdClass();
                $resData->id = $doc['id'];
                $resData->campus = $doc['campus'];
                $resData->title = formatDocumentTitle($doc['title']);
                $resData->original_title = $doc['original_title'];
                $resData->final_symposium_title = $doc['final_symposium_title'];
                $resData->presenter = formatName($doc['presenter']);
                $resData->category = $doc['category'];
                $resData->authors = formatAuthors($doc['authors']);
                $cat->docs[] = $resData;
            }
            
            $data->categories[] = $cat;
        }
        
        $response = [$data];
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

if(isset($_POST['getCertificates'])) {
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventName = $_POST['eventName'];
        
        // Get research files with accepted status for the selected event
        $query = "SELECT 
                    researchfile.id,
                    researchfile.title,
                    researchfile.category,
                    researchfile.presenter,
                    researchfile.author,
                    researchfile.coauthor
                  FROM researchfile
                  WHERE researchfile.status = 'accepted' 
                    AND researchfile.event = ?
                  ORDER BY researchfile.category, researchfile.title";
        
        $stmt = $con->prepare($query);
        $stmt->bind_param("s", $eventName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $certificateData = [];
        
        while ($row = $result->fetch_assoc()) {
            $certItem = new stdClass();
            $certItem->id = $row['id'];
            $certItem->title = formatDocumentTitle($row['title']);
            $certItem->category = $row['category'];
            
            // Format presenter name
            $certItem->presenter = formatName($row['presenter'] ?: 'Not specified');
            
            // Combine author and coauthors
            $researchers = [];
            
            // Add main author if exists
            if (!empty($row['author'])) {
                $researchers[] = formatName($row['author']);
            }
            
            // Add coauthors if exist
            if (!empty($row['coauthor'])) {
                $coauthors = json_decode($row['coauthor'], true);
                if (is_array($coauthors)) {
                    foreach ($coauthors as $coauthor) {
                        $researchers[] = formatName($coauthor);
                    }
                }
            }
            
            $certItem->researchers = $researchers;
            
            $certificateData[] = $certItem;
        }
        
        // Group by category
        $groupedData = [];
        foreach ($certificateData as $item) {
            $category = $item->category;
            if (!isset($groupedData[$category])) {
                $groupedData[$category] = [];
            }
            $groupedData[$category][] = $item;
        }
        
        $response = [
            'status' => 'success',
            'event' => $eventName,
            'data' => $groupedData,
            'count' => count($certificateData)
        ];
        
        $stmt->close();
    } else {
        $response = [
            'status' => 'error',
            'message' => 'Database connection failed'
        ];
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}