<?php
defined('BASEPATH') OR exit('No direct script access allowed');


function meta_get($account_code, $code){
    $CI =& get_instance();
    return $CI->db->get_where('metas',array('account_code'=>$account_code, 'code'=>$code))->row_array();    
}

function meta_set($account_code, $code, $value) {
    $CI =& get_instance();
    
    $CI->db->set(array('account_code'=>$account_code,
                       'code'=>$code,
                       'value'=>$value));

    if (0==$CI->db->get_where('metas',array('account_code'=>$account_code, 'code'=>$code))->num_rows() ) {
        $CI->db->insert('metas');
    } else {
        $CI->db->where(array('account_code'=>$account_code, 'code'=>$code));
        $CI->db->update('metas');
    }
        
    return true;
}

function meta_delete($account_code, $code) {
    $CI =& get_instance();
    $CI->db->where(array('account_code'=>$account_code,
                       'code'=>$code));
    $CI->db->delete('metas');
    return true;    
}