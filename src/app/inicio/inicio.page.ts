import { Component, OnInit, ViewChild } from '@angular/core';
import { IonMenu } from '@ionic/angular';
import { Router } from '@angular/router';
import { MesaAPIService } from '../services/MesaAPI/mesa-api.service'; // Asegúrate de usar la ruta correcta
import { SQLiteService } from '../services/sqlite/sqlite.service';

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

  constructor(private router: Router, private mesaAPIService: MesaAPIService, private sqliteService: SQLiteService) {}

  ngOnInit() {
    
    // Acceder al estado de navegación para obtener el nombre de usuario
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.username = (navigation.extras.state as { username?: string }).username || null;
      console.log('Username received:', this.username);
    }

    // Cargar los items del menú desde el servicio MesaAPI
    this.mesaAPIService.getMenuItems().subscribe((data) => {
      this.menuItems = data;
      this.todosLosItems = [...data];
    });
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

  seleccionarItem(item: { nombre: string; precio: number }) {
    if (this.personaSeleccionada) {
      if (!this.pedidos[this.personaSeleccionada]) {
        this.pedidos[this.personaSeleccionada] = [];
      }
      this.pedidos[this.personaSeleccionada].push(item);
      this.menuItems = this.menuItems.filter((menuItem) => menuItem.nombre !== item.nombre);
    }
  }

  vaciarPedido(persona: string) {
    if (this.pedidos[persona]) {
      this.pedidos[persona].forEach((item) => {
        if (!this.menuItems.some((menuItem) => menuItem.nombre === item.nombre)) {
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
}
