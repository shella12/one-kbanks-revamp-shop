import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, Award, Users, TrendingUp, Target, BookOpen } from "lucide-react";
import devonneImage from "@/assets/devonne-stokes.jpg";

const stats = [
  { number: "10K+", label: "Students Transformed", icon: Users },
  { number: "95%", label: "Success Rate", icon: TrendingUp },
  { number: "5+", label: "Years Experience", icon: Award },
  { number: "50+", label: "Expert Courses", icon: BookOpen }
];

const values = [
  {
    icon: Target,
    title: "Focus & Purpose",
    description: "We believe in the power of focused action and clear purpose to achieve financial freedom."
  },
  {
    icon: TrendingUp,
    title: "Continuous Growth",
    description: "Committed to constant learning and improvement in all aspects of financial education."
  },
  {
    icon: Users,
    title: "Community First",
    description: "Building a supportive community where everyone can thrive and achieve their goals."
  }
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Award className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">
              About 1000Banks
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Empowering </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Financial Freedom</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Founded on the principle that financial freedom is achievable for everyone, 
            1000Banks is dedicated to transforming lives through education and community.
          </p>
        </div>

        {/* Hero About Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary rounded-2xl transform rotate-3"></div>
            <img
              src={devonneImage}
              alt="Devonne Stokes - Financial Freedom Expert"
              className="relative w-full h-96 object-cover rounded-2xl shadow-luxury"
            />
            <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-xl p-4 shadow-card">
              <div className="text-2xl font-bold text-primary">5+ Years</div>
              <div className="text-sm text-muted-foreground">Experience</div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary">
                Financial Freedom Expert
              </Badge>
              <h3 className="text-3xl font-bold mb-4 text-foreground">
                Meet Devonne Stokes
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                With over 5 years of experience in financial education and entrepreneurship, 
                Devonne has helped thousands of individuals break free from traditional employment 
                and build sustainable wealth.
              </p>
            </div>

            {/* Quote */}
            <div className="bg-gradient-card border border-border/50 rounded-xl p-6 relative">
              <Quote className="h-8 w-8 text-primary mb-4" />
              <blockquote className="text-lg italic text-foreground mb-4">
                "If opportunity doesn't come knocking, BUILD A DOOR."
              </blockquote>
              <cite className="text-primary font-semibold">— Devonne Stokes</cite>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-foreground">Expertise:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  <span className="text-muted-foreground">Investment Planning</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  <span className="text-muted-foreground">Business Strategy</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  <span className="text-muted-foreground">Wealth Building</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  <span className="text-muted-foreground">Financial Education</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gradient-card border-border/50 text-center p-6">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission & Values */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Mission */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-foreground">Our Mission</h3>
            <div className="bg-gradient-card border border-border/50 rounded-xl p-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                To empower entrepreneurs and aspiring business owners with the knowledge, 
                tools, and community support needed to achieve financial freedom and build 
                sustainable wealth through strategic investments and business development.
              </p>
            </div>
          </div>

          {/* Values */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-foreground">Our Values</h3>
            <div className="space-y-4">
              {values.map((value, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <value.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">{value.title}</h4>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-card border border-border/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Ready to Transform Your Financial Future?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of successful entrepreneurs who have already started their journey to financial freedom.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg">
                Start Your Journey
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;