import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentApplicationPage } from './payment-application';

@NgModule({
  declarations: [
    PaymentApplicationPage,
  ],
  imports: [
    IonicPageModule.forChild(PaymentApplicationPage),
  ],
})
export class PaymentApplicationPageModule {}
