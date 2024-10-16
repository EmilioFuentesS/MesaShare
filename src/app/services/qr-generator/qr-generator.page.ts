import { Component } from '@angular/core';
import * as QRCode from 'qrcode'; 
import jsPDF from 'jspdf';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'; // Importar Capacitor Filesystem
import { Share } from '@capacitor/share'; // Importar Capacitor Share
import { QrService } from './qr.service'; // Importar el servicio QrService
import { ClMesero } from './model/ClMesero'; // Importar el modelo de ClMesero
import { SQLiteService } from '../sqlite/sqlite.service';

@Component({
  selector: 'app-qr-generator',
  templateUrl: './qr-generator.page.html',
  styleUrls: ['./qr-generator.page.scss'],
})
export class QrGeneratorPage {
  meseroNombre: string = ''; // Nombre del mesero
  qrCodeText: string = ''; // Texto ingresado para generar el QR
  qrCodeImage: string = ''; // Imagen del QR generado
  savedFileUri: string = ''; // Guardar la URI del archivo PDF generado

  constructor(private qrService: QrService, private sqliteService: SQLiteService) {}

  async generateQRCode() {
    if (this.qrCodeText.trim() === '' || this.meseroNombre.trim() === '') {
      alert('Por favor ingresa el nombre del mesero y el texto para generar el código QR.');
      return;
    }
  
    try {
      console.log('Generando código QR con el texto:', this.qrCodeText);
  
      // Generar el código QR
      this.qrCodeImage = await QRCode.toDataURL(this.qrCodeText);
  
      // Crear una instancia de ClMesero
      const mesero = new ClMesero({
        nombre: this.meseroNombre,
        qrCode: this.qrCodeImage,
        texto: this.qrCodeText,
      });
  
      // Guardar en SQLite primero
      await this.sqliteService.addMesero(mesero.nombre, mesero.qrCode, mesero.texto);
      console.log('Mesero guardado en SQLite con el texto:', mesero.texto);
  
      // Intentar sincronizar con la API si hay conexión
      if (navigator.onLine) {
        this.qrService.addMesero(mesero).subscribe(() => {
          alert('Mesero sincronizado con la API.');
        });
      } else {
        alert('Mesero guardado en SQLite. Se sincronizará con la API cuando haya conexión.');
      }
    } catch (error) {
      console.error('Error al generar el código QR:', error);
      alert('Ocurrió un error al generar el código QR.');
    }
  }
  

  async downloadQRCode(qrCodeDataUrl: string, meseroNombre: string) {
    try {
      // Crear un nuevo documento PDF
      const pdf = new jsPDF();
  
      // Añadir un recuadro y el texto "Credencial de Administrador"
      pdf.setFontSize(18);
      pdf.text('CREDENCIAL DE ADMINISTRADOR', 10, 20);
  
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
  
      // Generar el PDF como un Blob
      const pdfBlob = pdf.output('blob');
  
      // Guardar el archivo en el sistema de archivos del dispositivo
      const fileName = `Credencial_${meseroNombre}.pdf`;
      
      // Usar Filesystem para guardar el archivo
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: await this.blobToBase64(pdfBlob), // Convertir el Blob a base64
        directory: Directory.Documents,
      });
  
      console.log('Archivo PDF guardado:', savedFile.uri);
      alert('PDF descargado en la carpeta Documentos');
  
      // Abrir el PDF automáticamente
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
}
  