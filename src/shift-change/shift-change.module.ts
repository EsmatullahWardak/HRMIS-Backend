import { Module } from '@nestjs/common';
import { ShiftChangeController } from './shift-change.controller';
import { ShiftChangeService } from './shift-change.service';

@Module({
  controllers: [ShiftChangeController],
  providers: [ShiftChangeService],
})
export class ShiftChangeModule {}
