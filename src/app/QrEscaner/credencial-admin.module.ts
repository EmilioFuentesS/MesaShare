import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CredencialAdminPageRoutingModule } from './credencial-admin-routing.module';

import { CredencialAdminPage } from './credencial-admin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CredencialAdminPageRoutingModule
  ],
  declarations: [CredencialAdminPage]
})
export class CredencialAdminPageModule {}
