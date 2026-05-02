import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { FastifyReply } from 'fastify';
import { UsersService } from '../users/users.service';
import { compare } from 'bcryptjs';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto, response: FastifyReply) {
    const user = await this.verifyUser(email, password);
    const expiresIn = parseInt(this.configService.getOrThrow('JWT_EXPIRES_MS'));
    const expiresat = dayjs().add(expiresIn, 'ms').toDate();
    const tokenPayload: TokenPayload = {
      userId: user.id,
      expiresAt: expiresat,
    };
    const accesstoken = await this.jwtService.signAsync(tokenPayload);
    response.setCookie('access_token', accesstoken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      expires: expiresat, //same time as the jwt expires in the cookie
    });
    return user;
  }

  private async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({ email });
      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException('Invalid password');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }
}
