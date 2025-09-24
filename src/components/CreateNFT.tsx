import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWallet } from "@solana/wallet-adapter-react";
import { Upload, Zap } from "lucide-react";
import { toast } from "sonner";
import IPFSService, { NFTMetadata } from "@/services/ipfsService";
import SolanaService from "@/services/solanaService";
import SupabaseService from "@/services/supabaseService";

interface CreateNFTProps {
  onClose?: () => void;
}

const CreateNFT = ({ onClose }: CreateNFTProps) => {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "digital-art" as
      | "digital-art"
      | "collectibles"
      | "photography"
      | "video"
      | "audio"
      | "3d-models",
    price: "",
    royalty: "",
    externalUrl: "",
    attributes: [{ trait_type: "", value: "" }],
    collectionId: "",
    createCollection: false,
    collectionName: "",
    collectionDescription: "",
    seriesCount: 1,
    isSeries: false,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type based on category
      const allowedTypes = getAllowedFileTypes(formData.category);
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `Invalid file type for ${
            formData.category
          }. Allowed: ${allowedTypes.join(", ")}`
        );
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getAllowedFileTypes = (category: string): string[] => {
    switch (category) {
      case "video":
        return ["video/mp4", "video/webm", "video/ogg"];
      case "audio":
        return ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3"];
      case "3d-models":
        return [
          "model/gltf+json",
          "model/gltf-binary",
          "application/octet-stream",
        ];
      default:
        return [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/svg+xml",
        ];
    }
  };

  const handleAttributeChange = (
    index: number,
    field: "trait_type" | "value",
    value: string
  ) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index][field] = value;
    setFormData({ ...formData, attributes: newAttributes });
  };

  const addAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, { trait_type: "", value: "" }],
    });
  };

  const removeAttribute = (index: number) => {
    if (formData.attributes.length > 1) {
      const newAttributes = formData.attributes.filter((_, i) => i !== index);
      setFormData({ ...formData, attributes: newAttributes });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.connected || !wallet.publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!imageFile) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);

    try {
      let collectionId = formData.collectionId;

      // Create collection if requested
      if (formData.createCollection && formData.collectionName) {
        const { CollectionsService } = await import(
          "@/services/collectionsService"
        );
        const collection = await CollectionsService.createCollection(
          formData.collectionName,
          formData.collectionDescription,
          wallet.publicKey.toString(),
          "", // Will be set after first NFT upload
          formData.category
        );
        if (collection) {
          collectionId = collection.id;
          toast.success("Collection created!");
        }
      }

      if (formData.isSeries && formData.seriesCount > 1) {
        // Create NFT series
        const seriesResults = await IPFSService.createNFTSeries(
          imageFile,
          {
            name: formData.name,
            description: formData.description,
            attributes: formData.attributes.filter(
              (attr) => attr.trait_type && attr.value
            ),
            external_url: formData.externalUrl,
            category: formData.category,
            creator: wallet.publicKey.toString(),
            royalty_percentage: parseFloat(formData.royalty) || 0,
            collection_id: collectionId,
          },
          `${formData.name} Series`,
          formData.seriesCount
        );

        // Mint each NFT in the series
        for (const result of seriesResults) {
          const signature = await SolanaService.mintNFT(
            wallet,
            result.metadataUrl,
            parseFloat(formData.price)
          );

          if (signature) {
            const nftData = {
              name: `${formData.name} #${result.seriesNumber}`,
              description: formData.description,
              image_url: result.fileUrl,
              metadata_url: result.metadataUrl,
              category: formData.category,
              creator_address: wallet.publicKey.toString(),
              owner_address: wallet.publicKey.toString(),
              price: parseFloat(formData.price),
              royalty_percentage: parseFloat(formData.royalty) || 0,
              attributes: formData.attributes.filter(
                (attr) => attr.trait_type && attr.value
              ),
              external_url: formData.externalUrl,
              is_listed: true,
              collection_id: collectionId,
              series_info: {
                series_name: `${formData.name} Series`,
                series_number: result.seriesNumber,
                total_in_series: formData.seriesCount,
              },
            };

            const savedNFT = await SupabaseService.createNFT(nftData);

            // Create user profile if it doesn't exist
            await SupabaseService.upsertUser({
              wallet_address: wallet.publicKey.toString(),
            });

            // Add to collection if exists
            if (collectionId && savedNFT) {
              const { CollectionsService } = await import(
                "@/services/collectionsService"
              );
              await CollectionsService.addNFTToCollection(
                collectionId,
                savedNFT.id,
                formData.attributes.filter(
                  (attr) => attr.trait_type && attr.value
                )
              );
            }
          }
        }

        toast.success(
          `${formData.seriesCount} NFTs created and minted successfully!`
        );
      } else {
        // Create single NFT
        const metadata: Omit<NFTMetadata, "image"> = {
          name: formData.name,
          description: formData.description,
          attributes: formData.attributes.filter(
            (attr) => attr.trait_type && attr.value
          ),
          external_url: formData.externalUrl,
          category: formData.category,
          creator: wallet.publicKey.toString(),
          royalty_percentage: parseFloat(formData.royalty) || 0,
          collection_id: collectionId,
        };

        // Upload to IPFS
        const { fileUrl, metadataUrl } = await IPFSService.createAdvancedNFT(
          imageFile,
          metadata
        );

        toast.success("NFT metadata uploaded to IPFS!");

        // Mint NFT on Solana
        const signature = await SolanaService.mintNFT(
          wallet,
          metadataUrl,
          parseFloat(formData.price)
        );

        if (signature) {
          // Save to Supabase
          const nftData = {
            name: formData.name,
            description: formData.description,
            image_url: fileUrl,
            metadata_url: metadataUrl,
            category: formData.category,
            creator_address: wallet.publicKey.toString(),
            owner_address: wallet.publicKey.toString(),
            price: parseFloat(formData.price),
            royalty_percentage: parseFloat(formData.royalty) || 0,
            attributes: formData.attributes.filter(
              (attr) => attr.trait_type && attr.value
            ),
            external_url: formData.externalUrl,
            is_listed: true,
            collection_id: collectionId,
          };

          const savedNFT = await SupabaseService.createNFT(nftData);

          if (savedNFT) {
            // Create user profile if it doesn't exist
            await SupabaseService.upsertUser({
              wallet_address: wallet.publicKey.toString(),
            });

            // Add to collection if exists
            if (collectionId) {
              const { CollectionsService } = await import(
                "@/services/collectionsService"
              );
              await CollectionsService.addNFTToCollection(
                collectionId,
                savedNFT.id,
                formData.attributes.filter(
                  (attr) => attr.trait_type && attr.value
                )
              );
            }

            toast.success("NFT created and minted successfully!");
            onClose?.();
          } else {
            toast.error("NFT minted but failed to save to database");
          }
        }
      }
    } catch (error) {
      console.error("Error creating NFT:", error);
      toast.error("Failed to create NFT");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl glass-card border-0 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-solana bg-clip-text text-transparent">
              Create NFT
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Image *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-48 h-48 object-cover mx-auto rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setImagePreview("")}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <span className="text-primary">Click to upload</span> or
                        drag and drop
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept={getAllowedFileTypes(formData.category).join(
                          ","
                        )}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter NFT name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: string) =>
                    setFormData({
                      ...formData,
                      category: value as typeof formData.category,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital-art">Digital Art</SelectItem>
                    <SelectItem value="collectibles">Collectibles</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="3d-models">3D Models</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your NFT"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (SOL) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="royalty">Royalty (%)</Label>
                <Input
                  id="royalty"
                  type="number"
                  step="0.1"
                  max="50"
                  value={formData.royalty}
                  onChange={(e) =>
                    setFormData({ ...formData, royalty: e.target.value })
                  }
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalUrl">External Link</Label>
              <Input
                id="externalUrl"
                value={formData.externalUrl}
                onChange={(e) =>
                  setFormData({ ...formData, externalUrl: e.target.value })
                }
                placeholder="https://your-website.com"
              />
            </div>

            {/* Attributes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Attributes</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAttribute}
                >
                  Add Attribute
                </Button>
              </div>
              {formData.attributes.map((attr, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Trait type"
                    value={attr.trait_type}
                    onChange={(e) =>
                      handleAttributeChange(index, "trait_type", e.target.value)
                    }
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Value"
                      value={attr.value}
                      onChange={(e) =>
                        handleAttributeChange(index, "value", e.target.value)
                      }
                    />
                    {formData.attributes.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAttribute(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-solana hover:opacity-90"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Creating NFT...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Create & Mint NFT
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CreateNFT;
