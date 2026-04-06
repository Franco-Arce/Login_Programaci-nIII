import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.user;

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
