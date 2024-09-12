import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, this.passwordStrengthValidator]]
    });
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
      const { username } = this.loginForm.value;
      this.router.navigate(['/inicio'], { state: { username } });
    }
  }

  resetPassword() {
    console.log('Restablecer contraseña');
  }
}
