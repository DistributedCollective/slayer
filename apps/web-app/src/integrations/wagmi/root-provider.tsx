import { TransactionDialogProvider } from '@/components/TransactionDialog/TransactionDialog';
import { WagmiProvider } from '@privy-io/wagmi';
import { config } from './config';

export const Provider = ({ children }: { children: React.ReactNode }) => (
  <WagmiProvider config={config}>
    {children}
    <TransactionDialogProvider />
  </WagmiProvider>
);
