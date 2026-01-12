<?php


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

//emailAdd:capizstatecapsudayao@gmail.com
//password:vuxbtbqimnjiawkw


/**
 * It sends an email using the PHPMailer library
 *
 * @param from an object with two properties: email and password.
 * @param recipient an object with two properties: name and email
 * @param message The message you want to send.
 *
 * @return stdClass object with two properties: status and message.
 */
function SendEmail($from,$recipient,$message)
{
    $mail = new PHPMailer(true);
    $response=new stdClass();
    $response->status=false;
    $response->message='';

    try {
        //Server settings
        /* Setting up the SMTP server. */
        $mail->isSMTP();                                             // Send using SMTP
        $mail->Host       = 'smtp.capsu.edu.ph';                        // Set the SMTP server to send through
        $mail->SMTPAuth   = true;                                    // Enable SMTP authentication
        $mail->Username   = $from->email;                                   // SMTP username
        $mail->Password   = $from->password;                               // SMTP password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;           // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
        $mail->Port       = 587;
        // TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above

        //Recipients
        $mail->setFrom($from->email, $from->name);
        $mail->addAddress($recipient->email,$recipient->name);     // Add a recipient

        // Content
        $mail->isHTML(true);                                  // Set email format to HTML
        $mail->Subject = 'subject';
        $mail->Body=$message;
        $mail->AltBody = 'This is the body in plain text for non-HTML Mailer clients';

        /* It checks if the message was sent successfully. If it was, it sets the status to true and the message to
        "Message has been sent to". If it wasn't, it sets the status to false and the message to the error message. */
        if(!$mail->send()){
            echo $mail->ErrorInfo;
            $response->status=false;
            $response->message=$mail->ErrorInfo;
        }else{
            $response->status=true;
            $response->message="Message has been sent to".$recipient->name."\n";
        }
    } catch (Exception $e) {
        $response->status=false;
        $response->message="Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
    return $response;
}
