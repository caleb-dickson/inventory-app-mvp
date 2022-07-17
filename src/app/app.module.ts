import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LayoutModule } from '@angular/cdk/layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromAppStore from './app-store/app.reducer'
import { UserEffects } from './users/user-store/user.effects';
import { NotificationsEffects } from './notifications/notifications-store/notifications.effects';
import { BusinessEffects } from './inventory-app/navigation/business/business-store/business.effects';
import { LocationEffects } from './inventory-app/navigation/business/location/location-store/location.effects';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AuthInterceptor } from './users/user-control/auth-interceptor';

import { UserModule } from './users/user.module';
import { AppCoreModule } from './inventory-app/core.module';
import { MaterialModule } from './material.module';

import { ErrorComponent } from './error/error.component';
import { LandingComponent } from './landing/landing.component';
import { FooterComponent } from './landing/head-foot/footer/footer.component';
import { HeaderComponent } from './landing/head-foot/header/header.component';
import { SimpleNotificationComponent } from './notifications/simple-notification.component';
import { PreviewComponent } from './users/auth/preview/preview.component';
import { ResetPassComponent } from './users/auth/reset/reset-pass/reset-pass.component';
import { ResetEmailComponent } from './users/auth/reset/reset-email/reset-email.component';


@NgModule({
  declarations: [
    AppComponent,
    ErrorComponent,
    LandingComponent,
    HeaderComponent,
    FooterComponent,
    SimpleNotificationComponent,
    PreviewComponent,
    ResetPassComponent,
    ResetEmailComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    MaterialModule,
    UserModule,
    AppCoreModule,
    StoreModule.forRoot(fromAppStore.appReducer),
    EffectsModule.forRoot([UserEffects, NotificationsEffects, BusinessEffects, LocationEffects]),
    LayoutModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
