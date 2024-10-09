import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { FaceID } from './face-id.page';  // Cambia a FaceID si no existe FaceIDPage

const routes: Routes = [
  {
    path: '',
    component: FaceID
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FaceID]
})
export class FaceIDPageModule {}
