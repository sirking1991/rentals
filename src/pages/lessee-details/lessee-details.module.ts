import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LesseeDetailsPage } from './lessee-details';

@NgModule({
  declarations: [
    LesseeDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(LesseeDetailsPage),
  ],
})
export class LesseeDetailsPageModule {}
