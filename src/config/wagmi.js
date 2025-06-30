// src/config/wagmi.js
import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';

export const config = createConfig({
    chains: [mainnet, sepolia],
    connectors: [
        injected(), // For MetaMask and Brave
        metaMask(), // Specifically MetaMask
    ],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
});

// Example DEX contract addresses
export const CONTRACTS = {
    MOCK_USDC: "0x5555C3e9676cc559fdeE479cF0D27aD739C94dC1",
    MOCK_USDT: "0x4Fe49a53E1f8726A3cdd952eBB1AD9162C45CC29",
    POOL: "0x5B6f972f328a7A226A6d43ffE260689F773f0b27",
};