import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { ArchiveComponent } from './modules/archive/archive.component';
import { SocialComponent } from './modules/social/social.component';
import { AnalyticsComponent } from './modules/analytics/analytics.component';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'archive',
        component: ArchiveComponent
      },
      {
        path: 'social',
        component: SocialComponent
      },
      {
        path: 'analytics',
        component: AnalyticsComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
