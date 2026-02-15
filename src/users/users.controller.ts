import {
  Controller,
  Get,
  Delete,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER', 'OFFICER')
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
  @Get('inactive')
  async getInactiveUsers() {
    return this.usersService.getInactiveUsers();
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
