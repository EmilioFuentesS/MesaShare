import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MeserosPage } from './meseros.page';

const routes: Routes = [
  {
    path: '',
    component: MeserosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeserosPageRoutingModule {}
