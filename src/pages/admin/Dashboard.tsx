import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/admin/StatsCard';
import { RecentOrders } from '@/components/admin/RecentOrders';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import adminService from '@/services/admin.service';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminService.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  const { overview, ordersByStatus, recentOrders, topProducts, lowStockProducts } = stats;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={adminService.formatPrice(overview.totalRevenue)}
          icon={DollarSign}
          trend="up"
        />
        <StatsCard
          title="Total Orders"
          value={overview.totalOrders}
          icon={ShoppingCart}
          trend="up"
        />
        <StatsCard
          title="Total Users"
          value={overview.totalUsers}
          icon={Users}
          trend="up"
        />
        <StatsCard
          title="Total Products"
          value={overview.totalProducts}
          icon={Package}
          trend="neutral"
        />
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Monthly Revenue"
          value={adminService.formatPrice(overview.monthlyRevenue)}
          icon={TrendingUp}
          trend="up"
        />
        <StatsCard
          title="Weekly Revenue"
          value={adminService.formatPrice(overview.weeklyRevenue)}
          icon={Activity}
          trend="up"
        />
        <StatsCard
          title="Active Users"
          value={overview.activeUsers}
          icon={Calendar}
          trend="up"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Recent Orders */}
        <RecentOrders orders={recentOrders} />

        {/* Order Status */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ordersByStatus.map((status) => (
                <div key={status._id} className="flex items-center justify-between">
                  <Badge className={adminService.getStatusColor(status._id)}>
                    {status._id}
                  </Badge>
                  <span className="text-sm font-medium">{status.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product) => (
                <div key={product._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.sold} sold
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {lowStockProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.stock} remaining
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">{product.stock}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;