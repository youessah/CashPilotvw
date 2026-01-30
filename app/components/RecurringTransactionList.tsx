import { RecurringTransaction } from "@/type"
import { Trash2, Repeat, CalendarClock } from "lucide-react"
import { deleteRecurringTransaction } from "@/app/actions"

interface RecurringTransactionListProps {
    transactions: RecurringTransaction[]
    onDelete: (id: string) => void
}

const RecurringTransactionList: React.FC<RecurringTransactionListProps> = ({ transactions, onDelete }) => {

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction récurrente ?");
        if (confirmed) {
            try {
                await deleteRecurringTransaction(id);
                onDelete(id);
            } catch (error) {
                console.error("Erreur lors de la suppression", error);
                alert("Erreur lors de la suppression");
            }
        }
    }

    if (transactions.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 border-2 border-base-300 rounded-xl p-5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Repeat className="w-5 h-5 text-secondary" />
                Transactions Récurrentes Actives
            </h3>
            <div className="space-y-3">
                {transactions.map((t) => (
                    <div key={t.id} className="flex justify-between items-center p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">{t.description}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <CalendarClock className="w-3 h-3" />
                                {t.frequency === 'DAILY' && 'Chaque jour'}
                                {t.frequency === 'WEEKLY' && 'Chaque semaine'}
                                {t.frequency === 'MONTHLY' && 'Chaque mois'}
                                {" • "}{t.amount} FCFA
                            </span>
                        </div>
                        <button
                            onClick={() => handleDelete(t.id)}
                            className="btn btn-ghost btn-sm text-error hover:bg-error/20"
                            title="Arrêter la récurrence"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RecurringTransactionList;
