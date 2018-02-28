import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';

@IonicPage()
@Component({
  selector: 'page-payment-details',
  templateUrl: 'payment-details.html',
})
export class PaymentDetailsPage {

  payment: any;
  new_record: boolean = false;
  units = [];
  lessees = [];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }

    this.units = this.navParams.get('units');
    this.lessees = this.navParams.get('lessees');
    this.payment = this.navParams.get('payment');

    this.get_applied_payments();

    if(undefined==this.payment) {
      this.new_record = true;
      this.payment = {uid:0, nmbr:'', date:this.gs.dateToday(), lessee_uid:0, unit_uid:0, amount:0, remarks:'', applications:[]}
    }

  }

  open_payment_application(){
    let modal = this.gs.modalCtrl.create('PaymentApplicationPage', { payment: this.payment, applications: this.payment.applications });
    modal.onDidDismiss((data)=>{
      this.payment.applications = data;
    });
    modal.present();
  }

  get_applied_payments(){    
    this.payment.applications = [];
    this.gs.http.get(this.gs.api_url+'Payments/payment_application/?uid='+this.payment.uid, {headers: this.gs.http_header})
      .subscribe(
        resp=>{
          if ('OK'==resp['status']) {
            resp['data'].forEach(d=>{
              this.payment.applications.push({uid:d.bill_uid, 
                                      nmbr:d.bill_nmbr, 
                                      date:d.bill_date, 
                                      remarks:d.remarks, 
                                      amount: d.applied_amount});
            });
          }
        },
        error=>{console.log(error);}
      );
  }  


  save(){
    if(this.new_record) {
      // new record
      this.gs.http.post(this.gs.api_url+'Payments', JSON.stringify(this.payment), {headers: this.gs.http_header})
        .subscribe(
          success=>{console.log(success);},  
          error=>{console.log(error);}
        );
    } else {
      // update record
      this.gs.http.put(this.gs.api_url+'Payments', JSON.stringify(this.payment), {headers: this.gs.http_header})
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
            this.gs.http.delete(this.gs.api_url+'Payments'+'/?uid='+this.payment.uid, {headers: this.gs.http_header})
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
