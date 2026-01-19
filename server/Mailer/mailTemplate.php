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
    
    <div style='font-size: 2rem'><b>SECURITY CODE :</b> $code</div>
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