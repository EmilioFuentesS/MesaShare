import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { QrService } from './services/GenerarQrAPI/qr.service'; // Importar el servicio
import { SQLiteService } from './services/SQLite/sqlite.service';
import { UserService } from './services/UsuariosAPI/user.service'; // Servicio SQLite

// Importar módulos de Angular Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Importar esto para Material
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { IonicStorageModule } from '@ionic/storage-angular';


import { MesaAPIService } from './services/ProductosAPI/mesa-api.service';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms'; // Se agregó para formularios

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule, // Añadir BrowserAnimationsModule para Angular Material
    MatSidenavModule, // Módulo de navegación lateral de Angular Material
    MatListModule, // Módulo de listas de Angular Material
    MatIconModule, // Módulo de íconos de Angular Material
    MatSlideToggleModule,
    MatButtonModule, // Módulo de botones de Angular Material
    IonicStorageModule.forRoot()
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    MesaAPIService,
    QrService,
    SQLiteService,
    UserService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  // Agregar el esquema para permitir el uso de componentes personalizados
})
export class AppModule {}
