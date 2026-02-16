'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, TrendingUp, Package, Wallet, Info } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNFTStore } from '@/store/nftStore';
import { searchCollections, getNFTs, getCollection, Collection, NFT } from '@/lib/api';
import { calculateTraitStats, rankNFTsByRarity, calculateTraitRarityPercent, getTraitRarityLabel } from '@/lib/rarity';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [traitStats, setTraitStats] = useState<Record<string, Record<string, number>>>({});
  
  const { address, isConnected } = useAccount();
  const {
    nfts,
    setNFTs,
    isLoadingNFTs,
    setIsLoadingNFTs,
    selectedNFT,
    setSelectedNFT,
    selectedCollection,
    setSelectedCollection,
    error,
    setError,
  } = useNFTStore();

  const handleSearch = async () => {
    if (!inputValue.trim()) return;
    
    setIsLoadingNFTs(true);
    setError(null);
    setShowResults(true);
    
    try {
      // Check if input is a contract address or collection name
      let collection: Collection | null = null;
      
      // Try as contract address first
      if (inputValue.startsWith('0x') && inputValue.length === 42) {
        collection = await getCollection(inputValue);
      }
      
      // If not found or it's a name search
      if (!collection) {
        // Try alternative search with different query format
        const results = await searchCollections(inputValue.trim().toLowerCase());
        if (results.length > 0) {
          collection = results[0];
        }
      }

      if (!collection) {
        setError('Collection not found. The API may be rate-limited. Try again in a moment or search for a popular collection like "bored ape".');
        setIsLoadingNFTs(false);
        return;
      }
      
      setSelectedCollection(collection);
      
      // Fetch all NFTs (with pagination)
      let allNFTs: NFT[] = [];
      let cursor: string | undefined;
      
      do {
        const result = await getNFTs(collection.contract || inputValue, 'ethereum', 100, cursor);
        allNFTs = [...allNFTs, ...result.nfts];
        cursor = result.cursor;
      } while (cursor && allNFTs.length < 500);
      
      // Calculate rarity
      const stats = calculateTraitStats(allNFTs);
      setTraitStats(stats);
      const rankedNFTs = rankNFTsByRarity(allNFTs, stats);
      
      setNFTs(rankedNFTs);
    } catch (err) {
      setError('Failed to fetch collection. Please try again.');
      console.error(err);
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              RarityScanner
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isConnected && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Wallet className="w-4 h-4" />
                <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
            )}
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <section className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Discover NFT <span className="text-blue-500">Rarity</span>
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Enter any NFT collection to analyze trait rarity, calculate rarity scores, 
            and find the most valuable tokens.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter collection name or contract address..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isLoadingNFTs}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                {isLoadingNFTs ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scanning
                  </>
                ) : (
                  'Analyze'
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {error ? (
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-center">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : selectedCollection && (
                <>
                  {/* Collection Info */}
                  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <img
                        src={selectedCollection.image || '/placeholder.png'}
                        alt={selectedCollection.name}
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">{selectedCollection.name}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {selectedCollection.description || 'No description available'}
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <div className="bg-gray-800 rounded-lg px-4 py-2">
                            <span className="text-gray-400 text-sm">Floor</span>
                            <p className="font-semibold">
                              {selectedCollection.floorAskPrice 
                                ? `${(selectedCollection.floorAskPrice).toFixed(3)} ETH`
                                : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-800 rounded-lg px-4 py-2">
                            <span className="text-gray-400 text-sm">Items</span>
                            <p className="font-semibold">{selectedCollection.totalCount?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div className="bg-gray-800 rounded-lg px-4 py-2">
                            <span className="text-gray-400 text-sm">Analyzed</span>
                            <p className="font-semibold">{nfts.length.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NFT Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {nfts.slice(0, 50).map((nft, index) => (
                      <motion.div
                        key={`${nft.contract}-${nft.tokenId}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 cursor-pointer transition-colors group"
                        onClick={() => setSelectedNFT(nft)}
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <img
                            src={nft.image || '/placeholder.png'}
                            alt={nft.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {nft.rarityRank && nft.rarityRank <= 10 && (
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                              #{nft.rarityRank}
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-sm truncate">{nft.name}</p>
                          <p className="text-gray-400 text-xs">
                            Score: {nft.rarityScore?.toFixed(1) || 'N/A'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* NFT Detail Modal */}
        <AnimatePresence>
          {selectedNFT && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedNFT(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img
                    src={selectedNFT.image || '/placeholder.png'}
                    alt={selectedNFT.name}
                    className="w-full aspect-square object-cover"
                  />
                  <button
                    onClick={() => setSelectedNFT(null)}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                  >
                    ✕
                  </button>
                  {selectedNFT.rarityRank && (
                    <div className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold px-4 py-2 rounded-full">
                      Rank #{selectedNFT.rarityRank}
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{selectedNFT.name}</h3>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gray-800 rounded-lg px-4 py-2">
                      <span className="text-gray-400 text-sm">Rarity Score</span>
                      <p className="text-xl font-bold text-blue-400">
                        {selectedNFT.rarityScore?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                    {selectedNFT.floorAskPrice && (
                      <div className="bg-gray-800 rounded-lg px-4 py-2">
                        <span className="text-gray-400 text-sm">Floor</span>
                        <p className="text-xl font-bold">
                          {selectedNFT.floorAskPrice.toFixed(3)} ETH
                        </p>
                      </div>
                    )}
                  </div>

                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Traits
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedNFT.traits?.map((trait, i) => {
                      const rarityPercent = traitStats[trait.type]?.[trait.value]
                        ? calculateTraitRarityPercent(trait, traitStats as any, nfts.length)
                        : 0;
                      const label = getTraitRarityLabel(rarityPercent);
                      
                      return (
                        <div key={i} className="bg-gray-800/50 rounded-lg p-3">
                          <p className="text-gray-400 text-xs">{trait.type}</p>
                          <p className="font-medium">{trait.value}</p>
                          <p className={`text-xs ${
                            label === 'Legendary' ? 'text-purple-400' :
                            label === 'Very Rare' ? 'text-red-400' :
                            label === 'Rare' ? 'text-orange-400' :
                            label === 'Uncommon' ? 'text-green-400' :
                            'text-gray-400'
                          }`}>
                            {rarityPercent.toFixed(2)}% - {label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!showResults && (
          <div className="text-center py-20">
            <div className="bg-gray-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">How it works</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Search for any NFT collection by name or contract address. 
              We'll analyze all tokens, calculate rarity scores based on trait scarcity, 
              and rank them from rarest to most common.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Built with Next.js, Wagmi, and Reservoir API</p>
        </div>
      </footer>
    </div>
  );
}
