import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QrGeneratorPageRoutingModule } from '../../meseros/mesero-addqr/qr-generator-routing.module';

import { QrGeneratorPage } from '../mesero-addqr/qr-generator.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QrGeneratorPageRoutingModule
  ],
  declarations: [QrGeneratorPage]
})
export class QrGeneratorPageModule {}
