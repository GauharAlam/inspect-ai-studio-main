import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Search, 
  Settings, 
  Palette, 
  Type, 
  ImageIcon, 
  Shield, 
  Zap,
  BarChart3,
  Eye,
  Grid3X3,
  Accessibility,
  Lightbulb
} from "lucide-react";
import heroLaptop from "@/assets/hero-laptop.png";
import dashboardMockup from "@/assets/dashboard-mockup.png";
import featuresMockup from "@/assets/features-mockup.png";
import analyticsMockup from "@/assets/analytics-mockup.png";
import circuitBg from "@/assets/circuit-bg.jpg";

const features = [
  {
    icon: Search,
    title: "Element Inspector",
    description: "Hover over any element to instantly see its CSS properties, dimensions, and positioning in an elegant overlay.",
    color: "text-primary"
  },
  {
    icon: Type,
    title: "Font Finder",
    description: "Identify fonts, sizes, line heights, and typography details with a single click on any text element.",
    color: "text-accent"
  },
  {
    icon: Palette,
    title: "Color Palette",
    description: "Extract color schemes and gradients from any webpage. Perfect for design inspiration and consistency.",
    color: "text-secondary"
  },
  {
    icon: Accessibility,
    title: "Accessibility Audit",
    description: "Real-time accessibility checking with contrast ratios, ARIA labels, and semantic HTML analysis.",
    color: "text-success"
  },
  {
    icon: Shield,
    title: "Responsiveness Audit",
    description: "Test responsive breakpoints and identify layout issues across different screen sizes instantly.",
    color: "text-primary"
  },
  {
    icon: Lightbulb,
    title: "AI Suggestions",
    description: "Get intelligent design optimization recommendations powered by advanced AI algorithms.",
    color: "text-accent"
  },
  {
    icon: BarChart3,
    title: "Design Metrics",
    description: "Analyze spacing, alignment, and visual hierarchy with precision measurements and guidelines.",
    color: "text-secondary"
  },
  {
    icon: Grid3X3,
    title: "Layout Grid",
    description: "Overlay customizable grids to ensure perfect alignment and consistent spacing across your designs.",
    color: "text-success"
  }
];

const stats = [
  { label: "Design Consistency Score", value: "94.2%", trend: "+12%" },
  { label: "Accessibility Score", value: "87.5%", trend: "+8%" },
  { label: "Performance Impact", value: "0.2ms", trend: "-45%" },
  { label: "Elements Analyzed", value: "12.4K", trend: "+156%" }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${circuitBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="mb-8 animate-fade-in-up">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium bg-primary/10 border-primary/20 text-primary-glow hover:bg-primary/20 transition-colors">
              <Zap className="w-4 h-4 mr-2" />
              Intelligent Design Optimization
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
              AI CSS Inspector:
              <br />
              <span className="italic">Rivoluzione</span> Your Web Design Workflow
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Leverage AI to refine sites with auto-suggestions, improve performance, and ensure pixel-perfect designs with our intelligent Chrome extension.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-scale-in">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent-glow transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Add to Chrome
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-4 text-lg font-semibold border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
              asChild
            >
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
          
          <div className="relative max-w-4xl mx-auto animate-float">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl blur-3xl" />
            <img 
              src={heroLaptop} 
              alt="AI CSS Inspector in action"
              className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>

        {/* Floating feature icons */}
        <div className="absolute bottom-20 left-4 right-4">
          <div className="flex justify-center items-center gap-8 max-w-4xl mx-auto">
            {[
              { icon: Search, label: "Selector" },
              { icon: Settings, label: "Configurator" },
              { icon: Eye, label: "Visual" },
              { icon: Palette, label: "Colors" },
              { icon: Accessibility, label: "A11y" },
              { icon: Grid3X3, label: "Layout" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <div className="p-3 rounded-full bg-card border border-border/50 tech-border">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Powerful Features for Modern Web Design
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of web design with AI-powered tools that make CSS inspection and optimization effortless.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="group tech-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="relative">
            <img 
              src={featuresMockup} 
              alt="Features overview"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Dashboard Analytics Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-card/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                Advanced Analytics & Insights
              </h2>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Get comprehensive insights into your web design performance with AI-powered analytics that help you make data-driven decisions.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <Card key={index} className="p-4 bg-card-elevated border-border/50">
                    <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
                    <div className="text-xs text-success font-medium">{stat.trend}</div>
                  </Card>
                ))}
              </div>
              
              <Button className="bg-gradient-to-r from-accent to-secondary hover:from-accent-glow hover:to-secondary-glow transition-all duration-300">
                View Full Dashboard
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-2xl blur-3xl" />
              <img 
                src={analyticsMockup} 
                alt="Analytics dashboard"
                className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Ready to Revolutionize Your Workflow?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of designers and developers who are already using AI CSS Inspector to create better, faster, and more accessible web experiences.
          </p>
          
          <Button 
            size="lg"
            className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent-glow transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse-glow"
          >
            Add to Chrome - It's Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI CSS Inspector
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2024 AI CSS Inspector. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;