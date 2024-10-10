import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MesaAPIService } from '../MesaAPI/mesa-api.service'; // Servicio para API
import { ClProducto } from '../MesaAPI/model/ClProducto'; // Modelo de producto
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; // Importar Cámara

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  productos: ClProducto[] = []; // Lista de productos usando ClProducto
  username: string | null = null;
  capturedImage: string = '';  // Variable para la imagen capturada

  constructor(private router: Router, private mesaAPIService: MesaAPIService) {}

  ngOnInit() {
    // Cargar los productos desde el servicio
    this.cargarProductos();
  }

  cargarProductos() {
    this.mesaAPIService.getMenuItems().subscribe((data: ClProducto[]) => { // Cambiado a ClProducto[]
      this.productos = data; // Asignar los productos a la variable
    }, error => {
      console.error('Error al cargar productos:', error);
    });
  }

  onEliminarProducto(productId: number) {
    // Eliminar directamente sin confirmación
    this.mesaAPIService.deleteMenuItem(productId).subscribe({
      next: () => {
        console.log(`Producto ${productId} eliminado`);
        // Volver a cargar la lista de productos después de eliminar
        this.cargarProductos();
      },
      error: (err) => {
        console.error("Error al eliminar producto", err);
      }
    });
  }

  // Método para capturar una imagen usando la cámara
  async captureImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    this.capturedImage = `data:image/jpeg;base64,${image.base64String}`;
  }
}
