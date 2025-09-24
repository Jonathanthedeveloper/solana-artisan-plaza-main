import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type NFT = Database["public"]["Tables"]["nfts"]["Row"];
type NFTInsert = Database["public"]["Tables"]["nfts"]["Insert"];
type NFTUpdate = Database["public"]["Tables"]["nfts"]["Update"];

type User = Database["public"]["Tables"]["users"]["Row"];
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];

export class SupabaseService {
  /**
   * Create a new NFT record
   */
  static async createNFT(nftData: NFTInsert): Promise<NFT | null> {
    try {
      const { data, error } = await supabase
        .from("nfts")
        .insert(nftData)
        .select()
        .single();

      if (error) {
        console.error("Error creating NFT:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error creating NFT:", error);
      return null;
    }
  }

  /**
   * Get NFTs with pagination and filters
   */
  static async getNFTs(
    options: {
      limit?: number;
      offset?: number;
      category?: string;
      creator?: string;
      isListed?: boolean;
      sortBy?: "created_at" | "price";
      sortOrder?: "asc" | "desc";
    } = {}
  ): Promise<NFT[]> {
    try {
      const {
        limit = 20,
        offset = 0,
        category,
        creator,
        isListed = true,
        sortBy = "created_at",
        sortOrder = "desc",
      } = options;

      let query = supabase
        .from("nfts")
        .select("*")
        .eq("is_listed", isListed)
        .range(offset, offset + limit - 1)
        .order(sortBy, { ascending: sortOrder === "asc" });

      if (category) {
        query = query.eq("category", category);
      }

      if (creator) {
        query = query.eq("creator_address", creator);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching NFTs:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      return [];
    }
  }

  /**
   * Get NFT by ID
   */
  static async getNFTById(id: string): Promise<NFT | null> {
    try {
      const { data, error } = await supabase
        .from("nfts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching NFT:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching NFT:", error);
      return null;
    }
  }

  /**
   * Update NFT
   */
  static async updateNFT(id: string, updates: NFTUpdate): Promise<NFT | null> {
    try {
      const { data, error } = await supabase
        .from("nfts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating NFT:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error updating NFT:", error);
      return null;
    }
  }

  /**
   * Get user by wallet address
   */
  static async getUserByWallet(walletAddress: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error fetching user:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  /**
   * Create or update user
   */
  static async upsertUser(userData: UserInsert): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .upsert(userData, { onConflict: "wallet_address" })
        .select()
        .single();

      if (error) {
        console.error("Error upserting user:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error upserting user:", error);
      return null;
    }
  }

  /**
   * Create transaction record
   */
  static async createTransaction(
    transactionData: TransactionInsert
  ): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        console.error("Error creating transaction:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error creating transaction:", error);
      return null;
    }
  }

  /**
   * Get transactions for a user
   */
  static async getUserTransactions(
    walletAddress: string
  ): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          nfts (
            name,
            image_url,
            category
          )
        `
        )
        .or(
          `seller_address.eq.${walletAddress},buyer_address.eq.${walletAddress}`
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  }

  /**
   * Get NFT statistics
   */
  static async getNFTStats(): Promise<{
    totalNFTs: number;
    totalVolume: number;
    activeUsers: number;
  }> {
    try {
      // Get total NFTs
      const { count: totalNFTs } = await supabase
        .from("nfts")
        .select("*", { count: "exact", head: true });

      // Get total volume from transactions
      const { data: volumeData } = await supabase
        .from("transactions")
        .select("price")
        .eq("status", "completed");

      const totalVolume =
        volumeData?.reduce((sum, tx) => sum + tx.price, 0) || 0;

      // Get active users
      const { count: activeUsers } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      return {
        totalNFTs: totalNFTs || 0,
        totalVolume,
        activeUsers: activeUsers || 0,
      };
    } catch (error) {
      console.error("Error fetching NFT stats:", error);
      return {
        totalNFTs: 0,
        totalVolume: 0,
        activeUsers: 0,
      };
    }
  }
}

export default SupabaseService;
