# AI Coding Agent Instructions for Solana Artisan Plaza

## Project Overview
**Solana Artisan Plaza** is a modern NFT marketplace built on Solana blockchain featuring:
- React 18 + TypeScript + Vite frontend
- Solana Web3.js integration with wallet adapters (Phantom, Solflare, Torus, Ledger)
- Supabase real-time database for metadata and user data
- IPFS (Infura) for decentralized file storage
- shadcn/ui + Tailwind CSS for modern UI components
- React Query for server state management

## Architecture Patterns

### Service Layer Pattern
Business logic is organized in `src/services/` with static classes:
- `SolanaService` - Blockchain interactions, NFT minting/purchasing
- `SupabaseService` - Database operations with typed interfaces
- `IPFSService` - File upload and metadata storage

**Example usage:**
```typescript
// Always use service classes for business logic
const nft = await SupabaseService.createNFT(nftData);
const transaction = await SolanaService.purchaseNFT(wallet, nftId, price, seller);
```

### Provider Pattern
Wallet context is provided via `SolanaProvider` wrapping the entire app:
```typescript
// Access wallet in components
const { publicKey, signTransaction, connected } = useWallet();
```

### Component Structure
- Use shadcn/ui components from `src/components/ui/`
- Import with absolute paths: `@/components/ui/button`
- Follow established patterns in existing components like `CreateNFT.tsx`

## Critical Workflows

### Environment Setup
```bash
# Copy and configure environment variables
cp .env.example .env
# Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_INFURA_PROJECT_ID
```

### Development Commands
```bash
bun run dev              # Start Vite dev server
bun run build           # Production build
bun run type-check      # TypeScript validation
bun run lint           # ESLint checking
bun run supabase:start  # Start local Supabase
bun run supabase:generate-types  # Update TypeScript types
```

### Database Schema
Key tables in `supabase/migrations/`:
- `nfts` - NFT metadata, ownership, pricing
- `users` - Wallet addresses, profiles
- `transactions` - Purchase history
- `collections` - NFT collections
- `collection_nfts` - Many-to-many relationships

## Code Conventions

### File Organization
```
src/
├── components/     # UI components (use shadcn/ui)
├── pages/         # Route components
├── services/      # Business logic (static classes)
├── providers/     # React context providers
├── hooks/         # Custom React hooks
├── lib/           # Utilities (utils.ts)
└── integrations/  # External service configs
```

### Import Patterns
```typescript
// Absolute imports with @ alias
import { Button } from "@/components/ui/button";
import SolanaService from "@/services/solanaService";

// Type imports for database types
import type { NFT } from "@/integrations/supabase/types";
```

### Error Handling
```typescript
// Use sonner for user notifications
import { toast } from "sonner";

try {
  // Operation
  toast.success("NFT created successfully!");
} catch (error) {
  console.error("Error:", error);
  toast.error("Failed to create NFT");
}
```

### TypeScript Patterns
- Use interfaces for component props
- Leverage Supabase generated types from `src/integrations/supabase/types.ts`
- Define service method return types explicitly

## Blockchain Integration

### Wallet Connection
```typescript
// Check wallet connection before operations
if (!wallet.publicKey || !wallet.signTransaction) {
  toast.error("Please connect your wallet first");
  return null;
}
```

### NFT Metadata Standard
Follow the `NFTMetadata` interface in `IPFSService`:
- Required: name, description, image, attributes, category
- Optional: external_url, animation_url, royalty_percentage
- Categories: "digital-art", "collectibles", "photography", "video", "audio", "3d-models"

### Transaction Flow
1. Validate wallet connection
2. Create Solana transaction
3. Update Supabase database
4. Show user feedback with toast notifications

## UI/UX Patterns

### Styling
- Use Tailwind CSS classes with shadcn/ui components
- Follow the established color scheme with CSS variables
- Implement responsive design with mobile-first approach

### Form Handling
```typescript
// Use react-hook-form for complex forms
const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

// File upload with preview state
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string>("");
```

### Loading States
```typescript
const [loading, setLoading] = useState(false);

// Show loading indicators during async operations
<Button disabled={loading}>
  {loading ? <Loader2 className="animate-spin" /> : "Create NFT"}
</Button>
```

## Database Operations

### Query Patterns
```typescript
// Use SupabaseService for all database operations
const nfts = await SupabaseService.getNFTs({
  limit: 20,
  category: "digital-art",
  sortBy: "created_at"
});
```

### Real-time Subscriptions
```typescript
// For real-time updates
const channel = supabase
  .channel('nfts')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'nfts' }, callback)
  .subscribe();
```

## Deployment Considerations

### Environment Variables
Production requires:
- `VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com`
- Valid Supabase and Infura credentials
- Proper IPFS configuration for production

### Build Optimization
- Use `npm run build:prod` for production builds
- Ensure all assets are properly optimized
- Test wallet connections on mainnet before deployment

## Common Pitfalls

1. **Wallet Connection**: Always check `wallet.publicKey` and `wallet.signTransaction` before blockchain operations
2. **Environment Variables**: Use `VITE_` prefix for client-side variables only
3. **Type Safety**: Leverage Supabase generated types to maintain type safety
4. **Error Boundaries**: Wrap async operations with proper error handling
5. **File Uploads**: Handle IPFS uploads with progress indicators and error states

## Key Files to Reference

- `src/services/solanaService.ts` - Blockchain interaction patterns
- `src/services/supabaseService.ts` - Database operation examples
- `src/components/CreateNFT.tsx` - Complex form handling
- `src/providers/SolanaProvider.tsx` - Wallet provider setup
- `supabase/migrations/` - Database schema understanding
- `tailwind.config.ts` - Styling configuration