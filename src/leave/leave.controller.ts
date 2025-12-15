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
    // return createLeaveDto;
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
