import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';

import { MaterialModule } from '../material.module';

import { CoreRoutingModule } from './core-routing.module';

import { CoreComponent } from './core.component';
import { NavigationComponent } from './navigation/navigation.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { SettingsComponent } from './settings/settings.component';
import { BusinessComponent } from './business/business.component';
import { InventoryComponent } from './inventory/inventory.component';
import { ProductsComponent } from './inventory/products/products.component';
import { LocationComponent } from './business/location/location.component';

@NgModule({
  declarations: [
    DashboardComponent,
    NavigationComponent,
    CoreComponent,
    SettingsComponent,
    BusinessComponent,
    InventoryComponent,
    ProductsComponent,
    LocationComponent,
  ],
  imports: [
    CommonModule,
    CoreRoutingModule,
    MaterialModule,
    LayoutModule,
    ReactiveFormsModule,
  ],
  exports: [NavigationComponent, DashboardComponent, CoreComponent],
})
export class AppCoreModule {}
