import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCompareComponent } from './image-compare.component';

describe('ImageCompareComponent', () => {
  let component: ImageCompareComponent;
  let fixture: ComponentFixture<ImageCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageCompareComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
