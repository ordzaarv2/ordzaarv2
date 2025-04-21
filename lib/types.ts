// Application Types
export interface Application {
  id: string;
  _id: string;   // MongoDB ObjectID
  name: string;
  slug: string;
  description: string;
  creator: string;
  price: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  stats: {
    totalSupply: number;
    minted: number;
  };
  assets: {
    images: string[];
    metadata?: string;
  };
  isComplete: boolean;
}

// Collection Types
export interface Collection {
  id: string;
  _id: string;   // MongoDB ObjectID
  name: string;
  slug: string;
  description: string;
  image: string;
  creator: string;
  price: string;
  totalSupply: number;
  minted: number;
  stats: {
    volume: number;
    sales: number;
    floorPrice: string;
  };
  settings: {
    isVisible: boolean;
    royaltyPercentage: number;
  };
  createdAt: string;
}

// Ordinal Types
export interface Ordinal {
  id: string;
  name: string;
  description: string;
  image: string;
  ordinalNumber: number;
  collection: string; // Collection ID reference
  price: string;
  owner: string;
  status: 'pending' | 'minted' | 'failed';
  blockchainData?: {
    txid: string;
    inscriptionId: string;
    contentType: string;
    address: string;
  };
  mintedAt?: string;
}

// User Types
export interface User {
  id: string;
  username: string;
  address: string;
  profileImage?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

// Wallet Types
export interface WalletConnection {
  address: string;
  provider: 'xverse' | 'unisat' | 'other';
  connected: boolean;
}

// Transaction Types
export interface Transaction {
  id: string;
  txid?: string;
  type: 'mint' | 'transfer' | 'sale';
  status: 'pending' | 'confirmed' | 'failed';
  from: string;
  to: string;
  amount?: string;
  ordinalId?: string;
  timestamp: string;
}

// Marketplace Types
export interface MarketStats {
  totalVolume: number;
  dailyVolume: number;
  totalSales: number;
  dailySales: number;
  floorPrice: string;
  averagePrice: string;
  totalListings: number;
  activeListings: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 