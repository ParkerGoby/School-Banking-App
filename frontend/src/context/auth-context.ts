import { createContext } from 'react';

export type UserRole = 'student' | 'finance' | 'admin';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export interface Student extends User {
  role: 'student';
  balance: number;
  jobTitle: string;
  payRate: number;
  savingsGoal: number;
}

export interface Transaction {
  id: string;
  studentId: string;
  type: 'payroll' | 'deposit' | 'withdrawal' | 'interest' | 'purchase';
  amount: number;
  description: string;
  date: string;
  processedBy?: string;
  approved?: boolean;
}

export interface StoreItem {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (username: string, pin: string) => boolean;
  logout: () => void;
  students: Student[];
  transactions: Transaction[];
  storeItems: StoreItem[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  updateStudentBalance: (studentId: string, amount: number) => void;
  purchaseItem: (studentId: string, itemId: string) => boolean;
  getStudentTransactions: (studentId: string) => Transaction[];
  runPayroll: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
