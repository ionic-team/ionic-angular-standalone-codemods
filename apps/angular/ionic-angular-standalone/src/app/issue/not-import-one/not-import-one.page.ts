import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-not-import-one',
  templateUrl: './not-import-one.page.html',
  styleUrls: ['./not-import-one.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class NotImportOnePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
