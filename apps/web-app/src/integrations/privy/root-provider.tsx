'use client';

import { PrivyProvider, type PrivyClientConfig } from '@privy-io/react-auth';
import {
  bobSepolia,
  mainnet,
  rootstock,
  rootstockTestnet,
  sepolia,
} from 'viem/chains';

const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    showWalletUIs: true,
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
  },
  appearance: {
    showWalletLoginFirst: true,
  },
  supportedChains: [mainnet, bobSepolia, sepolia, rootstock, rootstockTestnet],
};

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      clientId={import.meta.env.VITE_PRIVY_APP_CLIENT_ID}
      config={privyConfig}
    >
      {children}
    </PrivyProvider>
  );
}
