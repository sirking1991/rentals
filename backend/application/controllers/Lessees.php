<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Lessees extends CI_Controller {

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
            $this->db->order_by('last_name, first_name');
            $result = $this->db->get_where('lessees',array('account_code'=>$this->auth_info->account_code))->result_array();

            echo json_encode(array('status'=>'OK', 'data'=>$result));
        }

        if ('POST'==$_SERVER['REQUEST_METHOD']) {
            $post = json_decode(file_get_contents('php://input'));
            $this->db->set(array(
                'account_code'  => $this->auth_info->account_code,
                'first_name'    => $post->first_name,
                'last_name'     => $post->last_name,
                'phone'         => $post->phone,
                'email'         => $post->email,
                'address'       => $post->address,
                'remarks'       => $post->remarks,
                'created_by'    => $this->auth_info->user_code,
                'created_on'    => date('Y-m-d H:i:s')
            ));
            $this->db->insert('lessees');            
            echo json_encode(array('status'=>'OK', 'uid'=>$this->db->insert_id()));
            exit;
        }

        if ('PUT'==$_SERVER['REQUEST_METHOD']) {
            $post = json_decode(file_get_contents('php://input'));
            $this->db->set(array(
                'first_name'    => $post->first_name,
                'last_name'     => $post->last_name,
                'phone'         => $post->phone,
                'email'         => $post->email,
                'address'       => $post->address,
                'remarks'       => $post->remarks,
                'edited_by'    => $this->auth_info->user_code,
                'edited_on'    => date('Y-m-d H:i:s')
            ));
            $this->db->where(array('uid'=>$post->uid,'account_code'=>$this->auth_info->account_code));
            $this->db->update('lessees');
            if (1==$this->db->affected_rows() ) {
                echo json_encode(array('status'=>'OK', 'uid'=>$post->uid));
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
            }            
            exit;
        }        

        if ('DELETE'==$_SERVER['REQUEST_METHOD']) {
            $this->db->where(array('uid'=>$this->input->get('uid'),'account_code'=>$this->auth_info->account_code));
            $this->db->delete('lessees');
            if (1==$this->db->affected_rows() ) {
                echo json_encode(array('status'=>'OK', 'uid'=>$this->input->get('uid')));
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
            }            
            exit;
        }


    }
    
}