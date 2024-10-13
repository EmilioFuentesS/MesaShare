import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CredencialAdminPage } from './credencial-admin.page';

describe('CredencialAdminPage', () => {
  let component: CredencialAdminPage;
  let fixture: ComponentFixture<CredencialAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CredencialAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
