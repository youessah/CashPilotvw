"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Wrapper from '../components/Wrapper';
import { Target, Plus, TrendingUp, PiggyBank, Trophy, ArrowUpDown } from 'lucide-react';
import { SavingsGoal } from '@/type';
import { addSavingsGoal, getSavingsGoals } from '../actions';
import SavingsGoalItem from '../components/SavingsGoalItem';

type SortOption = 'progress_desc' | 'progress_asc' | 'deadline_asc' | 'amount_desc';

const SavingsPage = () => {
    const { user } = useUser();
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [deadline, setDeadline] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>('deadline_asc');

    const fetchGoals = useCallback(async () => {
        if (user?.primaryEmailAddress?.emailAddress) {
            setIsLoading(true);
            try {
                const goalsData = await getSavingsGoals(user.primaryEmailAddress.emailAddress);
                setGoals(goalsData as SavingsGoal[]);
            } catch (error) {
                console.error("Erreur lors de la récupération des objectifs:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [user?.primaryEmailAddress?.emailAddress]);

    useEffect(() => { fetchGoals(); }, [fetchGoals]);

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.primaryEmailAddress?.emailAddress || !name || !targetAmount) return;
        try {
            await addSavingsGoal(
                user.primaryEmailAddress.emailAddress,
                name,
                parseFloat(targetAmount),
                deadline ? new Date(deadline) : null
            );
            setName(""); setTargetAmount(""); setDeadline("");
            fetchGoals();
            (document.getElementById('add_goal_modal') as HTMLDialogElement)?.close();
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'objectif:", error);
        }
    };

    // Statistiques globales
    const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
    const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const completedCount = goals.filter(g => g.currentAmount >= g.targetAmount).length;
    const lateCount = goals.filter(g => g.deadline && new Date(g.deadline) < new Date() && g.currentAmount < g.targetAmount).length;
    const globalPct = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;

    // Tri
    const sortedGoals = [...goals].sort((a, b) => {
        const pctA = a.currentAmount / a.targetAmount;
        const pctB = b.currentAmount / b.targetAmount;
        switch (sortBy) {
            case 'progress_desc': return pctB - pctA;
            case 'progress_asc': return pctA - pctB;
            case 'deadline_asc': {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            }
            case 'amount_desc': return b.targetAmount - a.targetAmount;
            default: return 0;
        }
    });

    return (
        <Wrapper>
            {/* En-tête */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Target className="text-accent" /> Mes Objectifs d&apos;Épargne
                    </h1>
                    <p className="text-gray-500 mt-1">Suivez et atteignez vos projets financiers.</p>
                </div>
                <button
                    className="btn btn-accent"
                    onClick={() => (document.getElementById('add_goal_modal') as HTMLDialogElement)?.showModal()}
                >
                    <Plus size={20} /> Nouvel Objectif
                </button>
            </div>

            {/* Résumé global */}
            {goals.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="border-2 border-base-300 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Total épargné</span>
                        <span className="text-xl font-bold text-accent">{totalSaved.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="border-2 border-base-300 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Total ciblé</span>
                        <span className="text-xl font-bold">{totalTarget.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="border-2 border-base-300 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Objectifs atteints</span>
                        <span className="text-xl font-bold text-success flex items-center gap-1">
                            <Trophy className="w-5 h-5" /> {completedCount} / {goals.length}
                        </span>
                    </div>
                    <div className="border-2 border-base-300 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">En retard</span>
                        <span className={`text-xl font-bold ${lateCount > 0 ? 'text-error' : 'text-success'}`}>
                            {lateCount > 0 ? `⚠️ ${lateCount}` : '✅ 0'}
                        </span>
                    </div>

                    {/* Barre globale sur toute la largeur */}
                    <div className="col-span-2 md:col-span-4 border-2 border-base-300 p-4 rounded-xl">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold flex items-center gap-1">
                                <PiggyBank className="w-4 h-4 text-accent" /> Progression globale
                            </span>
                            <span className="font-bold text-accent">{Math.round(globalPct)}%</span>
                        </div>
                        <progress className="progress progress-accent w-full h-4" value={globalPct} max="100" />
                        <p className="text-xs text-gray-400 mt-1">
                            {totalSaved.toLocaleString('fr-FR')} FCFA épargnés sur {totalTarget.toLocaleString('fr-FR')} FCFA au total
                        </p>
                    </div>
                </div>
            )}

            {/* Tri */}
            {goals.length > 1 && (
                <div className="flex justify-end mb-4">
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        <select
                            className="select select-bordered select-sm"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as SortOption)}
                        >
                            <option value="deadline_asc">Trier : Date limite (proche)</option>
                            <option value="progress_desc">Trier : Progression (↓)</option>
                            <option value="progress_asc">Trier : Progression (↑)</option>
                            <option value="amount_desc">Trier : Montant cible (↓)</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Liste des objectifs */}
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : goals.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-base-300 rounded-2xl">
                    <TrendingUp className="mx-auto w-16 h-16 text-base-300 mb-4" />
                    <h3 className="text-xl font-semibold">Aucun objectif pour le moment</h3>
                    <p className="text-gray-500 mb-6">Définissez un projet et suivez votre progression !</p>
                    <button
                        className="btn btn-accent"
                        onClick={() => (document.getElementById('add_goal_modal') as HTMLDialogElement)?.showModal()}
                    >
                        Créer mon premier objectif
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedGoals.map((goal) => (
                        <SavingsGoalItem key={goal.id} goal={goal} onUpdate={fetchGoals} />
                    ))}
                </div>
            )}

            {/* Modal Créer un objectif */}
            <dialog id="add_goal_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Créer un nouvel objectif</h3>
                    <form onSubmit={handleAddGoal}>
                        <div className="form-control w-full mb-4">
                            <label className="label">
                                <span className="label-text">Nom de l&apos;objectif <span className="text-accent">*</span></span>
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Vacances, Voiture, Urgences..."
                                className="input input-bordered w-full"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control w-full mb-4">
                            <label className="label">
                                <span className="label-text">Montant cible (FCFA) <span className="text-accent">*</span></span>
                            </label>
                            <input
                                type="number"
                                placeholder="Ex: 500 000"
                                className="input input-bordered w-full"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control w-full mb-6">
                            <label className="label">
                                <span className="label-text">Date limite <span className="text-gray-400">(optionnel)</span></span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered w-full"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                        </div>
                        <div className="modal-action">
                            <button type="button" className="btn" onClick={() => (document.getElementById('add_goal_modal') as HTMLDialogElement)?.close()}>
                                Annuler
                            </button>
                            <button type="submit" className="btn btn-accent">
                                Créer l&apos;objectif
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop"><button>close</button></form>
            </dialog>
        </Wrapper>
    );
};

export default SavingsPage;
