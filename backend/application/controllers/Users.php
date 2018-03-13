<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Users extends CI_Controller {

    var $auth_info;

    function __construct() {		
		parent::__construct();
        rest_header();		
        
        $http_headers   = getallheaders();
        $auth_info      = json_decode($http_headers['auth_info']);
        if( !is_credential_valid($auth_info->account_code, $auth_info->user_code, $auth_info->token) ) {
            header('HTTP/1.0 403 Forbidden');
            die();
        }        

        $this->auth_info = $auth_info;

    }

    function index(){
        if ('GET'==$_SERVER['REQUEST_METHOD']) {
            $result = $this->db->get_where('users',array('account_code'=>$this->auth_info->account_code))->result_array();

            $meta = meta_get($this->auth_info->account_code,'users_last_update');
            if (null==$meta) $meta['value'] = date('Y-m-d H:i:s');
            
            echo json_encode(array('status'=>'OK', 
                                   'data'=>$result, 
                                   'last_update'=>$meta['value'] ));
        }

        if ('POST'==$_SERVER['REQUEST_METHOD']) {
            $post = json_decode(file_get_contents('php://input'));
            $this->db->set(array(
                'account_code'  => $this->auth_info->account_code,
                'code'          => $post->code,
                'first_name'    => $post->first_name,
                'last_name'     => $post->last_name,
                'password'      => $post->password,
                'permissions'   => $post->permissions,
                'created_by'    => $this->auth_info->user_code,
                'created_on'    => date('Y-m-d H:i:s')
            ));
            $this->db->insert('users');            

            meta_set($this->auth_info->account_code, 'users_last_update', date('Y-m-d H:i:s'));

            echo json_encode(array('status'=>'OK', 'uid'=>$this->db->insert_id()));
            exit;
        }

        if ('PUT'==$_SERVER['REQUEST_METHOD']) {
            $post = json_decode(file_get_contents('php://input'));
            $this->db->set(array(
                'code'          => $post->code,
                'first_name'    => $post->first_name,
                'last_name'     => $post->last_name,
                'password'      => $post->password,
                'permissions'   => $post->permissions,
                'edited_by'    => $this->auth_info->user_code,
                'edited_on'    => date('Y-m-d H:i:s')
            ));
            $this->db->where(array('uid'=>$post->uid,'account_code'=>$this->auth_info->account_code));
            $this->db->update('users');

            meta_set($this->auth_info->account_code, 'users_last_update', date('Y-m-d H:i:s'));

            if (1==$this->db->affected_rows() ) {
                echo json_encode(array('status'=>'OK', 'uid'=>$post->uid));
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
            }            
            exit;
        }        

        if ('DELETE'==$_SERVER['REQUEST_METHOD']) {
            $this->db->where(array('uid'=>$this->input->get('uid'),'account_code'=>$this->auth_info->account_code));
            $this->db->delete('users');

            meta_set($this->auth_info->account_code, 'users_last_update', date('Y-m-d H:i:s'));

            if (1==$this->db->affected_rows() ) {
                echo json_encode(array('status'=>'OK', 'uid'=>$this->input->get('uid')));
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
            }            
            exit;
        }


    }
    
}