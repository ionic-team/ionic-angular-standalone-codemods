import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-control-syntax',
  templateUrl: './control-syntax.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ControlSyntaxPage {
  isVisible = true;
}
