import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  create(@Body() createLeaveDto: CreateLeaveDto) {
    return this.leaveService.createLeave(createLeaveDto);
  }

  @Get()
  findAll() {
    return this.leaveService.getAllLeaves();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLeaveStatusDto) {
    return this.leaveService.updateLeaveStatus(+id, dto.status);
  }

  // ✅ JSON report
  @Get('report/monthly')
  getMonthlyReport(
    @Query('month') month: string,
    @Query('userId') userId: string,
  ) {
    return this.leaveService.getMonthlyReport(Number(userId), month);
  }

  // ✅ CSV download
  @Get('report/monthly/export')
  async exportMonthlyReportCsv(
    @Query('month') month: string,
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    const report = await this.leaveService.getMonthlyReport(
      Number(userId),
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

    const filename = `leave-report-${month}-user-${userId}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);
  }
}
