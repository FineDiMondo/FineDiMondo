import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'fdm-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="analytics-container">
      <h1>Dashboard Analytics</h1>

      <div class="kpi-cards row">
        <div class="col-md-3 mb-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <h5 class="card-title">Eventi Totali</h5>
              <h2>{{ overview?.total_events || 0 }}</h2>
              <small>Nel database</small>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card bg-success text-white">
            <div class="card-body">
              <h5 class="card-title">Artisti</h5>
              <h2>{{ overview?.total_artists || 0 }}</h2>
              <small>Band e collettivi</small>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card bg-warning text-white">
            <div class="card-body">
              <h5 class="card-title">Eventi Attivi</h5>
              <h2>{{ overview?.active_events || 0 }}</h2>
              <small>In programma</small>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <h5 class="card-title">Ultimi 30 Giorni</h5>
              <h2>{{ overview?.recent_events_30days || 0 }}</h2>
              <small>Nuovi eventi</small>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Top Artisti</h5>
              <div *ngIf="topArtists.length > 0">
                <ul class="list-group">
                  <li
                    *ngFor="let artist of topArtists"
                    class="list-group-item d-flex justify-content-between"
                  >
                    <span>
                      <strong>{{ artist.name }}</strong>
                      <br />
                      <small class="text-muted">{{ artist.type }}</small>
                    </span>
                    <span class="badge bg-primary">{{ artist.event_count }} eventi</span>
                  </li>
                </ul>
              </div>
              <div *ngIf="topArtists.length === 0">
                <p class="text-muted">Nessun dato disponibile</p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Engagement Social</h5>
              <div *ngIf="socialData">
                <div class="mb-3">
                  <strong>Facebook</strong>
                  <div class="progress mb-2" style="height: 20px">
                    <div
                      class="progress-bar"
                      role="progressbar"
                      [style.width]="socialData.platforms.facebook.engagement_rate + '%'"
                    >
                      {{ socialData.platforms.facebook.engagement_rate }}%
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <strong>Instagram</strong>
                  <div class="progress mb-2" style="height: 20px">
                    <div
                      class="progress-bar bg-danger"
                      role="progressbar"
                      [style.width]="socialData.platforms.instagram.engagement_rate + '%'"
                    >
                      {{ socialData.platforms.instagram.engagement_rate }}%
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <strong>WhatsApp</strong>
                  <div class="progress" style="height: 20px">
                    <div
                      class="progress-bar bg-success"
                      role="progressbar"
                      [style.width]="socialData.platforms.whatsapp.open_rate + '%'"
                    >
                      {{ socialData.platforms.whatsapp.open_rate }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="card-body">
          <h5 class="card-title">Trend Eventi (ultimi 6 mesi)</h5>
          <div class="chart-container">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Mese</th>
                  <th>Numero Eventi</th>
                  <th>Visualizzazione</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let trend of eventTrends">
                  <td>{{ trend.month }}</td>
                  <td><strong>{{ trend.events_count }}</strong></td>
                  <td>
                    <div class="progress" style="height: 20px">
                      <div
                        class="progress-bar"
                        role="progressbar"
                        [style.width]="(trend.events_count / 50 * 100) + '%'"
                      >
                        {{ trend.events_count }}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="mt-4 mb-4">
        <button class="btn btn-primary" (click)="refreshData()">
          🔄 Aggiorna Dati
        </button>
        <button class="btn btn-secondary ms-2" (click)="exportData('json')">
          ⬇ Scarica JSON
        </button>
      </div>

      <div *ngIf="loading" class="spinner-border">
        <span class="visually-hidden">Caricamento...</span>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 20px;
    }
    .kpi-cards .card {
      transition: transform 0.3s;
    }
    .kpi-cards .card:hover {
      transform: translateY(-5px);
    }
    .card {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .chart-container {
      max-height: 400px;
      overflow-y: auto;
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  overview: any = null;
  topArtists: any[] = [];
  eventTrends: any[] = [];
  socialData: any = null;
  loading = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.api.getAnalyticsOverview().subscribe({
      next: (data) => {
        this.overview = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore:', err);
        this.loading = false;
      }
    });

    this.api.getTopArtists(5).subscribe({
      next: (data) => {
        this.topArtists = data.top_artists || [];
      },
      error: (err) => console.error('Errore artisti:', err)
    });

    this.api.getEventTrends(6).subscribe({
      next: (data) => {
        this.eventTrends = data.trends || [];
      },
      error: (err) => console.error('Errore trend:', err)
    });

    this.api.getSocialEngagement().subscribe({
      next: (data) => {
        this.socialData = data;
      },
      error: (err) => console.error('Errore social:', err)
    });
  }

  refreshData(): void {
    this.loadAnalytics();
  }

  exportData(format: string): void {
    alert(`Download ${format} in sviluppo`);
  }
}
