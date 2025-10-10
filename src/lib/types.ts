export type User = {
  name: string;
  email: string;
};

export type Investment = {
  id: string;
  name: string;
  symbol: string;
  quantity: number;
  price: number;
  value: number;
  type: 'stock' | 'bond' | 'crypto';
  createdAt?: any;
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
};

export type Budget = {
  id: string;
  category: string;
  limit: number;
  spent: number;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
};

    