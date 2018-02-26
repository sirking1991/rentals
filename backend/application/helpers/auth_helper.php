<?php
defined('BASEPATH') OR exit('No direct script access allowed');

function is_token_valid($token){
    // token exist and still valid?
}

function is_credential_valid($account_code, $user_code, $token) {
    $CI =& get_instance();

    $query = $CI->db->get_where('tokens',array('token'=>$token, 'account_code'=>$account_code, 'user_code'=>$user_code));
    return 1==$query->num_rows();
}
