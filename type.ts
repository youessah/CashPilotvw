export interface Budget {
    id: string;
    createdAt: Date;
    name: string;
    amount: number;
    emoji: string | null;
    transactions?: Transaction[];
    recurringTransactions?: RecurringTransaction[];
}

export interface Transaction {
    id: string;
    amount: number;
    emoji: string | null;
    description: string
    createdAt: Date;
    budgetName?: string;
    budgetId?: string | null;
}

export interface RecurringTransaction {
    id: string;
    amount: number;
    description: string;
    frequency: string; // 'DAILY', 'WEEKLY', 'MONTHLY'
    startDate: Date;
    lastExecuted: Date | null;
    budgetId: string;
}

export interface SavingsGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: Date | null;
    userEmail: string;
    createdAt: Date;
}
