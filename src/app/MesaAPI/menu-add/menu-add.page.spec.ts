import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuAddPage } from './menu-add.page';

describe('MenuAddPage', () => {
  let component: MenuAddPage;
  let fixture: ComponentFixture<MenuAddPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
