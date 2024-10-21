import { Component } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular'; // Importa LoadingController y AlertController
import { Router } from '@angular/router'; // Importa Router para la redirección
import { UserService } from '../services/UsuariosAPI/user.service'; // Asegúrate de que esta ruta sea correcta

@Component({
  selector: 'app-valoracion',
  templateUrl: './valoracion.page.html',
  styleUrls: ['./valoracion.page.scss'],
})
export class ValoracionPage {
  estrellas = Array(5).fill(0); // Crea un array de 5 elementos
  rating = 0; // Valoración inicial

  constructor(
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router,
    private userService: UserService // Asegúrate de que estás inyectando tu servicio de usuario
  ) {}

  calificar(rating: number) {
    this.rating = rating; // Actualiza la valoración al clic
  }

  // Método para cerrar sesión
  async logout() {
    const loading = await this.loadingController.create({
      message: 'Cerrando sesión...',
    });
    await loading.present();

    try {
      await this.userService.logoutUser(); // Llama al método de logout
      await loading.dismiss();
      this.router.navigate(['/login']); // Redirigir al login después de cerrar sesión
      this.presentAlert('Sesión cerrada', 'Has cerrado sesión correctamente.');
    } catch (error) {
      await loading.dismiss();
      console.error('Error al cerrar sesión:', error);
      this.presentAlert('Error', 'Hubo un problema al cerrar sesión.');
    }
  }

  // Método para mostrar alertas
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }


  // Método para enviar la valoración
  async submitRating() {
    const alert = await this.alertController.create({
      header: 'Gracias por tu valoración',
      message: `Has calificado con ${this.rating} estrella${this.rating > 1 ? 's' : ''}.`,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
