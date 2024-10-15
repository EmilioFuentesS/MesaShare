import { Component, OnInit } from '@angular/core';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { QrService } from '../services/qr-generator/qr.service'; // Importar el servicio
import { ClMesero } from '../services/qr-generator/model/ClMesero'; // Importar la clase Mesero
import { SQLiteService } from '../services/sqlite/sqlite.service'; // Servicio SQLite

@Component({
  selector: 'app-credencial-admin',
  templateUrl: './credencial-admin.page.html',
  styleUrls: ['./credencial-admin.page.scss'],
})
export class CredencialAdminPage implements OnInit {

  constructor(
    private router: Router, 
    private alertController: AlertController,
    private qrService: QrService, // Servicio para API
    private sqliteService: SQLiteService // Servicio SQLite
  ) {}

  async ngOnInit() {
    // Inicializar la base de datos SQLite
    await this.sqliteService.initializeDB('my_database', 'mi_clave_secreta');
  }
  
  // Método para verificar permisos de la cámara
  async checkPermission(): Promise<boolean> {
    const status = await BarcodeScanner.checkPermission({ force: true });
    if (status.granted) {
      return true;
    } else if (status.denied) {
      const alert = await this.alertController.create({
        header: 'No permission',
        message: 'Please allow camera access in your settings',
        buttons: [
          {
            text: 'No',
            role: 'cancel'
          },
          {
            text: 'Open Settings',
            handler: () => {
              BarcodeScanner.openAppSettings();
            }
          }
        ]
      });
      await alert.present();
      return false;
    }
    return false;
  }

  // Método para iniciar el escaneo
  async startScanner() {
    const allowed = await this.checkPermission();
    if (allowed) {
      try {
        // Preparar el escaneo
        this.prepareScan();

        // Ocultar el fondo de la WebView para que el usuario vea la cámara
        const body = document.querySelector('body');
        if (body) {
          body.classList.add('scanner-active');
        }
        BarcodeScanner.hideBackground();

        // Iniciar el escaneo con el formato QR
        const result = await BarcodeScanner.startScan({
          targetedFormats: [SupportedFormat.QR_CODE]
        });

        if (result.hasContent) {
          console.log('Contenido escaneado:', result.content);

          // Comprobar si es uno de los códigos predefinidos
          this.handlePredefinedCodes(result.content);

        } else {
          this.showErrorMessage('No se detectó contenido en el QR.');
        }

        // Restaurar el fondo de la WebView y detener el escaneo
        if (body) {
          body.classList.remove('scanner-active');
        }
        await BarcodeScanner.showBackground();
        await BarcodeScanner.stopScan();

      } catch (error) {
        console.error('Error durante el escaneo: ', error);
        this.showErrorMessage('Ocurrió un error durante el escaneo.');
      }
    } else {
      this.showErrorMessage('Permiso de cámara denegado.');
    }
  }

  // Maneja los códigos predefinidos
  async handlePredefinedCodes(content: string) {
    switch (content) {
      case 'admin1-code':
        // Redirigir a /admin y mostrar mensaje personalizado para Bryan Chávez
        this.router.navigate(['/admin']);
        this.showWelcomeMessage('Bienvenido Administrador Bryan Chávez');
        break;

      case 'admin2-code':
        // Redirigir a /admin y mostrar mensaje personalizado para Emilio Fuentes
        this.router.navigate(['/admin']);
        this.showWelcomeMessage('Bienvenido Administrador Emilio Fuentes');
        break;

      case 'empleado':
        // Redirigir a /admin y mostrar mensaje para Mesero
        this.router.navigate(['/admin']);
        this.showWelcomeMessage('Bienvenido Mesero');
        break;

      default:
        // Validar primero en SQLite y luego en la API si no es uno de los predefinidos
        this.validateLocalMesero(content);
        break;
    }
  }

  // Validar mesero en la base de datos SQLite primero
  async validateLocalMesero(textoQR: string) {
    try {
      const mesero = await this.sqliteService.getMeseroByTexto(textoQR);
      if (mesero) {
        // Mesero encontrado en SQLite, se redirige a la página de admin
        this.router.navigate(['/admin']);
        this.showWelcomeMessage(`Bienvenido Mesero: ${mesero.nombre}`);
      } else {
        // Si no está en SQLite, se busca en la API
        this.validateMeseroInAPI(textoQR);
      }
    } catch (error) {
      console.error('Error al validar el mesero en SQLite:', error);
      this.showErrorMessage('Ocurrió un error durante la validación en la base de datos.');
    }
  }

  // Validar mesero en la API si no se encuentra en SQLite
async validateMeseroInAPI(textoQR: string) {
  this.qrService.getMeseroByTexto(textoQR).subscribe(
    async (mesero: ClMesero | undefined) => {
      if (mesero) {
        // Si el mesero se encuentra en la API, se inserta en SQLite
        await this.sqliteService.addMesero(mesero.nombre, mesero.qrCode, mesero.texto);
        this.router.navigate(['/admin']);
        this.showWelcomeMessage(`Bienvenido Mesero: ${mesero.nombre}`);
      } else {
        this.showErrorMessage('El código QR no es válido.');
      }
    },
    (error) => {
      console.error('Error al obtener el mesero desde la API:', error);
      this.showErrorMessage('Ocurrió un error durante la validación del QR.');
    }
  );
}

  // Método para preparar el escaneo
  prepareScan() {
    BarcodeScanner.prepare();
  }

  // Mostrar mensaje de bienvenida
  async showWelcomeMessage(message: string) {
    const alert = await this.alertController.create({
      header: 'Acceso concedido',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Mostrar mensaje de error
  async showErrorMessage(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}