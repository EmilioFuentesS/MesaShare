import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteDBConnection, SQLiteConnection } from '@capacitor-community/sqlite';
import { isPlatform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SQLiteService {
  [x: string]: any;
  private sqliteConnection: SQLiteConnection;
   private db: SQLiteDBConnection | null = null;  // Inicializar como null
  private platform: string;
  private native: boolean = false;

  constructor() {
    this.platform = Capacitor.getPlatform();
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);

    // Verificar si es una plataforma nativa (Android o iOS)
    if (this.platform === 'ios' || this.platform === 'android') {
      this.native = true;
    }

    this.initializeDB();
  }

  
  async initializeDB() {
    if (this.native) {
      try {
        // Chequear consistencia de las conexiones
        const retCC = await this.sqliteConnection.checkConnectionsConsistency();
        const isConn = await this.sqliteConnection.isConnection('my_database', false); // se agregó false como el segundo argumento para readonly
  
        if (retCC && isConn) {
          // Recuperar la conexión si ya existe
          this.db = await this.sqliteConnection.retrieveConnection('my_database', false);
        } else {
          // Crear una nueva conexión si no existe
          this.db = await this.sqliteConnection.createConnection('my_database', false, 'no-encryption', 1, false);
        }
  
        // Abrir la base de datos
        await this.db.open();
        await this.createTables(); // Crear tablas si no existen
        console.log('Base de datos SQLite inicializada correctamente');
      } catch (error) {
        console.error('Error al inicializar la base de datos SQLite:', error);
      }
    } else {
      console.error('SQLite no está disponible en esta plataforma.');
    }
  }

  // Función para usar LocalStorage en el navegador como alternativa
  useLocalStorage() {
    console.log('Usando LocalStorage como almacenamiento en el navegador');
  }

  // Verifica si la base de datos está lista
  private async ensureDBReady() {
    if (this.native && !this.db) {
      console.error('No hay conexión con la base de datos SQLite.');
      return;
    }
  }

  // Crea las tablas en SQLite si la base de datos está disponible
  async createTables() {
    await this.ensureDBReady();
    if (this.db) {
      try {
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

        await this.db.execute(sqlCreateUsersTable);
        await this.db.execute(sqlCreateProductsTable);
        await this.db.execute(sqlCreateMeserosTable);
        console.log('Tablas creadas correctamente en SQLite');
      } catch (error) {
        console.error('Error al crear las tablas en SQLite:', error);
      }
    }
  }

  // Registro de un nuevo usuario en SQLite o LocalStorage (según el entorno)
  async registerUser(username: string, email: string, password: string) {
    await this.ensureDBReady(); // Asegúrate de que la base de datos esté lista
    if (this.db) {
      try {
        const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        const values = [username, email, password];
        await this.db.run(query, values);
        console.log('Usuario registrado en SQLite');
      } catch (error) {
        console.error('Error al registrar usuario en SQLite:', error);
      }
    } else if (isPlatform('desktop') || isPlatform('mobileweb')) {
      // Si está en la web, usa LocalStorage como alternativa
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      users.push({ username, email, password });
      localStorage.setItem('users', JSON.stringify(users));
      console.log('Usuario registrado en LocalStorage:', users);
    }
  }

  // Login de un usuario en SQLite o LocalStorage (según el entorno)
  async loginUser(username: string, password: string): Promise<any> {
    await this.ensureDBReady(); // Asegúrate de que la base de datos esté lista
    if (this.db) {
      const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
      const values = [username, password];
      const result = await this.db.query(query, values);
      if (result && result.values && result.values.length > 0) {
        console.log('Usuario encontrado en SQLite:', result.values[0]);
        return result.values[0];
      }
    } else if (isPlatform('desktop') || isPlatform('mobileweb')) {
      // Si está en la web, busca en LocalStorage
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      let user = users.find((u: any) => u.username === username && u.password === password);
      if (user) {
        console.log('Usuario encontrado en LocalStorage:', user);
        return user;
      }
    }
    console.log('Usuario no encontrado');
    return null;
  }

  // Función para eliminar un usuario
  async deleteUser(id: number) {
    await this.ensureDBReady();
    if (this.db) {
      const query = `DELETE FROM users WHERE id = ?`;
      const values = [id];
      try {
        await this.db.run(query, values);
        console.log('Usuario eliminado de SQLite');
      } catch (error) {
        console.error('Error al eliminar usuario en SQLite:', error);
      }
    } else if (isPlatform('desktop') || isPlatform('mobileweb')) {
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      users = users.filter((u: any) => u.id !== id);
      localStorage.setItem('users', JSON.stringify(users));
      console.log('Usuario eliminado en LocalStorage');
    }
  }

  // Actualiza el estado de sesión (activo o inactivo)
  async updateSesionData(user: any): Promise<void> {
    if (this.db) {
      const query = `UPDATE users SET active = ? WHERE id = ?`;
      const values = [user.active, user.id];
      await this.db.run(query, values);
      console.log('Estado de sesión actualizado en SQLite');
    }
  }

  // Funciones relacionadas con productos
  async addProducto(nombre: string, precio: number, cantidad: number) {
    if (this.db) {
      const query = `INSERT INTO productos (nombre, precio, cantidad, fecha) VALUES (?, ?, ?, ?)`;
      const values = [nombre, precio, cantidad, new Date().toISOString()];
      await this.db.run(query, values);
      console.log('Producto agregado');
    } else {
      console.log('Agregando producto usando almacenamiento en el navegador');
    }
  }

  async getProductos(): Promise<any[]> {
    if (this.db) {
      const query = `SELECT * FROM productos`;
      const result = await this.db.query(query);
      if (result && result.values) {
        return result.values;
      }
      return [];
    } else {
      console.log('Obteniendo productos usando almacenamiento en el navegador');
      return [];
    }
  }

  async updateProducto(id: number, nombre: string, precio: number, cantidad: number) {
    if (this.db) {
      const query = `UPDATE productos SET nombre = ?, precio = ?, cantidad = ? WHERE id = ?`;
      const values = [nombre, precio, cantidad, id];
      await this.db.run(query, values);
      console.log('Producto actualizado');
    } else {
      console.log('Actualizando producto usando almacenamiento en el navegador');
    }
  }

  async deleteProducto(id: number) {
    if (this.db) {
      const query = `DELETE FROM productos WHERE id = ?`;
      const values = [id];
      await this.db.run(query, values);
      console.log('Producto eliminado');
    } else {
      console.log('Eliminando producto usando almacenamiento en el navegador');
    }
  }

  // Funciones relacionadas con meseros
  async addMesero(nombre: string, qrCode: string, texto: string) {
    if (this.db) {
      const query = `INSERT INTO meseros (nombre, qr_code, texto, fecha) VALUES (?, ?, ?, ?)`;
      const values = [nombre, qrCode, texto, new Date().toISOString()];
      await this.db.run(query, values);
      console.log('Mesero agregado');
    } else {
      console.log('Agregando mesero usando almacenamiento en el navegador');
    }
  }

  async getMeseroByTexto(texto: string): Promise<any> {
    if (this.db) {
      const query = `SELECT * FROM meseros WHERE texto = ?`;
      const values = [texto];
      const result = await this.db.query(query, values);
      if (result && result.values && result.values.length > 0) {
        return result.values[0];
      }
      return null;
    } else {
      console.log('Obteniendo mesero usando almacenamiento en el navegador');
      return null;
    }
  }

  async getMeseros(): Promise<any[]> {
    if (this.db) {
      const query = `SELECT * FROM meseros`;
      const result = await this.db.query(query);
      if (result && result.values) {
        return result.values;
      }
      return [];
    } else {
      console.log('Obteniendo meseros usando almacenamiento en el navegador');
      return [];
    }
  }

  async deleteMesero(id: number) {
    if (this.db) {
      const query = `DELETE FROM meseros WHERE id = ?`;
      const values = [id];
      await this.db.run(query, values);
      console.log('Mesero eliminado');
    } else {
      console.log('Eliminando mesero usando almacenamiento en el navegador');
    }
  }

  // Función para actualizar un mesero
  async updateMesero(id: number, nombre: string, qrCode: string, texto: string) {
    if (this.db) {
      const query = `UPDATE meseros SET nombre = ?, qr_code = ?, texto = ? WHERE id = ?`;
      const values = [nombre, qrCode, texto, id];
      try {
        await this.db.run(query, values);
        console.log('Mesero actualizado');
      } catch (error) {
        console.error('Error al actualizar mesero:', error);
      }
    } else {
      console.log('Actualizando mesero usando almacenamiento en el navegador');
    }
  }
}
