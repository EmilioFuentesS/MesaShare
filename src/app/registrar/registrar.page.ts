import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClUser } from '../services/UsuariosAPI/model/ClUser'; // Importar el modelo ClUser
import { UserService } from '../services/UsuariosAPI/user.service'; // Servicio de Usuario
import { ToastController } from '@ionic/angular';
import { SQLiteService } from '../services/SQLite/sqlite.service';

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
    // Inicializa el FormGroup en el constructor
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
  async registrarUsuario() {
    if (this.registrarForm.valid) {
      const formValues = this.registrarForm.value;
      const nuevoUsuario = new ClUser({
        username: formValues.username,
        email: formValues.email,
        password: formValues.password,
      });
  
      try {
        // Intentar registrar el usuario
        const response = await this.userService.registerUser(nuevoUsuario).toPromise(); // Asegúrate de que registerUser devuelva un Observable
        console.log('Respuesta de la API:', response); // Comprobar la respuesta de la API
        await this.presentToast('Usuario registrado exitosamente', 2000); // Muestra el toast
        await this.router.navigate(['/login']); // Redireccionar a la página de login
      } catch (error: any) { // Asegúrate de que `error` sea del tipo `any`
        console.error('Error en el registro:', JSON.stringify(error, null, 2)); // Más detalles del error
        const errorMessage = error?.error?.message || 'inténtelo nuevamente'; // Manejar el mensaje de error
        await this.presentToast(`Error al registrar usuario: ${errorMessage}`);
      }
    } else {
      await this.presentToast('Por favor, complete el formulario correctamente.');
    }
  }
  
  // Función para mostrar mensajes tipo toast
  async presentToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message,
      duration
    });
    await toast.present();
  }
}