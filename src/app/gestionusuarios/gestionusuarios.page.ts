import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { ClUser } from '../services/UsuariosAPI/model/ClUser';
import { UserService } from '../services/UsuariosAPI/user.service'; // Importar tu UserService
import { SQLiteService } from '../services/SQLite/sqlite.service'; // Importar tu servicio de SQLite

@Component({
  selector: 'app-gestionusuarios',
  templateUrl: './gestionusuarios.page.html',
  styleUrls: ['./gestionusuarios.page.scss'],
})
export class GestionusuariosPage implements OnInit {
  usuarios: ClUser[] = []; // Lista de usuarios

  constructor(
    private userService: UserService,
    private sqliteService: SQLiteService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.listarUsuarios();
  }

  // Listar usuarios
  listarUsuarios() {
    this.sqliteService.getUsers().then((usuarios) => {
      this.usuarios = usuarios;
    }).catch((error) => {
      console.error('Error al listar usuarios:', error);
      this.presentToast('Error al listar usuarios', 'danger');
    });
  }

  // Agregar usuario
  async openAddUserModal() {
    const alert = await this.alertController.create({
      header: 'Agregar Usuario',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'Nombre de Usuario',
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo Electrónico',
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Contraseña',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (data) => {
            const nuevoUsuario: ClUser = {
              id: 0,
              username: data.username,
              email: data.email,
              password: data.password,
              active: 0,
            };
            this.userService.registerUser(nuevoUsuario).subscribe({
              next: () => {
                this.presentToast('Usuario agregado correctamente', 'success');
                this.listarUsuarios(); // Refrescar la lista después de agregar el usuario
              },
              error: (error) => {
                console.error('Error al agregar usuario', error);
                this.presentToast('Error al agregar usuario', 'danger');
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  // Editar usuario
  async openEditUserModal(user: ClUser) {
    const alert = await this.alertController.create({
      header: 'Editar Usuario',
      inputs: [
        {
          name: 'username',
          type: 'text',
          value: user.username,
          placeholder: 'Nombre de Usuario',
        },
        {
          name: 'email',
          type: 'email',
          value: user.email,
          placeholder: 'Correo Electrónico',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (data) => {
            const usuarioActualizado: ClUser = {
              ...user,
              username: data.username,
              email: data.email,
            };
            this.userService.updateUser(user.id, usuarioActualizado).subscribe({
              next: () => {
                this.presentToast('Usuario actualizado correctamente', 'success');
                this.listarUsuarios(); // Refrescar la lista
              },
              error: (error) => {
                console.error('Error al actualizar usuario', error);
                this.presentToast('Error al actualizar usuario', 'danger');
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  // Eliminar usuario
  async onEliminarUsuario(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este usuario?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.userService.deleteUser(id).subscribe({
              next: () => {
                this.presentToast('Usuario eliminado correctamente', 'success');
                this.listarUsuarios(); // Refrescar la lista después de eliminar
              },
              error: (error) => {
                console.error('Error al eliminar usuario', error);
                this.presentToast('Error al eliminar usuario', 'danger');
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  // Mostrar un toast con mensaje
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    await toast.present();
  }
}
