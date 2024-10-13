import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { QrService } from '../services/qr-generator/qr.service'; // Importar el servicio
import { ClMesero } from '../services/qr-generator/model/ClMesero'; // Importar el modelo de mesero
import * as QRCode from 'qrcode'; // Importar la librería qrcode
import { SQLiteService } from '../services/sqlite/sqlite.service';

@Component({
  selector: 'app-meseros',
  templateUrl: './meseros.page.html',
  styleUrls: ['./meseros.page.scss'],
})
export class MeserosPage implements OnInit {
  meseros: ClMesero[] = []; // Lista de meseros

  constructor(
    private qrService: QrService, // Servicio para interactuar con la API y SQLite
    private loadingController: LoadingController, // Controlador para mostrar loaders
    private alertController: AlertController, // Controlador para mostrar alertas
    private router: Router,
    private sqliteService: SQLiteService
  ) {}

  ngOnInit() {
   

    this.loadMeseros(); // Cargar la lista de meseros al iniciar
  }

  // Se ejecuta cada vez que la vista es visible
  ionViewWillEnter() {
    this.loadMeseros(); // Recargar la lista de meseros cuando regrese a la vista
  }

  // Método para cargar la lista de meseros
  async loadMeseros() {
    const loading = await this.loadingController.create({
      message: 'Cargando meseros...',
    });
    await loading.present();

    this.qrService.getMeseros().subscribe(
      async (data: ClMesero[]) => {
        this.meseros = data;

        // Generar los códigos QR para cada mesero
        for (let mesero of this.meseros) {
          mesero.qrCode = await this.generateQRCode(mesero.qrCode);
        }

        loading.dismiss();
      },
      (error) => {
        console.error('Error al cargar meseros:', error);
        loading.dismiss();
        this.showAlert('Error', 'No se pudo cargar la lista de meseros.');
      }
    );
  }

  // Método para generar el código QR
  async generateQRCode(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text);  // Genera el QR como una URL de imagen
    } catch (err) {
      console.error('Error generando QR:', err);
      return '';
    }
  }

  // Método para eliminar un mesero
  async deleteMesero(meseroId: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro que deseas eliminar este mesero?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              await this.qrService.deleteMesero(meseroId).toPromise();
              this.loadMeseros(); // Recargar la lista después de eliminar
              this.showAlert('Éxito', 'Mesero eliminado correctamente.');
            } catch (error) {
              console.error('Error al eliminar mesero:', error);
              this.showAlert('Error', 'No se pudo eliminar el mesero.');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // Método para editar un mesero (navegar a una página de edición)
  async editMesero(meseroId: number) {
    this.router.navigate(['/mesero-edit', meseroId]);
  }

  // Mostrar alerta
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

// Método para descargar el QR
downloadQRCode(qrCodeDataUrl: string, meseroNombre: string) {
  const link = document.createElement('a');
  link.href = qrCodeDataUrl;
  link.download = `QR_${meseroNombre}.png`;
  link.click();
}

}
