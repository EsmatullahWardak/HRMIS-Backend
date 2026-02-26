import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @Roles('EMPLOYEE', 'OFFICER', 'ADMIN')
  async createLoan(@Req() req: any, @Body() createLoanDto: CreateLoanDto) {
    const userId = req.user?.sub;
    const role = req.user?.role;
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
      return this.loansService.getLoansForUser(req.user.sub);
    }
    return this.loansService.getAllLoans();
  }
}
