export class CreateLoanDto {
  type: string;
  amount: number;
  remaining: number;
  monthlyDeduction: number;
  status?: string;
  guarantor?: string;
  guarantorName?: string;
  notes?: string;
  progress?: number;
  userId?: number;
}
