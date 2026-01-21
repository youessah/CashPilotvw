"use client";

import React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';

interface BudgetData {
    budgetName: string;
    totalBudgetAmount: number;
    totalTransactionsAmount: number;
}

interface BudgetAdvisorProps {
    budgetData: BudgetData[];
    savingsGoals: any[]; // Using any for now to avoid complexity, will cast inside
}

const BudgetAdvisor: React.FC<BudgetAdvisorProps> = ({ budgetData, savingsGoals }) => {
    const getAdvice = () => {
        const adviceList: { icon: React.ReactNode; title: string; text: string; type: 'success' | 'warning' | 'error' | 'info' }[] = [];

        // Analysis of savings goals
        savingsGoals.forEach(goal => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            if (percentage >= 100) {
                adviceList.push({
                    icon: <CheckCircle className="text-green-500" />,
                    title: `Objectif atteint ! 🎉`,
                    text: `Félicitations ! Vous avez atteint votre objectif "${goal.name}". C'est le moment de célébrer !`,
                    type: 'success'
                });
            } else if (percentage >= 75) {
                adviceList.push({
                    icon: <TrendingUp className="text-accent" />,
                    title: `Presque là : ${goal.name}`,
                    text: `Vous avez atteint ${Math.round(percentage)}% de votre objectif. Encore un petit effort !`,
                    type: 'info'
                });
            }
        });

        if (budgetData.length === 0 && savingsGoals.length === 0) {
            adviceList.push({
                icon: <Info className="text-blue-500" />,
                title: "Commencez votre voyage",
                text: "Créez votre premier budget pour commencer à recevoir des conseils personnalisés.",
                type: 'info'
            });
            return adviceList;
        }

        budgetData.forEach(budget => {
            const percentage = (budget.totalTransactionsAmount / budget.totalBudgetAmount) * 100;

            if (percentage >= 100) {
                adviceList.push({
                    icon: <AlertTriangle className="text-red-500" />,
                    title: `Budget dépassé : ${budget.budgetName}`,
                    text: `Vous avez dépassé votre budget de ${Math.round(percentage - 100)}%. Envisagez de réduire vos dépenses dans cette catégorie le mois prochain.`,
                    type: 'error'
                });
            } else if (percentage >= 80) {
                adviceList.push({
                    icon: <AlertTriangle className="text-yellow-500" />,
                    title: `Attention : ${budget.budgetName}`,
                    text: `Vous avez utilisé ${Math.round(percentage)}% de votre budget. Il reste peu de marge, soyez vigilant !`,
                    type: 'warning'
                });
            } else if (percentage < 30 && budget.totalTransactionsAmount > 0) {
                adviceList.push({
                    icon: <CheckCircle className="text-green-500" />,
                    title: `Excellent travail : ${budget.budgetName}`,
                    text: `Vous gérez très bien ce budget (seulement ${Math.round(percentage)}% utilisé). Continuez comme ça !`,
                    type: 'success'
                });
            }
        });

        // General financial tips if not many alerts
        if (adviceList.length < 3) {
            adviceList.push({
                icon: <Lightbulb className="text-amber-500" />,
                title: "Conseil Épargne",
                text: "Essayez d'épargner au moins 20% de vos revenus chaque mois pour construire un fonds d'urgence.",
                type: 'info'
            });
            adviceList.push({
                icon: <Lightbulb className="text-amber-500" />,
                title: "Règle 50/30/20",
                text: "Considérez la règle 50% pour les besoins, 30% pour les envies et 20% pour l'épargne.",
                type: 'info'
            });
        }

        return adviceList.slice(0, 4); // Show top 4 advices
    };

    const advices = getAdvice();

    return (
        <div className="mt-6 border-2 border-base-300 p-5 rounded-xl bg-base-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-accent w-6 h-6" />
                <h3 className="text-xl font-bold italic text-accent">Conseiller Intelligent</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {advices.map((advice, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-lg bg-base-200/50 border border-base-300">
                        <div className="mt-1 flex-shrink-0">
                            {advice.icon}
                        </div>
                        <div>
                            <h4 className="font-bold text-md mb-1">{advice.title}</h4>
                            <p className="text-sm opacity-70 leading-relaxed font-medium italic">
                                "{advice.text}"
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BudgetAdvisor;
