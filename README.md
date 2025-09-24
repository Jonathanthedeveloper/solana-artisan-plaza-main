# Solana Artisan Plaza 🏛️

A premier NFT marketplace built on Solana blockchain, featuring lightning-fast transactions, zero gas fees, and a beautiful user interface for artists, collectors, and creators.

## ✨ Features

### 🚀 Core Functionality
- **NFT Creation & Minting**: Create NFTs with image upload, metadata, and attributes
- **Wallet Integration**: Support for Phantom, Solflare, Torus, and Ledger wallets
- **Real-time Search**: Search NFTs by name, description, or category
- **User Profiles**: Complete profile management with bio, avatar, and NFT portfolio
- **Transaction History**: Track all your NFT transactions
- **Dynamic Statistics**: Real-time marketplace stats from database

### 🎨 User Interface
- **Modern Design**: Glass-morphism effects with gradient backgrounds
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme switching
- **Smooth Animations**: Hover effects and transitions throughout
- **Loading States**: Proper loading indicators for all async operations

### 🔗 Blockchain Integration
- **Solana Devnet**: Configured for Solana development network
- **IPFS Storage**: Decentralized file storage for NFT assets
- **Supabase Database**: Real-time database for NFT metadata and user data
- **Wallet Adapters**: Multiple wallet connection options

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Blockchain**: Solana Web3.js + Wallet Adapters
- **Storage**: IPFS (Infura) + Supabase
- **State Management**: React Query for server state
- **Routing**: React Router v6

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd solana-artisan-plaza
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_INFURA_PROJECT_ID=your_infura_project_id
   VITE_INFURA_PROJECT_SECRET=your_infura_project_secret
   VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Navigation.tsx  # Main navigation
│   ├── Hero.tsx        # Landing page hero section
│   ├── CreateNFT.tsx   # NFT creation modal
│   ├── FeaturedCollections.tsx # NFT showcase
│   └── SearchResults.tsx # Search functionality
├── pages/              # Page components
│   ├── Index.tsx       # Home page
│   ├── Profile.tsx     # User profile page
│   └── NotFound.tsx    # 404 page
├── providers/          # Context providers
│   └── SolanaProvider.tsx # Solana wallet provider
├── services/           # Business logic services
│   ├── solanaService.ts # Solana blockchain interactions
│   ├── ipfsService.ts   # IPFS file storage
│   └── supabaseService.ts # Database operations
├── integrations/       # External service integrations
│   └── supabase/       # Supabase configuration
└── lib/                # Utilities
    └── utils.ts        # Helper functions
```

## 🔧 Configuration

### Database Schema
The project uses Supabase with the following tables:
- `nfts` - NFT metadata and ownership
- `users` - User profiles and wallet addresses
- `transactions` - Transaction history
- `collections` - NFT collections
- `collection_nfts` - Collection-NFT relationships

### Wallet Configuration
Supports multiple Solana wallets:
- Phantom
- Solflare
- Torus
- Ledger
- Sollet (Extension & Wallet)

### IPFS Configuration
Uses Infura IPFS for decentralized storage. Configure your project credentials in the `.env` file for production use.

## 🎯 Key Components

### CreateNFT Component
- Image upload with preview
- Metadata form (name, description, category, price, royalty)
- Attributes management
- IPFS upload and Solana minting
- Database storage

### SearchResults Component
- Real-time search functionality
- Category filtering
- NFT preview cards
- Purchase functionality

### Profile Page
- User profile management
- NFT portfolio display
- Transaction history
- Balance display
- Profile editing

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Netlify/Vercel
1. Connect your GitHub repository
2. Set environment variables in deployment settings
3. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Solana Labs](https://solana.com/) for the amazing blockchain
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Supabase](https://supabase.com/) for the backend
- [Infura](https://infura.io/) for IPFS hosting

## 📞 Support

For support, email support@solana-artisan-plaza.com or join our Discord community.

---

**Happy creating and collecting! 🎨✨**

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d756cf4f-277a-4b70-8f79-bd2358c620b2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
