import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'fdm-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="dashboard-container">
      <h1>Gestione Eventi</h1>

      <div class="controls mb-3">
        <input
          type="text"
          class="form-control"
          placeholder="Ricerca evento..."
          [(ngModel)]="searchText"
          (ngModelChange)="onSearch()"
        />
        <button class="btn btn-primary ms-2" (click)="openNewEventForm()">
          + Nuovo Evento
        </button>
      </div>

      <div class="events-table">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Data</th>
              <th>Location</th>
              <th>Artisti</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let event of events" (click)="selectEvent(event)">
              <td><strong>{{ event.event_name }}</strong></td>
              <td>{{ event.event_date | date: 'short' }}</td>
              <td>{{ event.event_location }}</td>
              <td><span class="badge bg-info">--</span></td>
              <td>
                <button
                  class="btn btn-sm btn-warning"
                  (click)="editEvent(event, $event)"
                >
                  Modifica
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  (click)="deleteEvent(event, $event)"
                >
                  Elimina
                </button>
                <button
                  class="btn btn-sm btn-success"
                  (click)="analyzeWithAI(event, $event)"
                  title="Analizza con Gemini per estrarre artisti"
                >
                  🤖 AI
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="selectedEvent" class="event-detail mt-4 p-3 border rounded">
        <h3>{{ selectedEvent.event_name }}</h3>
        <p><strong>Data:</strong> {{ selectedEvent.event_date | date: 'full' }}</p>
        <p><strong>Location:</strong> {{ selectedEvent.event_location }}</p>
        <p><strong>Descrizione:</strong> {{ selectedEvent.event_description }}</p>
        <img
          *ngIf="selectedEvent.poster_url"
          [src]="selectedEvent.poster_url"
          class="img-thumbnail"
          style="max-width: 200px"
        />
      </div>

      <div *ngIf="showForm" class="event-form mt-4 p-3 border rounded">
        <h3>{{ formTitle }}</h3>
        <form [formGroup]="eventForm" (ngSubmit)="submitForm()">
          <div class="form-group mb-3">
            <label>Nome Evento *</label>
            <input
              type="text"
              class="form-control"
              formControlName="event_name"
              required
            />
          </div>

          <div class="form-group mb-3">
            <label>Descrizione</label>
            <textarea
              class="form-control"
              formControlName="event_description"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group mb-3">
            <label>Data Evento *</label>
            <input
              type="datetime-local"
              class="form-control"
              formControlName="event_date"
              required
            />
          </div>

          <div class="form-group mb-3">
            <label>Location</label>
            <input
              type="text"
              class="form-control"
              formControlName="event_location"
            />
          </div>

          <div class="form-group mb-3">
            <label>Categoria</label>
            <select class="form-control" formControlName="event_category">
              <option value="">Nessuna</option>
              <option value="music">Musica</option>
              <option value="theater">Teatro</option>
              <option value="workshop">Workshop</option>
              <option value="other">Altro</option>
            </select>
          </div>

          <button type="submit" class="btn btn-success" [disabled]="!eventForm.valid">
            Salva
          </button>
          <button
            type="button"
            class="btn btn-secondary ms-2"
            (click)="cancelForm()"
          >
            Annulla
          </button>
        </form>
      </div>

      <div *ngIf="loading" class="spinner-border" role="status">
        <span class="visually-hidden">Caricamento...</span>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
    .controls {
      display: flex;
      gap: 10px;
    }
    .event-detail, .event-form {
      background-color: #f9f9f9;
    }
  `]
})
export class DashboardComponent implements OnInit {
  events: any[] = [];
  selectedEvent: any = null;
  showForm = false;
  formTitle = 'Nuovo Evento';
  loading = false;
  searchText = '';
  eventForm: FormGroup;
  editingId: number | null = null;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.eventForm = this.fb.group({
      event_name: ['', [Validators.required, Validators.minLength(3)]],
      event_description: [''],
      event_date: ['', Validators.required],
      event_location: [''],
      event_category: ['']
    });
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.api.getEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore caricamento eventi:', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchText) {
      this.loading = true;
      this.api.getEvents(0, 50, this.searchText).subscribe({
        next: (data) => {
          this.events = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Errore ricerca:', err);
          this.loading = false;
        }
      });
    } else {
      this.loadEvents();
    }
  }

  selectEvent(event: any): void {
    this.selectedEvent = event;
  }

  openNewEventForm(): void {
    this.formTitle = 'Nuovo Evento';
    this.editingId = null;
    this.eventForm.reset();
    this.showForm = true;
  }

  editEvent(event: any, e: Event): void {
    e.stopPropagation();
    this.formTitle = 'Modifica Evento';
    this.editingId = event.id;
    this.eventForm.patchValue({
      event_name: event.event_name,
      event_description: event.event_description,
      event_date: event.event_date,
      event_location: event.event_location,
      event_category: event.event_category
    });
    this.showForm = true;
  }

  deleteEvent(event: any, e: Event): void {
    e.stopPropagation();
    if (confirm(`Eliminare l'evento "${event.event_name}"?`)) {
      this.api.deleteEvent(event.id).subscribe({
        next: () => {
          this.loadEvents();
        },
        error: (err) => console.error('Errore eliminazione:', err)
      });
    }
  }

  analyzeWithAI(event: any, e: Event): void {
    e.stopPropagation();
    this.loading = true;
    this.api.analyzeEvent(event.id).subscribe({
      next: (result) => {
        alert(`Analisi completata: trovati ${result.created_artists.length} artisti`);
        this.loadEvents();
      },
      error: (err) => {
        console.error('Errore analisi:', err);
        this.loading = false;
      }
    });
  }

  submitForm(): void {
    if (!this.eventForm.valid) return;

    this.loading = true;
    const formData = this.eventForm.value;

    if (this.editingId) {
      this.api.updateEvent(this.editingId, formData).subscribe({
        next: () => {
          this.loadEvents();
          this.cancelForm();
        },
        error: (err) => {
          console.error('Errore aggiornamento:', err);
          this.loading = false;
        }
      });
    } else {
      this.api.createEvent(formData).subscribe({
        next: () => {
          this.loadEvents();
          this.cancelForm();
        },
        error: (err) => {
          console.error('Errore creazione:', err);
          this.loading = false;
        }
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.eventForm.reset();
    this.editingId = null;
  }
}
