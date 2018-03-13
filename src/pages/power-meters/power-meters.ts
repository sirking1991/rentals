import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';


@IonicPage()
@Component({
  selector: 'page-power-meters',
  templateUrl: 'power-meters.html',
})
export class PowerMetersPage {

  power_meters = [];

  constructor(public navCtrl: NavController, private gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }
  }


  ionViewWillEnter() {
    this.power_meters = this.gs.power_meters;
  }


  open(i) {
    this.navCtrl.push("PowerMeterDetailsPage",{power_meter:this.power_meters[i]});
  }

  search(ev: any) {
    this.power_meters = this.gs.power_meters;  // reset

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the power_meters
    if (val && val.trim() != '') {
      this.power_meters = this.power_meters.filter((power_meter) => {
        return (power_meter.nmbr.toLowerCase().indexOf(val.toLowerCase()) > -1) || (power_meter.remarks.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

 
}
