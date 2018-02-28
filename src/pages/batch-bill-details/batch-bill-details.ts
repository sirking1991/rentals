import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';

@IonicPage()
@Component({
  selector: 'page-batch-bill-details',
  templateUrl: 'batch-bill-details.html',
})
export class BatchBillDetailsPage {

  batch_bill: any;
  new_record: boolean = false;
  power_meter_readings = [];
  units = [];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }

    // get power meter readings
    this.gs.http.get(this.gs.api_url+'PowerMeters/Readings', {headers: this.gs.http_header})
    .subscribe(
      resp=>{ if ('OK'==resp['status']) {this.power_meter_readings = resp['data'];} },
      error=>{this.gs.presentHttpError(error);}
    );
    // get units
    this.gs.http.get(this.gs.api_url+'Units', {headers: this.gs.http_header})
    .subscribe(
      resp=>{ if ('OK'==resp['status']) {this.units = resp['data'];} },
      error=>{this.gs.presentHttpError(error);}
    );     
    this.batch_bill = this.navParams.get('bill');

    if(undefined==this.batch_bill) {
      this.new_record = true;
      this.batch_bill = {uid:0, nmbr:'', date:this.gs.dateToday(), type:'RENT', reading_batch_uid:0, rate:0, remarks:'', details:[]}
    }

  }

  generateBills(){
    if (0<this.batch_bill.details.length) return;    // don't generate if there is already bills

    let dt = new Date(this.batch_bill.date);

    if ('RENT'==this.batch_bill.type) {
      let prefix = this.batch_bill.type + '-' + dt.getFullYear() + '.' + (dt.getMonth()+1) + '.' + dt.getDate();
      let ctr = 1;
      this.units.forEach((unit)=>{
        if (''!=unit.tenant_uid) {
          this.batch_bill.details.push({
            nmbr:       prefix+'-'+ctr,
            date:       this.batch_bill.date,
            unit_uid:   unit.uid,
            lessee_uid: unit.lessee_uid,
            remarks:    this.batch_bill.remarks,
            amount:     this.gs.roundMoney(unit.monthly_lease)
          });
          ctr++;
        }
      });
    }

    if ('POWER'==this.batch_bill.type) {
      let prefix = this.batch_bill.type + '-' + dt.getFullYear() + '.' + (dt.getMonth()+1) + '.' + dt.getDate();
      let ctr = 1;
      let readings = [];
      // get the readings for the batch
      for(let i=0; i<this.power_meter_readings.length; i++) {
        if (this.batch_bill.reading_batch_uid==this.power_meter_readings[i].uid) {
          readings = this.power_meter_readings[i].details;
          break
        }
      }
      readings.forEach(reading=>{
        let amount = this.gs.roundMoney( (reading.current-reading.previous) * reading.multiplier * this.batch_bill.rate );

        this.batch_bill.details.push({
          nmbr:       prefix+'-'+ctr,
          date:       this.batch_bill.date,
          unit_uid:   reading.unit_uid,
          unit_nmbr:  reading.unit_nmbr,
          lessee_uid: reading.lessee_uid,
          remarks:    '('+reading.current+' - '+reading.previous+') x '+reading.multiplier+' x '+this.batch_bill.rate+' = ' + this.gs.formatMoney(amount),
          amount:     amount
        });
        ctr++;
      });

    }

  }  


  save(){
      // new record
      this.gs.http.post(this.gs.api_url+'Bills/Batches', JSON.stringify(this.batch_bill), {headers: this.gs.http_header})
        .subscribe(
          success=>{console.log(success);},  
          error=>{console.log(error);}
        );
    this.navCtrl.pop();
  }

}
