import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuDeletePageRoutingModule } from './menu-delete-routing.module';

import { MenuDeletePage } from './menu-delete.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuDeletePageRoutingModule
  ],
  declarations: [MenuDeletePage]
})
export class MenuDeletePageModule {}
