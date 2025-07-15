import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Eye, 
  X, 
  Package, 
  CreditCard, 
  MapPin, 
  Clock, 
  Truck,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import userService, { UserOrder } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';

interface OrderCardProps {
  order: UserOrder;
}

export const OrderCard = ({ order }: OrderCardProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => userService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Order cancelled',
        description: 'Your order has been cancelled successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  });

  const handleCancelOrder = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrderMutation.mutate(order._id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPaymentIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                <Badge 
                  variant="secondary" 
                  className={userService.getStatusColor(order.status)}
                >
                  <span className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getPaymentIcon(order.paymentStatus)}
                <span className="capitalize">{order.paymentStatus}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Order Date</p>
                <p className="font-medium">{userService.formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Amount</p>
                <p className="font-medium">{userService.formatPrice(order.total)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {order.items.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {item.product.thumbnail && (
                    <img
                      src={item.product.thumbnail.url}
                      alt={item.product.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  <span>{item.product.name}</span>
                  <span className="text-gray-500">x{item.quantity}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <span className="text-sm text-gray-500">
                  +{order.items.length - 3} more items
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Order Details - #{order.orderNumber}</DialogTitle>
                </DialogHeader>
                <OrderDetails order={order} />
              </DialogContent>
            </Dialog>

            {userService.canCancelOrder(order) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancelOrder}
                disabled={cancelOrderMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const OrderDetails = ({ order }: { order: UserOrder }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge className={userService.getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-medium">{userService.formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <Badge className={userService.getPaymentStatusColor(order.paymentStatus)}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </Badge>
            </div>
            {order.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tracking Number:</span>
                <span className="font-medium">{order.trackingNumber}</span>
              </div>
            )}
          </div>
        </div>

        {order.shippingAddress && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </h3>
            <div className="text-sm space-y-1">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="text-gray-600">{order.shippingAddress.phone}</p>
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              {(item.product.thumbnail || item.product.images[0]) && (
                <img
                  src={item.product.thumbnail?.url || item.product.images[0]?.url}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium">{item.product.name}</h4>
                {item.variant && (
                  <p className="text-sm text-gray-600">
                    {item.variant.name}: {item.variant.value}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                  <span className="text-sm font-medium">
                    {userService.formatPrice(item.price)} each
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {userService.formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{userService.formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>{userService.formatPrice(order.tax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>{userService.formatPrice(order.shipping)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span>{userService.formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {order.statusHistory && order.statusHistory.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-4">Order Timeline</h3>
            <div className="space-y-3">
              {order.statusHistory.map((status, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{status.status}</span>
                      <span className="text-sm text-gray-600">
                        {userService.formatDateTime(status.date)}
                      </span>
                    </div>
                    {status.notes && (
                      <p className="text-sm text-gray-600 mt-1">{status.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};