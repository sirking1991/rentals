import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';


@IonicPage()
@Component({
  selector: 'page-power-meters',
  templateUrl: 'power-meters.html',
})
export class PowerMetersPage {

  _data = [];
  power_meters = [];

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
    this.gs.http.get(this.gs.api_url+'PowerMeters', {headers: this.gs.http_header})
      .subscribe(
        resp=>{
          load.dismiss();
          if ('OK'==resp['status']) {
            this._data = resp['data'];
            this.power_meters = this._data;
          }
        },
        error=>{
          load.dismiss();
          this.gs.presentHttpError(error);
        }
      );
  }

  open(i) {
    this.navCtrl.push("PowerMeterDetailsPage",{power_meter:this.power_meters[i]});
  }

  search(ev: any) {
    this.power_meters = this._data;  // reset

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
