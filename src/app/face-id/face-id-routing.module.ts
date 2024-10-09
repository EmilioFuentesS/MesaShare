import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FaceIDPage } from './face-id.page';

const routes: Routes = [
  {
    path: '',
    component: FaceIDPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaceIDPageRoutingModule {}
