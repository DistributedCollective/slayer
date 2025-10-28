import { Dialog } from '@/components/ui/dialog';
import { WagmiProvider } from '@privy-io/wagmi';
import { config } from './config';

export const Provider = ({ children }: { children: React.ReactNode }) => (
  <WagmiProvider config={config}>
    {children}
    <Tx />
  </WagmiProvider>
);

export const runTx = async (tx: any) => {
  console.log('Running tx:', tx);
  await new Promise((resolve) => setTimeout(resolve, 20_000));
  console.log('Tx done', tx);
};

const Tx = () => {
  return <Dialog open={true}>Transaction</Dialog>;
};
