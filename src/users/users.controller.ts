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

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('status') status = '',
  ) {
    return this.usersService.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
      status,
    });
  }

  @Get('summary')
  getSummary() {
    return this.usersService.getSummary();
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
