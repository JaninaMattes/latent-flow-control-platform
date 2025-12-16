import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageCardViewComponent } from '../image-card-view.component';


describe('ImageCardViewComponent', () => {
  let component: ImageCardViewComponent;
  let fixture: ComponentFixture<ImageCardViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageCardViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
