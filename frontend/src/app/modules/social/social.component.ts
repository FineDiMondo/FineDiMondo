import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'fdm-social',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="social-container">
      <h1>Gestione Social Media</h1>

      <div class="row">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Importa Evento</h5>
              <p class="card-text">Sincronizza eventi da Facebook e Instagram</p>

              <div class="form-group mb-3">
                <label>Piattaforma</label>
                <select class="form-select" [(ngModel)]="importPlatform">
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>

              <div class="form-group mb-3">
                <label>ID Pagina/Profilo</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="pageId"
                  placeholder="es: 123456789"
                />
              </div>

              <button
                class="btn btn-primary"
                (click)="importFromSocial()"
                [disabled]="loading"
              >
                {{ loading ? 'Importazione...' : 'Importa Ora' }}
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Stato Sincronizzazione</h5>
              <p class="card-text">Ultimo aggiornamento da social</p>

              <div *ngIf="syncStatus">
                <p><strong>Piattaforma:</strong> {{ syncStatus.platform }}</p>
                <p><strong>Stato:</strong> <span class="badge bg-success">{{ syncStatus.status }}</span></p>
                <p><strong>Eventi importati:</strong> {{ syncStatus.events_imported }}</p>
                <p><strong>Artisti trovati:</strong> {{ syncStatus.artists_found }}</p>
                <p class="text-muted small">
                  Ultimo aggiornamento: {{ syncStatus.last_sync | date: 'short' }}
                </p>
              </div>

              <button class="btn btn-secondary" (click)="refreshSyncStatus()">
                Aggiorna Stato
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="card-body">
          <h5 class="card-title">Cross-Post su Multiple Piattaforme</h5>
          <p class="card-text">Pubblica un evento su Facebook, Instagram e WhatsApp contemporaneamente</p>

          <div class="form-group mb-3">
            <label>Seleziona Evento</label>
            <select class="form-select" [(ngModel)]="selectedEventId">
              <option value="">-- Scegli evento --</option>
              <option *ngFor="let event of events" [value]="event.id">
                {{ event.event_name }} ({{ event.event_date | date: 'short' }})
              </option>
            </select>
          </div>

          <div class="form-group mb-3">
            <label>Seleziona Piattaforme</label>
            <div class="form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="facebook"
                value="facebook"
                [(ngModel)]="selectedPlatforms"
              />
              <label class="form-check-label" for="facebook">
                Facebook
              </label>
            </div>
            <div class="form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="instagram"
                value="instagram"
                [(ngModel)]="selectedPlatforms"
              />
              <label class="form-check-label" for="instagram">
                Instagram
              </label>
            </div>
            <div class="form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="whatsapp"
                value="whatsapp"
                [(ngModel)]="selectedPlatforms"
              />
              <label class="form-check-label" for="whatsapp">
                WhatsApp
              </label>
            </div>
          </div>

          <div class="form-group mb-3">
            <label>Messaggio Personalizzato</label>
            <textarea
              class="form-control"
              [(ngModel)]="customMessage"
              rows="3"
              placeholder="Scrivi il messaggio per il post..."
            ></textarea>
          </div>

          <button
            class="btn btn-success"
            (click)="crosspostEvent()"
            [disabled]="!selectedEventId || selectedPlatforms.length === 0 || loading"
          >
            {{ loading ? 'Pubblicazione...' : 'Pubblica Su ' + selectedPlatforms.length + ' Piattaforme' }}
          </button>
        </div>
      </div>

      <div *ngIf="message" class="alert" [ngClass]="'alert-' + messageType" role="alert">
        {{ message }}
      </div>
    </div>
  `,
  styles: [`
    .social-container {
      padding: 20px;
    }
    .card {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .form-check {
      margin-bottom: 10px;
    }
  `]
})
export class SocialComponent implements OnInit {
  importPlatform = 'facebook';
  pageId = '';
  selectedEventId: any = null;
  selectedPlatforms: string[] = [];
  customMessage = '';
  events: any[] = [];
  syncStatus: any = null;
  loading = false;
  message = '';
  messageType = 'info';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadEvents();
    this.refreshSyncStatus();
  }

  loadEvents(): void {
    this.api.getEvents(0, 100).subscribe({
      next: (data) => {
        this.events = data;
      },
      error: (err) => console.error('Errore caricamento eventi:', err)
    });
  }

  importFromSocial(): void {
    if (!this.pageId) {
      this.message = 'Inserisci l\'ID della pagina';
      this.messageType = 'warning';
      return;
    }

    this.loading = true;
    // Simula import
    setTimeout(() => {
      this.message = `Importazione da ${this.importPlatform} avviata. Controlla lo stato tra poco.`;
      this.messageType = 'success';
      this.loading = false;
    }, 1500);
  }

  refreshSyncStatus(): void {
    this.api.getSyncStatus('facebook').subscribe({
      next: (data) => {
        this.syncStatus = data;
      },
      error: (err) => console.error('Errore sync status:', err)
    });
  }

  crosspostEvent(): void {
    if (!this.selectedEventId || this.selectedPlatforms.length === 0) {
      this.message = 'Seleziona evento e almeno una piattaforma';
      this.messageType = 'warning';
      return;
    }

    this.loading = true;
    // Simula crosspost
    setTimeout(() => {
      this.message = `Evento pubblicato su ${this.selectedPlatforms.join(', ')}!`;
      this.messageType = 'success';
      this.loading = false;
      this.selectedPlatforms = [];
      this.customMessage = '';
    }, 1500);
  }

  getSyncStatus(platform: string): void {
    this.api.getSyncStatus(platform).subscribe({
      next: (data) => {
        this.syncStatus = data;
      },
      error: (err) => console.error('Errore:', err)
    });
  }
}
