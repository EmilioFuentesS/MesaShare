import { Injectable } from '@angular/core'; 
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteDBConnection, SQLiteConnection } from '@capacitor-community/sqlite';
import { isPlatform } from '@ionic/angular';
import { ClUser } from '../User/model/ClUser';
import { QrService } from '../qr-generator/qr.service';
import { MesaAPIService } from '../MesaAPI/mesa-api.service';
import { UserService } from '../User/user.service';
import { firstValueFrom } from 'rxjs';
import { ClMesero } from '../qr-generator/model/ClMesero';

@Injectable({
  providedIn: 'root'
})
export class SQLiteService {
  private sqliteConnection: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private platform: string;
  private native: boolean = false;

  constructor() {
    this.platform = Capacitor.getPlatform();
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);

    // Verificar si la plataforma es nativa (iOS o Android)
    if (isPlatform('ios') || isPlatform('android')) {
      this.native = true;
    }
  }

  // Inicializar la base de datos
  async initializeDB(dbname: string, db_key: string) {
    if (this.native) {
      await this.initializeNativeDB(dbname, db_key);
    } else {
      await this.initializeWebDB(dbname);
    }
  }

  // Inicializar la base de datos nativa (iOS/Android)
  private async initializeNativeDB(dbname: string, db_key: string) {
    try {
      const isConn = await this.sqliteConnection.isConnection(dbname, false);
      if (!isConn.result) {
        this.db = await this.sqliteConnection.createConnection(dbname, false, db_key, 1, false);
        await this.db.open();
        console.log(`Base de datos "${dbname}" inicializada correctamente`);

        // Crear las tablas
        await this.createTables();
      } else {
        this.db = await this.sqliteConnection.retrieveConnection(dbname, false);
        await this.db.open();
        console.log(`Conexión a la base de datos "${dbname}" recuperada`);
      }
    } catch (error) {
      console.error(`Error al inicializar la base de datos "${dbname}":`, error);
    }
  }

  // Inicializar la base de datos para la web
  private async initializeWebDB(dbname: string) {
    try {
      const jeepEl = document.querySelector('jeep-sqlite');
      if (!jeepEl) {
        throw new Error('El elemento jeep-sqlite no está presente en el DOM.');
      }

      // Espera a que el componente `jeep-sqlite` esté listo
      await customElements.whenDefined('jeep-sqlite');

      const isConn = await this.sqliteConnection.isConnection(dbname, false);
      if (!isConn.result) {
        this.db = await this.sqliteConnection.createConnection(dbname, false, 'no-encryption', 1, false);
        await this.db.open();
        console.log(`Base de datos "${dbname}" inicializada correctamente para la web`);

        // Crear las tablas
        await this.createTables();
      } else {
        this.db = await this.sqliteConnection.retrieveConnection(dbname, false);
        await this.db.open();
        console.log(`Conexión a la base de datos "${dbname}" recuperada para la web`);
      }
    } catch (error) {
      console.error(`Error al inicializar la base de datos en la web:`, error);
    }
  }

  // Verificar si la base de datos está lista
  private async ensureDBReady(): Promise<void> {
    if (this.native && !this.db) {
      console.error('No hay conexión disponible con la base de datos SQLite.');
      throw new Error('No hay conexión con la base de datos');
    }
  }

  // Crear o recrear las tablas en SQLite (eliminar y luego crear)
async createTables() {
  await this.ensureDBReady();
  if (this.db) {
    try {
      // Eliminar las tablas si ya existen
      const sqlDropUsersTable = `DROP TABLE IF EXISTS users;`;
      const sqlDropProductsTable = `DROP TABLE IF EXISTS productos;`;
      const sqlDropMeserosTable = `DROP TABLE IF EXISTS meseros;`;

      // Crear las tablas de nuevo
      const sqlCreateUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT,
          email TEXT,
          password TEXT,
          active INTEGER DEFAULT 0
        );
      `;
      const sqlCreateProductsTable = `
        CREATE TABLE IF NOT EXISTS productos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT,
          precio REAL,
          cantidad INTEGER,
          fecha TEXT
        );
      `;
      const sqlCreateMeserosTable = `
        CREATE TABLE IF NOT EXISTS meseros (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT,
          qr_code TEXT,
          texto TEXT,
          fecha TEXT
        );
      `;

      // Ejecutar las sentencias para eliminar y luego crear las tablas
      await this.db.execute(sqlDropUsersTable);
      await this.db.execute(sqlDropProductsTable);
      await this.db.execute(sqlDropMeserosTable);
      console.log('Tablas eliminadas correctamente si existían.');

      // Crear las nuevas tablas
      await this.db.execute(sqlCreateUsersTable);
      await this.db.execute(sqlCreateProductsTable);
      await this.db.execute(sqlCreateMeserosTable);
      console.log('Tablas users, productos y meseros creadas correctamente en SQLite');
    } catch (error) {
      console.error('Error al recrear las tablas en SQLite:', error);
    }
  }
}


  // Métodos para gestionar usuarios
  async registerUser(username: string, email: string, password: string) {
    await this.ensureDBReady();
    if (this.db) {
      try {
        const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?);`;
        const values = [username, email, password];
        await this.db.run(query, values);
        console.log('Usuario registrado en SQLite');
      } catch (error) {
        console.error('Error al registrar usuario en SQLite:', error);
      }
    }
  }

  async loginUser(username: string, password: string): Promise<any> {
    await this.ensureDBReady();
    if (this.db) {
      try {
        const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
        const values = [username, password];
        const result = await this.db.query(query, values);
        if (result && result.values && result.values.length > 0) {
          return result.values[0];  // Return user object from SQLite
        } else {
          console.log('Usuario no encontrado');
          return null;
        }
      } catch (error) {
        console.error('Error al iniciar sesión en SQLite:', error);
        return null;
      }
    }
  }

  async updateSesionData(user: ClUser): Promise<void> {
    await this.ensureDBReady();
    if (this.db) {
      try {
        const query = `UPDATE users SET username = ?, email = ?, password = ?, active = ? WHERE id = ?`;
        const values = [user.username, user.email, user.password, user.active, user.id];
        await this.db.run(query, values);
        console.log('Usuario actualizado en SQLite');
      } catch (error) {
        console.error('Error al actualizar usuario en SQLite:', error);
      }
    } else {
      console.error('No hay conexión a la base de datos SQLite.');
    }
  }

  async getUsers(): Promise<any[]> {
    await this.ensureDBReady();
    if (this.db) {
      try {
        const query = `SELECT * FROM users`;
        const result = await this.db.query(query);
        if (result && result.values) {
          return result.values;
        }
        return [];
      } catch (error) {
        console.error('Error al obtener usuarios en SQLite:', error);
        return [];
      }
    }
    return [];
  }

  async deleteUser(id: number) {
    await this.ensureDBReady();
    if (this.db) {
      try {
        const query = `DELETE FROM users WHERE id = ?`;
        const values = [id];
        await this.db.run(query, values);
        console.log('Usuario eliminado de SQLite');
      } catch (error) {
        console.error('Error al eliminar usuario en SQLite:', error);
      }
    }
  }

  // Sincronizar usuarios con la API
  async syncUsersWithAPI(userService: UserService): Promise<void> {
    const users = await this.getUsers();
    if (navigator.onLine) {
      for (const user of users) {
        try {
          await firstValueFrom(userService.registerUser(user));
          console.log(`Usuario ${user.username} sincronizado con la API`);
        } catch (error) {
          console.error(`Error al sincronizar usuario ${user.username} con la API:`, error);
        }
      }
    } else {
      console.warn("Sin conexión a Internet. Sincronización de usuarios pospuesta.");
    }
  }

  async logoutUser(): Promise<void> {
    await this.ensureDBReady();
    if (this.db) {
      try {
        const query = `UPDATE users SET active = 0 WHERE active = 1`; // Set all active users to inactive
        await this.db.run(query);
        console.log('Sesión cerrada en SQLite');
      } catch (error) {
        console.error('Error al cerrar sesión en SQLite:', error);
      }
    }
  }

// Método para agregar un producto a SQLite si no existe
async addProducto(nombre: string, precio: number, cantidad: number): Promise<void> {
  try {
    await this.ensureDBReady(); // Asegura que la DB esté lista
    if (!this.db) return;

    // Verificar si el producto ya existe
    const exists = await this.productoExists(nombre);
    if (exists) {
      console.log(`El producto '${nombre}' ya existe en SQLite, no se agregará de nuevo.`);
      return;
    }

    const query = `INSERT INTO productos (nombre, precio, cantidad) VALUES (?, ?, ?);`;
    const values = [nombre, precio, cantidad];

    await this.db.run(query, values);
    console.log('Producto insertado en SQLite.');
  } catch (error) {
    console.error('Error al insertar producto en SQLite:', error);
  }
}

// Obtener todos los productos desde SQLite
async getProductos(): Promise<any[]> {
  try {
    await this.ensureDBReady(); // Asegura que la DB esté lista
    if (!this.db) return [];

    const query = `SELECT * FROM productos;`;
    const result = await this.db.query(query);
    return result?.values ?? [];
  } catch (error) {
    console.error('Error al obtener productos en SQLite:', error);
    return [];
  }
}

// Obtener un producto por nombre en SQLite
async getProductoByNombre(nombre: string): Promise<any> {
  try {
    await this.ensureDBReady(); // Asegura que la DB esté lista
    if (!this.db) return null;

    const query = `SELECT * FROM productos WHERE nombre = ? LIMIT 1;`;
    const values = [nombre];
    const result = await this.db.query(query, values);
    
    return result?.values?.[0] ?? null;
  } catch (error) {
    console.error('Error al obtener producto por nombre en SQLite:', error);
    return null;
  }
}

// Verificar si un producto ya existe en SQLite por nombre
async productoExists(nombre: string): Promise<boolean> {
  try {
    await this.ensureDBReady(); // Asegura que la DB esté lista
    if (!this.db) return false;

    const query = `SELECT COUNT(*) as count FROM productos WHERE nombre = ?;`;
    const values = [nombre];
    const result = await this.db.query(query, values);

    return result?.values?.[0]?.count > 0;
  } catch (error) {
    console.error('Error al verificar si el producto existe en SQLite:', error);
    return false;
  }
}

// Actualizar un producto existente en SQLite solo si ha cambiado
async updateProducto(id: number, nombre: string, precio: number, cantidad: number): Promise<void> {
  try {
    await this.ensureDBReady(); // Asegura que la DB esté lista
    if (!this.db) return;

    const productoActual = await this.getProductoById(id); // Obtener producto por ID
    if (productoActual && (productoActual.nombre !== nombre || productoActual.precio !== precio || productoActual.cantidad !== cantidad)) {
      const query = `UPDATE productos SET nombre = ?, precio = ?, cantidad = ? WHERE id = ?;`;
      const values = [nombre, precio, cantidad, id];
      await this.db.run(query, values);
      console.log('Producto actualizado en SQLite.');
    } else {
      console.log('No hay cambios en el producto, no es necesario actualizar.');
    }
  } catch (error) {
    console.error('Error al actualizar producto en SQLite:', error);
  }
}

// Eliminar un producto de SQLite
async deleteProducto(id: number): Promise<void> {
  try {
    await this.ensureDBReady(); // Asegura que la DB esté lista
    if (!this.db) return;

    const query = `DELETE FROM productos WHERE id = ?;`;
    const values = [id];
    await this.db.run(query, values);
    console.log('Producto eliminado de SQLite.');
  } catch (error) {
    console.error('Error al eliminar producto en SQLite:', error);
  }
}

// Sincronizar productos entre SQLite y la API
async syncProductsWithAPI(mesaAPIService: MesaAPIService): Promise<void> {
  try {
    const productos = await this.getProductos(); // Obtener productos desde SQLite

    if (navigator.onLine) {
      // Obtener los productos desde la API
      const productosExistentes = await firstValueFrom(mesaAPIService.getMenuItemsFromAPI());

      for (const producto of productos) {
        try {
          // Verificar si el producto ya está en la API
          const existsInAPI = productosExistentes.some(item => item.nombre === producto.nombre);

          if (!existsInAPI) {
            // Si no existe en la API, agregarlo
            const response = await firstValueFrom(mesaAPIService.addMenuItem(producto));
            console.log(`Producto ${producto.nombre} sincronizado con la API`, response);
          } else {
            console.log(`Producto ${producto.nombre} ya existe en la API`);
          }
        } catch (error) {
          console.error(`Error al sincronizar producto ${producto.nombre} con la API:`, error);
        }
      }
    } else {
      console.warn("Sin conexión a Internet. Sincronización de productos pospuesta.");
    }
  } catch (error) {
    console.error("Error al obtener productos desde SQLite:", error);
  }
}

// Obtener producto por ID (para actualizar productos)
async getProductoById(id: number): Promise<any> {
  try {
    await this.ensureDBReady(); // Asegura que la DB esté lista
    if (!this.db) return null;

    const query = `SELECT * FROM productos WHERE id = ? LIMIT 1;`;
    const values = [id];
    const result = await this.db.query(query, values);

    return result?.values?.[0] ?? null;
  } catch (error) {
    console.error('Error al obtener producto por ID en SQLite:', error);
    return null;
  }
}



// Método para agregar un mesero a SQLite si no existe
async addMesero(nombre: string, qrCode: string, texto: string): Promise<void> {
  await this.ensureDBReady(); // Asegura que la base de datos esté inicializada
  if (this.db) {
    const exists = await this.meseroExists(nombre); // Verifica si el mesero ya existe
    if (!exists) {
      try {
        const query = `INSERT INTO meseros (nombre, qr_code, texto, fecha) VALUES (?, ?, ?, ?);`;
        const values = [nombre, qrCode, texto, new Date().toISOString()];
        await this.db.run(query, values);
        console.log('Mesero agregado en SQLite.');
      } catch (error) {
        console.error('Error al agregar mesero en SQLite:', error);
      }
    } else {
      console.log(`El mesero ${nombre} ya existe en SQLite.`);
    }
  }
}


async getMeseros(): Promise<ClMesero[]> {
  await this.ensureDBReady();
  if (this.db) {
    try {
      const query = `SELECT * FROM meseros;`;
      const result = await this.db.query(query);
      if (result && result.values) {
        return result.values.map((mesero: any) =>
          new ClMesero({
            id: mesero.id,
            nombre: mesero.nombre,
            qrCode: mesero.qr_code,
            texto: mesero.texto,
            fecha: mesero.fecha,
          })
        );
      }
      return [];
    } catch (error) {
      console.error('Error al obtener meseros en SQLite:', error);
      return [];
    }
  }
  return [];
}

// Obtener un mesero por 'texto' desde SQLite
async getMeseroByTexto(texto: string): Promise<ClMesero | null> {
  await this.ensureDBReady();
  if (this.db) {
    try {
      const query = `SELECT * FROM meseros WHERE texto = ?`;
      const values = [texto];
      const result = await this.db.query(query, values);
      if (result && result.values && result.values.length > 0) {
        const mesero = result.values[0];
        return new ClMesero({
          id: mesero.id,
          nombre: mesero.nombre,
          qrCode: mesero.qr_code,
          texto: mesero.texto,
          fecha: mesero.fecha,
        });
      } else {
        return null; // Si no se encuentra el mesero
      }
    } catch (error) {
      console.error('Error al obtener mesero por texto en SQLite:', error);
      return null;
    }
  }
  return null;
}

  async updateMesero(id: number, nombre: string, qrCode: string, texto: string): Promise<void> {
    await this.ensureDBReady();
    if (this.db) {
      try {
        const query = `UPDATE meseros SET nombre = ?, qr_code = ?, texto = ? WHERE id = ?`;
        const values = [nombre, qrCode, texto, id];
        await this.db.run(query, values);
        console.log('Mesero actualizado en SQLite.');
      } catch (error) {
        console.error('Error al actualizar mesero en SQLite:', error);
      }
    }
  }

  async deleteMesero(id: number): Promise<void> {
    await this.ensureDBReady();
    if (this.db) {
      try {
        const query = `DELETE FROM meseros WHERE id = ?;`;
        const values = [id];
        await this.db.run(query, values);
        console.log('Mesero eliminado de SQLite.');
      } catch (error) {
        console.error('Error al eliminar mesero en SQLite:', error);
      }
    }
  }

 // Verificar si un mesero ya existe en SQLite por nombre
async meseroExists(nombre: string): Promise<boolean> {
  await this.ensureDBReady();
  if (this.db) {
    try {
      const query = `SELECT COUNT(*) as count FROM meseros WHERE nombre = ?;`;
      const values = [nombre];
      const result = await this.db.query(query, values);
      if (result && result.values && result.values.length > 0) {
        return result.values[0].count > 0;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error al verificar si el mesero existe en SQLite:', error);
      return false;
    }
  }
  return false;
}
  
  // Sincronizar meseros con la API
  async syncMeserosWithAPI(qrService: QrService): Promise<void> {
    const meseros = await this.getMeseros();
    if (navigator.onLine) {
      for (const mesero of meseros) {
        try {
          await firstValueFrom(qrService.addMesero(mesero));
          console.log(`Mesero ${mesero.nombre} sincronizado con la API`);
        } catch (error) {
          console.error(`Error al sincronizar mesero ${mesero.nombre} con la API:`, error);
        }
      }
    } else {
      console.warn("Sin conexión a Internet. Sincronización de meseros pospuesta.");
    }
  }
  // Obtener un mesero por 'id' desde SQLite
async getMeseroById(id: number): Promise<ClMesero | null> {
  await this.ensureDBReady();
  if (this.db) {
    try {
      const query = `SELECT * FROM meseros WHERE id = ?`;
      const values = [id];
      const result = await this.db.query(query, values);
      if (result && result.values && result.values.length > 0) {
        const mesero = result.values[0];
        return new ClMesero({
          id: mesero.id,
          nombre: mesero.nombre,
          qrCode: mesero.qr_code,
          texto: mesero.texto,
          fecha: mesero.fecha,
        });
      } else {
        return null; // Si no se encuentra el mesero
      }
    } catch (error) {
      console.error('Error al obtener mesero por ID en SQLite:', error);
      return null;
    }
  }
  return null;
}

async getMeseroByNombre(nombre: string): Promise<ClMesero | null> {
  await this.ensureDBReady();
  if (this.db) {
    try {
      const query = `SELECT * FROM meseros WHERE nombre = ?`;
      const values = [nombre];
      const result = await this.db.query(query, values);
      if (result && result.values && result.values.length > 0) {
        const mesero = result.values[0];
        return new ClMesero({
          id: mesero.id,
          nombre: mesero.nombre,
          qrCode: mesero.qr_code,
          texto: mesero.texto,
          fecha: mesero.fecha,
        });
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener mesero por nombre en SQLite:', error);
      return null;
    }
  }
  return null;
}

  
  }
