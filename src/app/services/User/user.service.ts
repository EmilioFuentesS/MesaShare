import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap, switchMap  } from 'rxjs/operators';
import { ClUser } from './model/ClUser'; // Modelo de usuario
import { SQLiteService } from '../sqlite/sqlite.service'; // Servicio SQLite

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users'; // URL del JSON-server para los usuarios
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  private usersSubject = new BehaviorSubject<ClUser[]>([]); // BehaviorSubject para los usuarios

  constructor(private http: HttpClient, private sqliteService: SQLiteService) {
    this.getUsers().subscribe(); // Cargar los usuarios al iniciar
  }


  // Manejo de errores
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`Error en ${operation}:`, error);
      return of(result as T);
    };
  }

  // Observable para usuarios
  getUsersObservable(): Observable<ClUser[]> {
    return this.usersSubject.asObservable();
  }

  // Obtener todos los usuarios desde la API y sincronizar con SQLite
  getUsers(): Observable<ClUser[]> {
    return this.http.get<ClUser[]>(this.apiUrl)
      .pipe(
        tap(async (users) => {
          console.log('Usuarios obtenidos:', users);
          this.usersSubject.next(users);

          // Sincronizar los usuarios obtenidos desde la API con SQLite
          for (const user of users) {
            try {
              await this.sqliteService.registerUser(user.username, user.email, user.password);
              console.log(`Usuario sincronizado a SQLite: ${user.username}`);
            } catch (error) {
              console.error('Error al sincronizar usuario con SQLite:', error);
            }
          }
        }),
        catchError(this.handleError<ClUser[]>('getUsers', []))
      );
  }

  // Registrar un nuevo usuario en la API y en SQLite
  registerUser(user: ClUser): Observable<ClUser> {
    return this.http.post<ClUser>(this.apiUrl, user, this.httpOptions).pipe(
      switchMap((newUser: ClUser) => {
        console.log('Usuario agregado en la API:', newUser);
        
        // Guardar en SQLite después de agregarlo a la API
        return this.sqliteService.registerUser(newUser.username, newUser.email, newUser.password).then(() => {
          console.log(`Usuario sincronizado a SQLite: ${newUser.username}`);
          return newUser; // Devolvemos el usuario registrado
        });
      }),
      catchError(this.handleError<ClUser>('registerUser'))
    );
  }

  // Intentar iniciar sesión utilizando SQLite
  async loginUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.sqliteService.loginUser(username, password);
      if (user) {
        console.log('Usuario encontrado en SQLite:', user);
        return user; // Usuario encontrado en SQLite
      } else {
        console.error('Usuario no encontrado en SQLite');
        return null;
      }
    } catch (error) {
      console.error('Error al iniciar sesión en SQLite:', error);
      return null;
    }
  }

  // Actualizar un usuario
  updateUser(id: number, user: ClUser): Observable<ClUser> {
    return this.http.put<ClUser>(`${this.apiUrl}/${id}`, user, this.httpOptions)
      .pipe(
        tap(async () => {
          console.log(`Usuario actualizado con ID: ${id}`);
          this.getUsers().subscribe(); // Refrescar la lista de usuarios

          // Actualizar en SQLite
          try {
            await this.sqliteService.updateSesionData(user);
            console.log(`Usuario actualizado en SQLite: ${user.username}`);
          } catch (error) {
            console.error('Error al actualizar usuario en SQLite:', error);
          }
        }),
        catchError(this.handleError<any>('updateUser'))
      );
  }

  // Eliminar un usuario
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(
        tap(async () => {
          console.log(`Usuario eliminado con ID: ${id}`);
          this.getUsers().subscribe(); // Refrescar la lista de usuarios

          // Eliminar de SQLite
          try {
            await this.sqliteService.deleteUser(id);
            console.log(`Usuario eliminado de SQLite con ID: ${id}`);
          } catch (error) {
            console.error('Error al eliminar usuario de SQLite:', error);
          }
        }),
        catchError(this.handleError<void>('deleteUser'))
      );
  }
}
