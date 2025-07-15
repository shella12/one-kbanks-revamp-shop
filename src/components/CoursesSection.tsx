import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, Award, ArrowRight } from "lucide-react";
import course1Image from "@/assets/course-1.jpg";
import course2Image from "@/assets/course-2.jpg";

const courses = [
  {
    id: 1,
    title: "Financial Freedom Fundamentals",
    description: "Master the basics of personal finance, budgeting, and investment planning to build a solid foundation for wealth creation.",
    image: course1Image,
    price: "$299",
    originalPrice: "$499",
    rating: 4.9,
    students: 2847,
    duration: "8 weeks",
    level: "Beginner",
    features: ["Lifetime access", "Certificate included", "1-on-1 mentoring", "Community support"]
  },
  {
    id: 2,
    title: "Advanced Investment Strategies",
    description: "Deep dive into advanced investment techniques, portfolio management, and wealth multiplication strategies for experienced investors.",
    image: course2Image,
    price: "$599",
    originalPrice: "$899",
    rating: 4.8,
    students: 1523,
    duration: "12 weeks",
    level: "Advanced",
    features: ["Expert-led sessions", "Real portfolio analysis", "Market insights", "Exclusive resources"]
  },
  {
    id: 3,
    title: "Corporate Dropout Blueprint",
    description: "Learn how to transition from corporate employment to entrepreneurship with our comprehensive business planning course.",
    image: course1Image,
    price: "$399",
    originalPrice: "$699",
    rating: 4.9,
    students: 1876,
    duration: "10 weeks",
    level: "Intermediate",
    features: ["Business plan template", "Legal guidance", "Funding strategies", "Success roadmap"]
  }
];

const CoursesSection = () => {
  return (
    <section id="courses" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Award className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">
              Premium Education
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Transform Your </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Financial Future</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of successful students who have transformed their financial lives through our comprehensive courses.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="bg-gradient-card border-border/50 hover:shadow-luxury transition-all duration-300 group">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      {course.level}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
                      <Star className="h-3 w-3 text-primary fill-current mr-1" />
                      <span className="text-xs font-medium">{course.rating}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <CardTitle className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {course.title}
                </CardTitle>
                <p className="text-muted-foreground mb-4">
                  {course.description}
                </p>
                
                {/* Course Meta */}
                <div className="flex items-center text-sm text-muted-foreground mb-4 space-x-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.students.toLocaleString()}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {course.features.slice(0, 2).map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="flex items-center mb-4">
                  <span className="text-2xl font-bold text-primary mr-2">
                    {course.price}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {course.originalPrice}
                  </span>
                  <Badge variant="destructive" className="ml-2">
                    Limited Time
                  </Badge>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button variant="luxury" className="w-full group">
                  Enroll Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-card border border-border/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Ready to Start Your Journey?
            </h3>
            <p className="text-muted-foreground mb-6">
              Get access to our complete course library and join our exclusive community of financial freedom seekers.
            </p>
            <Button variant="hero" size="lg">
              Join Academy Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;