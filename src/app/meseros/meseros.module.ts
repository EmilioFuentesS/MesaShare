import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeserosPageRoutingModule } from './meseros-routing.module';

import { MeserosPage } from './meseros.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeserosPageRoutingModule
  ],
  declarations: [MeserosPage]
})
export class MeserosPageModule {}
