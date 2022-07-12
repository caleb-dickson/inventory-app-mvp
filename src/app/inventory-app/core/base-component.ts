import { Store } from '@ngrx/store';
import * as fromAppStore from '../../app-store/app.reducer';

import { Subscription } from 'rxjs';
import { User } from 'src/app/users/user.model';
import { Location } from '../models/location.model';
import { Product } from '../models/product.model';
import { ThemeService } from 'src/app/theme/theme.service';
import { Inventory } from '../models/inventory.model';

export class BaseComponent {
  // STATE
  private _userStoreSub: Subscription;
  private _businessStoreSub: Subscription;
  private _locationStoreSub: Subscription;
  private _appLoading: boolean;
  private _userLoading: boolean;
  private _businessLoading: boolean;
  private _locationLoading: boolean;

  // THEME
  private _themeSub: Subscription;
  private _themeMode: string;
  private _themePref: string;

  // USER
  private _isAuthenticated: boolean;
  private _user: User;
  private _userRole: string;
  private _userDept: string;
  private _userLocations: Location[];

  // BUSINESS

  // LOCATION
  private _activeLocation: Location;
  private _activeLocationInventories: Inventory[];
  private _locationError: string;
  private _activeInventory: Inventory;

  // INVENTORY
  private _inventoryData: any[];

  // PRODUCTS
  private _activeProducts: Product[] = [];
  private _locationProducts: any[];
  private _selectedProducts: Product[] = [];

  /**
   *
   * @param _store
   * @param _themeService
   */
  constructor(
    private _store: Store<fromAppStore.AppState>,
    private _themeService: ThemeService
  ) {
    this.userStoreSub = this.store.select('user').subscribe((userState) => {
      this.appLoading = userState.loading;
      this.userLoading = userState.loading;
      this.user = userState.user;
      this.isAuthenticated = !!userState.user;
      if (this.isAuthenticated) {
        this.user = userState.user;
        this.userDept = userState.user.userProfile.department;
        this.setUserRoleString(userState.user.userProfile.role);
        this.userLocations = userState.userLocations;
      }
    });

    this.locationStoreSub = this.store
      .select('location')
      .subscribe((locationState) => {
        this.appLoading = locationState.loading;
        this.locationLoading = locationState.loading;
        this.locationError = locationState.locationError;
        this.activeLocation = locationState.activeLocation;
        this.inventoryData = locationState.activeLocation?.inventoryData;
        this.activeInventory = locationState.activeInventory;
        this.activeLocationInventories =
          locationState.activeLocationInventories;
        this.activeProducts = locationState.activeProducts;

        console.group(
          '%cLocation State',
          `font-size: 1rem;
            color: lightgreen;`,
          locationState
        );
        console.groupEnd();
      });

    this._themeService.getThemeMode();
    this.themeSub = this._themeService.themeStatus.subscribe(
      (themeModeData) => {
        this.themeMode = themeModeData;
        this.themePref = themeModeData;
      }
    );
  }

  /**
   *
   * @param intRole
   */
  setUserRoleString(intRole: number): void {
    switch (intRole) {
      case 3:
        this.userRole = 'owner';
        break;
      case 2:
        this.userRole = 'manager';
        break;
      case 1:
        this.userRole = 'staff';
        break;
    }
  }

  /**
   *
   * @param $event
   */
  onThemeModeSwitched($event: any): void {
    let theme = $event.checked ? 'theme-dark' : 'theme-light';
    this._themeService.switchThemeMode(theme);
  }

  // GETTERS/SETTERS
  //
  public get store(): Store<fromAppStore.AppState> {
    return this._store;
  }
  public set store(value: Store<fromAppStore.AppState>) {
    this._store = value;
  }
  //
  public get userStoreSub(): Subscription {
    return this._userStoreSub;
  }
  public set userStoreSub(value: Subscription) {
    this._userStoreSub = value;
  }
  //
  public get businessStoreSub(): Subscription {
    return this._businessStoreSub;
  }
  public set businessStoreSub(value: Subscription) {
    this._businessStoreSub = value;
  }
  //
  public get locationStoreSub(): Subscription {
    return this._locationStoreSub;
  }
  public set locationStoreSub(value: Subscription) {
    this._locationStoreSub = value;
  }
  //
  public get appLoading(): boolean {
    return this._appLoading;
  }
  public set appLoading(value: boolean) {
    this._appLoading = value;
  }
  //
  public get userLoading(): boolean {
    return this._userLoading;
  }
  public set userLoading(value: boolean) {
    this._userLoading = value;
  }
  //
  public get businessLoading(): boolean {
    return this._businessLoading;
  }
  public set businessLoading(value: boolean) {
    this._businessLoading = value;
  }
  //
  public get locationLoading(): boolean {
    return this._locationLoading;
  }
  public set locationLoading(value: boolean) {
    this._locationLoading = value;
  }
  //
  public get themeSub(): Subscription {
    return this._themeSub;
  }
  public set themeSub(value: Subscription) {
    this._themeSub = value;
  }
  //
  public get themeMode(): string {
    return this._themeMode;
  }
  public set themeMode(value: string) {
    this._themeMode = value;
  }
  //
  public get themePref(): string {
    return this._themePref;
  }
  public set themePref(value: string) {
    this._themePref = value;
  }
  //
  public get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }
  public set isAuthenticated(value: boolean) {
    this._isAuthenticated = value;
  }
  //
  public get user(): User {
    return this._user;
  }
  public set user(value: User) {
    this._user = value;
  }
  //
  public get userRole(): string {
    return this._userRole;
  }
  public set userRole(value: string) {
    this._userRole = value;
  }
  //
  public get userDept(): string {
    return this._userDept;
  }
  public set userDept(value: string) {
    this._userDept = value;
  }
  //
  public get userLocations(): Location[] {
    return this._userLocations;
  }
  public set userLocations(value: Location[]) {
    this._userLocations = value;
  }
  //
  public get activeLocation(): Location {
    return this._activeLocation;
  }
  public set activeLocation(value: Location) {
    this._activeLocation = value;
  }
  //
  public get activeLocationInventories(): Inventory[] {
    return this._activeLocationInventories;
  }
  public set activeLocationInventories(value: Inventory[]) {
    this._activeLocationInventories = value;
  }
  //
  public get locationError(): string {
    return this._locationError;
  }
  public set locationError(value: string) {
    this._locationError = value;
  }
  //
  public get activeInventory(): Inventory {
    return this._activeInventory;
  }
  public set activeInventory(value: Inventory) {
    this._activeInventory = value;
  }
  //
  public get inventoryData(): any[] {
    return this._inventoryData;
  }
  public set inventoryData(value: any[]) {
    this._inventoryData = value;
  }
  //
  public get locationProducts(): any[] {
    return this._locationProducts;
  }
  public set locationProducts(value: any[]) {
    this._locationProducts = value;
  }
  //
  public get selectedProducts(): Product[] {
    return this._selectedProducts;
  }
  public set selectedProducts(value: Product[]) {
    this._selectedProducts = value;
  }
  //
  public get activeProducts(): Product[] {
    return this._activeProducts;
  }
  public set activeProducts(value: Product[]) {
    this._activeProducts = value;
  }
}
