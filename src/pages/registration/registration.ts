import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';

@IonicPage()
@Component({
  selector: 'page-registration',
  templateUrl: 'registration.html',
})
export class RegistrationPage {

  first_name: string = '';
  last_name: string = '';
  phone: string = '';
  email: string = '';
  birth_date: string = '';

  constructor(public navCtrl: NavController, 
              private gs: GeneralProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegistrationPage');
  }

  create_account(){
    let account = {
      first_name: this.first_name,
      last_name: this.last_name,
      phone: this.phone,
      email: this.email,
      birth_date: this.birth_date,
    }
    let load = this.gs.loadCtrl.create({content:'Sending request...'});
    load.present();
    this.gs.http.post(this.gs.api_url+'Account/register', JSON.stringify(account))
    .subscribe(
      resp=>{
        load.dismiss();
        this.gs.alertCtrl.create({subTitle:resp['message'],buttons:['OK']}).present();        
        if ('OK'==resp['status']) this.navCtrl.pop();
      },  
      error=>{        
        load.dismiss();
        this.gs.presentHttpError(error);
      }
    );
  }

}
