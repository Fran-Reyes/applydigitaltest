import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { access_token: { type: 'string' } },
    },
  })
  login(@Body() dto: LoginDto) {
    const ok = this.auth.validate(dto.username, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return { access_token: this.auth.signToken(dto.username) };
  }
}
