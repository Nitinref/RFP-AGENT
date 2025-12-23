'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  Zap, 
  Shield, 
  TrendingUp,
  Sparkles,
  Brain,
  FileText,
  Building2,
  Clock,
  Target,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push('/rfps');
    }, 1500);
  };

  const stats = [
    { value: "200+", label: "Enterprises", icon: <Building2 className="h-4 w-4" /> },
    { value: "85%", label: "Win Rate", icon: <Target className="h-4 w-4" /> },
    { value: "65%", label: "Faster Proposals", icon: <Zap className="h-4 w-4" /> },
    { value: "40h", label: "Time Saved", icon: <Clock className="h-4 w-4" /> }
  ];

  const features = [
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI-Powered Analysis",
      description: "Intelligent RFP analysis with automated response suggestions"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Enterprise Security",
      description: "Bank-level security with encryption and compliance"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "65% Faster Proposals",
      description: "Automate manual tasks to complete proposals faster"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      </div>

      <div className="relative min-h-screen flex">
        {/* Left side - Brand and Stats (Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col p-8 lg:p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 mb-8 lg:mb-12"
          >
            <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                RFP<span className="text-blue-600">Pro</span>
              </span>
              <div className="text-sm text-gray-500 font-medium">AI-Powered RFP Management</div>
            </div>
          </motion.div>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 lg:mb-12"
            >
              <span className="inline-flex items-center mb-4 lg:mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="mr-2 h-4 w-4" />
                Welcome to the future of RFP management
              </span>
              
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 lg:mb-6">
                <span className="text-gray-900">Transform</span>
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> Manual Work</span>
                <span className="block text-gray-900">Into Automated Excellence</span>
              </h1>
              
              <p className="text-gray-600 text-base lg:text-lg max-w-md">
                Transform hours of manual work into minutes of automated excellence with our AI-powered platform.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 lg:space-y-6 mb-8 lg:mb-12"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start space-x-3 lg:space-x-4 p-3 lg:p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                    <div className="text-blue-600">
                      {feature.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
            >
              {stats.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-gray-100 text-center"
                >
                  <div className="flex justify-center mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <div className="text-blue-600">
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1 lg:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-500 mt-8"
          >
            © {new Date().getFullYear()} RFPPro. All rights reserved.
          </motion.div>
        </div>

        {/* Right side - Sign In Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-6">
          <div className="w-full max-w-sm lg:max-w-md">
            {/* Mobile Header - Only shows on mobile */}
            <div className="lg:hidden mb-6">
              {/* Mobile Logo */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    RFP<span className="text-blue-600">Pro</span>
                  </span>
                  <div className="text-sm text-gray-500">AI-Powered RFP Management</div>
                </div>
              </div>

              {/* Mobile Hero */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <span className="inline-flex items-center mb-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-3 py-1.5 rounded-full text-xs font-medium">
                  <Sparkles className="mr-1.5 h-3 w-3" />
                  Welcome to RFPPro
                </span>
                
                <h1 className="text-2xl font-bold tracking-tight mb-3">
                  <span className="text-gray-900">Transform</span>
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> Manual Work</span>
                  <span className="block text-gray-900">Into Automated Excellence</span>
                </h1>
                
                <p className="text-gray-600 text-sm">
                  Transform hours of manual work into minutes of automated excellence with our AI-powered platform.
                </p>
              </motion.div>

              {/* Mobile Features */}
              <div className="mb-6">
                {features.map((feature, index) => (
                  <div
                    key={feature.title}
                    className="flex items-start space-x-3 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-100 mb-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                      <div className="text-blue-600">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{feature.title}</h3>
                      <p className="text-gray-600 text-xs">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sign In Card - Shows on both mobile and desktop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm w-full">
                <CardHeader className="space-y-2 pb-4">
                  <CardTitle className="text-xl lg:text-2xl font-bold">Sign in to your account</CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    Enter your credentials to access the platform
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-gray-700 font-medium block text-sm">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          className="pl-9 lg:pl-10 h-11 lg:h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm lg:text-base w-full"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-gray-700 font-medium block text-sm">
                          Password
                        </label>
                        <Link
                          href="/forgot-password"
                          className="text-xs lg:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-9 lg:pl-10 pr-9 lg:pr-10 h-11 lg:h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm lg:text-base w-full"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 lg:h-5 lg:w-5" />
                          ) : (
                            <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setRememberMe(!rememberMe)}
                        className={`w-4 h-4 lg:w-5 lg:h-5 rounded border flex items-center justify-center transition-all ${
                          rememberMe 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                        aria-checked={rememberMe}
                        role="checkbox"
                      >
                        {rememberMe && (
                          <Check className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-white" strokeWidth={3} />
                        )}
                      </button>
                      <label
                        htmlFor="remember"
                        className="text-sm text-gray-600 cursor-pointer select-none"
                        onClick={() => setRememberMe(!rememberMe)}
                      >
                        Remember me
                      </label>
                    </div>

                    {/* Sign In Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 lg:h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-600/30 transition-all duration-300 text-sm lg:text-base"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-2 border-white border-t-transparent mr-2" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign in to RFPPro
                          <ArrowRight className="ml-2 h-3 w-3 lg:h-4 lg:w-4" />
                        </>
                      )}
                    </Button>

                    {/* Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500 text-xs lg:text-sm">Or continue with</span>
                      </div>
                    </div>

                    {/* Social Sign In */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 lg:h-11 rounded-lg border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                      >
                        <svg className="w-4 h-4 lg:w-5 lg:h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Google
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 lg:h-11 rounded-lg border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                      >
                        <svg className="w-4 h-4 lg:w-5 lg:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                      </Button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center pt-4">
                      <p className="text-gray-600 text-xs lg:text-sm">
                        Don&apos;t have an account?{' '}
                        <Link
                          href="/register"
                          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        >
                          Sign up for free
                        </Link>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mobile Stats and Footer - Only shows on mobile */}
            <div className="lg:hidden mt-6">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white/70 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-100">
                    <div className="flex justify-center mb-1">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <div className="text-blue-600">
                          {stat.icon}
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-600 mb-0.5">{stat.value}</div>
                    <div className="text-gray-600 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Mobile Footer */}
              <div className="text-center text-xs text-gray-500">
                © {new Date().getFullYear()} RFPPro. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}