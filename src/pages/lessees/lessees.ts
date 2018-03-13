import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';


@IonicPage()
@Component({
  selector: 'page-lessees',
  templateUrl: 'lessees.html',
})
export class LesseesPage {

  lessees = [];

  constructor(public navCtrl: NavController, private gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }
  }

  ionViewWillEnter() {
    this.lessees = this.gs.lessees;
  }


  open(i) {
    this.navCtrl.push("LesseeDetailsPage",{lessee:this.lessees[i]});
  }

  search(ev: any) {
    this.lessees = this.gs.lessees;  // reset

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the lessees
    if (val && val.trim() != '') {
      this.lessees = this.lessees.filter((lessee) => {
        return (lessee.first_name.toLowerCase().indexOf(val.toLowerCase()) > -1) || (lessee.last_name.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

 
}
