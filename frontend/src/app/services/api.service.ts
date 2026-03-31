import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Events API
  getEvents(skip: number = 0, limit: number = 50, search?: string, category?: string): Observable<any> {
    let params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit);

    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);

    return this.http.get(`${this.apiUrl}/events`, { params });
  }

  getEvent(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/events/${id}`);
  }

  getEventArtists(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/events/${id}/artists`);
  }

  createEvent(event: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/events`, event);
  }

  updateEvent(id: number, event: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/events/${id}`, event);
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${id}`);
  }

  // Artists API
  getArtists(skip: number = 0, limit: number = 50, search?: string, type?: string): Observable<any> {
    let params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit);

    if (search) params = params.set('search', search);
    if (type) params = params.set('entity_type', type);

    return this.http.get(`${this.apiUrl}/artists`, { params });
  }

  getArtist(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/artists/${id}`);
  }

  getArtistEvents(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/artists/${id}/events`);
  }

  createArtist(artist: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/artists`, artist);
  }

  updateArtist(id: number, artist: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/artists/${id}`, artist);
  }

  deleteArtist(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/artists/${id}`);
  }

  // Admin APIs
  analyzeEvent(eventId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/analyze-event`, { event_id: eventId });
  }

  // Health check
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}
