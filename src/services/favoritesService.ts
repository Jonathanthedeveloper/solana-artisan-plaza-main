import { toast } from "sonner";

export interface FavoriteItem {
  id: string;
  userAddress: string;
  nftId: string;
  addedAt: number;
}

export interface WatchlistItem {
  id: string;
  userAddress: string;
  collectionId: string;
  addedAt: number;
}

export class FavoritesService {
  private static favorites: Map<string, FavoriteItem[]> = new Map();
  private static watchlists: Map<string, WatchlistItem[]> = new Map();

  /**
   * Add NFT to favorites
   */
  static async addToFavorites(
    userAddress: string,
    nftId: string
  ): Promise<boolean> {
    try {
      const userFavorites = this.favorites.get(userAddress) || [];

      // Check if already favorited
      const existing = userFavorites.find((fav) => fav.nftId === nftId);
      if (existing) {
        toast.info("NFT is already in your favorites");
        return false;
      }

      const favorite: FavoriteItem = {
        id: crypto.randomUUID(),
        userAddress,
        nftId,
        addedAt: Date.now(),
      };

      userFavorites.push(favorite);
      this.favorites.set(userAddress, userFavorites);

      toast.success("Added to favorites!");
      return true;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      toast.error("Failed to add to favorites");
      return false;
    }
  }

  /**
   * Remove NFT from favorites
   */
  static async removeFromFavorites(
    userAddress: string,
    nftId: string
  ): Promise<boolean> {
    try {
      const userFavorites = this.favorites.get(userAddress) || [];
      const filteredFavorites = userFavorites.filter(
        (fav) => fav.nftId !== nftId
      );

      if (filteredFavorites.length === userFavorites.length) {
        toast.info("NFT not found in favorites");
        return false;
      }

      this.favorites.set(userAddress, filteredFavorites);
      toast.success("Removed from favorites");
      return true;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      toast.error("Failed to remove from favorites");
      return false;
    }
  }

  /**
   * Check if NFT is favorited by user
   */
  static isFavorited(userAddress: string, nftId: string): boolean {
    const userFavorites = this.favorites.get(userAddress) || [];
    return userFavorites.some((fav) => fav.nftId === nftId);
  }

  /**
   * Get user's favorite NFTs
   */
  static getUserFavorites(userAddress: string): FavoriteItem[] {
    return this.favorites.get(userAddress) || [];
  }

  /**
   * Add collection to watchlist
   */
  static async addToWatchlist(
    userAddress: string,
    collectionId: string
  ): Promise<boolean> {
    try {
      const userWatchlist = this.watchlists.get(userAddress) || [];

      // Check if already in watchlist
      const existing = userWatchlist.find(
        (item) => item.collectionId === collectionId
      );
      if (existing) {
        toast.info("Collection is already in your watchlist");
        return false;
      }

      const watchlistItem: WatchlistItem = {
        id: crypto.randomUUID(),
        userAddress,
        collectionId,
        addedAt: Date.now(),
      };

      userWatchlist.push(watchlistItem);
      this.watchlists.set(userAddress, userWatchlist);

      toast.success("Added to watchlist!");
      return true;
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      toast.error("Failed to add to watchlist");
      return false;
    }
  }

  /**
   * Remove collection from watchlist
   */
  static async removeFromWatchlist(
    userAddress: string,
    collectionId: string
  ): Promise<boolean> {
    try {
      const userWatchlist = this.watchlists.get(userAddress) || [];
      const filteredWatchlist = userWatchlist.filter(
        (item) => item.collectionId !== collectionId
      );

      if (filteredWatchlist.length === userWatchlist.length) {
        toast.info("Collection not found in watchlist");
        return false;
      }

      this.watchlists.set(userAddress, filteredWatchlist);
      toast.success("Removed from watchlist");
      return true;
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      toast.error("Failed to remove from watchlist");
      return false;
    }
  }

  /**
   * Check if collection is in user's watchlist
   */
  static isInWatchlist(userAddress: string, collectionId: string): boolean {
    const userWatchlist = this.watchlists.get(userAddress) || [];
    return userWatchlist.some((item) => item.collectionId === collectionId);
  }

  /**
   * Get user's watchlist
   */
  static getUserWatchlist(userAddress: string): WatchlistItem[] {
    return this.watchlists.get(userAddress) || [];
  }

  /**
   * Get favorite statistics for an NFT
   */
  static getFavoriteStats(nftId: string): {
    totalFavorites: number;
    recentFavorites: number;
  } {
    let totalFavorites = 0;
    let recentFavorites = 0;
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    for (const userFavorites of this.favorites.values()) {
      const nftFavorite = userFavorites.find((fav) => fav.nftId === nftId);
      if (nftFavorite) {
        totalFavorites++;
        if (nftFavorite.addedAt > oneWeekAgo) {
          recentFavorites++;
        }
      }
    }

    return { totalFavorites, recentFavorites };
  }

  /**
   * Get watchlist statistics for a collection
   */
  static getWatchlistStats(collectionId: string): {
    totalWatchers: number;
    recentWatchers: number;
  } {
    let totalWatchers = 0;
    let recentWatchers = 0;
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    for (const userWatchlist of this.watchlists.values()) {
      const collectionItem = userWatchlist.find(
        (item) => item.collectionId === collectionId
      );
      if (collectionItem) {
        totalWatchers++;
        if (collectionItem.addedAt > oneWeekAgo) {
          recentWatchers++;
        }
      }
    }

    return { totalWatchers, recentWatchers };
  }

  /**
   * Get most favorited NFTs (for trending)
   */
  static getMostFavorited(
    limit: number = 10
  ): Array<{ nftId: string; favorites: number }> {
    const favoriteCounts = new Map<string, number>();

    for (const userFavorites of this.favorites.values()) {
      for (const favorite of userFavorites) {
        favoriteCounts.set(
          favorite.nftId,
          (favoriteCounts.get(favorite.nftId) || 0) + 1
        );
      }
    }

    return Array.from(favoriteCounts.entries())
      .map(([nftId, favorites]) => ({ nftId, favorites }))
      .sort((a, b) => b.favorites - a.favorites)
      .slice(0, limit);
  }

  /**
   * Get most watched collections
   */
  static getMostWatched(
    limit: number = 10
  ): Array<{ collectionId: string; watchers: number }> {
    const watchlistCounts = new Map<string, number>();

    for (const userWatchlist of this.watchlists.values()) {
      for (const item of userWatchlist) {
        watchlistCounts.set(
          item.collectionId,
          (watchlistCounts.get(item.collectionId) || 0) + 1
        );
      }
    }

    return Array.from(watchlistCounts.entries())
      .map(([collectionId, watchers]) => ({ collectionId, watchers }))
      .sort((a, b) => b.watchers - a.watchers)
      .slice(0, limit);
  }
}
