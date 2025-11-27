import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
constructor (private readonly prisma: PrismaService) {}




  async getAllUsers() {
  const users = await this.prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return users;
}



async deleteUser(id: number) {
  return this.prisma.user.delete({
    where: { id: id },
  });
}

async updateUser(id: number, updateData: { name: string; email: string }) {
  return this.prisma.user.update({
    where: { id: id },
    data: updateData,
  });   
}}
