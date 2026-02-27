import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GuarantorResponseDto } from './dto/guarantor-response.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @Roles('EMPLOYEE', 'OFFICER', 'ADMIN')
  async createLoan(@Req() req: any, @Body() createLoanDto: CreateLoanDto) {
    const role = req.user?.role;
    const userId = await this.loansService.getUserIdByEmail(req.user?.email);

    if (!userId) {
      throw new BadRequestException('Unable to resolve authenticated user.');
    }

    const payload =
      role === 'EMPLOYEE'
        ? { ...createLoanDto, userId }
        : { ...createLoanDto, userId: createLoanDto.userId ?? userId };
    return this.loansService.createLoan(payload);
  }

  @Get()
  @Roles('EMPLOYEE', 'OFFICER', 'ADMIN')
  async getAllLoans(@Req() req: any) {
    if (req.user?.role === 'EMPLOYEE') {
      const userId = await this.loansService.getUserIdByEmail(req.user?.email);

      if (!userId) {
        throw new BadRequestException('Unable to resolve authenticated user.');
      }

      return this.loansService.getLoansForUser(userId);
    }
    return this.loansService.getAllLoans();
  }

  @Get('guarantor/requests')
  @Roles('EMPLOYEE', 'OFFICER', 'ADMIN')
  async getGuarantorRequests(@Req() req: any) {
    return this.loansService.getGuarantorRequests(req.user?.email);
  }

  @Patch(':id/guarantor-response')
  @Roles('EMPLOYEE', 'OFFICER', 'ADMIN')
  async respondToGuarantorRequest(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: GuarantorResponseDto,
  ) {
    if (dto.action !== 'ACCEPT' && dto.action !== 'REJECT') {
      throw new BadRequestException('Action must be ACCEPT or REJECT.');
    }

    return this.loansService.respondToGuarantorRequest(
      Number(id),
      req.user?.email,
      dto.action,
    );
  }
}
