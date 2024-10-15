import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QrService } from '../../services/qr-generator/qr.service';
import { ClMesero } from '../../services/qr-generator/model/ClMesero';
import { SQLiteService } from '../../services/sqlite/sqlite.service';

@Component({
  selector: 'app-mesero-edit',
  templateUrl: './mesero-edit.page.html',
  styleUrls: ['./mesero-edit.page.scss'],
})
export class MeseroEditPage implements OnInit {
  mesero: ClMesero | null = null;

  constructor(
    private qrService: QrService,
    private route: ActivatedRoute,
    private router: Router,
    private sqliteService: SQLiteService
  ) {}

  async ngOnInit() {
    // Inicializar la base de datos SQLite
    await this.sqliteService.initializeDB('my_database', 'mi_clave_secreta');
  
    // Obtener el ID del mesero desde la URL
    const id = this.route.snapshot.params['id'];
    
    if (id) {
      this.qrService.getMesero(id).subscribe(
        (data: ClMesero) => {
          if (data) {
            this.mesero = data; // Asignar el mesero si se encuentra
          } else {
            console.error('Mesero no encontrado');
            this.router.navigate(['/meseros']); // Redirigir si no se encuentra
          }
        },
        (error) => {
          console.error('Error al obtener el mesero:', error);
          this.router.navigate(['/meseros']); // Redirigir en caso de error
        }
      );
    } else {
      console.error('ID de mesero no válido');
      this.router.navigate(['/meseros']); // Redirigir si el ID no es válido
    }
  }

  // Actualizar mesero en SQLite y sincronizar con la API
  async onSubmit() {
    if (this.mesero) {
      this.qrService.updateMesero(this.mesero).subscribe(
        async () => {
          await this.sqliteService.updateMesero(
            this.mesero!.id,
            this.mesero!.nombre,
            this.mesero!.qrCode,
            this.mesero!.texto
          );
          this.router.navigate(['/meseros']); // Redirigir después de la actualización
        },
        (error) => {
          console.error('Error al actualizar el mesero:', error);
        }
      );
    }
  }

  // Cancelar la edición
  cancel() {
    this.router.navigate(['/meseros']);
  }
}
