import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';

@Controller('leave') // base route: /leaves
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  // POST /leaves
  @Post()
  create(@Body() createLeaveDto: CreateLeaveDto) {
    return this.leaveService.createLeave(createLeaveDto);
  }

  // GET /leaves
  @Get()
  findAll() {
    return this.leaveService.getAllLeaves();
  }

  // PATCH /leaves/:id/status
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLeaveStatusDto) {
    return this.leaveService.updateLeaveStatus(+id, dto.status);
  }
}

// leave.controller.ts
import { Query } from '@nestjs/common';

// ...

@Get('report/monthly')
getMonthlyReport(
  @Query('month') month: string,
  @Query('userId') userId: string, // temporary if you don’t use auth yet
) {
  // If you already have auth, we will replace this with req.user.id
  return this.leaveService.getMonthlyReport(Number(userId), month);
}
