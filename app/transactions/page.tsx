"use client"

import { Budget, Transaction } from '@/type'
import { useUser } from '@clerk/nextjs'
import React, { useCallback, useEffect, useState } from 'react'
import { getBudgetsByUser, getTransactionsByEmailAndPeriod } from '../actions'
import Wrapper from '../components/Wrapper'
import TransactionItem from '../components/TransactionItem'

const Page = () => {

  const { user } = useUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBudget, setSelectedBudget] = useState("all")
  const [budgets, setBudgets] = useState<{ id: string, name: string }[]>([])

  const fetchTransactions = useCallback(async (period: string) => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setLoading(true)
      try {
        const email = user.primaryEmailAddress.emailAddress
        const transactionsData = await getTransactionsByEmailAndPeriod(email, period)
        setTransactions(transactionsData)

        // Also fetch budgets for the filter if not already fetched
        const userBudgets = await getBudgetsByUser(email)
        setBudgets(userBudgets.map((b: Budget) => ({ id: b.id, name: b.name })))

        setLoading(false)
      } catch (err) {
        console.error("Erreur lors de la récupération des transactions: ", err);
      }
    }
  }, [user?.primaryEmailAddress?.emailAddress]);

  useEffect(() => {
    fetchTransactions("last30")
  }, [fetchTransactions])

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBudget = selectedBudget === "all" || transaction.budgetId === selectedBudget
    return matchesSearch && matchesBudget
  })

  return (
    <Wrapper>

      <div className='flex flex-col md:flex-row justify-between items-center mb-5 gap-4'>
        <div className='flex gap-2 w-full md:w-auto'>
          <input
            type="text"
            placeholder="Rechercher une transaction..."
            className='input input-bordered w-full md:w-64'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className='select select-bordered'
            value={selectedBudget}
            onChange={(e) => setSelectedBudget(e.target.value)}
          >
            <option value="all">Tous les budgets</option>
            {budgets.map(budget => (
              <option key={budget.id} value={budget.id}>{budget.name}</option>
            ))}
          </select>
        </div>

        <select
          className='select select-bordered w-full md:w-auto'
          defaultValue="last30"
          onChange={(e) => fetchTransactions(e.target.value)}
        >
          <option value="last7">Derniers 7 jours</option>
          <option value="last30">Derniers 30 jours</option>
          <option value="last90">Derniers 90 jours</option>
          <option value="last365">Derniers 365 jours</option>
        </select>
      </div>


      <div className='overflow-x-auto w-full bg-base-200/35 p-5 rounded-xl'>
        {loading ? (
          <div className='flex justify-center items-center'>
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className='flex justify-center items-center h-full'>
            <span className='text-gray-500 text-sm'>
              Aucune transaction trouvée.
            </span>
          </div>
        ) : (
          <ul className='divide-y divide-base-300'>
            {filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}>
              </TransactionItem>
            ))}
          </ul>
        )}
      </div>
    </Wrapper>
  )
}

export default Page;