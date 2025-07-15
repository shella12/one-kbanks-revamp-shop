import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { ProductFilters as IProductFilters } from '@/services/product.service';

interface ProductFiltersProps {
  filters: IProductFilters;
  onFiltersChange: (filters: IProductFilters) => void;
  categories: string[];
  onClearFilters: () => void;
}

export const ProductFilters = ({ 
  filters, 
  onFiltersChange, 
  categories, 
  onClearFilters 
}: ProductFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof IProductFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filters change
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between lg:hidden">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Products</Label>
          <Input
            id="search"
            placeholder="Search for products..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <Separator />

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
        </div>

        <Separator />

        {/* Sort */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select
            value={filters.sort || 'newest'}
            onValueChange={(value) => handleFilterChange('sort', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Active Filters</Label>
                <Button variant="ghost" size="sm" onClick={onClearFilters}>
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.category}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange('category', undefined)}
                    />
                  </Badge>
                )}
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    "{filters.search}"
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange('search', undefined)}
                    />
                  </Badge>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        handleFilterChange('minPrice', undefined);
                        handleFilterChange('maxPrice', undefined);
                      }}
                    />
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};