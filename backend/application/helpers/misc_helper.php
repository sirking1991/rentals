<?php
defined('BASEPATH') OR exit('No direct script access allowed');


function _log($msg, $event='GENERAL', $type='log') {
// write log
      $fh = fopen('logs/'.$type.'_'.date("Y_m_d").'.log','a');
      //$fh = fopen('outputs/nsrequests.log','a');
      fwrite($fh, "\n\n".date('Y-m-d H:i:s')." {$event} ".$msg);
      fclose($fh);      
}

function _generateKey($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}



function validEmail($email) {
  return filter_var($email, FILTER_VALIDATE_EMAIL);
}