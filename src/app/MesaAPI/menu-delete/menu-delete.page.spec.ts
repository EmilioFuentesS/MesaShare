import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuDeletePage } from './menu-delete.page';

describe('MenuDeletePage', () => {
  let component: MenuDeletePage;
  let fixture: ComponentFixture<MenuDeletePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuDeletePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
