import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';

import { MaterialModule } from '../material.module';

import { CoreRoutingModule } from './core-routing.module';

import { CoreComponent } from './core.component';
import { NavigationComponent } from './navigation/navigation.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { UserSettingsComponent } from './user-settings/user-settings.component';
import { BusinessComponent } from './navigation/business/business.component';
import { InventoryComponent } from './navigation/business/location/inventory/inventory.component';
import { ProductsComponent } from './navigation/business/location/inventory/products/products.component';
import { LocationComponent } from './navigation/business/location/location.component';
import { NewInventoryComponent } from './navigation/business/location/inventory/new-inventory/new-inventory.component';
import { ProductFormComponent } from './navigation/business/location/inventory/products/product-form/product-form.component';
import { InventoryFormComponent } from './navigation/business/location/inventory/inventory-form/inventory-form.component';
import { ProductEditComponent } from './dialog/product-edit/product-edit.component';
import { UserSettingsAdvancedComponent } from './user-settings/user-settings-advanced/user-settings-advanced.component';

@NgModule({
  declarations: [
    DashboardComponent,
    NavigationComponent,
    CoreComponent,
    UserSettingsComponent,
    BusinessComponent,
    InventoryComponent,
    ProductsComponent,
    LocationComponent,
    NewInventoryComponent,
    ProductFormComponent,
    InventoryFormComponent,
    ProductEditComponent,
    UserSettingsAdvancedComponent,
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
