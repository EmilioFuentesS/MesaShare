import { Component } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { SQLiteService } from './services/sqlite/sqlite.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private sqliteService: SQLiteService,
    private loadingCtrl: LoadingController
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    // Esperar a que la plataforma esté lista
    await this.platform.ready();
    
    // Mostrar un cargando mientras se inicializa la base de datos
    const loading = await this.loadingCtrl.create({
      message: 'Inicializando base de datos...'
    });
    await loading.present();

    try {
      // Inicializa el servicio SQLite
      await this.sqliteService['init']();
      console.log('Base de datos inicializada');
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
    } finally {
      // Cerrar el indicador de cargando
      await loading.dismiss();
    }
  }
}
