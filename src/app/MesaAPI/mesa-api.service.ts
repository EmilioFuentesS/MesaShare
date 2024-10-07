import { Injectable } from '@angular/core';
import { ClProducto } from './model/ClProducto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface ClMenuItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad:number;
}

@Injectable({
  providedIn: 'root'
})
export class MesaAPIService {
  private apiUrl = 'http://localhost:3000/productos'; // Cambia esto a la URL de tu JSON-server
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(private http: HttpClient) { }

  // Manejo de errores
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`Error en ${operation}:`, error); // Log to console instead
      return of(result as T); // Retorna un resultado vacío
    };
  }

  // Obtener todos los items del menú
  getMenuItems(): Observable<ClMenuItem[]> {
    console.log("Obteniendo los items del menú");
    return this.http.get<ClMenuItem[]>(this.apiUrl)
      .pipe(
        tap(items => console.log('Items del menú obtenidos:', items)),
        catchError(this.handleError<ClMenuItem[]>('getMenuItems', []))
      );
  }

  // Agregar un nuevo item al menú
  addMenuItem(item: ClMenuItem): Observable<ClMenuItem> {
    console.log("Agregando item al menú:", item);
    return this.http.post<ClMenuItem>(this.apiUrl, item, this.httpOptions)
      .pipe(
        tap((newItem: ClMenuItem) => console.log('Item agregado:', newItem)),
        catchError(this.handleError<ClMenuItem>('addMenuItem'))
      );
  }

  // Obtener un item del menú por ID
  getMenuItem(id: number): Observable<ClMenuItem> {
    console.log(`Obteniendo item del menú con ID: ${id}`);
    return this.http.get<ClMenuItem>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(item => console.log('Item obtenido:', item)),
        catchError(this.handleError<ClMenuItem>(`getMenuItem id=${id}`))
      );
  }

  // Actualizar un item del menú
  updateMenuItem(id: number, item: ClMenuItem): Observable<ClMenuItem> {
    console.log(`Actualizando item del menú con ID: ${id}`);
    return this.http.put<ClMenuItem>(`${this.apiUrl}/${id}`, item, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Item actualizado con ID: ${id}`)),
        catchError(this.handleError<any>('updateMenuItem'))
      );
  }

  // Eliminar un item del menú
  deleteMenuItem(id: number): Observable<ClMenuItem> {
    console.log(`Eliminando item del menú con ID: ${id}`);
    return this.http.delete<ClMenuItem>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Item eliminado con ID: ${id}`)),
        catchError(this.handleError<ClMenuItem>('deleteMenuItem'))
      );
  }
}
