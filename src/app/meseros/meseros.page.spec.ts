import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeserosPage } from './meseros.page';

describe('MeserosPage', () => {
  let component: MeserosPage;
  let fixture: ComponentFixture<MeserosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MeserosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
