import { Component } from '@angular/core';
import * as QRCode from 'qrcode';
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

  constructor(private qrService: QrService, private sqliteService: SQLiteService) {} // Inyectar el servicio
  
 

  // Método para generar el QR y almacenarlo en la API y en la base de datos local
  async generateQRCode() {
    if (this.qrCodeText.trim() === '' || this.meseroNombre.trim() === '') {
      alert('Por favor ingresa el nombre del mesero y el texto para generar el código QR.');
      return;
    }

    try {
      // Generar el código QR en base al texto ingresado
      this.qrCodeImage = await QRCode.toDataURL(this.qrCodeText);

      // Crear una nueva instancia de ClMesero con el nombre, texto y QR
      const mesero = new ClMesero({
        nombre: this.meseroNombre,
        qrCode: this.qrCodeImage,
        texto: this.qrCodeText,
      });

      // Guardar el mesero a través del servicio (API y SQLite)
      this.qrService.addMesero(mesero).subscribe(() => {
        alert('Código QR generado y guardado correctamente en la API y en la base de datos.');
      });

    } catch (error) {
      console.error('Error al generar el código QR:', error);
      alert('Ocurrió un error al generar el código QR.');
    }
  }

  // Método para descargar el QR
downloadQRCode() {
  const link = document.createElement('a');
  link.href = this.qrCodeImage;
  link.download = `QR_${this.meseroNombre}.png`;
  link.click();
}
}
