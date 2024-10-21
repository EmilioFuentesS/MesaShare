import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/UsuariosAPI/user.service'; // Servicio de usuarios
import { ClUser } from '../services/UsuariosAPI/model/ClUser'; // Modelo de usuario
import { AlertController, LoadingController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera'; // Capacitor Camera
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AutenthicationServiceService } from '../services/SQLite/autenthication-service.service'; // Servicio de autenticación
import { Storage } from '@capacitor/storage'; // Capacitor Storage para almacenar la imagen de perfil
import { SQLiteService } from '../services/SQLite/sqlite.service'; // Servicio SQLite

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.page.html',
  styleUrls: ['./mi-perfil.page.scss'],
})
export class MiPerfilPage implements OnInit {
  user: ClUser | undefined; // Almacena la información del usuario
  profileImage: SafeUrl | undefined; // Para almacenar la imagen del perfil
  loading: any; // Controlador de carga

  constructor(
    private userService: UserService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private sanitizer: DomSanitizer, // Para sanitizar la URL de la imagen
    private authenticationService: AutenthicationServiceService, // Servicio de autenticación para obtener usuario activo
    private sqliteService: SQLiteService // Servicio SQLite
  ) {}

  async ngOnInit() {
    // Cargar el perfil del usuario activo y la imagen de perfil desde Storage
    await this.loadUserProfile();
    await this.loadProfileImage();
  }

  // Método para cargar el perfil del usuario activo
  async loadUserProfile() {
    try {
      // Obtener el usuario activo desde el servicio de autenticación
      const activeUser = await this.authenticationService.isAuthenticated();
      if (activeUser) {
        this.user = await this.sqliteService.getActiveUser(); // Cargar el usuario activo
      } else {
        this.presentAlert('Error', 'No se encontró el usuario activo.');
      }
    } catch (error) {
      console.error('Error al cargar el perfil del usuario:', error);
      this.presentAlert('Error', 'No se pudo cargar el perfil del usuario.');
    }
  }

  // Cargar la imagen de perfil desde el almacenamiento local (Capacitor Storage)
  async loadProfileImage() {
    try {
      const { value } = await Storage.get({ key: 'profileImage' });
      if (value) {
        this.profileImage = this.sanitizer.bypassSecurityTrustUrl(value); // Mostrar la imagen si existe
      }
    } catch (error) {
      console.error('Error al cargar la imagen de perfil:', error);
    }
  }

  // Tomar una nueva foto de perfil usando la cámara de Capacitor
  async takeProfilePhoto() {
    try {
      const image: Photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera, // Puedes cambiar a Gallery si lo prefieres
      });

      // Asegurarse de que la imagen no sea undefined antes de almacenarla
      if (image?.dataUrl) {
        // Guardar la imagen en el almacenamiento local (Capacitor Storage)
        await Storage.set({
          key: 'profileImage',
          value: image.dataUrl,
        });

        // Mostrar la imagen de perfil
        this.profileImage = this.sanitizer.bypassSecurityTrustUrl(image.dataUrl);
      } else {
        console.error('Error: No se pudo obtener la URL de la imagen.');
        this.presentAlert('Error', 'No se pudo obtener la URL de la imagen.');
      }
    } catch (error) {
      console.error('Error al tomar la foto de perfil:', error);
      this.presentAlert('Error', 'No se pudo actualizar la foto de perfil.');
    }
  }

  // Guardar los cambios del perfil (solo la información de usuario, no la imagen)
  async updateProfile() {
    this.loading = await this.loadingController.create({
      message: 'Actualizando perfil...',
    });
    await this.loading.present();

    if (this.user) {
      this.userService.updateUser(this.user.id, this.user).subscribe({
        next: async () => {
          await this.loading.dismiss();
          this.presentAlert('Éxito', 'Perfil actualizado correctamente.');
        },
        error: async (err) => {
          console.error('Error al actualizar perfil', err);
          await this.loading.dismiss();
          this.presentAlert('Error', 'No se pudo actualizar el perfil.');
        },
      });
    }
  }

  // Mostrar alerta
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}