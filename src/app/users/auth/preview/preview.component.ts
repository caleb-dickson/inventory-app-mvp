import { Component, OnInit } from '@angular/core';
import { UserService } from '../../user-control/user.service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  constructor(private _userService: UserService) { }

  ngOnInit(): void {
  }

  onPreviewLogin(accType: string) {
    this._userService.onPreviewLogin(accType)
  }

}
