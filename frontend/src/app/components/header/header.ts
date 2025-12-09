import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, ReadyArgs, typeEventArgs } from 'keycloak-angular';
import { ButtonModule } from 'primeng/button';
import Keycloak from 'keycloak-js';
import { Hamburgmenu } from '../hamburgmenu/hamburgmenu';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule, ButtonModule, Hamburgmenu],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  menuItems = [      
      { label: 'Dashboard', routerLink: '/'},
      { label: 'All Tasks', routerLink: '/tasks'},  
    
    ];

  authenticated = signal(false);  // ← Signal statt boolean
  keycloakStatus: string | undefined;
  username = signal<string | undefined>(undefined);  // ← Signal
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

startTokenRefresh() {    //页面一直保持登录状态，直到达到sso session max. Lifespan
   if (!this.keycloak) return; // SSR-Guard

  setInterval(async () => {
    try {
      const refreshed = await this.keycloak.updateToken(30); // 剩余 <30s 刷新, 返回一个布尔值：是否真正刷新了 token
      const token = this.keycloak.token;
      //console.log(this.keycloak.token); // token 字符串
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const remaining = payload.exp - Math.floor(Date.now() / 1000);
        console.log(`🔄 Token refreshed: ${refreshed}, expires in: ${remaining}s`);
      }
    } catch (err) {
      console.error('❌ Token refresh failed or session expired', err);
    }
  }, 30000); // 每 30 秒检查一次
} 


  constructor() {
    // SSR-Guard: Effect nur ausführen wenn Keycloak verfügbar
    if (this.keycloakSignal) {
    effect(() => {
      const keycloakEvent = this.keycloakSignal();

       console.log('🔍 Keycloak Event:', keycloakEvent.type, keycloakEvent.args);

      this.keycloakStatus = keycloakEvent.type;

      if (keycloakEvent.type === KeycloakEventType.Ready) {
        this.authenticated.set(this.keycloak!.authenticated || false);

        console.log('✅ Ready event - authenticated:', this.authenticated());
       
        if(this.authenticated()){
          this.loadUserInfo();

          // 登录完成后启动 token 自动刷新
          this.startTokenRefresh();
        }
      }

      if (keycloakEvent.type === KeycloakEventType.AuthSuccess) {
          this.authenticated.set(true);  // ← .set()
          console.log('✅ AuthSuccess - user authenticated');
          this.loadUserInfo();
          this.startTokenRefresh();
        }

      if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
        this.authenticated.set(false);
        this.username.set(undefined);
      }
    });
   
  }
  }

async loadUserInfo(){
  if (!this.keycloak) return; // SSR-Guard
  try{
    const profile = await this.keycloak.loadUserProfile();
      this.username.set(profile.firstName || profile.username || 'User');
  }catch(err){
    console.error('Failed to load user profile', err);
  }
}
  
async login() {
  if (!this.keycloak) return; // SSR-Guard
  await this.keycloak.login({
    redirectUri: window.location.origin,
  });  
}

logout() {
  if (!this.keycloak) return; // SSR-Guard
    this.keycloak.logout();
  }

}
