import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../users/user-control/auth.guard';
import { OwnerGuard } from '../users/user-control/owner.guard';

import { DashboardComponent } from './dashboard/dashboard.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { ErrorComponent } from '../error/error.component';
import { BusinessComponent } from './navigation/business/business.component';
import { ProductsComponent } from './navigation/business/location/inventory/products/products.component';
import { InventoryComponent } from './navigation/business/location/inventory/inventory.component';
import { LocationComponent } from './navigation/business/location/location.component';
import { NewInventoryComponent } from './navigation/business/location/inventory/new-inventory/new-inventory.component';
import { ManagerGuard } from '../users/user-control/mgr.guard';

const appCoreRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [ManagerGuard], },
      { path: 'settings', component: UserSettingsComponent },
      {
        path: 'business',
        component: BusinessComponent,
        canActivate: [OwnerGuard],
      },
      { path: 'location', component: LocationComponent },
      { path: 'new-inventory', component: NewInventoryComponent },
      {
        path: 'past-inventory',
        component: InventoryComponent,
        canActivate: [ManagerGuard],
      },
      {
        path: 'products',
        component: ProductsComponent,
        canActivate: [ManagerGuard],
      },
      { path: '**', component: ErrorComponent },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(appCoreRoutes)],
  exports: [RouterModule],
  providers: [AuthGuard, OwnerGuard, ManagerGuard],
})
export class CoreRoutingModule {}
