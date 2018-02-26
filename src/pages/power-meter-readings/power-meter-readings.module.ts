import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PowerMeterReadingsPage } from './power-meter-readings';

@NgModule({
  declarations: [
    PowerMeterReadingsPage,
  ],
  imports: [
    IonicPageModule.forChild(PowerMeterReadingsPage),
  ],
})
export class PowerMeterReadingsPageModule {}
