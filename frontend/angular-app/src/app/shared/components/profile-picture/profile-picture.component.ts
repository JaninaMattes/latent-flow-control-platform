import { Component, Input } from '@angular/core';
import { IGoogleAuthUser } from 'src/app/models/google-auth-user.model';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.sass']
})
export class ProfilePictureComponent {
  @Input() user: IGoogleAuthUser | null = null;
  @Input() size: number = 24;
}
