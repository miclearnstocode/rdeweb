<?php
require_once("{$_SERVER['DOCUMENT_ROOT']}/server/router.php");

// ========== API ROUTES (POST) ==========
// These handle form submissions, AJAX requests
post('/loginAuth','server/authToken.php');
post('/sessionCheck','server/session.php');
post('/evaluatorReg','server/evalReg.php');
post('/rdeStaff','server/rdeStaff.php');
post('/externalauth','server/visitorAuth.php');
post('/samp','server/samp.php');
post('/logout','server/authToken.php');
post('/register','server/campus.php');
post('/loader','server/loader.php');
post('/loadercos','server/loadCos.php');
post('/deleteUser','server/updates.php');
post('/uploadResearchFile','server/researchFile.php');
post('/getresearch','server/researchFile.php');
post('/filesSend','server/file.php');
post('/inboxFile','server/fileViewer.php');
post('/approval','server/approval.php');
post('/signature','server/signature.php');
post('/sampUp','server/approval.php');
post('/endorsement','server/endorsement.php');
post('/comments','server/comments.php');
post('/recommendation','server/recommendation.php');
post('/communication','server/communication.php');
post('/chat','server/chat.php');
post('/settings','server/settings.php');
post('/requestDocs','server/request.php');
post('/eventRequest','server/eventsource.php');
post('/addcapaccount','server/addCapuser.php');
post('/eventState','server/eventState.php');
post('/deadline','server/deadline.php');
post('/rdeaccreq','server/rdeStaffReq.php');
post('/dbderect','server/dbDirect.php');
post('/scanDocs','server/scanDocs.php');
post('/getDocType','server/docType.php');
post('/documentLog','server/documentLog.php');
post('/checkDoc','server/docChecker.php');
post('/generateZip','server/zipgen.php');
post('/entrycount','server/entry.php');
post('/scoreSheet','server/scoreSheet.php');
post('/requestcat','server/category.php');
post('/criteria','server/criteria.php');
post('/scoreboard','server/scoreboard.php');
post('/score_rank','server/scoreRank.php');
post('/ranking','server/rank/rank.php');
post('/accountRetrieval','server/SeesionAPI/code.php');
post('/sessionStorage','server/SeesionAPI/session.php');
post('/formPost','server/formPost.php');
post('/abstain','server/abstain.php');
post('/overridedocs','server/override.php');
post('/filesUmd','server/umd_file.php');

// ========== SPA ROUTES (GET) ==========
// These serve index.html for your React/Vue/SPA pages

// ROOT route - important!
get('/','server/auth.php');  // This handles redirects based on login status

// Account routes
get('/account/Login','index.html');
get('/account/Signup','index.html');

// Admin routes - ALL admin pages
get('/admin/addAccount','index.html');
get('/admin/$page','index.html');  // Catch-all for other admin pages

// User routes
get('/user/create/share','index.html');
get('/user/$page1/$page2/$page3','index.html');  // User has nested routes
get('/user/$page1/$page2','index.html');
get('/user/$page','index.html');

// Evaluator route
get('/evaluator','index.html');
get('/evaluator/$page','index.html');  // For evaluator sub-pages

// RDE Office routes
get('/rdeOffice/communication','index.html');
get('/rdeOffice/$page','index.html');

// External routes
get('/external/users/a/b/c/b/c/d/e/v1','external/index.php');
get('/external/$path1/$path2/$path3/$path4/$path5/$path6/$path7/$path8','index.html');

// Other routes
get('/view','index.html');
get('/view/$id','index.html');  // For viewing specific documents
get('/accountSupport','index.html');
get('/barcode/a/b/c/d/e/f','barcode.html');
get('/barcode/$path1/$path2/$path3/$path4/$path5/$path6','index.html');

// ========== CATCH-ALL ROUTES ==========
// These should be LAST and handle any unmatched routes

// For testing - you had this, keep it if needed
get('/testRoute','server/session.php');

// Dynamic parameter routes (like /$id, /$id/$id)
// Use these SPARINGLY and put them LAST
get('/$id','index.html');
get('/$id/$id2','index.html');
get('/$id/$id2/$id3','index.html');
get('/$id/$id2/$id3/$id4','index.html');
get('/$id/$id2/$id3/$id4/$id5','index.html');
get('/$id/$id2/$id3/$id4/$id5/$id6','index.html');
get('/$id/$id2/$id3/$id4/$id5/$id6/$id7','index.html');
get('/$id/$id2/$id3/$id4/$id5/$id6/$id7/$id8','index.html');
get('/$id/$id2/$id3/$id4/$id5/$id6/$id7/$id8/$id9','index.html');

// 404 handler - MUST BE LAST
any('/404','404.html');