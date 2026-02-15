import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLeavesForUser(userId: number) {
    return this.prisma.leave.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateLeaveStatus(id: number, status: string) {
    return this.prisma.leave.update({
      where: { id },
      data: { status },
    });
  }

  // ✅ Monthly report data (for single user)
  async getMonthlyReport(userId: number, month: string) {
    const [yearStr, monthStr] = month.split('-');
    const year = Number(yearStr);
    const m = Number(monthStr);

    const monthStart = new Date(Date.UTC(year, m - 1, 1, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(year, m, 0, 23, 59, 59));

    const leaves = await this.prisma.leave.findMany({
      where: {
        userId,
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      },
      orderBy: { startDate: 'asc' },
    });

    const msPerDay = 24 * 60 * 60 * 1000;
    const clamp = (d: Date, min: Date, max: Date) =>
      new Date(Math.min(max.getTime(), Math.max(min.getTime(), d.getTime())));
    const daysInclusive = (a: Date, b: Date) =>
      Math.floor((b.getTime() - a.getTime()) / msPerDay) + 1;

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let totalDays = 0;

    const rows = leaves.map((lv) => {
      const s = clamp(new Date(lv.startDate), monthStart, monthEnd);
      const e = clamp(new Date(lv.endDate), monthStart, monthEnd);
      const daysInMonth = daysInclusive(s, e);

      totalDays += daysInMonth;
      byStatus[lv.status] = (byStatus[lv.status] ?? 0) + daysInMonth;
      byType[lv.type] = (byType[lv.type] ?? 0) + daysInMonth;

      return {
        id: lv.id,
        type: lv.type,
        status: lv.status,
        startDate: lv.startDate,
        endDate: lv.endDate,
        reason: lv.reason,
        daysInMonth,
      };
    });

    return {
      month,
      userId,
      monthStart,
      monthEnd,
      totalDays,
      byStatus,
      byType,
      leaves: rows,
    };
  }

  // ✅ Monthly report for ALL users
  async getAllLeavesForMonth(month: string) {
    const [yearStr, monthStr] = month.split('-');
    const year = Number(yearStr);
    const m = Number(monthStr);

    const monthStart = new Date(Date.UTC(year, m - 1, 1, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(year, m, 0, 23, 59, 59));

    const leaves = await this.prisma.leave.findMany({
      where: {
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      },
      orderBy: { startDate: 'asc' },
    });

    const msPerDay = 24 * 60 * 60 * 1000;
    const clamp = (d: Date, min: Date, max: Date) =>
      new Date(Math.min(max.getTime(), Math.max(min.getTime(), d.getTime())));
    const daysInclusive = (a: Date, b: Date) =>
      Math.floor((b.getTime() - a.getTime()) / msPerDay) + 1;

    return leaves.map((lv) => {
      const s = clamp(new Date(lv.startDate), monthStart, monthEnd);
      const e = clamp(new Date(lv.endDate), monthStart, monthEnd);
      const daysInMonth = daysInclusive(s, e);

      return {
        id: lv.id,
        userId: lv.userId,
        type: lv.type,
        status: lv.status,
        startDate: lv.startDate,
        endDate: lv.endDate,
        reason: lv.reason,
        daysInMonth,
      };
    });
  }
}
