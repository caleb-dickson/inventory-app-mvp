import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../app-store/app.reducer';
import * as BusinessActions from '../business-store/business.actions';

import { environment } from 'src/environments/environment';

import { Business } from './business.model';
import { Location } from './location.model';
import { catchError, map, of } from 'rxjs';

const BACKEND_URL = environment.apiUrl + '/business';

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  constructor(
    private http: HttpClient,
    private store: Store<fromAppStore.AppState>
  ) {}

}
