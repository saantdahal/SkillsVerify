import { Link, useNavigate } from "react-router-dom";
import { Github, CheckCircle, Upload, FileText, BarChart3, Shield, Zap, ArrowRight, Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/context/UserContext";
import { useState } from "react";

const Navbar = () => {
  const { isLoggedIn, logOut } = useLogin();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">SkillVerifier</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
            <a href="#about" className="text-slate-300 hover:text-white transition-colors">About</a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Button
                  onClick={() => navigate("/upload-resume")}
                  variant="ghost"
                  className="text-slate-300 hover:text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
                
                <Button
                  onClick={() => navigate("/upload-resume")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Get Started
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
                  Dashboard
                </Button>
                <Button onClick={logOut} variant="outline" className="border-slate-600 text-white hover:bg-white/10">
                  Sign Out
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors px-2 py-1">Features</a>
              <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors px-2 py-1">How It Works</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors px-2 py-1">Pricing</a>
              <a href="#about" className="text-slate-300 hover:text-white transition-colors px-2 py-1">About</a>
              
              {!isLoggedIn ? (
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-800">
                  <Button
                    onClick={() => navigate("/upload-resume")}
                    variant="ghost"
                    className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/10"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate("/upload-resume")}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white mt-2"
                  >
                    Get Started
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-800">
                  <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/10">
                    Dashboard
                  </Button>
                  <Button onClick={logOut} variant="outline" className="w-full border-slate-600 text-white hover:bg-white/10">
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const HomePage = () => {
  const { isLoggedIn, login } = useLogin();
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const handleRecruiterSignIn = () => {
    login();
    navigate("/hrdashboard");
  };

  const features = [
    {
      icon: <Github className="w-8 h-8" />,
      title: "GitHub Integration",
      description: "Seamlessly authenticate with your GitHub account for instant verification"
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Smart CV Upload",
      description: "Upload your resume and let our AI analyze your skills and experience"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Detailed Reports",
      description: "Get comprehensive skill assessment reports with actionable insights"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Your data is encrypted and protected with industry-standard security"
    }
  ];

  const benefits = [
    "AI-powered skill matching",
    "Instant verification results",
    "Professional skill reports",
    "GitHub profile analysis",
    "Career recommendations",
    "Portfolio validation"
  ];

  const stats = [
    { number: "10K+", label: "Verified Profiles" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "500+", label: "Companies Trust Us" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          {/* Hero Content */}
          <div className="max-w-6xl mx-auto text-center mb-20 mt-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm">AI-Powered Skill Verification</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Verify Your Skills,
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Boost Your Career
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect your GitHub, upload your CV, and get an instant AI-powered skill verification report. 
              Stand out with validated credentials that employers trust.
            </p>

            {!isLoggedIn ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/upload-resume")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-full shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                >
                  <Github className="w-5 h-5 mr-2" />
                  Sign In with GitHub
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-slate-600 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full"
                >
                  Watch Demo
                </Button>
              </div>
            ) : (
              <Button 
                size="lg" 
                onClick={() => navigate("/upload-resume")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-full shadow-lg shadow-blue-500/25"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Your CV Now
              </Button>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-20">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all hover:scale-105"
              >
                <div className="text-4xl font-bold text-blue-400 mb-2">{stat.number}</div>
                <div className="text-slate-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Three simple steps to verify your skills and get hired faster
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              className="relative group"
            >
              <div className={`p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 h-full ${
                hoveredFeature === index ? 'scale-105 border-blue-500/50 shadow-lg shadow-blue-500/20' : ''
              }`}>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 transition-all duration-300 ${
                  hoveredFeature === index ? 'scale-110' : ''
                }`}>
                  <div className="text-blue-400">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-3xl p-12 border border-blue-500/20 backdrop-blur-sm">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Why Choose SkillVerifier?
              </h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Our AI-powered platform analyzes your GitHub contributions and CV to provide 
                a comprehensive skill assessment that helps you stand out in the job market.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-slate-200 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
                <FileText className="w-16 h-16 text-blue-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Get Your Report</h3>
                <p className="text-slate-300 mb-6">
                  Receive a detailed skill verification report that includes:
                </p>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                    <span>Technical skill breakdown</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                    <span>GitHub activity analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                    <span>Career recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                    <span>Skill gap identification</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Whether you're a professional or a recruiter, we have the right plan for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* User Plan */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 border border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-blue-400" />
              <h3 className="text-2xl font-bold text-white">For Professionals</h3>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$29</span>
              <span className="text-slate-400">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Unlimited CV uploads
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                GitHub integration
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Detailed skill reports
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Career recommendations
              </li>
            </ul>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate("/upload-resume")}>
              Get Started
            </Button>
          </div>

          {/* Recruiter Plan */}
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-3xl p-8 border-2 border-purple-500/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-8 h-8 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">For Recruiters</h3>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$99</span>
              <span className="text-slate-400">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Access to verified candidates
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Advanced search filters
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Skill matching algorithm
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Priority support
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Analytics dashboard
              </li>
            </ul>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" onClick={handleRecruiterSignIn}>
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-12 border border-blue-500/30 backdrop-blur-sm">
          <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Verify Your Skills?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have validated their expertise and accelerated their careers.
          </p>
          {!isLoggedIn ? (
            <Button 
              size="lg" 
              onClick={() => login()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 py-6 rounded-full shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
            >
              <Github className="w-5 h-5 mr-2" />
              Get Started with GitHub
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button 
              size="lg" 
              onClick={() => navigate("/upload-resume")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 py-6 rounded-full shadow-lg shadow-blue-500/25"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Your CV Now
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer id="about" className="border-t border-slate-800 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold text-white">SkillVerifier</span>
              </div>
              <p className="text-slate-400">
                AI-powered skill verification for the modern workforce.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#about" className="hover:text-blue-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2025 SkillVerifier. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;