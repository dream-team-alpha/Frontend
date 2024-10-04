import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/admin/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';
import { AuthGuard } from './gaurds/auth.guard';

const routes: Routes = [
  { path: 'support-team-admin-login', component: LoginComponent },

  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Optional, if you want to redirect to login by default
  
  { path: 'support-team-admin-dashbboard', component: DashboardComponent, canActivate: [AuthGuard], },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
