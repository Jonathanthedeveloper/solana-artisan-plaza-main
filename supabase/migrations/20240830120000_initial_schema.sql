-- Create NFTs table
CREATE TABLE IF NOT EXISTS nfts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  metadata_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('digital-art', 'collectibles', 'photography')),
  creator_address TEXT NOT NULL,
  owner_address TEXT NOT NULL,
  price DECIMAL(10,2),
  royalty_percentage DECIMAL(5,2) DEFAULT 0,
  attributes JSONB DEFAULT '[]',
  external_url TEXT,
  is_listed BOOLEAN DEFAULT true,
  mint_address TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  bio TEXT,
  profile_image_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
  seller_address TEXT NOT NULL,
  buyer_address TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  transaction_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_address TEXT NOT NULL,
  cover_image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('digital-art', 'collectibles', 'photography')),
  floor_price DECIMAL(10,2),
  total_volume DECIMAL(10,2) DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collection_nfts junction table
CREATE TABLE IF NOT EXISTS collection_nfts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, nft_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nfts_creator ON nfts(creator_address);
CREATE INDEX IF NOT EXISTS idx_nfts_owner ON nfts(owner_address);
CREATE INDEX IF NOT EXISTS idx_nfts_category ON nfts(category);
CREATE INDEX IF NOT EXISTS idx_nfts_price ON nfts(price);
CREATE INDEX IF NOT EXISTS idx_nfts_created_at ON nfts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_address);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_address);
CREATE INDEX IF NOT EXISTS idx_collections_creator ON collections(creator_address);
CREATE INDEX IF NOT EXISTS idx_collections_category ON collections(category);

-- Enable Row Level Security
ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_nfts ENABLE ROW LEVEL SECURITY;

-- Create policies for NFTs
CREATE POLICY "Anyone can view NFTs" ON nfts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own NFTs" ON nfts FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = creator_address);
CREATE POLICY "Users can update their own NFTs" ON nfts FOR UPDATE USING (auth.jwt() ->> 'sub' = creator_address);

-- Create policies for users
CREATE POLICY "Anyone can view users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = wallet_address);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.jwt() ->> 'sub' = wallet_address);

-- Create policies for transactions
CREATE POLICY "Anyone can view transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Users can insert transactions they're involved in" ON transactions FOR INSERT WITH CHECK (
  auth.jwt() ->> 'sub' = seller_address OR auth.jwt() ->> 'sub' = buyer_address
);

-- Create policies for collections
CREATE POLICY "Anyone can view collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Users can create collections" ON collections FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = creator_address);
CREATE POLICY "Users can update their own collections" ON collections FOR UPDATE USING (auth.jwt() ->> 'sub' = creator_address);

-- Create policies for collection_nfts
CREATE POLICY "Anyone can view collection NFTs" ON collection_nfts FOR SELECT USING (true);
CREATE POLICY "Collection creators can manage their collection NFTs" ON collection_nfts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = collection_nfts.collection_id
    AND collections.creator_address = auth.jwt() ->> 'sub'
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_nfts_updated_at BEFORE UPDATE ON nfts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
