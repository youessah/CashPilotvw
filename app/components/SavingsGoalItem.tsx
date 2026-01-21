"use client";

import React, { useState } from 'react';
import { Target, Plus, Trash2, TrendingUp } from 'lucide-react';
import { SavingsGoal } from '@/type';
import { addSavingsGoal, deleteSavingsGoal, updateSavingsGoalAmount } from '../actions';

interface SavingsGoalItemProps {
    goal: SavingsGoal;
    onUpdate: () => void;
}

const SavingsGoalItem: React.FC<SavingsGoalItemProps> = ({ goal, onUpdate }) => {
    const [amountToAdd, setAmountToAdd] = useState<string>("");
    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

    const handleAddFunds = async () => {
        const amount = parseFloat(amountToAdd);
        if (isNaN(amount) || amount <= 0) return;

        try {
            await updateSavingsGoalAmount(goal.id, amount);
            setAmountToAdd("");
            onUpdate();
        } catch (error) {
            console.error("Erreur lors de l'ajout de fonds:", error);
        }
    };

    const handleDelete = async () => {
        if (confirm("Voulez-vous vraiment supprimer cet objectif ?")) {
            try {
                await deleteSavingsGoal(goal.id);
                onUpdate();
            } catch (error) {
                console.error("Erreur lors de la suppression de l'objectif:", error);
            }
        }
    };

    return (
        <div className="border-2 border-base-300 p-5 rounded-xl bg-base-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-accent/10 p-2 rounded-lg">
                        <Target className="text-accent w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">{goal.name}</h3>
                        <p className="text-sm text-gray-500">
                            Cible : {goal.targetAmount} FCFA
                        </p>
                    </div>
                </div>
                <button onClick={handleDelete} className="btn btn-ghost btn-sm text-error">
                    <Trash2 size={18} />
                </button>
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span>Progression</span>
                    <span className="font-bold">{Math.round(percentage)}%</span>
                </div>
                <progress className="progress progress-accent w-full h-3" value={percentage} max="100"></progress>
                <div className="flex justify-between text-xs mt-1 text-gray-500">
                    <span>{goal.currentAmount} FCFA épargnés</span>
                    <span>Reste : {Math.max(goal.targetAmount - goal.currentAmount, 0)} FCFA</span>
                </div>
            </div>

            <div className="flex gap-2">
                <input
                    type="number"
                    placeholder="Montant à ajouter"
                    className="input input-bordered input-sm flex-1"
                    value={amountToAdd}
                    onChange={(e) => setAmountToAdd(e.target.value)}
                />
                <button onClick={handleAddFunds} className="btn btn-accent btn-sm">
                    Épargner
                </button>
            </div>
        </div>
    );
};

export default SavingsGoalItem;
