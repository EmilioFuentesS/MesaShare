import { Component, OnInit, ViewChild } from '@angular/core'; 
import { IonMenu } from '@ionic/angular';
import { Router } from '@angular/router';
import { MesaAPIService } from '../services/ProductosAPI/mesa-api.service'; 
import { AlertController, LoadingController } from '@ionic/angular';
import { ClProducto } from '../services/ProductosAPI/model/ClProducto';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  @ViewChild(IonMenu) menu?: IonMenu;
  productos: ClProducto[] = []; // Lista de productos
  username: string | null = null;

  productoSeleccionado: ClProducto | null = null;  // Para almacenar el producto seleccionado para edición
  nuevoProducto: ClProducto = { id: 0, nombre: '', precio: 0, cantidad: 0, fecha: new Date() }; // Nuevo producto a agregar

  constructor(
    private router: Router, 
    private mesaAPIService: MesaAPIService, 
    private alertController: AlertController, 
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    // Suscribirse al Observable de productos para recibir actualizaciones en tiempo real
    this.mesaAPIService.getProductosObservable().subscribe((productos) => {
      this.productos = productos; // Actualización automática de la lista
    });

    // Cargar los productos cuando se inicia el componente
    this.cargarProductos();
  }

  // Método para cargar los productos desde el servicio (SQLite/API)
  async cargarProductos() {
    const loading = await this.loadingController.create({
      message: 'Cargando productos...',
    });
    await loading.present();

    this.mesaAPIService.cargarProductos(); // Cargar productos desde el servicio

    loading.dismiss(); // Cerrar el loader cuando la carga termine
  }

  // Método para seleccionar un producto para edición
  onEditarProducto(producto: ClProducto) {
    this.productoSeleccionado = { ...producto }; // Clonar el objeto para evitar modificar el original directamente
  }

  // Método para actualizar un producto
  editarProducto() {
    if (this.productoSeleccionado) {
      this.mesaAPIService.updateMenuItem(this.productoSeleccionado.id, this.productoSeleccionado).subscribe({
        next: () => {
          console.log(`Producto ${this.productoSeleccionado?.id} actualizado`);
          this.productoSeleccionado = null; // Limpiar la selección después de la edición
        },
        error: (err) => {
          console.error('Error al actualizar producto', err);
        }
      });
    }
  }

  // Método para eliminar un producto
  async onEliminarProducto(productId: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro que deseas eliminar este producto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando producto...',
            });
            await loading.present();

            this.mesaAPIService.deleteMenuItem(productId).subscribe({
              next: async () => {
                console.log(`Producto ${productId} eliminado`);
                await loading.dismiss();
                this.presentAlert('Éxito', 'Producto eliminado correctamente.');
              },
              error: async (err) => {
                console.error('Error al eliminar producto', err);
                await loading.dismiss();
                this.presentAlert('Error', 'No se pudo eliminar el producto.');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  // Método para agregar un nuevo producto
  async agregarProducto() {
    const loading = await this.loadingController.create({
      message: 'Agregando producto...',
    });
    await loading.present();

    this.mesaAPIService.addMenuItem(this.nuevoProducto).subscribe({
      next: async () => {
        console.log('Producto agregado');
        this.nuevoProducto = { id: 0, nombre: '', precio: 0, cantidad: 0,fecha: new Date() }; // Limpiar el formulario
        await loading.dismiss();
      },
      error: async (err) => {
        console.error('Error al agregar producto', err);
        await loading.dismiss();
      }
    });
  }

  // Mostrar alertas
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
