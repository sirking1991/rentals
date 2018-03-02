import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';


@IonicPage()
@Component({
  selector: 'page-units',
  templateUrl: 'units.html',
})
export class UnitsPage {

  _data = [];
  units = [];
  lessees = [];
  power_meters = [];

  constructor(public navCtrl: NavController, private gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }
    // get lessees
    this.gs.http.get(this.gs.api_url+'Lessees', {headers: this.gs.http_header})
    .subscribe(
      resp=>{ if ('OK'==resp['status']) {this.lessees = resp['data'];} },
      error=>{this.gs.presentHttpError(error);}
    );
    // get power meters
    this.gs.http.get(this.gs.api_url+'PowerMeters', {headers: this.gs.http_header})
    .subscribe(
      resp=>{ if ('OK'==resp['status']) {this.power_meters = resp['data'];} },
      error=>{this.gs.presentHttpError(error);}
    );    
  }

  ionViewWillEnter() {
    this.reloadData();
  }

  reloadData(){
    let load = this.gs.loadCtrl.create({content:'Loading data...'});
    load.present();
    this.gs.http.get(this.gs.api_url+'Units', {headers: this.gs.http_header})
      .subscribe(
        resp=>{
          load.dismiss();
          if ('OK'==resp['status']) {
            this._data = resp['data'];
            this.units = this._data;
          }
        },
        error=>{
          load.dismiss();
          this.gs.presentHttpError(error);
        }
      );
  }

  open(i) {
    this.navCtrl.push("UnitDetailsPage",{unit:this.units[i], lessees: this.lessees, power_meters: this.power_meters});
  }

  search(ev: any) {
    this.units = this._data;  // reset

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the units
    if (val && val.trim() != '') {
      this.units = this.units.filter((unit) => {
        return (unit.nmbr.toLowerCase().indexOf(val.toLowerCase()) > -1) || (unit.remarks.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  get_lessee_name(uid): string {
    let name = '';
    for(let i=0; i<this.lessees.length; i++) {
      if (uid==this.lessees[i].uid) {
        name = this.lessees[i].last_name+' '+this.lessees[i].first_name;
        break;
      }
    }
    return name;
  }
 
}
