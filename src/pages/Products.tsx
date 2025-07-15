import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters } from '@/components/product/ProductFilters';
import productService, { ProductFilters as IProductFilters, Product } from '@/services/product.service';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

const Products = () => {
  const [filters, setFilters] = useState<IProductFilters>({
    page: 1,
    limit: 12,
    sort: 'newest'
  });

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    keepPreviousData: true
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories
  });

  const { addToCart } = useCart();

  const handleFiltersChange = (newFilters: IProductFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sort: 'newest'
    });
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart({
        productId: product._id,
        quantity: 1
      });
    } catch (error) {
      // Error handled by cart context
    }
  };

  const handleAddToWishlist = (product: Product) => {
    // TODO: Implement wishlist functionality
    toast.success(`${product.name} added to wishlist!`);
  };

  const loadMore = () => {
    if (productsData?.pagination.page < productsData.pagination.pages) {
      setFilters(prev => ({
        ...prev,
        page: prev.page! + 1
      }));
    }
  };

  useEffect(() => {
    if (error) {
      toast.error('Failed to load products');
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Our Products</h1>
          <p className="text-muted-foreground">
            Discover courses, merchandise, and resources to accelerate your financial journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                {productsData && (
                  <>
                    Showing {((filters.page! - 1) * filters.limit!) + 1} to{' '}
                    {Math.min(filters.page! * filters.limit!, productsData.pagination.total)} of{' '}
                    {productsData.pagination.total} products
                  </>
                )}
              </div>
            </div>

            {/* Products */}
            <ProductGrid
              products={productsData?.products || []}
              loading={isLoading}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />

            {/* Pagination */}
            {productsData && productsData.pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    disabled={filters.page === 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: productsData.pagination.pages }, (_, i) => i + 1)
                      .filter(page => {
                        const current = filters.page!;
                        return page === 1 || page === productsData.pagination.pages || 
                               (page >= current - 2 && page <= current + 2);
                      })
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={page === filters.page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilters(prev => ({ ...prev, page }))}
                          >
                            {page}
                          </Button>
                        </div>
                      ))}
                  </div>

                  <Button
                    variant="outline"
                    disabled={filters.page === productsData.pagination.pages}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;