import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ClMesero } from './model/ClMesero'; // Importar el modelo de Mesero
import { SQLiteService } from '../sqlite/sqlite.service'; // Importar el servicio de SQLite

@Injectable({
  providedIn: 'root'
})
export class QrService {
  private apiUrl = 'http://localhost:3000/meseros'; // URL del JSON-server para los meseros
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(private http: HttpClient, private sqliteService: SQLiteService) {}
  
  ngOnInit() {
   
  }
  // Manejo de errores
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error); // Loguear el error
      return of(result as T); // Retornar un resultado vacío
    };
  }

  // Obtener mesero por texto (QR)
  getMeseroByTexto(texto: string): Observable<ClMesero | undefined> {
    return this.http.get<ClMesero[]>(`${this.apiUrl}?texto=${texto}`).pipe(
      map((meseros: ClMesero[]) => meseros.length > 0 ? meseros[0] : undefined),
      tap(async (mesero) => {
        if (mesero) {
          console.log(`Mesero obtenido desde la API: ${mesero.nombre}`);

          // Guardar mesero en SQLite
          try {
            await this.sqliteService.addMesero(mesero.nombre, mesero.qrCode, mesero.texto);
            console.log('Mesero sincronizado en SQLite');
          } catch (error) {
            console.error('Error al sincronizar mesero en SQLite:', error);
          }
        }
      }),
      catchError(this.handleError<ClMesero>(`getMeseroByTexto texto=${texto}`))
    );
  }

  // Agregar mesero a la API y a la base de datos local
  addMesero(mesero: ClMesero): Observable<ClMesero> {
    return this.http.post<ClMesero>(this.apiUrl, mesero, this.httpOptions)
      .pipe(
        tap(async (newMesero: ClMesero) => {
          console.log('Mesero agregado a la API:', newMesero);
          
          // Luego de agregar a la API, guardarlo en la base de datos SQLite
          try {
            await this.sqliteService.addMesero(
              newMesero.nombre,
              newMesero.qrCode,
              newMesero.texto
            );
            console.log('Mesero agregado a SQLite');
          } catch (error) {
            console.error('Error al agregar el mesero a SQLite:', error);
          }
        }),
        catchError(this.handleError<ClMesero>('addMesero'))
      );
  }

  // Obtener todos los meseros desde la API
  getMeseros(): Observable<ClMesero[]> {
    return this.http.get<ClMesero[]>(this.apiUrl)
      .pipe(
        tap(async (meseros) => {
          console.log('Meseros obtenidos desde la API:', meseros);

          // Sincronizar meseros con SQLite
          for (const mesero of meseros) {
            try {
              await this.sqliteService.addMesero(mesero.nombre, mesero.qrCode, mesero.texto);
              console.log(`Mesero sincronizado con SQLite: ${mesero.nombre}`);
            } catch (error) {
              console.error('Error al sincronizar mesero en SQLite:', error);
            }
          }
        }),
        catchError(this.handleError<ClMesero[]>('getMeseros', []))
      );
  }

  // Obtener mesero por ID desde la API
  getMesero(id: number): Observable<ClMesero> {
    return this.http.get<ClMesero>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(async (mesero) => {
          console.log('Mesero obtenido:', mesero);

          // Sincronizar con SQLite
          try {
            await this.sqliteService.addMesero(mesero.nombre, mesero.qrCode, mesero.texto);
            console.log('Mesero sincronizado en SQLite');
          } catch (error) {
            console.error('Error al sincronizar mesero en SQLite:', error);
          }
        }),
        catchError(this.handleError<ClMesero>(`getMesero id=${id}`))
      );
  }

  // Eliminar un mesero tanto de la API como de SQLite
  deleteMesero(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap(async () => {
        console.log(`Mesero eliminado con id=${id}`);
        
        // Eliminar en SQLite
        try {
          await this.sqliteService.deleteMesero(id);
          console.log('Mesero eliminado de SQLite');
        } catch (error) {
          console.error('Error al eliminar mesero de SQLite:', error);
        }
      }),
      catchError(this.handleError<void>('deleteMesero'))
    );
  }

  // Editar mesero
  updateMesero(mesero: ClMesero): Observable<any> {
    return this.http.put(`${this.apiUrl}/${mesero.id}`, mesero, this.httpOptions).pipe(
      tap(async () => {
        console.log(`Mesero actualizado con id=${mesero.id}`);

        // Actualizar en SQLite
        try {
          await this.sqliteService.updateMesero(mesero.id, mesero.nombre, mesero.qrCode, mesero.texto);
          console.log('Mesero actualizado en SQLite');
        } catch (error) {
          console.error('Error al actualizar mesero en SQLite:', error);
        }
      }),
      catchError(this.handleError<any>('updateMesero'))
    );
  }

  // Obtener un mesero por ID desde la API
  getMeseroById(id: number): Observable<ClMesero> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ClMesero>(url).pipe(
      tap(async (mesero) => {
        console.log(`Mesero obtenido con id=${id}:`, mesero);

        // Sincronizar con SQLite
        try {
          await this.sqliteService.addMesero(mesero.nombre, mesero.qrCode, mesero.texto);
          console.log('Mesero sincronizado en SQLite');
        } catch (error) {
          console.error('Error al sincronizar mesero en SQLite:', error);
        }
      }),
      catchError(this.handleError<ClMesero>(`getMeseroById id=${id}`))
    );
  }
}
