<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Welcome extends CI_Controller {

    function __construct() {		
        parent::__construct(); 
        date_default_timezone_set('UTC');       
    }

    function index(){
        echo date('Y-m-d H:i:s');
    }

}