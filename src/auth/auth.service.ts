import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly cfg: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  validate(username: string, password: string) {
    const u = this.cfg.get<string>('AUTH_USER') ?? 'admin';
    const p = this.cfg.get<string>('AUTH_PASS') ?? 'admin';
    return username === u && password === p;
  }

  signToken(sub: string): string {
    return this.jwt.sign({ sub });
  }
}
