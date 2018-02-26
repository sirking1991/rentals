import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';

@IonicPage()
@Component({
  selector: 'page-lessee-details',
  templateUrl: 'lessee-details.html',
})
export class LesseeDetailsPage {

  lessee: any;
  new_record: boolean = false;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }

    this.lessee = this.navParams.get('lessee');
    if(undefined==this.lessee) {
      this.new_record = true;
      this.lessee = {uid:0, first_name:'', last_name:'', phone:'', email:'', address:'', remarks:''}
    }

  }


  save(){
    if(this.new_record) {
      // new record
      this.gs.http.post(this.gs.api_url+'Lessees', JSON.stringify(this.lessee), {headers: this.gs.http_header})
        .subscribe(
          success=>{console.log(success);},  
          error=>{console.log(error);}
        );
    } else {
      // update record
      this.gs.http.put(this.gs.api_url+'Lessees', JSON.stringify(this.lessee), {headers: this.gs.http_header})
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
            this.gs.http.delete(this.gs.api_url+'Lessees'+'/?uid='+this.lessee.uid, {headers: this.gs.http_header})
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
