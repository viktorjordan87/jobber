import {
  AuthenticateRequest,
  AuthServiceController,
  AuthServiceControllerMethods,
  User,
} from '@jobber/proto';
import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards';
import { UsersService } from '../users/users.service';
import { TokenPayload } from './types';

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  async authenticate(
    request: AuthenticateRequest & { user: TokenPayload },
  ): Promise<User> {
    console.log('request from auth controller', request);
    return this.userService.getUser({ id: request.user.userId });
  }
}
