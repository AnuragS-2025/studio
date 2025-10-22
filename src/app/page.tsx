
'use client';

import {
 Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpRight,
  CircleDollarSign,
  CreditCard,
  TrendingUp,
  Users,
  PlusCircle,
  Sparkles,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Overview } from "@/components/overview";
import { useBudgets, useInvestments, usePortfolioValue, useRecentTransactions, useTotalExpenses, useTotalIncome, useTransactions, useUserData, useExpenseByCategoryData } from "@/lib/data";
import { AdvisorForm } from "@/app/advisor/advisor-form";
import { GoalForm } from "@/app/goals/goal-form";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanBillForm } from "./expenses/scan-bill-form";
import { AddExpenseForm } from "./expenses/add-expense-form";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { AddIncomeForm } from "./expenses/add-income-form";
import { RemoveTransactionButton } from "./expenses/remove-transaction-button";
import { RemoveInvestmentButton } from "./portfolio/remove-investment-button";
import { AddInvestmentForm } from "./portfolio/add-investment-form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AIStockTrader } from "./portfolio/ai-stock-trader";
import { Icons } from "@/components/icons";
import { useFirestore, useUser } from "@/firebase";
import { doc, updateDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface MarketStock {
  name: string;
  price: number;
  change: number;
  chartData: { value: number }[];
}

const generateChartData = (base: number, points = 12) => {
    const data = [];
    let currentValue = base;
    for (let i = 0; i < points; i++) {
        const volatility = (Math.random() - 0.5) * 2; // -1 to 1
        currentValue += volatility * (base * 0.05); // 5% volatility
        if (currentValue <= 0) currentValue = base * 0.1; // Prevent zero or negative prices
        data.push({ value: Math.round(currentValue * 100) / 100 });
    }
    return data;
};

const MOCK_MARKET_DATA: MarketStock[] = [
    { name: 'RELIANCE', price: 2980.55, change: 1.05, chartData: generateChartData(2980.55) },
    { name: 'TCS', price: 3900.80, change: -0.25, chartData: generateChartData(3900.80) },
    { name: 'HDFCBANK', price: 1705.10, change: 2.15, chartData: generateChartData(1705.10) },
    { name: 'INFY', price: 1580.20, change: -1.10, chartData: generateChartData(1580.20) },
];


export default function Home() {
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const { user } = useUserData();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { recentTransactions, isLoading: recentTransactionsLoading } = useRecentTransactions(5);
  const { investments, isLoading: investmentsLoading } = useInvestments();
  const { budgets, isLoading: budgetsLoading } = useBudgets();
  
  const [isMarketDataLoading, setIsMarketDataLoading] = useState(false);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);

  // Use mock data directly
  const marketData = MOCK_MARKET_DATA;

  const portfolioValue = usePortfolioValue(investments, marketData);
  const totalIncome = useTotalIncome(transactions);
  const totalExpenses = useTotalExpenses(transactions);
  const expenseByCategory = useExpenseByCategoryData(transactions);

  const [showAllMovers, setShowAllMovers] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [activeTab, setActiveTab] = useState('advisor');
  
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const fetchStockData = async (symbol: string, apiKey: string) => {
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.BSE&apikey=${apiKey}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data for ${symbol}`);
        }
        const data = await response.json();

        if (data.Note && data.Note.includes('API call frequency')) {
            toast({
                variant: 'destructive',
                title: 'API Rate Limit Hit',
                description: `Slowing down requests for ${symbol}. Please wait.`,
            });
            await delay(15000); // Wait longer if rate limit is hit
            return await fetchStockData(symbol, apiKey); // Retry the fetch
        }

        const quote = data['Global Quote'];
        if (!quote || Object.keys(quote).length === 0) {
            console.warn(`No data found for symbol: ${symbol}`);
            return null;
        }
        return {
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['10. change percent'].replace('%', '')),
        };
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
    }
  };
  
  const updateData = useCallback(async () => {
    // This function will be called on refresh, but for now it's not implemented
    // to prevent build issues. We can re-add this logic carefully later.
    console.log("Refresh clicked. Data fetching is currently disabled.");
    // Placeholder for refresh logic
    setIsMarketDataLoading(true);
    await delay(2000); // Simulate network delay
    setIsMarketDataLoading(false);
    toast({
        title: "Data Refreshed",
        description: "Market data has been updated (simulation).",
    });

  }, [toast]);

  const topMovers = useMemo(() => 
    [...marketData].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)),
    [marketData]
  );
  
  const displayedMovers = showAllMovers ? topMovers : topMovers.slice(0, 4);
  const displayedTransactions = showAllTransactions ? transactions : recentTransactions;

  const expenseChartConfig = {
      value: { label: "Value" },
      ...expenseByCategory.reduce((acc, cur) => ({
          ...acc,
          [cur.name.toLowerCase().replace(/ /g, '-')]: { label: cur.name, color: cur.color }
      }), {})
  };

  const marketChartConfig = (change: number) => ({
      value: {
          label: 'Value',
          color: change >= 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'
      }
  });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4">
        {/* Dashboard Section */}
        <section id="dashboard" className="space-y-4 scroll-m-20">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Portfolio Value
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {investmentsLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">₹{portfolioValue.toLocaleString('en-IN')}</div>}
                <p className="text-xs text-muted-foreground">
                  Based on latest market data
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Income
                </CardTitle>
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {transactionsLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">₹{totalIncome.toLocaleString('en-IN')}</div>}
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {transactionsLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString('en-IN')}</div>}
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Market Sentiment</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex items-center justify-center pt-6">
                 <div className="text-2xl font-bold uppercase text-green-500">BULLISH</div>
              </CardContent>
            </Card>
          </div>
          
           {/* AI Hub Section */}
           <section id="advisor" className="space-y-4 scroll-m-20">
           <Card className="bg-gradient-primary-accent border-primary/20 shadow-lg">
             <CardHeader className="text-center">
               <CardTitle className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                 Your AI Financial Hub
                 <Sparkles className="h-6 w-6 text-primary" />
                 </CardTitle>
               <CardDescription className="text-lg text-muted-foreground">
                 Unlock personalized insights and plan your financial future.
               </CardDescription>
             </CardHeader>
             <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="advisor">AI Financial Advisor</TabsTrigger>
                    <TabsTrigger value="goals">Automated Goal Setting</TabsTrigger>
                  </TabsList>
                  <TabsContent value="advisor">
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>AI Financial Advisor</CardTitle>
                        <CardDescription>
                          Get personalized financial advice and insights by detailing your financial situation and goals below. Our AI will analyze your information and provide actionable recommendations.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <AdvisorForm />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="goals">
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Automated Goal Setting</CardTitle>
                        <CardDescription>
                          Define your financial goals and let our AI provide a roadmap to achieve them. Fill in your details to get personalized recommendations.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <GoalForm />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
             </CardContent>
           </Card>
         </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Expense Overview</CardTitle>
                <CardDescription>
                  A visual summary of your income vs. expenses.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Your latest financial activities.
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                  <Link href="#expenses">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentTransactionsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions?.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            {transaction.category}
                          </div>
                        </TableCell>
                        <TableCell className={cn("text-right", transaction.type === 'income' ? 'text-green-500' : 'text-red-500')}>
                          {transaction.type === 'expense' ? '-' : '+'}₹
                          {transaction.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Market Section */}
        <section id="market" className="space-y-4 scroll-m-20">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Market Analysis</CardTitle>
                    <CardDescription>
                        Real-time stock market trends and insightful analysis.
                    </CardDescription>
                  </div>
                   <Button variant="outline" size="sm" onClick={updateData} disabled={isMarketDataLoading}>
                    {isMarketDataLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="ml-2 hidden sm:inline">Refresh Data</span>
                  </Button>
                </CardHeader>
                {marketDataError && (
                  <CardContent>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error Fetching Market Data</AlertTitle>
                      <AlertDescription>{marketDataError}</AlertDescription>
                    </Alert>
                  </CardContent>
                )}
            </Card>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isMarketDataLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-12" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-28 mb-2" />
                        <Skeleton className="h-[120px] w-full" />
                      </CardContent>
                    </Card>
                  ))
                ) : marketData.map((stock) => (
                <Card key={stock.name}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{stock.name}</CardTitle>
                    <div className={cn("text-sm font-bold", stock.change >= 0 ? "text-green-500" : "text-red-500")}>
                        {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">₹{stock.price.toLocaleString('en-IN')}</div>
                    <div className="h-[120px]">
                    <ChartContainer config={marketChartConfig(stock.change)} className="w-full h-full">
                            <LineChart
                                data={stock.chartData}
                                margin={{
                                top: 5,
                                right: 10,
                                left: 10,
                                bottom: 0,
                                }}
                            >
                                <Tooltip
                                content={
                                    <ChartTooltipContent
                                    indicator="dot"
                                    hideLabel
                                    formatter={(value) => `₹${value}`}
                                    />
                                }
                                />
                                <Line
                                dataKey="value"
                                type="natural"
                                stroke="var(--color-value)"
                                strokeWidth={2}
                                dot={false}
                                />
                            </LineChart>
                        </ChartContainer>
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
            <Card>
                <CardHeader className="flex items-center justify-between flex-row">
                    <div className="space-y-1.5">
                        <CardTitle>Top Movers</CardTitle>
                        <CardDescription>Assets with the most significant price changes today.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowAllMovers(!showAllMovers)}>
                        <span>{showAllMovers ? "Show Less" : "Show More"}</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", showAllMovers && "rotate-180")} />
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {isMarketDataLoading ? (
                    <div className="space-y-px p-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Change</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {displayedMovers.map((stock) => (
                            <TableRow key={stock.name}>
                                <TableCell className="font-medium">{stock.name}</TableCell>
                                <TableCell>₹{stock.price.toLocaleString('en-IN')}</TableCell>
                                <TableCell className={cn("text-right font-semibold", stock.change >= 0 ? "text-green-500" : "text-red-500")}>
                                {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  )}
                </CardContent>
            </Card>
        </section>

        {/* AI Stock Trader Section */}
        <section id="ai-trader" className="space-y-4 scroll-m-20">
          <AIStockTrader marketData={marketData.map(s => ({ name: s.name, value: s.price, change: s.change }))} />
        </section>

        {/* Portfolio Section */}
        <section id="portfolio" className="space-y-4 scroll-m-20">
          <div className="flex items-center">
            <div className="grid gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
                <p className="text-muted-foreground">
                    Total Value: <span className="font-bold text-foreground">₹{portfolioValue.toLocaleString('en-IN')}</span>
                </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <AddInvestmentForm />
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              {investmentsLoading ? (
                <div className="space-y-2 p-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Quantity</TableHead>
                    <TableHead className="hidden md:table-cell">Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments?.map((investment) => (
                    <TableRow key={investment.id}>
                      <TableCell className="align-middle">
                        <div className="font-medium">{investment.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {investment.symbol}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <Badge variant="outline" className={cn(
                            investment.type === 'stock' && 'border-sky-500 text-sky-500',
                            investment.type === 'crypto' && 'border-amber-500 text-amber-500',
                            investment.type === 'bond' && 'border-lime-500 text-lime-500',
                        )}>
                          {investment.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden align-middle md:table-cell">{investment.quantity}</TableCell>
                      <TableCell className="hidden align-middle md:table-cell">₹{investment.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold align-middle">
                        ₹{investment.value.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        <RemoveInvestmentButton investmentId={investment.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Expenses Section */}
        <section id="expenses" className="space-y-4 scroll-m-20">
           <div className="flex items-center">
            <div className="grid gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                <p className="text-muted-foreground">
                    A detailed view of your income and spending.
                </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <AddIncomeForm />
              <AddExpenseForm />
              <ScanBillForm />
            </div>
          </div>
            <div className="grid gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>
                        A complete list of your recent financial activities.
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowAllTransactions(!showAllTransactions)}>
                        <span>{showAllTransactions ? "Show Less" : "Show More"}</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", showAllTransactions && "rotate-180")} />
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {transactionsLoading ? (
                     <div className="space-y-2 p-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                     </div>
                  ) : (
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[50px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedTransactions?.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell className="hidden sm:table-cell">{format(new Date(transaction.date), 'PPP')}</TableCell>
                            <TableCell className="font-medium">{transaction.description}</TableCell>
                            <TableCell>
                            <Badge variant="outline">{transaction.category}</Badge>
                            </TableCell>
                            <TableCell className={cn("text-right font-semibold", transaction.type === 'income' ? 'text-green-500' : '')}>
                            {transaction.type === 'expense' ? '-' : '+'}₹
                            {transaction.amount.toFixed(2)}
                            </TableCell>
                             <TableCell className="text-right">
                                <RemoveTransactionButton transactionId={transaction.id} />
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                  )}
                </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Expenses Tracker</CardTitle>
                        <CardDescription>A breakdown of your spending this month.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {transactionsLoading ? <Skeleton className="h-[300px] w-full" /> : (
                    <ChartContainer config={expenseChartConfig} className="mx-auto aspect-square max-h-[300px]">
                      <PieChart>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel formatter={(value, name) => <span>{name}: ₹{Number(value).toLocaleString('en-IN')}</span>} />}
                        />
                        <Pie
                          data={expenseByCategory}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          strokeWidth={5}
                        >
                        {expenseByCategory.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <ChartLegend
                            content={<ChartLegendContent nameKey="name" />}
                            className="-mt-4 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                        />
                      </PieChart>
                    </ChartContainer>
                    )}
                    </CardContent>
                </Card>
            </div>
        </section>

        {/* Budget Section */}
        <section id="budget" className="space-y-4 scroll-m-20">
           <div className="flex items-center">
             <div className="grid gap-2">
               <h2 className="text-3xl font-bold tracking-tight">Budget Tool</h2>
               <p className="text-muted-foreground">
                 Manage and track your spending against your budget limits.
               </p>
             </div>
           </div>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card className="lg:col-span-1">
               <CardHeader className="flex flex-row items-center justify-between pb-4">
                 <CardTitle>Optimize Your Budget</CardTitle>
                 <Button asChild size="sm" className="ml-auto gap-1">
                   <Link href="#advisor">
                     Ask AI Advisor
                     <ArrowUpRight className="h-4 w-4" />
                   </Link>
                 </Button>
               </CardHeader>
               <CardContent>
                 <p className="text-xs text-muted-foreground">
                   Get AI-driven recommendations for optimization.
                 </p>
               </CardContent>
             </Card>
             {budgetsLoading ? (
               <>
                 <Skeleton className="h-44 w-full" />
                 <Skeleton className="h-44 w-full" />
                 <Skeleton className="h-44 w-full" />
               </>
             ) : (
               budgets?.map((budget) => {
                 const progress = (budget.spent / budget.limit) * 100;
                 return (
                   <Card key={budget.id}>
                     <CardHeader className="pb-2">
                       <CardTitle className="text-lg">{budget.category}</CardTitle>
                       <CardDescription>
                         <span className="font-semibold">
                           ₹{budget.spent.toFixed(2)}
                         </span>{' '}
                         spent of ₹{budget.limit.toFixed(2)}
                       </CardDescription>
                     </CardHeader>
                     <CardContent>
                       <Progress
                         value={progress}
                         className="h-2 [&>div]:bg-primary"
                       />
                     </CardContent>
                     <CardFooter>
                       <p className="text-xs text-muted-foreground">
                         {progress.toFixed(0)}% of your budget used
                       </p>
                     </CardFooter>
                   </Card>
                 );
               })
             )}
           </div>
         </section>
      </main>
    </div>
  );
}
