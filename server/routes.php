<?php
require_once("{$_SERVER['DOCUMENT_ROOT']}/server/router.php");

// ========== API ROUTES (POST) ==========
// These handle form submissions, AJAX requests
post('/loginAuth','server/authToken.php');
post('/sessionCheck','server/session.php');
post('/evaluatorReg','server/evalReg.php');
post('/researchChairAuth','server/researchChairAuth.php');
post('/extensionChairAuth','server/extensionChairAuth.php');
post('/rdeStaff','server/rdeStaff.php');
post('/externalauth','server/visitorAuth.php');
post('/samp','server/samp.php');
post('/logout','server/authToken.php');
post('/register','server/campus.php');
post('/loader','server/loader.php');
post('/loadercos','server/loadCos.php');
post('/deleteUser','server/updates.php');
post('/uploadResearchFile','server/researchFile.php');
post('/uploadFacultyDocs', 'server/researchFacultySub.php');
post('/uploadExtensionDocs','server/extensionChairSub.php');
post('/getresearch','server/rdeAcceptance.php');
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
post('/completeresearch', 'server/rde/completedResearch.php');
post('/summary', 'server/rde/summary.php');
post('/dashboard', 'server/rde/dashboard.php');
post('/internalfunded', 'server/rde/internallyFunded.php');
post('/monitor', 'server/rde/monitoring.php');
post('/patentresearch', 'server/rde/patent.php');
post('/presentedresearch', 'server/rde/presentation.php');
post('/proposedresearch', 'server/rde/proposed.php');
post('/publish', 'server/rde/publication.php');
post('/utilization', 'server/rde/utilization.php');
any('/certification', 'server/rde/certification.php');
post('/saveCertificationDrive', 'server/rde/certification_drive.php');
post('/quarterlyMonitoring', 'server/rde/quarterlyMonitoring.php');
post('/ongoingresearch', 'server/rde/accomplishment/onGoingRes.php');
post('/completedRes', 'server/rde/accomplishment/completedRes.php');
post('/attendedResearch', 'server/rde/accomplishment/attendedRes.php');
post('/citationResearch', 'server/rde/accomplishment/citationRes.php');
post('/facilitiesImprovement', 'server/rde/accomplishment/facilResImprov.php');
post('/IGPResearchProjects', 'server/rde/accomplishment/igpResProj.php');
post('/participationResearch', 'server/rde/accomplishment/participationExh.php');
post('/presentationResearch', 'server/rde/accomplishment/presentationRes.php');
post('/trainingActivitiesResearch', 'server/rde/accomplishment/traiActConductRes.php');
post('/summaryAccomplish', 'server/rde/accomplishment/summaryAccomplishment.php');
post('/uploadResearchChair', 'server/researchChairAPI/researchChairSub.php');
post('/researchChairSettings', 'server/researchChairAPI/settings.php');

// ROOT route
get('/', 'server/auth.php'); 

// Account routes
get('/account/Login','/index.html');
get('/account/Signup','/index.html');

// Admin routes - ALL admin pages
get('/admin/addAccount','/index.html');
get('/admin/$page','/index.html');  // Catch-all for other admin pages

//extension chair routes
// Research Chair routes
get('/extension-chair/submissions','/index.html');
get('/extension-chair/settings','/index.html');
get('/extension-chair/$page','/index.html');

// Research Chair routes
get('/research-chair/submissions','/index.html');
get('/research-chair/settings','/index.html');
get('/research-chair/$page','/index.html');

// User routes
get('/user/research/resubmit','/index.html'); //resubmit 
get('/user/research/$page','/index.html');   // handle other research pages
get('/user/create/share','/index.html');
get('/user/$page1/$page2/$page3','/index.html');  // User has nested routes
get('/user/$page1/$page2','/index.html');
get('/user/$page','/index.html');

// Evaluator route
get('/evaluator','/index.html');
get('/evaluator/$page','/index.html');  // For evaluator sub-pages

// RDE Office routes
get('/rdeOffice/communication','/index.html');
get('/rdeOffice/dashboard','/index.html');
get('/rdeOffice/completedResearch','/index.html'); 
get('/rdeOffice/proposedResearch','/index.html');
get('/rdeOffice/presentationResearch','/index.html');
get('/rdeOffice/publication','/index.html'); 
get('/rdeOffice/patentUM','/index.html');
get('/rdeOffice/utilization','/index.html');
get('/rdeOffice/$page','/index.html');
get('/rdeOffice/certification','/index.html');
get('/rdeOffice/monitoring','/index.html');
get('/rdeOffice/internallyfunded','/index.html');
get('/rdeOffice/ongoingresearch','/index.html');

// External routes
get('/external/users/a/b/c/b/c/d/e/v1','external/index.php');
get('/external/$path1/$path2/$path3/$path4/$path5/$path6/$path7/$path8','/index.html');

// Other routes
get('/view','/index.html');
get('/view/$id','/index.html');  // For viewing specific documents
get('/accountSupport','/index.html');
get('/barcode/a/b/c/d/e/f','barcode.html');
get('/barcode/$path1/$path2/$path3/$path4/$path5/$path6','/index.html');

// ========== CATCH-ALL ROUTES ==========

// Dynamic parameter routes (like /$id, /$id/$id)
// Use these SPARINGLY and put them LAST
get('/$id','/index.html');
get('/$id/$id2','/index.html');
get('/$id/$id2/$id3','/index.html');
get('/$id/$id2/$id3/$id4','/index.html');
get('/$id/$id2/$id3/$id4/$id5','/index.html');
get('/$id/$id2/$id3/$id4/$id5/$id6','/index.html');
get('/$id/$id2/$id3/$id4/$id5/$id6/$id7','/index.html');
get('/$id/$id2/$id3/$id4/$id5/$id6/$id7/$id8','/index.html');
get('/$id/$id2/$id3/$id4/$id5/$id6/$id7/$id8/$id9','/index.html');

any('/404','404.html');