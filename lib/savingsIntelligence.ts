import { SavingsGoal } from "@/type";

/**
 * Calcule l'effort mensuel nécessaire pour atteindre un objectif
 */
export function calculateMonthlyEffort(goal: SavingsGoal): number | null {
    if (!goal.deadline) return null;
    
    const now = new Date();
    const deadline = new Date(goal.deadline);
    
    // Si la date est passée ou aujourd'hui
    if (deadline <= now) return null;
    
    const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0);
    if (remainingAmount === 0) return 0;

    // Calcul de la différence en mois
    const diffInMs = deadline.getTime() - now.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    const months = diffInDays / 30.44; // Moyenne de jours par mois

    return Math.ceil(remainingAmount / Math.max(months, 1)); // Au moins 1 mois pour éviter division par 0
}

/**
 * Détermine le statut proactif d'un objectif
 */
export function getProactiveStatus(goal: SavingsGoal) {
    const monthlyNeeded = calculateMonthlyEffort(goal);
    if (!monthlyNeeded) return { status: 'stable', message: null };

    // Si l'effort mensuel est supérieur à 50% de la cible totale, c'est critique
    if (monthlyNeeded > goal.targetAmount * 0.5) {
        return { 
            status: 'critical', 
            message: "Action requise : l'effort mensuel est très élevé par rapport au temps restant." 
        };
    }

    // Si moins de 2 mois restants et moins de 50% atteint
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    const now = new Date();
    const deadline = goal.deadline ? new Date(goal.deadline) : null;
    const diffInMonths = deadline ? (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44) : Infinity;

    if (diffInMonths < 2 && percentage < 50) {
        return { 
            status: 'warning', 
            message: "Attention : vous êtes en retard. Augmentez vos participations ce mois-ci." 
        };
    }

    return { status: 'healthy', message: "En bonne voie." };
}

/**
 * Suggère un transfert depuis un budget excédentaire (logique locale)
 */
export function suggestBudgetTransfer(budgetData: { name: string; remaining: number }[]) {
    // On cherche les budgets "non essentiels" avec un excédent significatif (> 5000)
    const nonEssentialKeywords = ["loisir", "envie", "shopping", "cinéma", "restaurant", "café", "netflix"];
    
    const potentialBudgets = budgetData.filter(b => 
        nonEssentialKeywords.some(kw => b.name.toLowerCase().includes(kw)) && b.remaining > 5000
    );

    if (potentialBudgets.length > 0) {
        const bestSource = potentialBudgets.sort((a, b) => b.remaining - a.remaining)[0];
        return {
            source: bestSource.name,
            amount: Math.floor(bestSource.remaining * 0.5), // Suggérer 50% du restant
            message: `Vous avez ${bestSource.remaining} FCFA restants dans "${bestSource.name}". Pourquoi ne pas transférer ${Math.floor(bestSource.remaining * 0.5)} FCFA vers votre épargne ?`
        };
    }

    return null;
}
