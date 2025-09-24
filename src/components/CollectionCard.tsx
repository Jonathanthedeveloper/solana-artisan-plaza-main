import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, TrendingUp, Users } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NFTCollection } from "@/services/collectionsService";
import { FavoritesService } from "@/services/favoritesService";
import { AnalyticsService } from "@/services/analyticsService";
type CollectionAnalytics = ReturnType<
  typeof AnalyticsService.getCollectionAnalytics
>;

interface CollectionCardProps {
  collection: NFTCollection;
  onViewDetails?: (collectionId: string) => void;
}

const CollectionCard = ({ collection, onViewDetails }: CollectionCardProps) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [stats, setStats] = useState<CollectionAnalytics | null>(null);
  const wallet = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (wallet.publicKey) {
      setIsInWatchlist(
        FavoritesService.isInWatchlist(
          wallet.publicKey.toString(),
          collection.id
        )
      );
    }
    // Get collection stats
    const collectionStats = AnalyticsService.getCollectionAnalytics(
      collection.id
    );
    setStats(collectionStats);
  }, [wallet.publicKey, collection.id]);

  const handleWatchlist = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      if (isInWatchlist) {
        await FavoritesService.removeFromWatchlist(
          wallet.publicKey.toString(),
          collection.id
        );
        setIsInWatchlist(false);
        toast.success("Removed from watchlist");
      } else {
        await FavoritesService.addToWatchlist(
          wallet.publicKey.toString(),
          collection.id
        );
        setIsInWatchlist(true);
        toast.success("Added to watchlist");
      }
    } catch (error) {
      toast.error("Failed to update watchlist");
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toFixed(1);
  };

  return (
    <Card className="group overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-card">
      <div className="relative">
        <img
          src={collection.coverImage || "/placeholder.svg"}
          alt={collection.name}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Verified Badge */}
        {collection.verified && (
          <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground border-0 shadow-lg">
            ✓ Verified
          </Badge>
        )}

        {/* Watchlist Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white border-0 backdrop-blur-sm transition-all duration-200"
          onClick={handleWatchlist}
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${
              isInWatchlist
                ? "fill-blue-500 text-blue-500"
                : "text-white hover:text-blue-400"
            }`}
          />
        </Button>

        {/* Subtle Overlay on Hover */}
  <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-5">
        {/* Collection Info */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1 flex-1 mr-2">
              {collection.name}
            </h3>
            <Badge variant="secondary" className="text-xs capitalize shrink-0">
              {collection.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {collection.description}
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Floor Price
            </p>
            <p className="text-lg font-bold bg-gradient-solana bg-clip-text text-transparent">
              {collection.floorPrice ? `${collection.floorPrice} SOL` : "N/A"}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Volume
            </p>
            <p className="text-lg font-bold text-foreground">
              {formatVolume(collection.volumeTraded)} SOL
            </p>
          </div>
        </div>

        {/* Additional Stats */}
        {stats && (
          <div className="flex items-center justify-between mb-4 p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{stats.owners} owners</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Eye className="w-3 h-3" />
              <span>{stats.listed} listed</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              <span>{stats.sales24h} sales</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {collection.totalSupply} items
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onViewDetails
                ? onViewDetails(collection.id)
                : navigate(`/collections/${collection.id}`)
            }
            className="hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CollectionCard;
