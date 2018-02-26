import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LesseesPage } from './lessees';

@NgModule({
  declarations: [
    LesseesPage,
  ],
  imports: [
    IonicPageModule.forChild(LesseesPage),
  ],
})
export class LesseesPageModule {}
