import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOvertimeDto } from './dto/create-overtime.dto';

@Injectable()
export class OvertimeService {
  constructor(private readonly prisma: PrismaService) {}

  async createOvertime(createOvertimeDto: CreateOvertimeDto) {
    return this.prisma.overtime.create({
      data: {
        workDate: new Date(createOvertimeDto.workDate),
        hours: Number(createOvertimeDto.hours),
        reason: createOvertimeDto.reason || null,
        status: 'Pending',
        userId: createOvertimeDto.userId || null,
      },
    });
  }

  async getUserIdByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  async getAllOvertimeRequests() {
    return this.prisma.overtime.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOvertimeForUser(userId: number) {
    return this.prisma.overtime.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOvertimeStatus(id: number, status: string) {
    return this.prisma.overtime.update({
      where: { id },
      data: { status },
    });
  }

  async getPendingCount() {
    return this.prisma.overtime.count({
      where: { status: 'Pending' },
    });
  }
}

