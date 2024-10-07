import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuDeletePage } from './menu-delete.page';

const routes: Routes = [
  {
    path: '',
    component: MenuDeletePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuDeletePageRoutingModule {}
