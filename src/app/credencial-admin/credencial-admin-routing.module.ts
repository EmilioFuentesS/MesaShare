import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CredencialAdminPage } from './credencial-admin.page';

const routes: Routes = [
  {
    path: '',
    component: CredencialAdminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CredencialAdminPageRoutingModule {}
