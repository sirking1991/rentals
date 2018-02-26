import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UnitDetailsPage } from './unit-details';

@NgModule({
  declarations: [
    UnitDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(UnitDetailsPage),
  ],
})
export class UnitDetailsPageModule {}
