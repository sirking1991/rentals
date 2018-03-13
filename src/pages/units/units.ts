import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';


@IonicPage()
@Component({
  selector: 'page-units',
  templateUrl: 'units.html',
})
export class UnitsPage {

  units = [];

  constructor(public navCtrl: NavController, public gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }
  }

  ionViewWillEnter() {
    this.units = this.gs.units
  }


  open(i) {
    this.navCtrl.push("UnitDetailsPage",{unit:this.units[i]});
  }

  search(ev: any) {
    this.units = this.gs.units;  // reset

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the units
    if (val && val.trim() != '') {
      this.units = this.units.filter((unit) => {
        return (unit.nmbr.toLowerCase().indexOf(val.toLowerCase()) > -1) || (unit.remarks.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

 
}
