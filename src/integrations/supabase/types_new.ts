export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      collection_nfts: {
        Row: {
          added_at: string;
          collection_id: string;
          id: string;
          nft_id: string;
        };
        Insert: {
          added_at?: string;
          collection_id: string;
          id?: string;
          nft_id: string;
        };
        Update: {
          added_at?: string;
          collection_id?: string;
          id?: string;
          nft_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collection_nfts_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_nfts_nft_id_fkey";
            columns: ["nft_id"];
            isOneToOne: false;
            referencedRelation: "nfts";
            referencedColumns: ["id"];
          }
        ];
      };
      collections: {
        Row: {
          category: string;
          cover_image_url: string | null;
          created_at: string;
          creator_address: string;
          description: string | null;
          floor_price: number | null;
          id: string;
          item_count: number;
          name: string;
          total_volume: number;
          updated_at: string;
        };
        Insert: {
          category: string;
          cover_image_url?: string | null;
          created_at?: string;
          creator_address: string;
          description?: string | null;
          floor_price?: number | null;
          id?: string;
          item_count?: number;
          name: string;
          total_volume?: number;
          updated_at?: string;
        };
        Update: {
          category?: string;
          cover_image_url?: string | null;
          created_at?: string;
          creator_address?: string;
          description?: string | null;
          floor_price?: number | null;
          id?: string;
          item_count?: number;
          name?: string;
          total_volume?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      nfts: {
        Row: {
          attributes: Json;
          category: string;
          created_at: string;
          creator_address: string;
          description: string | null;
          external_url: string | null;
          id: string;
          image_url: string;
          is_listed: boolean;
          metadata_url: string;
          mint_address: string | null;
          name: string;
          owner_address: string;
          price: number | null;
          royalty_percentage: number;
          updated_at: string;
        };
        Insert: {
          attributes?: Json;
          category: string;
          created_at?: string;
          creator_address: string;
          description?: string | null;
          external_url?: string | null;
          id?: string;
          image_url: string;
          is_listed?: boolean;
          metadata_url: string;
          mint_address?: string | null;
          name: string;
          owner_address: string;
          price?: number | null;
          royalty_percentage?: number;
          updated_at?: string;
        };
        Update: {
          attributes?: Json;
          category?: string;
          created_at?: string;
          creator_address?: string;
          description?: string | null;
          external_url?: string | null;
          id?: string;
          image_url?: string;
          is_listed?: boolean;
          metadata_url?: string;
          mint_address?: string | null;
          name?: string;
          owner_address?: string;
          price?: number | null;
          royalty_percentage?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          buyer_address: string;
          created_at: string;
          id: string;
          nft_id: string;
          price: number;
          seller_address: string;
          status: string;
          transaction_hash: string;
        };
        Insert: {
          buyer_address: string;
          created_at?: string;
          id?: string;
          nft_id: string;
          price: number;
          seller_address: string;
          status: string;
          transaction_hash: string;
        };
        Update: {
          buyer_address?: string;
          created_at?: string;
          id?: string;
          nft_id?: string;
          price?: number;
          seller_address?: string;
          status?: string;
          transaction_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_nft_id_fkey";
            columns: ["nft_id"];
            isOneToOne: false;
            referencedRelation: "nfts";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          bio: string | null;
          created_at: string;
          id: string;
          profile_image_url: string | null;
          updated_at: string;
          username: string | null;
          verified: boolean;
          wallet_address: string;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          id?: string;
          profile_image_url?: string | null;
          updated_at?: string;
          username?: string | null;
          verified?: boolean;
          wallet_address: string;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          id?: string;
          profile_image_url?: string | null;
          updated_at?: string;
          username?: string | null;
          verified?: boolean;
          wallet_address?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
