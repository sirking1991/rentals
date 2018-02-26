<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Units extends CI_Controller {

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
            $result = $this->db->get_where('units',array('account_code'=>$this->auth_info->account_code))->result_array();

            echo json_encode(array('status'=>'OK', 'data'=>$result));
        }

        if ('POST'==$_SERVER['REQUEST_METHOD']) {
            $post = json_decode(file_get_contents('php://input'));
            // TODO: Make sure that nmbr does not exists yet
            $this->db->set(array(
                'account_code'  => $this->auth_info->account_code,
                'nmbr'          => $post->nmbr,
                'area'          => $post->area,
                'power_meter_nmbr'   => $post->power_meter_nmbr,
                'lessee_uid'    => $post->lessee_uid,
                'monthly_lease' => $post->monthly_lease,
                'remarks'       => $post->remarks,
                'created_by'    => $this->auth_info->user_code,
                'created_on'    => date('Y-m-d H:i:s')
            ));
            $this->db->insert('units');
            echo json_encode(array('status'=>'OK', 'uid'=>$this->db->insert_id()));
            exit;
        }

        if ('PUT'==$_SERVER['REQUEST_METHOD']) {
            $post = json_decode(file_get_contents('php://input'));
            $this->db->set(array(
                'nmbr'          => $post->nmbr,
                'area'          => $post->area,
                'power_meter_nmbr'   => $post->power_meter_nmbr,
                'lessee_uid'   => $post->lessee_uid,
                'monthly_lease'=> $post->monthly_lease,
                'remarks'      => $post->remarks,
                'edited_by'    => $this->auth_info->user_code,
                'edited_on'    => date('Y-m-d H:i:s')
            ));
            $this->db->where(array('uid'=>$post->uid,'account_code'=>$this->auth_info->account_code));
            $this->db->update('units');
            if (1==$this->db->affected_rows() ) {
                echo json_encode(array('status'=>'OK', 'uid'=>$post->uid));
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
            }            
            exit;
        }        

        if ('DELETE'==$_SERVER['REQUEST_METHOD']) {
            $unit_uid = $this->input->get('uid');
            $unit = $this->db->get_where('units',array('uid'=>$unit_uid, 'account_code'=>$this->auth_info->account_code))->row_array();
            if (0!=count($unit))  {
                $this->update_power_meter_lessee($unit['power_nmbr'],0);    // free the power_meter
                $this->db->where(array('uid'=>$unit_uid))->delete('units');
                if (1==$this->db->affected_rows() ) {                
                    echo json_encode(array('status'=>'OK', 'uid'=>$this->input->get('uid')));
                } else {
                    echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
                }                
            } else {

            }
            exit;
        }

    }

    private function update_power_meter_lessee($meter_nmbr, $lessee_uid) {
        $this->db->set('lessee_uid', $lessee_uid)
                 ->update('power_meters');
    }
    
}