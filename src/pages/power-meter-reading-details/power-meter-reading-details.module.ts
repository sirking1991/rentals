import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PowerMeterReadingDetailsPage } from './power-meter-reading-details';

@NgModule({
  declarations: [
    PowerMeterReadingDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(PowerMeterReadingDetailsPage),
  ],
})
export class PowerMeterReadingDetailsPageModule {}
