import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Financial Education Hero"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8 animate-fade-in">
            <Star className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">
              #1 Financial Freedom Academy
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            <span className="block text-foreground mb-2">
              Manifesting Positive Vision
            </span>
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Embracing Focus and Purpose
            </span>
            <span className="block text-foreground text-2xl md:text-4xl lg:text-5xl font-normal mt-4">
              in Our Brand Culture
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in delay-300">
            Our program empowers entrepreneurs to invest, plan, and budget effectively
            while developing corporate dropout plans.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in delay-500">
            <Button variant="hero" size="xl" className="group">
              Join Our Community
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="xl" className="group">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Quote Section */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 max-w-2xl mx-auto animate-scale-in delay-700">
            <blockquote className="text-lg md:text-xl italic text-foreground mb-4">
              "If opportunity doesn't come knocking, BUILD A DOOR."
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="text-primary font-semibold">Devonne Stokes</div>
              <div className="mx-2 text-muted-foreground">•</div>
              <div className="text-muted-foreground">Financial Freedom Expert</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-float" />
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-accent/10 rounded-full animate-float delay-1000" />
      <div className="absolute top-1/2 left-20 w-12 h-12 bg-primary/5 rounded-full animate-float delay-500" />
    </section>
  );
};

export default Hero;