<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Bills extends CI_Controller {

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
            $date_from = $this->input->get('date_from');
            if (null==$date_from) $date_from = date('Y-m-1');
            $date_to = $this->input->get('date_to');
            if (null==$date_to) $date_to = date('Y-m-t');

            $this->db->where("date>='{$date_from}' AND date<='{$date_to}'");
            $this->db->order_by('date DESC, nmbr');
            $result = $this->db->get_where('bills',array('account_code'=>$this->auth_info->account_code))->result_array();

            echo json_encode(array('status'=>'OK', 'data'=>$result));
        }

        if ('POST'==$_SERVER['REQUEST_METHOD']) {
            $post = json_decode(file_get_contents('php://input'));
            // get unit's lessee
            $unit = $this->db->get_where('units',array('uid'=>$post->unit_uid))->row_array();
            if (0<count($unit) ) {
                $this->db->set(array(
                    'account_code'  => $this->auth_info->account_code,
                    'nmbr'          => $post->nmbr,
                    'date'          => $post->date,
                    'unit_uid'      => $post->unit_uid,
                    'lessee_uid'    => $unit['lessee_uid'],
                    'amount'        => $post->amount,
                    'remarks'       => $post->remarks,
                    'created_by'    => $this->auth_info->user_code,
                    'created_on'    => date('Y-m-d H:i:s')
                ));
                $this->db->insert('bills');            
                echo json_encode(array('status'=>'OK', 'uid'=>$this->db->insert_id()));
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'The unit is currently not being lease'));
            }

            exit;
        }

        if ('PUT'==$_SERVER['REQUEST_METHOD']) {
            $post = json_decode(file_get_contents('php://input'));
            // get unit's lessee
            $unit = $this->db->get_where('units',array('uid'=>$post->unit_uid))->row_array();
            if (0<count($unit) ) {
                $this->db->set(array(
                    'nmbr'          => $post->nmbr,
                    'date'          => $post->date,
                    'unit_uid'      => $post->unit_uid,
                    'lessee_uid'    => $unit['lessee_uid'],
                    'amount'        => $post->amount,
                    'remarks'       => $post->remarks,
                    'edited_by'    => $this->auth_info->user_code,
                    'edited_on'    => date('Y-m-d H:i:s')
                ));
                $this->db->where(array('uid'=>$post->uid,'account_code'=>$this->auth_info->account_code));
                $this->db->update('bills');
                if (1==$this->db->affected_rows() ) {
                    echo json_encode(array('status'=>'OK', 'uid'=>$post->uid));
                } else {
                    echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
                }            
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'The unit is currently not being lease'));
            }
            exit;
        }        

        if ('DELETE'==$_SERVER['REQUEST_METHOD']) {
            $this->db->where(array('uid'=>$this->input->get('uid'),'account_code'=>$this->auth_info->account_code));
            $this->db->delete('bills');
            if (1==$this->db->affected_rows() ) {
                echo json_encode(array('status'=>'OK', 'uid'=>$this->input->get('uid')));
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
            }            
            exit;
        }


    }
 
    
    function Batches(){
        if ('GET'==$_SERVER['REQUEST_METHOD']) {
            $data = array();
            $date_from = $this->input->get('date_from');
            if (null==$date_from) $date_from = date('Y-m-1');
            $date_to = $this->input->get('date_to');
            if (null==$date_to) $date_to = date('Y-m-t');

            $this->db->where("date>='{$date_from}' AND date<='{$date_to}'");
            $this->db->order_by('date DESC, nmbr');
            $batches = $this->db->get_where('batch_bills',array('account_code'=>$this->auth_info->account_code))->result_array();

            $details =array();
            foreach($batches as $batch) {
                $details = $this->db->get_where('bills',array('batch_uid'=>$batch['uid']))->result_array();
                $batch['details'] = $details;
                $data[] = $batch;
            }            
            echo json_encode(array('status'=>'OK', 'data'=>$data));
        }

        if ('POST'==$_SERVER['REQUEST_METHOD']) {
            $post = json_decode(file_get_contents('php://input'));
            $this->db->set(array(
                'account_code'  => $this->auth_info->account_code,
                'nmbr'          => $post->nmbr,
                'date'          => $post->date,
                'type'          => $post->type,
                'reading_batch_uid' => $post->reading_batch_uid,
                'rate'          => $post->rate,
                'remarks'       => $post->remarks,
                'created_by'    => $this->auth_info->user_code,
                'created_on'    => date('Y-m-d H:i:s')
            ));
            $this->db->insert('batch_bills');  
            $uid = $this->db->insert_id();
            // insert details
            $details = $post->details;          
            foreach($details as $detail){
                $this->db->set(array('account_code' => $this->auth_info->account_code,
                                    'nmbr'     => $detail->nmbr,
                                    'batch_uid' => $uid, 
                                    'date'      => $detail->date, 
                                    'lessee_uid'=> $detail->lessee_uid, 
                                    'unit_uid'  => $detail->unit_uid, 
                                    'amount'    => $detail->amount, 
                                    'remarks'   => $detail->remarks,
                                    'created_by'=>$this->auth_info->user_code,
                                    'created_on'=> date('Y-m-d H:i:s') ))
                ->insert('bills');
            }          
            echo json_encode(array('status'=>'OK', 'uid'=>$uid));

            exit;
        }
/*
        if ('PUT'==$_SERVER['REQUEST_METHOD']) {
            $post = json_decode(file_get_contents('php://input'));
            // get unit's lessee
            $unit = $this->db->get_where('units',array('uid'=>$post->unit_uid))->row_array();
            if (0<count($unit) ) {
                $this->db->set(array(
                    'nmbr'          => $post->nmbr,
                    'date'          => $post->date,
                    'remarks'       => $post->remarks,
                    'edited_by'    => $this->auth_info->user_code,
                    'edited_on'    => date('Y-m-d H:i:s')
                ));
                $this->db->where(array('uid'=>$post->uid,'account_code'=>$this->auth_info->account_code));
                $this->db->update('bills');
                if (1==$this->db->affected_rows() ) {
                    echo json_encode(array('status'=>'OK', 'uid'=>$post->uid));
                } else {
                    echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
                }            
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'The unit is currently not being lease'));
            }
            exit;
        }        

        if ('DELETE'==$_SERVER['REQUEST_METHOD']) {
            $this->db->where(array('uid'=>$this->input->get('uid'),'account_code'=>$this->auth_info->account_code));
            $this->db->delete('batch_bills');
            if (1==$this->db->affected_rows() ) {
                echo json_encode(array('status'=>'OK', 'uid'=>$this->input->get('uid')));
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
            }            
            exit;
        }
*/

    }

}