import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Resolver(()=> User)
export class UsersResolver {

    constructor( private readonly usersService: UsersService) {}

    @Query(()=> [User], { name: 'users' })
    async getUsers() {
        return this.usersService.findMany();
    }

    @Mutation(()=> User)
    async createUser(@Args('createUserDto') createUserDto: CreateUserDto) {
        return this.usersService.createUser(createUserDto);
    }
}
