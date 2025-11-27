import { Controller, Get, Delete, Put, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService){}

    @Get('')
    async getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Put(':id')
    async updateUser(@Param('id') id: string, @Body() updateData: { name: string; email: string }) {
        return this.usersService.updateUser(+id, updateData);
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(+id);
    }
}