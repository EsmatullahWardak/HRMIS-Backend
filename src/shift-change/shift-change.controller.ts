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
import { ShiftChangeService } from './shift-change.service';
import { CreateShiftChangeDto } from './dto/create-shift-change.dto';
import { UpdateShiftChangeStatusDto } from './dto/update-shift-change-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shift-change')
export class ShiftChangeController {
  constructor(private readonly shiftChangeService: ShiftChangeService) {}

  @Post()
  @Roles('EMPLOYEE', 'OFFICER')
  async create(@Req() req: any, @Body() dto: CreateShiftChangeDto) {
    const userId = await this.shiftChangeService.getUserIdByEmail(
      req.user?.email,
    );
    if (!userId) {
      throw new UnauthorizedException('Invalid authenticated user');
    }
    return this.shiftChangeService.createShiftChange({ ...dto, userId });
  }

  @Get()
  @Roles('EMPLOYEE', 'OFFICER', 'ADMIN')
  async findAll(@Req() req: any) {
    if (req.user?.role === 'ADMIN' || req.user?.role === 'OFFICER') {
      return this.shiftChangeService.getAllShiftChanges();
    }
    const userId = await this.shiftChangeService.getUserIdByEmail(
      req.user?.email,
    );
    if (!userId) {
      throw new UnauthorizedException('Invalid authenticated user');
    }
    return this.shiftChangeService.getShiftChangesForUser(userId);
  }

  @Patch(':id/status')
  @Roles('OFFICER', 'ADMIN')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateShiftChangeStatusDto,
  ) {
    const allowed = ['Approved', 'Rejected'];
    if (!allowed.includes(dto.status)) {
      throw new ForbiddenException('Only Approved or Rejected status is allowed');
    }
    return this.shiftChangeService.updateShiftChangeStatus(+id, dto.status);
  }

  @Get('pending/count')
  @Roles('OFFICER', 'ADMIN')
  async getPendingCount() {
    const count = await this.shiftChangeService.getPendingCount();
    return { count };
  }
}
