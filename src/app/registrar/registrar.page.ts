import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClUser } from '../services/User/model/ClUser'; // Importar el modelo ClUser
import { UserService } from '../services/User/user.service'; // Servicio de Usuario
import { ToastController } from '@ionic/angular';
import { SQLiteService } from '../services/sqlite/sqlite.service';


@Component({
  selector: 'app-registrar',
  templateUrl: './registrar.page.html',
  styleUrls: ['./registrar.page.scss'],
})
export class RegistrarPage implements OnInit {

  registrarForm: FormGroup; // Inicializa el FormGroup correctamente

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private toastController: ToastController,
    private sqliteService: SQLiteService
  ) {
    // Ahora inicializamos el FormGroup en el constructor o en el ngOnInit
    this.registrarForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  async ngOnInit() {
    // Inicializa la base de datos SQLite
    await this.sqliteService.initializeDB('my_database', 'mi_clave_secreta');
  }

  // Validador personalizado para la contraseña
  passwordValidator(control: any) {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return regex.test(control.value) ? null : { invalidPassword: true };
  }

  // Validador personalizado para confirmar que las contraseñas coinciden
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

 // Método para registrar al usuario
async registrarUsuario() {
  if (this.registrarForm.valid) {
    const formValues = this.registrarForm.value;
    const nuevoUsuario = new ClUser({
      username: formValues.username,
      email: formValues.email,
      password: formValues.password,
    });

    try {
      this.userService.registerUser(nuevoUsuario).subscribe(
        async (response) => {
          console.log('Respuesta de la API:', response); // Comprobar la respuesta de la API
          this.presentToast('Usuario registrado exitosamente', 2000);
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error en el registro:', JSON.stringify(error, null, 2)); // Más detalles del error
          this.presentToast(`Error al registrar usuario: ${error.message || 'inténtelo nuevamente'}`);
        }
      );
    } catch (error) {
      console.error('Error en el registro:', error);
      this.presentToast('Error al registrar usuario, inténtelo nuevamente.');
    }
  } else {
    this.presentToast('Por favor, complete el formulario correctamente.');
  }
}

  // Función para mostrar mensajes tipo toast
  async presentToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message,
      duration
    });
    toast.present();
  }
}
