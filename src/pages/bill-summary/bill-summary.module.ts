import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BillSummaryPage } from './bill-summary';

@NgModule({
  declarations: [
    BillSummaryPage,
  ],
  imports: [
    IonicPageModule.forChild(BillSummaryPage),
  ],
})
export class BillSummaryPageModule {}
