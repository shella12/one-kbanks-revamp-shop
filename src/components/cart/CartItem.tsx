import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as ICartItem } from '@/services/cart.service';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  item: ICartItem;
}

export const CartItem = ({ item }: CartItemProps) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateCartItem, removeFromCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await updateCartItem(item._id, { quantity: newQuantity });
      setQuantity(newQuantity);
    } catch (error) {
      // Error handled by context
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async () => {
    setIsUpdating(true);
    try {
      await removeFromCart(item._id);
    } catch (error) {
      // Error handled by context
    } finally {
      setIsUpdating(false);
    }
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
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Product Image */}
          <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
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
              <Badge className={getCategoryColor(item.product.category)}>
                {item.product.category}
              </Badge>
              
              {item.variant && (
                <Badge variant="outline">
                  {item.variant.name}: {item.variant.value}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-primary">
                  {formatPrice(item.price)}
                </span>
                {item.product.comparePrice && item.product.comparePrice > item.price && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(item.product.comparePrice)}
                  </span>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                Subtotal: {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value);
                if (!isNaN(newQuantity) && newQuantity > 0) {
                  handleQuantityChange(newQuantity);
                }
              }}
              className="w-16 text-center"
              min="1"
              disabled={isUpdating}
            />
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleRemoveItem}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};