import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { SQLiteService } from './sqlite.service'; // Tu servicio SQLite

@Injectable({
  providedIn: 'root'
})
export class AutenthicationServiceService {

  // Variable que se actualizará para saber si hay un usuario autenticado
  authState = new BehaviorSubject(false);

  constructor(
    private router: Router,
    private storage: Storage,
    private sqliteService: SQLiteService, // Usa tu SQLiteService para interactuar con la base de datos
    private toastController: ToastController
  ) {
    this.isLogged();
  }

  /**
   * Verifica si hay un usuario autenticado en localStorage
   */
  isLogged() {
    this.storage.get("USER_DATA")
      .then((response) => {
        console.log(response);
        if (response != null) {
          this.authState.next(true); // Usuario autenticado
        }
      });
  }

  /**
   * Método de inicio de sesión
   * @param login Objeto con los datos del login (usuario y contraseña)
   */
  async login(login: { username: string, password: string }) {
    try {
      // Verifica el usuario y la contraseña en la base de datos
      const user = await this.sqliteService.loginUser(login.username, login.password);
      if (user) {
        // Si el login es exitoso, guarda los datos del usuario en el almacenamiento local
        user.active = 1; // Se establece que el usuario está activo
        await this.sqliteService.updateSesionData(user); // Actualiza el estado del usuario en la base de datos
        await this.storage.set("USER_DATA", user); // Guarda en el almacenamiento local
        this.authState.next(true); // Actualiza el estado de autenticación
        this.router.navigate(['home']); // Redirige a la página principal
      } else {
        this.presentToast("Credenciales Incorrectas");
      }
    } catch (error) {
      console.error('Error en login:', error);
      this.presentToast("Ocurrió un error en el inicio de sesión.");
    }
  }

  /**
   * Cierra la sesión actual del usuario
   */
  async logout() {
    try {
      const data = await this.storage.get("USER_DATA");
      if (data) {
        data.active = 0; // Desactiva la sesión del usuario
        await this.sqliteService.updateSesionData(data); // Actualiza en la base de datos
        await this.storage.remove("USER_DATA"); // Elimina el usuario del almacenamiento local
        this.authState.next(false); // Actualiza el estado de autenticación
        this.router.navigate(['login']); // Redirige a la página de login
      }
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }

  /**
   * Muestra un toast con el mensaje pasado
   */
  async presentToast(message: string, duration?: number) {
    const toast = await this.toastController.create({
      message,
      duration: duration ? duration : 2000
    });
    toast.present();
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated() {
    return this.authState.value;
  }
}
