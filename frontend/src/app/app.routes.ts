import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'archive',
        loadChildren: () => import('./modules/archive/archive.module').then(m => m.ArchiveModule)
      },
      {
        path: 'social',
        loadChildren: () => import('./modules/social/social.module').then(m => m.SocialModule)
      },
      {
        path: 'analytics',
        loadChildren: () => import('./modules/analytics/analytics.module').then(m => m.AnalyticsModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
