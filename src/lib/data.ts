
'use client';

import { useMemo } from 'react';
import { collection, query, limit, orderBy, addDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Transaction, Investment, Budget, User } from './types';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { subDays, format } from 'date-fns';

// Mock data is kept for fallback or initial structure, but will be replaced by Firestore data.

const MOCK_USER: User = {
  name: 'Anurag Sharan',
  email: 'as9771@srmist.edu.in',
};

export const MOCK_INVESTMENTS: Omit<Investment, 'id'>[] = [
  { name: 'Reliance Industries', symbol: 'RELIANCE', quantity: 10, price: 2950.0, value: 29500.0, type: 'stock', createdAt: new Date() },
  { name: 'Tata Consultancy', symbol: 'TCS', quantity: 15, price: 3850.0, value: 57750.0, type: 'stock', createdAt: new Date() },
  { name: 'HDFC Bank', symbol: 'HDFCBANK', quantity: 25, price: 1680.0, value: 42000.0, type: 'stock', createdAt: new Date() },
  { name: 'Infosys', symbol: 'INFY', quantity: 30, price: 1550.0, value: 46500.0, type: 'stock', createdAt: new Date() },
  { name: 'Bitcoin', symbol: 'BTC', quantity: 0.05, price: 5800000.0, value: 290000.0, type: 'crypto', createdAt: new Date() },
  { name: 'Ethereum', symbol: 'ETH', quantity: 1, price: 310000.0, value: 310000.0, type: 'crypto', createdAt: new Date() },
  { name: 'India Gov. Bond 2033', symbol: 'IN071833G', quantity: 5, price: 102.5, value: 512.5, type: 'bond', createdAt: new Date() },
];

export const MOCK_BUDGETS: Omit<Budget, 'id'>[] = [
  { category: 'Food', limit: 8000, spent: 4500.50 },
  { category: 'Transport', limit: 3000, spent: 1500.75 },
  { category: 'Social', limit: 5000, spent: 3200.00 },
  { category: 'Utilities', limit: 4000, spent: 3800.40 },
  { category: 'Shopping', limit: 6000, spent: 5500.99 },
];

const today = new Date();
export const MOCK_TRANSACTIONS: Omit<Transaction, 'id'>[] = [
    {
        date: format(subDays(today, 1), 'yyyy-MM-dd'),
        description: 'Monthly Salary',
        amount: 80000,
        type: 'income',
        category: 'Salary'
    },
    {
        date: format(subDays(today, 2), 'yyyy-MM-dd'),
        description: 'Zomato Order',
        amount: 450.5,
        type: 'expense',
        category: 'Food'
    },
    {
        date: format(subDays(today, 3), 'yyyy-MM-dd'),
        description: 'Uber ride to office',
        amount: 280,
        type: 'expense',
        category: 'Transport'
    },
    {
        date: format(subDays(today, 5), 'yyyy-MM-dd'),
        description: 'Movie tickets and snacks',
        amount: 1200,
        type: 'expense',
        category: 'Social'
    },
    {
        date: format(subDays(today, 7), 'yyyy-MM-dd'),
        description: 'Electricity Bill',
        amount: 2100,
        type: 'expense',
        category: 'Utilities'
    },
    {
        date: format(subDays(today, 10), 'yyyy-MM-dd'),
        description: 'Myntra Shopping',
        amount: 3500,
        type: 'expense',
        category: 'Shopping'
    },
    {
        date: format(subDays(today, 12), 'yyyy-MM-dd'),
        description: 'Mutual Fund SIP',
        amount: 5000,
        type: 'expense',
        category: 'Investment'
    },
    {
        date: format(subDays(today, 14), 'yyyy-MM-dd'),
        description: 'Freelance Project Payment',
        amount: 15000,
        type: 'income',
        category: 'Freelance'
    }
];


// --- Data Hooks ---

export const useUserData = () => {
  const { user } = useUser();
  return useMemo(() => {
    if (user) {
        let displayName = user.displayName || 'Anonymous';
        if (user.email === 'as9771@srmist.edu.in' && !user.displayName) {
            displayName = 'Anurag Sharan';
        }
        return { user: { name: displayName, email: user.email || '' } };
    }
    return { user: MOCK_USER };
  }, [user]);
};

export const useTransactions = () => {
  const firestore = useFirestore();
  const { user } = useUser();
  const transactionsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'users', user.uid, 'transactions'), orderBy('date', 'desc')) : null
  , [firestore, user]);
  const { data, isLoading, error } = useCollection<Transaction>(transactionsQuery);

  const transactions = useMemo(() => {
    if (!data) return null;
    const uniqueTransactions = new Map<string, Transaction & {id: string}>();
    data.forEach(transaction => {
      // Create a unique key for each transaction based on its properties
      const key = `${transaction.date}-${transaction.description}-${transaction.amount}-${transaction.type}-${transaction.category}`;
      if (!uniqueTransactions.has(key)) {
        uniqueTransactions.set(key, transaction);
      }
    });
    return Array.from(uniqueTransactions.values());
  }, [data]);

  return { transactions, isLoading, error };
};

export const useRecentTransactions = (count: number) => {
    const { transactions, isLoading, error } = useTransactions();
    const recentTransactions = useMemo(() => {
        if (!transactions) return null;
        return transactions.slice(0, count);
    }, [transactions, count]);

    return { recentTransactions, isLoading, error };
}


export const useInvestments = () => {
    const firestore = useFirestore();
    const { user } = useUser();
    const investmentsQuery = useMemoFirebase(() =>
        user ? query(collection(firestore, 'users', user.uid, 'investments'), orderBy('createdAt', 'desc')) : null
    , [firestore, user]);
    const { data, isLoading, error } = useCollection<Investment>(investmentsQuery);

    const investments = useMemo(() => {
      if (!data) return null;
      const uniqueInvestments = new Map<string, Investment & {id: string}>();
      data.forEach(investment => {
        if (!uniqueInvestments.has(investment.id)) {
            uniqueInvestments.set(investment.id, investment);
        }
      });
      return Array.from(uniqueInvestments.values());
    }, [data]);

    return { investments, isLoading, error };
};

export const useBudgets = () => {
    const firestore = useFirestore();
    const { user } = useUser();
    const budgetsQuery = useMemoFirebase(() =>
        user ? collection(firestore, 'users', user.uid, 'budgets') : null
    , [firestore, user]);
    const { data, isLoading, error } = useCollection<Budget>(budgetsQuery);

    const budgets = useMemo(() => {
      if (!data) return null;
      const uniqueBudgets = new Map<string, Budget & {id: string}>();
      data.forEach(budget => {
        if (!uniqueBudgets.has(budget.category)) {
          uniqueBudgets.set(budget.category, budget);
        }
      });
      return Array.from(uniqueBudgets.values());
    }, [data]);

    return { budgets, isLoading, error };
};


// --- Data Calculation Hooks ---

export const usePortfolioValue = (investments: Investment[] | null) => {
    return useMemo(() => {
        if (!investments) return 0;
        return investments.reduce((sum, investment) => sum + investment.value, 0);
    }, [investments]);
};

export const useTotalIncome = (transactions: Transaction[] | null) => {
    return useMemo(() => {
        if (!transactions) return 0;
        return transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);
};

export const useTotalExpenses = (transactions: Transaction[] | null) => {
    return useMemo(() => {
        if (!transactions) return 0;
        return transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);
};

export const useExpenseByCategoryData = (transactions: Transaction[] | null) => {
    return useMemo(() => {
        if (!transactions) return [];
        const expenseByCategory: { [key: string]: number } = {};
        const COLORS = [
            "hsl(221.2 83.2% 53.3%)", // Primary
            "hsl(145 58% 54%)",      // A nice green
            "hsl(35, 91%, 60%)",     // A warm orange
            "hsl(26, 83%, 62%)",     // A softer orange
            "hsl(262.1 83.3% 57.8%)" // A deep purple
        ];
        
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
    }, [transactions]);
}


// --- Firestore Write Operations ---
// This function is now designed to be called from the server-side action.
// NOTE: For a real app, you would initialize a server-side Firebase Admin instance here.
// We are simplifying by passing the userId and assuming the client-side call will handle it.
// THIS IS A TEMPORARY state for the purpose of fixing the immediate bug.
export const addTransaction = async (userId: string, transaction: Omit<Transaction, 'id'>) => {
    // This is a placeholder for where server-side logic would go.
    // In a real app, we would not use the client-side 'useFirestore' here.
    // However, to make this work without full admin setup, we'll keep the client-side addDocumentNonBlocking
    // but it needs to be called from the client.
    console.log("addTransaction called on server, but it should be a client call for now.", {userId, transaction});

    // The correct pattern would be to use the Admin SDK here:
    // const adminDb = getFirestore();
    // await adminDb.collection('users').doc(userId).collection('transactions').add(transaction);
};



// --- Mock Data for Components that are not yet migrated ---
const generateChartData = (base: number, points = 6) => {
  const data = [];
  let currentValue = base;
  for (let i = 0; i < points; i++) {
    currentValue += (Math.random() - 0.5) * (base * 0.1); // Fluctuate by up to 10%
    data.push({ value: Math.round(currentValue) });
  }
  return data;
};

export const getMarketData = () => {
  return [
    { name: 'Reliance Industries', value: 2950, change: 1.2, chartData: generateChartData(2950) },
    { name: 'Tata Consultancy', value: 3850, change: -0.5, chartData: generateChartData(3850) },
    { name: 'HDFC Bank', value: 981, change: 2.1, chartData: generateChartData(981) },
    { name: 'Infosys', value: 1511, change: -1.8, chartData: generateChartData(1511) },
    { name: 'ICICI Bank', value: 1100, change: 0.8, chartData: generateChartData(1100) },
    { name: 'Bharti Airtel', value: 1200, change: -1.1, chartData: generateChartData(1200) },
    { name: 'State Bank of India', value: 881, change: 2.5, chartData: generateChartData(881) },
    { name: 'Larsen & Toubro', value: 3600, change: 0.3, chartData: generateChartData(3600) },
    { name: 'Hindustan Unilever', value: 2500, change: -0.2, chartData: generateChartData(2500) },
    { name: 'ITC', value: 402, change: 1.5, chartData: generateChartData(402) },
  ];
};

export const getExpenseChartData = () => {
    return [
      { name: "Jan", income: 80000, expenses: 24000 },
      { name: "Feb", income: 82000, expenses: 31398 },
      { name: "Mar", income: 75000, expenses: 28800 },
      { name: "Apr", income: 85000, expenses: 35908 },
      { name: "May", income: 90000, expenses: 21800 },
      { name: "Jun", income: 88000, expenses: 36800 },
      { name: "Jul", income: 92000, expenses: 39300 },
    ]
}

    

    

    


