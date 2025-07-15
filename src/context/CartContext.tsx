import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import cartService, { Cart, CartSummary, AddToCartData, UpdateCartItemData } from '../services/cart.service';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CartContextType {
  cart: Cart | null;
  cartSummary: CartSummary | null;
  isLoading: boolean;
  addToCart: (data: AddToCartData) => Promise<void>;
  updateCartItem: (itemId: string, data: UpdateCartItemData) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Get cart data
  const { data: cart, isLoading: cartLoading, refetch: refetchCart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Get cart summary
  const { data: cartSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['cart', 'summary'],
    queryFn: cartService.getCartSummary,
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const isLoading = cartLoading || summaryLoading;

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: cartService.addToCart,
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
      queryClient.invalidateQueries({ queryKey: ['cart', 'summary'] });
      toast.success('Item added to cart!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add item to cart');
    },
  });

  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateCartItemData }) =>
      cartService.updateCartItem(itemId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
      queryClient.invalidateQueries({ queryKey: ['cart', 'summary'] });
      toast.success('Cart updated!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update cart item');
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: cartService.removeFromCart,
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
      queryClient.invalidateQueries({ queryKey: ['cart', 'summary'] });
      toast.success('Item removed from cart!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove item from cart');
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Cart cleared!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to clear cart');
    },
  });

  // Clear cart data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.removeQueries({ queryKey: ['cart'] });
    }
  }, [isAuthenticated, queryClient]);

  const addToCart = async (data: AddToCartData) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      return;
    }
    await addToCartMutation.mutateAsync(data);
  };

  const updateCartItem = async (itemId: string, data: UpdateCartItemData) => {
    await updateCartItemMutation.mutateAsync({ itemId, data });
  };

  const removeFromCart = async (itemId: string) => {
    await removeFromCartMutation.mutateAsync(itemId);
  };

  const clearCart = async () => {
    await clearCartMutation.mutateAsync();
  };

  const refreshCart = () => {
    refetchCart();
    queryClient.invalidateQueries({ queryKey: ['cart', 'summary'] });
  };

  const value: CartContextType = {
    cart: cart || null,
    cartSummary: cartSummary || null,
    isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};