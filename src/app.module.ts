import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LoansModule } from './loans/loans.module';
import { LeaveModule } from './leave/leave.module';
import { OvertimeModule } from './overtime/overtime.module';
import { ShiftChangeModule } from './shift-change/shift-change.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UsersModule,
    ProductsModule,
    DashboardModule,
    LoansModule,
    LeaveModule,
    OvertimeModule,
    ShiftChangeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
