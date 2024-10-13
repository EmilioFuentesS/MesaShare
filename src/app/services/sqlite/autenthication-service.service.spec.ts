import { TestBed } from '@angular/core/testing';
import { AutenthicationServiceService } from './autenthication-service.service'; // Nombre correcto del servicio

describe('AutenthicationService', () => {
  let service: AutenthicationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutenthicationServiceService); // Inyectar el servicio correctamente
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
