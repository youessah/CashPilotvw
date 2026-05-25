#!/usr/bin/env pwsh

<#
.SYNOPSIS
Script pour ajouter automatiquement les secrets GitHub

.DESCRIPTION
Ce script utilise le CLI GitHub (gh) pour ajouter les secrets au repo

.EXAMPLE
./add-github-secrets.ps1
#>

Write-Host "🔐 Configuration des secrets GitHub" -ForegroundColor Cyan
Write-Host ""

# Vérifier si gh CLI est installé
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI n'est pas installé" -ForegroundColor Red
    Write-Host "Installe-le depuis: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Vérifier si connecté à GitHub
try {
    gh auth status | Out-Null
} catch {
    Write-Host "❌ Non connecté à GitHub" -ForegroundColor Red
    Write-Host "Exécute: gh auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "📝 Entre tes informations:" -ForegroundColor Cyan
Write-Host ""

# Demander les secrets
$clerkPublic = Read-Host "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
if ([string]::IsNullOrWhiteSpace($clerkPublic)) {
    Write-Host "❌ Clé Clerk publique requise" -ForegroundColor Red
    exit 1
}

$clerkSecret = Read-Host "CLERK_SECRET_KEY"
if ([string]::IsNullOrWhiteSpace($clerkSecret)) {
    Write-Host "❌ Clé Clerk secrète requise" -ForegroundColor Red
    exit 1
}

$databaseUrl = Read-Host "DATABASE_URL"
if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    Write-Host "❌ DATABASE_URL requise" -ForegroundColor Red
    exit 1
}

# Ajouter les secrets
Write-Host ""
Write-Host "✨ Ajout des secrets..." -ForegroundColor Cyan

try {
    gh secret set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY --body $clerkPublic
    Write-Host "✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ajouté" -ForegroundColor Green
    
    gh secret set CLERK_SECRET_KEY --body $clerkSecret
    Write-Host "✅ CLERK_SECRET_KEY ajouté" -ForegroundColor Green
    
    gh secret set DATABASE_URL --body $databaseUrl
    Write-Host "✅ DATABASE_URL ajouté" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "✅ Tous les secrets ont été ajoutés avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "1. Pousse ton code: git push" -ForegroundColor Yellow
    Write-Host "2. Regarde les actions: https://github.com/[ton-repo]/actions" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Erreur lors de l'ajout des secrets: $_" -ForegroundColor Red
    exit 1
}
