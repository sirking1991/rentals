<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class PowerMeters extends CI_Controller {

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
            $this->db->order_by('nmbr');
            $result = $this->db->get_where('power_meters',array('account_code'=>$this->auth_info->account_code))->result_array();

            $meta = meta_get($this->auth_info->account_code,'power_meters_last_update');
            if (null==$meta) $meta['value'] = date('Y-m-d H:i:s');
            
            echo json_encode(array('status'=>'OK', 
                                   'data'=>$result, 
                                   'last_update'=>$meta['value'] ));
        }

        if ('POST'==$_SERVER['REQUEST_METHOD']) {
            $post = json_decode(file_get_contents('php://input'));
            // TODO: Make sure that nmbr does not exists yet
            $this->db->set(array(
                'account_code'  => $this->auth_info->account_code,
                'nmbr'          => $post->nmbr,
                'remarks'       => $post->remarks,
                'created_by'    => $this->auth_info->user_code,
                'created_on'    => date('Y-m-d H:i:s')
            ));
            $this->db->insert('power_meters');            

            meta_set($this->auth_info->account_code, 'power_meters_last_update', date('Y-m-d H:i:s'));

            echo json_encode(array('status'=>'OK', 'uid'=>$this->db->insert_id()));
            exit;
        }

        if ('PUT'==$_SERVER['REQUEST_METHOD']) {
            $post = json_decode(file_get_contents('php://input'));
            $this->db->set(array(
                'nmbr'          => $post->nmbr,
                'remarks'       => $post->remarks,
                'edited_by'    => $this->auth_info->user_code,
                'edited_on'    => date('Y-m-d H:i:s')
            ));
            $this->db->where(array('uid'=>$post->uid,'account_code'=>$this->auth_info->account_code));
            $this->db->update('power_meters');

            meta_set($this->auth_info->account_code, 'power_meters_last_update', date('Y-m-d H:i:s'));

            if (1==$this->db->affected_rows() ) {
                echo json_encode(array('status'=>'OK', 'uid'=>$post->uid));
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
            }            
            exit;
        }        

        if ('DELETE'==$_SERVER['REQUEST_METHOD']) {
            $this->db->where(array('uid'=>$this->input->get('uid'),'account_code'=>$this->auth_info->account_code));
            $this->db->delete('power_meters');

            meta_set($this->auth_info->account_code, 'power_meters_last_update', date('Y-m-d H:i:s'));
            
            if (1==$this->db->affected_rows() ) {
                echo json_encode(array('status'=>'OK', 'uid'=>$this->input->get('uid')));
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
            }            
            exit;
        }


    }
    

    function Readings(){
        if ('GET'==$_SERVER['REQUEST_METHOD']) {
            $data = array();
            $batches = $this->db->get_where('power_meter_readings',array('account_code'=>$this->auth_info->account_code))->result_array();
            // get details
            $details =array();
            foreach($batches as $batch) {
                $details = $this->db->get_where('power_meter_reading_details',array('batch_uid'=>$batch['uid']))->result_array();
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
                'remarks'       => $post->remarks,
                'created_by'    => $this->auth_info->user_code,
                'created_on'    => date('Y-m-d H:i:s')
            ));
            $this->db->insert('power_meter_readings');      
            $uid = $this->db->insert_id();
            // insert details
            $details = $post->details;          
            foreach($details as $detail){
                $this->db->set(array('batch_uid'=>$uid, 
                                     'unit_uid'=>$detail->unit_uid,
                                     'unit_nmbr'=>$detail->unit_nmbr,
                                     'lessee_uid'=>$detail->lessee_uid,
                                     'meter_nmbr'=>$detail->meter_nmbr, 
                                     'current'=>$detail->current, 
                                     'previous'=>$detail->previous, 
                                     'multiplier'=>$detail->multiplier))
                ->insert('power_meter_reading_details');
            }
            echo json_encode(array('status'=>'OK', 'uid'=>$uid));
            exit;
        }

        if ('PUT'==$_SERVER['REQUEST_METHOD']) {
            $post = json_decode(file_get_contents('php://input'));
            $this->db->set(array(
                'nmbr'          => $post->nmbr,
                'date'          => $post->date,
                'remarks'       => $post->remarks,
                'edited_by'    => $this->auth_info->user_code,
                'edited_on'    => date('Y-m-d H:i:s')
            ));
            $this->db->where(array('uid'=>$post->uid,'account_code'=>$this->auth_info->account_code));
            $this->db->update('power_meter_readings');
            if (1==$this->db->affected_rows() ) {
                // delete existing details
                $this->db->where('batch_uid',$post->uid)->delete('power_meter_reading_details');
                // insert details
                $details = $post->details;          
                foreach($details as $detail){
                    $this->db->set(array('batch_uid'=>$post->uid, 
                                        'unit_uid'=>$detail->unit_uid,
                                        'unit_nmbr'=>$detail->unit_nmbr,
                                        'lessee_uid'=>$detail->lessee_uid,                    
                                        'meter_nmbr'=>$detail->meter_nmbr, 
                                        'current'=>$detail->current, 
                                        'previous'=>$detail->previous, 
                                        'multiplier'=>$detail->multiplier))
                    ->insert('power_meter_reading_details');
                }                
                echo json_encode(array('status'=>'OK', 'uid'=>$post->uid));
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
            }            
            exit;
        }        

        if ('DELETE'==$_SERVER['REQUEST_METHOD']) {
            $this->db->where(array('uid'=>$this->input->get('uid'),'account_code'=>$this->auth_info->account_code))->delete('power_meter_readings');
            if (1==$this->db->affected_rows() ) {
                $this->db->where('batch_uid',$this->input->get('uid'))->delete('power_meter_reading_details');
                echo json_encode(array('status'=>'OK', 'uid'=>$this->input->get('uid')));
            } else {
                echo json_encode(array('status'=>'ERROR', 'message'=>'Record not found'));
            }            
            exit;
        }


    }

    function active_meters(){
        $meters = array();
        // get meters that are currently assigned to a unit and the unit has lessee
        $sql = "SELECT u.nmbr as unit_nmbr, u.uid as unit_uid, u.lessee_uid, u.power_meter_nmbr as meter_nmbr, m.multiplier
                FROM units u, power_meters m
                WHERE m.nmbr=u.power_meter_nmbr
                    AND u.account_code='{$this->auth_info->account_code}' AND m.account_code='{$this->auth_info->account_code}'
                    AND u.power_meter_nmbr!='' AND u.lessee_uid!=0
                ORDER BY m.nmbr
                ";                
        $result = $this->db->query($sql)->result_array();
        // get last reading
        foreach($result as $meter) {
            // get the previous readings
            $this->db->limit(1);
            $this->db->order_by('current DESC');
            $tmp = $this->db->get_where('power_meter_reading_details', array('meter_nmbr'=>$meter['meter_nmbr']))->row_array();
            $previous = 0;
            if (0!=count($tmp)) $previous = $tmp['current'];
            $meter['previous'] = $previous;
            $meter['current'] = $previous;
            $meters[] = $meter;
        }

        echo json_encode(array('status'=>'OK', 'data'=>$meters));
    
    }
}