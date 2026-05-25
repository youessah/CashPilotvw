"use client";

import React, { useState } from 'react';
import { Trash2, Pencil, CheckCircle2, Clock, AlertTriangle, Lightbulb, Zap } from 'lucide-react';
import { SavingsGoal } from '@/type';
import { deleteSavingsGoal, updateSavingsGoalAmount, updateSavingsGoal } from '../actions';
import { calculateMonthlyEffort, getProactiveStatus } from '@/lib/savingsIntelligence';

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

    const monthlyNeeded = calculateMonthlyEffort(goal);
    const { status: pStatus, message: pMessage } = getProactiveStatus(goal);

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
        if (pStatus === 'critical') return "progress-error";
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
            <div className={`relative overflow-hidden border-2 border-base-300 p-4 md:p-6 rounded-2xl bg-base-100 shadow-lg flex flex-col gap-5 transition-all hover:shadow-xl hover:border-accent/40 ${isCompleted ? 'bg-gradient-to-br from-success/5 to-transparent' : ''}`}>
                
                {/* Background Pattern for Modern Look */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

                {/* En-tête */}
                <div className="flex items-start gap-4 relative z-10 w-full">
                    <div className={`text-2xl md:text-3xl p-3 md:p-4 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-inner ${isCompleted ? 'bg-success/20' : isLate ? 'bg-error/20' : 'bg-accent/10'}`}>
                        {goal.emoji || "💰"}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col gap-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-lg md:text-xl font-black leading-tight truncate text-base-content uppercase tracking-tight flex-1" title={goal.name}>
                                {goal.name}
                            </h3>
                            <div className="flex items-center gap-2 shrink-0">
                                {getStatusBadge()}
                                <div className="flex bg-base-200/50 rounded-lg p-0.5 shadow-sm">
                                    <button onClick={() => setIsEditOpen(true)} className="btn btn-ghost btn-xs text-info px-1.5 hover:bg-info/10">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={handleDelete} className="btn btn-ghost btn-xs text-error px-1.5 hover:bg-error/10">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                            <p className="text-sm md:text-base text-gray-500 whitespace-nowrap">
                                Cible : <span className="font-bold text-accent">{goal.targetAmount.toLocaleString('fr-FR')} FCFA</span>
                            </p>
                            {monthlyNeeded && !isCompleted && (
                                <p className="text-xs md:text-sm font-semibold text-accent flex items-center gap-1.5 whitespace-nowrap">
                                    <Zap className="w-3.5 h-3.5" fill="currentColor" /> {monthlyNeeded.toLocaleString('fr-FR')} FCFA / mois
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Barre de progression avec jalons */}
                <div className="w-full relative z-10">
                    <div className="flex justify-between text-sm font-bold mb-2 flex-wrap gap-2">
                        <span className="text-accent underline decoration-2 underline-offset-4">{Math.round(percentage)}% atteint</span>
                        {goal.deadline && (
                            <span className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-full ${isLate ? 'bg-error text-white font-bold' : 'bg-base-200 text-gray-500'}`}>
                                <Clock className="w-3 h-3" />
                                {isLate
                                    ? `Délai dépassé !`
                                    : daysLeft === 0 ? "Dernier jour !"
                                    : daysLeft !== null ? `${daysLeft}j restant${daysLeft > 1 ? 's' : ''}`
                                    : ''}
                            </span>
                        )}
                    </div>
                    
                    <div className="relative pt-1">
                        <progress
                            className={`progress w-full h-4 shadow-sm ${getProgressColor()}`}
                            value={percentage}
                            max="100"
                        />
                        {/* Jalon 50% */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-base-100/30 z-20 pointer-events-none" />
                    </div>

                    <div className="flex justify-between text-[10px] md:text-xs mt-2 text-gray-500 font-medium">
                        <span className="bg-base-200 px-2 py-0.5 rounded">{goal.currentAmount.toLocaleString('fr-FR')} FCFA fondus</span>
                        <span className="bg-base-200 px-2 py-0.5 rounded italic">Reste : {remaining.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                </div>

                {/* Conseil Proactif Intégré */}
                {pMessage && !isCompleted && (
                    <div className={`p-3 rounded-xl border flex items-start gap-2 shadow-sm ${pStatus === 'critical' ? 'bg-error/10 border-error/20 text-error' : pStatus === 'warning' ? 'bg-warning/10 border-warning/20 text-warning-content' : 'bg-accent/5 border-accent/10 text-accent-content'}`}>
                        <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-bold leading-tight">{pMessage}</p>
                    </div>
                )}

                {/* Ajout de fonds (désactivé si objectif atteint) */}
                {!isCompleted && (
                    <div className="flex items-center gap-2 w-full mt-2 relative z-10">
                        <div className="relative flex-1 group">
                            <input
                                type="number"
                                placeholder="Montant..."
                                className="input input-bordered input-sm w-full font-bold focus:border-accent"
                                value={amountToAdd}
                                onChange={(e) => setAmountToAdd(e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 group-focus-within:text-accent">FCFA</span>
                        </div>
                        <button onClick={handleAddFunds} className="btn btn-accent btn-sm font-black flex-shrink-0 shadow-lg hover:shadow-accent/40 active:scale-95 transition-all">
                            BOOSTER ⚡
                        </button>
                    </div>
                )}

                {isCompleted && (
                    <div className="text-center text-success text-sm font-bold py-2 bg-success/10 rounded-xl relative z-10 border border-success/20">
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
