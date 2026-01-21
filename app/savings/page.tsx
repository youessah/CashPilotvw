"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Wrapper from '../components/Wrapper';
import { Target, Plus, TrendingUp } from 'lucide-react';
import { SavingsGoal } from '@/type';
import { addSavingsGoal, getSavingsGoals } from '../actions';
import SavingsGoalItem from '../components/SavingsGoalItem';

const SavingsPage = () => {
    const { user } = useUser();
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [deadline, setDeadline] = useState("");

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

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

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
            setName("");
            setTargetAmount("");
            setDeadline("");
            fetchGoals();
            (document.getElementById('add_goal_modal') as any)?.close();
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'objectif:", error);
        }
    };

    return (
        <Wrapper>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Target className="text-accent" /> Mes Objectifs d&apos;Épargne
                    </h1>
                    <p className="text-gray-500">Préparez vos projets futurs en toute simplicité.</p>
                </div>
                <button
                    className="btn btn-accent"
                    onClick={() => (document.getElementById('add_goal_modal') as any)?.showModal()}
                >
                    <Plus size={20} /> Nouvel Objectif
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : goals.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-base-300 rounded-2xl">
                    <TrendingUp className="mx-auto w-16 h-16 text-base-300 mb-4" />
                    <h3 className="text-xl font-semibold">Aucun objectif pour le moment</h3>
                    <p className="text-gray-500 mb-6">Commencez par créer votre premier objectif d&apos;épargne !</p>
                    <button
                        className="btn btn-accent"
                        onClick={() => (document.getElementById('add_goal_modal') as any)?.showModal()}
                    >
                        Créer mon premier objectif
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal) => (
                        <SavingsGoalItem key={goal.id} goal={goal} onUpdate={fetchGoals} />
                    ))}
                </div>
            )}

            {/* Modal pour ajouter un objectif */}
            <dialog id="add_goal_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Créer un nouvel objectif</h3>
                    <form onSubmit={handleAddGoal}>
                        <div className="form-control w-full mb-4">
                            <label className="label">
                                <span className="label-text">Nom de l&apos;objectif (ex: Vacances)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Entrez le nom"
                                className="input input-bordered w-full"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control w-full mb-4">
                            <label className="label">
                                <span className="label-text">Montant cible (FCFA)</span>
                            </label>
                            <input
                                type="number"
                                placeholder="0"
                                className="input input-bordered w-full"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control w-full mb-6">
                            <label className="label">
                                <span className="label-text">Date limite (Optionnel)</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered w-full"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                        </div>
                        <div className="modal-action">
                            <button type="button" className="btn" onClick={() => (document.getElementById('add_goal_modal') as any)?.close()}>Annuler</button>
                            <button type="submit" className="btn btn-accent">Créer l&apos;objectif</button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </Wrapper>
    );
};

export default SavingsPage;
