"use client";
import React, { useCallback, useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import EmojiPicker from "emoji-picker-react";
import { addBudget, getBudgetsByUser, generateAutoBudgets, BudgetMethod } from "../actions";
import Notification from "../components/Notification";
import { Budget } from "@/type";
import Link from "next/link";
import BudgetItem from "../components/BudgetItem";
import { Landmark, CheckCircle } from "lucide-react";

// Définition des méthodes budgétaires disponibles
const BUDGET_METHODS: {
  id: BudgetMethod;
  label: string;
  description: string;
  profil: string;
  needs: number;
  wants: number;
  savings: number;
  emoji: string;
  color: string;
}[] = [
  {
    id: "50/30/20",
    label: "50 / 30 / 20",
    description: "50% Besoins · 30% Envies · 20% Épargne",
    profil: "Profil standard, revenus stables",
    needs: 50,
    wants: 30,
    savings: 20,
    emoji: "⚖️",
    color: "border-accent text-accent",
  },
  {
    id: "70/20/10",
    label: "70 / 20 / 10",
    description: "70% Besoins · 20% Envies · 10% Épargne",
    profil: "Revenus modestes ou charges élevées",
    needs: 70,
    wants: 20,
    savings: 10,
    emoji: "🏠",
    color: "border-warning text-warning",
  },
  {
    id: "60/20/20",
    label: "60 / 20 / 20",
    description: "60% Besoins · 20% Envies · 20% Épargne",
    profil: "Focus épargne et prudence",
    needs: 60,
    wants: 20,
    savings: 20,
    emoji: "💰",
    color: "border-success text-success",
  },
  {
    id: "custom",
    label: "Personnalisé",
    description: "Définissez vos propres pourcentages",
    profil: "Autonomie totale selon vos besoins",
    needs: 0,
    wants: 0,
    savings: 0,
    emoji: "✏️",
    color: "border-info text-info",
  },
];

const Page = () => {
  const { user } = useUser();
  const [budgetName, setBudgetName] = useState<string>("");
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [totalIncome, setTotalIncome] = useState<string>("");
  const [notification, setNotification] = useState<string>("");

  // États pour la sélection de méthode
  const [selectedMethod, setSelectedMethod] = useState<BudgetMethod>("50/30/20");
  const [customNeeds, setCustomNeeds] = useState<string>("");
  const [customWants, setCustomWants] = useState<string>("");
  const [customSavings, setCustomSavings] = useState<string>("");

  const closeNotification = () => setNotification("");

  const handleEmojiSelect = (emojiObject: { emoji: string }) => {
    setSelectedEmoji(emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleAddBudget = async () => {
    try {
      const amount = parseFloat(budgetAmount);
      if (isNaN(amount) || amount <= 0) throw new Error("Le montant doit être un nombre positif.");
      await addBudget(user?.primaryEmailAddress?.emailAddress as string, budgetName, amount, selectedEmoji);
      fetchBudgets();
      const modal = document.getElementById("my_modal_3") as HTMLDialogElement;
      if (modal) modal.close();
      setNotification("Nouveau budget créé avec succès.");
      setBudgetName("");
      setBudgetAmount("");
      setSelectedEmoji("");
      setShowEmojiPicker(false);
    } catch (error) {
      setNotification(`Erreur : ${error}`);
    }
  };

  const fetchBudgets = useCallback(async () => {
    if (user?.primaryEmailAddress?.emailAddress) {
      try {
        const userBudgets = await getBudgetsByUser(user.primaryEmailAddress.emailAddress);
        setBudgets(userBudgets);
      } catch (error) {
        setNotification(`Erreur lors de la récupération des budgets: ${error}`);
      }
    }
  }, [user?.primaryEmailAddress?.emailAddress]);

  // Calcul de la prévisualisation
  const income = parseFloat(totalIncome) || 0;
  const activeMethod = BUDGET_METHODS.find((m) => m.id === selectedMethod)!;
  const previewNeeds =
    selectedMethod === "custom"
      ? income * ((parseFloat(customNeeds) || 0) / 100)
      : income * (activeMethod.needs / 100);
  const previewWants =
    selectedMethod === "custom"
      ? income * ((parseFloat(customWants) || 0) / 100)
      : income * (activeMethod.wants / 100);
  const previewSavings =
    selectedMethod === "custom"
      ? income * ((parseFloat(customSavings) || 0) / 100)
      : income * (activeMethod.savings / 100);

  const customTotal =
    (parseFloat(customNeeds) || 0) + (parseFloat(customWants) || 0) + (parseFloat(customSavings) || 0);
  const customValid = selectedMethod !== "custom" || Math.abs(customTotal - 100) < 0.01;

  const handleAutoGenerate = async () => {
    try {
      const amount = parseFloat(totalIncome);
      if (isNaN(amount) || amount <= 0) throw new Error("Le revenu doit être un nombre positif.");
      if (!customValid) throw new Error("Les pourcentages doivent totaliser exactement 100%.");

      await generateAutoBudgets(user?.primaryEmailAddress?.emailAddress as string, amount, {
        method: selectedMethod,
        needsPct: selectedMethod === "custom" ? parseFloat(customNeeds) : undefined,
        wantsPct: selectedMethod === "custom" ? parseFloat(customWants) : undefined,
        savingsPct: selectedMethod === "custom" ? parseFloat(customSavings) : undefined,
      });

      fetchBudgets();
      const modal = document.getElementById("auto_budget_modal") as HTMLDialogElement;
      if (modal) modal.close();
      setNotification("Budgets générés automatiquement avec succès !");
      setTotalIncome("");
      setCustomNeeds("");
      setCustomWants("");
      setCustomSavings("");
    } catch (error) {
      setNotification(`Erreur : ${error}`);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return (
    <Wrapper>
      {notification && <Notification message={notification} onclose={closeNotification} />}

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <button
          className="btn"
          onClick={() => (document.getElementById("my_modal_3") as HTMLDialogElement).showModal()}
        >
          Nouveau Budget
          <Landmark className="w-4" />
        </button>

        <button
          className="btn btn-outline btn-accent"
          onClick={() => (document.getElementById("auto_budget_modal") as HTMLDialogElement).showModal()}
        >
          Générer mon budget automatiquement
          <Landmark className="w-4" />
        </button>
      </div>

      {/* Modal création manuelle */}
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg">Création d&apos;un budget</h3>
          <p className="py-4">Permet de contrôler ces dépenses facilement</p>
          <div className="w-full flex flex-col">
            <input
              type="text"
              value={budgetName}
              placeholder="Nom du budget"
              onChange={(e) => setBudgetName(e.target.value)}
              className="input input-bordered mb-3"
              required
            />
            <input
              type="number"
              value={budgetAmount}
              placeholder="Montant"
              onChange={(e) => setBudgetAmount(e.target.value)}
              className="input input-bordered mb-3"
              required
            />
            <button className="btn mb-3" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              {selectedEmoji || "sélectionnez un emoji 🫵"}
            </button>
            {showEmojiPicker && (
              <div className="flex justify-center items-center my-4">
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </div>
            )}
            <button onClick={handleAddBudget} className="btn">
              Ajouter Budget
            </button>
          </div>
        </div>
      </dialog>

      {/* Modal génération automatique multi-méthodes */}
      <dialog id="auto_budget_modal" className="modal">
        <div className="modal-box max-w-2xl w-full">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>

          <h3 className="font-bold text-xl mb-1">Génération Automatique de Budget</h3>
          <p className="text-sm opacity-60 mb-5">
            Choisissez la méthode adaptée à votre profil financier, puis entrez votre revenu mensuel.
          </p>

          {/* Sélection de la méthode */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {BUDGET_METHODS.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                className={`relative flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedMethod === method.id
                    ? `${method.color} bg-base-200`
                    : "border-base-300 hover:border-base-content/30"
                }`}
              >
                {selectedMethod === method.id && (
                  <CheckCircle className="absolute top-2 right-2 w-4 h-4" />
                )}
                <span className="text-lg">{method.emoji}</span>
                <span className="font-bold text-sm">{method.label}</span>
                <span className="text-xs opacity-70">{method.description}</span>
                <span className="text-xs italic opacity-50">{method.profil}</span>
              </button>
            ))}
          </div>

          {/* Champs personnalisés (mode custom) */}
          {selectedMethod === "custom" && (
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <label className="text-xs opacity-60 mb-1 block">% Besoins</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={customNeeds}
                  onChange={(e) => setCustomNeeds(e.target.value)}
                  placeholder="ex: 55"
                  className="input input-bordered input-sm w-full"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs opacity-60 mb-1 block">% Envies</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={customWants}
                  onChange={(e) => setCustomWants(e.target.value)}
                  placeholder="ex: 25"
                  className="input input-bordered input-sm w-full"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs opacity-60 mb-1 block">% Épargne</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={customSavings}
                  onChange={(e) => setCustomSavings(e.target.value)}
                  placeholder="ex: 20"
                  className="input input-bordered input-sm w-full"
                />
              </div>
            </div>
          )}

          {/* Validation total custom */}
          {selectedMethod === "custom" && customNeeds && customWants && customSavings && (
            <div className={`text-xs mb-3 font-semibold ${customValid ? "text-success" : "text-error"}`}>
              Total : {customTotal}% {customValid ? "✅ OK" : `⚠️ Doit être égal à 100%`}
            </div>
          )}

          {/* Revenu mensuel */}
          <div className="mb-4">
            <label className="text-sm font-semibold mb-1 block">Revenu mensuel (FCFA)</label>
            <input
              type="number"
              value={totalIncome}
              placeholder="ex: 150 000"
              onChange={(e) => setTotalIncome(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Prévisualisation */}
          {income > 0 && (
            <div className="bg-base-200 rounded-xl p-4 mb-4">
              <p className="text-xs font-bold opacity-60 mb-2 uppercase tracking-wider">Aperçu de la répartition</p>
              <div className="flex justify-between gap-3">
                <div className="flex-1 text-center">
                  <div className="text-xs opacity-60">🏠 Besoins</div>
                  <div className="font-bold text-sm">{previewNeeds.toLocaleString("fr-FR")} FCFA</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xs opacity-60">🎬 Envies</div>
                  <div className="font-bold text-sm">{previewWants.toLocaleString("fr-FR")} FCFA</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xs opacity-60">💰 Épargne</div>
                  <div className="font-bold text-sm">{previewSavings.toLocaleString("fr-FR")} FCFA</div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleAutoGenerate}
            className="btn btn-accent text-white font-bold w-full"
            disabled={!customValid}
          >
            Générer et Répartir instantanément !
          </button>
        </div>
      </dialog>

      <ul className="grid md:grid-cols-3 gap-4">
        {budgets.map((budget) => (
          <Link href={`/manage/${budget.id}`} key={budget.id}>
            <BudgetItem budget={budget} enableHover={1} />
          </Link>
        ))}
      </ul>
    </Wrapper>
  );
};

export default Page;
