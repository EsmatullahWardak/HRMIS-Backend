// import { Controller, Post, Body } from '@nestjs/common';
import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerNewUser(@Body() data: RegisterDto) {
    return this.authService.registerUser(data);
  }

  @Post('login')
  async loginUser(@Body() data: LoginDto) {
    return this.authService.loginUser(data);
  }

}