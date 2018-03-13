import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { GeneralProvider } from '../../providers/general/general';


@IonicPage()
@Component({
  selector: 'page-user-permissions',
  templateUrl: 'user-permissions.html',
})
export class UserPermissionsPage {

  permissions: any = [];

  resources = [
    {id:'SoaPage', name:'Statement of account', req_perm:[{id:'view',label:'View'}]},
    {id:'LedgerPage', name:'Account ledger', req_perm:[{id:'view',label:'View'}]},
    {id:'PaymentsPage', name:'Payments', req_perm:[{id:'view',label:'View'},{id:'add',label:'Add'},{id:'edit',label:'Edit'},{id:'delete',label:'Delete'}]},
    {id:'PaymentSummaryPage', name:'Payment Summary', req_perm:[{id:'view',label:'View'}]},
    {id:'BillsPage', name:'Bills', req_perm:[{id:'view',label:'View'},{id:'add',label:'Add'},{id:'edit',label:'Edit'},{id:'delete',label:'Delete'}]},
    {id:'BillSummaryPage', name:'Bill Summary', req_perm:[{id:'view',label:'View'}]},
    {id:'BatchBillsPage', name:'Batch billing', req_perm:[{id:'view',label:'View'},{id:'generate',label:'Generate bills'},]},
    {id:'PowerMeterReadingsPage', name:'Power meter reading', req_perm:[{id:'view',label:'View'},{id:'add',label:'Add'},{id:'edit',label:'Edit'},{id:'delete',label:'Delete'}]},
    {id:'LesseesPage', name:'Lessees', req_perm:[{id:'view',label:'View'},{id:'add',label:'Add'},{id:'edit',label:'Edit'},{id:'delete',label:'Delete'}]},
    {id:'PowerMetersPage', name:'Power meters', req_perm:[{id:'view',label:'View'},{id:'add',label:'Add'},{id:'edit',label:'Edit'},{id:'delete',label:'Delete'}]},
    {id:'UnitsPage', name:'Units', req_perm:[{id:'view',label:'View'},{id:'add',label:'Add'},{id:'edit',label:'Edit'},{id:'delete',label:'Delete'}]},
    {id:'UsersPage', name:'Users', req_perm:[{id:'view',label:'View'},{id:'add',label:'Add'},{id:'edit',label:'Edit'},{id:'delete',label:'Delete'}]},
    {id:'PrinterListPage', name:'Select printer', req_perm:[{id:'view',label:'View'}]},
  ];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public viewCtrl: ViewController,
              private gs: GeneralProvider) {
    this.permissions = JSON.parse(this.navParams.get('permissions'));
  }

  ionViewDidLoad() {}

  user_has_permission(resource_id, perm_id): boolean{
    let has_access: boolean = false;
    for(let i=0; i<this.permissions.length; i++) {
      if (resource_id==this.permissions[i].resource_id) {
        for(let i2=0; i2<this.permissions[i].perm.length; i2++) {
          if (perm_id==this.permissions[i].perm[i2]) {
            has_access = true; 
            break;
          }
        };
      }
    }
    return has_access;
  }

  openPerm(i){
    let inputs = [];
    let resource = this.resources[i];
    resource.req_perm.forEach(perm=>{
      inputs.push({name:perm.id, label:perm.label, type:'checkbox', value:perm.id, checked:this.user_has_permission(resource.id,perm.id)});
    })
    let alert = this.gs.alertCtrl.create({
      title:'Permissions for '+resource.name,
      inputs: inputs,
      buttons: [
        {text: 'Cancel', handler: data => { console.log('Cancel clicked'); } },
        {text: 'Apply', handler: perm => { this.set_permission(resource.id,perm) } 
        }
      ]
    });
    alert.present();    
  }

  set_permission(resource_id, perm) {
    let perm_idx = -1;
    for(let i=0; i<this.permissions.length; i++) {
      if (resource_id==this.permissions[i].resource_id) {perm_idx=i; break;}
    }
    if (-1==perm_idx) {
      this.permissions.push({resource_id:resource_id,perm:perm });
    } else {
      this.permissions[perm_idx].perm = perm;
    }
  }

  close() {
    this.viewCtrl.dismiss(this.permissions);
  }

}
