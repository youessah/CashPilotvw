# GitHub Actions - Pipeline CI/CD

## 📋 Configuration

Un pipeline CI/CD a été mis en place avec GitHub Actions. Voici ce qu'il fait :

### Workflows disponibles :

#### 1. **ci.yml** - Pipeline principal (lancé à chaque push/PR)
- ✅ Tests sur Node 18.x et 20.x
- ✅ Installation des dépendances
- ✅ Linting avec ESLint
- ✅ Build Next.js
- ✅ Vérification des types TypeScript

#### 2. **deploy.yml** - Déploiement (après succès du CI)
- À personnaliser selon ta plateforme (Vercel, AWS, Docker, etc.)

---

## 🔐 Configurer les Secrets GitHub

Pour que le pipeline fonctionne avec tes variables d'environnement :

### Étapes :
1. Va sur ton repo GitHub
2. Clique sur **Settings** → **Secrets and variables** → **Actions**
3. Clique sur **New repository secret**
4. Ajoute les secrets suivants :

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = ta_clé_publique_clerk
CLERK_SECRET_KEY = ta_clé_secrète_clerk
DATABASE_URL = ton_url_base_de_données_prisma
```

### Trouver tes variables :
- **Clerk** : https://dashboard.clerk.com → Settings → API Keys
- **DATABASE_URL** : Fichier `.env.local`

---

## 🚀 Utilisation

### Le pipeline se déclenche automatiquement :
- À chaque **push** sur `main` ou `develop`
- À chaque **pull request** vers `main` ou `develop`

### Voir les résultats :
1. Va sur ton repo GitHub
2. Clique sur l'onglet **Actions**
3. Clique sur le workflow pour voir les détails

---

## 📝 Prochaines étapes

### 1. Ajouter des tests d'intégration
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### 2. Ajouter Prisma seed (optionnel)
```bash
npm install --save-dev @prisma/internals
```

### 3. Tests E2E (optionnel)
```bash
npm install --save-dev playwright
```

---

## ✨ Bonnes pratiques

- ✅ Push ton code en local et vérife le linting avant de pousser
- ✅ Crée des branches pour les features
- ✅ Utilise des PR pour review
- ✅ Le pipeline valide tout automatiquement

---

## 🛠️ Dépannage

### Erreur : "Workflow rejected"
→ Vérifie que tu as pushé le dossier `.github/workflows/`

### Erreur : "Secrets not found"
→ Ajoute les secrets dans Settings → Secrets

### Erreur : Build échoue
→ Regarde les logs détaillés dans l'onglet Actions

---

## 📚 Ressources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Next.js CI/CD Guide](https://nextjs.org/docs/deployment)
- [Jest Documentation](https://jestjs.io/)
