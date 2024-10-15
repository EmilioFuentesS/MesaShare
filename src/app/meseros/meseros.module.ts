import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MeserosPageRoutingModule } from './meseros-routing.module';

import { MeserosPage } from './meseros.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,  // Importa ReactiveFormsModule para usar formularios reactivos
    IonicModule,
    MeserosPageRoutingModule
  ],
  declarations: [MeserosPage]
})
export class MeserosPageModule {}
