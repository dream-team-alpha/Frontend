import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignUpComponent } from './components/auth/admin/sign-up/sign-up.component';
import { LoginComponent } from './components/auth/admin/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';  // Import HttpClientModule
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

//form
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // For template-driven forms


import { HttpClientModule } from '@angular/common/http';
import { SubAdminLoginComponent } from './components/auth/sub-admin/sub-admin-login/sub-admin-login.component';
import { SubAdminDashboardComponent } from './components/sub-admin-dashboard/sub-admin-dashboard/sub-admin-dashboard.component';
@NgModule({
  declarations: [
    AppComponent,
    SignUpComponent,
    LoginComponent,
    DashboardComponent,
    SubAdminLoginComponent,
    SubAdminDashboardComponent
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
