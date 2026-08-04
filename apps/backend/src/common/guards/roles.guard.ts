import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@ims/database';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('User identity not established');
    }

    // Single enterprise ADMIN role has full system access
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    throw new ForbiddenException('Access restricted to System Administrators');
  }
}
