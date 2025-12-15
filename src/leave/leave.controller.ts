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

@Controller('leave') // base route: /leave
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  // POST /leave
  @Post()
  create(@Body() createLeaveDto: CreateLeaveDto) {
    return this.leaveService.createLeave(createLeaveDto);
  }

  // GET /leave
  @Get()
  findAll() {
    return this.leaveService.getAllLeaves();
  }

  // PATCH /leave/:id/status
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLeaveStatusDto) {
    return this.leaveService.updateLeaveStatus(+id, dto.status);
  }

  // ✅ GET /leave/report/monthly?month=2025-01&userId=1
  @Get('report/monthly')
  getMonthlyReport(
    @Query('month') month: string,
    @Query('userId') userId: string,
  ) {
    return this.leaveService.getMonthlyReport(Number(userId), month);
  }
}
