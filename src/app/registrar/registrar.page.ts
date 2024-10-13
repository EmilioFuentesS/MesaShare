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

  registrarForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService, // Cambiar SQLiteService a UserService para que use ambos
    private toastController: ToastController,
    private sqliteService: SQLiteService
  ) {}

  ngOnInit() {
   
    // Inicializamos el formulario con validadores
    this.registrarForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator]], // Valida el formato de la contraseña
      confirmPassword: ['', [Validators.required]],
    }, { validator: this.passwordMatchValidator });
  }

  // Validador personalizado para la contraseña
  passwordValidator(control: any) {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/; // Al menos 8 caracteres, una letra mayúscula, una minúscula, y un número
    return regex.test(control.value) ? null : { invalidPassword: true };
  }

  // Validador personalizado para confirmar que las contraseñas coinciden
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  // Registrar el usuario
  async registrarUsuario() {
    if (this.registrarForm.valid) {
      const formValues = this.registrarForm.value;
      const nuevoUsuario = new ClUser({
        username: formValues.username,
        email: formValues.email,
        password: formValues.password, // En texto plano, idealmente debería ser encriptada
      });

      try {
        // Llamar al servicio de registro para registrar en la API y sincronizar en SQLite
        this.userService.registerUser(nuevoUsuario).subscribe(
          async (response) => {
            // Usuario registrado con éxito
            this.presentToast('Usuario registrado exitosamente', 2000);
            this.router.navigate(['/login']); // Redirigir al login tras el registro
          },
          (error) => {
            // Manejo del error al registrar
            console.error('Error en el registro:', error);
            this.presentToast('Error al registrar usuario, inténtelo nuevamente.');
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
