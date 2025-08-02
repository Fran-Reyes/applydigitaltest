import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

type JwtPayload = { sub: string; iat?: number; exp?: number } & Record<
  string,
  unknown
>;

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const auth = req.headers.authorization?.toString() ?? '';

    const match = RegExp(/^Bearer\s+(.+)$/i).exec(auth);
    if (!match) throw new UnauthorizedException('Missing Bearer token');

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(match[1]);
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
