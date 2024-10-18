import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError, lastValueFrom } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ClUser } from './model/ClUser'; // Modelo de usuario
import { SQLiteService } from '../SQLite/sqlite.service'; // Servicio SQLite

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://192.168.182.190:3000/users'; // URL del JSON-server para los usuarios
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  private usersSubject = new BehaviorSubject<ClUser[]>([]); // BehaviorSubject para los usuarios

  constructor(private http: HttpClient, private sqliteService: SQLiteService) {
    this.loadUsersFromSQLite(); // Cargar los usuarios desde SQLite al iniciar
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`Error en ${operation}:`, error);
      return of(result as T);
    };
  }

  getUsersObservable(): Observable<ClUser[]> {
    return this.usersSubject.asObservable();
  }

  loadUsersFromSQLite(): void {
    this.sqliteService.getUsers().then(async (users) => {
      this.usersSubject.next(users); // Mostrar los usuarios obtenidos desde SQLite

      if (navigator.onLine) {
        for (const user of users) {
          await this.syncUserWithAPI(user); // Sincronizar usuario con la API
        }
      } else {
        console.warn('Sin conexión. Usando solo datos de SQLite.');
      }
    }).catch((error) => {
      console.error('Error al obtener usuarios de SQLite:', error);
    });
  }
 

 syncUserWithAPI(user: ClUser): Observable<ClUser> {
  return this.http.post<ClUser>(this.apiUrl, user).pipe(
    tap(() => console.log(`Usuario sincronizado con la API: ${user.username}`)),
    catchError(error => {
      console.error('Error syncing user with API:', error);
      return of(user);
    })
  );
}



// Registra en SQLite y sync con API
registerUser(user: ClUser): Observable<ClUser> {
  return new Observable(observer => {
    this.sqliteService.registerUser(user.username, user.email, user.password).then(async () => {
      console.log('Usuario registrado en SQLite:', user);

     
      if (navigator.onLine) {
        this.syncUserWithAPI(user).subscribe(() => {
          console.log('Usuario sincronizado con la API');
        });
      }

      observer.next(user);
      observer.complete();
    }).catch((error) => {
      console.error('Error al registrar usuario en SQLite:', error);
      observer.error(error);
    });
  });
}



  
  // Cerrar sesión en SQLite
  async logoutUser(): Promise<void> {
    try {
      await this.sqliteService.logoutUser();  // Cierra sesión en SQLite
      console.log('Sesión cerrada en SQLite');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
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

  // Actualizar un usuario en SQLite y sincronizar con la API
  updateUser(id: number, user: ClUser): Observable<ClUser> {
    return new Observable(observer => {
      this.sqliteService.updateSesionData(user).then(async () => {
        console.log(`Usuario actualizado en SQLite: ${user.username}`);
        await this.syncUserWithAPI(user); // Sincronizar con la API si está disponible
        observer.next(user);
        observer.complete();
      }).catch((error) => {
        console.error('Error al actualizar usuario en SQLite:', error);
        observer.error(error);
      });
    });
  }

  recoverPassword(username: string): Observable<boolean> {
    return new Observable(observer => {
      // Intentar buscar el usuario en la base de datos local (SQLite)
      this.sqliteService.getUserByUsername(username).then(user => {
        if (user) {
          console.log('Usuario encontrado en SQLite, se envía un correo de recuperación o se maneja la lógica.');
          observer.next(true);  // Devolver true si se encuentra en SQLite
          observer.complete();
        } else {
          // Si no está en SQLite, verificar en la API (si hay conexión)
          if (navigator.onLine) {
            this.http.get<ClUser[]>(`${this.apiUrl}?username=${username}`, this.httpOptions)
              .pipe(
                map(users => users.length > 0),
                catchError(() => of(false)) // En caso de error, devolvemos false
              )
              .subscribe(exists => {
                if (exists) {
                  console.log('Usuario encontrado en la API, se envía un correo de recuperación o se maneja la lógica.');
                  observer.next(true);  // Devolver true si se encuentra en la API
                } else {
                  console.log('Usuario no encontrado ni en SQLite ni en la API.');
                  observer.next(false); // Devolver false si no se encuentra
                }
                observer.complete();
              });
          } else {
            console.log('Sin conexión, no se puede recuperar la contraseña.');
            observer.next(false);
            observer.complete();
          }
        }
      }).catch(error => {
        console.error('Error en la recuperación de la contraseña:', error);
        observer.error(error);  // Devolver error si ocurre algún problema
      });
    });
  }

  // Eliminar un usuario en SQLite y sincronizar con la API
  deleteUser(id: number): Observable<void> {
    return new Observable(observer => {
      this.sqliteService.deleteUser(id).then(() => {
        console.log(`Usuario eliminado de SQLite con ID: ${id}`);
        this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
          tap(() => console.log(`Usuario eliminado de la API con ID: ${id}`)),
          catchError(this.handleError<void>('deleteUser'))
        ).subscribe(() => {
          observer.next();
          observer.complete();
        });
      }).catch((error) => {
        console.error('Error al eliminar usuario en SQLite:', error);
        observer.error(error);
      });
    });
  }

// Obtener todos los usuarios desde SQLite
async getUsersFromSQLite(): Promise<ClUser[]> {
  return await this.sqliteService.getUsers();
}

 // Método para obtener un usuario por nombre de usuario
 async getUserByUsername(username: string): Promise<any> {
  return await this.sqliteService.getUserByUsername(username);
}

}
