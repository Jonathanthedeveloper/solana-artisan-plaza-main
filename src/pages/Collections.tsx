import Navigation from "@/components/Navigation";
import CollectionCard from "@/components/CollectionCard";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQueryState } from "nuqs";
import { CollectionsService } from "@/services/collectionsService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [create, setCreate] = useQueryState("create", { defaultValue: null });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    category: "art",
  });
  const { toast } = useToast();
  const wallet = useWallet();

  useEffect(() => {
    // Check if create parameter is present
    if (create === "true") {
      setShowCreateForm(true);
    } else {
      setShowCreateForm(false);
    }
  }, [create]);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const allCollections = await CollectionsService.getAllCollections();
        setCollections(allCollections);
        setFilteredCollections(allCollections);
      } catch (error) {
        console.error("Error loading collections:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCollections();
  }, []);

  const handleCreateCollection = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      if (!wallet.publicKey) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to create a collection.",
          variant: "destructive",
        });
        return;
      }

      const created = await CollectionsService.createCollection(
        createFormData.name,
        createFormData.description,
        wallet.publicKey.toString(),
        "",
        createFormData.category
      );

      if (created) {
        // Refresh list
        const allCollections = await CollectionsService.getAllCollections();
        setCollections(allCollections);
        setFilteredCollections(allCollections);

        // Reset form and hide
        setCreateFormData({ name: "", description: "", category: "art" });
        setShowCreateForm(false);
        // Remove create parameter from URL
        setCreate(null);
        // Show success message
        toast({
          title: "Collection Created",
          description: "Your new collection has been created successfully.",
        });
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      toast({
        title: "Error",
        description: "Failed to create collection. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let filtered = collections;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (collection) =>
          collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          collection.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          collection.creator.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "mostFavorited":
          return (b.favorites || 0) - (a.favorites || 0);
        case "highestVolume":
          return (b.totalVolume || 0) - (a.totalVolume || 0);
        default:
          return 0;
      }
    });

    setFilteredCollections(filtered);
  }, [searchTerm, sortBy, collections]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading collections...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">NFT Collections</h1>
          <p className="text-muted-foreground mb-6">
            Explore curated collections of digital art and collectibles
          </p>

          {/* Create Collection Form */}
          {showCreateForm && (
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">
                Create New Collection
              </h2>
              <form onSubmit={handleCreateCollection} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Collection Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter collection name"
                    value={createFormData.name}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Input
                    type="text"
                    placeholder="Describe your collection"
                    value={createFormData.description}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <Select
                    value={createFormData.category}
                    onValueChange={(value) =>
                      setCreateFormData({ ...createFormData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="art">Digital Art</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="collectibles">Collectibles</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-4">
                  <Button type="submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Collection
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setCreate(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Search and Sort Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-1/3"
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="md:w-1/4">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="mostFavorited">Most Favorited</SelectItem>
                <SelectItem value="highestVolume">Highest Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCollections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">
              {searchTerm
                ? "No collections match your search"
                : "No collections available yet"}
            </div>
            <Button onClick={() => setSearchTerm("")} variant="outline">
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
