import { Component, OnInit  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClUser } from '../services/UsuariosAPI/model/ClUser'; // Model for User
import { UserService } from '../services/UsuariosAPI/user.service'; // User Service for registration and sync
import { ToastController } from '@ionic/angular';
import { AutenthicationServiceService } from '../services/SQLite/autenthication-service.service'; 
import { SQLiteService } from '../services/SQLite/sqlite.service'; // Importa el servicio SQLite

@Component({
  selector: 'app-registrar',
  templateUrl: './registrar.page.html',
  styleUrls: ['./registrar.page.scss'],
})
export class RegistrarPage implements OnInit  {
  registrarForm: FormGroup; // Form for registration
  showImage = true; // Controla la visibilidad de la imagen

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService, // Inject UserService
    private authService: AutenthicationServiceService,  // Correct service for authentication
    private toastController: ToastController,
    private sqliteService: SQLiteService
  ) {
    this.registrarForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {}

 

  // Custom validator to match password and confirm password fields
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
  

  async presentToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message,
      duration
    });
    await toast.present();
  }
}
