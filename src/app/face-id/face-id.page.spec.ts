import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaceID } from './face-id.page';

describe('FaceIDPage', () => {
  let component: FaceID;
  let fixture: ComponentFixture<FaceID>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FaceID);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
