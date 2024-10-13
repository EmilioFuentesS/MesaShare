import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SQLiteService } from '../services/sqlite/sqlite.service'; // Importa el servicio SQLite
import { ToastController, AlertController } from '@ionic/angular'; // Importa Toast y AlertController

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm: FormGroup;
  field: string = ""; // Para mostrar campos faltantes

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private sqliteService: SQLiteService, // Inyecta el servicio
    private alertController: AlertController, // Inyecta el AlertController
    private toastController: ToastController // Inyecta el ToastController
  ) {
    
    // Inicializamos el formulario
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
 

  // Método para validar los campos
  validateModel(model: any): boolean {
    for (var [key, value] of Object.entries(model)) {
      if (value === "") {
        this.field = key;
        return false;
      }
    }
    return true;
  }

  // Método para iniciar sesión
  async onLogin() {
    const { username, password } = this.loginForm.value;

    if (this.validateModel(this.loginForm.value)) {
      try {
        const user = await this.sqliteService.loginUser(username, password);
        if (user) {
          // Usuario encontrado, redirigir a la página de inicio
          this.router.navigate(['/inicio'], { state: { username } });
          this.presentToast('Bienvenido ' + username);
        } else {
          this.presentAlertConfirm();
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        this.showAlert('Error', 'Ocurrió un error durante el inicio de sesión.');
      }
    } else {
      this.presentToast('Falta: ' + this.field);
    }
  }

  // Método para registrar un nuevo usuario
  async registerUser() {
    const { username, password } = this.loginForm.value;

    if (this.validateModel(this.loginForm.value)) {
      try {
        await this.sqliteService.registerUser(username, username + '@default.com', password);
        this.presentToast('Usuario registrado exitosamente');
        this.router.navigate(['/inicio'], { state: { username } });
      } catch (error) {
        console.error('Error al registrar usuario:', error);
        this.presentToast('El usuario ya existe o ocurrió un error al registrarse.');
      }
    } else {
      this.presentToast('Falta: ' + this.field);
    }
  }

  // Método para mostrar un toast
  async presentToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message,
      duration
    });
    toast.present();
  }

  // Método para mostrar alertas al usuario
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Método para confirmar registro si el usuario no existe
  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Usuario no encontrado',
      message: '¿Deseas registrarte con este usuario?',
      buttons: [
        {
          text: 'NO',
          role: 'cancel'
        },
        {
          text: 'SI',
          handler: () => {
            this.registerUser();
          }
        }
      ]
    });
    await alert.present();
  }

  // Función parte del ciclo de vida de un componente
  ionViewWillEnter() {
    console.log('ionViewWillEnter');
    // Puedes agregar cualquier funcionalidad adicional aquí
  }
}
