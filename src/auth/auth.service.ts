import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(data: RegisterDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const usersCount = await this.prisma.user.count();
    const role: Role = usersCount === 0 ? Role.ADMIN : Role.EMPLOYEE;

    try {
      const user = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role,
        },
      });

      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async loginUser(data: LoginDto) {
    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    // 2. Check if user exists
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Compare passwords
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 4. Generate JWT token with name and email
    const payload = {
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const auth_token = this.jwtService.sign(payload);

    // 5. Return user data (without password) and authToken
    const { password, ...userWithoutPassword } = user;
    return {
    ...userWithoutPassword,
    auth_token,
    };
  }

}
