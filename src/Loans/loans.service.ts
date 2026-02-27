import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  async createLoan(createLoanDto: CreateLoanDto) {
    const isThreeMonthLoan = createLoanDto.type === '3 Month';
    const hasGuarantor = Boolean(createLoanDto.guarantor);
    const resolvedStatus =
      createLoanDto.status ||
      (isThreeMonthLoan && hasGuarantor ? 'Pending Guarantor' : 'Pending');

    return this.prisma.loan.create({
      data: {
        type: createLoanDto.type,
        amount: createLoanDto.amount,
        remaining: createLoanDto.remaining,
        monthlyDeduction: createLoanDto.monthlyDeduction,
        status: resolvedStatus,
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

  async getUserIdByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return user?.id ?? null;
  }

  async getGuarantorRequests(guarantorEmail: string) {
    return this.prisma.loan.findMany({
      where: {
        type: '3 Month',
        guarantor: guarantorEmail,
        status: {
          in: ['Pending Guarantor'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async respondToGuarantorRequest(
    loanId: number,
    guarantorEmail: string,
    action: 'ACCEPT' | 'REJECT',
  ) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundException('Loan request not found.');
    }

    if (loan.type !== '3 Month') {
      throw new BadRequestException('Only 3-month loans require guarantor.');
    }

    if (!loan.guarantor || loan.guarantor !== guarantorEmail) {
      throw new ForbiddenException('You are not the guarantor for this loan.');
    }

    if (loan.status !== 'Pending Guarantor') {
      throw new BadRequestException('This guarantor request is already handled.');
    }

    const isAccepted = action === 'ACCEPT';
    const nextStatus = isAccepted ? 'Guarantor Accepted' : 'Guarantor Rejected';
    const message = isAccepted
      ? 'Your guarantor accepted your request.'
      : 'Your guarantor rejected your request.';

    const nextNotes = loan.notes ? `${loan.notes}\n${message}` : message;

    return this.prisma.loan.update({
      where: { id: loanId },
      data: {
        status: nextStatus,
        notes: nextNotes,
      },
    });
  }
}
