import { Component } from '@angular/core';
import { IonicPage, NavController} from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';
import { PrintProvider } from '../../providers/print/print';



@IonicPage()
@Component({
  selector: 'page-ledger',
  templateUrl: 'ledger.html',
})
export class LedgerPage {

  date_from;
  date_to;
  lessee_uid: number = 0;
  output: string = '';
  has_output: boolean = false;

  constructor(private navCtrl: NavController,               
              public gs: GeneralProvider,
              public btPrinter: PrintProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }

    let dt = new Date();
    this.date_from  = dt.getFullYear() + '-' + ('0'+(dt.getMonth()+1).toString()).substr(-2,2) + '-01';
    this.date_to    = gs.dateToday();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LedgerPage');
  }


  generate(){
    if (0==this.lessee_uid) {
        this.gs.alertCtrl.create({subTitle:'Please select a lessee',buttons:['OK']} ).present();
        return;
    }

    let load = this.gs.loadCtrl.create({content:'Generating...'});
    load.present();


    this.gs.http.get(this.gs.api_url+'Bills/ledger/?lessee_uid='+this.lessee_uid+
                                                   '&date_from='+this.date_from+
                                                   '&date_to='+this.date_to, {headers: this.gs.http_header})
    .subscribe(
      resp=>{
        load.dismiss();
        if ('OK'==resp['status']) {
          this.output += this.format_ledger(resp['data']);
          this.has_output = true;
        }
      },
      error=>{this.gs.presentHttpError(error);}
    );

  }


  format_ledger(data){    
    let lessee = this.gs.get_lessee(this.lessee_uid);
    if (null==lessee) lessee = {name:'LESSEE NOT FOUND:'+this.lessee_uid};

    let content = 'ACCOUNT LEDGER' + '\n';
    content += this.gs.dateTimeNow() + '\n';
    content += lessee.name + '\n';
    content += this.date_from+' to '+this.date_to + '\n';
    content += '\n';
    let balance = 0;

    data.forEach(d=>{
        let amount = parseFloat(d.amount);

        if(d.type=='PYMNT') {
          balance -= amount;
        } else if(d.type=='BILL') {
          balance += amount;
        } else if(d.type=='FWRDBAL'){
          balance = amount;
        }

        content += '['+d.type+'] '+d.nmbr + ' ' +d.date + '\n';
        content += d.remarks +'\n';
        //content += 'Amount:'+this.gs.formatMoney(amount) +' Balance:'+this.gs.formatMoney(balance) +'\n\n';
        content += this.btPrinter.strAlign('Amt:'+this.gs.formatMoney(amount), 'RunBal:'+this.gs.formatMoney(balance)) + '\n\n';
      });

    content += '\nEnding balance:'+this.gs.formatMoney(balance);
    content += '\n\n\n-\n\n\n';

    return content;
  }


  print(){
    // TODO: print to BT printer
    this.btPrinter.print(this.output);
  }


}
