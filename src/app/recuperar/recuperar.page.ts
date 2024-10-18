import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/UsuariosAPI/user.service'; // Importar el UserService
import { ToastController } from '@ionic/angular';
import { Clipboard } from '@capacitor/clipboard';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
})
export class RecuperarPage {
  recuperarForm: FormGroup;
  recoveredPassword: string | null = null; // Almacenar contraseña recuperada

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastController: ToastController
  ) {
    // Inicializamos el formulario con el campo 'username'
    this.recuperarForm = this.fb.group({
      username: ['', [Validators.required]],
    });
  }
  
  // Método para enviar el formulario de recuperación
  // Método para enviar el formulario de recuperación
  async onSubmit() {
    if (this.recuperarForm.valid) {
      const { username } = this.recuperarForm.value;
      try {
        // Llamamos al servicio para recuperar la contraseña por nombre de usuario
        const user = await this.userService.getUserByUsername(username);
        if (user) {
          this.recoveredPassword = user.password; // Mostramos la contraseña en el HTML
          this.presentToast('Contraseña recuperada. Copie la contraseña mostrada.');
        } else {
          this.presentToast('No se encontró el usuario con ese nombre.');
        }
      } catch (error) {
        console.error('Error al enviar la solicitud de recuperación:', error);
        this.presentToast('Ocurrió un error, inténtelo nuevamente.');
      }
    } else {
      this.presentToast('Por favor, ingrese un nombre de usuario válido.');
    }
  }

  // Método para copiar la contraseña al portapapeles
  async copyToClipboard() {
    if (this.recoveredPassword) {
      await Clipboard.write({
        string: this.recoveredPassword
      });
      this.presentToast('Contraseña copiada al portapapeles.');
    }
  }

  // Mostrar mensaje toast
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }
}
