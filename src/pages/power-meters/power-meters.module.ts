import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PowerMetersPage } from './power-meters';

@NgModule({
  declarations: [
    PowerMetersPage,
  ],
  imports: [
    IonicPageModule.forChild(PowerMetersPage),
  ],
})
export class PowerMetersPageModule {}
