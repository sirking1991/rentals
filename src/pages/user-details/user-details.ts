import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';

@IonicPage()
@Component({
  selector: 'page-user-details',
  templateUrl: 'user-details.html',
})
export class UserDetailsPage {

  user: any;
  new_record: boolean = false;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public gs: GeneralProvider) {
    if(!this.gs.logged_in) {
      this.navCtrl.setRoot('LoginPage');
      return;
    }

    this.user = this.navParams.get('user');
    if(undefined==this.user) {
      this.new_record = true;
      this.user = {uid: 0, code:'', first_name: '', last_name:'',  password:'', permissions:'[]'}
    }

  }


  save(){
    if(this.new_record) {
      // check permission
      if (!this.gs.user_has_permission('UsersPage', 'add', true)) return;      
      // new record
      this.gs.http.post(this.gs.api_url+'Users', JSON.stringify(this.user), {headers: this.gs.http_header})
        .subscribe(
          success=>{
            this.gs.pull_users();
            console.log(success);
          },  
          error=>{console.log(error);}
        );
    } else {
      // check permission
      if (!this.gs.user_has_permission('UsersPage', 'edit', true)) return;
      // update record
      this.gs.http.put(this.gs.api_url+'Users', JSON.stringify(this.user), {headers: this.gs.http_header})
        .subscribe(
          success=>{
            this.gs.pull_users();
            console.log(success);
          },  
          error=>{console.log(error)}
        );
    }
    this.navCtrl.pop();
  }

  delete(){
    // check permission
    if (!this.gs.user_has_permission('UsersPage', 'delete', true)) return;

    this.gs.alertCtrl.create({
      title: 'Confirm record delete',
      buttons: [
        {text: 'Cancel',role: 'cancel'},
        {
          text: 'Delete',
          handler: () => {
            this.gs.http.delete(this.gs.api_url+'Users'+'/?uid='+this.user.uid, {headers: this.gs.http_header})
              .subscribe(
                success=>{
                  this.gs.pull_users();
                  console.log(success);
                },  
                error=>{console.log(error)}
              );
            this.navCtrl.pop();
          }
        }
      ]
    }).present();
  }

  permissions(){
    let modal = this.gs.modalCtrl.create('UserPermissionsPage', { permissions: this.user.permissions });
    modal.onDidDismiss((data)=>{
      this.user.permissions = JSON.stringify(data);
    });
    modal.present();
  }

}
