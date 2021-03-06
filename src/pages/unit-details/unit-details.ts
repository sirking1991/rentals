import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';

@IonicPage()
@Component({
  selector: 'page-unit-details',
  templateUrl: 'unit-details.html',
})
export class UnitDetailsPage {

  unit: any;
  new_record: boolean = false;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }

    this.unit = this.navParams.get('unit');
    if(undefined==this.unit) {
      this.new_record = true;
      this.unit = {uid: 0, nmbr:'', power_meter_nmbr: '', lessee_uid:0,  monthly_lease:0, area:0, remarks:''}
    }

  }


  save(){
    if(this.new_record) {
      if (!this.gs.user_has_permission('UnitsPage', 'add', true)) return;

      // new record
      this.gs.http.post(this.gs.api_url+'Units', JSON.stringify(this.unit), {headers: this.gs.http_header})
        .subscribe(
          success=>{
            this.gs.pull_units();
            console.log(success);
          },  
          error=>{console.log(error);}
        );
    } else {
      if (!this.gs.user_has_permission('UnitsPage', 'edit', true)) return;

      // update record
      this.gs.http.put(this.gs.api_url+'Units', JSON.stringify(this.unit), {headers: this.gs.http_header})
        .subscribe(
          success=>{
            this.gs.pull_units();
            console.log(success);
          },  
          error=>{console.log(error)}
        );
    }
    this.navCtrl.pop();
  }

  delete(){
    if (!this.gs.user_has_permission('UnitsPage', 'delete', true)) return;

    this.gs.alertCtrl.create({
      title: 'Confirm record delete',
      buttons: [
        {text: 'Cancel',role: 'cancel'},
        {
          text: 'Delete',
          handler: () => {
            this.gs.http.delete(this.gs.api_url+'Units'+'/?uid='+this.unit.uid, {headers: this.gs.http_header})
              .subscribe(
                success=>{
                  this.gs.pull_units();
                  console.log(success);
                },  
                error=>{console.log(error)}
              );
            this.navCtrl.pop();
          }
        }
      ]
    }).present();
  }

}
