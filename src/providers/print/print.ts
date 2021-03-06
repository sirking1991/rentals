import { Injectable } from '@angular/core';
import {AlertController} from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';

@Injectable()
export class PrintProvider {

  maxPrintChar = 32;
  public printSeparator: string = '\n\n\n\n';
  selectedPrinter;


  constructor(private btSerial:BluetoothSerial,
              private alertCtrl:AlertController) {}

  searchBt()
  {
    return this.btSerial.list();
  }

  connectBT(address)
  {
    return this.btSerial.connect(address);

  }

  strAlign(left:string, right:string) {
    
    let ll = left.length;
    let rl = right.length;    
    let str: string = left+right;

    if ( ll+rl > this.maxPrintChar ) str = left + right;
    
    // let remaining = this.maxPrintChar - ll;

    // if (remaining>rl) {
    //   str = left + right.padStart(remaining,' ');
    // } else {
    //   str = left + right;
    // }

    return str;
  }

  print(printData)
  {
    this.selectedPrinter = JSON.parse(window.localStorage.getItem('selected_printer'))
    
    if(null!=this.selectedPrinter) {
      let xyz=this.connectBT(this.selectedPrinter.id).subscribe(data=>{
        this.btSerial.write(printData).then(dataz=>{
          xyz.unsubscribe();
        },errx=>{
          this.alertCtrl.create({
            title:"PRINTER ERROR "+errx,
            buttons:['Dismiss']
          }).present();
        });
        },err=>{
          this.alertCtrl.create({
            title:"PRINTER ERROR "+err,
            buttons:['Dismiss']
          }).present();
        });
      } else {
        // printer is not available. lets just do console.log
        console.log(printData);
      }

  }

}