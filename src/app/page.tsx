
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
} from "lucide-react";
import Link from "next/link";
import { Overview } from "@/components/overview";
import { getPortfolioValue, getRecentTransactions, getTotalExpenses, getTotalIncome, getUser, getInvestments, getMarketData, getTransactions, getExpenseByCategoryData, getBudgets } from "@/lib/data";
import { AdvisorForm } from "@/app/advisor/advisor-form";
import { GoalForm } from "@/app/goals/goal-form";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Area, AreaChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const portfolioValue = getPortfolioValue();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const user = getUser();
  const recentTransactions = getRecentTransactions(5);
  const investments = getInvestments();
  const marketData = getMarketData();
  const transactions = getTransactions();
  const expenseByCategory = getExpenseByCategoryData();
  const budgets = getBudgets();

  const chartConfig = {
      value: { label: "Value" },
      ...expenseByCategory.reduce((acc, cur) => ({
          ...acc,
          [cur.name.toLowerCase()]: { label: cur.name, color: cur.color }
      }), {})
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4">
        {/* Dashboard Section */}
        <section id="dashboard" className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Portfolio Value
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${portfolioValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
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
                <div className="text-2xl font-bold">
                  ${totalIncome.toLocaleString()}
                </div>
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
                <div className="text-2xl font-bold">
                  ${totalExpenses.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Welcome Back</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.name}</div>
                <p className="text-xs text-muted-foreground">
                  Here's your financial snapshot
                </p>
              </CardContent>
            </Card>
          </div>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            {transaction.category}
                          </div>
                        </TableCell>
                        <TableCell className={`text-right ${transaction.type === 'income' ? 'text-accent' : ''}`}>
                          {transaction.type === 'expense' ? '-' : '+'}$
                          {transaction.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Portfolio Section */}
        <section id="portfolio" className="space-y-4">
          <div className="flex items-center">
            <div className="grid gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
                <p className="text-muted-foreground">
                    Total Value: <span className="font-bold text-foreground">${portfolioValue.toLocaleString()}</span>
                </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Add Investment
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Investment</DialogTitle>
                    <DialogDescription>
                      Add a new stock, bond, or cryptocurrency to your portfolio.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input id="name" defaultValue="Apple Inc." className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">
                        Quantity
                      </Label>
                      <Input id="quantity" type="number" defaultValue="10" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Price
                      </Label>
                      <Input id="price" type="number" defaultValue="175" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Investment</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Quantity</TableHead>
                    <TableHead className="hidden md:table-cell">Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.map((investment) => (
                    <TableRow key={investment.id}>
                      <TableCell>
                        <div className="font-medium">{investment.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {investment.symbol}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                            investment.type === 'stock' && 'border-sky-500 text-sky-500',
                            investment.type === 'crypto' && 'border-amber-500 text-amber-500',
                            investment.type === 'bond' && 'border-lime-500 text-lime-500',
                        )}>
                          {investment.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{investment.quantity}</TableCell>
                      <TableCell className="hidden md:table-cell">${investment.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${investment.value.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Market Section */}
        <section id="market" className="space-y-4">
            <Card>
                <CardHeader>
                <CardTitle>Market Analysis</CardTitle>
                <CardDescription>
                    Real-time stock market trends and insightful analysis.
                </CardDescription>
                </CardHeader>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
                {marketData.map((stock) => (
                <Card key={stock.name}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{stock.name}</CardTitle>
                    <div className={cn("text-sm font-bold", stock.change > 0 ? "text-accent" : "text-destructive")}>
                        {stock.change > 0 ? "+" : ""}{stock.change.toFixed(2)}%
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">${stock.value.toLocaleString()}</div>
                    <div className="h-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
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
                                formatter={(value) => `$${value}`}
                                />
                            }
                            />
                            <Area
                            dataKey="value"
                            type="natural"
                            fill={stock.change > 0 ? "hsl(var(--accent))" : "hsl(var(--destructive))"}
                            fillOpacity={0.1}
                            stroke={stock.change > 0 ? "hsl(var(--accent))" : "hsl(var(--destructive))"}
                            stackId="a"
                            />
                        </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
            <Card>
                <CardHeader>
                <CardTitle>Top Movers</CardTitle>
                <CardDescription>Assets with the most significant price changes today.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {marketData
                        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
                        .map((stock) => (
                        <TableRow key={stock.name}>
                            <TableCell className="font-medium">{stock.name}</TableCell>
                            <TableCell>${stock.value.toLocaleString()}</TableCell>
                            <TableCell className={cn("text-right font-semibold", stock.change > 0 ? "text-accent" : "text-destructive")}>
                            {stock.change > 0 ? "+" : ""}{stock.change.toFixed(2)}%
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </section>

        {/* Expenses Section */}
        <section id="expenses" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                    A complete list of your recent financial activities.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell className="hidden sm:table-cell">{transaction.date}</TableCell>
                            <TableCell className="font-medium">{transaction.description}</TableCell>
                            <TableCell>
                            <Badge variant="outline">{transaction.category}</Badge>
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${transaction.type === 'income' ? 'text-accent' : ''}`}>
                            {transaction.type === 'expense' ? '-' : '+'}$
                            {transaction.amount.toFixed(2)}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Expenses by Category</CardTitle>
                        <CardDescription>A breakdown of your spending this month.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                      <PieChart>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                          data={expenseByCategory}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          strokeWidth={5}
                        >
                        {expenseByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <ChartLegend
                            content={<ChartLegendContent nameKey="name" />}
                            className="-mt-4 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                        />
                      </PieChart>
                    </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </section>

        {/* Budget Section */}
        <section id="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budgeting Tool</CardTitle>
                <CardDescription>
                  Manage your budgets and get AI-driven recommendations for optimization.
                </CardDescription>
              </CardHeader>
            </Card>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget) => {
                const progress = (budget.spent / budget.limit) * 100;
                return (
                  <Card key={budget.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{budget.category}</CardTitle>
                      <CardDescription>
                        <span className="font-semibold">${budget.spent.toFixed(2)}</span> spent of ${budget.limit.toFixed(2)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Progress value={progress} className="h-2 [&>div]:bg-primary" />
                    </CardContent>
                    <CardFooter>
                      <p className="text-xs text-muted-foreground">{progress.toFixed(0)}% of your budget used</p>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            <Card className="border-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-accent" />
                  Optimize Your Budget
                </CardTitle>
                <CardDescription>
                  Use our AI Advisor to get personalized tips on how to improve your budget and save more.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Ready to take control of your spending? Describe your current budgeting challenges and goals to our AI Advisor for tailored strategies.</p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="#advisor">Ask AI Advisor</Link>
                </Button>
              </CardFooter>
            </Card>
        </section>

        {/* Goals Section */}
        <section id="goals" className="space-y-4">
            <Card>
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
        </section>

        {/* AI Advisor Section */}
        <section id="advisor" className="space-y-4">
            <Card>
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
        </section>

      </main>
    </div>
  );
}
