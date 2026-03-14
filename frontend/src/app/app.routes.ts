import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
  { path: 'login',    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'feed',     loadComponent: () => import('./features/feed/feed.component').then(m => m.FeedComponent), canActivate: [authGuard] },
  { path: 'explore',  loadComponent: () => import('./features/explore/explore.component').then(m => m.ExploreComponent), canActivate: [authGuard] },
  { path: 'posts/new',loadComponent: () => import('./features/post/post-form/post-form.component').then(m => m.PostFormComponent), canActivate: [authGuard] },
  { path: 'posts/:id/edit', loadComponent: () => import('./features/post/post-form/post-form.component').then(m => m.PostFormComponent), canActivate: [authGuard] },
  { path: 'posts/:id',loadComponent: () => import('./features/post/post-detail/post-detail.component').then(m => m.PostDetailComponent) },
  { path: 'block/:username', loadComponent: () => import('./features/profile/block/block.component').then(m => m.BlockComponent) },
  { path: 'profile/edit', loadComponent: () => import('./features/profile/edit-profile/edit-profile.component').then(m => m.EditProfileComponent), canActivate: [authGuard] },
  { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent), canActivate: [authGuard] },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'users',     loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: 'posts',     loadComponent: () => import('./features/admin/posts/admin-posts.component').then(m => m.AdminPostsComponent) },
      { path: 'reports',   loadComponent: () => import('./features/admin/reports/admin-reports.component').then(m => m.AdminReportsComponent) },
    ]
  },
  { path: '**', redirectTo: 'feed' }
];
