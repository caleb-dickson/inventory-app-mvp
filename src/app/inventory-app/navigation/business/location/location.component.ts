import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/inventory-app/core/base-component';

import { Store } from '@ngrx/store';
import * as fromAppStore from '../../../../app-store/app.reducer';
import { ThemeService } from 'src/app/theme/theme.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {

  // constructor(store: Store<fromAppStore.AppState>, themeService: ThemeService,) {
  //   super(store, themeService);
  // }

  ngOnInit(): void {
  }

}
