import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SQLiteService } from './sqlite.service'; // Assuming SQLiteService handles database interactions

@Injectable({
  providedIn: 'root'
})
export class AutenthicationServiceService {

  constructor(

    private router: Router,
    private sqliteService: SQLiteService
  ) {}

  //  FUNCIÓN PARA EL CANACTIVE   //
  async login(username: string, password: string): Promise<boolean> {
    const user = await this.sqliteService.loginUser(username, password);
    if (user) {
      console.log('Login exitoso');
      return true;
    }
    return false;
  }
  
  async logout(): Promise<void> {
    await this.sqliteService.logoutUser();  // Use SQLite to log out the user
    this.router.navigate(['/login']);
  }
  
  async isAuthenticated(): Promise<boolean> {
    const activeUser = await this.sqliteService.getActiveUser();
    return !!activeUser; // Returns true if an active user is found in SQLite
  }
}
