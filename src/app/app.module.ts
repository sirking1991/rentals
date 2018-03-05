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
import { HomePage } from '../pages/home/home';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';

import { Pro } from '@ionic/pro';
import { Injectable, Injector } from '@angular/core';

Pro.init('6d573601', {
  appVersion: '0.0.1'
})

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  ionicErrorHandler: IonicErrorHandler;

  constructor(injector: Injector) {
    try {
      this.ionicErrorHandler = injector.get(IonicErrorHandler);
    } catch(e) {
      // Unable to get the IonicErrorHandler provider, ensure
      // IonicErrorHandler has been added to the providers list below
    }
  }

  handleError(err: any): void {
    Pro.monitoring.handleNewError(err);
    // Remove this if you want to disable Ionic's auto exception handling
    // in development mode.
    this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
  }
}

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    GeneralProvider,
    BluetoothSerial,
    Device,
    PrintProvider,
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor,multi: true},
    IonicErrorHandler,[{ provide: ErrorHandler, useClass: MyErrorHandler }]
  ]
})
export class AppModule {}
