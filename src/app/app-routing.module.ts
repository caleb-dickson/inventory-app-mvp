import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { ErrorComponent } from "./error/error.component";

import { AuthGuard } from './users/user-control/auth.guard';
import { LandingComponent } from './landing/landing.component';
import { CoreComponent } from './inventory-app/core.component';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  {
    path: 'app',
    canActivate: [AuthGuard],
    component: CoreComponent,
    loadChildren: () => import('./inventory-app/core.module').then((m) => m.AppCoreModule)
  },
  { path: '**', component: ErrorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled',
    onSameUrlNavigation: 'ignore',
    scrollOffset: [0, 25],
    preloadingStrategy: PreloadAllModules,

  }),
  CommonModule
],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {}
