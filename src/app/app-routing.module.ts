import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/admin/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';
import { AuthGuard } from './gaurds/auth.guard';
import { SubAdminLoginComponent } from './components/auth/sub-admin/sub-admin-login/sub-admin-login.component';
import { SubAdminDashboardComponent } from './components/sub-admin-dashboard/sub-admin-dashboard/sub-admin-dashboard.component';

const routes: Routes = [
  { path: 'support-team-admin-login', component: LoginComponent },

  { path: '', redirectTo: '/home', pathMatch: 'full' }, 
  
  { path: '**', redirectTo: 'home' },

  { path: 'support-team-admin-dashbboard', component: DashboardComponent, canActivate: [AuthGuard], },

  { path: 'sub-admin-login', component: SubAdminLoginComponent }, // Sub-admin login route
  {
    path: 'sub-admin-dashboard',
    component: SubAdminDashboardComponent,
    canActivate: [AuthGuard],  // Protect the sub-admin dashboard
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
