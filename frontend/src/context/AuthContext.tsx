import { useState, ReactNode } from 'react';
import { AuthContext } from './auth-context';
import type { User, Student, Transaction, StoreItem } from './auth-context';
import { api } from '@/lib/api';

export type { UserRole, User, Student, Transaction, StoreItem } from './auth-context';

// Mock data
const initialStudents: Student[] = [
  {
    id: 's1',
    username: 'emma.w',
    role: 'student',
    name: 'Emma Wilson',
    balance: 245.50,
    jobTitle: 'Library Assistant',
    payRate: 15,
    savingsGoal: 500,
  },
  {
    id: 's2',
    username: 'noah.j',
    role: 'student',
    name: 'Noah Johnson',
    balance: 180.75,
    jobTitle: 'Classroom Helper',
    payRate: 12,
    savingsGoal: 300,
  },
  {
    id: 's3',
    username: 'sophia.m',
    role: 'student',
    name: 'Sophia Martinez',
    balance: 310.25,
    jobTitle: 'Tech Support',
    payRate: 18,
    savingsGoal: 600,
  },
];

const initialTransactions: Transaction[] = [
  {
    id: 't1',
    studentId: 's1',
    type: 'payroll',
    amount: 60,
    description: 'Weekly Paycheck',
    date: '2026-04-18',
    approved: true,
  },
  {
    id: 't2',
    studentId: 's1',
    type: 'withdrawal',
    amount: -25,
    description: 'Requested withdrawal',
    date: '2026-04-20',
    processedBy: 'Finance Team',
    approved: true,
  },
  {
    id: 't3',
    studentId: 's1',
    type: 'interest',
    amount: 2.50,
    description: 'Monthly Interest (1%)',
    date: '2026-04-01',
    approved: true,
  },
  {
    id: 't4',
    studentId: 's2',
    type: 'payroll',
    amount: 48,
    description: 'Weekly Paycheck',
    date: '2026-04-18',
    approved: true,
  },
  {
    id: 't5',
    studentId: 's2',
    type: 'purchase',
    amount: -15,
    description: 'School Store: Pencil Set',
    date: '2026-04-21',
    approved: true,
  },
];

const storeItemsData: StoreItem[] = [
  { id: 'i1', name: 'Pencil Set (12 pack)', price: 15, category: 'Supplies', inStock: true },
  { id: 'i2', name: 'Notebook', price: 10, category: 'Supplies', inStock: true },
  { id: 'i3', name: 'Eraser Pack', price: 5, category: 'Supplies', inStock: true },
  { id: 'i4', name: 'Homework Pass', price: 50, category: 'Rewards', inStock: true },
  { id: 'i5', name: 'Extra Recess (15 min)', price: 75, category: 'Rewards', inStock: true },
  { id: 'i6', name: 'Free Dress Day Pass', price: 40, category: 'Rewards', inStock: true },
  { id: 'i7', name: 'Snack Voucher', price: 20, category: 'Food', inStock: true },
  { id: 'i8', name: 'Pizza Party Ticket', price: 100, category: 'Food', inStock: true },
];


export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [storeItems] = useState<StoreItem[]>(storeItemsData);

  const login = async (username: string, password: string): Promise<void> => {
    await api.login(username, password);
    const apiUser = await api.me();
    if (apiUser.role === 'student') {
      setCurrentUser({
        id: apiUser.id,
        username: apiUser.username,
        role: 'student',
        name: apiUser.username,
        balance: 0,
        jobTitle: '',
        payRate: 0,
        savingsGoal: 0,
      } as Student);
    } else {
      setCurrentUser({
        id: apiUser.id,
        username: apiUser.username,
        role: apiUser.role,
        name: apiUser.username,
      });
    }
  };

  const logout = async () => {
    await api.logout().catch(() => {});
    setCurrentUser(null);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `t${transactions.length + 1}`,
      date: new Date().toISOString().split('T')[0],
    };
    setTransactions([newTransaction, ...transactions]);

    // Update student balance
    setStudents(students.map(s =>
      s.id === transaction.studentId
        ? { ...s, balance: s.balance + transaction.amount }
        : s
    ));
  };

  const updateStudentBalance = (studentId: string, amount: number) => {
    setStudents(students.map(s =>
      s.id === studentId
        ? { ...s, balance: s.balance + amount }
        : s
    ));
  };

  const purchaseItem = (studentId: string, itemId: string): boolean => {
    const item = storeItems.find(i => i.id === itemId);
    const student = students.find(s => s.id === studentId);

    if (!item || !student || student.balance < item.price || !item.inStock) {
      return false;
    }

    addTransaction({
      studentId,
      type: 'purchase',
      amount: -item.price,
      description: `School Store: ${item.name}`,
      approved: true,
    });

    return true;
  };

  const getStudentTransactions = (studentId: string) => {
    return transactions.filter(t => t.studentId === studentId);
  };

  const runPayroll = () => {
    students.forEach(student => {
      addTransaction({
        studentId: student.id,
        type: 'payroll',
        amount: student.payRate * 4, // 4 hours per week
        description: 'Weekly Paycheck',
        approved: true,
      });
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        students,
        transactions,
        storeItems,
        addTransaction,
        updateStudentBalance,
        purchaseItem,
        getStudentTransactions,
        runPayroll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
