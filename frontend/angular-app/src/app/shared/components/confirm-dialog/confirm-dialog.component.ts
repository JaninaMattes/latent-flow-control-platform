import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  IGalleriaImageCategory,
  ImageContent,
} from 'src/app/models/image-content.model';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.sass'],
})
export class ConfirmDialogComponent implements OnInit {
  categories: IGalleriaImageCategory[] = [];
  selectedCategory: IGalleriaImageCategory | null = null;

  images: ImageContent[] = [];
  selectedImages: ImageContent[] = [];

  constructor(
    private readonly contentService: ContentService,
    private readonly dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { interpolation: number }
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  public selectImage(img: ImageContent): void {
    const index = this.selectedImages.findIndex((i) => i.id === img.id);

    if (index > -1) {
      this.selectedImages.splice(index, 1);
      return;
    }

    if (this.selectedImages.length < 2) {
      this.selectedImages.push(img);
    }
  }

  public isSelected(img: ImageContent): boolean {
    return this.selectedImages.some((i) => i.id === img.id);
  }

  public confirm(): void {
    this.dialogRef.close({
      images: this.selectedImages,
      interpolation: this.data.interpolation,
    });
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public selectCategory(category: IGalleriaImageCategory): void {
    if (this.selectedCategory?.id === category.id) return;

    this.selectedCategory = category;
    this.selectedImages = [];
    console.log(`Selected category ${this.selectedCategory.category}`);

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
        this.images = data;
      },
      error: (err) => console.error('Failed to fetch images', err),
    });
  }
}
