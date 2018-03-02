import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserPermissionsPage } from './user-permissions';

@NgModule({
  declarations: [
    UserPermissionsPage,
  ],
  imports: [
    IonicPageModule.forChild(UserPermissionsPage),
  ],
})
export class UserPermissionsPageModule {}
