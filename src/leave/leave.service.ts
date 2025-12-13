import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
// import { CreateLeaveDto } from './dto/create-leave.dto';
import { CreateLeaveDto } from './dto/create-leave.dto';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async createLeave(createLeaveDto: CreateLeaveDto) {
    return this.prisma.leave.create({
      data: {
        type: createLeaveDto.type,
        startDate: new Date(createLeaveDto.startDate),
        endDate: new Date(createLeaveDto.endDate),
        reason: createLeaveDto.reason || null,
        status: createLeaveDto.status || 'Pending',
        userId: createLeaveDto.userId || null,
      },
    });
  }

  async getAllLeaves() {
    return this.prisma.leave.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateLeaveStatus(id: number, status: string) {
    return this.prisma.leave.update({
      where: { id },
      data: { status },
    });
  }
}
