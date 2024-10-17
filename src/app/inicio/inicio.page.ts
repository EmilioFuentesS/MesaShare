import { Component, OnInit, ViewChild } from '@angular/core';
import { IonMenu } from '@ionic/angular';
import { Router } from '@angular/router';
import { ClMenuItem, MesaAPIService } from '../services/ProductosAPI/mesa-api.service'; // Asegúrate de usar la ruta correcta
import { SQLiteService } from '../services/SQLite/sqlite.service';
import { UserService } from '../services/UsuariosAPI/user.service'; // Servicio de usuarios
import { AlertController, LoadingController } from '@ionic/angular';
import { ClProducto } from '../services/ProductosAPI/model/ClProducto';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {
  @ViewChild(IonMenu) menu?: IonMenu;

  numPersonas: number = 0;
  personas: string[] = [];
  menuItems: any[] = [];
  todosLosItems: any[] = [];
  pedidos: { [key: string]: any[] } = {};
  personaSeleccionada: string | null = null;
  username: string | null = null; // Nombre de usuario del que inició sesión

  constructor(
    private router: Router, 
    private alertController: AlertController, 
    private loadingController: LoadingController, 
    private userService: UserService, 
    private mesaAPIService: MesaAPIService, 
    private sqliteService: SQLiteService
  ) {}

  async ngOnInit() {
    // Inicializar la base de datos
    await this.sqliteService.initializeDB('my_database', 'mi_clave_secreta');
    
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.username = (navigation.extras.state as { username?: string }).username || null;
    }

    
  

    // Cargar los items del menú desde SQLite
    this.cargarMenuItems();
  }

  async cargarMenuItems() {
    const loading = await this.loadingController.create({
      message: 'Cargando menú...',
    });
    await loading.present();

    try {
      // Obtener productos desde SQLite
      const productosSQLite = await this.sqliteService.getProductos();

      if (productosSQLite.length > 0) {
        // Si hay datos en SQLite, duplicamos los productos según su cantidad
        this.menuItems = this.duplicarProductosPorCantidad(productosSQLite);
        this.todosLosItems = [...this.menuItems]; // Guardar una copia para no perder la lista original
        console.log('Productos cargados desde SQLite:', productosSQLite);
      } else {
        // Si SQLite está vacío, sincronizamos con la API
        if (navigator.onLine) {
          const productosAPI: ClMenuItem[] = (await this.mesaAPIService.getMenuItemsFromAPI().toPromise()) || [];
          if (productosAPI.length > 0) {
            this.menuItems = this.duplicarProductosPorCantidad(productosAPI);
            this.todosLosItems = [...this.menuItems]; // Guardar una copia para no perder la lista original

            // Guardar los productos de la API en SQLite para futuras cargas
            for (const producto of productosAPI) {
              await this.sqliteService.addProducto(producto.nombre, producto.precio, producto.cantidad);
            }
            console.log('Productos sincronizados desde la API y guardados en SQLite:', productosAPI);
          } else {
            console.warn('No se obtuvieron productos desde la API.');
          }
        } else {
          console.warn('Sin conexión a la API y no hay productos en SQLite.');
        }
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      await loading.dismiss();
    }
  }

// Duplicar los productos por cantidad, generando IDs numéricos únicos
duplicarProductosPorCantidad(productos: ClMenuItem[]): ClMenuItem[] {
  let productosDuplicados: ClMenuItem[] = [];

  productos.forEach(producto => {
    for (let i = 0; i < producto.cantidad; i++) {
      productosDuplicados.push({ 
        ...producto, 
        id: ClProducto.generateNewId() // Asignar un ID numérico único usando el método de la clase
      });
    }
  });

  return productosDuplicados;
}


  ionViewWillEnter() {
    // Cierra el menú cuando entras a la página de inicio
    if (this.menu) {
      this.menu.close();
    }
  }

  // Función para aumentar el número de personas
  aumentarPersonas() {
    this.numPersonas++;
    this.actualizarPersonas();
  }

  // Función para disminuir el número de personas
  disminuirPersonas() {
    if (this.numPersonas > 0) {
      this.numPersonas--;
      this.actualizarPersonas();
    }
  }

  // Función para actualizar la lista de personas cuando el número cambia
  actualizarPersonas() {
    this.personas = [];
    this.pedidos = {};
    for (let i = 1; i <= this.numPersonas; i++) {
      const persona = `Persona ${i}`;
      this.personas.push(persona);
      this.pedidos[persona] = [];
    }
    this.personaSeleccionada = null;
    this.menuItems = [...this.todosLosItems];
  }

  seleccionarPersona(persona: string) {
    this.personaSeleccionada = persona;
  }

  seleccionarItem(item: { nombre: string; precio: number, id: string }) {
    if (this.personaSeleccionada) {
      if (!this.pedidos[this.personaSeleccionada]) {
        this.pedidos[this.personaSeleccionada] = [];
      }
      this.pedidos[this.personaSeleccionada].push(item);
      this.menuItems = this.menuItems.filter((menuItem) => menuItem.id !== item.id); // Filtrar por ID único
    }
  }

  vaciarPedido(persona: string) {
    if (this.pedidos[persona]) {
      this.pedidos[persona].forEach((item) => {
        if (!this.menuItems.some((menuItem) => menuItem.id === item.id)) {
          this.menuItems.push(item);
        }
      });
      this.pedidos[persona] = [];
    }
  }

  todoAsignado(): boolean {
    return this.menuItems.length === 0;
  }

  avanzar() {
    if (this.todoAsignado()) {
      console.log('Avanzar a la siguiente pantalla');
    } else {
      console.log('No todos los ítems del menú han sido seleccionados.');
    }
  }

  // Método para cerrar sesión
  async logout() {
    const loading = await this.loadingController.create({
      message: 'Cerrando sesión...',
    });
    await loading.present();

    try {
      await this.userService.logoutUser(); // Llama al método de logout
      await loading.dismiss();
      this.router.navigate(['/login']); // Redirigir al login después de cerrar sesión
      this.presentAlert('Sesión cerrada', 'Has cerrado sesión correctamente.');
    } catch (error) {
      await loading.dismiss();
      console.error('Error al cerrar sesión:', error);
      this.presentAlert('Error', 'Hubo un problema al cerrar sesión.');
    }
  }

  // Método para mostrar alertas
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
