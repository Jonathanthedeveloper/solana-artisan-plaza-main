import { toast } from "sonner";

export interface CreatorStats {
  totalVolume: number;
  totalSales: number;
  averagePrice: number;
  uniqueCollectors: number;
  topNFT: {
    id: string;
    name: string;
    sales: number;
    volume: number;
  };
  monthlyStats: Array<{
    month: string;
    volume: number;
    sales: number;
  }>;
  recentSales: Array<{
    nftId: string;
    nftName: string;
    buyer: string;
    price: number;
    timestamp: number;
  }>;
}

export interface MarketplaceStats {
  totalVolume: number;
  totalTransactions: number;
  activeUsers: number;
  floorPrice: number;
  topCollections: Array<{
    id: string;
    name: string;
    volume: number;
    change: number;
  }>;
  trendingNFTs: Array<{
    id: string;
    name: string;
    price: number;
    change: number;
  }>;
  volumeChart: Array<{
    date: string;
    volume: number;
  }>;
}

export class AnalyticsService {
  private static creatorStats: Map<string, CreatorStats> = new Map();
  private static marketplaceStats: MarketplaceStats | null = null;

  /**
   * Get creator statistics
   */
  static getCreatorStats(creatorAddress: string): CreatorStats {
    const existing = this.creatorStats.get(creatorAddress);
    if (existing) return existing;

    // Generate mock stats for demo
    const stats: CreatorStats = {
      totalVolume: Math.random() * 10000 + 1000,
      totalSales: Math.floor(Math.random() * 500) + 50,
      averagePrice: Math.random() * 20 + 1,
      uniqueCollectors: Math.floor(Math.random() * 200) + 20,
      topNFT: {
        id: crypto.randomUUID(),
        name: "Genesis Collection #1",
        sales: Math.floor(Math.random() * 50) + 10,
        volume: Math.random() * 5000 + 500,
      },
      monthlyStats: this.generateMonthlyStats(),
      recentSales: this.generateRecentSales(),
    };

    this.creatorStats.set(creatorAddress, stats);
    return stats;
  }

  /**
   * Update creator stats after a sale
   */
  static updateCreatorStats(
    creatorAddress: string,
    saleAmount: number,
    nftId: string,
    nftName: string,
    buyerAddress: string
  ): void {
    const stats = this.getCreatorStats(creatorAddress);

    stats.totalVolume += saleAmount;
    stats.totalSales += 1;
    stats.averagePrice = stats.totalVolume / stats.totalSales;

    // Add to recent sales
    stats.recentSales.unshift({
      nftId,
      nftName,
      buyer: buyerAddress,
      price: saleAmount,
      timestamp: Date.now(),
    });

    // Keep only last 10 recent sales
    stats.recentSales = stats.recentSales.slice(0, 10);

    // Update top NFT if this sale makes it the top
    if (stats.topNFT.sales < 1 || saleAmount > stats.topNFT.volume) {
      stats.topNFT = {
        id: nftId,
        name: nftName,
        sales: 1,
        volume: saleAmount,
      };
    }

    this.creatorStats.set(creatorAddress, stats);
  }

  /**
   * Get marketplace statistics
   */
  static getMarketplaceStats(): MarketplaceStats {
    if (this.marketplaceStats) return this.marketplaceStats;

    // Generate mock marketplace stats
    this.marketplaceStats = {
      totalVolume: Math.random() * 1000000 + 100000,
      totalTransactions: Math.floor(Math.random() * 50000) + 10000,
      activeUsers: Math.floor(Math.random() * 10000) + 1000,
      floorPrice: Math.random() * 10 + 0.1,
      topCollections: this.generateTopCollections(),
      trendingNFTs: this.generateTrendingNFTs(),
      volumeChart: this.generateVolumeChart(),
    };

    return this.marketplaceStats;
  }

  /**
   * Update marketplace stats
   */
  static updateMarketplaceStats(
    volume: number,
    transactionCount: number = 1
  ): void {
    if (!this.marketplaceStats) {
      this.getMarketplaceStats();
    }

    if (this.marketplaceStats) {
      this.marketplaceStats.totalVolume += volume;
      this.marketplaceStats.totalTransactions += transactionCount;
      this.marketplaceStats.activeUsers = Math.max(
        this.marketplaceStats.activeUsers,
        Math.floor(Math.random() * 100) + this.marketplaceStats.activeUsers
      );
    }
  }

  /**
   * Get NFT price history
   */
  static getNFTPriceHistory(
    nftId: string
  ): Array<{ date: number; price: number }> {
    // Mock price history
    const history = [];
    const now = Date.now();
    const basePrice = Math.random() * 20 + 1;

    for (let i = 29; i >= 0; i--) {
      const date = now - i * 24 * 60 * 60 * 1000;
      const price = basePrice + (Math.random() - 0.5) * basePrice * 0.3;
      history.push({ date, price: Math.max(price, 0.1) });
    }

    return history;
  }

  /**
   * Get collection analytics
   */
  static getCollectionAnalytics(collectionId: string): {
    volume24h: number;
    volume7d: number;
    volume30d: number;
    floorPrice: number;
    owners: number;
    listed: number;
    sales24h: number;
  } {
    return {
      volume24h: Math.random() * 1000 + 100,
      volume7d: Math.random() * 5000 + 500,
      volume30d: Math.random() * 20000 + 2000,
      floorPrice: Math.random() * 10 + 0.5,
      owners: Math.floor(Math.random() * 500) + 50,
      listed: Math.floor(Math.random() * 200) + 20,
      sales24h: Math.floor(Math.random() * 20) + 1,
    };
  }

  /**
   * Generate monthly stats for creator
   */
  private static generateMonthlyStats(): Array<{
    month: string;
    volume: number;
    sales: number;
  }> {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month) => ({
      month,
      volume: Math.random() * 2000 + 200,
      sales: Math.floor(Math.random() * 50) + 5,
    }));
  }

  /**
   * Generate recent sales for creator
   */
  private static generateRecentSales(): Array<{
    nftId: string;
    nftName: string;
    buyer: string;
    price: number;
    timestamp: number;
  }> {
    const sales = [];
    for (let i = 0; i < 5; i++) {
      sales.push({
        nftId: crypto.randomUUID(),
        nftName: `NFT #${Math.floor(Math.random() * 1000)}`,
        buyer: `User${Math.floor(Math.random() * 1000)}`,
        price: Math.random() * 20 + 1,
        timestamp: Date.now() - i * 24 * 60 * 60 * 1000,
      });
    }
    return sales;
  }

  /**
   * Generate top collections
   */
  private static generateTopCollections(): Array<{
    id: string;
    name: string;
    volume: number;
    change: number;
  }> {
    const collections = [];
    for (let i = 0; i < 5; i++) {
      collections.push({
        id: crypto.randomUUID(),
        name: `Collection ${i + 1}`,
        volume: Math.random() * 50000 + 5000,
        change: (Math.random() - 0.5) * 20,
      });
    }
    return collections.sort((a, b) => b.volume - a.volume);
  }

  /**
   * Generate trending NFTs
   */
  private static generateTrendingNFTs(): Array<{
    id: string;
    name: string;
    price: number;
    change: number;
  }> {
    const nfts = [];
    for (let i = 0; i < 10; i++) {
      nfts.push({
        id: crypto.randomUUID(),
        name: `Trending NFT ${i + 1}`,
        price: Math.random() * 50 + 5,
        change: (Math.random() - 0.5) * 30,
      });
    }
    return nfts.sort((a, b) => b.price - a.price);
  }

  /**
   * Generate volume chart data
   */
  private static generateVolumeChart(): Array<{
    date: string;
    volume: number;
  }> {
    const chart = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      chart.push({
        date: date.toISOString().split("T")[0],
        volume: Math.random() * 10000 + 1000,
      });
    }

    return chart;
  }

  /**
   * Export creator data (for creator dashboard)
   */
  static exportCreatorData(creatorAddress: string): string {
    const stats = this.getCreatorStats(creatorAddress);
    return JSON.stringify(stats, null, 2);
  }

  /**
   * Get user activity metrics
   */
  static getUserActivity(userAddress: string): {
    nftsOwned: number;
    nftsCreated: number;
    totalSpent: number;
    totalEarned: number;
    favoriteCollections: number;
    joinedDate: number;
  } {
    return {
      nftsOwned: Math.floor(Math.random() * 50) + 1,
      nftsCreated: Math.floor(Math.random() * 100) + 1,
      totalSpent: Math.random() * 5000 + 100,
      totalEarned: Math.random() * 10000 + 500,
      favoriteCollections: Math.floor(Math.random() * 20) + 1,
      joinedDate: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
    };
  }
}
