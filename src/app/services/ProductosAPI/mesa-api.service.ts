import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, from, firstValueFrom } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { SQLiteService } from '../SQLite/sqlite.service'; // Servicio SQLite

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
  private apiUrl = 'http://192.168.182.190:3000/productos'; // URL del JSON-server desde el emulador
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  private productosSubject = new BehaviorSubject<ClMenuItem[]>([]); // BehaviorSubject para los productos

  constructor(private http: HttpClient, private sqliteService: SQLiteService) {
    this.cargarProductos(); // Cargar productos al iniciar

    // Escuchar cuando se restaure la conexión y sincronizar
    window.addEventListener('online', () => {
      console.log('Conexión a Internet restaurada. Intentando sincronizar...');
      this.syncWithAPI();
    });
  }

  // Manejo de errores
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`Error en ${operation}:`, error);
      return of(result as T); // Retorna un valor vacío para mantener el flujo de la app
    };
  }

  // Observable para productos
  getProductosObservable(): Observable<ClMenuItem[]> {
    return this.productosSubject.asObservable();
  }

  // Cargar productos desde SQLite y luego sincronizar con la API
  cargarProductos() {
    from(this.sqliteService.getProductos()).pipe(
      tap((itemsSQLite) => {
        console.log('Items obtenidos de SQLite:', itemsSQLite);
        this.productosSubject.next(itemsSQLite); // Mostrar solo los productos de SQLite en la interfaz

        // Si hay conexión, sincronizar con la API
        if (navigator.onLine) {
          this.syncWithAPI();
        } else {
          console.warn('Sin conexión a la API. Usando solo datos de SQLite.');
        }
      }),
      catchError(this.handleError('cargarProductos', []))
    ).subscribe();
  }

  // Sincronizar productos entre la API y SQLite bidireccionalmente
  public syncWithAPI() {
    this.http.get<ClMenuItem[]>(this.apiUrl).pipe(
      tap(async (itemsAPI) => {
        console.log('Items obtenidos desde la API:', itemsAPI);

        // Sincronizar los productos de la API con SQLite
        await this.syncProductosWithSQLite(itemsAPI);

        // Obtener productos desde SQLite y sincronizar de vuelta a la API
        const productosSQLite = await this.sqliteService.getProductos();
        for (const producto of productosSQLite) {
          const existsInAPI = itemsAPI.some(item => item.nombre === producto.nombre);
          if (!existsInAPI) {
            await firstValueFrom(this.addMenuItem(producto));
            console.log(`Producto ${producto.nombre} sincronizado con la API.`);
          }
        }

        // Actualizar el observable con los productos sincronizados
        const productosActualizados = await this.sqliteService.getProductos();
        this.productosSubject.next(productosActualizados);
      }),
      catchError(this.handleError('syncWithAPI', []))
    ).subscribe();
  }

  // Sincronizar productos con SQLite verificando si han cambiado
  public async syncProductosWithSQLite(items: ClMenuItem[]): Promise<void> {
    try {
      for (const item of items) {
        const productoSQLite = await this.sqliteService.getProductoByNombre(item.nombre);
        
        // Si el producto no existe en SQLite, lo agregamos
        if (!productoSQLite) {
          await this.sqliteService.addProducto(item.nombre, item.precio, item.cantidad);
          console.log(`Producto agregado a SQLite: ${item.nombre}`);
        } else {
          // Si el producto ya existe, verificamos si el precio o cantidad han cambiado
          if (productoSQLite.precio !== item.precio || productoSQLite.cantidad !== item.cantidad) {
            await this.sqliteService.updateProducto(productoSQLite.id, item.nombre, item.precio, item.cantidad);
            console.log(`Producto actualizado en SQLite: ${item.nombre}`);
          } else {
            console.log(`Producto en SQLite ya está actualizado: ${item.nombre}`);
          }
        }
      }
      console.log('Sincronización de productos con SQLite completada.');
    } catch (error) {
      console.error('Error al sincronizar productos con SQLite:', error);
    }
  }

  // Agregar producto (SQLite + API si está en línea)
  addMenuItem(producto: ClMenuItem): Observable<ClMenuItem> {
    return new Observable<ClMenuItem>(observer => {
      this.sqliteService.addProducto(producto.nombre, producto.precio, producto.cantidad).then(() => {
        console.log('Producto agregado a SQLite');
        if (navigator.onLine) {
          this.http.get<ClMenuItem[]>(`${this.apiUrl}?nombre=${producto.nombre}`).pipe(
            switchMap((productos) => {
              if (productos.length === 0) {
                return this.http.post<ClMenuItem>(this.apiUrl, producto, this.httpOptions);
              } else {
                console.log('Producto ya existe en la API.');
                return of(productos[0]);
              }
            }),
            tap((newProducto) => observer.next(newProducto)),
            catchError(this.handleError('addMenuItem', producto))
          ).subscribe();
        } else {
          observer.next(producto);
        }
      }).catch(err => observer.error(err));
    });
  }

  // Actualizar producto (SQLite + API si está en línea)
  updateMenuItem(id: number, item: ClMenuItem): Observable<ClMenuItem> {
    return new Observable(observer => {
      this.sqliteService.updateProducto(id, item.nombre, item.precio, item.cantidad).then(() => {
        console.log('Producto actualizado en SQLite');
        if (navigator.onLine) {
          this.http.put<ClMenuItem>(`${this.apiUrl}/${id}`, item, this.httpOptions).pipe(
            tap(() => observer.next(item)),
            catchError(this.handleError('updateMenuItem', item))
          ).subscribe();
        } else {
          observer.next(item);
        }
      }).catch(error => observer.error(error));
    });
  }

  // Eliminar producto (SQLite + API si está en línea)
  deleteMenuItem(id: number): Observable<void> {
    return new Observable(observer => {
      this.sqliteService.deleteProducto(id).then(() => {
        console.log(`Producto eliminado de SQLite con ID: ${id}`);
        if (navigator.onLine) {
          this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
            tap(() => observer.next()),
            catchError(this.handleError('deleteMenuItem'))
          ).subscribe();
        } else {
          observer.next();
        }
      }).catch(error => observer.error(error));
    });
  }

  // Obtener productos solo desde la API
  getMenuItemsFromAPI(): Observable<ClMenuItem[]> {
    return this.http.get<ClMenuItem[]>(this.apiUrl).pipe(
      tap((productosAPI) => console.log('Productos obtenidos desde la API:', productosAPI)),
      catchError(this.handleError<ClMenuItem[]>('getMenuItemsFromAPI', []))
    );
  }
}
