import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ClProducto } from '../model/ClProducto';
import { MesaAPIService } from '../mesa-api.service'; // Servicio para manejar API
import { SQLiteService } from '../../sqlite/sqlite.service'; // Servicio para SQLite

@Component({
  selector: 'app-menu-add',
  templateUrl: './menu-add.page.html',
  styleUrls: ['./menu-add.page.scss'],
})
export class MenuAddPage implements OnInit {
  menuForm!: FormGroup; // Formulario para agregar producto

  constructor(
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private restApi: MesaAPIService, // Servicio para manejar API
    private sqliteService: SQLiteService, // Servicio para SQLite
    private router: Router,
    private alertController: AlertController // Agregando AlertController para mostrar alertas
  ) {}

  ngOnInit() {
    
    
    this.menuForm = this.formBuilder.group({
      prod_name: [null, Validators.required],
      prod_price: [null, Validators.required],
      prod_cantidad: [null, Validators.required],
    });
  }

  async onFormSubmit(formValue: any) {
    console.log("Valores del formulario:", formValue);

    const loading = await this.loadingController.create({
      message: 'Cargando...',
    });
    await loading.present();

    // Crear un nuevo objeto producto con el formulario
    const producto: ClProducto = new ClProducto({
      nombre: formValue.prod_name,
      precio: formValue.prod_price,
      cantidad: formValue.prod_cantidad,
      fecha: new Date()
    });

    // Paso 1: Enviar primero los datos a la API (JSON-server)
    this.restApi.addMenuItem(producto).subscribe({
      next: async (res) => {
        console.log("Producto agregado a la API:", res);

        // Paso 2: Después de agregar el producto a la API, agregarlo a la base de datos SQLite
        try {
          await this.sqliteService.addProducto(
            res.nombre, // Nombre del producto desde la respuesta de la API
            res.precio, // Precio del producto
            res.cantidad // Cantidad del producto
          );
          console.log("Producto agregado a SQLite");

          // Eliminar la espera y navegar a la lista de productos
          loading.dismiss();
          this.router.navigate(['/admin']);

          // Mostrar alerta de éxito
          this.showAlert('Éxito', 'Producto agregado correctamente a la API y a la base de datos.');
        } catch (error) {
          console.error("Error al agregar el producto a SQLite:", error);
          loading.dismiss();
          this.showAlert('Error', 'No se pudo agregar el producto a la base de datos.');
        }
      },
      error: (err) => {
        console.log("Error al agregar el producto a la API:", err);
        loading.dismiss();
        this.showAlert('Error', 'No se pudo agregar el producto a la API.');
      },
    });
  }

  // Método para mostrar alertas
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
