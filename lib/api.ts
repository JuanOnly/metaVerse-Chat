import axios from 'axios';

const RESERVOIR_API_BASE = 'https://api.reservoir.tools';

const reservoirApi = axios.create({
  baseURL: RESERVOIR_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface NFT {
  tokenId: string;
  contract: string;
  name: string;
  image: string;
  description: string;
  traits: Trait[];
  rarityScore?: number;
  rarityRank?: number;
  floorAskPrice?: number;
  owner?: string;
}

export interface Trait {
  type: string;
  value: string;
  count: number;
}

export interface Collection {
  id: string;
  name: string;
  image: string;
  banner: string;
  description: string;
  floorAskPrice?: number;
  totalCount?: number;
  contract?: string;
}

export async function searchCollections(query: string): Promise<Collection[]> {
  try {
    const response = await reservoirApi.get('/collections/v5', {
      params: {
        name: query,
        limit: 10,
      },
    });
    return response.data.collections || [];
  } catch (error) {
    console.error('Error searching collections:', error);
    return [];
  }
}

export async function getCollection(contract: string, chain = 'ethereum'): Promise<Collection | null> {
  try {
    const response = await reservoirApi.get(`/collections/v5`, {
      params: {
        contract: contract,
        limit: 1,
      },
    });
    return response.data.collections?.[0] || null;
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
}

export async function getCollectionTraits(
  contract: string,
  chain = 'ethereum'
): Promise<Trait[]> {
  try {
    const response = await reservoirApi.get(`/collections/v5`, {
      params: {
        contract: contract,
        includeTraits: true,
      },
    });
    
    const collection = response.data.collections?.[0];
    if (!collection?.traits) return [];
    
    const traitCounts: Record<string, Record<string, number>> = {};
    const totalTokens = collection.totalCount || 1;
    
    for (const trait of collection.traits) {
      if (!traitCounts[trait.key]) {
        traitCounts[trait.key] = {};
      }
      traitCounts[trait.key][trait.value] = trait.tokenCount || 0;
    }
    
    const traits: Trait[] = [];
    for (const trait of collection.traits) {
      traits.push({
        type: trait.key,
        value: trait.value,
        count: trait.tokenCount || 0,
      });
    }
    
    return traits;
  } catch (error) {
    console.error('Error fetching traits:', error);
    return [];
  }
}

export async function getNFTs(
  contract: string,
  chain = 'ethereum',
  limit = 100,
  cursor?: string
): Promise<{ nfts: NFT[]; cursor?: string }> {
  try {
    const response = await reservoirApi.get(`/tokens/v6`, {
      params: {
        contract: contract,
        limit: Math.min(limit, 100),
        cursor: cursor,
        includeTraits: true,
        includePrice: true,
      },
    });
    
    const nfts: NFT[] = (response.data.tokens || []).map((token: any) => ({
      tokenId: token.tokenId,
      contract: token.contract,
      name: token.name || `#${token.tokenId}`,
      image: token.image || '',
      description: token.description || '',
      traits: (token.traits || []).map((t: any) => ({
        type: t.type,
        value: t.value,
        count: 1,
      })),
      floorAskPrice: token.price?.floorAskPrice,
      owner: token.owner,
    }));
    
    return {
      nfts,
      cursor: response.data.continuation,
    };
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return { nfts: [] };
  }
}

export async function getNFTDetails(
  contract: string,
  tokenId: string,
  chain = 'ethereum'
): Promise<NFT | null> {
  try {
    const response = await reservoirApi.get(`/tokens/v6`, {
      params: {
        contract: contract,
        tokenId: tokenId,
        includeTraits: true,
        includePrice: true,
      },
    });
    
    const token = response.data.tokens?.[0];
    if (!token) return null;
    
    return {
      tokenId: token.tokenId,
      contract: token.contract,
      name: token.name || `#${token.tokenId}`,
      image: token.image || '',
      description: token.description || '',
      traits: (token.traits || []).map((t: any) => ({
        type: t.type,
        value: t.value,
        count: 1,
      })),
      floorAskPrice: token.price?.floorAskPrice,
      owner: token.owner,
    };
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    return null;
  }
}
