import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';


@IonicPage()
@Component({
  selector: 'page-bills',
  templateUrl: 'bills.html',
})
export class BillsPage {

  date_from:string;
  date_to:string;

  _data = [];
  bills = [];

  constructor(public navCtrl: NavController, public gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }
    let dt = new Date();
    this.date_from  = dt.getFullYear() + '-' + ('0'+(dt.getMonth()+1).toString()).substr(-2,2) + '-01';
    this.date_to    = gs.dateToday();

  }

  ionViewWillEnter() {
    this.reloadData();
  }

  reloadData(){
    let load = this.gs.loadCtrl.create({content:'Loading data...'});
    load.present();
    this.gs.http.get(this.gs.api_url+'Bills/?date_from='+this.date_from+'&date_to='+this.date_to, {headers: this.gs.http_header})
      .subscribe(
        resp=>{
          load.dismiss();
          if ('OK'==resp['status']) {
            this._data = resp['data'];
            this.bills = this._data;
          }
        },
        error=>{
          load.dismiss();
          this.gs.presentHttpError(error);
        }
      );
  }

  dateFilters(){
    let alert = this.gs.alertCtrl.create({
      title: 'Date filters',
      inputs: [
        {name: 'date_from', placeholder: 'Date from', value: this.date_from, type:'date'},
        {name: 'date_to', placeholder: 'Date to', value: this.date_to, type:'date'}
      ],
      buttons: [
        {text: 'Cancel', role: 'cancel'},
        {
          text: 'Update',
          handler: data => {  
            this.date_from = data.date_from;
            this.date_to = data.date_to;
            this.reloadData();
          }
        }
      ]
    });
    alert.present();
  }

  open(i) {
    this.navCtrl.push("BillDetailsPage",{bill:this.bills[i]});
  }

  search(ev: any) {
    this.bills = this._data;  // reset

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the bills
    if (val && val.trim() != '') {
      this.bills = this.bills.filter((bill) => {
        return (bill.nmbr.toLowerCase().indexOf(val.toLowerCase()) > -1) 
        || (bill.date.toLowerCase().indexOf(val.toLowerCase()) > -1)
        || (bill.remarks.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

 
}
