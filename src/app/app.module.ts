import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LayoutModule } from '@angular/cdk/layout';
import { FormsModule } from '@angular/forms';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromAppStore from './app-store/app.reducer'
import { UserEffects } from './users/user-store/user.effects';
import { BusinessEffects } from './core/business/business-store/business.effects';
import { LocationEffects } from './core/business/location/location-store/location.effects';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AuthInterceptor } from './users/user-control/auth-interceptor';

import { UserModule } from './users/user.module';
import { AppCoreModule } from './core/core.module';
import { MaterialModule } from './material.module';

import { ErrorComponent } from './error/error.component';
import { LandingComponent } from './landing/landing.component';
import { FooterComponent } from './landing/head-foot/footer/footer.component';
import { HeaderComponent } from './landing/head-foot/header/header.component';


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
    UserModule,
    AppCoreModule,
    StoreModule.forRoot(fromAppStore.appReducer),
    EffectsModule.forRoot([UserEffects, BusinessEffects, LocationEffects]),
    LayoutModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
