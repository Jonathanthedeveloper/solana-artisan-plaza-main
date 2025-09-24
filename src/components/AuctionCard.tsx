import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, Eye, Clock, TrendingUp } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { Auction, Bid } from "@/services/biddingService";
import { FavoritesService } from "@/services/favoritesService";

interface AuctionCardProps {
  auction: Auction;
  nftImage: string;
  nftName: string;
  nftCreator: string;
  onBidPlaced?: (auctionId: string, bidAmount: number) => void;
}

const AuctionCard = ({
  auction,
  nftImage,
  nftName,
  nftCreator,
  onBidPlaced,
}: AuctionCardProps) => {
  const [bidAmount, setBidAmount] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = Date.now();
      const timeLeftMs = auction.endTime - now;

      if (timeLeftMs <= 0) {
        setTimeLeft("Ended");
        return;
      }

      const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [auction.endTime]);

  useEffect(() => {
    if (wallet.publicKey) {
      setIsFavorited(
        FavoritesService.isFavorited(wallet.publicKey.toString(), auction.nftId)
      );
    }
  }, [wallet.publicKey, auction.nftId]);

  const handleFavorite = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      if (isFavorited) {
        await FavoritesService.removeFromFavorites(
          wallet.publicKey.toString(),
          auction.nftId
        );
        setIsFavorited(false);
        toast.success("Removed from favorites");
      } else {
        await FavoritesService.addToFavorites(
          wallet.publicKey.toString(),
          auction.nftId
        );
        setIsFavorited(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  const handlePlaceBid = async () => {
    if (!wallet.connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= auction.currentPrice) {
      toast.error(`Bid must be higher than ${auction.currentPrice} SOL`);
      return;
    }

    setIsPlacingBid(true);
    try {
      const { BiddingService } = await import("@/services/biddingService");
      const bid = await BiddingService.placeBid(wallet, auction.id, amount);

      if (bid) {
        setBidAmount("");
        onBidPlaced?.(auction.id, amount);
        toast.success(`Bid of ${amount} SOL placed successfully!`);
      }
    } catch (error) {
      toast.error("Failed to place bid");
    } finally {
      setIsPlacingBid(false);
    }
  };

  const getAuctionStatus = () => {
    if (auction.status === "ended") return "Ended";
    if (auction.status === "cancelled") return "Cancelled";
    return "Active";
  };

  const getStatusColor = () => {
    switch (auction.status) {
      case "active":
        return "bg-green-500";
      case "ended":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="group overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-card">
      <div className="relative">
        <img
          src={nftImage}
          alt={nftName}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Status Badge */}
        <Badge
          className={`absolute top-3 left-3 ${getStatusColor()} text-white border-0 shadow-lg`}
        >
          {getAuctionStatus()}
        </Badge>

        {/* Time Left Badge */}
        {auction.status === "active" && (
          <Badge className="absolute top-3 right-3 bg-background/80 text-foreground border-0 backdrop-blur-sm">
            <Clock className="w-3 h-3 mr-1" />
            {timeLeft}
          </Badge>
        )}

        {/* Favorite Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-12 bg-black/60 hover:bg-black/80 text-white border-0 backdrop-blur-sm transition-all duration-200"
          onClick={handleFavorite}
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${
              isFavorited
                ? "fill-red-500 text-red-500"
                : "text-white hover:text-red-400"
            }`}
          />
        </Button>

        {/* Subtle Overlay on Hover - Only for active auctions */}
        {auction.status === "active" && (
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>

      <div className="p-5">
        {/* NFT Info */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
            {nftName}
          </h3>
          <p className="text-sm text-muted-foreground">
            by <span className="font-medium">{nftCreator}</span>
          </p>
        </div>

        {/* Price and Stats */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Current Bid
            </p>
            <p className="text-xl font-bold bg-gradient-solana bg-clip-text text-transparent">
              {auction.currentPrice} SOL
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total Bids
            </p>
            <p className="text-sm font-semibold text-foreground">
              {auction.totalBids}
            </p>
          </div>
        </div>

        {/* Reserve Price Indicator */}
        {auction.reservePrice &&
          auction.currentPrice < auction.reservePrice && (
            <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Reserve: {auction.reservePrice} SOL
              </p>
            </div>
          )}

        {/* Bid Section - Only for active auctions */}
        {auction.status === "active" && (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder={`Min ${(auction.currentPrice + 0.1).toFixed(
                  1
                )} SOL`}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="flex-1 h-9"
                step="0.1"
                min={auction.currentPrice + 0.1}
              />
              <Button
                onClick={handlePlaceBid}
                disabled={isPlacingBid || !bidAmount}
                className="bg-gradient-solana hover:opacity-90 h-9 px-4"
                size="sm"
              >
                {isPlacingBid ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Bid"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Ended Auction Info */}
        {auction.status === "ended" && (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              {auction.highestBid
                ? `Sold for ${auction.highestBid.amount} SOL`
                : "Ended - No bids"}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AuctionCard;
