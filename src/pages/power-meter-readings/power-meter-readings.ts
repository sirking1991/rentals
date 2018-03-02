import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';


@IonicPage()
@Component({
  selector: 'page-power-meter-readings',
  templateUrl: 'power-meter-readings.html',
})
export class PowerMeterReadingsPage {

  _data = [];
  power_meter_readings = [];

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
    this.gs.http.get(this.gs.api_url+'PowerMeters/Readings', {headers: this.gs.http_header})
      .subscribe(
        resp=>{
          load.dismiss();
          if ('OK'==resp['status']) {
            this._data = resp['data'];
            this.power_meter_readings = this._data;
          }
        },
        error=>{
          load.present();
          this.gs.presentHttpError(error);
        }
      );
  }

  open(i) {
    this.navCtrl.push("PowerMeterReadingDetailsPage",{power_meter_reading:this.power_meter_readings[i]});
  }

  search(ev: any) {
    this.power_meter_readings = this._data;  // reset

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the power_meter_readings
    if (val && val.trim() != '') {
      this.power_meter_readings = this.power_meter_readings.filter((power_meter_reading) => {
        return (power_meter_reading.nmbr.toLowerCase().indexOf(val.toLowerCase()) > -1) || 
               (power_meter_reading.date.toLowerCase().indexOf(val.toLowerCase()) > -1) || 
               (power_meter_reading.remarks.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

 
}
