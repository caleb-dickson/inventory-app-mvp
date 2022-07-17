import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  currentYear: number;

  lastUpdate: Date;
  version: string;

  constructor() {}

  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
    this.lastUpdate = environment.lastUpdate;
    this.version = environment.version;
  }
}
