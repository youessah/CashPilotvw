# 🔐 Guide - Configuration des Secrets GitHub

## ✅ État actuel
Le pipeline **fonctionne même sans secrets** (avec des valeurs par défaut de test).
Mais pour **un environnement réel**, tu dois ajouter les vraies clés.

---

## 🚀 Option 1 : Ajouter les secrets rapidement (Recommandé)

### Prérequis
- GitHub CLI installé : https://cli.github.com/
- Connecté à GitHub : `gh auth login`

### Commande
```powershell
.\add-github-secrets.ps1
```

Le script te demandera les 3 secrets et les ajoutera automatiquement.

---

## 📱 Option 2 : Ajouter les secrets manuellement

### Étape 1 : Va sur GitHub
1. Ouvre ton repo sur GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Clique sur **New repository secret**

### Étape 2 : Ajoute chaque secret

#### Secret 1 : NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- **Name** : `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **Value** : Ta clé publique Clerk
- [Où la trouver ?](https://dashboard.clerk.com/apps/[ton-app]/settings/api-keys)

#### Secret 2 : CLERK_SECRET_KEY  
- **Name** : `CLERK_SECRET_KEY`
- **Value** : Ta clé secrète Clerk

#### Secret 3 : DATABASE_URL
- **Name** : `DATABASE_URL`
- **Value** : Ton URL de connexion Prisma
- **Format** : `postgresql://user:password@host:port/database`

---

## 🔍 Vérifier que les secrets sont ajoutés

```powershell
gh secret list
```

Tu devrais voir :
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  Updated 2 minutes ago
CLERK_SECRET_KEY                   Updated 2 minutes ago
DATABASE_URL                       Updated 2 minutes ago
```

---

## 🛠️ Trouver tes clés

### Clerk
1. Va sur https://dashboard.clerk.com
2. Clique sur ton app
3. **Settings** → **API Keys**
4. Copie :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### Prisma (DATABASE_URL)
Regarde ton fichier `.env.local` :
```
DATABASE_URL="postgresql://user:password@localhost:5432/cashpilot"
```

---

## ⚙️ Configuration du workflow

Le workflow `ci.yml` va :
1. Utiliser les secrets réels si disponibles
2. Sinon, utiliser les valeurs de test par défaut

Pour utiliser les secrets en production :

```yaml
# Dans .github/workflows/ci.yml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
```

---

## ✅ Une fois les secrets ajoutés

```bash
git add .
git commit -m "Add CI/CD pipeline with secrets"
git push origin main
```

Regarde les actions : **Actions** → Cherche le workflow `CI/CD Pipeline`

---

## 🆘 Dépannage

### "Secrets not found"
→ Vérifie que les secrets sont bien ajoutés dans GitHub Settings

### "Build failed"  
→ Regarde les logs du workflow pour les erreurs exactes

### "Permission denied"
→ Assure-toi que `gh` est bien authentifié : `gh auth status`

---

## 📚 Ressources

- [GitHub Secrets Docs](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [GitHub CLI Docs](https://cli.github.com/manual/)
- [Clerk API Keys](https://clerk.com/docs/reference/backend-api/tag/API-Keys)
- [Prisma DATABASE_URL](https://www.prisma.io/docs/reference/database-reference/connection-urls)
