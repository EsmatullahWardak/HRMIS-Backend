import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  async createLoan(createLoanDto: CreateLoanDto) {
    return this.prisma.loan.create({
      data: {
        type: createLoanDto.type,
        amount: createLoanDto.amount,
        remaining: createLoanDto.remaining,
        monthlyDeduction: createLoanDto.monthlyDeduction,
        status: createLoanDto.status || 'Pending',
        guarantor: createLoanDto.guarantor || null,
        notes: createLoanDto.notes || null,
        progress: createLoanDto.progress || 0,
        userId: createLoanDto.userId || null,
      },
    });
  }

  async getAllLoans() {
    return this.prisma.loan.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getLoansForUser(userId: number) {
    return this.prisma.loan.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
