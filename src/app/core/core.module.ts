import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';

import { MaterialModule } from '../material.module';

import { CoreRoutingModule } from './core-routing.module';

import { CoreComponent } from './core.component';
import { NavigationComponent } from './navigation/navigation.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { SettingsComponent } from './settings/settings.component';
import { BusinessComponent } from './business/business.component';
import { InventoryComponent } from './business/location/inventory/inventory.component';
import { ProductsComponent } from './business/location/inventory/products/products.component';
import { LocationComponent } from './business/location/location.component';
import { NewInventoryComponent } from './business/location/inventory/new-inventory/new-inventory.component';

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
    NewInventoryComponent,
  ],
  imports: [
    CommonModule,
    CoreRoutingModule,
    MaterialModule,
    LayoutModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [NavigationComponent,
    DashboardComponent,
    CoreComponent
  ],
})
export class AppCoreModule {}
