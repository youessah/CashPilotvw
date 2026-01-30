# FindTrack 💰

FindTrack est une application moderne de gestion de budget personnel conçue pour vous aider à suivre vos finances, gérer vos budgets et planifier votre épargne avec élégance.

![Dashboard Preview](https://placehold.co/600x400?text=FindTrack+Preview)

## 🚀 Fonctionnalités Clés

- **Tableau de Bord Intuitif** : Vue d'ensemble de vos finances avec graphiques interactifs.
- **Gestion de Budget** : Créez et suivez des budgets par catégorie avec des emojis.
- **Suivi des Transactions** : Ajoutez des dépenses et revenus en temps réel.
- **Transactions Récurrentes** : Automatisez vos factures et abonnements (loyer, netflix, etc.) avec rattrapage automatique.
- **Objectifs d'Épargne** : Définissez et suivez vos projets d'épargne.
- **Rapports PDF** : Exportez vos données financières en un clic.
- **Design Premium** : Interface sombre moderne avec effets glassmorphism.

## 🛠️ Stack Technique

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Base de Données** : SQLite (via Prisma ORM)
- **Authentification** : Clerk
- **Styling** : TailwindCSS + DaisyUI
- **Icônes** : Lucide React

## 📦 Installation

1.  **Cloner le projet**
    ```bash
    git clone https://github.com/votre-user/find-track.git
    cd find-track
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Configurer les variables d'environnement**
    Créez un fichier `.env` à la racine et ajoutez vos clés (notamment pour Clerk et Database URL).
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...
    DATABASE_URL="file:./dev.db"
    ```

4.  **Initialiser la base de données**
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Lancer le serveur de développement**
    ```bash
    npm run dev
    ```
    Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## global.css
Le projet utilise un thème sombre par défaut défini dans `app/globals.css`.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une Pull Request.

---
Développé avec ❤️ pour une gestion financière simplifiée.
