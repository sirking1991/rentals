import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';
import {PrintProvider} from '../../providers/print/print';
import {PrinterListModalPage} from '../printer-list-modal/printer-list-modal';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  constructor(public navCtrl: NavController,
              private gs: GeneralProvider,
              private printProvider: PrintProvider) {
  }


  ionViewDidLoad() {    
    console.log('ionViewDidLoad HomePage');
  }

  ionView

  logout() {
    this.gs.account_code = '';
    this.gs.token = '';
    this.gs.user = {};
    this.gs.logged_in = false;
    this.navCtrl.setRoot('LoginPage');
  }

  openPage(page) {
    if (!this.gs.user_has_permission(page,'view',true))  return;

    this.navCtrl.push(page);
  }


  selectPrinter(){

    if (!this.gs.user_has_permission("PrinterListPage",'view', true)) return;

    this.printProvider.searchBt().then(datalist=>{
      
      //1. Open printer select modal
      let abc=this.gs.modalCtrl.create(PrinterListModalPage,
                                    {data:datalist},
                                    {enableBackdropDismiss:false});
      
      //2. Printer selected, save into this.selectedPrinter
      abc.onDidDismiss(data=>{
        this.gs.selectedPrinter=data;
        window.localStorage.setItem('selected_printer', JSON.stringify(data));

        if(null==data) return;

        let content = (new Date()).toISOString()+'\n'+
                      'TEST PRINT\n'+
                      this.printProvider.printSeparator;
        this.printProvider.print(content);

        this.gs.alertCtrl.create({          
          title: data.name+" selected",
          buttons:['Dismiss']
        }).present();

      });
      
      //0. Present Modal
      abc.present();

    },err=>{
      // we're not able to print, present an alert to the user
      this.gs.alertCtrl.create({
        title:"ERROR "+err,
        buttons:['Dismiss']
      }).present();
    })
  }

}
