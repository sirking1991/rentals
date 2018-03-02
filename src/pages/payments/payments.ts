import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';


@IonicPage()
@Component({
  selector: 'page-payments',
  templateUrl: 'payments.html',
})
export class PaymentsPage {

  date_from:string;
  date_to:string;

  _data = [];
  payments = [];
  units = [];
  lessees = []

  constructor(public navCtrl: NavController, public gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }
    let dt = new Date();
    this.date_from  = dt.getFullYear() + '-' + ('0'+(dt.getMonth()+1).toString()).substr(-2,2) + '-01';
    this.date_to    = gs.dateToday();

    // get lessees
    this.gs.http.get(this.gs.api_url+'Lessees', {headers: this.gs.http_header})
    .subscribe(
      resp=>{ if ('OK'==resp['status']) {this.lessees = resp['data'];} },
      error=>{this.gs.presentHttpError(error);}
    );
    // get units
    this.gs.http.get(this.gs.api_url+'Units', {headers: this.gs.http_header})
    .subscribe(
      resp=>{ if ('OK'==resp['status']) {this.units = resp['data'];} },
      error=>{this.gs.presentHttpError(error);}
    );    
  }

  ionViewWillEnter() {
    this.reloadData();
  }

  reloadData(){
    let load = this.gs.loadCtrl.create({content:'Loading data...'});
    load.present();
    this.gs.http.get(this.gs.api_url+'Payments/?date_from='+this.date_from+'&date_to='+this.date_to, {headers: this.gs.http_header})
      .subscribe(
        resp=>{
          load.dismiss();
          if ('OK'==resp['status']) {
            this._data = resp['data'];
            this.payments = this._data;
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
    this.navCtrl.push("PaymentDetailsPage",{payment:this.payments[i], lessees:this.lessees, units:this.units});
  }

  search(ev: any) {
    this.payments = this._data;  // reset

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the payments
    if (val && val.trim() != '') {
      this.payments = this.payments.filter((payment) => {
        return (payment.nmbr.toLowerCase().indexOf(val.toLowerCase()) > -1) 
        || (payment.date.toLowerCase().indexOf(val.toLowerCase()) > -1)
        || (payment.remarks.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

   

 
}
