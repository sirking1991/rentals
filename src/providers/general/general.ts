import { Injectable } from '@angular/core';
import { LoadingController, AlertController, ToastController } from 'ionic-angular';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import 'rxjs/add/operator/map';

@Injectable()
export class GeneralProvider {
  
  month_names = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  api_url   = 'http://rentals-api.localhost/index.php/';

  account_code:string;
  user:any;
  token:string;
  logged_in = false;
  
  http_header;

  constructor(public http: HttpClient,
              public loadingCtrl: LoadingController,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController) {
    console.log('Hello GeneralProvider Provider');
  }


  presentHttpError(e){
    this.alertCtrl.create({
      title:'Network error',
      message:'Please make sure you have an internet connection',
      buttons: ['OK']}).present();
  }

  // Set httpHeader so that it includes the validated user
  setHttpHeader(){
    this.http_header = new HttpHeaders({
        'Content-Type':  'application/json',
        'auth_info': JSON.stringify({account_code:this.account_code, user_code:this.user.code, token: this.token})
    });
  }

  dateToday(){
    var d = new Date();    
    return d.getFullYear() + '-' + 
                  ('0'+(d.getMonth()+1).toString()).substr(-2,2) + '-' + 
                  ('0'+d.getDate()).substr(-2,2);    
  }

  dateTimeNow() {
    var d = new Date();    
    return d.getFullYear() + '-' + 
                  ('0'+(d.getMonth()+1).toString()).substr(-2,2) + '-' + 
                  ('0'+d.getDate()).substr(-2,2) + ' ' +
                  d.getHours() + ':' + d.getMinutes() + ':' +d.getSeconds() ;
  }  

}
