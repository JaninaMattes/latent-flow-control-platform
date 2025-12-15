import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderThumbComponent } from '../slider-thumb.component';

describe('SliderThumbComponent', () => {
  let component: SliderThumbComponent;
  let fixture: ComponentFixture<SliderThumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SliderThumbComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SliderThumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
