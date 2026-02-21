import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createData: {
    name: string;
    email: string;
    password: string;
    is_active: boolean;
    role: 'ADMIN' | 'OFFICER' | 'EMPLOYEE';
  }) {
    const hashedPassword = await bcrypt.hash(createData.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: createData.name,
        email: createData.email,
        password: hashedPassword,
        is_active: createData.is_active,
        role: createData.role,
      },
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getActiveUsers() {
    const users = await this.prisma.user.findMany({
      where: { is_active: true },
    });
    return users;
  }
  async getInactiveUsers() {
    const users = await this.prisma.user.findMany({
      where: { is_active: false },
    });
    return users;
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    role?: string;
  }) {
    const { page, limit, search = '', status = '', role = '' } = params;
    const skip = (page - 1) * limit;
    const normalizedRole = role.toUpperCase();
    const isRoleFilterValid =
      normalizedRole === Role.ADMIN ||
      normalizedRole === Role.OFFICER ||
      normalizedRole === Role.EMPLOYEE;

    const where: any = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(status === 'active' ? { is_active: true } : {}),
      ...(status === 'inactive' ? { is_active: false } : {}),
      ...(isRoleFilterValid ? { role: normalizedRole } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSummary() {
    const [total, active, inactive, admins, officers, employees] =
      await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { is_active: true } }),
      this.prisma.user.count({ where: { is_active: false } }),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
      this.prisma.user.count({ where: { role: Role.OFFICER } }),
      this.prisma.user.count({ where: { role: Role.EMPLOYEE } }),
    ]);

    return {
      total,
      active,
      inactive,
      admins,
      officers,
      employees,
    };
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id: id },
    });
  }

  async updateUser(
    id: number,
    updateData: {
      name: string;
      email: string;
      is_active?: boolean;
      role?: 'ADMIN' | 'OFFICER' | 'EMPLOYEE';
    },
  ) {
    return this.prisma.user.update({
      where: { id: id },
      data: updateData,
    });
  }
}
