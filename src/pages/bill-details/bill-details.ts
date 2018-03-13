import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';

@IonicPage()
@Component({
  selector: 'page-bill-details',
  templateUrl: 'bill-details.html',
})
export class BillDetailsPage {

  bill: any;
  new_record: boolean = false;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }
    
    this.bill = this.navParams.get('bill');

    if(undefined==this.bill) {
      this.new_record = true;
      this.bill = {uid:0, nmbr:'', date:this.gs.dateToday(), unit_uid:0, amount:0, remarks:''}
    }

  }


  save(){
    if(this.new_record) {
      if (!this.gs.user_has_permission('BillsPage', 'add', true)) return;
      // new record
      this.gs.http.post(this.gs.api_url+'Bills', JSON.stringify(this.bill), {headers: this.gs.http_header})
        .subscribe(
          success=>{console.log(success);},  
          error=>{console.log(error);}
        );
    } else {
      if (!this.gs.user_has_permission('BillsPage', 'edit', true)) return;
      // update record
      this.gs.http.put(this.gs.api_url+'Bills', JSON.stringify(this.bill), {headers: this.gs.http_header})
        .subscribe(
          success=>{console.log(success);},  
          error=>{console.log(error)}
        );
    }
    this.navCtrl.pop();
  }

  delete(){
    if (!this.gs.user_has_permission('BillsPage', 'delete', true)) return;
    this.gs.alertCtrl.create({
      title: 'Confirm record delete',
      buttons: [
        {text: 'Cancel',role: 'cancel'},
        {
          text: 'Delete',
          handler: () => {
            this.gs.http.delete(this.gs.api_url+'Bills'+'/?uid='+this.bill.uid, {headers: this.gs.http_header})
              .subscribe(
                success=>{console.log(success);},  
                error=>{console.log(error)}
              );
            this.navCtrl.pop();
          }
        }
      ]
    }).present();
  }

}
