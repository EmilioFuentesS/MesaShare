import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, from, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ClMesero } from './model/ClMesero'; // Modelo de Mesero
import { SQLiteService } from '../SQLite/sqlite.service'; // Servicio SQLite

@Injectable({
  providedIn: 'root'
})
export class QrService {
  private apiUrl = 'http://192.168.154.190:3000/meseros'; // URL del JSON-server para los meseros
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  private meserosSubject = new BehaviorSubject<ClMesero[]>([]); // BehaviorSubject para los meseros
  private operacionesPendientes: any[] = []; // Cola de operaciones pendientes para sincronización

  constructor(private http: HttpClient, private sqliteService: SQLiteService) {
    this.cargarMeseros(); // Cargar meseros al iniciar
    this.listenForOnline(); // Escuchar cambios en la conectividad
  }

  // Manejo de errores
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} falló:`, error);
      return of(result as T); // Retornar un resultado vacío para no detener la ejecución
    };
  }

  // Obtener meseros como observable
  getMeserosObservable(): Observable<ClMesero[]> {
    return this.meserosSubject.asObservable();
  }

  // Cargar meseros desde SQLite y luego sincronizar con la API
  cargarMeseros() {
    from(this.sqliteService.getMeseros()).pipe(
      tap((itemsSQLite) => {
        console.log('Meseros obtenidos de SQLite:', itemsSQLite);
        this.meserosSubject.next(itemsSQLite); // Mostrar solo los meseros de SQLite en la interfaz

        // Si hay conexión, sincronizar con la API
        if (navigator.onLine) {
          this.syncMeserosConAPI();
        } else {
          console.warn('Sin conexión a la API. Usando solo datos de SQLite.');
        }
      }),
      catchError(this.handleError('cargarMeseros', []))
    ).subscribe();
  }

  // Sincronizar meseros entre la API y SQLite
  public syncMeserosConAPI() {
    this.http.get<ClMesero[]>(this.apiUrl).pipe(
      tap(async (itemsAPI) => {
        console.log('Meseros obtenidos desde la API:', itemsAPI);
        await this.syncMeserosWithSQLite(itemsAPI);

        // Actualizar el observable con los meseros sincronizados
        const meserosActualizados = await this.sqliteService.getMeseros();
        this.meserosSubject.next(meserosActualizados);
      }),
      catchError(this.handleError('syncMeserosConAPI', []))
    ).subscribe();
  }

  // Sincronizar meseros con SQLite verificando si han cambiado
  public async syncMeserosWithSQLite(items: ClMesero[]): Promise<void> {
    try {
      for (const item of items) {
        const meseroSQLite = await this.sqliteService.getMeseroByNombre(item.nombre);

        if (!meseroSQLite) {
          await this.sqliteService.addMesero(item.nombre, item.qrCode, item.texto);
          console.log(`Mesero agregado a SQLite: ${item.nombre}`);
        } else {
          // Actualización en caso de que haya diferencias
          await this.sqliteService.updateMesero(meseroSQLite.id, item.nombre, item.qrCode, item.texto);
          console.log(`Mesero en SQLite ya está actualizado: ${item.nombre}`);
        }
      }
    } catch (error) {
      console.error('Error al sincronizar meseros con SQLite:', error);
    }
  }

  // Agregar mesero a SQLite y API (si está en línea)
  addMesero(mesero: ClMesero): Observable<ClMesero> {
    return new Observable<ClMesero>(observer => {
      this.sqliteService.addMesero(mesero.nombre, mesero.qrCode, mesero.texto).then(() => {
        console.log('Mesero agregado a SQLite');
        if (navigator.onLine) {
          this.syncWithAPI(mesero, 'POST');
        } else {
          this.operacionesPendientes.push({ tipo: 'POST', mesero });
        }
        observer.next(mesero);
      }).catch(err => observer.error(err));
    });
  }

  // Actualizar mesero en SQLite y API (si está en línea)
  updateMesero(mesero: ClMesero): Observable<ClMesero> {
    return new Observable(observer => {
      this.sqliteService.updateMesero(mesero.id, mesero.nombre, mesero.qrCode, mesero.texto).then(() => {
        console.log('Mesero actualizado en SQLite');
        if (navigator.onLine) {
          this.syncWithAPI(mesero, 'PUT');
        } else {
          this.operacionesPendientes.push({ tipo: 'PUT', mesero });
        }
        observer.next(mesero);
      }).catch(err => observer.error(err));
    });
  }

  deleteMesero(id: number): Observable<void> {
    return new Observable(observer => {
      // Eliminar primero el mesero en SQLite
      this.sqliteService.deleteMesero(id).then(() => {
        console.log(`Mesero eliminado de SQLite con ID: ${id}`);
        
        // Verificar si hay conexión a Internet
        if (navigator.onLine) {
          // Si hay conexión, eliminar también de la API
          this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
            tap(() => {
              console.log(`Mesero eliminado en la API con ID: ${id}`);
              observer.next(); // Notificar que la eliminación fue exitosa
              observer.complete(); // Completar el observable
            }),
            catchError((error) => {
              console.error('Error al eliminar mesero de la API:', error);
              observer.error(error); // Propagar el error al observador
              return of(); // Asegúrate de devolver un observable vacío para evitar fallos
            })
          ).subscribe();
        } else {
          // Si no hay conexión, añadir a las operaciones pendientes
          this.operacionesPendientes.push({ tipo: 'DELETE', id });
          console.warn('Sin conexión a Internet. La eliminación se sincronizará más tarde.');
          observer.next(); // Notificar que la operación fue exitosa en SQLite
          observer.complete(); // Completar el observable
        }
      }).catch(err => {
        console.error('Error al eliminar mesero en SQLite:', err);
        observer.error(err); // Propagar el error si ocurre en SQLite
      });
    });
  }
  
  


  // Sincronizar las operaciones CRUD con la API cuando haya conexión
  private syncWithAPI(mesero: ClMesero | { id: number }, method: string) {
    if (method === 'POST') {
      this.http.post<ClMesero>(this.apiUrl, mesero, this.httpOptions).pipe(
        tap(() => console.log('Mesero sincronizado con la API')),
        catchError(this.handleError<ClMesero>('addMesero'))
      ).subscribe();
    } else if (method === 'PUT') {
      this.http.put(`${this.apiUrl}/${mesero.id}`, mesero, this.httpOptions).pipe(
        tap(() => console.log(`Mesero ${mesero.id} actualizado en la API`)),
        catchError(this.handleError<ClMesero>('updateMesero'))
      ).subscribe();
    } else if (method === 'DELETE') {
      this.http.delete<void>(`${this.apiUrl}/${mesero.id}`, this.httpOptions).pipe(
        tap(() => console.log(`Mesero ${mesero.id} eliminado en la API`)),
        catchError(this.handleError<void>('deleteMesero'))
      ).subscribe();
    }
  }

  listenForOnline() {
    window.addEventListener('online', async () => {
      console.log('Conexión a Internet recuperada. Sincronizando operaciones pendientes...');
      await this.syncOperacionesPendientes(); // Intentar sincronizar cuando vuelve la conexión
    });
  }
  
  queueDeleteOperation(meseroId: number) {
    this.operacionesPendientes.push({ tipo: 'DELETE', id: meseroId });
    this.listenForOnline(); // Iniciar la escucha de cuando vuelva la conexión
  }
  

// Sincronizar las operaciones pendientes cuando se recupere la conexión
private async syncOperacionesPendientes() {
  try {
    for (const operacion of this.operacionesPendientes) {
      if (operacion.tipo === 'POST') {
        await this.addMesero(operacion.mesero).toPromise();
        console.log('Mesero añadido correctamente después de reconexión');
      } else if (operacion.tipo === 'PUT') {
        await this.updateMesero(operacion.mesero).toPromise();
        console.log('Mesero actualizado correctamente después de reconexión');
      } else if (operacion.tipo === 'DELETE') {
        await this.deleteMesero(operacion.id).toPromise();
        console.log(`Mesero con ID ${operacion.id} eliminado correctamente después de reconexión`);
      }
    }
    // Limpiar la cola de operaciones pendientes una vez sincronizado
    this.operacionesPendientes = [];
  } catch (error) {
    console.error('Error al sincronizar operaciones pendientes:', error);
    // Podrías agregar manejo de errores adicional, como reintentos, si lo necesitas
  }
}

  // Obtener un mesero por ID desde SQLite o API
  getMesero(id: number): Observable<ClMesero> {
    return new Observable<ClMesero>(observer => {
      this.sqliteService.getMeseroById(id).then(mesero => {
        if (mesero) {
          console.log('Mesero obtenido desde SQLite');
          observer.next(mesero);
        } else if (navigator.onLine) {
          this.http.get<ClMesero>(`${this.apiUrl}/${id}`).pipe(
            tap(async (meseroFromAPI) => {
              console.log('Mesero obtenido desde la API:', meseroFromAPI);
              await this.sqliteService.addMesero(meseroFromAPI.nombre, meseroFromAPI.qrCode, meseroFromAPI.texto);
              observer.next(meseroFromAPI);
            }),
            catchError(this.handleError<ClMesero>(`getMesero id=${id}`))
          ).subscribe();
        }
      }).catch(err => observer.error(err));
    });
  }


 // Método para obtener un mesero desde la API por el campo 'texto'
 getMeseroByTexto(texto: string): Observable<ClMesero | undefined> {
  return this.http.get<ClMesero[]>(`${this.apiUrl}?texto=${texto}`, this.httpOptions).pipe(
    map((meseros: ClMesero[]) => {
      // Verificar si el resultado contiene al menos un mesero
      if (meseros.length > 0) {
        return meseros[0]; // Retorna el primer mesero encontrado
      } else {
        return undefined; // Retorna undefined si no hay coincidencias
      }
    }),
    catchError(this.handleError<ClMesero | undefined>('getMeseroByTexto', undefined))
  );
}
}