import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuAddPageRoutingModule } from './menu-add-routing.module';

import { MenuAddPage } from './menu-add.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    MenuAddPageRoutingModule
  ],
  declarations: [MenuAddPage]
})
export class MenuAddPageModule {}
