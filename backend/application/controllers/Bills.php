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
 

    function soa(){
        $data = array();
        $lessees = json_decode($this->input->get('lessees'));
        foreach($lessees as $lessee){
            $data[] = array('lessee_uid'=>$lessee,
                            'soa'=>$this->_unpaid_bills($lessee, date('Y-m-d'), 0)
                            );
        }
        echo json_encode(array('status'=>'OK', 'data'=>$data));
    }


    function unpaid_bills(){
        if ('GET'==$_SERVER['REQUEST_METHOD']) {
            $lessee_uid          = $this->input->get('lessee_uid');
            $exclude_payment_uid = $this->input->get('exclude_payment_uid');

            echo json_encode(array('status'=>'OK', 
                                   'data'=>$this->_unpaid_bills($lessee_uid, date('Y-m-d'), $exclude_payment_uid)
                                   )
                            );    
        }
    }


    private function _unpaid_bills($lessee_uid, $as_of, $exclude_payment_uid){
        // TODO: Optimise this code
        $sql = "SELECT uid, nmbr, date, amount, remarks
                FROM bills                    
                WHERE account_code='{$this->auth_info->account_code}' AND lessee_uid=$lessee_uid
                ORDER BY date ASC";

        $bills = $this->db->query($sql)->result_array();
        $data = array();
        foreach($bills as $bill) {
            // get applied payment (excluding the payment_passed
            $payment = $this->db->select('ifnull(sum(applied_amount),0) as applied_amount')
                                    ->where(array('bill_uid'=>$bill['uid'], 
                                                'payment_uid !='=>$exclude_payment_uid,
                                                'account_code'=>$this->auth_info->account_code))
                                    ->get('payment_applications')->row_array();
            $bill['amount'] = $bill['amount'] - $payment['applied_amount'];
            if( 0<$bill['amount'] ) $data[] = $bill;
        }
        return $data;        
    }


    function ledger(){
        $data = array();
        $lessee_uid     = json_decode($this->input->get('lessee_uid'));
        $date_from      = $this->input->get('date_from');
        $date_to        = $this->input->get('date_to');

        // get balance before $date_from
        $bills = $this->db->select('ifnull(sum(amount),0) as amount')
                          ->where(array('account_code'=>$this->auth_info->account_code,
                                        'lessee_uid'=>$lessee_uid,
                                        'date <'=>$date_from))->get('bills')->row_array();
        $payments = $this->db->select('ifnull(sum(amount),0) as amount')
                             ->where(array('account_code'=>$this->auth_info->account_code,
                                        'lessee_uid'=>$lessee_uid,
                                        'date <'=>$date_from))->get('payments')->row_array();
        $balance = $bills['amount'] - $payments['amount'];
        $data[] = array('type'=>'FWRDBAL', 'nmbr'=>'FWRDBAL', 'date'=>$date_from, 'remarks'=>'Balance before '.$date_from, 'amount'=>$balance);

        // get bills & payment between $date_from & $date_to
        $bills_payments = $this->db->where(array('account_code'=>$this->auth_info->account_code,
                                                   'lessee_uid'=>$lessee_uid,
                                                   'date >='=>$date_from, 'date <='=>$date_to,))
                                    ->order_by('date, type')
                                    ->get('bills_payments')->result_array();
        foreach($bills_payments as $bp) {
            $data[] = array('type'=>$bp['type'], 'nmbr'=>$bp['nmbr'], 'date'=>$bp['date'], 'remarks'=>$bp['remarks'], 'amount'=>$bp['amount']);
        }
        echo json_encode(array('status'=>'OK', 'data'=>$data));        
    }


    public function summary(){
        $data = array();
        $user_code      = $this->input->get('user_code');
        $lessee_uid     = $this->input->get('lessee_uid');
        $date_from      = $this->input->get('date_from');
        $date_to        = $this->input->get('date_to');
        
        $this->db->where('account_code',$this->auth_info->account_code);
        
        if (''!=$user_code) $this->db->where('created_by',$user_code);

        if ('0'!=$lessee_uid) $this->db->where('lessee_uid',$lessee_uid);

        $data = $this->db->get_where('bills', array('date >='=>$date_from, 'date <='=>$date_to))->result_array();

        echo json_encode(array('status'=>'OK', 'data'=>$data));
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

        if ('DELETE'==$_SERVER['REQUEST_METHOD']) {
            $batch_uid      = $this->input->get('uid');
            $account_code   = $this->auth_info->account_code;
            
            $this->db->where(array('uid'=>$batch_uid,'account_code'=>$account_code))->delete('batch_bills');
            if (1==$this->db->affected_rows() ) {
                // delete payment applications on the bills under the batch
                $sql = "DELETE FROM payment_applications 
                    WHERE bill_uid IN (SELECT uid FROM bills WHERE batch_uid={$batch_uid} AND account_code='{$account_code}') 
                    AND account_code='{$account_code}'";
                $this->db->query($sql);
                // delete bills under the batch
                $sql = "DELETE FROM bills WHERE batch_uid={$batch_uid} AND account_code='{$account_code}'";
                $this->db->query($sql);

                echo json_encode(array('status'=>'OK', 'uid'=>$batch_uid));
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
            }            
            exit;
        }        


    }

}