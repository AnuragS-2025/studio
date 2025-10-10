
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
  { name: 'Apple Inc.', symbol: 'AAPL', quantity: 10, price: 175.0, value: 1750.0, type: 'stock' },
  { name: 'Bitcoin', symbol: 'BTC', quantity: 0.5, price: 68000.0, value: 34000.0, type: 'crypto' },
  { name: 'US Treasury Bond', symbol: 'US10Y', quantity: 5, price: 105.0, value: 525.0, type: 'bond' },
  { name: 'Tesla, Inc.', symbol: 'TSLA', quantity: 15, price: 180.0, value: 2700.0, type: 'stock' },
  { name: 'Ethereum', symbol: 'ETH', quantity: 10, price: 3500.0, value: 35000.0, type: 'crypto' },
];

export const MOCK_BUDGETS: Omit<Budget, 'id'>[] = [
  { category: 'Food', limit: 500, spent: 320.50 },
  { category: 'Transport', limit: 200, spent: 110.75 },
  { category: 'Social', limit: 250, spent: 180.00 },
  { category: 'Utilities', limit: 150, spent: 125.40 },
  { category: 'Shopping', limit: 300, spent: 280.99 },
];

const today = new Date();
export const MOCK_TRANSACTIONS: Omit<Transaction, 'id'>[] = [
    {
        date: format(subDays(today, 1), 'yyyy-MM-dd'),
        description: 'Monthly Salary',
        amount: 5000,
        type: 'income',
        category: 'Salary'
    },
    {
        date: format(subDays(today, 2), 'yyyy-MM-dd'),
        description: 'Grocery Shopping',
        amount: 75.5,
        type: 'expense',
        category: 'Food'
    },
    {
        date: format(subDays(today, 3), 'yyyy-MM-dd'),
        description: 'Train ticket',
        amount: 25,
        type: 'expense',
        category: 'Transport'
    },
    {
        date: format(subDays(today, 5), 'yyyy-MM-dd'),
        description: 'Dinner with friends',
        amount: 120,
        type: 'expense',
        category: 'Social'
    },
    {
        date: format(subDays(today, 7), 'yyyy-MM-dd'),
        description: 'Electricity Bill',
        amount: 95,
        type: 'expense',
        category: 'Utilities'
    },
    {
        date: format(subDays(today, 10), 'yyyy-MM-dd'),
        description: 'New Jacket',
        amount: 150,
        type: 'expense',
        category: 'Shopping'
    },
    {
        date: format(subDays(today, 12), 'yyyy-MM-dd'),
        description: 'Stock Investment',
        amount: 500,
        type: 'expense',
        category: 'Investment'
    },
    {
        date: format(subDays(today, 14), 'yyyy-MM-dd'),
        description: 'Freelance Project Payment',
        amount: 750,
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
        user ? collection(firestore, 'users', user.uid, 'investments') : null
    , [firestore, user]);
    const { data, isLoading, error } = useCollection<Investment>(investmentsQuery);
    return { investments: data, isLoading, error };
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
      { month: 'Apr', value: 63000 }, { month: 'May', avalue: 67000 }, { month: 'Jun', value: 68000 },
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
