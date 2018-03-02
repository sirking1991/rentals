<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Auth extends CI_Controller {

    function __construct() {		
		parent::__construct();
		rest_header();		
		header('Content-Type: application/json');
	}
	

	function get_token() {
		$token = hash('sha256',date('Y-m-d H:i:s').rand());
		$valid_until = date('Y-m-d H:i:s', strtotime(date('Y-m-d H:i:s'). ' + 1 days'));

		$this->db->set(array('token'=>$token,'created_on'=>date('Y-m-d H:i:s'), 'valid_until'=>$valid_until))->insert('tokens');

		echo json_encode(array('status'=>'OK','token'=>$token));
	}


	function user_login(){
		$body = json_decode(file_get_contents('php://input'));
		
		$account_code 	= $body->account_code;
		$user_code		= $body->user_code;
		$enc_password	= $body->enc_password;
		$token			= $body->token;

		// check validity of token
		$query = $this->db->where(array('token'=>$token,'valid_until >'=>date('Y-m-d H:i:s')))->get('tokens');
		if (1!=$query->num_rows()) {
			echo json_encode(array('status'=>'ERROR','message'=>'Invalid token'));
			exit;
		}
		// verify account is active
		$account = $this->db->where(array('code'=>$account_code, 'status'=>'ACTIVE'))->get('accounts');
		if (1!=$account->num_rows()) {
			echo json_encode(array('status'=>'ERROR','message'=>'Invalid account'));
			exit;
		}
		// verify user exist
		$user = $this->db->get_where('users',array('code'=>$user_code, 'account_code'=>$account_code));
		if (1!=$user->num_rows()) {
			echo json_encode(array('status'=>'ERROR','message'=>'Invalid user'));
			exit;
		}
		// check if $enc_password match
		$row = $user->row();
		if (!isset($row)) {
			echo json_encode(array('status'=>'ERROR','message'=>'Invalid user'));
			exit;
		}
		$password = hash('sha256',$row->password.$token);
		if( $password!=$enc_password ) {
			echo json_encode(array('status'=>'ERROR','message'=>'Invalid password','$password='.$password));
			exit;			
		}

		// update token with account_code & user_code
		$this->db->set(array('account_code'=>$account_code, 'user_code'=>$user_code))
				 ->where('token',$token)->update('tokens');

		echo json_encode(array('status'=>'OK',
							   'user'=>array('code'=>$row->code,'first_name'=>$row->first_name, 'last_name'=>$row->last_name, 'permissions'=>$row->permissions)));

	}


	function user_logout() {
		$body = json_decode(file_get_contents('php://input'));
		
		$account_code 	= $body->account_code;
		$user_code		= $body->user_code;
		$token			= $body->token;

		// delete token
		$this->db->where(array('token'=>$token, 'account_code'=>$account_code, 'user_code'=>$user_code))->delete('tokens');		
		
		echo json_encode(array('status'=>'OK'));
	}


	function ping(){
		echo json_encode(array('status'=>'OK','datetime'=>date('Y-m-d H:i:s')));
	}


	function sha256($s){
		echo hash('sha256',$s);
	}
	
}