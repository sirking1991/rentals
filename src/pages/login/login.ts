import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';

import { HomePage } from '../home/home';

import CryptoJS from 'crypto-js';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  account_code  = '';
  user_code     = '';
  password      = '';
  token         = '';

  login_btn_label = 'Login';

  constructor(public navCtrl: NavController, 
              private gs: GeneralProvider) {
    
    this.account_code = window.localStorage.getItem('account_code');
    this.user_code = window.localStorage.getItem('user_code')
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');

    // request new token
    this.gs.http.get(this.gs.api_url+'Auth/get_token')
      .subscribe(
        resp=>{
          if ('OK'==resp['status']) {
            this.token = resp['token'];
          }
        },
        error=>{
          this.gs.presentHttpError(error);
        }
      );
  }

  create_account(){
    this.navCtrl.push('RegistrationPage');
  }

  login(){
    let load = this.gs.loadCtrl.create({content:'Processing...'});
    load.present();
    
    let enc_password = CryptoJS.SHA256(this.password+this.token).toString(CryptoJS.enc.Hex);
    let body = {account_code: this.account_code, 
                user_code:    this.user_code, 
                enc_password: enc_password,
                token:        this.token}
    this.gs.http.post(this.gs.api_url+'Auth/user_login',body)
      .subscribe(
        resp=>{
          load.dismiss();
          this.login_btn_label = 'Login';
          if ('OK'==resp['status']) {
            this.gs.account_code = this.account_code;
            this.gs.token = this.token;
            this.gs.user = resp['user'];
            this.gs.logged_in = true;
            this.gs.setHttpHeader();
            
            // pull master files
            this.gs.pull_users();
            this.gs.pull_lessees();
            this.gs.pull_units();
            this.gs.pull_power_meters();

            // save the accout_code & user_code oo localStorage so we can use it again when user logins
            window.localStorage.setItem('account_code', this.account_code);
            window.localStorage.setItem('user_code',this.user_code);

            // set home as our root page
            this.navCtrl.setRoot(HomePage);
          } else {
            this.gs.alertCtrl.create({
              title:'Login failed',
              message:resp['message'],
              buttons: ['OK']}).present();
          }
        },
        error=>{
          load.dismiss();
          this.gs.presentHttpError(error);
        }
      );
  }

}
