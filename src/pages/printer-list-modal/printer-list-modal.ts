import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-printer-list-modal',
  templateUrl: 'printer-list-modal.html',
})
export class PrinterListModalPage {
  
  printerList:any=[];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              private viewCtrl:ViewController,) {
    this.printerList = this.navParams.get('data');
  }

  ionViewDidLoad() {}

  select(data)
  {
    window.localStorage.setItem('selected_printer',JSON.stringify(data));
    this.viewCtrl.dismiss(data);
  }

}