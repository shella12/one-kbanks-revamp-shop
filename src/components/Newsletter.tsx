import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Send, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // Simulate subscription
    setIsSubscribed(true);
    setEmail('');
    toast({
      title: "Successfully subscribed!",
      description: "You'll receive our latest updates and exclusive content.",
    });

    // Reset after 3 seconds
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <section className="py-20 bg-gradient-to-r from-background via-muted/10 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto bg-gradient-card border-border/50 shadow-luxury">
          <CardContent className="p-8 md:p-12 text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-primary" />
            </div>

            {/* Heading */}
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-foreground">Stay Connected with </span>
              <span className="bg-gradient-primary bg-clip-text text-transparent">1000Banks</span>
            </h2>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get exclusive access to financial tips, course updates, early bird offers, 
              and join our community of successful entrepreneurs building wealth together.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Weekly financial tips</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Exclusive course access</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Community updates</span>
              </div>
            </div>

            {/* Subscription Form */}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 border-border/50 focus:border-primary h-12"
                    disabled={isSubscribed}
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="luxury" 
                  size="lg"
                  disabled={isSubscribed}
                  className="h-12 px-8"
                >
                  {isSubscribed ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Subscribed!
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Subscribe
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-primary mr-1" />
                No spam, ever
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-primary mr-1" />
                Unsubscribe anytime
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-primary mr-1" />
                10K+ subscribers
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Newsletter;