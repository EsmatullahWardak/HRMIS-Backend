import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OvertimeService } from './overtime.service';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { UpdateOvertimeStatusDto } from './dto/update-overtime-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('overtime')
export class OvertimeController {
  constructor(private readonly overtimeService: OvertimeService) {}

  @Post()
  @Roles('EMPLOYEE', 'OFFICER')
  async create(@Req() req: any, @Body() dto: CreateOvertimeDto) {
    const userId = await this.overtimeService.getUserIdByEmail(req.user?.email);
    if (!userId) {
      throw new UnauthorizedException('Invalid authenticated user');
    }
    return this.overtimeService.createOvertime({ ...dto, userId });
  }

  @Get()
  @Roles('EMPLOYEE', 'OFFICER', 'ADMIN')
  async findAll(@Req() req: any) {
    if (req.user?.role === 'ADMIN') {
      return this.overtimeService.getAllOvertimeRequests();
    }
    const userId = await this.overtimeService.getUserIdByEmail(req.user?.email);
    if (!userId) {
      throw new UnauthorizedException('Invalid authenticated user');
    }
    return this.overtimeService.getOvertimeForUser(userId);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOvertimeStatusDto,
  ) {
    const allowed = ['Approved', 'Rejected'];
    if (!allowed.includes(dto.status)) {
      throw new ForbiddenException('Only Approved or Rejected status is allowed');
    }
    return this.overtimeService.updateOvertimeStatus(+id, dto.status);
  }

  @Get('pending/count')
  @Roles('ADMIN')
  async getPendingCount() {
    const count = await this.overtimeService.getPendingCount();
    return { count };
  }
}

