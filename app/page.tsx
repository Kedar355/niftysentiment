"use client"

import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  BarChart3,
  Bell,
  Users,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen main-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen main-bg">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                NiftySentiment
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/auth">
                  Sign In
                </Link>
              </Button>
              <Button asChild>
                <Link href="/auth">
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Track Market Sentiment with
            <span className="block text-foreground">
              Real-time Analysis
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Get insights into Indian stock market sentiment through advanced AI analysis of news,
            social media, and market data. Make informed investment decisions with our comprehensive
            sentiment tracking platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
            >
              <Link href="/auth">
                Start Tracking
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powerful Features for Smart Investors
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with real-time market data to give you the edge you need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="minimal-card hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Sentiment Analysis</CardTitle>
              <CardDescription>
                Advanced AI analyzes news, social media, and market data to provide real-time sentiment scores
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="minimal-card hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Stock Tracking</CardTitle>
              <CardDescription>
                Monitor your favorite stocks with real-time prices, charts, and personalized watchlists
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="minimal-card hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Smart Alerts</CardTitle>
              <CardDescription>
                Get notified when sentiment changes or stocks hit your target prices
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="minimal-card hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Market Insights</CardTitle>
              <CardDescription>
                Daily market summaries and analysis to keep you informed about market trends
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="minimal-card hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Community</CardTitle>
              <CardDescription>
                Join a community of investors sharing insights and market analysis
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="minimal-card hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Historical Data</CardTitle>
              <CardDescription>
                Access historical sentiment data and correlate it with stock performance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-primary-foreground">1</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Sign Up</h3>
            <p className="text-muted-foreground">
              Create your free account and set up your investment preferences
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-primary-foreground">2</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Add Stocks</h3>
            <p className="text-muted-foreground">
              Build your watchlist with your favorite Indian stocks to track
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-primary-foreground">3</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Get Insights</h3>
            <p className="text-muted-foreground">
              Receive real-time sentiment analysis and market insights
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="minimal-card">
          <CardContent className="text-center py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Make Smarter Investments?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of investors who are already using NiftySentiment to track market sentiment
              and make informed decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
              >
                <Link href="/auth">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
              >
                View Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                NiftySentiment
              </span>
            </div>
            <p className="text-muted-foreground text-center md:text-right">
              © 2024 NiftySentiment. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}