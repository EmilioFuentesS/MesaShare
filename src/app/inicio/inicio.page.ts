import { Component } from '@angular/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage {
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

  constructor() {}

  generarPersonas() {
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
      // Añadir el ítem al pedido de la persona seleccionada
      if (!this.pedidos[this.personaSeleccionada]) {
        this.pedidos[this.personaSeleccionada] = [];
      }
      this.pedidos[this.personaSeleccionada].push(item);

      // Eliminar el ítem del menú
      this.menuItems = this.menuItems.filter(menuItem => menuItem.nombre !== item.nombre);
    }
  }

  vaciarPedido(persona: string) {
    if (this.pedidos[persona]) {
      // Restaurar los ítems al menú
      this.pedidos[persona].forEach(item => {
        if (!this.menuItems.some(menuItem => menuItem.nombre === item.nombre)) {
          this.menuItems.push(item);
        }
      });

      // Vaciar el pedido de la persona
      this.pedidos[persona] = [];
    }
  }

  todoAsignado(): boolean {
    // Verifica si todos los ítems han sido seleccionados
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
