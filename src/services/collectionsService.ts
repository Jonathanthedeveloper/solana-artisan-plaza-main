import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Collection = Database["public"]["Tables"]["collections"]["Row"];
type CollectionInsert = Database["public"]["Tables"]["collections"]["Insert"];
type CollectionUpdate = Database["public"]["Tables"]["collections"]["Update"];

export interface NFTCollection {
  id: string;
  name: string;
  description: string;
  creator: string;
  coverImage: string;
  bannerImage?: string;
  category: string;
  totalSupply: number;
  floorPrice?: number;
  volumeTraded: number;
  createdAt: number;
  updatedAt: number;
  verified: boolean;
  royaltyPercentage: number;
  attributes: Array<{
    trait_type: string;
    values: string[];
    rarity: { [key: string]: number };
  }>;
}

export interface CollectionStats {
  totalVolume: number;
  floorPrice: number;
  highestSale: number;
  totalOwners: number;
  totalListed: number;
  priceHistory: Array<{
    date: number;
    price: number;
  }>;
}

export class CollectionsService {
  /**
   * Create a new collection
   */
  static async createCollection(
    name: string,
    description: string,
    creator: string,
    coverImage: string,
    category: string,
    royaltyPercentage: number = 5
  ): Promise<NFTCollection | null> {
    try {
      const collectionData: CollectionInsert = {
        name,
        description,
        creator_address: creator,
        cover_image_url: coverImage,
        category,
        floor_price: 0,
        total_volume: 0,
        item_count: 0,
      };

      const { data, error } = await supabase
        .from("collections")
        .insert(collectionData)
        .select()
        .single();

      if (error) {
        console.error("Error creating collection:", error);
        toast.error("Failed to create collection");
        return null;
      }

      const collection: NFTCollection = {
        id: data.id,
        name: data.name,
        description: data.description || "",
        creator: data.creator_address,
        coverImage: data.cover_image_url || "",
        category: data.category,
        totalSupply: data.item_count || 0,
        floorPrice: data.floor_price || undefined,
        volumeTraded: Number(data.total_volume) || 0,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
        verified: false,
        royaltyPercentage,
        attributes: [],
      };

      toast.success("Collection created successfully!");
      return collection;
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Failed to create collection");
      return null;
    }
  }

  /**
   * Add NFT to collection
   */
  static async addNFTToCollection(
    collectionId: string,
    nftId: string,
    attributes: Array<{ trait_type: string; value: string }>
  ): Promise<boolean> {
    try {
      // First, add the NFT to the collection_nfts junction table
      const { error: junctionError } = await supabase
        .from("collection_nfts")
        .insert({
          collection_id: collectionId,
          nft_id: nftId,
        });

      if (junctionError) {
        console.error("Error adding NFT to collection:", junctionError);
        toast.error("Failed to add NFT to collection");
        return false;
      }

      // Update the collection's item count
      const { data: collectionData } = await supabase
        .from("collections")
        .select("item_count")
        .eq("id", collectionId)
        .single();

      if (collectionData) {
        const { error: updateError } = await supabase
          .from("collections")
          .update({
            item_count: (collectionData.item_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", collectionId);

        if (updateError) {
          console.error("Error updating collection count:", updateError);
          return false;
        }
      }

      toast.success("NFT added to collection!");
      return true;
    } catch (error) {
      console.error("Error adding NFT to collection:", error);
      toast.error("Failed to add NFT to collection");
      return false;
    }
  }

  /**
   * Get collection by ID
   */
  static async getCollection(
    collectionId: string
  ): Promise<NFTCollection | null> {
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (error) {
        console.error("Error fetching collection:", error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description || "",
        creator: data.creator_address,
        coverImage: data.cover_image_url || "",
        category: data.category,
        totalSupply: data.item_count || 0,
        floorPrice: data.floor_price || undefined,
        volumeTraded: Number(data.total_volume) || 0,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
        verified: false,
        royaltyPercentage: 5, // Default value
        attributes: [],
      };
    } catch (error) {
      console.error("Error fetching collection:", error);
      return null;
    }
  }

  /**
   * Get all collections
   */
  static async getAllCollections(): Promise<NFTCollection[]> {
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching collections:", error);
        return [];
      }

      return data.map((collection) => ({
        id: collection.id,
        name: collection.name,
        description: collection.description || "",
        creator: collection.creator_address,
        coverImage: collection.cover_image_url || "",
        category: collection.category,
        totalSupply: collection.item_count || 0,
        floorPrice: collection.floor_price || undefined,
        volumeTraded: Number(collection.total_volume) || 0,
        createdAt: new Date(collection.created_at).getTime(),
        updatedAt: new Date(collection.updated_at).getTime(),
        verified: false,
        royaltyPercentage: 5, // Default value
        attributes: [],
      }));
    } catch (error) {
      console.error("Error fetching collections:", error);
      return [];
    }
  }

  /**
   * Get collections by creator
   */
  static async getCollectionsByCreator(
    creator: string
  ): Promise<NFTCollection[]> {
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("creator_address", creator)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching collections by creator:", error);
        return [];
      }

      return data.map((collection) => ({
        id: collection.id,
        name: collection.name,
        description: collection.description || "",
        creator: collection.creator_address,
        coverImage: collection.cover_image_url || "",
        category: collection.category,
        totalSupply: collection.item_count || 0,
        floorPrice: collection.floor_price || undefined,
        volumeTraded: Number(collection.total_volume) || 0,
        createdAt: new Date(collection.created_at).getTime(),
        updatedAt: new Date(collection.updated_at).getTime(),
        verified: false,
        royaltyPercentage: 5, // Default value
        attributes: [],
      }));
    } catch (error) {
      console.error("Error fetching collections by creator:", error);
      return [];
    }
  }

  /**
   * Search collections
   */
  static async searchCollections(query: string): Promise<NFTCollection[]> {
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .or(
          `name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error searching collections:", error);
        return [];
      }

      return data.map((collection) => ({
        id: collection.id,
        name: collection.name,
        description: collection.description || "",
        creator: collection.creator_address,
        coverImage: collection.cover_image_url || "",
        category: collection.category,
        totalSupply: collection.item_count || 0,
        floorPrice: collection.floor_price || undefined,
        volumeTraded: Number(collection.total_volume) || 0,
        createdAt: new Date(collection.created_at).getTime(),
        updatedAt: new Date(collection.updated_at).getTime(),
        verified: false,
        royaltyPercentage: 5, // Default value
        attributes: [],
      }));
    } catch (error) {
      console.error("Error searching collections:", error);
      return [];
    }
  }

  /**
   * Get trending collections (based on volume and recent activity)
   */
  static async getTrendingCollections(
    limit: number = 10
  ): Promise<NFTCollection[]> {
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("total_volume", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching trending collections:", error);
        return [];
      }

      return data.map((collection) => ({
        id: collection.id,
        name: collection.name,
        description: collection.description || "",
        creator: collection.creator_address,
        coverImage: collection.cover_image_url || "",
        category: collection.category,
        totalSupply: collection.item_count || 0,
        floorPrice: collection.floor_price || undefined,
        volumeTraded: Number(collection.total_volume) || 0,
        createdAt: new Date(collection.created_at).getTime(),
        updatedAt: new Date(collection.updated_at).getTime(),
        verified: false,
        royaltyPercentage: 5, // Default value
        attributes: [],
      }));
    } catch (error) {
      console.error("Error fetching trending collections:", error);
      return [];
    }
  }
}
