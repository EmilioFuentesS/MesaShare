import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ClProducto } from '../model/ClProducto';
import { MesaAPIService } from '../mesa-api.service';

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

    // Ejecuta el método del servicio y se suscribe
    this.restApi.addMenuItem(producto).subscribe({
      next: (res) => {
        console.log("Respuesta de agregar producto", res);
        loading.dismiss(); // Elimina la espera
        if (res == null) {
          console.log("No se agregó el producto, respuesta nula");
          return;
        }
        console.log("Producto agregado exitosamente, navegando a la lista.");
        this.router.navigate(['/product-list']);
      },
      error: (err) => {
        console.log("Error al agregar producto", err);
        loading.dismiss(); // Elimina la espera
      },
    });

    console.log("Observa que todo lo del subscribe sale después de este mensaje");
  }
}
