"use server"

import prisma from "@/lib/prisma";


export async function checkAndAddUser(email: string | undefined) {
    if (!email) return
    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (!existingUser) {
            await prisma.user.create({
                data: { email }
            })
            console.log("Nouvel utilisateur ajouté dans la base de données")
        } else {
            console.log("Utilisateur déjà présent dans la base de données")
        }

    } catch (error) {
        console.error("Erreur lors de la vérification de l'utilisateur:", error);
    }

}


export async function addBudget(email: string, name: string, amount: number, selectedEmoji: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            throw new Error('Utilisateur non trouvé')
        }

        await prisma.budget.create({
            data: {
                name,
                amount,
                emoji: selectedEmoji,
                userId: user.id
            }
        })
    } catch (error) {
        console.error('Erreur lors de l\'ajout du budget:', error);
        throw error
    }
}


export async function getBudgetsByUser(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            },
            include: {
                budgets: {
                    include: {
                        transactions: true
                    }
                }
            }

        })

        if (!user) {
            throw new Error("Utilisateur non trouvé")
        }
        return user.budgets
    } catch (error) {
        console.error('Erreur lors de la récupération des budgets:', error);
        throw error;
    }
}


export async function getTrasactionsByBudgetId(budgetId: string) {
    try {
        const budget = await prisma.budget.findUnique({
            where: {
                id: budgetId
            },
            include: {
                transactions: true
            }
        })
        if (!budget) {
            throw new Error('Budget non trouvé.');
        }

        return budget;
    } catch (error) {
        console.error('Erreur lors de la récupération des transactions:', error);
        throw error;
    }
}


export async function addTransactionToBudget(
    budgetId: string,
    amount: number,
    description: string

) {

    try {

        const budget = await prisma.budget.findUnique({
            where: {
                id: budgetId
            },
            include: {
                transactions: true
            }
        })

        if (!budget) {
            throw new Error('Budget non trouvé.');
        }

        const totalTransactions = budget.transactions.reduce((sum, transaction) => {
            return sum + transaction.amount
        }, 0)

        const totalWithNewTransaction = totalTransactions + amount

        if (totalWithNewTransaction > budget.amount) {
            throw new Error('Le montant total des transactions dépasse le montant du budget.');
        }

        await prisma.transaction.create({
            data: {
                amount,
                description,
                emoji: budget.emoji,
                budget: {
                    connect: {
                        id: budget.id
                    }
                }
            }
        })

    } catch (error) {
        console.error('Erreur lors de l\'ajout de la transaction:', error);
        throw error;
    }
}

export const deleteBudget = async (budgetId: string) => {
    try {
        await prisma.transaction.deleteMany({
            where: { budgetId }
        })

        await prisma.budget.delete({
            where: {
                id: budgetId
            }
        })
    } catch (error) {
        console.error('Erreur lors de la suppression du budget et de ses transactions associées: ', error);
        throw error;
    }
}

export async function deleteTransaction(transactionId: string) {
    try {
        console.log(" id de la transact", transactionId)
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: transactionId
            }
        })

        if (!transaction) {
            throw new Error('Transaction non trouvée.');
        }

        await prisma.transaction.delete({
            where: {
                id: transactionId,
            },
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de la transaction:', error);
        throw error;
    }
}

export async function getTransactionsByEmailAndPeriod(email: string, period: string) {
    try {
        const now = new Date();
        let dateLimit

        switch (period) {
            case 'last30':
                dateLimit = new Date(now)
                dateLimit.setDate(now.getDate() - 30);
                break
            case 'last90':
                dateLimit = new Date(now)
                dateLimit.setDate(now.getDate() - 90);
                break
            case 'last7':
                dateLimit = new Date(now)
                dateLimit.setDate(now.getDate() - 7);
                break
            case 'last365':
                dateLimit = new Date(now)
                dateLimit.setFullYear(now.getFullYear() - 1);
                break
            default:
                throw new Error('Période invalide.');
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                budgets: {
                    include: {
                        transactions: {
                            where: {
                                createdAt: {
                                    gte: dateLimit
                                }
                            },
                            orderBy: {
                                createdAt: 'desc'
                            }
                        }
                    }

                }
            }
        })


        if (!user) {
            throw new Error('Utilisateur non trouvé.');
        }

        const transactions = user.budgets.flatMap(budget =>
            budget.transactions.map(transaction => ({
                ...transaction,
                budgetName: budget.name,
                budgetId: budget.id
            }))
        )

        return transactions

    } catch (error) {
        console.error('Erreur lors de la récupération des transactions:', error);
        throw error;
    }
}

//dashboard

export async function getTotalTransactionAmount(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                budgets: {
                    include: {
                        transactions: true
                    }
                }
            }
        })

        if (!user) throw new Error("Utilisateur non trouvé");

        const totalAmount = user.budgets.reduce((sum, budgets) => {
            return sum + budgets.transactions.reduce((budjeSum, transaction) => budjeSum + transaction.amount, 0)
        }, 0)

        return totalAmount

    } catch (error) {
        console.error("Erreur lors du calcul du montant total des transactions:", error);
        throw error;
    }
}

export async function getTotalTransactionCount(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                budgets: {
                    include: {
                        transactions: true
                    }
                }
            }
        })

        if (!user) throw new Error("Utilisateur non trouvé");

        const totalCount = user.budgets.reduce((count, budget) => {
            return count + budget.transactions.length
        }, 0)

        return totalCount
    } catch (error) {
        console.error("Erreur lors du comptage des transactions:", error);
        throw error;
    }

}


export async function getReachedBudgets(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                budgets: {
                    include: {
                        transactions: true
                    }
                }
            }
        })

        if (!user) throw new Error("Utilisateur non trouvé");

        const totalBudgets = user.budgets.length;
        const reachedBudgets = user.budgets.filter(budget => {
            const totalTransactionsAmount = budget.transactions.
                reduce((sum, transaction) => sum + transaction.amount, 0)
            return totalTransactionsAmount >= budget.amount
        }).length

        return `${reachedBudgets}/${totalBudgets}`
    } catch (error) {
        console.error("Erreur lors du calcul des budgets atteints:", error);
        throw error;
    }

}

export async function getUserBudgetData(email: string) {
    try {

        const user = await prisma.user.findUnique({
            where: { email },
            include: { budgets: { include: { transactions: true } } },
        });

        if (!user) {
            throw new Error("Utilisateur non trouvé.");
        }

        const data = user.budgets.map(budget => {
            const totalTransactionsAmount = budget.transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
            return {
                budgetName: budget.name,
                totalBudgetAmount: budget.amount,
                totalTransactionsAmount
            }
        })

        return data

    } catch (error) {
        console.error("Erreur lors de la récupération des données budgétaires:", error);
        throw error;
    }
}

export const getLastTransactions = async (email: string) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                budget: {
                    user: {
                        email: email
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
            include: {
                budget: {
                    select: {
                        name: true
                    }
                }
            }

        })

        const transactionsWithBudgetName = transactions.map(transaction => ({
            ...transaction,
            budgetName: transaction.budget?.name || 'N/A',
        }));


        return transactionsWithBudgetName

    } catch (error) {
        console.error('Erreur lors de la récupération des dernières transactions: ', error);
        throw error;
    }
}

export const getLastBudgets = async (email: string) => {
    try {
        const budgets = await prisma.budget.findMany({
            where: {
                user: {
                    email
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 3,
            include: {
                transactions: true
            }

        })

        return budgets

    } catch (error) {
        console.error('Erreur lors de la récupération des derniers budgets: ', error);
        throw error;
    }
}

export async function addRecurringTransaction(
    budgetId: string,
    amount: number,
    description: string,
    frequency: string
) {
    try {
        await prisma.recurringTransaction.create({
            data: {
                budgetId,
                amount,
                description,
                frequency,
                startDate: new Date(),
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la transaction récurrente:', error);
        throw error;
    }
}

export async function syncRecurringTransactions(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                budgets: {
                    include: {
                        recurringTransactions: true
                    }
                }
            }
        });

        if (!user) throw new Error("Utilisateur non trouvé");

        const budgets = user.budgets;

        for (const budget of budgets) {
            for (const recurring of budget.recurringTransactions) {
                const now = new Date(); // Date actuelle
                let nextExecutionDate = new Date(recurring.lastExecuted || recurring.startDate);

                // Fonction pour calculer la prochaine date d'exécution
                const calculateNextDate = (date: Date, frequency: string) => {
                    const nextDate = new Date(date);
                    if (frequency === 'DAILY') {
                        nextDate.setDate(nextDate.getDate() + 1);
                    } else if (frequency === 'WEEKLY') {
                        nextDate.setDate(nextDate.getDate() + 7);
                    } else if (frequency === 'MONTHLY') {
                        nextDate.setMonth(nextDate.getMonth() + 1);
                    }
                    return nextDate;
                };

                // Avancer à la première date d'exécution prévue
                nextExecutionDate = calculateNextDate(nextExecutionDate, recurring.frequency);

                // Boucle de rattrapage : Tant que la prochaine date est passée (<= now)
                while (nextExecutionDate <= now) {
                    // Créer la transaction
                    await prisma.transaction.create({
                        data: {
                            amount: recurring.amount,
                            description: recurring.description,
                            emoji: budget.emoji,
                            budgetId: budget.id
                        }
                    });

                    // Mettre à jour la date de dernière exécution
                    await prisma.recurringTransaction.update({
                        where: { id: recurring.id },
                        data: { lastExecuted: nextExecutionDate }
                    });

                    // Calculer la prochaine date pour la suite de la boucle
                    nextExecutionDate = calculateNextDate(nextExecutionDate, recurring.frequency);
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors de la synchronisation des transactions récurrentes:', error);
    }
}

export async function getRecurringTransactionsByBudget(budgetId: string) {
    try {
        const transactions = await prisma.recurringTransaction.findMany({
            where: { budgetId },
        });
        return transactions;
    } catch (error) {
        console.error('Erreur lors de la récupération des transactions récurrentes:', error);
        throw error;
    }
}

export async function deleteRecurringTransaction(transactionId: string) {
    try {
        await prisma.recurringTransaction.delete({
            where: { id: transactionId },
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de la transaction récurrente:', error);
        throw error;
    }
}

export async function addSavingsGoal(email: string, name: string, targetAmount: number, deadline: Date | null) {
    try {
        await prisma.savingsGoal.create({
            data: {
                name,
                targetAmount,
                deadline,
                userEmail: email
            }
        })
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'objectif d\'épargne:', error);
        throw error
    }
}

export async function getSavingsGoals(email: string) {
    try {
        const goals = await prisma.savingsGoal.findMany({
            where: { userEmail: email },
            orderBy: { createdAt: 'desc' }
        })
        return goals
    } catch (error) {
        console.error('Erreur lors de la récupération des objectifs d\'épargne:', error);
        throw error
    }
}

export async function updateSavingsGoalAmount(goalId: string, amount: number) {
    try {
        await prisma.savingsGoal.update({
            where: { id: goalId },
            data: {
                currentAmount: {
                    increment: amount
                }
            }
        })
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'objectif d\'épargne:', error);
        throw error
    }
}

export async function deleteSavingsGoal(goalId: string) {
    try {
        await prisma.savingsGoal.delete({
            where: { id: goalId }
        })
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'objectif d\'épargne:', error);
        throw error
    }
}





export async function updateBudget(
    budgetId: string,
    name: string,
    amount: number,
    emoji: string
) {
    try {
        await prisma.budget.update({
            where: { id: budgetId },
            data: {
                name,
                amount,
                emoji
            }
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du budget:', error);
        throw error;
    }
}

export async function updateTransaction(
    transactionId: string,
    amount: number,
    description: string
) {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { budget: true }
        });

        if (!transaction || !transaction.budget) {
            throw new Error('Transaction ou budget introuvable');
        }

        // Optional: Check if new amount exceeds budget (logic depends on requirements, strict or lenient)
        // For now, we allow update, but in a real app might want to re-check total.

        await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                amount,
                description
            }
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la transaction:', error);
        throw error;
    }
}

export async function generateAutoBudgets(email: string, totalIncome: number) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { budgets: true }
        });

        if (!user) throw new Error("Utilisateur introuvable");

        const needsAmount = totalIncome * 0.50;
        const wantsAmount = totalIncome * 0.30;
        const savingsAmount = totalIncome * 0.20;

        await prisma.budget.createMany({
            data: [
                { name: "Besoins (50%)", amount: needsAmount, emoji: "🏠", userId: user.id },
                { name: "Envies (30%)", amount: wantsAmount, emoji: "🎬", userId: user.id },
                { name: "Épargne (20%)", amount: savingsAmount, emoji: "💰", userId: user.id },
            ]
        });

        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la génération automatique des budgets", error);
        throw error;
    }
}

export async function getSmartCategorization(email: string, description: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { budgets: true }
        });

        if (!user || user.budgets.length === 0) return null;

        const descLower = description.toLowerCase();

        // Keywords mapping
        const keywords: Record<string, string[]> = {
            "Besoins": ["supermarché", "courses", "loyer", "facture", "électricité", "eau", "carrefour", "auchan", "pharmacie", "santé", "transport", "bus", "train", "essence", "alimentation"],
            "Envies": ["restaurant", "cinéma", "sortie", "shopping", "vêtements", "netflix", "spotify", "loisir", "bar", "café", "fastfood", "glace"],
            "Épargne": ["épargne", "investissement", "bourse", "crypto", "livret", "économie", "banque"]
        };

        // 1. Custom budget names check (direct match)
        for (const budget of user.budgets) {
            if (descLower.includes(budget.name.toLowerCase())) {
                return budget;
            }
        }

        // 2. Smart matching via keywords
        for (const [category, words] of Object.entries(keywords)) {
            if (words.some(word => descLower.includes(word))) {
                // Find a budget that matches this category (e.g., "Besoins (50%)")
                const matchedBudget = user.budgets.find(b => b.name.toLowerCase().includes(category.toLowerCase()));
                if (matchedBudget) return matchedBudget;
                // Otherwise try to find any budget that is likely a need
                if (category === "Besoins") {
                    const fallback = user.budgets.find(b => b.name.toLowerCase().includes("aliment") || b.name.toLowerCase().includes("course"));
                    if (fallback) return fallback;
                }
            }
        }

        return user.budgets[0]; // fallback to first budget
    } catch (error) {
        console.error("Erreur lors de la catégorisation intelligente", error);
        return null;
    }
}

export async function getBudgetInsights(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { budgets: { include: { transactions: true } } }
        });

        if (!user) throw new Error("Utilisateur introuvable");

        let totalBudget = 0;
        let totalSpent = 0;
        const warnings: string[] = [];

        user.budgets.forEach(budget => {
            totalBudget += budget.amount;
            const spent = budget.transactions.reduce((sum, t) => sum + t.amount, 0);
            totalSpent += spent;

            if (budget.amount > 0 && (spent / budget.amount) >= 0.9) {
                warnings.push(budget.name);
            }
        });

        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const remainingDays = daysInMonth - now.getDate() + 1; // including today

        const remainingBudget = Math.max(0, totalBudget - totalSpent);
        const dailyAllowance = remainingDays > 0 ? Math.floor(remainingBudget / remainingDays) : 0;

        return {
            dailyAllowance,
            warnings
        };
    } catch (error) {
        console.error("Erreur insights", error);
        return { dailyAllowance: 0, warnings: [] };
    }
}
