import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { canActivateAuthRole} from './keycloak-guard';


describe('keycloakGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => canActivateAuthRole(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
