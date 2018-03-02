import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { GeneralProvider } from '../providers/general/general';

import { HttpClientModule } from '@angular/common/http';

import { Device } from '@ionic-native/device';
import { PrintProvider } from '../providers/print/print';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    GeneralProvider,
    BluetoothSerial,
    Device,
    PrintProvider,
  ]
})
export class AppModule {}
