"use client"

import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react'
import { getLastBudgets, getLastTransactions, getReachedBudgets, getSavingsGoals, getTotalTransactionAmount, getTotalTransactionCount, getUserBudgetData, syncRecurringTransactions } from '../actions';
import Wrapper from '../components/Wrapper';
import { CircleDollarSign, Landmark, PiggyBank, FileDown } from 'lucide-react';
import { generatePDF } from '@/lib/pdfGenerator';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Budget, Transaction } from '@/type';
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
    const [savingsGoals, setSavingsGoals] = useState<any[]>([]);


    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const email = user?.primaryEmailAddress?.emailAddress as string
            if (email) {
                // Execute all promises in parallel for better performance
                const [
                    _syncResult,
                    amount,
                    count,
                    reachedBudgets,
                    budgetsData,
                    lastTransactions,
                    lastBudgets,
                    goalsData
                ] = await Promise.all([
                    syncRecurringTransactions(email), // Runs in parallel
                    getTotalTransactionAmount(email),
                    getTotalTransactionCount(email),
                    getReachedBudgets(email),
                    getUserBudgetData(email),
                    getLastTransactions(email),
                    getLastBudgets(email),
                    getSavingsGoals(email)
                ]);

                setTotalAmount(amount)
                setTotalCount(count)
                setReachedBudgetsRatio(reachedBudgets)
                setBudgetData(budgetsData)
                setTransactions(lastTransactions)
                setBudgets(lastBudgets)
                setSavingsGoals(goalsData)
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

    return (
        <Wrapper>
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
                    <div className='grid md:grid-cols-3 gap-4'>
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

                        <div className='md:w-1/3 md:ml-4'>
                            <h3 className='text-lg font-semibold my-4 md:mb-4 md:mt-0'>
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