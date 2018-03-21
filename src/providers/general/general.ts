import { Injectable } from '@angular/core';
import { AlertController, 
         ToastController, 
         ModalController, 
         LoadingController, 
         Platform} from 'ionic-angular';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import 'rxjs/add/operator/map';
import { Device } from '@ionic-native/device';

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

  users   = [];
  lessees = [];
  units   = [];
  power_meters  = [];
  pingRefresh = 60;

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
    }, this.pingRefresh*1000);

    
  }

  pull_users(){
    this.http.get(this.api_url+'Users', {headers: this.http_header})
    .subscribe(
      resp=>{
        if ('OK'==resp['status']) {
          this.users = resp['data'];
          window.localStorage.setItem('users_last_pull', resp['last_update']);
        }
      },
      error=>{ this.presentHttpError(error); }
    );    
  }


  pull_lessees(){
    this.http.get(this.api_url+'Lessees', {headers: this.http_header})
    .subscribe(
      resp=>{
        if ('OK'==resp['status']) {
          this.lessees = resp['data'];
          window.localStorage.setItem('lessees_last_pull', resp['last_update']);
        }
      },
      error=>{ this.presentHttpError(error); }
    );        
  }


  pull_units(){
    this.http.get(this.api_url+'Units', {headers: this.http_header})
    .subscribe(
      resp=>{
        if ('OK'==resp['status']) {
          this.units = resp['data'];
          window.localStorage.setItem('units_last_pull', resp['last_update']);
        }
      },
      error=>{ this.presentHttpError(error); }
    );        
  }


  pull_power_meters(){
    this.http.get(this.api_url+'PowerMeters', {headers: this.http_header})
    .subscribe(
      resp=>{
        if ('OK'==resp['status']) {
          this.power_meters = resp['data'];
          window.localStorage.setItem('power_meters_last_pull', resp['last_update']);
        }
      },
      error=>{ this.presentHttpError(error); }
    );        
  }

  ping(){

    this.http.get(this.api_url+'Auth/ping', {headers: this.http_header})
    .subscribe(
      data => {
        if(!this.network_online) {
          this.user_notified = false;
          this.toastCtrl.create({message:'Network connection established', duration:3000}).present()
        }
        this.network_online = true;

        if (this.logged_in){
          // Check if we need to pull master files
          let last_pull: Date;
          let last_update: Date;          
          
          last_pull = new Date(window.localStorage.getItem('users_last_pull'));
          last_update = new Date(data['additional_info'].users_last_update);
          if (last_pull<last_update) this.pull_users();

          last_pull = new Date(window.localStorage.getItem('lessees_last_pull'));
          last_update = new Date(data['additional_info'].lessees_last_update);
          if (last_pull<last_update) this.pull_lessees();

          last_pull = new Date(window.localStorage.getItem('units_last_pull'));
          last_update = new Date(data['additional_info'].units_last_update);
          if (last_pull<last_update) this.pull_units();

          last_pull = new Date(window.localStorage.getItem('power_meters_last_pull'));
          last_update = new Date(data['additional_info'].power_meters_last_update);
          if (last_pull<last_update) this.pull_power_meters();
        }
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

    // if user is an admin, we always return true
    if ('1'==this.user.is_admin) return true;

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
    if (this.logged_in) {
      this.http_header = new HttpHeaders({
        'Content-Type':  'application/json',
        'auth_info': JSON.stringify({account_code:this.account_code, user_code:this.user.code, token: this.token})
      });      
    } else {
      this.http_header = new HttpHeaders();
    }

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

  get_lessee(uid): any {
    let lessee: any = {name:'Lessee not found:'+uid};
    for(let i=0; i<this.lessees.length; i++) {
      if (uid==this.lessees[i].uid) {
        lessee = this.lessees[i];
        lessee.name = lessee.last_name+', '+lessee.first_name;
        break;
      }
    }
    return lessee;
  }

  get_unit(uid): any {
    let unit: any = null;
    for(let i=0; i<this.units.length; i++) {
      if (uid==this.units[i].uid) {
        unit = this.units[i];
        break;
      }
    }
    return unit;
  }


  get_user(uid): any {
    let user: any = null;
    for(let i=0; i<this.users.length; i++) {
      if (uid==this.users[i].uid) {
        user = this.users[i];
        user.name = user.last_name+', '+user.first_name;
        break;
      }
    }
    return user;
  }  


  formatMoney(n) {
    n = parseFloat(n);
    return n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
  }

  roundMoney(n) {
    return Math.round(n * 100) / 100;
  }
}
