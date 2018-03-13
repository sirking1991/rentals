import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LedgerPage } from './ledger';

@NgModule({
  declarations: [
    LedgerPage,
  ],
  imports: [
    IonicPageModule.forChild(LedgerPage),
  ],
})
export class LedgerPageModule {}
