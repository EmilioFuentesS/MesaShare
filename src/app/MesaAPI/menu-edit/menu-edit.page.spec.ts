import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuEditPage } from './menu-edit.page';

describe('MenuEditPage', () => {
  let component: MenuEditPage;
  let fixture: ComponentFixture<MenuEditPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
