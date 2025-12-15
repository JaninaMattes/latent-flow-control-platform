import { Component, inject, OnInit } from '@angular/core';
import { ContentService } from '../shared/services/content.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.sass'],
})
export class ContentComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  interpolationValue: number = 50;

  constructor(private readonly contentService: ContentService) {}
  
  ngOnInit(): void {}

  public onInterpolationChange(value: number): void {
    console.log('Interpolation value changed:', value);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '900px',
      disableClose: true,
      data: {
        interpolation: this.interpolationValue,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const { images, interpolation } = result;

      console.log('Selected images:', images);
      console.log('Interpolation:', interpolation);
    });
  }
}
