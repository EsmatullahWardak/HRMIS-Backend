export class CreateShiftChangeDto {
  shiftDate: string;
  currentShift: string;
  requestedShift: string;
  reason?: string;
  userId?: number;
}
