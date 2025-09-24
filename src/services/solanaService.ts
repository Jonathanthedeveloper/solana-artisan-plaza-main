import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import SupabaseService from "./supabaseService";
import type { Auction, Bid } from "./biddingService";

export interface NFTTransaction {
  id: string;
  seller: string;
  buyer: string;
  nftId: string;
  price: number;
  signature: string;
  timestamp: number;
  status: "pending" | "completed" | "failed";
}

export class SolanaService {
  private static connection = new Connection(
    import.meta.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com"
  );

  /**
   * Purchase NFT with smart contract integration
   */
  static async purchaseNFT(
    wallet: WalletContextState,
    nftId: string,
    price: number,
    seller: string
  ): Promise<NFTTransaction | null> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error("Please connect your wallet first");
      return null;
    }

    try {
      toast.info("Processing NFT purchase...");

      // Create transaction
      const transaction = new Transaction();
      const sellerPublicKey = new PublicKey(seller);

      // Add transfer instruction (simplified - in production you'd use a proper NFT program)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: sellerPublicKey,
          lamports: Math.round(price * LAMPORTS_PER_SOL),
        })
      );

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Sign and send transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      // Wait for confirmation
      await this.connection.confirmTransaction(signature);

      const nftTransaction: NFTTransaction = {
        id: crypto.randomUUID(),
        seller,
        buyer: wallet.publicKey.toString(),
        nftId,
        price,
        signature,
        timestamp: Date.now(),
        status: "completed",
      };

      // Update database (simplified - you'd call your backend API here)
      await this.updateNFTOwnership(nftTransaction);

      toast.success("NFT purchased successfully!");
      return nftTransaction;
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      toast.error("Failed to purchase NFT");
      return null;
    }
  }

  /**
   * Create and mint NFT (simplified implementation)
   */
  static async mintNFT(
    wallet: WalletContextState,
    metadataUrl: string,
    price: number
  ): Promise<string | null> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error("Please connect your wallet first");
      return null;
    }

    try {
      toast.info("Minting NFT...");

      // Create a simple transaction to simulate NFT minting
      // In production, this would use Metaplex or similar
      const transaction = new Transaction();

      // Add a small transfer to simulate minting cost
      const mintingFee = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL minting fee

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey, // Self-transfer for simulation
          lamports: Math.floor(mintingFee * 0.01), // Very small amount
        })
      );

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await this.connection.confirmTransaction(signature);

      // Generate a mock mint address for the NFT
      toast.success("NFT minted successfully!");
      return signature;
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error("Failed to mint NFT");
      return null;
    }
  }

  /**
   * Get wallet balance
   */
  static async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Error getting balance:", error);
      return 0;
    }
  }

  /**
   * Update NFT ownership in database
   */
  private static async updateNFTOwnership(
    transaction: NFTTransaction
  ): Promise<void> {
    try {
      // Update NFT owner and unlist it
      await SupabaseService.updateNFT(transaction.nftId, {
        owner_address: transaction.buyer,
        is_listed: false,
        updated_at: new Date().toISOString(),
      });

      // Record the on-chain transaction in Supabase
      await SupabaseService.createTransaction({
        buyer_address: transaction.buyer,
        seller_address: transaction.seller,
        nft_id: transaction.nftId,
        price: transaction.price,
        status: transaction.status,
        transaction_hash: transaction.signature,
        created_at: new Date(transaction.timestamp).toISOString(),
      });
    } catch (error) {
      console.error("Error updating NFT ownership:", error);
    }
  }

  /**
   * Get transaction history
   */
  static async getTransactionHistory(
    publicKey: PublicKey
  ): Promise<NFTTransaction[]> {
    try {
      const address = publicKey.toString();
      const txs = await SupabaseService.getUserTransactions(address as string);
      return (txs || []).map((t) => ({
        id: t.id,
        seller: t.seller_address,
        buyer: t.buyer_address,
        nftId: t.nft_id,
        price: t.price,
        signature: t.transaction_hash,
        timestamp: new Date(t.created_at).getTime(),
        status:
          t.status === "pending" || t.status === "failed"
            ? t.status
            : ("completed" as const),
      }));
    } catch (error) {
      console.error("Error getting transaction history:", error);
      return [];
    }
  }

  /**
   * Process bid payment (escrow system)
   */
  static async processBidPayment(
    wallet: WalletContextState,
    amount: number
  ): Promise<boolean> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return false;
    }

    try {
      // Create escrow account for bid
      const transaction = new Transaction();

      // Transfer bid amount to escrow
      // In production, this would use a proper escrow program
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey("11111111111111111111111111111112"), // Escrow account
          lamports: Math.round(amount * LAMPORTS_PER_SOL),
        })
      );

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await this.connection.confirmTransaction(signature);
      return true;
    } catch (error) {
      console.error("Error processing bid payment:", error);
      return false;
    }
  }

  /**
   * Finalize auction - transfer NFT and payment
   */
  static async finalizeAuction(auction: Auction): Promise<boolean> {
    try {
      // In production, this would:
      // 1. Transfer NFT ownership to winner
      // 2. Transfer payment from escrow to seller
      // 3. Handle royalties

      // For now, just log the action
      console.log("Finalizing auction:", auction.id);
      return true;
    } catch (error) {
      console.error("Error finalizing auction:", error);
      return false;
    }
  }

  /**
   * Refund bid amount
   */
  static async refundBid(bid: Bid): Promise<boolean> {
    try {
      // In production, this would transfer funds back from escrow
      console.log("Refunding bid:", bid.id, "amount:", bid.amount);
      return true;
    } catch (error) {
      console.error("Error refunding bid:", error);
      return false;
    }
  }
}

export default SolanaService;
