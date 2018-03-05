import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';

@IonicPage()
@Component({
  selector: 'page-payment-application',
  templateUrl: 'payment-application.html',
})
export class PaymentApplicationPage {

  payment;
  applications = [];
  unpaid_bills = [];


  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public viewCtrl: ViewController,
              public gs: GeneralProvider) {
    this.payment      = navParams.get('payment');
    this.applications = this.payment.applications;
    // get unpaid bills
    this.get_unpaid_bills();

  }


  ionViewDidLoad() {
  }


  get_unpaid_bills(){
    let load = this.gs.loadCtrl.create({content:'Loading data...'});
    load.present();
    this.unpaid_bills = [];
    this.gs.http.get(this.gs.api_url+'Bills/unpaid_bills/?lessee_uid='+this.payment.lessee_uid+'&exclude_payment_uid='+this.payment.uid, {headers: this.gs.http_header})
      .subscribe(
        resp=>{
          load.dismiss();
          if ('OK'==resp['status']) {
            resp['data'].forEach(d=>{
              // since the balance from server does not include application for this payment, we need to deduct any application from this payment
              let amount = d.amount - this.get_this_payment_application(d.uid); 
              if(amount>0) {
                this.unpaid_bills.push({uid:d.uid, 
                                        nmbr:d.nmbr, 
                                        date:d.date, 
                                        remarks:d.remarks, 
                                        amount:amount});
                }
            });
          }
        },
        error=>{
          load.dismiss();
          console.log(error);
        }
      );  
  }


  get_this_payment_application(bill_uid): number {
    let amount = 0;
    this.applications.forEach(a=>{
      if(a.uid==bill_uid) amount += a.amount;
    })
    return amount;
  }


  get_unapplied(): number {
    let unapplied = 0;
    this.applications.forEach(a=>{ unapplied += parseFloat(a.amount); });
    return this.payment.amount - unapplied;
  }


  unpaid_click(i){
    let selected_unapplied_bill = this.unpaid_bills[i];
    // calculate how much remaining to apply.
    let unapplied = this.get_unapplied();

    if (0>=unapplied) {
      this.gs.alertCtrl.create({
        title: 'This payment has been fully applied', buttons:['OK']
      }).present();
      return;
    }

    // decide how much to suggest to apply
    let suggested_apply_amount = selected_unapplied_bill.amount>=unapplied ? unapplied : selected_unapplied_bill.amount;

    this.gs.alertCtrl.create({
      title:'Amount to apply',
      inputs: [
        {name:'amount', value:suggested_apply_amount, type:'number'}
      ],
      buttons: [
        {text: 'Cancel', handler: data => { console.log('Cancel clicked'); } },
        {text: 'Apply', handler: data => {
            if(data.amount>selected_unapplied_bill.amount) {
              this.gs.alertCtrl.create({
                message:'Amount is greater than bill balance',
                buttons: ['OK']
              }).present();
              return;
            }
            if(data.amount>0) {
              this.applications.push({uid:selected_unapplied_bill.uid,
                                      nmbr:selected_unapplied_bill.nmbr,
                                      date:selected_unapplied_bill.date,
                                      remarks:selected_unapplied_bill.remarks,
                                      amount:data.amount});              
              selected_unapplied_bill.amount -= data.amount;    // deduction this application from the bill balance
              if(selected_unapplied_bill.amount==0) {
                // remove the bill from unpaid_bills is amount is already zero
                this.unpaid_bills.splice(i,1);
              }
            }
          }
        }
      ]
    }).present();
  }


  application_click(i){
    let application = this.applications[i];
    this.gs.alertCtrl.create({
      title:'Change apply amount',
      inputs: [
        {name:'amount', value:application.amount, type:'number'}
      ],
      buttons: [
        {text: 'Cancel', handler: data => { console.log('Cancel clicked'); } },
        {text: 'Apply', handler: data => {
            if(data.amount>0) {
              application.amount = parseFloat(data.amount);
              this.applications[i] = application;
            } else {              
              this.applications.splice(i,1);
            }
            this.get_unpaid_bills();
          }
        }
      ]
    }).present();
  }


  close(){
    if( 0>this.get_unapplied() ) {
      this.gs.alertCtrl.create({
        title:'The amount applied is more than the payment amount',
        subTitle:'Please adjust the applications',
        buttons: ['OK']
      }).present();
      return;
    }
    this.viewCtrl.dismiss(this.applications);
  }


}
