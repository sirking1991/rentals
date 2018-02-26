import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PowerMeterDetailsPage } from './power-meter-details';

@NgModule({
  declarations: [
    PowerMeterDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(PowerMeterDetailsPage),
  ],
})
export class PowerMeterDetailsPageModule {}
