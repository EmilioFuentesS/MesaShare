import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Router } from '@angular/router';

@Component({
  selector: 'app-face-id',
  templateUrl: './face-id.page.html',
  styleUrls: ['./face-id.page.scss'],
})
export class FaceID implements OnInit {

  capturedImage: string = '';

  constructor(private router: Router) {}

  ngOnInit() {}

 // Nueva función para capturar la imagen y luego comparar
 async captureAndCompare() {
  await this.captureImage();
  if (this.capturedImage) {
    this.compareImage(this.capturedImage);
  }
}

// Capturar imagen desde la cámara
async captureImage() {
  const image = await Camera.getPhoto({
    resultType: CameraResultType.DataUrl,  // Usamos DataUrl para comparación directa
    source: CameraSource.Camera,
    quality: 100
  });

  if (image.dataUrl) {
    this.capturedImage = image.dataUrl;  // Guardamos la imagen capturada si está disponible
  } else {
    console.error("Error al capturar la imagen: dataUrl es undefined");
  }
}

// Comparar imagen capturada con la de los administradores
async compareImage(capturedImage: string) {
  // Cargar múltiples imágenes del administrador 1 y 2
  const admin1Images = [
    '/assets/imgs/admins/admin1.png',
    '/assets/imgs/admins/admin1_1.jpg',
    '/assets/imgs/admins/admin1_2.jpg',
    '/assets/imgs/admins/admin1_3.jpg'
  ];

  const admin2Images = [
    '/assets/imgs/admins/admin2.png',
    '/assets/imgs/admins/admin2_1.jpg',
    '/assets/imgs/admins/admin2_2.jpg'
  ];

  const capturedCanvas = await this.preprocessImage(capturedImage);

  // Comparar con las imágenes del Admin 1
  for (let adminImage of admin1Images) {
    const adminCanvas = await this.preprocessImage(adminImage);
    if (this.compareCanvasPixels(adminCanvas, capturedCanvas)) {
      this.openModal('Coincidencia con Administrador Bryan Chávez');
      this.router.navigate(['/admin']);  // Redirigir a la página de Admin 1
      return;
    }
  }

  // Comparar con las imágenes del Admin 2
  for (let adminImage of admin2Images) {
    const adminCanvas = await this.preprocessImage(adminImage);
    if (this.compareCanvasPixels(adminCanvas, capturedCanvas)) {
      this.openModal('Coincidencia con Administrador Emilio Fuentes');
      this.router.navigate(['/admin']);  // Redirigir a la página de Admin 2
      return;
    }
  }

  this.openModal('No se reconoció el rostro');
}

// Preprocesar la imagen para convertirla a un formato estándar (escala de grises, mismo tamaño)
async preprocessImage(imageUrl: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 300;  // Establecemos un tamaño estándar para todas las imágenes
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // Convertimos a escala de grises para evitar problemas con la iluminación
      ctx?.drawImage(img, 0, 0, size, size);
      const imageData = ctx?.getImageData(0, 0, size, size);
      const data = imageData?.data;

      for (let i = 0; i < data!.length; i += 4) {
        const avg = (data![i] + data![i + 1] + data![i + 2]) / 3;
        data![i] = avg;  // Red
        data![i + 1] = avg;  // Green
        data![i + 2] = avg;  // Blue
      }

      ctx?.putImageData(imageData!, 0, 0);
      resolve(canvas);
    };

    img.onerror = reject;
  });
}

// Comparar píxeles entre dos canvas con mejor precisión
compareCanvasPixels(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement): boolean {
  const ctx1 = canvas1.getContext('2d');
  const ctx2 = canvas2.getContext('2d');

  const data1 = ctx1?.getImageData(0, 0, canvas1.width, canvas1.height).data;
  const data2 = ctx2?.getImageData(0, 0, canvas2.width, canvas2.height).data;

  if (!data1 || !data2 || data1.length !== data2.length) {
    return false;
  }

  let difference = 0;
  for (let i = 0; i < data1.length; i++) {
    difference += Math.abs(data1[i] - data2[i]);
  }

  const threshold = 40000;  // Ajustamos el umbral para una comparación más precisa
  return difference < threshold;
}

// Función para abrir el modal con el mensaje correspondiente
openModal(message: string) {
  alert(message);  // Aquí puedes reemplazar con tu lógica de modal real si lo deseas
}
}