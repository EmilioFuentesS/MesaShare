import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { MesaAPIService } from '../mesa-api.service';
import { ClProducto } from '../model/ClProducto';

@Component({
  selector: 'app-menu-edit',
  templateUrl: './menu-edit.page.html',
  styleUrls: ['./menu-edit.page.scss'],
})
export class MenuEditPage implements OnInit {
  menuForm!: FormGroup;
  productId!: string;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private restApi: MesaAPIService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    // Obtener el ID del producto desde la URL
    this.productId = this.route.snapshot.paramMap.get('id')!;

    // Inicializar el formulario de edición
    this.menuForm = this.formBuilder.group({
      prod_name: [null, Validators.required],
      prod_price: [null, Validators.required],
      prod_cantidad: [null, Validators.required],
    });

    // Cargar el producto
    this.loadProduct();
  }

  async loadProduct() {
    const loading = await this.loadingController.create({
      message: 'Cargando producto...',
    });
    await loading.present();

    // Convertir el ID del producto a número antes de usarlo
    const numericProductId = Number(this.productId);

    // Obtener el producto a partir del ID
    this.restApi.getMenuItem(numericProductId).subscribe({
      next: (product: ClProducto) => {
        loading.dismiss();
        // Poner los valores del producto en el formulario
        this.menuForm.patchValue({
          prod_name: product.nombre,
          prod_price: product.precio,
          prod_cantidad: product.cantidad,
        });
      },
      error: (err) => {
        loading.dismiss();
        console.error('Error al cargar producto:', err);
      }
    });
  }

  async onFormSubmit() {
    const loading = await this.loadingController.create({
      message: 'Actualizando producto...',
    });
    await loading.present();

    // Crear un objeto actualizado a partir del formulario
    const updatedProduct: ClProducto = {
      id: Number(this.productId), // Convertir el ID a número
      nombre: this.menuForm.value.prod_name,
      precio: this.menuForm.value.prod_price,
      cantidad: this.menuForm.value.prod_cantidad,
      fecha: new Date() // Fecha actual
    };

    // Llamar al servicio para actualizar el producto
    this.restApi.updateMenuItem(Number(this.productId), updatedProduct).subscribe({
      next: () => {
        loading.dismiss();
        // Redirigir a la lista de productos después de la actualización
        this.router.navigate(['/product-list']);
      },
      error: (err) => {
        loading.dismiss();
        console.error('Error al actualizar producto:', err);
      }
    });
  }
}
