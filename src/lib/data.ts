import { Transaction, Investment, Budget, User } from './types';

const user: User = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
};

const investments: Investment[] = [
  { id: '1', name: 'Apple Inc.', symbol: 'AAPL', quantity: 10, price: 175.0, value: 1750.0, type: 'stock' },
  { id: '2', name: 'Bitcoin', symbol: 'BTC', quantity: 0.5, price: 68000.0, value: 34000.0, type: 'crypto' },
  { id: '3', name: 'US Treasury Bond', symbol: 'US10Y', quantity: 5, price: 105.0, value: 525.0, type: 'bond' },
  { id: '4', name: 'Tesla, Inc.', symbol: 'TSLA', quantity: 15, price: 180.0, value: 2700.0, type: 'stock' },
  { id: '5', name: 'Ethereum', symbol: 'ETH', quantity: 10, price: 3500.0, value: 35000.0, type: 'crypto' },
];

const transactions: Transaction[] = [
  { id: '1', date: '2024-07-15', description: 'Monthly Salary', amount: 5000, type: 'income', category: 'Salary' },
  { id: '2', date: '2024-07-14', description: 'Grocery Shopping', amount: 150.75, type: 'expense', category: 'Food' },
  { id: '3', date: '2024-07-13', description: 'Stock Purchase - AAPL', amount: 875, type: 'expense', category: 'Investment' },
  { id: '4', date: '2024-07-12', description: 'Dinner with friends', amount: 85.50, type: 'expense', category: 'Social' },
  { id: '5', date: '2024-07-10', description: 'Rent', amount: 1200, type: 'expense', category: 'Housing' },
  { id: '6', date: '2024-07-08', description: 'Internet Bill', amount: 60, type: 'expense', category: 'Utilities' },
  { id: '7', date: '2024-07-05', description: 'Freelance Project', amount: 750, type: 'income', category: 'Freelance' },
  { id: '8', date: '2024-06-30', description: 'Gasoline', amount: 50.25, type: 'expense', category: 'Transport' },
];

const budgets: Budget[] = [
  { id: '1', category: 'Food', limit: 500, spent: 320.50 },
  { id: '2', category: 'Transport', limit: 200, spent: 110.75 },
  { id: '3', category: 'Social', limit: 250, spent: 180.00 },
  { id: '4', category: 'Utilities', limit: 150, spent: 125.40 },
  { id: '5', category: 'Shopping', limit: 300, spent: 280.99 },
];

// Data access functions
export const getUser = (): User => user;
export const getInvestments = (): Investment[] => investments;
export const getTransactions = (): Transaction[] => transactions;
export const getBudgets = (): Budget[] => budgets;

export const getPortfolioValue = (): number => {
  return investments.reduce((sum, investment) => sum + investment.value, 0);
};

export const getTotalIncome = (): number => {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getTotalExpenses = (): number => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getRecentTransactions = (count: number): Transaction[] => {
  return transactions.slice(0, count);
};

export const getMarketData = () => {
  return [
    { name: 'AAPL', value: 175, change: 1.2, chartData: [
      { month: 'Jan', value: 160 }, { month: 'Feb', value: 165 }, { month: 'Mar', value: 170 },
      { month: 'Apr', value: 168 }, { month: 'May', value: 172 }, { month: 'Jun', value: 175 },
    ]},
    { name: 'TSLA', value: 180, change: -0.5, chartData: [
      { month: 'Jan', value: 190 }, { month: 'Feb', value: 185 }, { month: 'Mar', value: 182 },
      { month: 'Apr', value: 188 }, { month: 'May', value: 184 }, { month: 'Jun', value: 180 },
    ]},
    { name: 'BTC', value: 68000, change: 5.5, chartData: [
      { month: 'Jan', value: 60000 }, { month: 'Feb', value: 62000 }, { month: 'Mar', value: 65000 },
      { month: 'Apr', value: 63000 }, { month: 'May', value: 67000 }, { month: 'Jun', value: 68000 },
    ]},
    { name: 'ETH', value: 3500, change: 3.1, chartData: [
        { month: 'Jan', value: 3000 }, { month: 'Feb', value: 3100 }, { month: 'Mar', value: 3200 },
        { month: 'Apr', value: 3150 }, { month: 'May', value: 3400 }, { month: 'Jun', value: 3500 },
      ]},
  ];
};

export const getExpenseChartData = () => {
    return [
      { name: "Jan", income: 4000, expenses: 2400 },
      { name: "Feb", income: 3000, expenses: 1398 },
      { name: "Mar", income: 5000, expenses: 3800 },
      { name: "Apr", income: 2780, expenses: 3908 },
      { name: "May", income: 1890, expenses: 4800 },
      { name: "Jun", income: 2390, expenses: 3800 },
      { name: "Jul", income: 3490, expenses: 4300 },
    ]
}

export const getExpenseByCategoryData = () => {
    const expenseByCategory: { [key: string]: number } = {};
    const COLORS = [
        "hsl(221.2 83.2% 53.3%)", // Primary
        "hsl(145 58% 54%)",      // A nice green
        "hsl(35, 91%, 60%)",     // A warm orange
        "hsl(26, 83%, 62%)",     // A softer orange
        "hsl(262.1 83.3% 57.8%)" // A deep purple
    ];
    const categories = [...new Set(transactions.filter(t => t.type === 'expense').map(t => t.category))];

    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
        });

    return Object.entries(expenseByCategory).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }));
}

    