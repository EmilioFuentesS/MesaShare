import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AutenthicationServiceService } from './autenthication-service.service'; // Importa tu servicio de autenticación
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutService implements CanActivate {

  constructor(
    private authenticationService: AutenthicationServiceService,  // Inyecta el servicio de autenticación
    private router: Router  // Inyecta el enrutador para redirigir si no está autenticado
  ) {}

  // Implementa la función canActivate para bloquear rutas si no está autenticado
  canActivate(): boolean | Observable<boolean> {
    if (this.authenticationService.isAuthenticated()) {
      // Si el usuario está autenticado, permite el acceso a la ruta
      return true;
    } else {
      // Si no está autenticado, redirige al login
      this.router.navigate(['login']);
      return false;
    }
  }
}
