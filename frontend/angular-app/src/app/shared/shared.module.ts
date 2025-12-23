import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatCardModule} from '@angular/material/card';
import {MatSliderModule} from '@angular/material/slider';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfilePictureComponent } from './components/profile-picture/profile-picture.component';
import { ProfileDialogComponent } from './components/profile-dialog/profile-dialog.component';
import { CardViewComponent } from './components/card-view/card-view.component';
import { SliderThumbComponent } from './components/slider-thumb/slider-thumb.component';
import { ImageCardViewComponent } from './components/image-card-view/image-card-view.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { CarouselComponent } from './components/carousel/carousel.component';

const components = [
  HeaderComponent,
  FooterComponent,
  SnackbarComponent,
  ProfilePictureComponent,
  ProfileDialogComponent,
  CardViewComponent,
  ImageCardViewComponent,
  SliderThumbComponent,
  ConfirmDialogComponent,
  CarouselComponent
];

const modules = [
  CommonModule,
  MatDialogModule,
  MatDividerModule,
  MatSliderModule,
  MatIconModule,
  MatMenuModule,
  MatProgressBarModule,
  FormsModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatCheckboxModule,
  MatRadioModule,
  MatSlideToggleModule,
  MatTabsModule,
  MatTooltipModule,
  MatExpansionModule,
  MatCardModule,
  TranslateModule,
  RouterModule,
];

@NgModule({
  declarations: components,
  imports: modules,
  exports: [components, modules],
})
export class SharedModule {}
