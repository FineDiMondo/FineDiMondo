import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ApiService } from './services/api.service';

@Component({
  selector: 'fdm-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
          <a class="navbar-brand" href="#/">
            <strong>Fine Di Mondo</strong>
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/archive" routerLinkActive="active">Archivio</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/social" routerLinkActive="active">Social</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/analytics" routerLinkActive="active">Analytics</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main class="container-fluid mt-4">
        <router-outlet></router-outlet>
      </main>

      <footer class="bg-light text-center py-3 mt-5 border-top">
        <p class="text-muted">Fine Di Mondo &copy; 2026 - Gestione Eventi e Artisti</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    main {
      flex: 1;
    }

    footer {
      margin-top: auto;
    }
  `]
})
export class AppComponent implements OnInit {
  isHealthy = false;

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Check backend health
    this.apiService.healthCheck().subscribe({
      next: () => {
        this.isHealthy = true;
        console.log('Backend is healthy');
      },
      error: (err) => {
        console.error('Backend health check failed:', err);
      }
    });
  }
}
