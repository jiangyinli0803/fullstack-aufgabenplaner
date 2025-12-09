import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient,  withFetch,  withInterceptors} from '@angular/common/http';
import { createInterceptorCondition, INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG, IncludeBearerTokenCondition, includeBearerTokenInterceptor, KEYCLOAK_EVENT_SIGNAL, KeycloakService, provideKeycloak } from 'keycloak-angular';
import { dummyKeycloak } from './auth/keycloak.dummy';
import Keycloak from 'keycloak-js';


function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback für SSR oder Build-Zeit
  return 'http://localhost:4200';
}

const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: /^(http:\/\/localhost:8080)(\/.*)?$/i,
  bearerPrefix: 'Bearer'
});

// 👇 prüfen, ob wir im Browser sind
const isBrowser = typeof window !== 'undefined';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    providePrimeNG({
            ripple: true,
            theme: {
                preset: Aura,
                
            }
    }),
    // HttpClient - Interceptor nur im Browser
    provideHttpClient(
      withFetch(),
      isBrowser 
        ? withInterceptors([includeBearerTokenInterceptor])
        : withInterceptors([])
    ),

    // Keycloak nur im Browser
    ...(isBrowser ? [
      provideKeycloak({
        config: {
          url: 'http://localhost:8080',
          realm: 'myrealm',
          clientId: 'aufgabenplaner',
        },
        initOptions: {
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: getBaseUrl() + '/silent-check-sso.html',
          checkLoginIframe: false,
        },
      }),
      {
        provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
        useValue: [urlCondition]
      }
    ] : [
       // SSR: Dummy-Provider
      {
        provide: Keycloak,
        useValue: dummyKeycloak
      },
      {
        provide: KEYCLOAK_EVENT_SIGNAL,
        useValue: signal({ type: 'Unknown', args: null })
      }
    ])

 ]

}
