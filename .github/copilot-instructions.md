# Parcel-Bridge PWA - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
Parcel-Bridge is a Progressive Web App (PWA) that connects parcel senders with train passengers (carriers) for delivery services across India.

## Tech Stack
- **Frontend**: Next.js 14 with TypeScript and App Router
- **Styling**: Tailwind CSS with custom color palette
- **Authentication**: Firebase Auth with phone OTP verification
- **Database**: Firestore for real-time data
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **PWA**: Next-PWA for service worker and manifest
- **Icons**: Heroicons and Lucide React

## Color Palette
- Primary: #2563EB (Blue-600)
- Primary Light: #3B82F6 (Blue-500) 
- Success: #10B981 (Emerald-500)
- Warning: #F59E0B (Amber-500)
- Danger: #EF4444 (Red-500)
- Text Primary: #111827 (Gray-900)
- Text Secondary: #6B7280 (Gray-500)
- Background: #F9FAFB (Gray-50)

## User Roles
1. **Sender**: Posts parcel delivery requests, tracks delivery, pays via wallet
2. **Carrier**: Adds train journey via PNR, accepts parcel requests, delivers parcels
3. **Admin**: Oversees platform operations, user verification, dispute resolution

## Key Features
- Multi-role authentication with phone OTP
- Real-time parcel tracking
- Wallet management with escrow payments
- OTP-based secure handover
- PNR-based journey matching
- In-app chat system
- Admin dashboard for oversight

## Code Standards
- Use TypeScript with strict type checking
- Follow Next.js App Router conventions
- Implement responsive design with mobile-first approach
- Use Tailwind utility classes consistently
- Implement proper error handling and loading states
- Follow React best practices with hooks and components
- Use Firestore security rules for data protection

## File Structure
- `src/app/` - Next.js App Router pages
- `src/components/` - Reusable UI components
- `src/lib/` - Utilities, Firebase config, and store
- `src/types/` - TypeScript type definitions
- `src/hooks/` - Custom React hooks
- `public/` - Static assets and PWA files
