"use client";

import React, { useState } from 'react';
import { Target, Trash2, Pencil, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { SavingsGoal } from '@/type';
import { deleteSavingsGoal, updateSavingsGoalAmount, updateSavingsGoal } from '../actions';

interface SavingsGoalItemProps {
    goal: SavingsGoal;
    onUpdate: () => void;
}

const SavingsGoalItem: React.FC<SavingsGoalItemProps> = ({ goal, onUpdate }) => {
    const [amountToAdd, setAmountToAdd] = useState<string>("");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editName, setEditName] = useState(goal.name);
    const [editTarget, setEditTarget] = useState(goal.targetAmount.toString());
    const [editDeadline, setEditDeadline] = useState(
        goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : ''
    );
    const [isSaving, setIsSaving] = useState(false);

    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

    // Statut de l'objectif
    const isCompleted = goal.currentAmount >= goal.targetAmount;
    const isLate = !isCompleted && goal.deadline && new Date(goal.deadline) < new Date();
    const daysLeft = goal.deadline
        ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    const getStatusBadge = () => {
        if (isCompleted) return (
            <span className="badge badge-success gap-1 text-xs">
                <CheckCircle2 className="w-3 h-3" /> Atteint 🎉
            </span>
        );
        if (isLate) return (
            <span className="badge badge-error gap-1 text-xs">
                <AlertTriangle className="w-3 h-3" /> En retard
            </span>
        );
        if (daysLeft !== null && daysLeft <= 7) return (
            <span className="badge badge-warning gap-1 text-xs">
                <Clock className="w-3 h-3" /> {daysLeft}j restants
            </span>
        );
        return (
            <span className="badge badge-info badge-outline text-xs">
                <Clock className="w-3 h-3 mr-1" /> En cours
            </span>
        );
    };

    const getProgressColor = () => {
        if (isCompleted) return "progress-success";
        if (isLate) return "progress-error";
        if (percentage >= 75) return "progress-warning";
        return "progress-accent";
    };

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

    const handleUpdate = async () => {
        const targetNum = parseFloat(editTarget);
        if (!editName.trim() || isNaN(targetNum) || targetNum <= 0) return;
        setIsSaving(true);
        try {
            await updateSavingsGoal(
                goal.id,
                editName.trim(),
                targetNum,
                editDeadline ? new Date(editDeadline) : null
            );
            setIsEditOpen(false);
            onUpdate();
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="border-2 border-base-300 p-4 md:p-5 rounded-xl bg-base-100 shadow-sm flex flex-col gap-4">

                {/* En-tête */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0">
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${isCompleted ? 'bg-success/15' : isLate ? 'bg-error/15' : 'bg-accent/10'}`}>
                            <Target className={`w-5 h-5 md:w-6 md:h-6 ${isCompleted ? 'text-success' : isLate ? 'text-error' : 'text-accent'}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base md:text-lg font-bold leading-tight truncate" title={goal.name}>{goal.name}</h3>
                            <p className="text-xs md:text-sm text-gray-500 truncate" title={`${goal.targetAmount.toLocaleString('fr-FR')} FCFA`}>
                                Cible : <span className="font-semibold">{goal.targetAmount.toLocaleString('fr-FR')} FCFA</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 w-full md:w-auto justify-between md:justify-end">
                        {getStatusBadge()}
                        <div className="flex">
                            <button onClick={() => setIsEditOpen(true)} className="btn btn-ghost btn-sm text-info px-2">
                                <Pencil size={16} />
                            </button>
                            <button onClick={handleDelete} className="btn btn-ghost btn-sm text-error px-2">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Barre de progression */}
                <div className="w-full">
                    <div className="flex justify-between text-sm mb-1 flex-wrap gap-2">
                        <span className="font-medium">{Math.round(percentage)}% atteint</span>
                        {goal.deadline && (
                            <span className={`text-xs ${isLate ? 'text-error font-semibold' : 'text-gray-400'}`}>
                                {isLate
                                    ? `Délai dépassé !`
                                    : daysLeft === 0 ? "Dernier jour !"
                                    : daysLeft !== null ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`
                                    : ''}
                            </span>
                        )}
                    </div>
                    <progress
                        className={`progress w-full h-3 ${getProgressColor()}`}
                        value={percentage}
                        max="100"
                    />
                    <div className="flex justify-between text-[10px] md:text-xs mt-1 text-gray-500 flex-wrap gap-x-4 gap-y-1">
                        <span>{goal.currentAmount.toLocaleString('fr-FR')} FCFA épargnés</span>
                        <span>Reste : {remaining.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                </div>

                {/* Ajout de fonds (désactivé si objectif atteint) */}
                {!isCompleted && (
                    <div className="flex gap-2 w-full mt-2">
                        <input
                            type="number"
                            placeholder="Montant..."
                            className="input input-bordered input-sm flex-1 min-w-0"
                            value={amountToAdd}
                            onChange={(e) => setAmountToAdd(e.target.value)}
                        />
                        <button onClick={handleAddFunds} className="btn btn-accent btn-sm font-semibold flex-shrink-0">
                            + Épargner
                        </button>
                    </div>
                )}

                {isCompleted && (
                    <div className="text-center text-success text-sm font-bold py-1">
                        🎉 Félicitations ! Objectif atteint !
                    </div>
                )}
            </div>

            {/* Modal Modifier */}
            {isEditOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Modifier l&apos;objectif</h3>

                        <div className="form-control mb-3">
                            <label className="label"><span className="label-text">Nom de l&apos;objectif</span></label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                            />
                        </div>

                        <div className="form-control mb-3">
                            <label className="label"><span className="label-text">Montant cible (FCFA)</span></label>
                            <input
                                type="number"
                                className="input input-bordered w-full"
                                value={editTarget}
                                onChange={e => setEditTarget(e.target.value)}
                            />
                        </div>

                        <div className="form-control mb-5">
                            <label className="label"><span className="label-text">Date limite (optionnel)</span></label>
                            <input
                                type="date"
                                className="input input-bordered w-full"
                                value={editDeadline}
                                onChange={e => setEditDeadline(e.target.value)}
                            />
                        </div>

                        <div className="modal-action">
                            <button className="btn" onClick={() => setIsEditOpen(false)}>Annuler</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleUpdate}
                                disabled={isSaving}
                            >
                                {isSaving ? <span className="loading loading-spinner loading-xs" /> : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setIsEditOpen(false)} />
                </div>
            )}
        </>
    );
};

export default SavingsGoalItem;
