import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';


@IonicPage()
@Component({
  selector: 'page-users',
  templateUrl: 'users.html',
})
export class UsersPage {

  _data = [];
  users = [];

  constructor(public navCtrl: NavController, private gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }
  }

  ionViewWillEnter() {
    this.reloadData();
  }

  reloadData(){
    let load = this.gs.loadCtrl.create({content:'Loading data...'});
    load.present();
    this.gs.http.get(this.gs.api_url+'Users', {headers: this.gs.http_header})
      .subscribe(
        resp=>{
          load.dismiss();
          if ('OK'==resp['status']) {
            this._data = resp['data'];
            this.users = this._data;
          }
        },
        error=>{
          load.dismiss();
          this.gs.presentHttpError(error);
        }
      );
  }

  open(i) {
    this.navCtrl.push("UserDetailsPage",{user:this.users[i]});
  }

  search(ev: any) {
    this.users = this._data;  // reset

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
