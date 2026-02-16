/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'avatars.dicebear.com' },
      { hostname: 'links.papareact.com' },
      { hostname: 'i.seadn.io' },
      { hostname: 'cdn.reservoir.tools' },
      { hostname: 'api.reservoir.tools' },
      { hostname: 'img.seadn.io' },
      { hostname: 'nftstorage.link' },
      { hostname: 'ipfs.io' },
      { hostname: 'gateway.pinata.cloud' },
    ],
  },
};

module.exports = nextConfig;
