import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { Res } from '@nestjs/common';
import type { Response } from 'express';

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

  // ✅ PASTE IT HERE (inside the class)
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
