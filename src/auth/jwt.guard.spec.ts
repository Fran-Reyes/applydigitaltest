import { JwtGuard } from './jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext } from '@nestjs/common';

function req(auth?: string): { headers: { authorization?: string } } {
  return { headers: { authorization: auth } };
}

describe('JwtGuard', () => {
  it('acepta token válido', async () => {
    const mockJwtService: Partial<JwtService> = {
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'u' }),
      sign: jest.fn(),
      signAsync: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const guard = new JwtGuard({
      ...mockJwtService,
      logger: mockLogger,
    } as JwtService & { logger: typeof mockLogger });

    const ctx = {
      switchToHttp: () => ({ getRequest: () => req('Bearer abc') }),
      getType: () => 'http',
      getClass: () => ({}),
      getHandler: () => ({}),
      getArgs: () => [],
      getArgByIndex: () => undefined,
    } as unknown as ExecutionContext;
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('rechaza si falta token', async () => {
    const mockJwtService: Partial<JwtService> = {
      verifyAsync: jest.fn(),
      sign: jest.fn(),
      signAsync: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    };
    const guard = new JwtGuard(mockJwtService as JwtService);
    const ctx = {
      switchToHttp: () => ({ getRequest: () => req() }),
      getType: () => 'http',
      getClass: () => ({}),
      getHandler: () => ({}),
      getArgs: () => [],
      getArgByIndex: () => undefined,
    } as unknown as ExecutionContext;
    await expect(guard.canActivate(ctx)).rejects.toHaveProperty('status', 401);
  });
});
