import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/services/product.service';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart, onAddToWishlist }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
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
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.thumbnail?.url || product.images?.[0]?.url || '/placeholder.svg'}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay with quick actions */}
        <div className={`absolute inset-0 bg-black/20 flex items-center justify-center space-x-2 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full"
            onClick={() => onAddToWishlist?.(product)}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full"
            onClick={() => onAddToCart?.(product)}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          <Badge className={getCategoryColor(product.category)}>
            {product.category}
          </Badge>
          {product.isFeatured && (
            <Badge variant="secondary">Featured</Badge>
          )}
          {product.discountPercentage && product.discountPercentage > 0 && (
            <Badge variant="destructive">
              -{product.discountPercentage}%
            </Badge>
          )}
        </div>

        {/* Stock status */}
        {product.category === 'merch' && product.stock === 0 && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        {product.rating.count > 0 && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < product.rating.average
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-2">
              ({product.rating.count})
            </span>
          </div>
        )}

        {/* Course specific info */}
        {product.category === 'course' && product.courseContent && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <span>{product.courseContent.duration}</span>
            <span className="mx-2">•</span>
            <span className="capitalize">{product.courseContent.level}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          {product.sold > 0 && (
            <span className="text-sm text-muted-foreground">
              {product.sold} sold
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={() => onAddToCart?.(product)}
          disabled={product.category === 'merch' && product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.category === 'merch' && product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};