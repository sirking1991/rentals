import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BatchBillsPage } from './batch-bills';

@NgModule({
  declarations: [
    BatchBillsPage,
  ],
  imports: [
    IonicPageModule.forChild(BatchBillsPage),
  ],
})
export class BatchBillsPageModule {}
