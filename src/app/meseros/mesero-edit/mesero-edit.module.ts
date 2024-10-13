import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeseroEditPageRoutingModule } from './mesero-edit-routing.module';

import { MeseroEditPage } from './mesero-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeseroEditPageRoutingModule
  ],
  declarations: [MeseroEditPage]
})
export class MeseroEditPageModule {}
