import { Component } from '@angular/core';
import { IonicPage, NavController} from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';
import { PrintProvider } from '../../providers/print/print';



@IonicPage()
@Component({
  selector: 'page-bill-summary',
  templateUrl: 'bill-summary.html',
})
export class BillSummaryPage {

  date_from;
  date_to;
  user_uid: number = 0;
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
    console.log('ionViewDidLoad BillSummaryPage');
  }


  generate(){
    let load = this.gs.loadCtrl.create({content:'Generating...'});
    load.present();

    let user = this.gs.get_user(this.user_uid);
    if (null==user) user = {code:''};

    this.gs.http.get(this.gs.api_url+'Bills/summary/?user_code='+user.code+
                                                   '&lessee_uid='+this.lessee_uid+
                                                   '&date_from='+this.date_from+
                                                   '&date_to='+this.date_to, {headers: this.gs.http_header})
    .subscribe(
      resp=>{
        load.dismiss();
        if ('OK'==resp['status']) {
          this.output += this.format(resp['data']);
          this.has_output = true;
        }
      },
      error=>{this.gs.presentHttpError(error);}
    );

  }


  format(data){    
    let user = this.gs.get_user(this.user_uid);
    if (null==user) user = {name:'All users'};

    let content = 'BILL SUMMARY' + '\n';
    content += this.gs.dateTimeNow() + '\n';
    content += user.name + '\n';
    content += this.date_from+' to '+this.date_to + '\n';
    content += '\n';
    let total = 0;

    data.forEach(d=>{
        let amount = parseFloat(d.amount);
        let lessee = this.gs.get_lessee(d.lessee_uid);
        content += d.nmbr + ' ' +d.date + '\n';
        content += lessee.name + '\n';
        if (''!=d.remarks) content += d.remarks +'\n';
        content += 'Amount:'+this.gs.formatMoney(amount) +'\n\n';
        total += amount;
      });

    content += '\nTotal:'+this.gs.formatMoney(total);
    content += '\n\n\n-\n\n\n';

    return content;
  }


  print(){
    // TODO: print to BT printer
    this.btPrinter.print(this.output);
  }


}
