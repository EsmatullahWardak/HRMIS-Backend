import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateShiftChangeDto } from './dto/create-shift-change.dto';

@Injectable()
export class ShiftChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async createShiftChange(createShiftChangeDto: CreateShiftChangeDto) {
    return this.prisma.shiftChange.create({
      data: {
        shiftDate: new Date(createShiftChangeDto.shiftDate),
        currentShift: createShiftChangeDto.currentShift,
        requestedShift: createShiftChangeDto.requestedShift,
        reason: createShiftChangeDto.reason || null,
        status: 'Pending',
        userId: createShiftChangeDto.userId || null,
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

  async getAllShiftChanges() {
    return this.prisma.shiftChange.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getShiftChangesForUser(userId: number) {
    return this.prisma.shiftChange.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateShiftChangeStatus(id: number, status: string) {
    return this.prisma.shiftChange.update({
      where: { id },
      data: { status },
    });
  }

  async getPendingCount() {
    return this.prisma.shiftChange.count({
      where: { status: 'Pending' },
    });
  }
}
