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
    // Inicializamos el formulario con los campos necesarios
    this.menuForm = this.formBuilder.group({
      prod_name: [null, [Validators.required, Validators.minLength(2)]],
      prod_price: [null, [Validators.required, Validators.min(1)]],
      prod_cantidad: [null, [Validators.required, Validators.min(1)]],
    });
  }

  async onFormSubmit() {
    if (this.menuForm.invalid) {
      // Mostrar mensaje de error si el formulario es inválido
      this.showAlert('Error', 'Por favor, completa todos los campos correctamente.');
      return;
    }

    const formValue = this.menuForm.value;
    console.log("Valores del formulario:", formValue);

    const loading = await this.loadingController.create({
      message: 'Cargando...',
    });
    await loading.present();

    // Crear un nuevo objeto producto con los valores del formulario
    const producto: ClProducto = new ClProducto({
      nombre: formValue.prod_name,
      precio: formValue.prod_price,
      cantidad: formValue.prod_cantidad,
      fecha: new Date() // Ajustar la fecha actual
    });

    try {
      // Verificar si el producto ya existe en SQLite antes de agregar
      const existsInSQLite = await this.sqliteService.productoExists(producto.nombre);

      if (!existsInSQLite) {
        // Agregar producto a SQLite si no existe
        await this.sqliteService.addProducto(producto.nombre, producto.precio, producto.cantidad);
        console.log("Producto agregado a SQLite");

        // Sincronizar con la API si hay conexión
        if (navigator.onLine) {
          this.restApi.addMenuItem(producto).subscribe({
            next: async (res) => {
              console.log("Producto sincronizado con la API:", res);
              await loading.dismiss();
              this.router.navigate(['/admin']);
              this.showAlert('Éxito', 'Producto agregado correctamente.');
            },
            error: async (err) => {
              console.error("Error al sincronizar producto con la API:", err);
              await loading.dismiss();
              this.showAlert('Error', 'Producto guardado en la base de datos, pero no se pudo sincronizar con la API.');
            },
          });
        } else {
          // Si no hay conexión, solo se guarda en SQLite
          console.warn("Sin conexión a Internet. Producto almacenado solo en SQLite.");
          await loading.dismiss();
          this.router.navigate(['/admin']);
          this.showAlert('Éxito', 'Producto guardado en SQLite. Se sincronizará con la API cuando haya conexión.');
        }
      } else {
        // El producto ya existe en SQLite, evitar duplicados
        console.log("Producto ya existe en SQLite.");
        await loading.dismiss();
        this.showAlert('Información', 'Este producto ya está en la base de datos.');
      }
    } catch (error) {
      console.error("Error al agregar el producto a SQLite:", error);
      await loading.dismiss();
      this.showAlert('Error', 'No se pudo agregar el producto a la base de datos.');
    }
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
