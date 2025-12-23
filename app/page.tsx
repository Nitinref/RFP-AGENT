'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Users, 
  Clock, 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3, 
  Target,
  MessageSquare,
  Globe,
  Building2,
  Sparkles,
  Star,
  ChevronRight,
  Play,
  Rocket,
  Award,
  Lightbulb,
  Cpu,
  Brain,
  Cloud,
  Lock,
  BarChart,
  MousePointerClick,
  Target as TargetIcon,
  Clock as ClockIcon,
  ShieldCheck,
  ChevronLeft,
  ChevronDown,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from "../components/ui/textarea";

// Feature cards data
const features = [
  {
    icon: <Brain className="h-10 w-10" />,
    title: "Intelligent Analysis",
    description: "Deep learning algorithms extract requirements and suggest optimal responses",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
    delay: 0.1
  },
  {
    icon: <BarChart className="h-10 w-10" />,
    title: "Smart Templates",
    description: "Dynamic templates that evolve with your successful proposals",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
    delay: 0.2
  },
  {
    icon: <Users className="h-10 w-10" />,
    title: "Team Collaboration",
    description: "Real-time editing, comments, and version control for teams",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
    delay: 0.3
  },
  {
    icon: <TargetIcon className="h-10 w-10" />,
    title: "Win Probability AI",
    description: "Predict success rates with 95% accuracy using historical data",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-gradient-to-br from-orange-500/10 to-red-500/10",
    delay: 0.4
  },
  {
    icon: <ClockIcon className="h-10 w-10" />,
    title: "Time Intelligence",
    description: "Smart scheduling and deadline prediction with alerts",
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-gradient-to-br from-indigo-500/10 to-blue-500/10",
    delay: 0.5
  },
  {
    icon: <ShieldCheck className="h-10 w-10" />,
    title: "Compliance Guard",
    description: "Automated compliance checks with regulatory frameworks",
    color: "from-teal-500 to-green-500",
    bgColor: "bg-gradient-to-br from-teal-500/10 to-green-500/10",
    delay: 0.6
  }
];

// Testimonials data
const testimonials = [
  {
    name: "Sarah Chen",
    role: "RFP Manager at TechCorp",
    content: "Cut our RFP response time by 70%. The AI suggestions are incredibly accurate.",
    avatar: "SC",
    rating: 5,
    company: "Fortune 500 Tech"
  },
  {
    name: "Michael Rodriguez",
    role: "Director of Sales at InnovateInc",
    content: "Our win rate increased from 35% to 68% within 3 months of using this platform.",
    avatar: "MR",
    rating: 5,
    company: "Enterprise SaaS"
  },
  {
    name: "Jessica Williams",
    role: "Procurement Lead at GlobalSystems",
    content: "The collaboration features transformed how our teams work together on proposals.",
    avatar: "JW",
    rating: 5,
    company: "Global Consulting"
  }
];

// Stats data
const stats = [
  { value: "65%", label: "Faster RFP Completion", icon: <Zap className="h-6 w-6" /> },
  { value: "85%", label: "Higher Win Rate", icon: <TrendingUp className="h-6 w-6" /> },
  { value: "200+", label: "Enterprise Clients", icon: <Building2 className="h-6 w-6" /> },
  { value: "40h", label: "Saved per RFP", icon: <Clock className="h-6 w-6" /> }
];

// Animated gradient background component
const AnimatedGradient = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      animate={{
        x: [0, 100, 0],
        y: [0, 50, 0],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl"
    />
    <motion.div
      animate={{
        x: [0, -100, 0],
        y: [0, -50, 0],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl"
    />
    <motion.div
      animate={{
        x: [0, 50, 0],
        y: [0, 100, 0],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute -bottom-40 left-20 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl"
    />
  </div>
);

// Floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
          initial={{
            x: Math.random() * 100 + 'vw',
            y: Math.random() * 100 + 'vh',
          }}
          animate={{
            y: [null, Math.random() * 100 + 'vh'],
            x: [null, Math.random() * 100 + 'vw'],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default function LandingPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    if (user) {
      router.push('/rfps');
    }
  }, [user, router]);

  const handleGetStarted = () => {
    if (user) {
      router.push('/rfps');
    } else {
      router.push('/register');
    }
  };

  const handleDemoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Demo request received! We\'ll contact you shortly.');
      setEmail('');
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/30">
      <FloatingParticles />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="relative">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1 -right-1 w-4 h-4 border-2 border-blue-400 rounded-full"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                RFP<span className="text-blue-600">Pro</span>
              </span>
              <Badge variant="outline" className="hidden md:flex border-blue-200 text-blue-600 bg-blue-50">
                <Sparkles className="mr-1 h-3 w-3" />
                AI-Powered
              </Badge>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'Testimonials', 'Pricing', 'Enterprise'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  whileHover={{ y: -2 }}
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/login')}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              >
                Sign In
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <AnimatedGradient />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block mb-8"
            >
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-6 py-2 shadow-lg">
                <Sparkles className="mr-2 h-4 w-4" />
                Now with GPT-4o Integration
                <div className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  NEW
                </div>
              </Badge>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="block bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 bg-clip-text text-transparent"
              >
                Automate Your
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="block text-gray-900 mt-2"
              >
                RFP Process with AI
              </motion.span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Transform hours of manual work into minutes of automated excellence. 
              Our AI-powered platform helps you create winning proposals faster and smarter.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-10 py-7 text-lg shadow-xl shadow-blue-500/30"
                >
                  <Rocket className="mr-3 h-5 w-5" />
                  Start Free Trial
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-10 py-7 text-lg border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 group"
                  onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Play className="mr-3 h-5 w-5 group-hover:text-blue-600" />
                  Watch Interactive Demo
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Interactive Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl border border-gray-200/50 bg-gradient-to-br from-white/80 via-white/60 to-blue-50/30 backdrop-blur-sm shadow-2xl shadow-blue-500/10 overflow-hidden">
              {/* Glass morphism effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/20 to-cyan-50/30" />
              
              {/* Dashboard grid lines */}
              <div className="absolute inset-0 bg-grid-gray-100/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]" />
              
              {/* Mock dashboard with more detail */}
              <div className="relative p-8 md:p-12">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">dashboard.rfppro.com</div>
                  </div>
                  <div className="hidden md:flex items-center space-x-2">
                    <div className="w-24 h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full"></div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: "Active RFPs", value: "12", change: "+3", color: "from-blue-400 to-blue-500" },
                    { label: "Win Rate", value: "85%", change: "+12%", color: "from-green-400 to-green-500" },
                    { label: "Time Saved", value: "42h", change: "This week", color: "from-purple-400 to-purple-500" },
                    { label: "Team Activity", value: "96%", change: "Active", color: "from-orange-400 to-orange-500" }
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      whileHover={{ y: -4 }}
                      className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          {stat.change}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Main content area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-lg font-bold">Recent RFPs</div>
                        <div className="text-sm text-blue-600 cursor-pointer">View All</div>
                      </div>
                      <div className="space-y-4">
                        {['Enterprise Cloud', 'Govt. Contract', 'Healthcare RFP'].map((title, i) => (
                          <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">{title}</div>
                                <div className="text-sm text-gray-500">Due in {2 + i} days</div>
                              </div>
                            </div>
                            <Badge variant="outline" className={
                              i === 0 ? "border-green-200 text-green-700 bg-green-50" :
                              i === 1 ? "border-blue-200 text-blue-700 bg-blue-50" :
                              "border-purple-200 text-purple-700 bg-purple-50"
                            }>
                              {i === 0 ? "High Priority" : i === 1 ? "In Progress" : "Review"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white h-full">
                      <div className="flex items-center justify-between mb-8">
                        <div className="text-xl font-bold">AI Suggestions</div>
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                          <Brain className="h-5 w-5" />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <motion.div
                          animate={{ x: [0, 10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <div className="font-medium">Add security compliance section</div>
                          </div>
                          <div className="text-sm text-blue-100 mt-2">Based on similar successful proposals</div>
                        </motion.div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                            <div className="font-medium">Update pricing model</div>
                          </div>
                          <div className="text-sm text-blue-100 mt-2">Match competitor analysis</div>
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">Confidence Score</div>
                          <div className="text-xl font-bold">94%</div>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full mt-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "94%" }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -right-6 w-28 h-28 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl rotate-12 shadow-xl backdrop-blur-sm border border-purple-200/20"
            />
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl -rotate-12 shadow-xl backdrop-blur-sm border border-cyan-200/20"
            />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50/50 via-white/50 to-cyan-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 text-center hover:shadow-xl transition-all duration-300">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-blue-600">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                    {stat.value}
                  </div>
                  <div className="text-gray-700 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block mb-6"
            >
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600 px-6 py-2">
                <Lightbulb className="mr-2 h-4 w-4" />
                Powered by Advanced AI
              </Badge>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              Everything You Need to <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Win More Deals</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our platform combines cutting-edge AI with intuitive tools to streamline your entire RFP process
            </p>
          </motion.div>

          {/* Interactive feature showcase */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="space-y-8">
                {features.slice(0, 3).map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onMouseEnter={() => setActiveFeature(index)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                      activeFeature === index 
                        ? 'bg-white shadow-2xl border border-gray-200/50' 
                        : 'bg-gray-50/50 hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-4 rounded-2xl ${feature.bgColor} transition-transform duration-300 ${
                        activeFeature === index ? 'scale-110' : ''
                      }`}>
                        <div className={`bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                          {feature.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-[400px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl" />
              <div className="relative h-full flex items-center justify-center">
                {activeFeature === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-8"
                  >
                    <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl flex items-center justify-center">
                      <Brain className="h-32 w-32 text-blue-500/30" />
                    </div>
                  </motion.div>
                )}
                {activeFeature === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-8"
                  >
                    <div className="w-64 h-64 mx-auto bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl flex items-center justify-center">
                      <BarChart className="h-32 w-32 text-purple-500/30" />
                    </div>
                  </motion.div>
                )}
                {activeFeature === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-8"
                  >
                    <div className="w-64 h-64 mx-auto bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl flex items-center justify-center">
                      <Users className="h-32 w-32 text-green-500/30" />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Features grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                transition={{ delay: feature.delay }}
              >
                <Card className="h-full border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-cyan-500/0 group-hover:via-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-500" />
                  <CardHeader className="relative">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-20 h-20 rounded-3xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
                    >
                      <div className={`bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                        {feature.icon}
                      </div>
                    </motion.div>
                    <CardTitle className="text-2xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription className="text-gray-600 text-lg">
                      {feature.description}
                    </CardDescription>
                    <div className="mt-8 flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                      <span className="text-sm font-medium">Explore feature</span>
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge variant="outline" className="mb-6 border-green-200 bg-green-50 text-green-600 px-6 py-2">
              <Cpu className="mr-2 h-4 w-4" />
              Simple 4-Step Workflow
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              From RFP to Win in <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">4 Simple Steps</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 via-green-500/20 to-emerald-500/20 -translate-y-1/2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  step: "01", 
                  title: "Upload & Analyze", 
                  desc: "AI extracts requirements in seconds", 
                  icon: <FileText />,
                  color: "from-blue-500 to-cyan-500"
                },
                { 
                  step: "02", 
                  title: "AI-Powered Draft", 
                  desc: "Auto-generate responses from your library", 
                  icon: <Sparkles />,
                  color: "from-purple-500 to-pink-500"
                },
                { 
                  step: "03", 
                  title: "Collaborate & Refine", 
                  desc: "Real-time team collaboration", 
                  icon: <Users />,
                  color: "from-green-500 to-emerald-500"
                },
                { 
                  step: "04", 
                  title: "Submit & Track", 
                  desc: "Smart submission with analytics", 
                  icon: <CheckCircle />,
                  color: "from-orange-500 to-red-500"
                }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="relative"
                >
                  <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200/50 text-center h-full">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {item.step}
                      </div>
                    </div>
                    
                    <div className={`w-24 h-24 rounded-3xl bg-gradient-to-r ${item.color} flex items-center justify-center mx-auto mt-4 mb-8 shadow-xl`}>
                      <div className="text-white">{item.icon}</div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    <p className="text-gray-600 mb-6">{item.desc}</p>
                    
                    <div className="mt-8">
                      <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                        Learn more
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge variant="outline" className="mb-6 border-purple-200 bg-purple-50 text-purple-600 px-6 py-2">
              <Award className="mr-2 h-4 w-4" />
              Trusted by Industry Leaders
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              Loved by Teams That <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Win Big</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="p-8">
                    <div className="flex mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <p className="text-gray-700 text-lg italic mb-8 leading-relaxed">"{testimonial.content}"</p>
                    
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                          {testimonial.avatar}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <div className="font-bold text-lg">{testimonial.name}</div>
                        <div className="text-gray-600">{testimonial.role}</div>
                        <div className="text-sm text-blue-600 font-medium mt-1">{testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive CTA Section */}
      <section id="demo" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-4xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-12 md:p-16 text-center overflow-hidden shadow-2xl shadow-blue-500/30"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-grid-white/10 bg-[size:30px_30px]" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full"
            />
            
            <div className="relative">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block mb-8"
              >
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 px-6 py-2">
                  <Rocket className="mr-2 h-4 w-4" />
                  Limited Time Offer
                </Badge>
              </motion.div>
              
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
                Ready to Transform Your RFP Process?
              </h2>
              
              <p className="text-xl text-blue-100/90 mb-12 max-w-2xl mx-auto leading-relaxed">
                Join thousands of teams already winning more deals with RFPPro. 
                Start your free trial today.
              </p>
              
              <motion.form 
                onSubmit={handleDemoRequest} 
                className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Input
                  type="email"
                  placeholder="Enter your work email"
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-blue-200/70 flex-1 py-6 text-lg rounded-2xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-6 text-lg font-semibold rounded-2xl shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Get Free Demo
                        <ArrowRight className="ml-3 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.form>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
              >
                {[
                  { icon: <CheckCircle />, text: "No credit card required" },
                  { icon: <Clock />, text: "14-day free trial" },
                  { icon: <Shield />, text: "Enterprise-grade security" }
                ].map((item, index) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-center space-x-3 text-blue-200/90"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-8">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg"
                >
                  <FileText className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <span className="text-3xl font-bold text-white">
                    RFP<span className="text-blue-400">Pro</span>
                  </span>
                  <div className="text-sm text-blue-400">AI-Powered Proposal Platform</div>
                </div>
              </div>
              <p className="text-gray-400 mb-8 max-w-md">
                Transform your RFP process with cutting-edge AI technology. 
                Win more deals, faster and smarter.
              </p>
              <div className="flex space-x-4">
                {['Twitter', 'LinkedIn', 'GitHub', 'Discord'].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    whileHover={{ y: -3, scale: 1.1 }}
                    className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                  >
                    {social.charAt(0)}
                  </motion.a>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "API", "Documentation", "Status"]
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Press", "Contact"]
              },
              {
                title: "Resources",
                links: ["Help Center", "Community", "Templates", "Webinars", "Research"]
              }
            ].map((column) => (
              <div key={column.title}>
                <h3 className="text-white font-bold text-lg mb-6">{column.title}</h3>
                <ul className="space-y-4">
                  {column.links.map((link) => (
                    <li key={link}>
                      <motion.a
                        href="#"
                        whileHover={{ x: 5 }}
                        className="hover:text-white transition-colors flex items-center group"
                      >
                        <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                        <span className="ml-2">{link}</span>
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} RFPPro. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}