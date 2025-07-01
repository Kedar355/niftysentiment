"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Target,
  TrendingUp,
  Shield,
  AlertTriangle,
  Plus,
  Trash2,
  RefreshCw,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface Holding {
  symbol: string;
  quantity: number;
  avgPrice?: number;
}

interface PortfolioOptimizerProps {
  initialHoldings?: Holding[];
}

const PortfolioOptimizer: React.FC<PortfolioOptimizerProps> = ({ initialHoldings = [] }) => {
  const [holdings, setHoldings] = useState<Holding[]>(initialHoldings);
  const [optimization, setOptimization] = useState<any>(null);
  const [correlations, setCorrelations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newHolding, setNewHolding] = useState({ symbol: '', quantity: 0 });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    if (holdings.length > 0) {
      optimizePortfolio();
    }
  }, [holdings]);

  const optimizePortfolio = async () => {
    if (holdings.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/portfolio/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ holdings })
      });

      if (response.ok) {
        const data = await response.json();
        setOptimization(data.optimization);
        setCorrelations(data.correlations);
      } else {
        toast.error('Failed to optimize portfolio');
      }
    } catch (error) {
      console.error('Error optimizing portfolio:', error);
      toast.error('Error optimizing portfolio');
    } finally {
      setIsLoading(false);
    }
  };

  const addHolding = () => {
    if (newHolding.symbol && newHolding.quantity > 0) {
      setHoldings(prev => [...prev, { ...newHolding }]);
      setNewHolding({ symbol: '', quantity: 0 });
    }
  };

  const removeHolding = (index: number) => {
    setHoldings(prev => prev.filter((_, i) => i !== index));
  };

  const updateHolding = (index: number, field: keyof Holding, value: any) => {
    setHoldings(prev => prev.map((holding, i) => 
      i === index ? { ...holding, [field]: value } : holding
    ));
  };

  const exportPortfolio = () => {
    const csvContent = [
      ['Symbol', 'Quantity', 'Avg Price'].join(','),
      ...holdings.map(h => [h.symbol, h.quantity, h.avgPrice || ''].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const allocationData = optimization?.recommendedAllocation ? 
    Object.entries(optimization.recommendedAllocation).map(([sector, percentage]) => ({
      name: sector,
      value: percentage
    })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Portfolio Optimizer</h2>
          <p className="text-muted-foreground">Analyze and optimize your stock portfolio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPortfolio} disabled={holdings.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={optimizePortfolio} disabled={isLoading || holdings.length === 0}>
            {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
            {isLoading ? 'Optimizing...' : 'Optimize'}
          </Button>
        </div>
      </div>

      {/* Holdings Input */}
      <Card className="minimal-card">
        <CardHeader>
          <CardTitle>Portfolio Holdings</CardTitle>
          <CardDescription>Add your current stock holdings to analyze your portfolio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Holding */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Stock Symbol</Label>
              <Input
                placeholder="e.g., RELIANCE"
                value={newHolding.symbol}
                onChange={(e) => setNewHolding(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              />
            </div>
            <div className="flex-1">
              <Label>Quantity</Label>
              <Input
                type="number"
                placeholder="Number of shares"
                value={newHolding.quantity || ''}
                onChange={(e) => setNewHolding(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <Button onClick={addHolding} disabled={!newHolding.symbol || newHolding.quantity <= 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Current Holdings */}
          {holdings.length > 0 && (
            <div className="space-y-2">
              <Label>Current Holdings</Label>
              <div className="space-y-2">
                {holdings.map((holding, index) => (
                  <div key={index} className="flex gap-4 items-center p-3 border rounded-lg">
                    <div className="flex-1">
                      <Input
                        value={holding.symbol}
                        onChange={(e) => updateHolding(index, 'symbol', e.target.value.toUpperCase())}
                        placeholder="Symbol"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={holding.quantity}
                        onChange={(e) => updateHolding(index, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="Quantity"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={holding.avgPrice || ''}
                        onChange={(e) => updateHolding(index, 'avgPrice', parseFloat(e.target.value) || undefined)}
                        placeholder="Avg Price (optional)"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => removeHolding(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Results */}
      {optimization && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Metrics */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Portfolio Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Value */}
              <div>
                <Label className="text-sm font-medium">Portfolio Value</Label>
                <p className="text-2xl font-bold">₹{optimization.currentValue.toLocaleString()}</p>
              </div>

              {/* Risk Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium">Risk Score</Label>
                  <span className={`font-bold ${getRiskColor(optimization.riskScore)}`}>
                    {optimization.riskScore.toFixed(0)}/100
                  </span>
                </div>
                <Progress value={optimization.riskScore} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {optimization.riskScore < 30 ? 'Conservative' : 
                   optimization.riskScore < 60 ? 'Moderate' : 'Aggressive'}
                </p>
              </div>

              {/* Diversification Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium">Diversification</Label>
                  <span className="font-bold text-blue-600">
                    {optimization.diversificationScore.toFixed(0)}/100
                  </span>
                </div>
                <Progress value={optimization.diversificationScore} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {optimization.diversificationScore > 80 ? 'Well Diversified' : 
                   optimization.diversificationScore > 60 ? 'Moderately Diversified' : 'Needs Diversification'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Allocation */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle>Recommended Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Optimization Suggestions */}
      {optimization?.suggestions && (
        <Card className="minimal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimization.suggestions.map((suggestion: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="mt-1">
                    {suggestion.action === 'rebalance' ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Plus className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium capitalize">{suggestion.action}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                    <Badge variant="outline" className="mt-2">
                      {suggestion.impact}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Correlation Matrix */}
      {correlations && (
        <Card className="minimal-card">
          <CardHeader>
            <CardTitle>Stock Correlations</CardTitle>
            <CardDescription>
              Correlation between your holdings (1 = perfect correlation, -1 = inverse correlation)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2"></th>
                    {Object.keys(correlations).map(symbol => (
                      <th key={symbol} className="text-center p-2 font-medium">{symbol}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(correlations).map(([symbol1, correlationRow]: [string, any]) => (
                    <tr key={symbol1}>
                      <td className="font-medium p-2">{symbol1}</td>
                      {Object.entries(correlationRow).map(([symbol2, correlation]: [string, any]) => (
                        <td key={symbol2} className="text-center p-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            correlation > 0.7 ? 'bg-red-100 text-red-800' :
                            correlation > 0.3 ? 'bg-yellow-100 text-yellow-800' :
                            correlation > -0.3 ? 'bg-gray-100 text-gray-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {correlation.toFixed(2)}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortfolioOptimizer;