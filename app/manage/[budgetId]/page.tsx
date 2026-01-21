"use client"
import { addRecurringTransaction, addTransactionToBudget, deleteBudget, deleteTransaction, getTrasactionsByBudgetId, updateBudget, updateTransaction } from '@/app/actions'
import BudgetItem from '@/app/components/BudgetItem'
import Wrapper from '@/app/components/Wrapper'
import { Budget } from '@/type'
import React, { useCallback, useEffect, useState } from 'react'
import Notification from '@/app/components/Notification'
import { Send, Trash, Pencil } from 'lucide-react'
import { redirect } from 'next/navigation'
import EmojiPicker from 'emoji-picker-react'

const Page = ({ params }: { params: Promise<{ budgetId: string }> }) => {
  const [budgetId, setBudgetId] = useState<string>('')
  const [budget, setBudget] = useState<Budget>()
  const [description, setDescription] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [isRecurring, setIsRecurring] = useState<boolean>(false)
  const [frequency, setFrequency] = useState<string>('MONTHLY')

  const [notification, setNotification] = useState<string>("");
  const closeNotification = () => {
    setNotification("")
  }

  // Edit Budget State
  const [isEditBudgetModalOpen, setIsEditBudgetModalOpen] = useState(false)
  const [editBudgetName, setEditBudgetName] = useState('')
  const [editBudgetAmount, setEditBudgetAmount] = useState('')
  const [editBudgetEmoji, setEditBudgetEmoji] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Edit Transaction State
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [editTransactionDescription, setEditTransactionDescription] = useState('')
  const [editTransactionAmount, setEditTransactionAmount] = useState('')

  const fetchBudgetData = useCallback(async (budgetId: string) => {
    try {
      if (budgetId) {
        const budgetData = await getTrasactionsByBudgetId(budgetId)
        setBudget(budgetData)
        setEditBudgetName(budgetData?.name || '')
        setEditBudgetAmount(budgetData?.amount.toString() || '')
        setEditBudgetEmoji(budgetData?.emoji || '')
      }

    } catch (error) {
      console.error(
        "Erreur lors de la récupération du budget et des transactions:",
        error)
    }
  }, []);

  useEffect(() => {
    const getId = async () => {
      const resolvedParams = await params;
      setBudgetId(resolvedParams.budgetId)
      fetchBudgetData(resolvedParams.budgetId)
    }
    getId()
  }, [params, fetchBudgetData])

  const handleAddTransaction = async () => {
    if (!amount || !description) {
      setNotification("Veuillez remplir tous les champs.")
      return;
    }

    try {
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error("Le montant doit être un nombre positif.");
      }
      if (isRecurring) {
        await addRecurringTransaction(budgetId, amountNumber, description, frequency)
        setNotification(`Transaction récurrente ajoutée avec succès`)
      } else {
        await addTransactionToBudget(budgetId, amountNumber, description)
        setNotification(`Transaction ajoutée avec succès`)
      }

      fetchBudgetData(budgetId)
      setAmount('')
      setDescription('')
      setIsRecurring(false)
    } catch {
      setNotification(`Vous avez dépassé votre budget ou une erreur est survenue`)
    }
  }

  const handleDeleteBudget = async () => {
    const comfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce budget et toutes ses transactions associées ?"
    )
    if (comfirmed) {
      try {
        await deleteBudget(budgetId)
      } catch (error) {
        console.error("Erreur lors de la suppression du budget:", error);
      }
      redirect("/budgets")
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    const comfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette transaction ?"
    )
    if (comfirmed) {
      try {
        await deleteTransaction(transactionId)
        fetchBudgetData(budgetId)
        setNotification("Dépense supprimée")
      } catch (error) {
        console.error("Erreur lors de la suppression du budget:", error);
      }
    }
  }

  // Update Budget Logic
  const handleUpdateBudget = async () => {
    try {
      const amountNum = parseFloat(editBudgetAmount);
      if (isNaN(amountNum) || amountNum <= 0) throw new Error("Montant invalide");

      await updateBudget(budgetId, editBudgetName, amountNum, editBudgetEmoji);
      setNotification("Budget mis à jour avec succès");
      setIsEditBudgetModalOpen(false);
      fetchBudgetData(budgetId);
    } catch (error) {
      setNotification("Erreur lors de la mise à jour du budget");
      console.error(error);
    }
  }

  // Update Transaction Logic
  const openEditTransactionModal = (transaction: any) => {
    setEditingTransactionId(transaction.id);
    setEditTransactionDescription(transaction.description);
    setEditTransactionAmount(transaction.amount.toString());
    (document.getElementById('edit_transaction_modal') as any)?.showModal();
  }

  const handleUpdateTransaction = async () => {
    if (!editingTransactionId) return;
    try {
      const amountNum = parseFloat(editTransactionAmount);
      if (isNaN(amountNum) || amountNum <= 0) throw new Error("Montant invalide");

      await updateTransaction(editingTransactionId, amountNum, editTransactionDescription);
      setNotification("Transaction mise à jour");
      setEditingTransactionId(null);
      (document.getElementById('edit_transaction_modal') as any)?.close();
      fetchBudgetData(budgetId);
    } catch (error) {
      setNotification("Erreur mise à jour transaction");
      console.error(error);
    }
  }


  return (
    <Wrapper>

      {notification && (
        < Notification message={notification} onclose={closeNotification}></Notification>
      )}
      {budget && (
        <div className='flex md:flex-row flex-col'>
          <div className='md:w-1/3'>
            <BudgetItem budget={budget} enableHover={0} />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsEditBudgetModalOpen(true)}
                className='btn btn-primary flex-1'
              >
                <Pencil className='w-4 h-4 mr-2' /> Modifier
              </button>
              <button
                onClick={() => handleDeleteBudget()}
                className='btn btn-error flex-1'
              >
                <Trash className='w-4 h-4 mr-2' /> Supprimer
              </button>
            </div>

            <div className='space-y-4 flex flex-col mt-8 p-4 border rounded-xl bg-base-100 shadow-sm'>
              <h3 className="font-bold text-lg">Nouvelle Transaction</h3>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                required
                className="input input-bordered"
              />

              <input
                type="number"
                id="amount"
                placeholder="Montant"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className=" input input-bordered"
              />

              <div className="form-control">
                <label className="label cursor-pointer justify-start">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-accent mr-2"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                  <span className="label-text">Transaction récurrente ?</span>
                </label>
              </div>

              {isRecurring && (
                <select
                  className="select select-bordered w-full"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="DAILY">Journalier</option>
                  <option value="WEEKLY">Hebdomadaire</option>
                  <option value="MONTHLY">Mensuel</option>
                </select>
              )}

              <button
                onClick={handleAddTransaction}
                className="btn btn-accent text-white"
              >
                Ajouter la dépense
              </button>

            </div>
          </div>


          {budget?.transactions && budget.transactions.length > 0 ? (
            <div className="overflow-x-auto md:mt-0 mt-4 md:w-2/3 ml-4 bg-base-100 rounded-xl shadow-sm border border-base-200">
              <table className="table table-zebra">
                {/* head */}
                <thead className="bg-base-200">
                  <tr>
                    <th >Type</th>
                    <th >Montant</th>
                    <th >Description</th>
                    <th >Date</th>
                    <th >Heure</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budget?.transactions?.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className='text-lg md:text-2xl text-center'>{transaction.emoji || budget.emoji}</td>
                      <td>
                        <div className="badge badge-accent badge-outline font-bold">
                          - {transaction.amount} FCFA</div>
                      </td>
                      <td className="font-medium">{transaction.description}</td>
                      <td className="text-sm text-gray-500">
                        {transaction.createdAt.toLocaleDateString("fr-FR")}
                      </td>
                      <td className="text-sm text-gray-500">
                        {transaction.createdAt.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="flex gap-2">
                        <button
                          onClick={() => openEditTransactionModal(transaction)}
                          className='btn btn-ghost btn-xs text-info'
                        >
                          <Pencil className='w-4' />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className='btn btn-ghost btn-xs text-error'
                        >
                          <Trash className='w-4' />
                        </button>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          ) : (
            <div className='md:w-2/3 mt-10 md:ml-4 flex items-center justify-center flex-col p-10 border-2 border-dashed rounded-xl'>
              <Send strokeWidth={1.5} className='w-12 h-12 text-accent mb-4' />
              <span className='text-xl font-bold text-gray-500'>Aucune transaction.</span>
              <p className="text-gray-400">Ajoutez votre première dépense ci-contre.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Budget Modal */}
      {isEditBudgetModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Modifier le Budget</h3>
            <div className="form-control w-full mb-4">
              <label className="label"><span className="label-text">Nom</span></label>
              <input type="text" className="input input-bordered w-full" value={editBudgetName} onChange={e => setEditBudgetName(e.target.value)} />
            </div>
            <div className="form-control w-full mb-4">
              <label className="label"><span className="label-text">Montant (FCFA)</span></label>
              <input type="number" className="input input-bordered w-full" value={editBudgetAmount} onChange={e => setEditBudgetAmount(e.target.value)} />
            </div>

            <div className="form-control w-full mb-4">
              <label className="label"><span className="label-text">Icône</span></label>
              <div className="flex items-center gap-4">
                <button className="btn btn-outline text-2xl" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>{editBudgetEmoji || "Choose"}</button>
                {showEmojiPicker && (
                  <div className="absolute z-10 mt-12 bg-white shadow-xl rounded-xl">
                    <EmojiPicker onEmojiClick={(e) => { setEditBudgetEmoji(e.emoji); setShowEmojiPicker(false) }} />
                  </div>
                )}
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setIsEditBudgetModalOpen(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleUpdateBudget}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      <dialog id="edit_transaction_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Modifier la Transaction</h3>
          <div className="form-control w-full mb-4">
            <label className="label"><span className="label-text">Description</span></label>
            <input type="text" className="input input-bordered w-full" value={editTransactionDescription} onChange={e => setEditTransactionDescription(e.target.value)} />
          </div>
          <div className="form-control w-full mb-4">
            <label className="label"><span className="label-text">Montant (FCFA)</span></label>
            <input type="number" className="input input-bordered w-full" value={editTransactionAmount} onChange={e => setEditTransactionAmount(e.target.value)} />
          </div>
          <div className="modal-action">
            <button className="btn" onClick={() => (document.getElementById('edit_transaction_modal') as any)?.close()}>Annuler</button>
            <button className="btn btn-primary" onClick={handleUpdateTransaction}>Sauvegarder</button>
          </div>
        </div>
      </dialog>

    </Wrapper>
  )
}

export default Page;