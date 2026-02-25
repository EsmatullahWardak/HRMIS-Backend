import {
  Controller,
  Get,
  Delete,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  async createUser(
    @Body()
    createData: {
      name: string;
      email: string;
      password: string;
      is_active: boolean;
      role: 'ADMIN' | 'OFFICER' | 'EMPLOYEE';
    },
  ) {
    return this.usersService.createUser(createData);
  }

  @Get()
  @Roles('ADMIN', 'OFFICER')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('status') status = '',
    @Query('role') role = '',
  ) {
    return this.usersService.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
      status,
      role,
    });
  }

  @Get('summary')
  @Roles('ADMIN', 'OFFICER')
  getSummary() {
    return this.usersService.getSummary();
  }

  @Get('active')
  @Roles('ADMIN', 'OFFICER')
  async getAllUsers() {
    return this.usersService.getActiveUsers();
  }
  @Get('inactive')
  @Roles('ADMIN', 'OFFICER')
  async getInactiveUsers() {
    return this.usersService.getInactiveUsers();
  }

  @Put(':id')
  @Roles('ADMIN')
  async updateUser(
    @Param('id') id: string,
    @Body()
    updateData: {
      name: string;
      email: string;
      is_active?: boolean;
      role?: 'ADMIN' | 'OFFICER' | 'EMPLOYEE';
    },
  ) {
    return this.usersService.updateUser(+id, updateData);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(+id);
  }
}
