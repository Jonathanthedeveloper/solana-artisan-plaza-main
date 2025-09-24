import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedCollections from "@/components/FeaturedCollections";
import AuctionCard from "@/components/AuctionCard";
import CollectionCard from "@/components/CollectionCard";
import { useState, useEffect } from "react";
import { BiddingService } from "@/services/biddingService";
import { CollectionsService } from "@/services/collectionsService";
import { FavoritesService } from "@/services/favoritesService";
import { AnalyticsService } from "@/services/analyticsService";

const Index = () => {
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [trendingCollections, setTrendingCollections] = useState([]);
  const [marketplaceStats, setMarketplaceStats] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load active auctions
        const auctions = await BiddingService.getActiveAuctions();
        setActiveAuctions(auctions.slice(0, 6)); // Show first 6 auctions

        // Load trending collections
        const collections = await CollectionsService.getTrendingCollections();
        setTrendingCollections(collections.slice(0, 4)); // Show first 4 collections

        // Load marketplace stats
        const stats = await AnalyticsService.getMarketplaceStats();
        setMarketplaceStats(stats);
      } catch (error) {
        console.error("Error loading marketplace data:", error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <Categories />

        {/* Marketplace Stats Section */}
  <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Marketplace Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {marketplaceStats.totalNFTs || 0}
                </div>
                <div className="text-muted-foreground">Total NFTs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {marketplaceStats.totalCollections || 0}
                </div>
                <div className="text-muted-foreground">Collections</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {marketplaceStats.activeAuctions || 0}
                </div>
                <div className="text-muted-foreground">Active Auctions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {marketplaceStats.totalVolume || "0 SOL"}
                </div>
                <div className="text-muted-foreground">Trading Volume</div>
              </div>
            </div>
          </div>
        </section>

        {/* Active Auctions Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Live Auctions
            </h2>
            {activeAuctions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeAuctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No active auctions at the moment. Check back soon!
              </div>
            )}
          </div>
        </section>

        <FeaturedCollections />

        {/* Trending Collections Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Trending Collections
            </h2>
            {trendingCollections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingCollections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No trending collections yet. Be the first to create one!
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
