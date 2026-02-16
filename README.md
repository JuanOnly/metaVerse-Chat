# NFT Rarity Scanner

A web3 application for analyzing NFT collection rarity scores and trait analysis. Find the rarest NFTs in any collection with detailed trait breakdowns.

## Features

- **Collection Search** - Search by collection name or contract address
- **Rarity Analysis** - Calculate rarity scores based on trait scarcity
- **Trait Breakdown** - View detailed trait information with rarity percentages
- **Rarity Rankings** - NFTs ranked from rarest to most common
- **Wallet Connection** - Connect with MetaMask via RainbowKit

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: Zustand
- **Wallet**: Wagmi + RainbowKit
- **NFT Data**: Reservoir API (multi-chain)
- **Deployment**: Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## How It Works

1. Search for any NFT collection by name or paste a contract address
2. The app fetches all NFTs from the collection via Reservoir API
3. Rarity scores are calculated based on trait frequency
4. View ranked results and click any NFT for detailed trait analysis

## API

Uses the [Reservoir API](https://reservoirprotocol.github.io/) for NFT data across multiple chains (Ethereum, Base, Arbitrum, Polygon, Solana).

## License

MIT
