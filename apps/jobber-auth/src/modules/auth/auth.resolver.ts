import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from '../users/models/user.model';
import { LoginDto } from './dto/login.dto';
import { Context } from '@nestjs/graphql';
import { GqlContext } from '@jobber/nestjs';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User)
  async login(
    @Args('loginData') loginData: LoginDto,
    @Context() context: GqlContext,
  ) {
    return this.authService.login(loginData, context.res);
  }
}
