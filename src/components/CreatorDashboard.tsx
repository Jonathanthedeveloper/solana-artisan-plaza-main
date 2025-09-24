import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Heart,
  Share2,
  Download,
  Settings,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Trophy,
  Target,
  Zap,
  Activity,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnalyticsService } from "@/services/analyticsService";
import { CollectionsService } from "@/services/collectionsService";
import { BiddingService } from "@/services/biddingService";
import CreateNFT from "@/components/CreateNFT";

// Type definitions for better type safety
interface NFTStats {
  name: string;
  sales: number;
  volume: number;
}

interface Sale {
  nftName: string;
  buyer: string;
  price: number;
  timestamp: string;
}

interface MonthlyStat {
  month: string;
  volume: number;
  sales: number;
  growth: number;
}

interface CreatorStats {
  totalVolume: number;
  totalSales: number;
  uniqueCollectors: number;
  totalViews: number;
  topNFT: NFTStats;
  recentSales: Sale[];
  monthlyStats: MonthlyStat[];
  growthRate: number;
  avgPrice: number;
}

interface Collection {
  id: string;
  name: string;
  totalSupply: number;
  volumeTraded: number;
  floorPrice?: number;
  items: number;
}

interface Auction {
  id: string;
  seller: string;
  currentPrice: number;
  totalBids: number;
  endTime: string;
  status: "active" | "ended" | "cancelled";
}

interface CreatorDashboardProps {
  onCreateNFT?: () => void;
  onCreateCollection?: () => void;
}

const CreatorDashboard = ({
  onCreateNFT,
  onCreateCollection,
}: CreatorDashboardProps) => {
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateNFT, setShowCreateNFT] = useState(false);
  const wallet = useWallet();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fallbacks if parent didn't pass handlers
  const handleCreateCollection = () => {
    if (onCreateCollection) return onCreateCollection();
    navigate("/collections?create=true");
    toast({
      title: "Redirecting to Collections",
      description: "Create your new collection there!",
    });
  };

  const handleCreateNFT = () => {
    if (onCreateNFT) return onCreateNFT();
    setShowCreateNFT(true);
  };

  const loadCreatorData = useCallback(async () => {
    if (!wallet.publicKey) return;

    try {
      const creatorAddress = wallet.publicKey.toString();

      // Get creator stats
      const creatorStats = AnalyticsService.getCreatorStats(creatorAddress);
      setStats(creatorStats);

      // Get creator collections
      const creatorCollections = await CollectionsService.getCollectionsByCreator(
        creatorAddress
      );
      setCollections(creatorCollections as unknown as Collection[]);

      // Get active auctions
      const activeAuctions = BiddingService.getActiveAuctions().filter(
        (auction) => auction.seller === creatorAddress
      );
      setAuctions(activeAuctions);
    } catch (error) {
      console.error("Error loading creator data:", error);
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    if (wallet.publicKey) {
      loadCreatorData();
    }
  }, [wallet.publicKey, loadCreatorData]);

  const exportData = () => {
    if (!wallet.publicKey) return;

    const data = AnalyticsService.exportCreatorData(
      wallet.publicKey.toString()
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "creator-analytics.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gradient-to-r from-muted to-muted/50 rounded-lg animate-pulse" />
            <div className="h-4 w-96 bg-muted/50 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-muted/50 rounded-lg animate-pulse" />
            <div className="h-10 w-24 bg-muted/50 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 border-border/50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted/50 rounded-lg animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-20 bg-muted/50 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-muted/50 rounded animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="h-10 w-full bg-muted/50 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-border/50">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-muted/50 rounded animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 bg-muted/50 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </Card>
            <Card className="p-6 border-border/50">
              <div className="space-y-4">
                <div className="h-6 w-40 bg-muted/50 rounded animate-pulse" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted/50 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-12 text-center border-border/50 max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">
            Connect Your Wallet
          </h3>
          <p className="text-muted-foreground mb-6">
            Connect your Solana wallet to view your creator dashboard and track
            your NFT performance
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Trophy className="w-4 h-4" />
              <span>Track your sales and revenue</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <BarChart3 className="w-4 h-4" />
              <span>Monitor collection performance</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Manage your community</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-solana bg-clip-text text-transparent">
            Creator Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your NFT performance and manage your collections
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={exportData}
            className="hover:bg-primary/5"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" className="hover:bg-primary/5">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-border/50 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex items-center space-x-1">
              {(stats.growthRate || 0) > 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  (stats.growthRate || 0) > 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {Math.abs(stats.growthRate || 0)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Total Volume
            </p>
            <p className="text-2xl font-bold text-foreground mb-2">
              {(stats.totalVolume || 0).toFixed(2)} SOL
            </p>
            <Progress value={75} className="h-2" />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-border/50 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
            >
              +{stats.totalSales || 0}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Total Sales
            </p>
            <p className="text-2xl font-bold text-foreground mb-2">
              {stats.totalSales || 0}
            </p>
            <Progress value={60} className="h-2" />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-border/50 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-500">
                Active
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Unique Collectors
            </p>
            <p className="text-2xl font-bold text-foreground mb-2">
              {stats.uniqueCollectors || 0}
            </p>
            <Progress value={85} className="h-2" />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-border/50 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Eye className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-500">Hot</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Total Views
            </p>
            <p className="text-2xl font-bold text-foreground mb-2">
              {(stats.totalViews || 0).toLocaleString()}
            </p>
            <Progress value={90} className="h-2" />
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted/50">
          <TabsTrigger
            value="overview"
            className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Activity className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="collections"
            className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Collections</span>
          </TabsTrigger>
          <TabsTrigger
            value="auctions"
            className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Auctions</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 border-border/50 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Performance Summary</h3>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                >
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  {stats.growthRate || 0}% this month
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Average Price</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(stats.avgPrice || 0).toFixed(2)} SOL
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Best Seller</p>
                  <p className="text-lg font-semibold text-foreground">
                    {stats.topNFT?.name || "N/A"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border/50">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Conversion Rate
                  </span>
                  <span className="font-semibold text-foreground">24.5%</span>
                </div>
                <Progress value={24.5} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Engagement
                  </span>
                  <span className="font-semibold text-foreground">89.2%</span>
                </div>
                <Progress value={89.2} className="h-2" />
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6 border-border/50">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={handleCreateNFT}
                className="h-auto p-4 bg-gradient-solana hover:opacity-90 flex flex-col items-center space-y-2 group"
              >
                <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">Create NFT</span>
              </Button>
              <Button
                onClick={handleCreateCollection}
                variant="outline"
                className="h-auto p-4 hover:bg-primary/5 flex flex-col items-center space-y-2 group"
              >
                <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">New Collection</span>
              </Button>
              <Button
                onClick={async () => {
                  if (!wallet.publicKey) {
                    toast({
                      title: "Wallet not connected",
                      description:
                        "Please connect your wallet to share your profile.",
                      variant: "destructive",
                    });
                    return;
                  }
                  try {
                    const profileUrl = `${
                      window.location.origin
                    }/profile/${wallet.publicKey.toString()}`;
                    await navigator.clipboard.writeText(profileUrl);
                    toast({
                      title: "Profile Link Copied!",
                      description: "Share your profile with others!",
                    });
                  } catch (error) {
                    toast({
                      title: "Failed to copy link",
                      description: "Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
                variant="outline"
                className="h-auto p-4 hover:bg-primary/5 flex flex-col items-center space-y-2 group"
              >
                <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">Share Profile</span>
              </Button>
              <Button
                onClick={() => {
                  setActiveTab("analytics");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                variant="outline"
                className="h-auto p-4 hover:bg-primary/5 flex flex-col items-center space-y-2 group"
              >
                <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Eye className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">View Analytics</span>
              </Button>
            </div>
          </Card>

          {/* Top Performing NFT & Recent Sales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Top Performing NFT</h3>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {stats.topNFT?.name || "No NFT yet"}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {stats.topNFT?.sales || 0} sales •{" "}
                    {(stats.topNFT?.volume || 0).toFixed(2)} SOL volume
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                  >
                    #{stats.topNFT?.sales || 0} Best Seller
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div className="space-y-3">
                {(stats.recentSales || [])
                  .slice(0, 3)
                  .map((sale: Sale, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {sale.nftName || "Unknown NFT"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sale.buyer
                              ? `${sale.buyer.slice(0, 6)}...${sale.buyer.slice(
                                  -4
                                )}`
                              : "Unknown buyer"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground text-sm">
                          {sale.price || 0} SOL
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sale.timestamp
                            ? new Date(sale.timestamp).toLocaleDateString()
                            : "Unknown date"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Collections</h3>
            <Button
              onClick={handleCreateCollection}
              className="bg-gradient-solana hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Collection
            </Button>
          </div>

          {collections.length === 0 ? (
            <Card className="p-12 text-center border-border/50">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-muted-foreground mb-4">No collections yet</p>
              <Button
                onClick={handleCreateCollection}
                className="bg-gradient-solana hover:opacity-90"
              >
                Create Your First Collection
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Card
                  key={collection.id}
                  className="p-6 hover:shadow-lg transition-shadow duration-200 border-border/50"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {collection.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {collection.totalSupply} items •{" "}
                        {collection.volumeTraded.toFixed(2)} SOL volume
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Floor Price</span>
                    <span className="font-semibold text-foreground">
                      {collection.floorPrice?.toFixed(2) || "0.00"} SOL
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="auctions" className="space-y-6">
          <h3 className="text-lg font-semibold">Active Auctions</h3>

          {auctions.length === 0 ? (
            <Card className="p-12 text-center border-border/50">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-muted-foreground mb-4">No active auctions</p>
              <Button
                onClick={handleCreateNFT}
                className="bg-gradient-solana hover:opacity-90"
              >
                Create NFT for Auction
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <Card
                  key={auction.id}
                  className="p-6 hover:shadow-lg transition-shadow duration-200 border-border/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">
                      Auction #{auction.id.slice(0, 8)}
                    </h4>
                    <Badge
                      variant={
                        auction.status === "active" ? "default" : "secondary"
                      }
                      className={
                        auction.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : ""
                      }
                    >
                      {auction.status}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Current Bid
                      </span>
                      <span className="font-semibold text-foreground">
                        {auction.currentPrice} SOL
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Bids
                      </span>
                      <span className="font-semibold text-foreground">
                        {auction.totalBids}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Ends
                      </span>
                      <span className="font-semibold text-foreground">
                        {new Date(auction.endTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 border-border/50">
              <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    This Month
                  </span>
                  <span className="font-semibold text-foreground">
                    {stats.monthlyStats[
                      stats.monthlyStats.length - 1
                    ]?.volume.toFixed(2)}{" "}
                    SOL
                  </span>
                </div>
                <Progress value={75} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Last Month
                  </span>
                  <span className="font-semibold text-foreground">
                    {stats.monthlyStats[
                      stats.monthlyStats.length - 2
                    ]?.volume.toFixed(2)}{" "}
                    SOL
                  </span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </Card>

            <Card className="p-6 border-border/50">
              <h3 className="text-lg font-semibold mb-4">Sales Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Conversion Rate
                  </span>
                  <span className="font-semibold text-foreground">24.5%</span>
                </div>
                <Progress value={24.5} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Avg. Sale Time
                  </span>
                  <span className="font-semibold text-foreground">
                    2.3 days
                  </span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </Card>

            <Card className="p-6 border-border/50">
              <h3 className="text-lg font-semibold mb-4">Market Position</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Market Share
                  </span>
                  <span className="font-semibold text-foreground">12.4%</span>
                </div>
                <Progress value={12.4} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ranking</span>
                  <span className="font-semibold text-foreground">#47</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
            </Card>
          </div>

          {/* Monthly Performance */}
          <Card className="p-6 border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Monthly Performance</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Last 6 months
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {(stats.monthlyStats || [])
                .slice(-6)
                .map((month: MonthlyStat, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium text-foreground">
                        {month.month || "Unknown"}
                      </span>
                    </div>
                    <div className="flex space-x-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-foreground">
                          {(month.volume || 0).toFixed(2)} SOL
                        </p>
                        <p className="text-muted-foreground">Volume</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">
                          {month.sales || 0}
                        </p>
                        <p className="text-muted-foreground">Sales</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {(month.growth || 0) > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={`font-semibold ${
                            (month.growth || 0) > 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {Math.abs(month.growth || 0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create NFT Modal */}
      {showCreateNFT && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Create New NFT</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateNFT(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-6">
              <CreateNFT onClose={() => setShowCreateNFT(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;
