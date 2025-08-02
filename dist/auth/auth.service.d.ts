import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly cfg;
    private readonly jwt;
    constructor(cfg: ConfigService, jwt: JwtService);
    validate(username: string, password: string): boolean;
    signToken(sub: string): string;
}
