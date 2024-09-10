import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, this.passwordStrengthValidator]]
    });
  }

  ngOnInit() {
    // No es necesario inicializar aquí ya que ya está hecho en el constructor
  }

  passwordStrengthValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value || '';
    if (!/[0-9]{4}/.test(value)) return { passwordStrength: true };
    if (!/[a-zA-Z]{3}/.test(value)) return { passwordStrength: true };
    if (!/[A-Z]/.test(value)) return { passwordStrength: true };
    return null;
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log('Formulario válido', this.loginForm.value);
    } else {
      console.log('Formulario inválido');
    }
  }

  resetPassword() {
    console.log('Restablecer contraseña');
  }
}
