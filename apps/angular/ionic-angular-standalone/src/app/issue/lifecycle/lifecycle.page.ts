import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ViewWillEnter, ViewDidEnter, ViewWillLeave, ViewDidLeave } from '@ionic/angular';

@Component({
  selector: 'app-lifecycle',
  templateUrl: './lifecycle.page.html',
  styleUrls: ['./lifecycle.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
/**
 * Error due to `@ionic/angular/standalone` not containing a lifecycle.
 */
export class LifecyclePage implements OnInit, ViewWillEnter, ViewDidEnter, ViewWillLeave, ViewDidLeave {

  constructor() { }

  ngOnInit() {
  }

  ionViewWillEnter() {
  }

  ionViewDidEnter() {
  }

  ionViewWillLeave() {
  }

  ionViewDidLeave() {
  }
}
