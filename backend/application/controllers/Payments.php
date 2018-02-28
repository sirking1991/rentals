<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Payments extends CI_Controller {

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
            $result = $this->db->get_where('payments',array('account_code'=>$this->auth_info->account_code))->result_array();

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
                $this->db->insert('payments');    
                $uid = $this->db->insert_id();
                // save application
                $this->save_applications($uid,$post->applications);
                echo json_encode(array('status'=>'OK', 'uid'=>$uid));
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
                $this->db->update('payments');
                if (1==$this->db->affected_rows() ) {
                    $this->save_applications($post->uid,$post->applications);
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
            $this->db->where(array('payment_uid'=>$this->input->get('uid'),
                                   'account_code'=>$this->auth_info->account_code))
                     ->delete('payment_applications');
            $this->db->where(array('uid'=>$this->input->get('uid'),
                                   'account_code'=>$this->auth_info->account_code))
                     ->delete('payments');
            if (1==$this->db->affected_rows() ) {
                echo json_encode(array('status'=>'OK', 'uid'=>$this->input->get('uid')));
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
            }            
            exit;
        }


    }

    private function save_applications($payment_uid, $applications){
        // delete existing
        $this->db->where('payment_uid',$payment_uid)->delete('payment_applications');
        // save application
        foreach($applications as $pa) {
            $this->db->set(array('account_code' =>$this->auth_info->account_code,
                                 'payment_uid'  =>$payment_uid, 
                                 'bill_uid'     =>$pa->uid,
                                 'applied_amount'=>$pa->amount))
                     ->insert('payment_applications');
        }        
    }

    function payment_application(){
        if ('GET'==$_SERVER['REQUEST_METHOD']) {
            $uid = $this->input->get('uid');

            $this->db->select("pa.*, b.nmbr as bill_nmbr, b.date as bill_date, b.remarks");
            $this->db->where(array('pa.payment_uid'=>$uid, 'pa.account_code'=>$this->auth_info->account_code));
            $this->db->where('b.uid=pa.bill_uid');
            $row = $this->db->get('payment_applications pa, bills b')->result_array();

            echo json_encode(array('status'=>'OK', 'data'=>$row));
        }        
    }
 


}