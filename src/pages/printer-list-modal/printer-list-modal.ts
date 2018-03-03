import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';

@IonicPage()
@Component({
  selector: 'page-printer-list-modal',
  templateUrl: 'printer-list-modal.html',
})
export class PrinterListModalPage {
  
  printerList:any=[];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              private viewCtrl:ViewController,
              private gs: GeneralProvider) {
    this.printerList = this.navParams.get('data');
  }

  ionViewDidLoad() {}

  select(data)
  {
    this.viewCtrl.dismiss(data);
  }

}