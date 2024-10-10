import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MenuEditPageRoutingModule } from './menu-edit-routing.module'; // Asegúrate de tener configurado el archivo de rutas.
import { MenuEditPage } from './menu-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,  // Importa ReactiveFormsModule para usar formularios reactivos
    IonicModule,
    MenuEditPageRoutingModule
  ],
  declarations: [MenuEditPage]
})
export class MenuEditPageModule {}
