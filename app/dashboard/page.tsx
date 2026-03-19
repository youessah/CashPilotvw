"use client"

import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react'
import { getLastBudgets, getLastTransactions, getReachedBudgets, getSavingsGoals, getTotalTransactionAmount, getTotalTransactionCount, getUserBudgetData, syncRecurringTransactions, getBudgetInsights, getSmartCategorization, addTransactionToBudget } from '../actions';
import Wrapper from '../components/Wrapper';
import { CircleDollarSign, Landmark, PiggyBank, FileDown, Zap, CalendarDays } from 'lucide-react';
import Notification from '../components/Notification';
import { generatePDF } from '@/lib/pdfGenerator';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Budget, Transaction, SavingsGoal } from '@/type';
import BudgetItem from '../components/BudgetItem';
import Link from 'next/link';
import TransactionItem from '../components/TransactionItem';
import BudgetAdvisor from '../components/BudgetAdvisor';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const Page = () => {
    const { user } = useUser();
    const [totalAmount, setTotalAmount] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true);
    const [totalCount, setTotalCount] = useState<number | null>(null)
    const [reachedBudgetsRatio, setReachedBudgetsRatio] = useState<string | null>(null);
    interface BudgetData {
        budgetName: string;
        totalBudgetAmount: number;
        totalTransactionsAmount: number;
    }
    const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

    // Insights & Quick Add state
    const [insights, setInsights] = useState<{ dailyAllowance: number; warnings: string[] } | null>(null);
    const [quickAddDesc, setQuickAddDesc] = useState('');
    const [quickAddAmount, setQuickAddAmount] = useState('');
    const [isQuickAdding, setIsQuickAdding] = useState(false);
    const [notification, setNotification] = useState<string>("");


    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const email = user?.primaryEmailAddress?.emailAddress as string
            if (email) {
                // Execute all promises in parallel for better performance
                const [
                    ,
                    amount,
                    count,
                    reachedBudgets,
                    budgetsData,
                    lastTransactions,
                    lastBudgets,
                    goalsData,
                    insightsData
                ] = await Promise.all([
                    syncRecurringTransactions(email), // Runs in parallel
                    getTotalTransactionAmount(email),
                    getTotalTransactionCount(email),
                    getReachedBudgets(email),
                    getUserBudgetData(email),
                    getLastTransactions(email),
                    getLastBudgets(email),
                    getSavingsGoals(email),
                    getBudgetInsights(email)
                ]);

                setTotalAmount(amount)
                setTotalCount(count)
                setReachedBudgetsRatio(reachedBudgets)
                setBudgetData(budgetsData)
                setTransactions(lastTransactions)
                setBudgets(lastBudgets)
                setSavingsGoals(goalsData)
                setInsights(insightsData)
                setIsLoading(false)

            }
        } catch (error) {
            console.error("Erreur lors de la récupération des données:", error);
            setIsLoading(false)
        }
    }, [user?.primaryEmailAddress?.emailAddress]);

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickAddDesc || !quickAddAmount) return;

        setIsQuickAdding(true);
        try {
            const email = user?.primaryEmailAddress?.emailAddress as string;
            const amountNum = parseFloat(quickAddAmount);

            // 1. Smart categorize
            const suggestedBudget = await getSmartCategorization(email, quickAddDesc);

            if (!suggestedBudget) {
                setNotification("Erreur: Vous n'avez pas de budget existant pour classer cette dépense.");
                setIsQuickAdding(false);
                return;
            }

            // 2. Add transaction
            await addTransactionToBudget(suggestedBudget.id, amountNum, quickAddDesc);

            setNotification(`Transaction ajoutée au budget "${suggestedBudget.name}" (${suggestedBudget.emoji})`);
            setQuickAddDesc('');
            setQuickAddAmount('');
            fetchData(); // Refresh dashboard
        } catch (error) {
            console.error("Erreur Ajout Rapide", error);
            setNotification("Impossible d'ajouter la transaction pour le moment. Vérifiez si vous dépassez le montant.");
        } finally {
            setIsQuickAdding(false);
        }
    }

    return (
        <Wrapper>
            {notification && <Notification message={notification} onclose={() => setNotification("")} />}
            {isLoading ? (
                <div className='flex justify-center items-center'>
                    <span className="loading loading-spinner loading-md"></span>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
                        <button onClick={() => generatePDF(transactions, totalAmount || 0, totalCount || 0)} className="btn btn-accent btn-sm md:btn-md text-white">
                            <FileDown className="w-4 h-4 mr-2" /> Télécharger le rapport
                        </button>
                    </div>

                    {insights?.warnings && insights.warnings.length > 0 && (
                        <div className="alert alert-warning shadow-sm mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span>Attention: Vos budgets <b>{insights.warnings.join(', ')}</b> ont dépassé 90% de leur limite !</span>
                        </div>
                    )}

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                        <div className='border-2 border-base-300 p-5 flex justify-between items-center rounded-xl '>
                            <div className='flex flex-col'>
                                <span className='text-gray-500 text-sm'>
                                    Total des transactions
                                </span>
                                <span className='text-2xl font-bold text-accent'>
                                    {totalAmount !== null ? `${totalAmount} FCFA` : 'N/A'}
                                </span>
                            </div>
                            <CircleDollarSign className='bg-accent w-9 h-9 rounded-full p-1 text-white' />
                        </div>

                        <div className='border-2 border-base-300 p-5 flex justify-between items-center rounded-xl '>
                            <div className='flex flex-col'>
                                <span className='text-gray-500 text-sm'>
                                    Nombre de transactions
                                </span>
                                <span className='text-2xl font-bold text-accent'>
                                    {totalCount !== null ? `${totalCount}` : 'N/A'}
                                </span>
                            </div>
                            <PiggyBank className='bg-accent w-9 h-9 rounded-full p-1 text-white' />
                        </div>

                        <div className='border-2 border-base-300 p-5 flex justify-between items-center rounded-xl '>
                            <div className='flex flex-col'>
                                <span className='text-gray-500 text-sm'>
                                    Budgets atteints
                                </span>
                                <span className='text-2xl font-bold text-accent'>
                                    {reachedBudgetsRatio || 'N/A'}
                                </span>
                            </div>
                            <Landmark className='bg-accent w-9 h-9 rounded-full p-1 text-white' />
                        </div>

                        <div className='border-2 border-base-300 p-5 flex justify-between items-center rounded-xl bg-accent/10'>
                            <div className='flex flex-col'>
                                <span className='text-gray-500 text-sm font-medium'>
                                    Allocation Journalière
                                </span>
                                <span className='text-2xl font-bold text-accent'>
                                    {insights !== null ? `${insights.dailyAllowance} FCFA` : 'N/A'}
                                </span>
                            </div>
                            <CalendarDays className='text-accent w-9 h-9 p-1' />
                        </div>
                    </div>

                    <div className='w-full md:flex mt-4'>
                        <div className='md:w-2/3'>
                            <div className='border-2 border-base-300 p-5 rounded-xl'>
                                <div className='grid md:grid-cols-2 gap-4'>
                                    <div>
                                        <h3 className='text-lg font-semibold mb-3'>
                                            Statistiques ( en FCFA )
                                        </h3>
                                        <ResponsiveContainer height={250} width="100%">
                                            <BarChart width={730} height={250} data={budgetData}>
                                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                                <XAxis dataKey="budgetName" />
                                                <Tooltip />
                                                <Bar
                                                    name="Budget"
                                                    dataKey="totalBudgetAmount"
                                                    fill="#EF9FBC"
                                                    radius={[10, 10, 0, 0]}
                                                />
                                                <Bar
                                                    name="Dépensé"
                                                    dataKey="totalTransactionsAmount" fill="#EEAF3A"
                                                    radius={[10, 10, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div>
                                        <h3 className='text-lg font-semibold mb-3'>
                                            Répartition des dépenses
                                        </h3>
                                        <ResponsiveContainer height={250} width="100%">
                                            <PieChart>
                                                <Pie
                                                    data={budgetData}
                                                    dataKey="totalTransactionsAmount"
                                                    nameKey="budgetName"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    label
                                                >
                                                    {budgetData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <BudgetAdvisor budgetData={budgetData} savingsGoals={savingsGoals} />

                            <div className='mt-4 border-2 border-base-300 p-5 rounded-xl'>
                                <h3 className='text-lg font-semibold  mb-3'>
                                    Dernières Transactions
                                </h3>
                                <ul className='divide-y divide-base-300'>
                                    {transactions.map((transaction) => (
                                        <TransactionItem
                                            key={transaction.id}
                                            transaction={transaction}>
                                        </TransactionItem>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className='md:w-1/3 md:ml-4 flex flex-col'>
                            {/* Widget d'ajout rapide */}
                            <div className='bg-base-200/50 border-2 border-base-300 p-5 rounded-xl mb-6'>
                                <div className='flex items-center gap-2 mb-3'>
                                    <Zap className="text-accent w-5 h-5" fill="currentColor" />
                                    <h3 className='text-lg font-bold'>Ajout Rapide Intelligent</h3>
                                </div>
                                <p className='text-sm text-gray-500 mb-4'>Saisissez une dépense, l&apos;IA la classe automatiquement !</p>
                                <form onSubmit={handleQuickAdd} className='flex flex-col gap-3'>
                                    <input
                                        type="text"
                                        placeholder="Ex: Supermarché, Cinéma..."
                                        className='input input-bordered w-full input-sm'
                                        value={quickAddDesc}
                                        onChange={e => setQuickAddDesc(e.target.value)}
                                        required
                                    />
                                    <div className='flex gap-2'>
                                        <input
                                            type="number"
                                            placeholder="Montant"
                                            className='input input-bordered w-full input-sm'
                                            value={quickAddAmount}
                                            onChange={e => setQuickAddAmount(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="submit"
                                            className='btn btn-accent btn-sm text-white'
                                            disabled={isQuickAdding}
                                        >
                                            {isQuickAdding ? <span className="loading loading-spinner loading-xs"></span> : "Ajouter"}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <h3 className='text-lg font-semibold mb-4'>
                                Derniers Budgets
                            </h3>
                            <ul className="grid grid-cols-1 gap-4">
                                {budgets.map((budget) => (
                                    <Link href={`/manage/${budget.id}`} key={budget.id}>
                                        <BudgetItem budget={budget} enableHover={1}></BudgetItem>
                                    </Link>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </Wrapper>
    )
}

export default Page;