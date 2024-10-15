import { Component } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { SQLiteService } from './services/sqlite/sqlite.service';
import { UserService } from './services/User/user.service'; // Servicio para sincronizar usuarios
import { MesaAPIService } from './services/MesaAPI/mesa-api.service'; // Servicio para sincronizar productos
import { QrService } from './services/qr-generator/qr.service'; // Servicio para sincronizar meseros

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private sqliteService: SQLiteService,
    private loadingCtrl: LoadingController,
    private userService: UserService,       // Inyectar el servicio de usuarios
    private mesaAPIService: MesaAPIService, // Inyectar el servicio de productos
    private qrService: QrService            // Inyectar el servicio de meseros
  ) {
    this.initializeApp();
    this.listenForOnline(); // Escuchar cambios en la conectividad
  }

  async initializeApp() {
    // Esperar a que la plataforma esté lista
    await this.platform.ready();
    
    // Mostrar un indicador de carga mientras se inicializa la base de datos y se sincronizan los datos
    const loading = await this.loadingCtrl.create({
      message: 'Inicializando base de datos y sincronizando datos...'
    });
    await loading.present();

    try {
      // Inicializa la base de datos con un nombre y clave de cifrado
      await this.sqliteService.initializeDB('my_database', 'mi_clave_secreta');
      console.log('Base de datos inicializada');

      // Cargar datos desde SQLite
      await this.loadDataFromSQLite();
      
      // Intentar sincronizar los datos con la API si hay conexión
      if (navigator.onLine) {
        await this.syncDataWithAPI();
        console.log('Datos sincronizados con las APIs');
      } else {
        console.log('Sin conexión, los datos se cargaron desde SQLite.');
      }
      
    } catch (error) {
      console.error('Error al inicializar la base de datos o sincronizar datos:', error);
    } finally {
      // Cerrar el indicador de carga
      await loading.dismiss();
    }
  }

  // Cargar datos desde SQLite si no hay conexión a la API
  async loadDataFromSQLite() {
    try {
      // Cargar usuarios, productos y meseros desde SQLite
      await this.userService.loadUsersFromSQLite();
      await this.mesaAPIService.cargarProductos(); // Cargar productos
      await this.qrService.cargarMeseros(); // Cargar meseros
      console.log('Datos cargados desde SQLite');
    } catch (error) {
      console.error('Error al cargar los datos desde SQLite:', error);
    }
  }

// Sincronizar datos con la API si hay conexión
async syncDataWithAPI() {
  try {
    // Sincronizar usuarios con la API
    const usuarios = await this.userService.getUsersFromSQLite();
    for (const user of usuarios) {
      await this.userService.syncUserWithAPI(user);
    }

    // Sincronizar productos con la API bidireccionalmente
    await this.mesaAPIService.syncWithAPI();  // <-- Corregido para usar `syncWithAPI`

    // Sincronizar meseros con la API
    await this.qrService.syncMeserosConAPI();

    console.log('Sincronización completada.');
  } catch (error) {
    console.error('Error al sincronizar los datos con las APIs:', error);
  }
}


  // Escuchar cambios en la conectividad para reintentar la sincronización
  listenForOnline() {
    window.addEventListener('online', async () => {
      console.log('Conexión a Internet detectada. Intentando sincronizar...');
      await this.retrySync(); // Reintentar sincronización al recuperar conexión
    });
  }

  // Método para reintentar sincronización al detectar conexión
  async retrySync() {
    if (navigator.onLine) {
      console.log('Conexión disponible, reintentando sincronización...');
      await this.syncDataWithAPI(); // Llamar al método que sincroniza los datos
    } else {
      console.warn('Sin conexión. Reintento de sincronización fallido.');
    }
  }
}
