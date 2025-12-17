import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  IGalleriaImageCategory,
  ImageContent,
} from 'src/app/models/image-content.model';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmDialogComponent implements OnInit {
  categories: IGalleriaImageCategory[] = [];
  selectedCategory: IGalleriaImageCategory | null = null;

  allImages: ImageContent[] = [];
  selectedImages: string[] = []; // keeps track of images based on their ID

  constructor(
    private readonly contentService: ContentService,
    private readonly dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  /**
   * Methods for button interaction with user.
   */
  public confirm(): void {
    this.dialogRef.close({
      selectedImages: this.selectedImages,
    });
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public onSelectionChange(event: { id: string; selected: boolean }): void {
    if (event.selected) {
      if (this.selectedImages.length < 2) {
        this.selectedImages.push(event.id);
      }
    } else {
      this.selectedImages = this.selectedImages.filter((id) => id !== event.id);
    }
  }

  /**
   * Set specific category.
   * @param category
   * @returns
   */
  public selectCategory(category: IGalleriaImageCategory): void {
    if (this.selectedCategory?.id === category.id) return;
    this.selectedCategory = category;
    this.allImages = [];
    this.fetchImagesByCategory(this.selectedCategory.id);
  }

  private fetchCategories(): void {
    this.contentService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.selectCategory(data[0]); // Select default category
      },
      error: (err) => console.error('Failed to fetch categories', err),
    });
  }

  private fetchImagesByCategory(categoryId: string): void {
    this.contentService.getAllImagesByCategory(categoryId).subscribe({
      next: (data) => {
        this.allImages = data;
      },
      error: (err) => console.error('Failed to fetch images', err),
    });
  }
}
