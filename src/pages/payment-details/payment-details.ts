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

    if(undefined==this.payment) {
      this.new_record = true;
      this.payment = {uid:0, nmbr:'', date:this.gs.dateToday(), lessee_uid:0, unit_uid:0, amount:0, remarks:'', applications:[]}
    }

    this.get_applied_payments();

  }

  open_payment_application(){
    // for new payment, lessee_uid is zero, we need to set this to the lessee of selected unit, otherwise there will be no unpaid bills
    if (0==this.payment.lessee_uid) {
      this.payment.lessee_uid = this.gs.get_unit_lessee_uid(this.units,this.payment.unit_uid);
    }
    let modal = this.gs.modalCtrl.create('PaymentApplicationPage', { payment: this.payment });
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
      // check permission
      if (!this.gs.user_has_permission('PaymentsPage', 'add', true)) return;

      // new record
      this.gs.http.post(this.gs.api_url+'Payments', JSON.stringify(this.payment), {headers: this.gs.http_header})
        .subscribe(
          success=>{console.log(success);},  
          error=>{console.log(error);}
        );
    } else {
      // check permission
      if (!this.gs.user_has_permission('PaymentsPage', 'edit', true)) return;

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
    // check permission
    if (!this.gs.user_has_permission('PaymentsPage', 'delete', true)) return;

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
