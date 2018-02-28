import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';


@IonicPage()
@Component({
  selector: 'page-soa',
  templateUrl: 'soa.html',
})
export class SoaPage {

  as_of;
  lessee_uid: number = 0;
  lessees = []
  output: string = '';
  has_output: boolean = false;

  constructor(private navCtrl: NavController, 
              private navParams: NavParams,
              private loadCtrl: LoadingController,
              public gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }

    this.as_of = gs.dateToday();
    // get lessees
    this.gs.http.get(this.gs.api_url+'Lessees', {headers: this.gs.http_header})
    .subscribe(
      resp=>{ if ('OK'==resp['status']) {this.lessees = resp['data'];} },
      error=>{this.gs.presentHttpError(error);}
    );    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SoaPage');
  }


  generate(){
    let req_lessees = [];
    let load = this.loadCtrl.create({content:'Generating...'});
    //load.present();
    if (0==this.lessee_uid) {
        // for all lessee request
        this.lessees.forEach(lessee=>{req_lessees.push(lessee.uid)});
    } else {
      // for single lessee request
      req_lessees.push(this.lessee_uid);
    }

    this.gs.http.get(this.gs.api_url+'Bills/soa/?lessees='+JSON.stringify(req_lessees), {headers: this.gs.http_header})
    .subscribe(
      resp=>{
        //load.dismiss();
        if ('OK'==resp['status']) {
          let content = '';
          resp['data'].forEach(data=>{
            this.output += this.format_soa(data);
          });
          this.has_output = true;
        }
      },
      error=>{this.gs.presentHttpError(error);}
    );

  }


  format_soa(data){    
    let lessee = this.get_lessee_details(data.lessee_uid);
    let content = 'STATEMENT OF ACCOUNT' + '\n';
    content += this.gs.dateTimeNow() + '\n';
    content += lessee.last_name+' '+lessee.first_name + '\n';
    content += '\n';
    let total = 0;
    if (0<data.soa.length) {
      data.soa.forEach(d=>{
        content += d.nmbr + ' ' +d.date + '\n';
        content += d.remarks +'\n';
        content += this.gs.formatMoney(d.amount) +'\n';
        content += '\n';
        total += d.amount;
      });
    } else {
      content += "-=No unpaid bills=-\n";
    }

    content += '\nTotal Due:'+this.gs.formatMoney(total);
    content += '\n\n\n-\n\n\n';

    return content;
  }


  print(){
    // TODO: print to BT printer
  }


  get_lessee_details(uid) {
    let details: any = null;
    for(let i=0; i<this.lessees.length; i++){
      if (uid==this.lessees[i].uid) {
        details = this.lessees[i];
        break;        
      }
    }
    return details;
  }

}
