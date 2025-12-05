import {
  Controller,
  Get,
  Delete,
  Put,
  Post,
  Param,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(
    @Body()
    createData: {
      name: string;
      email: string;
      password: string;
      is_active: boolean;
    },
  ) {
    return this.usersService.createUser(createData);
  }

  @Get('active')
  async getAllUsers() {
    return this.usersService.getActiveUsers();
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: { name: string; email: string; is_active?: boolean },
  ) {
    return this.usersService.updateUser(+id, updateData);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(+id);
  }
}
