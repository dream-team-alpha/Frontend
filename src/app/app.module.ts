import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignUpComponent } from './components/auth/admin/sign-up/sign-up.component';
import { LoginComponent } from './components/auth/admin/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//angular material imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { DragDropModule } from '@angular/cdk/drag-drop';


//form
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // For template-driven forms


import { HttpClientModule } from '@angular/common/http';
import { SubAdminLoginComponent } from './components/auth/sub-admin/sub-admin-login/sub-admin-login.component';
import { SubAdminDashboardComponent } from './components/sub-admin-dashboard/sub-admin-dashboard/sub-admin-dashboard.component';
import { UserChatBoxComponent } from './components/home/user-chat-box/user-chat-box.component';
import { HomeComponent } from './components/home/home/home.component';
import { NavbarComponent } from './components/dashboard/navbar/navbar.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard/admin-dashboard.component';
import { LogoutComponent } from './components/dashboard/navbar-components/logout/logout.component';
import { ManageSubAdminsComponent } from './components/dashboard/navbar-components/manage-sub-admins/manage-sub-admins.component';
import { ModalComponent } from './components/dashboard/navbar-components/modal/modal.component';
import { ProfileComponent } from './components/dashboard/profile/profile.component';
import { SidebarComponent } from './components/dashboard/sidebar/sidebar.component';
import { UserListComponent } from './components/dashboard/user-list/user-list.component';
import { ChatDashboardComponent } from './components/dashboard/chat-dashboard/chat-dashboard.component';
import { WebSocketService } from './services/web-socket/websocket.service';

@NgModule({
  declarations: [
    AppComponent,
    SignUpComponent,
    LoginComponent,
    SubAdminLoginComponent,
    SubAdminDashboardComponent,
    UserChatBoxComponent,
    HomeComponent,
    NavbarComponent,
    AdminDashboardComponent,
    LogoutComponent,
    ManageSubAdminsComponent,
    ModalComponent,
    ProfileComponent,
    SidebarComponent,
    UserListComponent,
    ChatDashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    
    //angular material imports
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatListModule,
    MatSelectModule,
    DragDropModule
  ],
  providers: [WebSocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
