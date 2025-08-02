import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: { username: string; password: string }): {
    access_token: string;
  } {
    const ok = this.auth.validate(body.username, body.password);
    if (!ok) throw new Error('Invalid credentials');
    return { access_token: String(this.auth.signToken(body.username)) };
  }
}
