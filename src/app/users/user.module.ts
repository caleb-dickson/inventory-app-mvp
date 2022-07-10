import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { MaterialModule } from '../material.module';
import { AuthComponent } from './auth/auth.component';

const authRoutes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: 'signup', component: SignupComponent },
      { path: 'login', component: LoginComponent },
    ],
  },
];

@NgModule({
  declarations: [AuthComponent, LoginComponent, SignupComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(authRoutes),
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
  ],
  exports: [AuthComponent, LoginComponent, SignupComponent],
})
export class UserModule {}
