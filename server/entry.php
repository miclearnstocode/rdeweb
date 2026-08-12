<?php

include ('db.php');


/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */


function isScientificName($text) {
    if (!$text || strlen(trim($text)) < 2) return false;
    $text = trim($text);

    if (preg_match('/\d/', $text)) return false;
    if (preg_match('/^[A-Z]{2,}$/', $text)) return false;
    if (preg_match('/^[A-Z][a-z]{1,20}\s+[A-Z]?[a-z]{3,25}$/', $text)) return true;
    if (preg_match('/^[A-Z][a-z]{1,20}\s+[A-Z]?[a-z]{3,25}\s+[A-Z][a-zA-Z\.]{0,15}$/', $text)) return true;
    if (preg_match('/^[A-Z][a-z]+\s+[A-Z]?[a-z]+\s+(var\.|subsp\.|ssp\.|f\.|cv\.)\s+[a-z]+$/i', $text)) return true;
    if (preg_match('/^[A-Z][a-z]{3,25}$/', $text)) {
        $latinGenusEndings = [
            'idae', 'inae', 'ini', 'oidea', 'iformes',
            'aceae', 'ales', 'opsida', 'ophyta',
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

function getStudentPapers($con, $eventName, $status = 'accepted') {
    $query = "SELECT 
                srp.id,
                srp.author,
                srp.coauthor,
                srp.presenter,
                srp.title,
                srp.category,
                srp.campus,
                srp.paper_type,
                srp.status
              FROM student_research_papers srp
              WHERE srp.event = ? 
                AND srp.status = ?
              ORDER BY srp.title ASC";
    
    $stmt = $con->prepare($query);
    $stmt->bind_param("ss", $eventName, $status);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $papers = [];
    while ($row = $result->fetch_assoc()) {
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
        
        $papers[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'authors' => $authors,
            'presenter' => $row['presenter'] ?? '',
            'category' => $row['category'],
            'campus' => $row['campus'] ?: 'Main Campus',
            'paper_type' => $row['paper_type'] // undergraduate or graduate
        ];
    }
    
    // Deduplicate student papers using fuzzy matching
    return deduplicatePapers($papers);
}
function deduplicatePapers($papers) {
    $processed = [];
    $unique = [];
    
    foreach ($papers as $paper) {
        $isDuplicate = false;
        foreach ($processed as $processedPaper) {
            $titleSimilar = isSimilarString($paper['title'], $processedPaper['title'], 80);
            $authorSimilar = areAuthorsSimilar($paper['authors'], $processedPaper['authors'], 70);
            
            if ($titleSimilar && $authorSimilar) {
                $isDuplicate = true;
                break;
            }
        }
        
        if (!$isDuplicate) {
            $processed[] = [
                'title' => $paper['title'],
                'authors' => $paper['authors']
            ];
            $unique[] = $paper;
        }
    }
    
    return $unique;
}

function isStudentEvent($eventName) {
    $eventLower = strtolower($eventName);
    return (strpos($eventLower, 'undergraduate') !== false || 
            strpos($eventLower, 'graduate') !== false);
}


function getPapersForEvent($con, $eventName, $status = 'accepted') {
    if (isStudentEvent($eventName)) {
        return getStudentPapers($con, $eventName, $status);
    } else {
        return getFacultyPapers($con, $eventName, $status);
    }
}
function getFacultyPapers($con, $eventName, $status = 'accepted') {
    $query = "SELECT 
                researchfile.id,
                researchfile.title,
                researchfile.final_symposium_title,
                researchfile.author,
                researchfile.coauthor,
                researchfile.presenter,
                researchfile.category,
                researchfile.campus,
                researchfile.center,
                researchfile.status as research_status,
                endorsement.status as endorsement_status
              FROM researchfile
              LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
              WHERE researchfile.event = ?
              AND (researchfile.status = ? OR (researchfile.status IS NULL AND endorsement.status = ?))
              ORDER BY researchfile.title ASC";
    
    $stmt = $con->prepare($query);
    $stmt->bind_param("sss", $eventName, $status, $status);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $papers = [];
    while ($row = $result->fetch_assoc()) {
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
        
        $displayTitle = !empty($row['final_symposium_title']) 
            ? $row['final_symposium_title'] 
            : $row['title'];
        
        $papers[] = [
            'id' => $row['id'],
            'title' => $displayTitle,
            'original_title' => $row['title'],
            'final_symposium_title' => $row['final_symposium_title'],
            'authors' => $authors,
            'presenter' => $row['presenter'] ?? '',
            'category' => $row['category'],
            'campus' => $row['campus'] ?: 'Main Campus',
            'center' => $row['center'] ?: 'Unassigned',
            'paper_type' => 'faculty'
        ];
    }
    
    return deduplicatePapers($papers);
}

if(isset($_POST['entryCounter'])){
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventName = $_POST['eventType'];
        
        // Get papers based on event type
        $papers = getPapersForEvent($con, $eventName);
        
        // Count by category
        $categoryCounts = [];
        foreach ($papers as $paper) {
            $category = $paper['category'] ?: 'Uncategorized';
            if (!isset($categoryCounts[$category])) {
                $categoryCounts[$category] = 0;
            }
            $categoryCounts[$category]++;
        }
        
        // Build response
        foreach ($categoryCounts as $category => $count) {
            $catObj = new stdClass();
            $catObj->name = $category;
            $catObj->total = $count;
            $response[] = $catObj;
        }
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}


if(isset($_POST['perCenterReport'])){
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventName = $_POST['eventType'];
        $centerName = $_POST['center'];
        $categoryName = $_POST['category'];
        
        // Check if student event
        if (isStudentEvent($eventName)) {
            // Student papers don't have center, so we count by campus
            $allCampuses = ['Roxas City Main', 'Dayao', 'Pontevedra', 'Pilar', 'Dumarao', 'Burias', 'Mambusao', 'Tapaz', 'Sigma', 'Central Office'];
            
            foreach ($allCampuses as $campus) {
                $obj = new stdClass();
                $obj->name = $campus;
                $obj->total = 0;
                
                $query = "SELECT COUNT(*) as total FROM student_research_papers
                          WHERE event = ? AND category = ? AND campus = ? AND status = 'accepted'";
                
                $statement = $con->prepare($query);
                $statement->bind_param("sss", $eventName, $categoryName, $campus);
                $statement->execute();
                $result = $statement->get_result();
                
                if ($row = $result->fetch_assoc()) {
                    $obj->total = $row['total'] ?: 0;
                }
                
                $response[] = $obj;
                $statement->close();
            }
        } else {
            // Faculty papers have center
            $allCampuses = ['Roxas City Main', 'Dayao', 'Pontevedra', 'Pilar', 'Dumarao', 'Burias', 'Mambusao', 'Tapaz', 'Sigma', 'Central Office'];
            
            foreach ($allCampuses as $campus) {
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
                $statement->bind_param("ssss", $eventName, $centerName, $categoryName, $campus);
                $statement->execute();
                $result = $statement->get_result();
                
                if ($row = $result->fetch_assoc()) {
                    $obj->total = $row['total'] ?: 0;
                }
                
                $response[] = $obj;
                $statement->close();
            }
        }
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

if(isset($_POST['perCampReport'])){
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventName = $_POST['eventType'];
        $categoryName = $_POST['category'];
        
        $allCampuses = ['Central Office', 'Roxas City Main', 'Dayao', 'Pontevedra', 'Pilar', 'Dumarao', 'Burias', 'Mambusao', 'Tapaz', 'Sigma'];
        
        foreach ($allCampuses as $campus) {
            $obj = new stdClass();
            $obj->name = $campus;
            $obj->total = '0';
            $response[] = $obj;
        }
        
        // Check if student event
        if (isStudentEvent($eventName)) {
            $query = "SELECT campus, COUNT(*) as total FROM student_research_papers
                      WHERE event = ? AND category = ? AND status = 'accepted'
                      GROUP BY campus";
            
            $statement = $con->prepare($query);
            $statement->bind_param("ss", $eventName, $categoryName);
            $statement->execute();
            $result = $statement->get_result();
            
            while ($val = $result->fetch_assoc()) {
                for ($x = 0; $x < sizeof($response); $x++) {
                    if ($response[$x]->name === $val['campus']) {
                        $response[$x]->total = $val['total'];
                    }
                }
            }
        } else {
            $query = "SELECT researchfile.campus, COUNT(*) as total FROM researchfile
                      LEFT JOIN endorsement ON researchfile.endorsementid = endorsement.id
                      WHERE endorsement.status = 'accepted' 
                      AND researchfile.category = ? 
                      AND researchfile.event = ?
                      GROUP BY researchfile.campus";
            
            $statement = $con->prepare($query);
            $statement->bind_param("ss", $categoryName, $eventName);
            $statement->execute();
            $result = $statement->get_result();
            
            while ($val = $result->fetch_assoc()) {
                for ($x = 0; $x < sizeof($response); $x++) {
                    if ($response[$x]->name === $val['campus']) {
                        $response[$x]->total = $val['total'];
                    }
                }
            }
        }
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

if(isset($_POST['printSum'])) {
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventName = $_POST['eventName'];
        
        // Get papers based on event type
        $papers = getPapersForEvent($con, $eventName);
        
        // Check if symposium event
        $isSymposiumEvent = strpos(strtolower($eventName), 'symposium') !== false;
        $isStudentEvent = isStudentEvent($eventName);
        
        // Get all campuses
        $allCampuses = ['Roxas City Main', 'Dayao', 'Pontevedra', 'Pilar', 'Dumarao', 'Burias', 'Mambusao', 'Tapaz', 'Sigma', 'Central Office'];
        
        if ($isSymposiumEvent) {
            $categoryData = [];
            $allCategories = [];
            
            foreach ($papers as $paper) {
                $category = $paper['category'] ?: 'Uncategorized';
                $campus = $paper['campus'] ?: 'Main Campus';
                
                if (!isset($allCategories[$category])) {
                    $allCategories[$category] = true;
                }
                
                if (!isset($categoryData[$category])) {
                    $categoryData[$category] = [];
                }
                if (!isset($categoryData[$category][$campus])) {
                    $categoryData[$category][$campus] = 0;
                }
                $categoryData[$category][$campus]++;
            }
            
            // Sort categories
            ksort($allCategories);
            $allCategories = array_keys($allCategories);
            
            // Build response
            foreach ($allCategories as $categoryName) {
                $centerObj = new stdClass();
                $centerObj->center = $categoryName;
                $centerObj->campuses = [];
                
                foreach ($allCampuses as $campusName) {
                    $campusObj = new stdClass();
                    $campusObj->campus = $campusName;
                    $campusObj->categories = [];
                    
                    $catObj = new stdClass();
                    $catObj->name = $categoryName;
                    $catObj->total = $categoryData[$categoryName][$campusName] ?? 0;
                    $campusObj->categories[] = $catObj;
                    
                    $centerObj->campuses[] = $campusObj;
                }
                
                $response[] = $centerObj;
            }
            
        } else {
            // ===== IN-HOUSE VIEW - Group by Center =====
            $centerData = [];
            $allCategories = [];
            
            foreach ($papers as $paper) {
                $centerName = $paper['center'] ?? 'Unassigned';
                $campus = $paper['campus'] ?: 'Main Campus';
                $category = $paper['category'] ?: 'Uncategorized';
                
                if (!isset($allCategories[$category])) {
                    $allCategories[$category] = true;
                }
                
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
                }
                
                if (!isset($centerData[$centerName]['campuses'][$campus]['categories'][$category])) {
                    $centerData[$centerName]['campuses'][$campus]['categories'][$category] = 0;
                }
                $centerData[$centerName]['campuses'][$campus]['categories'][$category]++;
            }
            
            $allCategories = array_keys($allCategories);
            sort($allCategories);
            
            // Format response
            foreach ($centerData as $centerName => $centerInfo) {
                $centerObj = new stdClass();
                $centerObj->center = $centerName;
                $centerObj->campuses = [];
                
                foreach ($centerInfo['campuses'] as $campusName => $campusInfo) {
                    $campusObj = new stdClass();
                    $campusObj->campus = $campusName;
                    $campusObj->categories = [];
                    
                    foreach ($allCategories as $catName) {
                        $count = $campusInfo['categories'][$catName] ?? 0;
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
        
        // Get papers based on event type
        $papers = getPapersForEvent($con, $eventName);
        
        // Group by category
        $groupedByCategory = [];
        foreach ($papers as $paper) {
            $category = $paper['category'] ?: 'Uncategorized';
            if (!isset($groupedByCategory[$category])) {
                $groupedByCategory[$category] = [];
            }
            $groupedByCategory[$category][] = $paper;
        }
        
        // Build response
        $data = new stdClass();
        $data->event = $eventRow['name'];
        $data->event_id = $eventRow['id'];
        $data->categories = [];
        
        // Sort categories alphabetically
        ksort($groupedByCategory);
        
        // Campus mapping
        $campusMapping = [
            'Roxas City Main' => 'Roxas City Main Campus',
            'Pontevedra' => 'Pontevedra Campus',
            'Burias' => 'Burias Campus',
            'Dayao' => 'Dayao Satellite College',
            'Pilar' => 'Pilar Satellite College',
            'Mambusao' => 'Mambusao Satellite College',
            'Dumarao' => 'Dumarao Satellite College',
            'Tapaz' => 'Tapaz Satellite College',
            'Sigma' => 'Sigma Satellite College',
            'Central Office' => 'Central Office'
        ];
        
        foreach ($groupedByCategory as $categoryName => $docs) {
            $cat = new stdClass();
            $cat->category = $categoryName;
            $cat->docs = [];
            
            foreach ($docs as $doc) {
                $resData = new stdClass();
                $resData->id = $doc['id'];
                
                // Map campus name
                $campus = $doc['campus'] ?? '';
                $mappedCampus = $campusMapping[$campus] ?? $campus;
                $resData->campus = $mappedCampus;
                
                $resData->title = formatDocumentTitle($doc['title']);
                $resData->original_title = $doc['original_title'] ?? '';
                $resData->final_symposium_title = $doc['final_symposium_title'] ?? '';
                
                // Format presenter with mapped campus
                $presenterName = $doc['presenter'] ?? '';
                
                if (!empty($presenterName) && $presenterName !== 'Not specified' && $presenterName !== 'Not Specified' && strtolower($presenterName) !== 'not specified') {
                    $formattedPresenter = formatName($presenterName);
                    if (!empty($mappedCampus)) {
                        $formattedPresenter .= ' - ' . $mappedCampus;
                    }
                } else {
                    $formattedPresenter = 'Not specified';
                }
                $resData->presenter = $formattedPresenter;
                
                $resData->category = $doc['category'];
                $resData->authors = formatAuthors($doc['authors']);
                $resData->paper_type = $doc['paper_type'] ?? 'faculty';
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
        
        // Get papers based on event type
        $papers = getPapersForEvent($con, $eventName);
        
        // Build certificate data
        $certificateData = [];
        
        foreach ($papers as $paper) {
            $certItem = new stdClass();
            $certItem->id = $paper['id'];
            $certItem->title = formatDocumentTitle($paper['title']);
            $certItem->category = $paper['category'] ?: 'Uncategorized';
            $certItem->presenter = formatName($paper['presenter'] ?: 'Not specified');
            $certItem->paper_type = $paper['paper_type'] ?? 'faculty';
            
            // Format researchers
            $researchers = [];
            foreach ($paper['authors'] as $author) {
                $researchers[] = formatName($author);
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
