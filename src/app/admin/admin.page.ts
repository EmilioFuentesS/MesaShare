import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MesaAPIService, ClMenuItem } from '../MesaAPI/mesa-api.service'; // Asegúrate de usar la ruta correcta
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; // Importar Cámara

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  productos: ClMenuItem[] = []; // Lista de productos
  username: string | null = null;
  capturedImage: string = '';  // Variable para la imagen capturada

  constructor(private router: Router, private mesaAPIService: MesaAPIService) {}

  ngOnInit() {
    // Cargar los productos desde el servicio
    this.cargarProductos();
  }

  cargarProductos() {
    this.mesaAPIService.getMenuItems().subscribe((data: ClMenuItem[]) => {
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

}