import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';

@IonicPage()
@Component({
  selector: 'page-power-meter-details',
  templateUrl: 'power-meter-details.html',
})
export class PowerMeterDetailsPage {

  power_meter: any;
  new_record: boolean = false;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }

    this.power_meter = this.navParams.get('power_meter');
    if(undefined==this.power_meter) {
      this.new_record = true;
      this.power_meter = {uid: 0, nmbr:'', multiplier: 1, remarks:''}
    }

  }


  save(){
    if(this.new_record) {
      // new record
      this.gs.http.post(this.gs.api_url+'PowerMeters', JSON.stringify(this.power_meter), {headers: this.gs.http_header})
        .subscribe(
          success=>{console.log(success);},  
          error=>{console.log(error);}
        );
    } else {
      // update record
      this.gs.http.put(this.gs.api_url+'PowerMeters', JSON.stringify(this.power_meter), {headers: this.gs.http_header})
        .subscribe(
          success=>{console.log(success);},  
          error=>{console.log(error)}
        );
    }
    this.navCtrl.pop();
  }

  delete(){
    this.gs.alertCtrl.create({
      title: 'Confirm record delete',
      buttons: [
        {text: 'Cancel',role: 'cancel'},
        {
          text: 'Delete',
          handler: () => {
            this.gs.http.delete(this.gs.api_url+'PowerMeters'+'/?uid='+this.power_meter.uid, {headers: this.gs.http_header})
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
