import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicModule, isPlatform } from '@ionic/angular';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ mode: 'md', keyboardHeight: 320, inputShims: false }),
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
