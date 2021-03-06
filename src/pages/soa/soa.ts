import { Component } from '@angular/core';
import { IonicPage, NavController} from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';
import { PrintProvider } from '../../providers/print/print';



@IonicPage()
@Component({
  selector: 'page-soa',
  templateUrl: 'soa.html',
})
export class SoaPage {

  as_of;
  lessee_uid: number = 0;
  output: string = '';
  balance_filter: string = 'ALL';
  has_output: boolean = false;

  constructor(private navCtrl: NavController,               
              public gs: GeneralProvider,
              public btPrinter: PrintProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }

    this.as_of = gs.dateToday();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SoaPage');
  }


  generate(){
    let req_lessees = [];
    let load = this.gs.loadCtrl.create({content:'Generating...'});
    load.present();
    if (0==this.lessee_uid) {
        // for all lessee request
        this.gs.lessees.forEach(lessee=>{req_lessees.push(lessee.uid)});
    } else {
      // for single lessee request
      req_lessees.push(this.lessee_uid);
    }

    this.gs.http.get(this.gs.api_url+'Bills/soa/?lessees='+JSON.stringify(req_lessees), {headers: this.gs.http_header})
    .subscribe(
      resp=>{
        load.dismiss();
        if ('OK'==resp['status']) {
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
    let lessee = this.gs.get_lessee(data.lessee_uid);
    if (null==lessee) lessee = {name:'LESSEE NOT FOUND:'+this.lessee_uid};
    let content = 'STATEMENT OF ACCOUNT' + '\n';
    content += this.gs.dateTimeNow() + '\n';
    content += lessee.name + '\n';
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

    let ret = content;
    if ('WTIHBAL'==this.balance_filter && 0==total) ret = '';
    if ('WITHNOBAL'==this.balance_filter && 0!=total) ret = '';

    return ret;
  }


  print(){
    // TODO: print to BT printer
    this.btPrinter.print(this.output);
  }



}
