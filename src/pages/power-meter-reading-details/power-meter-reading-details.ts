import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';

@IonicPage()
@Component({
  selector: 'page-power-meter-reading-details',
  templateUrl: 'power-meter-reading-details.html',
})
export class PowerMeterReadingDetailsPage {

  power_meter_reading: any;
  new_record: boolean = false;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }

    this.power_meter_reading = this.navParams.get('power_meter_reading');
    if(undefined==this.power_meter_reading) {
      this.new_record = true;
      this.power_meter_reading = {uid: 0, nmbr:'', date: this.gs.dateToday(), remarks:'', details:[]};
      this.loadMeters();
    }

  }

  loadMeters(){
      // load all meter that is currently use in the unit that has lessee
      this.gs.http.get(this.gs.api_url+'PowerMeters/active_meters', {headers: this.gs.http_header})
        .subscribe(
          resp=>{
            if ('OK'==resp['status']){
              this.power_meter_reading.details = resp['data']
            }
          },
          error=>{console.log(error);}
        );
  }


  save(){
    if(this.new_record) {
      if (!this.gs.user_has_permission('PowerMeterReadingsPage', 'add', true)) return;
      // new record
      this.gs.http.post(this.gs.api_url+'PowerMeters/Readings', JSON.stringify(this.power_meter_reading), {headers: this.gs.http_header})
        .subscribe(
          success=>{console.log(success);},  
          error=>{console.log(error);}
        );
    } else {
      if (!this.gs.user_has_permission('PowerMeterReadingsPage', 'edit', true)) return;
      // update record
      this.gs.http.put(this.gs.api_url+'PowerMeters/Readings', JSON.stringify(this.power_meter_reading), {headers: this.gs.http_header})
        .subscribe(
          success=>{console.log(success);},  
          error=>{console.log(error)}
        );
    }
    this.navCtrl.pop();
  }


  delete(){
    if (!this.gs.user_has_permission('PowerMeterReadingsPage', 'delete', true)) return;
    this.gs.alertCtrl.create({
      title: 'Confirm record delete',
      buttons: [
        {text: 'Cancel',role: 'cancel'},
        {
          text: 'Delete',
          handler: () => {
            this.gs.http.delete(this.gs.api_url+'PowerMeters/Readings'+'/?uid='+this.power_meter_reading.uid, {headers: this.gs.http_header})
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


  updateReading(idx){
    var read = this.power_meter_reading.details[idx];

    let alert = this.gs.alertCtrl.create({
      title: 'Current reading',
      inputs: [
        {name: 'current', placeholder: 'Current', value: read.current},
      ],
      buttons: [
        {text: 'Cancel', role: 'cancel'},
        {
          text: 'Update',
          handler: data => {  
            this.power_meter_reading.details[idx].current = data.current;
          }
        }
      ]
    });
    alert.present();
  }
}
