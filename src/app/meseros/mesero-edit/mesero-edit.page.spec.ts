import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeseroEditPage } from './mesero-edit.page';

describe('MeseroEditPage', () => {
  let component: MeseroEditPage;
  let fixture: ComponentFixture<MeseroEditPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MeseroEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
