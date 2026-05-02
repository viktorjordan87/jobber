import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
// import { GqlAuthGuard } from '../auth/guards';
// import { UseGuards } from '@nestjs/common';
// import { CurrentUser } from '../auth/decorators';
// import { TokenPayload } from '../auth/types';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  async getUsers() {
    // @CurrentUser() {userId} : TokenPayload
    // console.log(userId);
    return this.usersService.findMany();
  }

  @Mutation(() => User)
  async createUser(@Args('createUserDto') createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }
}
