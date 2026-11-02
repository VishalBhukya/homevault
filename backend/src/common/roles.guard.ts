import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

/** Allows only household OWNER / ADMIN users through. */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const user = ctx.switchToHttp().getRequest().user;
    if (user?.role === 'OWNER' || user?.role === 'ADMIN') return true;
    throw new ForbiddenException('Only household owners or admins can do this');
  }
}
