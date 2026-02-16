import { NFT, Trait } from './api';

export interface TraitStats {
  [traitType: string]: {
    [traitValue: string]: number;
  };
}

export function calculateTraitStats(nfts: NFT[]): TraitStats {
  const stats: TraitStats = {};
  const totalCount = nfts.length;

  for (const nft of nfts) {
    for (const trait of nft.traits) {
      if (!stats[trait.type]) {
        stats[trait.type] = {};
      }
      if (!stats[trait.type][trait.value]) {
        stats[trait.type][trait.value] = 0;
      }
      stats[trait.type][trait.value]++;
    }
  }

  return stats;
}

export function calculateRarityScore(
  nft: NFT,
  traitStats: TraitStats,
  totalCount: number
): number {
  if (!nft.traits || nft.traits.length === 0) {
    return 0;
  }

  let rarityScore = 0;

  for (const trait of nft.traits) {
    const count = traitStats[trait.type]?.[trait.value] || 1;
    const frequency = count / totalCount;
    
    // Statistical rarity - lower frequency = higher rarity
    // Using exponential scoring for more dramatic difference
    const traitRarity = 1 / frequency;
    
    // Weight rarer traits more heavily
    rarityScore += Math.pow(traitRarity, 1.5);
  }

  // Normalize by number of traits
  return rarityScore / nft.traits.length;
}

export function calculateTraitRarityPercent(
  trait: Trait,
  traitStats: TraitStats,
  totalCount: number
): number {
  const count = traitStats[trait.type]?.[trait.value] || 1;
  return ((totalCount - count) / totalCount) * 100;
}

export function rankNFTsByRarity(nfts: NFT[], traitStats: TraitStats): NFT[] {
  const totalCount = nfts.length;
  
  return nfts
    .map((nft) => ({
      ...nft,
      rarityScore: calculateRarityScore(nft, traitStats, totalCount),
    }))
    .sort((a, b) => (b.rarityScore || 0) - (a.rarityScore || 0))
    .map((nft, index) => ({
      ...nft,
      rarityRank: index + 1,
    }));
}

export function formatRarityScore(score: number): string {
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}k`;
  }
  return score.toFixed(1);
}

export function getTraitRarityLabel(percent: number): string {
  if (percent >= 5) return 'Common';
  if (percent >= 2) return 'Uncommon';
  if (percent >= 0.5) return 'Rare';
  if (percent >= 0.1) return 'Very Rare';
  return 'Legendary';
}
