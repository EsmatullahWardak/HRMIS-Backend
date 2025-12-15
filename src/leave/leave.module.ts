// backend/src/leave/leave.module.ts
import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [LeaveController],
  providers: [LeaveService, PrismaService],
  exports: [LeaveService],
})
export class LeaveModule {}
