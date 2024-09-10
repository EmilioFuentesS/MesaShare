import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registrar',
  templateUrl: './registrar.page.html',
  styleUrls: ['./registrar.page.scss'],
})
export class RegistrarPage {
  registrarForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registrarForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', [Validators.required]],
    }, { validator: this.passwordMatchValidator });
  }

  passwordValidator(control: any): { [key: string]: boolean } | null {
    const password = control.value;
    const regex = /^(?=.*[A-Z])(?=.*\d{4})(?=.*[a-zA-Z]{3})/;
    if (!regex.test(password)) {
      return { invalidPassword: true };
    }
    return null;
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registrarForm.valid) {
      const { username, email, password } = this.registrarForm.value;
      // Lógica para registrar el usuario
      console.log('Usuario registrado:', username, email);
    }
  }
}
