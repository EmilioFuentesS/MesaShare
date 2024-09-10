import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
})
export class RecuperarPage {
  recuperarForm: FormGroup;
  presentingElement: any = null;

  constructor(private fb: FormBuilder) {
    this.recuperarForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
  }

  // Método para enviar el formulario
  onSubmit() {
    if (this.recuperarForm.valid) {
      const { email } = this.recuperarForm.value;
      console.log('Correo para recuperar contraseña enviado a:', email);

      // Aquí se abrirá automáticamente el modal con el trigger de Ionic.
    }
  }
}
