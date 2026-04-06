import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  username = '';
  email = '';
  firstName = '';
  lastName = '';
  password = '';
  password2 = '';

  loading = signal(false);
  error = signal('');
  success = signal(false);

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    if (!this.username || !this.password || !this.password2) {
      this.error.set('Usuario y contraseña son obligatorios.');
      return;
    }
    if (this.password !== this.password2) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.http
      .post('http://localhost:8000/api/auth/register/', {
        username: this.username,
        email: this.email,
        first_name: this.firstName,
        last_name: this.lastName,
        password: this.password,
        password2: this.password2,
      })
      .subscribe({
        next: () => {
          this.success.set(true);
          setTimeout(() => this.router.navigateByUrl('/login'), 1500);
        },
        error: err => {
          const data = err.error;
          const first = Object.values(data ?? {})[0];
          this.error.set(Array.isArray(first) ? first[0] : 'Error al registrar.');
          this.loading.set(false);
        },
      });
  }
}
