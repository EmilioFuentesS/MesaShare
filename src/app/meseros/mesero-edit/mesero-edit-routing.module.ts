import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MeseroEditPage } from './mesero-edit.page';

const routes: Routes = [
  {
    path: '',
    component: MeseroEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeseroEditPageRoutingModule {}
