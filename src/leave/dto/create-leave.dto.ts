// src/leave/dto/create-leave.dto.ts
export class CreateLeaveDto {
  type: string; // e.g. "Casual", "Sick", etc.
  startDate: string; // you can make this Date if you prefer
  endDate: string;
  reason?: string; // optional
  status?: string; // optional, default will be 'Pending' in service
  userId?: number; // optional
}
