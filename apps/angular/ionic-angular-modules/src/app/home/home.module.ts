import { NgModule } from "@angular/core";
import { HomeComponent } from "./home.component";
import { IonicModule } from "@ionic/angular";
import { HomeRoutingModule } from "./home-routing.module";

@NgModule({
  imports: [IonicModule, HomeRoutingModule],
  declarations: [HomeComponent],
  exports: [HomeComponent]
})
export class HomeModule { }
