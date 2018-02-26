import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';


@IonicPage()
@Component({
  selector: 'page-batch-bills',
  templateUrl: 'batch-bills.html',
})
export class BatchBillsPage {

  _data = [];
  batch_bills = [];

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
    this.gs.http.get(this.gs.api_url+'Bills/Batches', {headers: this.gs.http_header})
      .subscribe(
        resp=>{
          if ('OK'==resp['status']) {
            this._data = resp['data'];
            this.batch_bills = this._data;
          }
        },
        error=>{
          this.gs.presentHttpError(error);
        }
      );
  }

  open(i) {
    this.navCtrl.push("BatchBillDetailsPage",{bill:this.batch_bills[i]});
  }

  search(ev: any) {
    this.batch_bills = this._data;  // reset

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the bills
    if (val && val.trim() != '') {
      this.batch_bills = this.batch_bills.filter((bill) => {
        return (bill.nmbr.toLowerCase().indexOf(val.toLowerCase()) > -1) 
        || (bill.date.toLowerCase().indexOf(val.toLowerCase()) > -1)
        || (bill.remarks.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
 
}
