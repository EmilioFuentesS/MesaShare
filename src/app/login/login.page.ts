import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SQLiteService } from '../services/SQLite/sqlite.service'; // Importa el servicio SQLite
import { ToastController, AlertController } from '@ionic/angular'; // Importa Toast y AlertController

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  field: string = ""; // Para mostrar campos faltantes

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private sqliteService: SQLiteService, // Inyecta el servicio SQLite
    private alertController: AlertController, // Inyecta el AlertController
    private toastController: ToastController // Inyecta el ToastController
  ) {
    // Inicializamos el formulario
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Puedes realizar cualquier inicialización aquí
  }

  // Método para validar los campos
  validateModel(): boolean {
    if (this.loginForm.valid) {
      return true;
    } else {
      const invalidField = Object.keys(this.loginForm.controls).find(key => this.loginForm.controls[key].invalid);
      this.field = invalidField || "Campo desconocido";
      return false;
    }
  }

  async onLogin() {
    const { username, password } = this.loginForm.value;

    if (this.validateModel()) {
      try {
        const user = await this.sqliteService.loginUser(username, password);
        if (user) {
          // Redirigir dependiendo del tipo de usuario
          if (user.username === 'sys') {
            this.router.navigate(['/admin'], { state: { username } });
          } else {
            this.router.navigate(['/inicio'], { state: { username } });
          }
          this.presentToast('Bienvenido ' + username);
        } else {
          this.presentToast('Usuario o contraseña incorrectos.');
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        this.showAlert('Error', 'Ocurrió un error durante el inicio de sesión.');
      }
    } else {
      this.presentToast('Falta completar: ' + this.field);
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

  // Función parte del ciclo de vida de un componente
  ionViewWillEnter() {
    console.log('ionViewWillEnter');
  }
}
