'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EyeIcon, EyeSlashIcon, CommandLineIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.username, formData.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { username: 'admin', password: 'admin123', role: 'Admin', color: 'from-blue-500 to-blue-600' },
    { username: 'sarah_support', password: 'support123', role: 'Support', color: 'from-purple-500 to-purple-600' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl animate-float"></div>
      </div>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-10"
      >
        <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo and branding */}
        <div className="text-center animate-fade-in">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/25 mb-6 animate-float">
            <CommandLineIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-primary-500 to-blue-600 bg-clip-text text-transparent">
            Moroccoin Admin
          </h1>
          <p className="mt-2 text-muted-foreground">
            Premium admin portal for financial management
          </p>
        </div>

        {/* Login form */}
        <Card className="animate-scale-in shadow-2xl border-0 bg-card/80 backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your admin account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-slide-down">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className={cn(
                    "flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm transition-all duration-200",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    "hover:border-primary/50"
                  )}
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className={cn(
                      "flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-2 pr-12 text-sm transition-all duration-200",
                      "placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                      "hover:border-primary/50"
                    )}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {/* Demo accounts */}
            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-4 text-center">
                Demo Accounts
              </h3>
              <div className="space-y-3">
                {demoAccounts.map((account, index) => (
                  <div
                    key={account.username}
                    className="p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-all duration-200 cursor-pointer group"
                    onClick={() => setFormData({ username: account.username, password: account.password })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold",
                          account.color
                        )}>
                          {account.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {account.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Password: {account.password}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" size="sm">
                        {account.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-2xs text-muted-foreground text-center mt-3">
                Click on any demo account to auto-fill credentials
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>All systems operational</span>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
          </div>
          
          <p className="text-xs text-muted-foreground">
            © 2024 Moroccoin. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}