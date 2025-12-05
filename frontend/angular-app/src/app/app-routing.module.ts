import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'galleria',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./galleria/galleria.component').then(m => m.GalleriaComponent)
  },
  {
    path: 'user/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./shared/components/user/user.component').then(m => m.UserComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./shared/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
