import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuEditPageRoutingModule } from './menu-edit-routing.module';

import { MenuEditPage } from './menu-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuEditPageRoutingModule
  ],
  declarations: [MenuEditPage]
})
export class MenuEditPageModule {}
