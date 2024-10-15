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
      console.log('Mesero guardado en SQLite.');

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

  // Método para descargar el PDF con la credencial y el QR
  async downloadQRCode() {
    const pdf = new jsPDF();

    // Añadir un título al PDF
    pdf.setFontSize(18);
    pdf.text('Credencial de Trabajador', 10, 20);

    // Añadir el nombre del mesero
    pdf.setFontSize(14);
    pdf.text(`Nombre: ${this.meseroNombre}`, 10, 40);

    // Añadir la imagen del código QR generado
    const qrImage = this.qrCodeImage;
    if (qrImage) {
      pdf.addImage(qrImage, 'PNG', 10, 60, 50, 50); // Posición y tamaño del QR
    }

    // Generar el PDF como base64
    const pdfOutput = pdf.output('datauristring');

    // Guardar el archivo en el sistema de archivos del dispositivo
    try {
      const fileName = `Credencial_${this.meseroNombre}.pdf`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: pdfOutput.split(',')[1], // Guardar solo la parte base64
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      console.log('Archivo PDF guardado:', savedFile.uri);
      this.savedFileUri = savedFile.uri; // Guardar la URI del archivo para compartir

      alert('PDF descargado en la carpeta Documentos');
    } catch (error) {
      console.error('Error al guardar el archivo:', error);
      alert('Ocurrió un error al guardar el archivo.');
    }
  }

  // Método para compartir la credencial PDF
  async shareQRCode() {
    if (!this.savedFileUri) {
      alert('Por favor, descarga el PDF primero.');
      return;
    }

    try {
      await Share.share({
        title: 'Compartir Credencial',
        text: 'Aquí tienes la credencial de trabajador con su código QR.',
        url: this.savedFileUri, // Compartir la URI del archivo PDF
        dialogTitle: 'Compartir con',
      });
    } catch (error) {
      console.error('Error al compartir el archivo:', error);
      alert('Ocurrió un error al compartir el archivo.');
    }
  }
}
