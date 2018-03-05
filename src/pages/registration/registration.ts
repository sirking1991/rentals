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

  }

}
