# Parcel Bridge - Connect Senders with Train Passengers

A Progressive Web App (PWA) that connects parcel senders with verified train passengers for secure delivery across India.

## 🚀 Features

### For Senders
- Post parcel delivery requests with pickup/drop locations
- Real-time tracking and status updates
- Secure OTP-based handover verification
- Wallet-based escrow payments
- Rate and review carriers

### For Carriers
- Add train journeys via PNR verification
- Browse and accept matching parcel requests
- Earn money for deliveries along your route
- Secure collateral system for accountability
- Real-time chat with senders

### For Admins
- User verification and management
- Dispute resolution system
- Platform oversight and monitoring
- Aadhaar verification management

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with TypeScript and App Router
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Firebase Auth with phone OTP verification
- **Database**: Firestore for real-time data
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **PWA**: Next-PWA for service worker and offline support
- **Icons**: Heroicons and Lucide React
- **Payments**: Razorpay integration (planned)

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Authentication and Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd parcelbridge
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Firebase configuration and other API keys in `.env.local`.

4. Run the development server:
```bash
# With Turbopack (faster, recommended for development)
npm run dev

# Regular Next.js dev server (if needed)
npm run dev:regular

# Build for production
npm run build

# Build with bundle analysis
npm run build:analyze
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚡ Development Features

- **Turbopack**: Ultra-fast bundler for development (enabled by default)
- **Hot Reload**: Instant updates during development
- **Bundle Analysis**: Analyze your build with `npm run build:analyze`
- **TypeScript**: Full type safety and IntelliSense
- **ESLint**: Code quality and consistency checking

## 📱 PWA Features

- Installable on mobile devices
- Offline functionality with service worker
- Push notifications for real-time updates
- Responsive design optimized for mobile

## 🔐 Security Features

- Phone number verification via OTP
- Aadhaar verification for carriers
- Secure wallet system with escrow payments
- Real-time OTP verification for handovers
- Admin oversight and dispute resolution

## 🗃 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Role-based dashboards
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── providers/         # Context providers
│   └── ui/               # Basic UI components
├── lib/                  # Utilities and configurations
│   ├── firebase.ts       # Firebase configuration
│   ├── store.ts          # Zustand store
│   └── utils.ts          # Utility functions
└── types/                # TypeScript type definitions
```

## 🎨 Design System

The app uses a consistent color palette:
- **Primary**: Blue (#2563EB) for trust and security
- **Success**: Green (#10B981) for completed actions
- **Warning**: Amber (#F59E0B) for pending states
- **Danger**: Red (#EF4444) for errors and failures

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Vercel
```bash
npm run build
vercel --prod
```

## 📄 Environment Variables

Required environment variables:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Razorpay (for payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Indian Railway API (for PNR verification)
RAILWAY_API_KEY=
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@parcelbridge.com or join our Slack channel.

## 🔮 Roadmap

- [ ] Real-time GPS tracking
- [ ] In-app payment gateway integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Integration with more railway APIs
