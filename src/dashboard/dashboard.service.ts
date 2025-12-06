import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsDto> {
    // Get user counts
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({
      where: { is_active: true },
    });
    const inactiveUsers = await this.prisma.user.count({
      where: { is_active: false },
    });

    // Get product counts
    const totalProducts = await this.prisma.product.count();
    const activeProducts = await this.prisma.product.count({
      where: { isActive: true },
    });
    const inactiveProducts = await this.prisma.product.count({
      where: { isActive: false },
    });

    // Get recent users (last 5)
    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Get recent products (last 5)
    const recentProducts = await this.prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        createdAt: true,
      },
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalProducts,
      activeProducts,
      inactiveProducts,
      recentUsers,
      recentProducts,
    };
  }
}
