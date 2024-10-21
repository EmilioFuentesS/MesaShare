import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValoracionPage } from './valoracion.page';

describe('ValoracionPage', () => {
  let component: ValoracionPage;
  let fixture: ComponentFixture<ValoracionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ValoracionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
