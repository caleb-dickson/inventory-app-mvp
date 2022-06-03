import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/auth-control/auth.guard';
import { OwnerGuard } from '../auth/auth-control/owner.guard';

import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { ErrorComponent } from '../error/error.component';
import { BusinessComponent } from './business/business.component';
import { ProductsComponent } from './business/inventory/products/products.component';
import { InventoryComponent } from './business/inventory/inventory.component';
import { LocationComponent } from './business/location/location.component';
import { NewInventoryComponent } from './business/inventory/new-inventory/new-inventory.component';

const appCoreRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'business', component: BusinessComponent, canActivate: [OwnerGuard] },
      { path: 'location', component: LocationComponent },
      { path: 'new-inventory', component: NewInventoryComponent },
      { path: 'past-inventory', component: InventoryComponent },
      { path: 'products', component: ProductsComponent },
      { path: '**', component: ErrorComponent }
    ]
  }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(appCoreRoutes),
  ],
  exports: [RouterModule],
  providers: [AuthGuard, OwnerGuard]
})
export class CoreRoutingModule { }
