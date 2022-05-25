import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from './auth/auth-store/auth.effects';
import { BusinessEffects } from './core/business/business-store/business.effects';
import * as fromAppStore from './app-store/app.reducer'

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AuthInterceptor } from './auth/auth-control/auth-interceptor';
import { MaterialModule } from './material.module';

import { ErrorComponent } from './error/error.component';
import { LandingComponent } from './landing/landing.component';
import { FooterComponent } from './landing/head-foot/footer/footer.component';
import { HeaderComponent } from './landing/head-foot/header/header.component';
import { AuthModule } from './auth/auth.module';
import { LayoutModule } from '@angular/cdk/layout';
import { AppCoreModule } from './core/core.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    ErrorComponent,
    LandingComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    MaterialModule,
    AuthModule,
    StoreModule.forRoot(fromAppStore.appReducer),
    EffectsModule.forRoot([AuthEffects, BusinessEffects]),
    LayoutModule,
    AppCoreModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
