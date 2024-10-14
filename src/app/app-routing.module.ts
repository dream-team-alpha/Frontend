import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/admin/login/login.component';
import { AuthGuard } from './gaurds/auth.guard';
import { SubAdminLoginComponent } from './components/auth/sub-admin/sub-admin-login/sub-admin-login.component';
import { SubAdminDashboardComponent } from './components/sub-admin-dashboard/sub-admin-dashboard/sub-admin-dashboard.component';
import { HomeComponent } from './components/home/home/home.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard/admin-dashboard.component';
import { ManageSubAdminsComponent } from './components/dashboard/navbar-components/manage-sub-admins/manage-sub-admins.component';
import { UserChatBoxComponent } from './components/home/user-chat-box/user-chat-box.component';
import { ChatDashboardComponent } from './components/dashboard/chat-dashboard/chat-dashboard.component';
import { ProfileComponent } from './components/dashboard/profile/profile.component';
import { SidebarComponent } from './components/dashboard/sidebar/sidebar.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
    
  { path: 'support-team-admin-login', component: LoginComponent },
  
  { path: 'support-team-admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard],
    children: [
      // Add the new route as a child of AdminDashboardComponent
      { path: 'manage-sub-admins', component: ManageSubAdminsComponent },
      { path: 'chat/:id', component: ChatDashboardComponent },
      { path: 'chat', component: ChatDashboardComponent },
      { path: 'manage-profile', component: ProfileComponent },
    ]
   },
  
  { path: 'sub-admin-login', component: SubAdminLoginComponent }, // Sub-admin login route
  
  {
    path: 'sub-admin-dashboard',
    component: SubAdminDashboardComponent,
    canActivate: [AuthGuard],  // Protect the sub-admin dashboard
  },

  {path:'user-chat-box', component:UserChatBoxComponent},

  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
