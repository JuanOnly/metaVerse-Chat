import { create } from 'zustand';
import { NFT, Collection } from '@/lib/api';

interface NFTStore {
  // Current search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Selected collection
  selectedCollection: Collection | null;
  setSelectedCollection: (collection: Collection | null) => void;
  
  // NFTs data
  nfts: NFT[];
  setNFTs: (nfts: NFT[]) => void;
  addNFTs: (nfts: NFT[]) => void;
  
  // Loading states
  isLoadingCollections: boolean;
  setIsLoadingCollections: (loading: boolean) => void;
  isLoadingNFTs: boolean;
  setIsLoadingNFTs: (loading: boolean) => void;
  
  // Error state
  error: string | null;
  setError: (error: string | null) => void;
  
  // Pagination
  cursor: string | null;
  setCursor: (cursor: string | null) => void;
  
  // Selected NFT for details view
  selectedNFT: NFT | null;
  setSelectedNFT: (nft: NFT | null) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  searchQuery: '',
  selectedCollection: null,
  nfts: [],
  isLoadingCollections: false,
  isLoadingNFTs: false,
  error: null,
  cursor: null,
  selectedNFT: null,
};

export const useNFTStore = create<NFTStore>((set) => ({
  ...initialState,
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSelectedCollection: (collection) => set({ selectedCollection: collection }),
  
  setNFTs: (nfts) => set({ nfts }),
  
  addNFTs: (newNFTs) =>
    set((state) => ({ nfts: [...state.nfts, ...newNFTs] })),
  
  setIsLoadingCollections: (loading) => set({ isLoadingCollections: loading }),
  
  setIsLoadingNFTs: (loading) => set({ isLoadingNFTs: loading }),
  
  setError: (error) => set({ error }),
  
  setCursor: (cursor) => set({ cursor }),
  
  setSelectedNFT: (nft) => set({ selectedNFT: nft }),
  
  reset: () => set(initialState),
}));
