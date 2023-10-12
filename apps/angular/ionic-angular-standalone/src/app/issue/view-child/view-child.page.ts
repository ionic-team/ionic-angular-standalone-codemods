import {Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonContent, IonicModule} from '@ionic/angular';

@Component({
  selector: 'app-view-child',
  templateUrl: './view-child.page.html',
  styleUrls: ['./view-child.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ViewChildPage implements OnInit {
  /**
   * Referencing the template's ion-content results in a double call.
   */
  @ViewChild(IonContent)
  content!: IonContent;

  constructor() { }

  ngOnInit() {
  }
}
