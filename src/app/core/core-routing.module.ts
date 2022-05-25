import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/auth-control/auth.guard';

import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { ErrorComponent } from '../error/error.component';
import { BusinessComponent } from './business/business.component';
import { ProductsComponent } from './inventory/products/products.component';
import { InventoryComponent } from './inventory/inventory.component';
import { LocationComponent } from './business/location/location.component';

const appCoreRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'business', component: BusinessComponent },
      { path: 'location', component: LocationComponent },
      { path: 'inventory', component: InventoryComponent },
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
  providers: [AuthGuard]
})
export class CoreRoutingModule { }
