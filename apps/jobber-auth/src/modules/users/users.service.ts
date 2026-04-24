import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './models/user.model';
import { Prisma } from '@prisma-clients/jobber-auth';
import { hash } from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}

    async findMany(): Promise<User[]> {
        return this.prismaService.user.findMany();
    }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.prismaService.user.create({
            data: {
                ...data,
                password: await hash(data.password, 10),
            }
        });
    }
}
