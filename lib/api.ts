import axios from 'axios';

const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_URL || 'https://api.reservoir.tools';

const reservoirApi = axios.create({
  baseURL: RESERVOIR_API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.NEXT_PUBLIC_RESERVOIR_API_KEY || '',
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
    
    if (response.data.collections) {
      return response.data.collections;
    }
    return [];
  } catch (error: any) {
    console.error('Error searching collections:', error?.response?.data || error?.message || error);
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
  } catch (error: any) {
    console.error('Error fetching collection:', error?.response?.data || error?.message || error);
    return null;
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
  } catch (error: any) {
    console.error('Error fetching NFTs:', error?.response?.data || error?.message || error);
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
  } catch (error: any) {
    console.error('Error fetching NFT details:', error?.response?.data || error?.message || error);
    return null;
  }
}
