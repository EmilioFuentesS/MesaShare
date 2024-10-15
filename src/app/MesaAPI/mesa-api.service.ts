import { Injectable } from '@angular/core';
import { ClProducto } from './model/ClProducto'; // Cambiar a ClProducto
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

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
  getMenuItems(): Observable<ClProducto[]> {  // Cambiar a ClProducto[]
    console.log("Obteniendo los items del menú");
    return this.http.get<ClProducto[]>(this.apiUrl)  // Cambiar a ClProducto[]
      .pipe(
        tap(items => console.log('Items del menú obtenidos:', items)),
        catchError(this.handleError<ClProducto[]>('getMenuItems', []))  // Cambiar a ClProducto[]
      );
  }

  // Agregar un nuevo item al menú
  addMenuItem(item: ClProducto): Observable<ClProducto> {  // Cambiar a ClProducto
    console.log("Agregando item al menú:", item);
    return this.http.post<ClProducto>(this.apiUrl, item, this.httpOptions)  // Cambiar a ClProducto
      .pipe(
        tap((newItem: ClProducto) => console.log('Item agregado:', newItem)),  // Cambiar a ClProducto
        catchError(this.handleError<ClProducto>('addMenuItem'))  // Cambiar a ClProducto
      );
  }

  // Obtener un item del menú por ID
  getMenuItem(id: number): Observable<ClProducto> {  // Cambiar a ClProducto
    console.log(`Obteniendo item del menú con ID: ${id}`);
    return this.http.get<ClProducto>(`${this.apiUrl}/${id}`)  // Cambiar a ClProducto
      .pipe(
        tap(item => console.log('Item obtenido:', item)),
        catchError(this.handleError<ClProducto>(`getMenuItem id=${id}`))  // Cambiar a ClProducto
      );
  }

  // Actualizar un item del menú
  updateMenuItem(id: number, item: ClProducto): Observable<any> {  // Cambiar a ClProducto
    console.log(`Actualizando item del menú con ID: ${id}`);
    return this.http.put(`${this.apiUrl}/${id}`, item, this.httpOptions)  // Cambiar a ClProducto
      .pipe(
        tap(_ => console.log(`Item actualizado con ID: ${id}`)),
        catchError(this.handleError<any>('updateMenuItem'))
      );
  }

  // Eliminar un item del menú
  deleteMenuItem(id: number): Observable<ClProducto> {  // Cambiar a ClProducto
    console.log(`Eliminando item del menú con ID: ${id}`);
    return this.http.delete<ClProducto>(`${this.apiUrl}/${id}`, this.httpOptions)  // Cambiar a ClProducto
      .pipe(
        tap(_ => console.log(`Item eliminado con ID: ${id}`)),
        catchError(this.handleError<ClProducto>('deleteMenuItem'))  // Cambiar a ClProducto
      );
  }
}
