import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import SolanaService from "@/services/solanaService";
import { Database } from "@/integrations/supabase/types";
import SupabaseService from "@/services/supabaseService";
import { useNavigate } from "react-router-dom";

interface NFTDisplay {
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

const FeaturedCollections = () => {
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [collections, setCollections] = useState<NFTDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const wallet = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const nfts = await SupabaseService.getNFTs({ limit: 6 });
        // Transform NFTs to match the expected format
        const formattedCollections = nfts.map((nft, index) => ({
          id: nft.id,
          title: nft.name,
          artist: `${nft.creator_address.slice(
            0,
            4
          )}...${nft.creator_address.slice(-4)}`,
          price: nft.price ? `${nft.price} SOL` : "Not listed",
          image: nft.image_url,
          likes: Math.floor(Math.random() * 500) + 50, // Mock data for now
          views: Math.floor(Math.random() * 2000) + 500, // Mock data for now
          isVerified: Math.random() > 0.5, // Mock data for now
          rarity: ["Common", "Rare", "Epic", "Legendary"][
            Math.floor(Math.random() * 4)
          ],
          category: nft.category,
          creator_address: nft.creator_address,
        }));
        setCollections(formattedCollections);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        // Fallback to placeholder data
        setCollections([
          {
            id: "1",
            title: "Cosmic Dimensions",
            artist: "ArtMaster3000",
            price: "2.5 SOL",
            image: "/placeholder.svg",
            likes: 234,
            views: 1240,
            isVerified: true,
            rarity: "Rare",
            category: "digital-art",
            creator_address: "11111111111111111111111111111112", // Mock Solana address
          },
          {
            id: "2",
            title: "Digital Dreams",
            artist: "CryptoArtist",
            price: "1.8 SOL",
            image: "/placeholder.svg",
            likes: 189,
            views: 890,
            isVerified: true,
            rarity: "Epic",
            category: "digital-art",
            creator_address: "11111111111111111111111111111112", // Mock Solana address
          },
          {
            id: "3",
            title: "Neon Nights",
            artist: "PixelMaster",
            price: "3.2 SOL",
            image: "/placeholder.svg",
            likes: 456,
            views: 2100,
            isVerified: false,
            rarity: "Legendary",
            category: "digital-art",
            creator_address: "11111111111111111111111111111112", // Mock Solana address
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  const handlePurchaseNFT = async (nft: NFTDisplay) => {
    if (!wallet.connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      await SolanaService.purchaseNFT(
        wallet,
        nft.id,
        parseFloat(nft.price.replace(" SOL", "")),
        nft.creator_address
      );
      toast.success("Purchase initiated!");
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      toast.error("Failed to purchase NFT");
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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-500";
      case "Rare":
        return "bg-blue-500";
      case "Epic":
        return "bg-purple-500";
      case "Legendary":
        return "bg-orange-500";
      case "Mythic":
        return "bg-gradient-solana";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <section id="featured" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-solana bg-clip-text text-transparent">
                Featured Collections
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">Loading NFTs...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured" className="py-20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-16">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-solana bg-clip-text text-transparent">
                Featured Collections
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Handpicked NFTs from top creators and rising stars
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="hidden md:flex"
            onClick={() => navigate("/collections")}
          >
            View All Collections
            <TrendingUp className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((nft) => (
            <Card
              key={nft.id}
              className="group nft-card border-0 overflow-hidden"
            >
              <div className="relative">
                <img
                  src={nft.image}
                  alt={nft.title}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
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

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {nft.title}
                  </h3>
                  {nft.isVerified && (
                    <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-xs text-secondary-foreground">
                        ✓
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground mb-4">by {nft.artist}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold bg-gradient-solana bg-clip-text text-transparent">
                    {nft.price}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{nft.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{nft.views}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-solana hover:opacity-90"
                  onClick={() => handlePurchaseNFT(nft)}
                >
                  Buy Now
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="md:hidden"
            onClick={() => navigate("/collections")}
          >
            View All Collections
            <TrendingUp className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
