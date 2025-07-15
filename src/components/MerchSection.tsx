import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Star, Truck } from "lucide-react";
import tshirtImage from "@/assets/tshirt-black.jpg";
import hoodieImage from "@/assets/hoodie-black.jpg";

const products = [
  {
    id: 1,
    name: "#1B Connected Premium Tee",
    description: "Premium cotton t-shirt with the iconic 1000Banks logo. Comfortable, stylish, and perfect for everyday wear.",
    image: tshirtImage,
    price: "$29.99",
    originalPrice: "$39.99",
    colors: ["Black", "White", "Navy"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.8,
    reviews: 127,
    badge: "Bestseller"
  },
  {
    id: 2,
    name: "#1B Infinite Hoodie",
    description: "Luxurious heavyweight hoodie with embroidered gold logo. Perfect for cold weather and making a statement.",
    image: hoodieImage,
    price: "$79.99",
    originalPrice: "$99.99",
    colors: ["Black", "Charcoal", "Navy"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.9,
    reviews: 89,
    badge: "Limited Edition"
  },
  {
    id: 3,
    name: "#1B Est. 2021 Sweatshirt",
    description: "Classic sweatshirt design celebrating the founding year. Soft, comfortable, and built to last.",
    image: hoodieImage,
    price: "$59.99",
    originalPrice: "$79.99",
    colors: ["Gray", "Pink", "Black"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.7,
    reviews: 64,
    badge: "New"
  },
  {
    id: 4,
    name: "#1B To The Top Tee",
    description: "Motivational design that embodies the 1000Banks spirit. Lightweight and perfect for workouts.",
    image: tshirtImage,
    price: "$34.99",
    originalPrice: "$44.99",
    colors: ["Black", "White"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.6,
    reviews: 92,
    badge: "Popular"
  }
];

const MerchSection = () => {
  return (
    <section id="merch" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <ShoppingCart className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">
              Official Merchandise
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Wear Your </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Financial Freedom</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Show your commitment to financial freedom with our premium merchandise collection. 
            Every purchase supports the 1000Banks community.
          </p>
        </div>

        {/* Coming Soon Banner */}
        <div className="bg-gradient-card border border-primary/20 rounded-2xl p-8 text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              COMING SOON
            </span>
          </h3>
          <p className="text-muted-foreground mb-6">
            Our exclusive merchandise collection will be available soon. 
            Join our waitlist to be the first to know when it launches!
          </p>
          <Button variant="luxury" size="lg">
            Join Waitlist
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="bg-gradient-card border-border/50 hover:shadow-luxury transition-all duration-300 group relative overflow-hidden">
              {/* Badge */}
              <div className="absolute top-4 left-4 z-10">
                <Badge 
                  variant={product.badge === "Bestseller" ? "default" : "secondary"}
                  className="bg-primary text-primary-foreground"
                >
                  {product.badge}
                </Badge>
              </div>

              {/* Wishlist Button */}
              <div className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <CardHeader className="p-0">
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.rating) 
                            ? "text-primary fill-current" 
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({product.reviews})
                  </span>
                </div>

                {/* Colors */}
                <div className="flex items-center mb-3">
                  <span className="text-xs text-muted-foreground mr-2">Colors:</span>
                  <div className="flex space-x-1">
                    {product.colors.slice(0, 3).map((color, index) => (
                      <div
                        key={index}
                        className={`w-4 h-4 rounded-full border border-border ${
                          color === "Black" ? "bg-black" :
                          color === "White" ? "bg-white" :
                          color === "Navy" ? "bg-blue-900" :
                          color === "Charcoal" ? "bg-gray-600" :
                          color === "Gray" ? "bg-gray-400" :
                          color === "Pink" ? "bg-pink-300" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center">
                  <span className="text-xl font-bold text-primary mr-2">
                    {product.price}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {product.originalPrice}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button variant="outline" className="w-full group" disabled>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Coming Soon
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Free Shipping</h3>
            <p className="text-sm text-muted-foreground">
              Free shipping on all orders over $50
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Premium Quality</h3>
            <p className="text-sm text-muted-foreground">
              High-quality materials and craftsmanship
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Satisfaction Guaranteed</h3>
            <p className="text-sm text-muted-foreground">
              30-day return policy for all items
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MerchSection;