import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ClMesero } from '../services/GenerarQrAPI/model/ClMesero'; // Importar el modelo de mesero
import { SQLiteService } from '../services/SQLite/sqlite.service';
import { QrService } from '../services/GenerarQrAPI/qr.service'; // Importar el servicio
import { Share } from '@capacitor/share'; // Capacitor Share
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import jsPDF from 'jspdf';
import * as QRCode from 'qrcode'; // Importar la librería qrcode

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

  async ngOnInit() {
    // Inicializar la base de datos
    await this.sqliteService.initializeDB('my_database', 'mi_clave_secreta');
  }

  // Se ejecuta cada vez que la vista es visible
  ionViewWillEnter() {
    this.loadMeseros(); // Recargar la lista de meseros cuando regrese a la vista
  }

  async loadMeseros() {
    const loading = await this.loadingController.create({ message: 'Cargando meseros...' });
    await loading.present();
  
    try {
      // Cargar meseros desde SQLite
      this.meseros = await this.sqliteService.getMeseros();
  
      // Si hay conexión, sincronizar con la API
      if (navigator.onLine) {
        await this.qrService.syncMeserosConAPI(); // Sincronizar los cambios pendientes con la API
        this.meseros = await this.sqliteService.getMeseros(); // Actualizar la lista de meseros después de la sincronización
      }
    } catch (error) {
      console.error('Error al cargar meseros:', error);
      this.showAlert('Error', 'No se pudo cargar la lista de meseros.');
    } finally {
      await loading.dismiss();
    }
  }
  

// Método para eliminar un mesero
async deleteMesero(meseroId: number) {
  const alert = await this.alertController.create({
    header: 'Confirmar eliminación',
    message: '¿Estás seguro que deseas eliminar este mesero?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        handler: async () => {
          const loading = await this.loadingController.create({ message: 'Eliminando mesero...' });
          await loading.present();

          try {
            // Eliminar el mesero primero de SQLite
            await this.sqliteService.deleteMesero(meseroId);
            console.log('Mesero eliminado de SQLite');

            // Sincronizar con la API si hay conexión
            if (navigator.onLine) {
              await this.qrService.deleteMesero(meseroId).toPromise();
              console.log('Mesero eliminado de la API');
            } else {
              // Guardar la operación para sincronizar más tarde
              console.warn('Sin conexión a Internet. La operación de eliminación se sincronizará más tarde.');
              this.qrService.queueDeleteOperation(meseroId); // Añadir a la cola de operaciones pendientes
            }

            // Recargar la lista de meseros después de la eliminación
            await this.loadMeseros(); // Asegúrate de que este método actualice la UI
            this.showAlert('Éxito', 'Mesero eliminado correctamente.');
          } catch (error) {
            console.error('Error al eliminar mesero:', error);
            this.showAlert('Error', 'No se pudo eliminar el mesero.');
          } finally {
            // Asegúrate de que se disuelva el loading en todas las condiciones
            await loading.dismiss();
          }
        },
      },
    ],
  });
  await alert.present();
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

  // Método para generar el código QR
  async generateQRCode(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text); // Genera el QR como una URL de imagen
    } catch (err) {
      console.error('Error generando QR:', err);
      return '';
    }
  }

  // Método para editar un mesero (navegar a una página de edición)
  async editMesero(meseroId: number) {
    this.router.navigate(['/mesero-edit', meseroId]);
  }

  async downloadQRCode(qrCodeDataUrl: string, meseroNombre: string) {
    try {
      // Crear un nuevo documento PDF
      const pdf = new jsPDF();
  
      // Añadir un recuadro y el texto "Credencial de Mesero"
      pdf.setFontSize(18);
      pdf.text('Credencial de Mesero', 10, 20);
  
      // Añadir el nombre del mesero
      pdf.setFontSize(14);
      pdf.text(`Nombre: ${meseroNombre}`, 10, 40);
  
      // Añadir la fecha de creación (actual)
      const fechaActual = new Date().toLocaleDateString();
      pdf.text(`Fecha de creación: ${fechaActual}`, 10, 60);
  
      // Añadir la imagen QR al PDF
      const qrImage = qrCodeDataUrl;
      if (qrImage) {
        pdf.addImage(qrImage, 'PNG', 10, 70, 50, 50); // Posición y tamaño de la imagen en el PDF
      }
  
      // Convertir el PDF a base64 directamente usando jsPDF
      const base64PDF = pdf.output('datauristring').split(',')[1]; // Obtener solo la parte base64
  
      // Guardar el archivo en el sistema de archivos del dispositivo
      const fileName = `Credencial_${meseroNombre}.pdf`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64PDF,
        directory: Directory.Documents, // Guardar en la carpeta de Documentos
      });
  
      console.log('Archivo PDF guardado:', savedFile.uri);
      alert('PDF descargado en la carpeta Documentos');
  
      // Abrir o compartir el archivo (si es necesario)
      await this.openFile(savedFile.uri);
  
    } catch (error) {
      console.error('Error al descargar el QR o generar el PDF:', error);
      alert('Error al guardar el PDF.');
    }
  }
  
  
  // Método para abrir el archivo PDF
  async openFile(fileUri: string) {
    try {
      await Share.share({
        title: 'Compartir Credencial',
        text: 'Aquí tienes la credencial de trabajador con su código QR.',
        url: fileUri, // Compartir la URI del archivo PDF
        dialogTitle: 'Compartir con',
      });
    } catch (error) {
      console.error('Error al abrir el archivo:', error);
    }
  }
  
  // Método para convertir Blob a base64
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  

// Método para compartir la credencial y el código QR
async shareQRCode(qrCodeDataUrl: string, meseroNombre: string) {
  try {
    // Crear un PDF para compartir
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text('Credencial de Mesero', 10, 20);
    pdf.setFontSize(14);
    pdf.text(`Nombre: ${meseroNombre}`, 10, 40);
    const fechaActual = new Date().toLocaleDateString();
    pdf.text(`Fecha de creación: ${fechaActual}`, 10, 60);
    
    const qrImage = qrCodeDataUrl;
    if (qrImage) {
      pdf.addImage(qrImage, 'PNG', 10, 70, 50, 50); // Añadir el QR al PDF
    }

    // Generar el PDF como un Blob
    const pdfOutput = pdf.output('blob');

    // Guardar el archivo PDF
    const fileName = `Credencial_${meseroNombre}.pdf`;
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: await this.blobToBase64(pdfOutput), // Convertir el Blob a base64
      directory: Directory.Documents,
    });

    // Compartir el archivo utilizando Capacitor Share
    await Share.share({
      title: `Credencial de ${meseroNombre}`,
      text: 'Aquí tienes la credencial con el código QR.',
      url: savedFile.uri,
      dialogTitle: 'Compartir Credencial',
    });

  } catch (error) {
    console.error('Error al compartir el QR:', error);
    alert('Error al compartir el archivo.');
  }
}

}

