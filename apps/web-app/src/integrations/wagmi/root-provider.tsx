import { WagmiProvider } from '@privy-io/wagmi';
import { config } from './config';

export const Provider = ({ children }: { children: React.ReactNode }) => (
  <WagmiProvider config={config}>{children}</WagmiProvider>
);
