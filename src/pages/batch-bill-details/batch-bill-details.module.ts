import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BatchBillDetailsPage } from './batch-bill-details';

@NgModule({
  declarations: [
    BatchBillDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(BatchBillDetailsPage),
  ],
})
export class BatchBillDetailsPageModule {}
