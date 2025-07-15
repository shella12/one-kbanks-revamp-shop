import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, CreditCard } from 'lucide-react';
import { Cart } from '@/services/cart.service';
import cartService from '@/services/cart.service';

interface CartSummaryProps {
  cart: Cart;
  onCheckout?: () => void;
}

const defaultCheckout = () => {
  window.location.href = '/checkout';
};

export const CartSummary = ({ cart, onCheckout }: CartSummaryProps) => {
  const subtotal = cartService.calculateSubtotal(cart.items);
  const tax = cartService.calculateTax(subtotal);
  const shipping = cartService.calculateShipping(subtotal);
  const total = cartService.calculateTotal(subtotal, tax, shipping);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Items ({cart.totalItems})
          </span>
          <span className="text-sm font-medium">
            {formatPrice(subtotal)}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Shipping</span>
          <div className="flex items-center gap-2">
            {shipping === 0 ? (
              <Badge variant="secondary" className="text-xs">
                Free
              </Badge>
            ) : (
              <span className="text-sm font-medium">
                {formatPrice(shipping)}
              </span>
            )}
          </div>
        </div>

        {/* Free shipping indicator */}
        {shipping > 0 && (
          <div className="text-xs text-muted-foreground">
            Add {formatPrice(100 - subtotal)} more for free shipping
          </div>
        )}

        {/* Tax */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tax</span>
          <span className="text-sm font-medium">
            {formatPrice(tax)}
          </span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">Total</span>
          <span className="text-base font-bold text-primary">
            {formatPrice(total)}
          </span>
        </div>

        {/* Checkout Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={onCheckout || defaultCheckout}
          disabled={cart.items.length === 0}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Proceed to Checkout
        </Button>

        {/* Security Note */}
        <div className="text-xs text-center text-muted-foreground">
          🔒 Secure checkout with SSL encryption
        </div>

        {/* Item Breakdown */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Items in cart:</div>
          {cart.items.map((item) => (
            <div key={item._id} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground line-clamp-1">
                {item.product.name}
                {item.variant && (
                  <span className="text-xs ml-1">
                    ({item.variant.name}: {item.variant.value})
                  </span>
                )}
                × {item.quantity}
              </span>
              <span className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};