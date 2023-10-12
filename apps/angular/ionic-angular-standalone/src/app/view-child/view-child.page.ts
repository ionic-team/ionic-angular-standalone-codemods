import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-view-child',
  templateUrl: './view-child.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ViewChildPage implements OnInit {
  @ViewChild(IonContent)
  content!: IonContent;

  constructor() { }

  ngOnInit() { }
}
