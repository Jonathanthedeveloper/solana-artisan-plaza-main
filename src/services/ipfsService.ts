import { create } from "ipfs-http-client";

// Provider selection via env
const IPFS_PROVIDER = (
  import.meta.env.VITE_IPFS_PROVIDER || "infura"
).toLowerCase();
const IPFS_PUBLIC_GATEWAY =
  import.meta.env.VITE_IPFS_PUBLIC_GATEWAY || "https://ipfs.io/ipfs/";

// Tokens for alternative providers
const WEB3STORAGE_TOKEN = import.meta.env.VITE_WEB3STORAGE_TOKEN as
  | string
  | undefined;
const NFT_STORAGE_TOKEN = import.meta.env.VITE_NFT_STORAGE_TOKEN as
  | string
  | undefined;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT as string | undefined;

// Custom IPFS HTTP API (for self-hosted nodes or third-party providers)
const CUSTOM_IPFS_API_URL = import.meta.env.VITE_IPFS_API_URL as
  | string
  | undefined;

// Infura project credentials (optional)
const INFURA_PROJECT_ID = import.meta.env.VITE_INFURA_PROJECT_ID as
  | string
  | undefined;
const INFURA_PROJECT_SECRET = import.meta.env.VITE_INFURA_PROJECT_SECRET as
  | string
  | undefined;

// Create an IPFS HTTP client when using an IPFS API-compatible endpoint
const createIPFSClient = () => {
  if (IPFS_PROVIDER === "custom-http" && CUSTOM_IPFS_API_URL) {
    // Custom API URL supports modern ipfs-http-client "url" option
    return create({ url: CUSTOM_IPFS_API_URL });
  }

  // Default to Infura-style config (still works for many IPFS API hosts)
  if (INFURA_PROJECT_ID && INFURA_PROJECT_SECRET) {
    const auth =
      "Basic " + btoa(INFURA_PROJECT_ID + ":" + INFURA_PROJECT_SECRET);
    return create({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
      headers: { authorization: auth },
    });
  }

  // Anonymous access to Infura API may be rate-limited or blocked
  return create({ host: "ipfs.infura.io", port: 5001, protocol: "https" });
};

// Only instantiate the ipfs-http client for providers that use the IPFS HTTP API
const ipfs =
  IPFS_PROVIDER === "web3storage" ||
  IPFS_PROVIDER === "nftstorage" ||
  IPFS_PROVIDER === "pinata"
    ? null
    : createIPFSClient();

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  external_url?: string;
  animation_url?: string;
  category:
    | "digital-art"
    | "collectibles"
    | "photography"
    | "video"
    | "audio"
    | "3d-models";
  creator: string;
  royalty_percentage: number;
  file_type?: "image" | "video" | "audio" | "3d" | "interactive";
  file_format?: string;
  collection_id?: string;
  series_info?: {
    series_name: string;
    series_number: number;
    total_in_series: number;
  };
}

export class IPFSService {
  /**
   * Upload file to IPFS
   */
  static async uploadFile(file: File): Promise<string> {
    try {
      switch (IPFS_PROVIDER) {
        case "web3storage": {
          if (!WEB3STORAGE_TOKEN)
            throw new Error(
              "WEB3STORAGE token missing (VITE_WEB3STORAGE_TOKEN)"
            );
          const res = await fetch("https://api.web3.storage/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${WEB3STORAGE_TOKEN}` },
            body: file,
          });
          if (!res.ok)
            throw new Error(`web3.storage upload failed: ${res.status}`);
          const data = (await res.json()) as { cid: string };
          return `${IPFS_PUBLIC_GATEWAY}${data.cid}`;
        }
        case "nftstorage": {
          if (!NFT_STORAGE_TOKEN)
            throw new Error(
              "NFT.STORAGE token missing (VITE_NFT_STORAGE_TOKEN)"
            );
          const res = await fetch("https://api.nft.storage/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${NFT_STORAGE_TOKEN}` },
            body: file,
          });
          if (!res.ok)
            throw new Error(`nft.storage upload failed: ${res.status}`);
          const data = (await res.json()) as {
            ok: boolean;
            value?: { cid: string };
          };
          const cid = data?.value?.cid;
          if (!cid) throw new Error("nft.storage response missing cid");
          return `${IPFS_PUBLIC_GATEWAY}${cid}`;
        }
        case "pinata": {
          if (!PINATA_JWT)
            throw new Error("Pinata JWT missing (VITE_PINATA_JWT)");
          const form = new FormData();
          form.append("file", file);
          const res = await fetch(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            {
              method: "POST",
              headers: { Authorization: `Bearer ${PINATA_JWT}` },
              body: form,
            }
          );
          if (!res.ok) throw new Error(`Pinata upload failed: ${res.status}`);
          const data = (await res.json()) as { IpfsHash: string };
          return `${IPFS_PUBLIC_GATEWAY}${data.IpfsHash}`;
        }
        case "custom-http":
        case "infura":
        default: {
          if (!ipfs) throw new Error("IPFS client not initialized");
          const result = await ipfs.add(file);
          return `${IPFS_PUBLIC_GATEWAY}${result.cid.toString()}`;
        }
      }
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
      throw new Error("Failed to upload file to IPFS");
    }
  }

  /**
   * Upload NFT metadata to IPFS
   */
  static async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    try {
      const metadataString = JSON.stringify(metadata);
      switch (IPFS_PROVIDER) {
        case "web3storage": {
          if (!WEB3STORAGE_TOKEN)
            throw new Error(
              "WEB3STORAGE token missing (VITE_WEB3STORAGE_TOKEN)"
            );
          const res = await fetch("https://api.web3.storage/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${WEB3STORAGE_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: metadataString,
          });
          if (!res.ok)
            throw new Error(`web3.storage upload failed: ${res.status}`);
          const data = (await res.json()) as { cid: string };
          return `${IPFS_PUBLIC_GATEWAY}${data.cid}`;
        }
        case "nftstorage": {
          if (!NFT_STORAGE_TOKEN)
            throw new Error(
              "NFT.STORAGE token missing (VITE_NFT_STORAGE_TOKEN)"
            );
          const res = await fetch("https://api.nft.storage/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${NFT_STORAGE_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: metadataString,
          });
          if (!res.ok)
            throw new Error(`nft.storage upload failed: ${res.status}`);
          const data = (await res.json()) as {
            ok: boolean;
            value?: { cid: string };
          };
          const cid = data?.value?.cid;
          if (!cid) throw new Error("nft.storage response missing cid");
          return `${IPFS_PUBLIC_GATEWAY}${cid}`;
        }
        case "pinata": {
          if (!PINATA_JWT)
            throw new Error("Pinata JWT missing (VITE_PINATA_JWT)");
          const res = await fetch(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${PINATA_JWT}`,
                "Content-Type": "application/json",
              },
              body: metadataString,
            }
          );
          if (!res.ok)
            throw new Error(`Pinata JSON upload failed: ${res.status}`);
          const data = (await res.json()) as { IpfsHash: string };
          return `${IPFS_PUBLIC_GATEWAY}${data.IpfsHash}`;
        }
        case "custom-http":
        case "infura":
        default: {
          if (!ipfs) throw new Error("IPFS client not initialized");
          const result = await ipfs.add(metadataString);
          return `${IPFS_PUBLIC_GATEWAY}${result.cid.toString()}`;
        }
      }
    } catch (error) {
      console.error("Error uploading metadata to IPFS:", error);
      throw new Error("Failed to upload metadata to IPFS");
    }
  }

  /**
   * Create complete NFT with image and metadata
   */
  static async createNFT(
    imageFile: File,
    metadata: Omit<NFTMetadata, "image">
  ): Promise<{ imageUrl: string; metadataUrl: string }> {
    try {
      // Upload image first
      const imageUrl = await this.uploadFile(imageFile);

      // Create complete metadata with image URL
      const completeMetadata: NFTMetadata = {
        ...metadata,
        image: imageUrl,
      };

      // Upload metadata
      const metadataUrl = await this.uploadMetadata(completeMetadata);

      return { imageUrl, metadataUrl };
    } catch (error) {
      console.error("Error creating NFT:", error);
      throw new Error("Failed to create NFT");
    }
  }

  /**
   * Create NFT with different file types (video, audio, 3D)
   */
  static async createAdvancedNFT(
    file: File,
    metadata: Omit<NFTMetadata, "image" | "animation_url">
  ): Promise<{ fileUrl: string; metadataUrl: string }> {
    try {
      // Determine file type
      const fileType = this.getFileType(file);
      const fileUrl = await this.uploadFile(file);

      // Create complete metadata
      const completeMetadata: NFTMetadata = {
        ...metadata,
        image: fileType === "image" ? fileUrl : `${fileUrl}#preview`, // Thumbnail for non-image files
        animation_url: fileType !== "image" ? fileUrl : undefined,
        file_type: fileType,
        file_format: file.type,
      };

      // Upload metadata
      const metadataUrl = await this.uploadMetadata(completeMetadata);

      return { fileUrl, metadataUrl };
    } catch (error) {
      console.error("Error creating advanced NFT:", error);
      throw new Error("Failed to create advanced NFT");
    }
  }

  /**
   * Determine file type from MIME type
   */
  static getFileType(
    file: File
  ): "image" | "video" | "audio" | "3d" | "interactive" {
    const type = file.type;

    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    if (type.startsWith("audio/")) return "audio";
    if (type.includes("gltf") || type.includes("obj") || type.includes("fbx"))
      return "3d";
    if (type.includes("html") || type.includes("javascript"))
      return "interactive";

    return "image"; // Default fallback
  }

  /**
   * Create NFT series (numbered collection)
   */
  static async createNFTSeries(
    baseFile: File,
    baseMetadata: Omit<NFTMetadata, "image" | "series_info">,
    seriesName: string,
    totalInSeries: number
  ): Promise<
    Array<{ fileUrl: string; metadataUrl: string; seriesNumber: number }>
  > {
    const results = [];

    for (let i = 1; i <= totalInSeries; i++) {
      const seriesMetadata = {
        ...baseMetadata,
        name: `${baseMetadata.name} #${i}`,
        series_info: {
          series_name: seriesName,
          series_number: i,
          total_in_series: totalInSeries,
        },
      };

      const result = await this.createAdvancedNFT(baseFile, seriesMetadata);
      results.push({ ...result, seriesNumber: i });
    }

    return results;
  }

  /**
   * Fetch metadata from IPFS
   */
  static async getMetadata(ipfsHash: string): Promise<NFTMetadata> {
    try {
      const response = await fetch(
        ipfsHash.startsWith("http")
          ? ipfsHash
          : `${IPFS_PUBLIC_GATEWAY}${ipfsHash}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch metadata");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching metadata from IPFS:", error);
      throw new Error("Failed to fetch metadata from IPFS");
    }
  }
}

export default IPFSService;
