"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  PieChart as PieChartIcon,
  DollarSign,
  Target,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { StockData } from '@/lib/stocks';
import { toast } from 'sonner';

interface PortfolioHolding {
  id: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  sector: string;
}

interface PortfolioTrackerProps {
  stocks: StockData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const PortfolioTracker: React.FC<PortfolioTrackerProps> = ({ stocks }) => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [newHolding, setNewHolding] = useState({
    symbol: '',
    quantity: '',
    avgPrice: ''
  });
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalCurrent, setTotalCurrent] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [totalPnLPercent, setTotalPnLPercent] = useState(0);

  useEffect(() => {
    loadPortfolio();
  }, []);

  useEffect(() => {
    updatePortfolioValues();
  }, [holdings, stocks]);

  const loadPortfolio = () => {
    const savedPortfolio = localStorage.getItem('portfolio');
    if (savedPortfolio) {
      setHoldings(JSON.parse(savedPortfolio));
    }
  };

  const savePortfolio = (updatedHoldings: PortfolioHolding[]) => {
    localStorage.setItem('portfolio', JSON.stringify(updatedHoldings));
    setHoldings(updatedHoldings);
  };

  const updatePortfolioValues = () => {
    const updatedHoldings = holdings.map(holding => {
      const currentStock = stocks.find(s => s.symbol === holding.symbol);
      const currentPrice = currentStock?.price || holding.avgPrice;
      const currentValue = holding.quantity * currentPrice;
      const pnl = currentValue - holding.investedValue;
      const pnlPercent = (pnl / holding.investedValue) * 100;

      return {
        ...holding,
        currentPrice,
        currentValue,
        pnl,
        pnlPercent,
        sector: currentStock?.sector || 'Unknown'
      };
    });

    setHoldings(updatedHoldings);

    // Calculate totals
    const invested = updatedHoldings.reduce((sum, h) => sum + h.investedValue, 0);
    const current = updatedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
    const pnl = current - invested;
    const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

    setTotalInvested(invested);
    setTotalCurrent(current);
    setTotalPnL(pnl);
    setTotalPnLPercent(pnlPercent);
  };

  const addHolding = () => {
    if (!newHolding.symbol || !newHolding.quantity || !newHolding.avgPrice) {
      toast.error('Please fill all fields');
      return;
    }

    const quantity = parseFloat(newHolding.quantity);
    const avgPrice = parseFloat(newHolding.avgPrice);
    const investedValue = quantity * avgPrice;

    const holding: PortfolioHolding = {
      id: Date.now().toString(),
      symbol: newHolding.symbol,
      quantity,
      avgPrice,
      currentPrice: avgPrice,
      investedValue,
      currentValue: investedValue,
      pnl: 0,
      pnlPercent: 0,
      sector: stocks.find(s => s.symbol === newHolding.symbol)?.sector || 'Unknown'
    };

    const updatedHoldings = [...holdings, holding];
    savePortfolio(updatedHoldings);
    setNewHolding({ symbol: '', quantity: '', avgPrice: '' });
    toast.success('Holding added successfully');
  };

  const removeHolding = (id: string) => {
    const updatedHoldings = holdings.filter(h => h.id !== id);
    savePortfolio(updatedHoldings);
    toast.success('Holding removed');
  };

  const getSectorAllocation = () => {
    const sectorMap = new Map<string, number>();
    holdings.forEach(holding => {
      const current = sectorMap.get(holding.sector) || 0;
      sectorMap.set(holding.sector, current + holding.currentValue);
    });

    return Array.from(sectorMap.entries()).map(([sector, value]) => ({
      name: sector,
      value: value,
      percentage: (value / totalCurrent) * 100
    }));
  };

  const getTopHoldings = () => {
    return holdings
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 5);
  };

  const getBestPerformers = () => {
    return holdings
      .filter(h => h.pnlPercent > 0)
      .sort((a, b) => b.pnlPercent - a.pnlPercent)
      .slice(0, 5);
  };

  const getWorstPerformers = () => {
    return holdings
      .filter(h => h.pnlPercent < 0)
      .sort((a, b) => a.pnlPercent - b.pnlPercent)
      .slice(0, 5);
  };

  const sectorData = getSectorAllocation();

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="minimal-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold">₹{totalInvested.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="text-2xl font-bold">₹{totalCurrent.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
                </p>
              </div>
              {totalPnL >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Returns</p>
                <p className={`text-2xl font-bold ${totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="holdings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="add">Add Holding</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings">
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle>Your Holdings ({holdings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {holdings.length === 0 ? (
                <div className="text-center py-8">
                  <PieChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No holdings added yet</p>
                  <p className="text-sm text-muted-foreground">Add your first holding to start tracking</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {holdings.map((holding) => (
                    <div key={holding.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold">{holding.symbol}</h3>
                          <p className="text-sm text-muted-foreground">
                            {holding.quantity} shares @ ₹{holding.avgPrice.toFixed(2)}
                          </p>
                        </div>
                        <Badge variant="outline">{holding.sector}</Badge>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">₹{holding.currentValue.toLocaleString()}</p>
                        <p className={`text-sm ${holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl.toLocaleString()} ({holding.pnlPercent.toFixed(2)}%)
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHolding(holding.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="minimal-card">
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="minimal-card">
              <CardHeader>
                <CardTitle>Top Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getTopHoldings().map((holding, index) => (
                    <div key={holding.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{holding.symbol}</p>
                          <p className="text-sm text-muted-foreground">{holding.sector}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{holding.currentValue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {((holding.currentValue / totalCurrent) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="minimal-card">
              <CardHeader>
                <CardTitle className="text-green-600">Best Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getBestPerformers().map((holding) => (
                    <div key={holding.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">{holding.symbol}</p>
                        <p className="text-sm text-muted-foreground">₹{holding.currentValue.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+{holding.pnlPercent.toFixed(2)}%</p>
                        <p className="text-sm text-green-600">+₹{holding.pnl.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {getBestPerformers().length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No profitable holdings</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="minimal-card">
              <CardHeader>
                <CardTitle className="text-red-600">Worst Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getWorstPerformers().map((holding) => (
                    <div key={holding.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium">{holding.symbol}</p>
                        <p className="text-sm text-muted-foreground">₹{holding.currentValue.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{holding.pnlPercent.toFixed(2)}%</p>
                        <p className="text-sm text-red-600">₹{holding.pnl.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {getWorstPerformers().length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No losing holdings</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="add">
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle>Add New Holding</CardTitle>
              <CardDescription>Track your stock investments and P&L</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Stock Symbol</Label>
                  <Select value={newHolding.symbol} onValueChange={(value) => setNewHolding(prev => ({ ...prev, symbol: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stock" />
                    </SelectTrigger>
                    <SelectContent>
                      {stocks.map(stock => (
                        <SelectItem key={stock.symbol} value={stock.symbol}>
                          {stock.symbol} - {stock.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    placeholder="Number of shares"
                    value={newHolding.quantity}
                    onChange={(e) => setNewHolding(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Average Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Purchase price"
                    value={newHolding.avgPrice}
                    onChange={(e) => setNewHolding(prev => ({ ...prev, avgPrice: e.target.value }))}
                  />
                </div>
              </div>
              
              {newHolding.symbol && newHolding.quantity && newHolding.avgPrice && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Investment Summary:</p>
                  <p className="font-semibold">
                    {newHolding.quantity} shares of {newHolding.symbol} at ₹{newHolding.avgPrice} each
                  </p>
                  <p className="text-lg font-bold">
                    Total Investment: ₹{(parseFloat(newHolding.quantity) * parseFloat(newHolding.avgPrice)).toLocaleString()}
                  </p>
                </div>
              )}
              
              <Button onClick={addHolding} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Holding
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioTracker;