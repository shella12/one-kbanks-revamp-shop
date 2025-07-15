import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import adminService from '@/services/admin.service';

interface RecentOrdersProps {
  orders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    user: {
      name: string;
      email: string;
    };
    items: Array<{
      product: {
        name: string;
      };
      quantity: number;
    }>;
  }>;
}

export const RecentOrders = ({ orders }: RecentOrdersProps) => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {order.user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.user.name} • {order.user.email}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge className={adminService.getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {adminService.formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {adminService.formatPrice(order.total)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};