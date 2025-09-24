import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-nft.jpg";
import SupabaseService from "@/services/supabaseService";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const [stats, setStats] = useState({
    totalNFTs: 500,
    totalVolume: 1250000,
    activeUsers: 50000,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const realStats = await SupabaseService.getNFTStats();
        setStats({
          totalNFTs: realStats.totalNFTs || 500,
          totalVolume: realStats.totalVolume || 1250000,
          activeUsers: realStats.activeUsers || 50000,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Keep default values on error
      }
    };

    fetchStats();
  }, []);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="NFT Marketplace Hero"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 to-background/70" />
      </div>

      {/* Floating Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 hero-glow rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 hero-glow rounded-full" />

      <div className="relative container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-solana bg-clip-text text-transparent">
              Create, Trade & Collect
            </span>
            <br />
            <span className="text-foreground">Digital Masterpieces</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            The premier Solana NFT marketplace for artists, collectors, and
            creators. Lightning-fast transactions, zero gas fees.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-solana hover:opacity-90 shadow-glow text-lg px-8 py-6"
              onClick={() => navigate("/creator-dashboard")}
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Creating
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/50 hover:bg-primary/10 text-lg px-8 py-6"
              onClick={() => navigate("/collections")}
            >
              Explore Collections
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats.totalNFTs.toLocaleString()}+
              </div>
              <div className="text-muted-foreground">NFTs Created</div>
            </div>
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats.activeUsers.toLocaleString()}+
              </div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {(stats.totalVolume / 1000000).toFixed(1)}M
              </div>
              <div className="text-muted-foreground">Total Volume (SOL)</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
