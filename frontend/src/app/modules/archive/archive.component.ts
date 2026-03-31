import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'fdm-archive',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="archive-container">
      <h1>Archivio Artisti e Band</h1>

      <div class="search-section mb-4">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            placeholder="Cerca artista, band, collettivo..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch()"
          />
          <select class="form-select" [(ngModel)]="filterType" (ngModelChange)="onSearch()">
            <option value="">Tutti</option>
            <option value="band">Band</option>
            <option value="artist">Artista</option>
            <option value="collective">Collettivo</option>
          </select>
        </div>
      </div>

      <div *ngIf="!selectedArtist" class="artists-grid">
        <div *ngIf="loading" class="spinner-border">
          <span class="visually-hidden">Caricamento...</span>
        </div>

        <div class="row">
          <div
            *ngFor="let artist of artists"
            class="col-md-4 mb-4 cursor-pointer"
            (click)="selectArtist(artist)"
          >
            <div class="card">
              <img
                *ngIf="artist.image_url"
                [src]="artist.image_url"
                class="card-img-top"
                alt="{{ artist.entity_name }}"
              />
              <div *ngIf="!artist.image_url" class="card-img-placeholder">
                🎵
              </div>
              <div class="card-body">
                <h5 class="card-title">{{ artist.entity_name }}</h5>
                <p class="card-text small text-muted">
                  {{ artist.entity_type }}
                </p>
                <p class="card-text small">
                  {{ artist.description | slice: 0: 100 }}...
                </p>
                <div class="social-links">
                  <a
                    *ngIf="artist.spotify_url"
                    [href]="artist.spotify_url"
                    target="_blank"
                    class="btn btn-sm btn-success"
                    (click)="$event.stopPropagation()"
                  >
                    🎵 Spotify
                  </a>
                  <a
                    *ngIf="artist.instagram_url"
                    [href]="artist.instagram_url"
                    target="_blank"
                    class="btn btn-sm btn-danger"
                    (click)="$event.stopPropagation()"
                  >
                    📷 Instagram
                  </a>
                  <a
                    *ngIf="artist.facebook_url"
                    [href]="artist.facebook_url"
                    target="_blank"
                    class="btn btn-sm btn-primary"
                    (click)="$event.stopPropagation()"
                  >
                    f Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="selectedArtist" class="artist-detail">
        <button class="btn btn-secondary mb-3" (click)="selectArtist(null)">
          ← Torna alla lista
        </button>

        <div class="row">
          <div class="col-md-4">
            <img
              *ngIf="selectedArtist.image_url"
              [src]="selectedArtist.image_url"
              class="img-fluid rounded"
              alt="{{ selectedArtist.entity_name }}"
            />
            <div *ngIf="!selectedArtist.image_url" class="placeholder-large">
              🎵
            </div>
          </div>

          <div class="col-md-8">
            <h2>{{ selectedArtist.entity_name }}</h2>
            <p class="lead text-muted">{{ selectedArtist.entity_type }}</p>

            <p class="description">{{ selectedArtist.description }}</p>

            <h4>Generi</h4>
            <div class="genres mb-3">
              <span
                *ngFor="let genre of (selectedArtist.genres | slice: 0: 50: ',') as genres"
                class="badge bg-secondary me-2"
              >
                {{ genre }}
              </span>
            </div>

            <h4>Link Social</h4>
            <div class="social-links-detail">
              <a
                *ngIf="selectedArtist.spotify_url"
                [href]="selectedArtist.spotify_url"
                target="_blank"
                class="btn btn-success me-2"
              >
                🎵 Ascolta su Spotify
              </a>
              <a
                *ngIf="selectedArtist.instagram_url"
                [href]="selectedArtist.instagram_url"
                target="_blank"
                class="btn btn-danger me-2"
              >
                📷 Instagram
              </a>
              <a
                *ngIf="selectedArtist.facebook_url"
                [href]="selectedArtist.facebook_url"
                target="_blank"
                class="btn btn-primary me-2"
              >
                f Facebook
              </a>
              <a
                *ngIf="selectedArtist.youtube_url"
                [href]="selectedArtist.youtube_url"
                target="_blank"
                class="btn btn-danger"
              >
                ▶ YouTube
              </a>
            </div>

            <h4 class="mt-4">Eventi</h4>
            <div *ngIf="selectedArtistEvents.length > 0">
              <ul class="list-group">
                <li
                  *ngFor="let event of selectedArtistEvents"
                  class="list-group-item"
                >
                  <strong>{{ event.event_name }}</strong><br />
                  📅 {{ event.event_date | date: 'short' }} -
                  📍 {{ event.event_location }}
                </li>
              </ul>
            </div>
            <div *ngIf="selectedArtistEvents.length === 0" class="alert alert-info">
              Nessun evento in archivio per questo artista
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .archive-container {
      padding: 20px;
    }
    .search-section {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
    }
    .artists-grid .card {
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .artists-grid .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .card-img-placeholder, .placeholder-large {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 200px;
    }
    .social-links {
      display: flex;
      gap: 5px;
      margin-top: 10px;
    }
    .social-links-detail {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .genres {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `]
})
export class ArchiveComponent implements OnInit {
  artists: any[] = [];
  selectedArtist: any = null;
  selectedArtistEvents: any[] = [];
  searchQuery = '';
  filterType = '';
  loading = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadArtists();
  }

  loadArtists(): void {
    this.loading = true;
    this.api.getArtists(0, 50, this.searchQuery, this.filterType).subscribe({
      next: (data) => {
        this.artists = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore caricamento artisti:', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.loadArtists();
  }

  selectArtist(artist: any): void {
    this.selectedArtist = artist;
    if (artist) {
      this.loadArtistEvents(artist.id);
    }
  }

  loadArtistEvents(artistId: number): void {
    this.api.getArtistEvents(artistId).subscribe({
      next: (data) => {
        this.selectedArtistEvents = data;
      },
      error: (err) => {
        console.error('Errore caricamento eventi artista:', err);
        this.selectedArtistEvents = [];
      }
    });
  }
}
