<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Account extends CI_Controller {

    function __construct() {		
		parent::__construct();
		rest_header();		
		header('Content-Type: application/json');
	}


	function register(){
        $body = json_decode(file_get_contents('php://input'));

        // make sure email is valid
        if( !validEmail($body->email)) {
            echo json_encode(array('status'=>'ERROR','message'=>"Email is invalid"));
            exit;
        }
        // check if email already exist
        $account = $this->db->get_where('accounts', array('email'=>$body->email));
        if (0!=$account->num_rows()) {
            echo json_encode(array('status'=>'ERROR','message'=>"Email already registered: {$body->email}"));
            exit;
        }

        // create account_code
        $account_code = substr($body->first_name,0,3).'-'.substr(md5($body->first_name.$body->last_name.$body->email.date('Y-m-d H:i:s')),0,3);
        $account_code = strtolower($account_code);
        // save to DB
        $this->db->set(array(
            'code'          => $account_code,
            'first_name'    => $body->first_name,
            'last_name'     => $body->last_name,
            'phone'         => $body->phone,
            'email'         => $body->email,
            'birth_date'    => $body->birth_date,
            'status'        => 'ACTIVE'
        ));
        $this->db->insert('accounts');
        // create the initial admin account
        $admin_code         = 'admin';
        $admin_password     = strtolower(_generateKey(5));
        $this->db->set(array(
            'code'              => $admin_code,
            'account_code'      => $account_code,
            'first_name'        => $body->first_name,
            'last_name'         => $body->last_name,
            'password'          => $admin_password,
            'is_admin'          => 1,
            'permissions'       => '[]',
            'created_by'        => '_system',
            'created_on'        => date('Y-m-d H:i:s')
        ));
        $this->db->insert('users');
        // send confirmation email
        $this->load->helper('gmailer');
        $message = "<h1>Welcome!</h1>" . 
            "Your Rentals account is now ready. You may use the credentials below to login:<br/>".
            "Account code: <strong>{$account_code}</strong><br/>".
            "User code: <strong>{$admin_code}</strong><br/>".
            "Password: <strong>{$admin_password}</strong><br/><br/>".
            "Thanks!<br/>-Rentals team";
        send_email($body->email, 
                   'Welcome to Rentals', 
                   $this->load->view('email_template',array('content'=>$message), true) );
        
        echo json_encode(array('status'=>'OK','message'=>"Registration successfull, Please check your email for confirmation"));
    }
    

}