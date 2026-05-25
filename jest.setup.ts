// jest.setup.ts
import '@testing-library/jest-dom'

// Mock de Clerk pour les tests
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn(() => ({ userId: 'test-user-id' })),
  currentUser: jest.fn(),
}))

// Mock de variables d'environnement
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key'
