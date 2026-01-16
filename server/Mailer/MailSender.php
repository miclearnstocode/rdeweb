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
        $mail->Host       = 'smtp.gmail.com';                        // Set the SMTP server to send through (Gmail SMTP)
        $mail->SMTPAuth   = true;                                    // Enable SMTP authentication
        $mail->Username   = $from->email;                            // SMTP username (Gmail address)
        $mail->Password   = $from->password;                         // SMTP password (Gmail app password)
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;             // Enable TLS encryption; use SMTPS for Gmail
        $mail->Port       = 465;                                     // TCP port to connect to, use 465 for SMTPS

        //Recipients
        $mail->setFrom($from->email, $from->name);
        $mail->addAddress($recipient->email,$recipient->name);     // Add a recipient

        // Content
        $mail->isHTML(true);                                  // Set email format to HTML
        $mail->Subject = 'CAPSU RDE System - New Account Created';
        $mail->Body=$message;
        $mail->AltBody = 'Your CAPSU RDE System account has been created. Please log in to access the system.';

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
