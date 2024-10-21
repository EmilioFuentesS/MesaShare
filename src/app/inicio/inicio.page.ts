import { Component, OnInit, ViewChild } from '@angular/core';
import { IonMenu } from '@ionic/angular';
import { Router } from '@angular/router';
import { MesaAPIService } from '../services/ProductosAPI/mesa-api.service'; // Asegúrate de usar la ruta correcta
import { SQLiteService } from '../services/SQLite/sqlite.service';
import { UserService } from '../services/UsuariosAPI/user.service'; // Servicio de usuarios
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ClProducto } from '../services/ProductosAPI/model/ClProducto';
import jsPDF from 'jspdf';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';


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
    private sqliteService: SQLiteService,
    private toastController: ToastController,
   
  ) {}

  async ngOnInit() {
    // Inicializar la base de datos
    await this.sqliteService.initializeDB('my_database', 'mi_clave_secreta');
      
    // Obtener el nombre del usuario desde SQLite (el usuario activo)
  const user = await this.sqliteService.getActiveUser();
  if (user && user.username) {
    this.username = user.username; // Interpolation to greet the user
  } else {
    // Si no se encuentra el usuario, redirigir al login
    this.router.navigate(['/login']);
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
          const productosAPI: ClProducto[] = (await this.mesaAPIService.getMenuItemsFromAPI().toPromise()) || [];
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
duplicarProductosPorCantidad(productos: ClProducto[]): ClProducto[] {
  let productosDuplicados: ClProducto[] = [];

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

  // Método para calcular el total de los pedidos de una persona
calcularTotal(pedidos: any[]): number {
  return pedidos.reduce((total, pedido) => total + pedido.precio, 0);
}

// Método para calcular el total global de todos los pedidos
calcularTotalGlobal(): number {
  let total = 0;

  // Iterar sobre cada persona y sumar sus pedidos
  for (const persona of this.personas) {
    const pedidosDePersona = this.pedidos[persona];
    if (pedidosDePersona) {
      pedidosDePersona.forEach(pedido => {
        total += pedido.precio; // Sumar el precio de cada pedido
      });
    }
  }

  return total; // Retornar el total acumulado
}
// Método para realizar el pago
async realizarPago() {
  if (this.personaSeleccionada) { // Verificar que hay una persona seleccionada
    const totalAPagar = this.calcularTotal(this.pedidos[this.personaSeleccionada]);
    
    if (totalAPagar > 0) {
      // Mostrar un mensaje de confirmación de pago realizado
      const toast = await this.toastController.create({
        message: `Pago realizado por un total de $${totalAPagar}`,
        duration: 2000, // Duración en milisegundos
        color: 'success', // Color del toast
      });
      await toast.present();

      // Aquí podrías realizar otras acciones, como limpiar pedidos o redirigir a otra página
    } else {
      console.warn('No hay productos seleccionados para pagar.');
    }
  } else {
    console.warn('No hay persona seleccionada para realizar el pago.');
  }
}

async pagarPorPersona(persona: string) {
  // Verificar si la persona tiene productos para pagar
  if (persona && this.pedidos[persona] && this.pedidos[persona].length > 0) {
    // Calcular el total a pagar
    const totalAPagar = this.calcularTotal(this.pedidos[persona]);

    if (totalAPagar > 0) {
      // Procesar el pago (puedes agregar integración con un sistema de pago aquí)
      console.log(`Procesando pago de $${totalAPagar} para ${persona}`);

      // Mostrar el toast de confirmación del pago
      const toast = await this.toastController.create({
        message: `Pago realizado por un total de $${totalAPagar}`,
        duration: 2000, // Duración en milisegundos
        color: 'success', // Color del toast
      });
      await toast.present();

      // Vaciar los pedidos de la persona después del pago
      this.vaciarPedido(persona);

    } else {
      // Mostrar un mensaje si el total es 0
      const toast = await this.toastController.create({
        message: 'El total a pagar es 0, no se puede procesar el pago.',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
    }
  } else {
    // Mostrar advertencia si no hay productos seleccionados para pagar
    const toast = await this.toastController.create({
      message: 'No hay productos seleccionados para pagar.',
      duration: 2000,
      color: 'warning',
    });
    await toast.present();
    console.warn('No hay productos seleccionados para pagar.');
  }
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

  async generarBoletaPDF() {
    const doc = new jsPDF();
    const total = this.calcularTotalGlobal();
    
    try {
      // Obtener imagen en base64 (optimizar esta parte)
      const logoImg = 'assets/icon/favicon.png'; 
      const imgData = await this.getBase64ImageFromURL(logoImg);
      
      // Agregar imagen al PDF
      if (imgData) {
        doc.addImage(imgData, 'PNG', 10, 10, 40, 40);
      }
      
      // Título de la boleta
      doc.setFontSize(18);
      doc.text('MesaShare - Boleta de Compra', 60, 20);
      doc.setFontSize(12);
      
      // Información de cliente y fecha
      doc.text(`Cliente: ${this.username}`, 10, 60);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 70);
      
      // Añadir productos
      let yPosition = 90;
      doc.setFontSize(14);
      doc.text('Detalle de Productos:', 10, yPosition);
      yPosition += 10;
  
      this.personas.forEach(persona => {
        if (this.pedidos[persona] && this.pedidos[persona].length > 0) {
          doc.setFontSize(12);
          doc.text(`Pedidos de ${persona}`, 10, yPosition);
          yPosition += 10;
          this.pedidos[persona].forEach((pedido, index) => {
            doc.text(`${index + 1}. ${pedido.nombre} - $${pedido.precio}`, 10, yPosition);
            yPosition += 10;
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 10;
            }
          });
        }
      });
  
      // Añadir total
      doc.setFontSize(16);
      doc.text(`Total a Pagar: $${total}`, 10, yPosition + 10);
  
      // Guardar el PDF en el sistema de archivos del dispositivo
      const pdfBlob = doc.output('blob');
      const base64PDF = await this.blobToBase64(pdfBlob);
  
      const savedFile = await Filesystem.writeFile({
        path: `boleta_${new Date().getTime()}.pdf`,
        data: base64PDF,
        directory: Directory.Documents,
      });
  
      console.log('Archivo PDF guardado:', savedFile.uri);
  
      // Abrir el PDF
      await this.openFile(savedFile.uri);
  
    } catch (error) {
      console.error('Error al generar el PDF:', error);
    }
  }
  
  // Método para convertir Blob a base64
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  // Método para abrir el archivo PDF
  async openFile(fileUri: string) {
    try {
      await Share.share({
        title: 'Boleta PDF',
        text: 'Aquí está la boleta de tu compra.',
        url: fileUri,
        dialogTitle: 'Compartir con',
      });
    } catch (error) {
      console.error('Error al abrir el archivo:', error);
    }
  }
  

  // Función para convertir una imagen a base64 desde una URL
  private getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous'); // Esto es importante
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = url;
    });
  }

}
