import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let svc: AuthService;
  let jwt: { sign: jest.Mock };
  beforeEach(async () => {
    jwt = { sign: jest.fn().mockReturnValue('token') };
    const mod = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: (k: string) => {
              if (k === 'AUTH_USER') {
                return 'admin';
              } else if (k === 'AUTH_PASS') {
                return 'admin';
              } else if (k === 'JWT_SECRET') {
                return 's';
              } else {
                return '1h';
              }
            },
          },
        },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    svc = mod.get(AuthService);
  });

  it('validate ok', () => expect(svc.validate('admin', 'admin')).toBe(true));
  it('signToken usa JwtService', () => {
    expect(svc.signToken('u1')).toBe('token');
    expect(jwt.sign).toHaveBeenCalledWith({ sub: 'u1' });
  });
});
