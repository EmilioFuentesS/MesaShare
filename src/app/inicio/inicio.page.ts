import { Component, OnInit, ViewChild } from '@angular/core';
import { IonMenu } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {
  @ViewChild(IonMenu) menu?: IonMenu;

  numPersonas: number = 0;
  personas: string[] = [];
  menuItems = [
    { nombre: 'Pizza', precio: 15000 },
    { nombre: 'Pasta', precio: 12000 },
    { nombre: 'Ensalada', precio: 7000 },
    { nombre: 'Hamburguesa', precio: 9000 },
    { nombre: 'Tacos', precio: 8500 },
    { nombre: 'Sushi', precio: 18000 },
    { nombre: 'Ramen', precio: 13000 },
    { nombre: 'Empanadas', precio: 5000 },
    { nombre: 'Sandwich', precio: 6000 },
    { nombre: 'Helado', precio: 4000 }
  ];
  todosLosItems: any[] = [...this.menuItems];
  pedidos: { [key: string]: any[] } = {};
  personaSeleccionada: string | null = null;
  username: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // Acceder al estado de navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.username = (navigation.extras.state as { username?: string }).username || null;
      console.log('Username received:', this.username);
    }
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
      this.menuItems = this.menuItems.filter(menuItem => menuItem.nombre !== item.nombre);
    }
  }

  vaciarPedido(persona: string) {
    if (this.pedidos[persona]) {
      this.pedidos[persona].forEach(item => {
        if (!this.menuItems.some(menuItem => menuItem.nombre === item.nombre)) {
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
