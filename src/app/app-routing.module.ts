import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/admin/login/login.component';
import { AuthGuard } from './gaurds/auth.guard';
import { SubAdminLoginComponent } from './components/auth/sub-admin/sub-admin-login/sub-admin-login.component';
import { SubAdminDashboardComponent } from './components/sub-admin-dashboard/sub-admin-dashboard/sub-admin-dashboard.component';
import { HomeComponent } from './components/home/home/home.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard/admin-dashboard.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
    
  { path: 'support-team-admin-login', component: LoginComponent },
  
  { path: 'support-team-admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  
  { path: 'sub-admin-login', component: SubAdminLoginComponent }, // Sub-admin login route
  
  {
    path: 'sub-admin-dashboard',
    component: SubAdminDashboardComponent,
    canActivate: [AuthGuard],  // Protect the sub-admin dashboard
  },

  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
