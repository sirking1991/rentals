<?php
defined('BASEPATH') OR exit('No direct script access allowed');

function send_email($to ,$subject ,$message) {
	// include email sender
	require_once 'inc/swiftmailer-5.x/lib/swift_required.php';
	// setup mailer 
	$transport = Swift_SmtpTransport::newInstance('ssl://smtp.gmail.com', 465)
										->setUsername('rentals.zeenarf@gmail.com')
										->setPassword('Jerome01');
	// Mailer
	$mailer = Swift_Mailer::newInstance($transport);		
	
	// sent email
	$message = Swift_Message::newInstance($subject)
			    ->setFrom(array('rentals.zeenarf@gmail.com' => 'Rentals emailer'))
				->setTo($to)				
			    ->setBody($message, 'text/html');

	// Send the message
	if ($mailer->send($message)) {
	    $email_status = "Mail sent successfully.";
	} else {
		_log("Email failed to send to {$to} with subject={$subject}");
	    $email_status = "Problen sending email.";
	}
		
	return $email_status;
}