// src/context/AppKitProvider.jsx

import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { arbitrum, mainnet, sepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Reown Project ID
const projectId = "1ec76847572d0c3539ac5475ff3a76e9"; // ✅ your working ID

// 2. App metadata
const metadata = {
  name: "nftMarketPlace",
  description: "AppKit Example",
  url: "https://reown.com/appkit", // or your actual site if deployed
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

// 3. Supported networks
const networks = [mainnet, arbitrum, sepolia];

// 4. Create wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

// 5. Initialize AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true,
  },
});

// 6. Provider export
export function AppKitProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
