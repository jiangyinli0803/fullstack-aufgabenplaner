// src/app/auth/keycloak-guard.ts
import { createAuthGuard, AuthGuardData } from 'keycloak-angular';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { inject } from '@angular/core';

/**
 * Diese Funktion prüft:
 * 1. ob der User eingeloggt ist,
 * 2. ob Routen-Rollen erforderlich sind und
 * 3. ob der User diese Rollen hat.
 */
const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  __: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData; // 从 authData 中解构出用户认证状态和角色信息
  const router = inject(Router);
  const requiredRoles = route.data['role'] ?? []; //获取访问该路由所需的角色 注意：这是数组

  // 添加调试日志
 /* console.log('=== Auth Guard Debug ===');
  console.log('authenticated:', authenticated);
  console.log('requiredRole from route:', requiredRoles);
  console.log('grantedRoles:', grantedRoles);
  console.log('resourceRoles:', grantedRoles.resourceRoles);
  */
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;    // 没有特定角色要求，完全公开访问   选项：return authenticated;允许所有已认证用户  
  }

  const hasRequiredRole = (): boolean => {
    
    //const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]; // 将路由要求的角色数组转换为字符串数组进行检查

    return requiredRoles.some((requiredRole: string) =>    
      Object.values(grantedRoles.resourceRoles).some((roles) => roles.includes(requiredRole)))
    }
   

  console.log(hasRequiredRole());

  if (authenticated && hasRequiredRole()) {
    return true;
  }
  
   return router.parseUrl('/unauthorised');
};

export const canActivateAuthRole = createAuthGuard<CanActivateFn>(isAccessAllowed);