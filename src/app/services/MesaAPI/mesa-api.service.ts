import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SQLiteService } from '../sqlite/sqlite.service'; // Servicio SQLite

export interface ClMenuItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class MesaAPIService {
  private apiUrl = 'http://localhost:3000/productos'; // URL de tu JSON-server
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  private productosSubject = new BehaviorSubject<ClMenuItem[]>([]); // BehaviorSubject para los productos

  constructor(private http: HttpClient, private sqliteService: SQLiteService) {
    this.getMenuItems().subscribe(); // Cargar los productos al iniciar
  }

 
  // Manejo de errores
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`Error en ${operation}:`, error);
      return of(result as T);
    };
  }

  // Observable para productos
  getProductosObservable(): Observable<ClMenuItem[]> {
    return this.productosSubject.asObservable();
  }

  // Obtener todos los items del menú desde la API y sincronizar con SQLite
  getMenuItems(): Observable<ClMenuItem[]> {
    return this.http.get<ClMenuItem[]>(this.apiUrl)
      .pipe(
        tap(async (items) => {
          console.log('Items obtenidos del menú:', items);
          this.productosSubject.next(items);

          // Sincronizar los productos obtenidos desde la API con SQLite
          for (const item of items) {
            try {
              await this.sqliteService.addProducto(item.nombre, item.precio, item.cantidad);
              console.log(`Producto sincronizado a SQLite: ${item.nombre}`);
            } catch (error) {
              console.error('Error al sincronizar producto con SQLite:', error);
            }
          }
        }),
        catchError(this.handleError<ClMenuItem[]>('getMenuItems', []))
      );
  }

  // Agregar un nuevo item al menú
  addMenuItem(item: ClMenuItem): Observable<ClMenuItem> {
    return this.http.post<ClMenuItem>(this.apiUrl, item, this.httpOptions)
      .pipe(
        tap(async (newItem: ClMenuItem) => {
          console.log('Item agregado:', newItem);
          this.getMenuItems().subscribe(); // Refrescar la lista de productos

          // Guardar en SQLite después de agregarlo a la API
          try {
            await this.sqliteService.addProducto(newItem.nombre, newItem.precio, newItem.cantidad);
            console.log(`Producto sincronizado a SQLite: ${newItem.nombre}`);
          } catch (error) {
            console.error('Error al agregar producto a SQLite:', error);
          }
        }),
        catchError(this.handleError<ClMenuItem>('addMenuItem'))
      );
  }

  // Obtener un item del menú por ID
  getMenuItem(id: number): Observable<ClMenuItem> {
    return this.http.get<ClMenuItem>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(item => console.log('Item obtenido:', item)),
        catchError(this.handleError<ClMenuItem>(`getMenuItem id=${id}`))
      );
  }

  // Actualizar un item del menú
  updateMenuItem(id: number, item: ClMenuItem): Observable<ClMenuItem> {
    return this.http.put<ClMenuItem>(`${this.apiUrl}/${id}`, item, this.httpOptions)
      .pipe(
        tap(async () => {
          console.log(`Item actualizado con ID: ${id}`);
          this.getMenuItems().subscribe(); // Refrescar la lista de productos

          // Actualizar en SQLite
          try {
            await this.sqliteService.updateProducto(id, item.nombre, item.precio, item.cantidad);
            console.log(`Producto actualizado en SQLite: ${item.nombre}`);
          } catch (error) {
            console.error('Error al actualizar producto en SQLite:', error);
          }
        }),
        catchError(this.handleError<any>('updateMenuItem'))
      );
  }

  // Eliminar un item del menú
  deleteMenuItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(
        tap(async () => {
          console.log(`Item eliminado con ID: ${id}`);
          this.getMenuItems().subscribe(); // Refrescar la lista de productos

          // Eliminar de SQLite
          try {
            await this.sqliteService.deleteProducto(id);
            console.log(`Producto eliminado de SQLite con ID: ${id}`);
          } catch (error) {
            console.error('Error al eliminar producto de SQLite:', error);
          }
        }),
        catchError(this.handleError<void>('deleteMenuItem'))
      );
  }
}
