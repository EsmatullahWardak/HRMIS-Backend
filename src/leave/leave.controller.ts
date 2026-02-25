import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Response } from 'express';

import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @Roles('EMPLOYEE', 'OFFICER')
  async create(@Req() req: any, @Body() createLeaveDto: CreateLeaveDto) {
    const userId = await this.leaveService.getUserIdByEmail(req.user?.email);
    if (!userId) {
      throw new UnauthorizedException('Invalid authenticated user');
    }
    const payload = { ...createLeaveDto, userId };
    return this.leaveService.createLeave(payload);
  }

  @Get()
  @Roles('EMPLOYEE', 'OFFICER', 'ADMIN')
  async findAll(@Req() req: any) {
    if (req.user?.role === 'ADMIN') {
      return this.leaveService.getAllLeaves();
    }
    const userId = await this.leaveService.getUserIdByEmail(req.user?.email);
    if (!userId) {
      throw new UnauthorizedException('Invalid authenticated user');
    }
    return this.leaveService.getLeavesForUser(userId);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLeaveStatusDto) {
    const allowed = ['Approved', 'Rejected'];
    if (!allowed.includes(dto.status)) {
      throw new ForbiddenException('Only Approved or Rejected status is allowed');
    }
    return this.leaveService.updateLeaveStatus(+id, dto.status);
  }

  @Get('pending/count')
  @Roles('ADMIN')
  async getPendingCount() {
    const count = await this.leaveService.getPendingCount();
    return { count };
  }

  // ? JSON report
  @Get('report/monthly')
  @Roles('EMPLOYEE', 'OFFICER', 'ADMIN')
  async getMonthlyReport(
    @Req() req: any,
    @Query('month') month: string,
    @Query('userId') userId: string,
  ) {
    const role = req.user?.role;
    const resolvedUserId =
      role === 'ADMIN' && userId
        ? Number(userId)
        : await this.leaveService.getUserIdByEmail(req.user?.email);
    if (!resolvedUserId) {
      throw new UnauthorizedException('Invalid authenticated user');
    }
    return this.leaveService.getMonthlyReport(resolvedUserId, month);
  }

  // ? CSV download for single user
  @Get('report/monthly/export')
  @Roles('EMPLOYEE', 'OFFICER', 'ADMIN')
  async exportMonthlyReportCsv(
    @Req() req: any,
    @Query('month') month: string,
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    const role = req.user?.role;
    let resolvedUserId: number | null = null;
    if (role === 'ADMIN' && userId) {
      resolvedUserId = Number(userId);
    } else {
      resolvedUserId = await this.leaveService.getUserIdByEmail(req.user?.email);
    }
    if (!resolvedUserId) {
      throw new UnauthorizedException('Invalid authenticated user');
    }

    const report = await this.leaveService.getMonthlyReport(
      resolvedUserId,
      month,
    );

    const header = [
      'ID',
      'Type',
      'Status',
      'Start Date',
      'End Date',
      'Days In Month',
      'Reason',
    ];

    const rows = report.leaves.map((lv: any) => [
      lv.id,
      lv.type,
      lv.status,
      new Date(lv.startDate).toISOString().slice(0, 10),
      new Date(lv.endDate).toISOString().slice(0, 10),
      lv.daysInMonth,
      (lv.reason ?? '').replaceAll('"', '""'),
    ]);

    const csv =
      [header, ...rows]
        .map((r) => r.map((x) => `"${x}"`).join(','))
        .join('\n') + '\n';

    const filename = `leave-report-${month}-user-${resolvedUserId}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);
  }

  // ? CSV download for ALL users
  @Get('report/monthly/export-all')
  @Roles('ADMIN')
  async exportAllLeavesForMonth(
    @Query('month') month: string,
    @Res() res: Response,
  ) {
    const leaves = await this.leaveService.getAllLeavesForMonth(month);

    const header = [
      'ID',
      'User ID',
      'Type',
      'Status',
      'Start Date',
      'End Date',
      'Days In Month',
      'Reason',
    ];

    const rows = leaves.map((lv: any) => [
      lv.id,
      lv.userId ?? '-',
      lv.type,
      lv.status,
      new Date(lv.startDate).toISOString().slice(0, 10),
      new Date(lv.endDate).toISOString().slice(0, 10),
      lv.daysInMonth,
      (lv.reason ?? '').replaceAll('"', '""'),
    ]);

    const csv =
      [header, ...rows]
        .map((r) => r.map((x) => `"${x}"`).join(','))
        .join('\n') + '\n';

    const filename = `leave-report-${month}-all-users.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);
  }
}
