import { Injectable } from '@angular/core';
import { AlertController, 
         ToastController, 
         ModalController, 
         LoadingController, 
         Platform} from 'ionic-angular';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import 'rxjs/add/operator/map';
import { Device } from '@ionic-native/device';
import { HttpInterceptorHandler } from '@angular/common/http/src/interceptor';

@Injectable()
export class GeneralProvider {
  
  month_names = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  api_url   = 'https://api.rentals.zeenarf.com/index.php/';

  account_code:string;
  user:any;
  token:string;

  logged_in = false;

  network_online = true;
  user_notified = false;
  on_device = false;

  device_info;
  
  http_header;

  public selectedPrinter:any=[];

  constructor(public http: HttpClient,
              public alertCtrl: AlertController,
              public modalCtrl: ModalController,
              public toastCtrl: ToastController,
              public loadCtrl: LoadingController,
              private device: Device,
              private platform: Platform) {
    console.log('Hello GeneralProvider Provider');
    
    this.on_device = this.platform.is('cordova');

    this.device_info = this.device;

    if( false==this.on_device ) this.api_url = 'http://rentals-api.localhost/index.php/';

    // ping server to check if we're online or offline
    window.setInterval(() => {
      this.ping();
    }, 60*1000);

    
  }


  ping(){
    this.http.get(this.api_url+'Auth/ping')
    .subscribe(
      data => {
        if(!this.network_online) {
          this.user_notified = false;
          this.toastCtrl.create({message:'Network connection established', duration:3000}).present()
        }
        this.network_online = true;
      },
      error => {        
        if(!this.user_notified) {
          this.user_notified = true;
          this.toastCtrl.create({message:'No network connection', showCloseButton:true}).present()
        }
        this.network_online = false;
      }
    );
  }
  
  user_has_permission(resource_id, perm_id, prompt): boolean{
    let permissions = JSON.parse(this.user.permissions);
    let has_access: boolean = false;
    for(let i=0; i<permissions.length; i++) {
      if (resource_id==permissions[i].resource_id) {
        for(let i2=0; i2<permissions[i].perm.length; i2++) {
          if (perm_id==permissions[i].perm[i2]) {
            has_access = true; 
            break;
          }
        };
      }
    }
    
    if (!has_access && prompt) this.promptDeniedAccess(resource_id, perm_id);
    
    return has_access;
  }

  promptDeniedAccess(resource_id, perm) {
    this.alertCtrl.create({subTitle:"Access denied",
                           message:"You do not have "+perm+" permission to " + resource_id,
                           buttons: ['OK']
    }).present();
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

  get_lessee_name(lessees, uid): string {
    let name = '';
    for(let i=0; i<lessees.length; i++) {
      if (uid==lessees[i].uid) {
        name = lessees[i].last_name+' '+lessees[i].first_name;
        break;
      }
    }
    return name;
  }

  get_unit_nmbr(units, uid): string {
    let nmbr = '';
    for(let i=0; i<units.length; i++) {
      if (uid==units[i].uid) {
        nmbr = units[i].nmbr;
        break;
      }
    }
    return nmbr;
  } 

  formatMoney(n) {
    return n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
  }

  roundMoney(n) {
    return Math.round(n * 100) / 100;
  }
}
