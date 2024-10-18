import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AutenthicationServiceService } from './autenthication-service.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutService implements CanActivate {

  constructor(
    private authenticationService: AutenthicationServiceService, 
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const isAuthenticated = await this.authenticationService.isAuthenticated(); 
    if (isAuthenticated) {
      return true; 
    } else {
      this.router.navigate(['login']); 
      return false;
    }
  }
}
