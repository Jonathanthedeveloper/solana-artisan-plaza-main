import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, Search, X } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import SolanaService from "@/services/solanaService";
import { Database } from "@/integrations/supabase/types";
import SupabaseService from "@/services/supabaseService";

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  price: string;
  image: string;
  likes: number;
  views: number;
  isVerified: boolean;
  rarity: string;
  category: string;
  creator_address: string;
}

const SearchResults = ({ query, onClose }: SearchResultsProps) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const wallet = useWallet();

  useEffect(() => {
    if (query.trim()) {
      searchNFTs(query);
    }
  }, [query]);

  const searchNFTs = async (searchQuery: string) => {
    setLoading(true);
    try {
      // For now, we'll fetch all NFTs and filter client-side
      // In production, you'd implement server-side search
      const allNFTs = await SupabaseService.getNFTs({ limit: 100 });

      const filteredResults = allNFTs.filter(
        (nft) =>
          nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nft.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nft.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const formattedResults = filteredResults.map((nft) => ({
        id: nft.id,
        title: nft.name,
        artist: `${nft.creator_address.slice(
          0,
          4
        )}...${nft.creator_address.slice(-4)}`,
        price: nft.price ? `${nft.price} SOL` : "Not listed",
        image: nft.image_url,
        likes: Math.floor(Math.random() * 500) + 50,
        views: Math.floor(Math.random() * 2000) + 500,
        isVerified: Math.random() > 0.5,
        rarity: ["Common", "Rare", "Epic", "Legendary"][
          Math.floor(Math.random() * 4)
        ],
        category: nft.category,
        creator_address: nft.creator_address,
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error("Error searching NFTs:", error);
      toast.error("Failed to search NFTs");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (id: string) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handlePurchaseNFT = async (nft: SearchResult) => {
    if (!wallet.connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (nft.price === "Not listed") {
      toast.error("This NFT is not currently listed for sale");
      return;
    }

    try {
      const price = parseFloat(nft.price.replace(" SOL", ""));
      if (isNaN(price)) {
        toast.error("Invalid price format");
        return;
      }

      await SolanaService.purchaseNFT(
        wallet,
        nft.id,
        price,
        nft.creator_address
      );
      toast.success("Purchase initiated!");
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      toast.error("Failed to purchase NFT");
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-500";
      case "Rare":
        return "bg-blue-500";
      case "Epic":
        return "bg-purple-500";
      case "Legendary":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl glass-card border-0 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Search className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Search Results for "{query}"
              </h2>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No results found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse our collections.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((nft) => (
                <Card
                  key={nft.id}
                  className="group nft-card border-0 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={nft.image}
                      alt={nft.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Rarity Badge */}
                    <Badge
                      className={`absolute top-3 left-3 ${getRarityColor(
                        nft.rarity
                      )} text-white border-0`}
                    >
                      {nft.rarity}
                    </Badge>

                    {/* Like Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-3 right-3 glass-card hover:bg-white/20"
                      onClick={() => handleLike(nft.id)}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          likedItems.has(nft.id)
                            ? "fill-red-500 text-red-500"
                            : "text-white"
                        }`}
                      />
                    </Button>

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button
                        className="bg-gradient-solana hover:opacity-90"
                        onClick={() => handlePurchaseNFT(nft)}
                      >
                        Place Bid
                      </Button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {nft.title}
                      </h3>
                      {nft.isVerified && (
                        <div className="w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
                          <span className="text-xs text-secondary-foreground">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-muted-foreground mb-3 text-sm">
                      by {nft.artist}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold bg-gradient-solana bg-clip-text text-transparent">
                        {nft.price}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{nft.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{nft.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SearchResults;
