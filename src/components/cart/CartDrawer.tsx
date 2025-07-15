import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface CartDrawerProps {
  children: React.ReactNode;
}

export const CartDrawer = ({ children }: CartDrawerProps) => {
  const { cart, cartSummary, isLoading, updateCartItem, removeFromCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    await updateCartItem(itemId, { quantity });
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'course':
        return 'bg-blue-100 text-blue-800';
      case 'merch':
        return 'bg-green-100 text-green-800';
      case 'ebook':
        return 'bg-purple-100 text-purple-800';
      case 'consultation':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative">
          {children}
          {cartSummary && cartSummary.totalItems > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {cartSummary.totalItems}
            </Badge>
          )}
        </div>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
          </SheetTitle>
          <SheetDescription>
            {cartSummary?.totalItems || 0} items in your cart
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">Your cart is empty</p>
              <Link to="/products">
                <Button className="mt-4">Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex items-center space-x-3 p-3 bg-card rounded-lg">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={item.product.thumbnail?.url || item.product.images?.[0]?.url || '/placeholder.svg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/products/${item.product.slug}`}
                          className="text-sm font-medium text-foreground hover:text-primary line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getCategoryColor(item.product.category)} variant="outline">
                            {item.product.category}
                          </Badge>
                          
                          {item.variant && (
                            <Badge variant="outline" className="text-xs">
                              {item.variant.name}: {item.variant.value}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <span className="text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveItem(item._id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-semibold text-primary">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator className="my-4" />

              {/* Cart Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Subtotal ({cart.totalItems} items)
                  </span>
                  <span className="text-sm font-medium">
                    {formatPrice(cart.totalPrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-base font-bold text-primary">
                    {formatPrice(cart.totalPrice)}
                  </span>
                </div>

                <div className="space-y-2">
                  <Link to="/cart">
                    <Button variant="outline" className="w-full">
                      View Cart
                    </Button>
                  </Link>
                  <Button 
                    className="w-full"
                    onClick={() => window.location.href = '/checkout'}
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};