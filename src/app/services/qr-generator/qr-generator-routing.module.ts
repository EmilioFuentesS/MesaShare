import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QrGeneratorPage } from './qr-generator.page';

const routes: Routes = [
  {
    path: '',
    component: QrGeneratorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QrGeneratorPageRoutingModule {}
