<?php


function FileReceive($url, $fileName)
{
    return "
    <div>
    <b>CAPSU RDE </b>
    <span>sent you a message..!</span>
    <div>
    File Title: $fileName
    </div>
    <div>
    <div>Please log in to your account <span><a href='rde.capsu.edu.ph' style='color: deepskyblue'>Log in?</a></span></div>
    <div>This Email Account template is still on progress...</div>
    
</div>
    </div>
    ";
}


function Signup($username, $password, $campus)
{
    return ("
    <div>
    <h1 style='color: green'>Your account has been successfully created...!</h1>
    <div><b>USER NAME : </b>$username</div>
    <div><b>PASSWORD : </b>$password</div>
    <div><b>OFFICE/CAMPUS : </b>$campus</div>
    </div>
    ");
}

function AccountCreation($campus,$email)
{
    return ("
    <div style='
    width:50vw;
    border:solid thin black;
    background-color:rgba(0,0,0,0.1);
    padding:1rem;
    boxshadow:-.5vw 1vh .5rem rgba(0,0,0,0.3);
    user-select:none;
    '>
    <div style='
    color:deepskyblue;
    font-size:1.5vw;
    '>Capiz State University</div>
    <div style='
    fontfamily:Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif;
    font-size:1vw;
    '>Research,Development and Extension</div>
   
    <div>RDE Central Office</div>
    <div>Good day!</div>
    <p>You may now create your account using this Email account <i>$email</i> under $campus campus.</p>
    <p><a href='rde.capsu.edu.ph/account/Signup?'>Click to Sign-up</a></p>
    </div>
    ");
}

function RejectedApproval($correction,$rdeStaff,$url){
    return ("
    <div style='
    width:100%;
    border:solid thin black;
    background-color:rgba(0,0,0,0.1);
    padding:1rem;
    boxshadow:-.5vw 1vh .5rem rgba(0,0,0,0.3);
    user-select:none;
    '>
    <div style='
    color:deepskyblue;
    font-size:20px;
    '>Capiz State University</div>
    <div style='
    fontfamily:Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif;
    font-size:20px;
    '>Research,Development and Extension</div>
   
    <div>RDE Central Office</div>
    
    <div>Good day!</div>
    <p>Your document for approval was rejected due to some correction.</p>
    <p>Reason: $correction</p>
    <p><a href='$url'>Please check your documents here..</a></p>
    <div>
    RDE Staff: $rdeStaff
</div>
    </div>
    ");
}


function Code($code)
{
    return ("
    <div style='
        max-width: 550px;
        margin: 0 auto;
        background: linear-gradient(145deg, #1a2a4a, #0f1f3a);
        border-radius: 20px;
        border: 1px solid rgba(0, 150, 255, 0.3);
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    '>
        <!-- Header -->
        <div style='
            padding: 30px;
            text-align: center;
            background: linear-gradient(135deg, #0066ff, #00aaff);
        '>
            <h1 style='
                color: #fff;
                font-size: 24px;
                font-weight: 700;
                margin: 0;
                letter-spacing: 1px;
            '>CAPIZ STATE UNIVERSITY</h1>
            <p style='
                color: rgba(255,255,255,0.9);
                font-size: 14px;
                margin: 8px 0 0 0;
            '>Research, Development and Extension</p>
        </div>
        
        <!-- Content -->
        <div style='padding: 35px 30px; background: #0a1628;'>
            <h2 style='
                color: #00aaff;
                font-size: 20px;
                font-weight: 600;
                margin: 0 0 10px 0;
                text-align: center;
            '>🔐 Password Reset Verification</h2>
            
            <p style='
                color: #88aaff;
                font-size: 14px;
                line-height: 1.6;
                text-align: center;
                margin: 0 0 30px 0;
            '>You requested to reset your password. Use the code below to verify your identity.</p>
            
            <!-- Code Box -->
            <div style='
                background: rgba(0, 150, 255, 0.1);
                border: 2px dashed #00aaff;
                border-radius: 12px;
                padding: 25px;
                text-align: center;
                margin-bottom: 25px;
            '>
                <div style='
                    font-size: 48px;
                    font-weight: 800;
                    color: #00aaff;
                    letter-spacing: 10px;
                    font-family: \"Courier New\", monospace;
                '>$code</div>
                <p style='
                    color: #6688aa;
                    font-size: 12px;
                    margin: 15px 0 0 0;
                '>⏰ This code expires in 10 minutes</p>
            </div>
            
            <!-- Security Tips -->
            <div style='
                background: rgba(255, 68, 68, 0.1);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 25px;
            '>
                <div style='
                    color: #ff8888;
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 12px;
                '>⚠️ Security Reminders:</div>
                
                <ul style='
                    margin: 0;
                    padding-left: 20px;
                    color: #88aaff;
                    font-size: 13px;
                    line-height: 1.8;
                '>
                    <li>Never share this code with anyone</li>
                    <li>CAPSU staff will NEVER ask for this code</li>
                    <li>If you didn't request this, ignore this email</li>
                    <li>This code is single-use only</li>
                </ul>
            </div>
            
            <p style='
                color: #6688aa;
                font-size: 12px;
                text-align: center;
                margin: 0;
            '>If you have any questions, contact RDE Central Office.</p>
        </div>
        
        <!-- Footer -->
        <div style='
            padding: 20px;
            text-align: center;
            background: #0d1222;
            border-top: 1px solid rgba(0, 150, 255, 0.1);
        '>
            <p style='
                color: #6688aa;
                font-size: 11px;
                margin: 0;
            '>
                This is an automated message from CAPSU RDE System<br>
                &copy; " . date('Y') . " Capiz State University
            </p>
        </div>
    </div>
    ");
}

function AcceptedEntry($eventName,$title){
    return ("
    <div style='
    width:100%;
    border:solid thin black;
    background-color:rgba(0,0,0,0.1);
    padding:1rem;
    boxshadow:-.5vw 1vh .5rem rgba(0,0,0,0.3);
    user-select:none;
    '>
    <div style='
    color:deepskyblue;
    font-size:20px;
    '>Capiz State University</div>
    <div style='
    fontfamily:Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif;
    font-size:20px;
    '>Research,Development and Extension</div>
   
    <div>RDE Central Office</div>
    
    <div>Good day!</div>
    <br>
    <div>
    <b>Event Name: </b> <i>$eventName</i>
    </div>
    <div>
    <b>Entry Title: </b> <i>$title</i>
    </div>
    <div>
    <b>Status: </b> Accepted
    </div>
   
    <div>
</div>
    </div>
    ");
}
function RejectedEntry($correction, $eventName, $title){
    return ("
    <div style='
    width:100%;
    border:solid thin black;
    background-color:rgba(0,0,0,0.1);
    padding:1rem;
    box-shadow:-.5vw 1vh .5rem rgba(0,0,0,0.3);
    user-select:none;
    color:black;
    font-family:\"Helvetica Neue\", Helvetica, Arial, sans-serif;
    '>
    <div style='
    color:deepskyblue;
    font-size:20px;
    '>Capiz State University</div>
    <div style='
    font-family: \"Segoe UI Historic\", \"Segoe UI\", Helvetica, Arial, sans-serif;
    font-size:20px;
    font-weight: bold;
    color:black;
    '>Research, Development and Extension</div>
   
    <div>RDE Central Office</div>
    
    <div>Good day!</div>
    <br>
    <div>
    <b>Event Name: </b> <i>$eventName</i>
    </div>
    <div>
    <b>Entry Title(s): </b> 
    <div>
    <i>$title</i>
    </div>
    </div>
    <div>
    <b>Status: </b> <span style='color: black; font-weight: bold;'>REJECTED</span>
    </div>
    <div>
    <b>Reason for Rejection: </b> <br>
    <div style='background-color: #fff; padding: 10px; margin: 5px 0; border-left: 3px solid red; color: red;'>
    $correction
    </div>
    </div>
    <br>
    <div>Please revise your submission accordingly and resubmit.</div>
    <br>
    <div>Thank you,<br>RDE Office</div>
    </div>
    ");
}

function CommentNotification($evaluatorName, $eventName, $title, $campus, $author, $comments, $documentUrl) {
    // Prepare comment sections
    $commentSections = "";
    
    $sections = [
        'title' => 'Title',
        'abstract' => 'Abstract',
        'intro' => 'Introduction',
        'objective' => 'Objectives',
        'methodology' => 'Methodology',
        'results' => 'Results and Discussion',
        'recommendation' => 'Conclusion and Recommendation',
        'literature' => 'Literature Cited',
        'other' => 'Other Comments'
    ];
    
    foreach ($sections as $key => $label) {
        if (!empty($comments[$key]) && trim($comments[$key]) !== '') {
            // Convert newlines to <br> for HTML display
            $commentText = nl2br(htmlspecialchars($comments[$key]));
            
            $commentSections .= "
            <div style='margin: 15px 0; border-bottom: 1px solid #eee; padding-bottom: 10px;'>
                <h3 style='color: #2c3e50; font-size: 16px; margin-bottom: 5px;'>$label:</h3>
                <div style='background-color: #f8f9fa; padding: 10px; border-left: 3px solid #3498db; font-size: 14px; line-height: 1.5; white-space: pre-wrap;'>
                    $commentText
                </div>
            </div>";
        }
    }
    
    // If no comments were added, show a message
    if (empty($commentSections)) {
        $commentSections = "<div style='color: #7f8c8d; font-style: italic; padding: 20px; text-align: center;'>
            No specific comments were added. The evaluator may have reviewed without detailed feedback.
        </div>";
    }
    
    return "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; }
            .header { background-color: #2c3e50; color: white; padding: 25px; text-align: center; }
            .content { padding: 30px; }
            .section { margin-bottom: 25px; background-color: #f8f9fa; padding: 20px; border-radius: 5px; }
            .details-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .details-table td { padding: 10px; border-bottom: 1px solid #eee; }
            .details-table td:first-child { font-weight: bold; width: 35%; color: #2c3e50; }
            .button { display: inline-block; background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { background-color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; color: #7f8c8d; }
            .comment-section { background-color: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin: 10px 0; }
            .status-badge { background-color: #3498db; color: white; padding: 5px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; display: inline-block; }
            .comment-text { white-space: pre-wrap; word-wrap: break-word; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1 style='margin: 0; font-size: 24px;'>CAPSU Research, Development & Extension</h1>
                <p style='margin: 5px 0 0 0; opacity: 0.9;'>Comment Notification</p>
            </div>
            
            <div class='content'>
                <div style='text-align: center; margin-bottom: 25px;'>
                    <span class='status-badge'>NEW COMMENTS ADDED</span>
                    <h2 style='color: #2c3e50; margin-top: 10px;'>Research Paper Evaluation Update</h2>
                </div>
                
                <div class='section'>
                    <h3 style='color: #2c3e50; margin-top: 0;'>Document Details</h3>
                    <table class='details-table'>
                        <tr>
                            <td>Evaluator:</td>
                            <td>$evaluatorName</td>
                        </tr>
                        <tr>
                            <td>Event:</td>
                            <td>$eventName</td>
                        </tr>
                        <tr>
                            <td>Campus:</td>
                            <td>$campus</td>
                        </tr>
                        <tr>
                            <td>Author(s):</td>
                            <td>$author</td>
                        </tr>
                        <tr>
                            <td>Title:</td>
                            <td><strong>$title</strong></td>
                        </tr>
                        <tr>
                            <td>Date Reviewed:</td>
                            <td>" . date('F j, Y g:i A') . "</td>
                        </tr>
                    </table>
                </div>
                
                <div class='section'>
                    <h3 style='color: #2c3e50; margin-top: 0;'>Evaluation Comments</h3>
                    <p style='color: #7f8c8d; font-size: 14px; margin-bottom: 20px;'>
                        The following comments have been provided by the evaluator for your research paper:
                    </p>
                    $commentSections
                </div>
                
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='https://rdedev.capsu.edu.ph/account/Login?php echo urlencode($documentUrl); ?>' class='button'>Login to View Document</a>
                    <p style='font-size: 12px; color: #7f8c8d; margin-top: 10px;'>
                        You will be redirected to the document after successful login.
                    </p>
                </div>
                
                <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #3498db;'>
                    <p style='margin: 0; font-size: 14px;'>
                        <strong>Next Steps:</strong> Please review the evaluator's comments and revise proposal
                        as recommended and resubmit for possible funding using the submit button below.
                    </p>
                </div>
            </div>
            
            <div class='footer'>
                <p>This is an automated notification from the CAPSU RDE System.</p>
                <p>© " . date('Y') . " Capiz State University - Research, Development & Extension Office</p>
                <p>If you have any questions, please contact the RDE Office.</p>
            </div>
        </div>
    </body>
    </html>";
}