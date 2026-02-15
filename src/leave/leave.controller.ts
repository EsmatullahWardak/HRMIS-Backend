import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
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
  @Roles('EMPLOYEE', 'OFFICER', 'MANAGER')
  create(@Req() req: any, @Body() createLeaveDto: CreateLeaveDto) {
    const userId = req.user?.sub;
    const role = req.user?.role;
    const payload =
      role === 'EMPLOYEE'
        ? { ...createLeaveDto, userId }
        : { ...createLeaveDto, userId: createLeaveDto.userId ?? userId };
    return this.leaveService.createLeave(payload);
  }

  @Get()
  @Roles('EMPLOYEE', 'OFFICER', 'MANAGER')
  findAll(@Req() req: any) {
    if (req.user?.role === 'EMPLOYEE') {
      return this.leaveService.getLeavesForUser(req.user.sub);
    }
    return this.leaveService.getAllLeaves();
  }

  @Patch(':id/status')
  @Roles('OFFICER', 'MANAGER')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLeaveStatusDto) {
    return this.leaveService.updateLeaveStatus(+id, dto.status);
  }

  // ? JSON report
  @Get('report/monthly')
  @Roles('EMPLOYEE', 'OFFICER', 'MANAGER')
  getMonthlyReport(
    @Req() req: any,
    @Query('month') month: string,
    @Query('userId') userId: string,
  ) {
    const role = req.user?.role;
    const resolvedUserId =
      role === 'EMPLOYEE'
        ? req.user.sub
        : userId
          ? Number(userId)
          : req.user.sub;
    return this.leaveService.getMonthlyReport(resolvedUserId, month);
  }

  // ? CSV download for single user
  @Get('report/monthly/export')
  @Roles('EMPLOYEE', 'OFFICER', 'MANAGER')
  async exportMonthlyReportCsv(
    @Req() req: any,
    @Query('month') month: string,
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    const role = req.user?.role;
    const resolvedUserId =
      role === 'EMPLOYEE'
        ? req.user.sub
        : userId
          ? Number(userId)
          : req.user.sub;

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
  @Roles('OFFICER', 'MANAGER')
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
