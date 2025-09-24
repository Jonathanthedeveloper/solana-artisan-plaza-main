import Navigation from "@/components/Navigation";
import AuctionCard from "@/components/AuctionCard";
import { useState, useEffect } from "react";
import { BiddingService, Auction } from "@/services/biddingService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SupabaseService from "@/services/supabaseService";

interface AuctionWithNFT extends Auction {
  nftImage: string;
  nftName: string;
  nftCreator: string;
}

const Auctions = () => {
  const [auctions, setAuctions] = useState<AuctionWithNFT[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<AuctionWithNFT[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuctions = async () => {
      try {
        const allAuctions = await BiddingService.getAllAuctions();

        // Fetch NFT data for each auction
        const auctionsWithNFTs: AuctionWithNFT[] = await Promise.all(
          allAuctions.map(async (auction) => {
            try {
              const nft = await SupabaseService.getNFTById(auction.nftId);
              return {
                ...auction,
                nftImage: nft?.image_url || "/placeholder.svg",
                nftName: nft?.name || `NFT ${auction.nftId.slice(0, 8)}`,
                nftCreator: nft?.creator_address
                  ? `${nft.creator_address.slice(
                      0,
                      4
                    )}...${nft.creator_address.slice(-4)}`
                  : "Unknown",
              };
            } catch (error) {
              console.error(`Error fetching NFT ${auction.nftId}:`, error);
              return {
                ...auction,
                nftImage: "/placeholder.svg",
                nftName: `NFT ${auction.nftId.slice(0, 8)}`,
                nftCreator: "Unknown",
              };
            }
          })
        );

        setAuctions(auctionsWithNFTs);
        setFilteredAuctions(auctionsWithNFTs);
      } catch (error) {
        console.error("Error loading auctions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuctions();
  }, []);

  useEffect(() => {
    let filtered = auctions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (auction) =>
          auction.nftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          auction.nftCreator.toLowerCase().includes(searchTerm.toLowerCase()) ||
          auction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          auction.seller.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((auction) => auction.status === filter);
    }

    setFilteredAuctions(filtered);
  }, [searchTerm, filter, auctions]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading auctions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">NFT Auctions</h1>
          <p className="text-muted-foreground mb-6">
            Discover and bid on unique digital assets from talented creators
          </p>

          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search auctions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-1/3"
            />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="md:w-1/4">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Auctions</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                nftImage={auction.nftImage}
                nftName={auction.nftName}
                nftCreator={auction.nftCreator}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">
              {searchTerm || filter !== "all"
                ? "No auctions match your search criteria"
                : "No auctions available at the moment"}
            </div>
            <Button
              onClick={() => {
                setSearchTerm("");
                setFilter("all");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auctions;
