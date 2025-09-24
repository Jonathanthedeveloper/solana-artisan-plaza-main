import { WalletContextState } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import SolanaService from "./solanaService";

export interface Bid {
  id: string;
  nftId: string;
  bidder: string;
  amount: number;
  timestamp: number;
  status: "active" | "won" | "outbid" | "cancelled";
}

export interface Auction {
  id: string;
  nftId: string;
  seller: string;
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  startTime: number;
  endTime: number;
  status: "active" | "ended" | "cancelled";
  highestBid?: Bid;
  totalBids: number;
}

export class BiddingService {
  private static auctions: Map<string, Auction> = new Map();
  private static bids: Map<string, Bid[]> = new Map();

  /**
   * Create a new auction
   */
  static async createAuction(
    wallet: WalletContextState,
    nftId: string,
    startingPrice: number,
    durationHours: number,
    reservePrice?: number
  ): Promise<Auction | null> {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error("Please connect your wallet first");
      return null;
    }

    try {
      const auctionId = crypto.randomUUID();
      const now = Date.now();
      const endTime = now + durationHours * 60 * 60 * 1000;

      const auction: Auction = {
        id: auctionId,
        nftId,
        seller: wallet.publicKey.toString(),
        startingPrice,
        currentPrice: startingPrice,
        reservePrice,
        startTime: now,
        endTime,
        status: "active",
        totalBids: 0,
      };

      this.auctions.set(auctionId, auction);
      this.bids.set(auctionId, []);

      toast.success("Auction created successfully!");
      return auction;
    } catch (error) {
      console.error("Error creating auction:", error);
      toast.error("Failed to create auction");
      return null;
    }
  }

  /**
   * Place a bid on an auction
   */
  static async placeBid(
    wallet: WalletContextState,
    auctionId: string,
    bidAmount: number
  ): Promise<Bid | null> {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error("Please connect your wallet first");
      return null;
    }

    const auction = this.auctions.get(auctionId);
    if (!auction) {
      toast.error("Auction not found");
      return null;
    }

    if (auction.status !== "active") {
      toast.error("Auction is not active");
      return null;
    }

    if (Date.now() > auction.endTime) {
      toast.error("Auction has ended");
      return null;
    }

    if (bidAmount <= auction.currentPrice) {
      toast.error(
        `Bid must be higher than current price of ${auction.currentPrice} SOL`
      );
      return null;
    }

    try {
      // Process payment for bid (escrow system would be better in production)
      const success = await SolanaService.processBidPayment(wallet, bidAmount);

      if (!success) {
        toast.error("Failed to process bid payment");
        return null;
      }

      const bid: Bid = {
        id: crypto.randomUUID(),
        nftId: auction.nftId,
        bidder: wallet.publicKey.toString(),
        amount: bidAmount,
        timestamp: Date.now(),
        status: "active",
      };

      // Update auction
      auction.currentPrice = bidAmount;
      auction.highestBid = bid;
      auction.totalBids++;

      // Update bids list
      const auctionBids = this.bids.get(auctionId) || [];
      auctionBids.push(bid);
      this.bids.set(auctionId, auctionBids);

      // Outbid notification (simplified)
      if (auctionBids.length > 1) {
        const previousHighestBid = auctionBids[auctionBids.length - 2];
        // In production, you'd send a notification to the previous bidder
        console.log(`User ${previousHighestBid.bidder} was outbid`);
      }

      toast.success(`Bid of ${bidAmount} SOL placed successfully!`);
      return bid;
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error("Failed to place bid");
      return null;
    }
  }

  /**
   * End an auction
   */
  static async endAuction(auctionId: string): Promise<boolean> {
    const auction = this.auctions.get(auctionId);
    if (!auction) {
      toast.error("Auction not found");
      return false;
    }

    if (auction.status !== "active") {
      toast.error("Auction is not active");
      return false;
    }

    try {
      auction.status = "ended";

      if (
        auction.highestBid &&
        auction.reservePrice &&
        auction.highestBid.amount >= auction.reservePrice
      ) {
        // Transfer NFT to winner and payment to seller
        await SolanaService.finalizeAuction(auction);
        toast.success("Auction ended successfully! NFT transferred to winner.");
      } else if (auction.highestBid) {
        // Reserve price not met, refund bidder
        await SolanaService.refundBid(auction.highestBid);
        toast.info("Auction ended. Reserve price not met - bid refunded.");
      } else {
        toast.info("Auction ended with no bids.");
      }

      return true;
    } catch (error) {
      console.error("Error ending auction:", error);
      toast.error("Failed to end auction");
      return false;
    }
  }

  /**
   * Get auction by ID
   */
  static getAuction(auctionId: string): Auction | undefined {
    return this.auctions.get(auctionId);
  }

  /**
   * Get all active auctions
   */
  static getActiveAuctions(): Auction[] {
    return Array.from(this.auctions.values()).filter(
      (auction) => auction.status === "active"
    );
  }

  /**
   * Get bids for an auction
   */
  static getAuctionBids(auctionId: string): Bid[] {
    return this.bids.get(auctionId) || [];
  }

  /**
   * Get user's active bids
   */
  static getUserBids(userAddress: string): Bid[] {
    const userBids: Bid[] = [];

    for (const bids of this.bids.values()) {
      userBids.push(
        ...bids.filter(
          (bid) => bid.bidder === userAddress && bid.status === "active"
        )
      );
    }

    return userBids;
  }

  /**
   * Cancel a bid (if auction allows it)
   */
  static async cancelBid(
    wallet: WalletContextState,
    bidId: string
  ): Promise<boolean> {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error("Please connect your wallet first");
      return false;
    }

    try {
      // Find the bid
      let foundBid: Bid | undefined;
      let auctionId: string | undefined;

      for (const [auctionIdKey, bids] of this.bids.entries()) {
        foundBid = bids.find(
          (bid) =>
            bid.id === bidId && bid.bidder === wallet.publicKey.toString()
        );
        if (foundBid) {
          auctionId = auctionIdKey;
          break;
        }
      }

      if (!foundBid || !auctionId) {
        toast.error("Bid not found");
        return false;
      }

      const auction = this.auctions.get(auctionId);
      if (!auction || auction.status !== "active") {
        toast.error("Cannot cancel bid on ended auction");
        return false;
      }

      // Refund the bid amount
      await SolanaService.refundBid(foundBid);

      // Update bid status
      foundBid.status = "cancelled";

      // If this was the highest bid, update auction
      if (auction.highestBid?.id === bidId) {
        const auctionBids = this.bids.get(auctionId) || [];
        const activeBids = auctionBids.filter((bid) => bid.status === "active");
        if (activeBids.length > 0) {
          // Set new highest bid
          const newHighestBid = activeBids.reduce((prev, current) =>
            prev.amount > current.amount ? prev : current
          );
          auction.highestBid = newHighestBid;
          auction.currentPrice = newHighestBid.amount;
        } else {
          // No more active bids
          auction.highestBid = undefined;
          auction.currentPrice = auction.startingPrice;
        }
      }

      toast.success("Bid cancelled and refunded");
      return true;
    } catch (error) {
      console.error("Error cancelling bid:", error);
      toast.error("Failed to cancel bid");
      return false;
    }
  }

  /**
   * Get all auctions (active, ended, cancelled)
   */
  static getAllAuctions(): Auction[] {
    return Array.from(this.auctions.values());
  }
}
