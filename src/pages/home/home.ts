import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  constructor(public navCtrl: NavController,
              private gs: GeneralProvider) {
  }


  ionViewDidLoad() {    
    console.log('ionViewDidLoad HomePage');
  }

  ionView

  logout() {
    this.gs.account_code = '';
    this.gs.token = '';
    this.gs.user = {};
    this.gs.logged_in = false;
    this.navCtrl.setRoot('LoginPage');
  }

  openPage(page) {
    this.navCtrl.push(page);
  }

}
