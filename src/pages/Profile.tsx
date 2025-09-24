import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from "@/components/Navigation";
import { User, Settings, Grid, History, Wallet } from "lucide-react";
import { toast } from "sonner";
import SupabaseService from "@/services/supabaseService";
import { Database } from "@/integrations/supabase/types";
import SolanaService from "@/services/solanaService";

// Profile component for user management
const Profile = () => {
  const wallet = useWallet();
  const [userProfile, setUserProfile] = useState<
    Database["public"]["Tables"]["users"]["Row"] | null
  >(null);
  const [userNFTs, setUserNFTs] = useState<
    Database["public"]["Tables"]["nfts"]["Row"][]
  >([]);
  const [transactions, setTransactions] = useState<
    Database["public"]["Tables"]["transactions"]["Row"][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [balance, setBalance] = useState(0);

  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
    profile_image_url: "",
  });

  const loadUserData = useCallback(async () => {
    if (!wallet.publicKey) return;

    try {
      // Load user profile
      const profile = await SupabaseService.getUserByWallet(
        wallet.publicKey.toString()
      );
      if (profile) {
        setUserProfile(profile);
        setEditForm({
          username: profile.username || "",
          bio: profile.bio || "",
          profile_image_url: profile.profile_image_url || "",
        });
      }

      // Load user's NFTs
      const nfts = await SupabaseService.getNFTs({
        creator: wallet.publicKey.toString(),
        limit: 50,
      });
      setUserNFTs(nfts);

      // Load transactions
      const txns = await SupabaseService.getUserTransactions(
        wallet.publicKey.toString()
      );
      setTransactions(txns);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey]);

  const loadBalance = useCallback(async () => {
    if (!wallet.publicKey) return;

    try {
      const bal = await SolanaService.getBalance(wallet.publicKey);
      setBalance(bal);
    } catch (error) {
      console.error("Error loading balance:", error);
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    if (wallet.publicKey) {
      loadUserData();
      loadBalance();
    }
  }, [wallet.publicKey, wallet.connected, loadBalance, loadUserData]);

  const handleSaveProfile = async () => {
    if (!wallet.publicKey) return;

    try {
      const updatedProfile = await SupabaseService.upsertUser({
        wallet_address: wallet.publicKey.toString(),
        username: editForm.username,
        bio: editForm.bio,
        profile_image_url: editForm.profile_image_url,
      });

      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setEditing(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-6 py-20 text-center">
          <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-muted-foreground mb-8">
            Please connect your wallet to view your profile
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-6 py-20 text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-6 py-20">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="p-8 glass-card">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <Avatar className="w-32 h-32">
                <AvatarImage src={userProfile?.profile_image_url} />
                <AvatarFallback className="text-4xl">
                  {userProfile?.username?.[0]?.toUpperCase() ||
                    wallet.publicKey?.toString().slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {userProfile?.username || "Anonymous User"}
                </h1>
                <p className="text-muted-foreground mb-4">
                  {wallet.publicKey?.toString()}
                </p>
                {userProfile?.bio && (
                  <p className="text-foreground mb-4">{userProfile.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {userNFTs.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      NFTs Created
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {balance.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      SOL Balance
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {transactions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Transactions
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setEditing(!editing)}>
                  <Settings className="w-4 h-4 mr-2" />
                  {editing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </div>

            {/* Edit Form */}
            {editing && (
              <div className="mt-8 pt-8 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm({ ...editForm, username: e.target.value })
                      }
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile_image_url">Profile Image URL</Label>
                    <Input
                      id="profile_image_url"
                      value={editForm.profile_image_url}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          profile_image_url: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-gradient-solana"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="nfts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nfts" className="flex items-center space-x-2">
              <Grid className="w-4 h-4" />
              <span>My NFTs</span>
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="flex items-center space-x-2"
            >
              <History className="w-4 h-4" />
              <span>Transaction History</span>
            </TabsTrigger>
            <TabsTrigger
              value="collected"
              className="flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Collected</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nfts" className="mt-8">
            {userNFTs.length === 0 ? (
              <Card className="p-12 text-center glass-card">
                <Grid className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No NFTs Created Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start creating your first NFT masterpiece
                </p>
                <Button className="bg-gradient-solana">
                  Create Your First NFT
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userNFTs.map((nft) => (
                  <Card
                    key={nft.id}
                    className="group nft-card border-0 overflow-hidden"
                  >
                    <div className="relative">
                      <img
                        src={nft.image_url}
                        alt={nft.name}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white border-0"
                        >
                          {nft.is_listed ? "Listed" : "Unlisted"}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {nft.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        {nft.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold bg-gradient-solana bg-clip-text text-transparent">
                          {nft.price ? `${nft.price} SOL` : "Not listed"}
                        </div>
                        <Badge variant="outline">{nft.category}</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="mt-8">
            {transactions.length === 0 ? (
              <Card className="p-12 text-center glass-card">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Transactions Yet
                </h3>
                <p className="text-muted-foreground">
                  Your transaction history will appear here
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <Card key={tx.id} className="p-6 glass-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            tx.status === "completed"
                              ? "bg-green-500"
                              : tx.status === "pending"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        />
                        <div>
                          <p className="font-semibold text-foreground">
                            Transaction #{tx.id.slice(0, 8)}...
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{tx.price} SOL</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="collected" className="mt-8">
            <Card className="p-12 text-center glass-card">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Coming Soon
              </h3>
              <p className="text-muted-foreground">
                Collected NFTs feature is under development
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
