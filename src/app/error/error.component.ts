import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html'
})
export class ErrorComponent {

  constructor(private location: Location) { }

  onErrorBack() {
    this.location.back();
  }

}
