import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';

import jsSHA from 'jssha';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  account_code  = 'albert.porras';
  user_code     = 'sherwin.d';
  password      = 'qwerty';
  token         = '';

  login_btn_label = 'Login';

  constructor(public navCtrl: NavController, 
              private gs: GeneralProvider) {
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

  login(){
    this.login_btn_label = 'Please wait...';
    let enc_password = new jsSHA("SHA-256", "TEXT");
    enc_password.update(this.password+this.token);
    let body = {account_code: this.account_code, 
                user_code:    this.user_code, 
                enc_password: enc_password.getHash("HEX"),
                token:        this.token}
    this.gs.http.post(this.gs.api_url+'Auth/user_login',body)
      .subscribe(
        resp=>{
          this.login_btn_label = 'Login';
          if ('OK'==resp['status']) {
            this.gs.account_code = this.account_code;
            this.gs.token = this.token;
            this.gs.user = resp['user'];
            this.gs.logged_in = true;
            this.gs.setHttpHeader();
            this.navCtrl.setRoot('HomePage');
          } else {
            this.gs.alertCtrl.create({
              title:'Login failed',
              message:resp['message'],
              buttons: ['OK']}).present();
          }
        },
        error=>{
          this.gs.presentHttpError(error);
        }
      );
  }

}
