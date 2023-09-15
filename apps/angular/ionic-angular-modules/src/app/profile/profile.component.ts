import { Component } from "@angular/core";

@Component({
  selector: 'app-profile',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item>
          <ion-icon slot="start" name="user"></ion-icon>
          <ion-icon slot="start" name="{{ 'user' }}"></ion-icon>
          <ion-label>Username</ion-label>
          <ion-input></ion-input>
        </ion-item>
        <ion-item>
          <ion-icon slot="start" [name]="'lock'"></ion-icon>
          <ion-icon slot="start" [name]="foo ? 'lock' : 'test'"></ion-icon>
          <ion-label>Password</ion-label>
          <ion-input></ion-input>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  standalone: true
})
export class ProfileComponent { }
