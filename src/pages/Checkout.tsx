import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag, CreditCard, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/products');
    }
  }, [isAuthenticated, navigate]);

  const handleOrderSuccess = (order: any) => {
    setOrderSuccess(order);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to continue with checkout
            </p>
            <Button onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some items to your cart before checkout
            </p>
            <Button onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
                <p className="text-muted-foreground mb-6">
                  Thank you for your purchase. Your order has been successfully placed.
                </p>
                
                <div className="bg-muted p-4 rounded-lg mb-6">
                  <div className="text-sm text-muted-foreground mb-2">Order Number</div>
                  <div className="font-mono text-lg font-bold">
                    {orderSuccess.order.orderNumber}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span>Total Paid</span>
                    <span className="font-bold">
                      {formatPrice(orderSuccess.order.total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Payment Method</span>
                    <span>Card ending in ****</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/orders')}
                    className="w-full"
                  >
                    View Order Details
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/products')}
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/cart')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>
          <p className="text-muted-foreground">
            Complete your purchase securely
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Elements stripe={stripePromise}>
              <CheckoutForm onSuccess={handleOrderSuccess} />
            </Elements>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.thumbnail?.url || item.product.images?.[0]?.url || '/placeholder.svg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.product.name}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">
                            {item.variant.name}: {item.variant.value}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(cart.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{cart.totalPrice >= 100 ? 'Free' : formatPrice(10)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (8%)</span>
                    <span>{formatPrice(cart.totalPrice * 0.08)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>
                      {formatPrice(
                        cart.totalPrice + 
                        (cart.totalPrice >= 100 ? 0 : 10) + 
                        (cart.totalPrice * 0.08)
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;