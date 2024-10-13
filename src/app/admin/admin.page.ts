import { Component, OnInit, ViewChild } from '@angular/core';
import { IonMenu } from '@ionic/angular';
import { Router } from '@angular/router';
import { MesaAPIService, ClMenuItem } from '../services/MesaAPI/mesa-api.service'; 
import { SQLiteService } from '../services/sqlite/sqlite.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  @ViewChild(IonMenu) menu?: IonMenu;
  productos: ClMenuItem[] = []; // Lista de productos
  username: string | null = null;

  productoSeleccionado: ClMenuItem | null = null;  // Para almacenar el producto seleccionado para edición

  constructor(private router: Router, private mesaAPIService: MesaAPIService, private sqliteService: SQLiteService) {}

  ngOnInit() {
    // Suscribirse al Observable de productos para recibir actualizaciones en tiempo real
    this.mesaAPIService.getProductosObservable().subscribe((productos) => {
    this.productos = productos;
    });

    // Cargar productos inicialmente
    this.cargarProductos();
  }

  cargarProductos() {
    // Cargar los productos desde el servicio
    this.mesaAPIService.getMenuItems().subscribe();
  }

  // Método para seleccionar un producto para edición
  onEditarProducto(producto: ClMenuItem) {
    this.productoSeleccionado = { ...producto }; // Clonar el objeto para evitar modificar el original directamente
  }

  // Método para actualizar un producto
  editarProducto() {
    if (this.productoSeleccionado) {
      this.mesaAPIService.updateMenuItem(this.productoSeleccionado.id, this.productoSeleccionado).subscribe({
        next: () => {
          console.log(`Producto ${this.productoSeleccionado?.id} actualizado`);
          // Refrescar la lista de productos después de actualizar
          this.cargarProductos();
          // Limpiar la selección después de la edición
          this.productoSeleccionado = null;
        },
        error: (err) => {
          console.error('Error al actualizar producto', err);
        }
      });
    }
  }

  onEliminarProducto(productId: number) {
    this.mesaAPIService.deleteMenuItem(productId).subscribe({
      next: () => {
        console.log(`Producto ${productId} eliminado`);
        // Los productos se actualizan automáticamente a través del Subject
      },
      error: (err) => {
        console.error('Error al eliminar producto', err);
      }
    });
  }
}
