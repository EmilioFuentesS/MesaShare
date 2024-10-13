import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrGeneratorPage } from './qr-generator.page';

describe('QrGeneratorPage', () => {
  let component: QrGeneratorPage;
  let fixture: ComponentFixture<QrGeneratorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QrGeneratorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
