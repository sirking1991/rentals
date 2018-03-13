import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentSummaryPage } from './payment-summary';

@NgModule({
  declarations: [
    PaymentSummaryPage,
  ],
  imports: [
    IonicPageModule.forChild(PaymentSummaryPage),
  ],
})
export class PaymentSummaryPageModule {}
