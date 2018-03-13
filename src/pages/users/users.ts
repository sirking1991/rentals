import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';


@IonicPage()
@Component({
  selector: 'page-users',
  templateUrl: 'users.html',
})
export class UsersPage {

  users = [];

  constructor(public navCtrl: NavController, private gs: GeneralProvider) {
    if (!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }
  }

  ionViewWillEnter() {
    this.users = this.gs.users;
  }

  open(i) {
    this.navCtrl.push("UserDetailsPage",{user:this.users[i]});
  }

  search(ev: any) {
    this.users = this.gs.users;  // reset

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the users
    if (val && val.trim() != '') {
      this.users = this.users.filter((user) => {
        return (user.first_name.toLowerCase().indexOf(val.toLowerCase()) > -1) || (user.last_name.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

 
}
