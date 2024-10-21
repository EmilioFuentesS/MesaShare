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
  showImage = true; // Controla la visibilidad de la imagen

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
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const { username, password } = navigation.extras.state as { username: string, password: string };
      if (username && password) {
        this.loginForm.patchValue({ username, password });
      }
    }
    
    this.sqliteService.initializeDB('my_database', 'my_db_key').then(() => {
      console.log('Database initialized');
    }).catch(error => {
      console.error('Error initializing database:', error);
    });
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
    if (this.validateModel()) {
      try {
        
        await this.sqliteService.initializeDB('my_database', 'my_db_key');
  
        const { username, password } = this.loginForm.value;
        const user = await this.sqliteService.loginUser(username, password);
        
        if (user) {
          await this.router.navigate(['/inicio']);
          await this.presentToast('Bienvenido ' + username);
        } else {
          this.presentToast('Usuario o contraseña incorrectos.');
        }
      } catch (error) {
        console.error('Error during login:', error);
        this.presentToast('Error durante el inicio de sesión.');
      }
    } else {
      this.presentToast('Por favor completa todos los campos.');
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
