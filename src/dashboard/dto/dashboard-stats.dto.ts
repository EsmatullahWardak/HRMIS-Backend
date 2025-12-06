export class DashboardStatsDto {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  recentUsers: {
    id: number;
    name: string | null;
    email: string;
    createdAt: Date;
  }[];
  recentProducts: {
    id: number;
    name: string;
    category: string;
    price: number;
    createdAt: Date;
  }[];
}
