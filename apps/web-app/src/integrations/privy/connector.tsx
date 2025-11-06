import { Button } from '@/components/ui/button';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSetActiveWallet } from '@privy-io/wagmi';
import { bobSepolia, rootstockTestnet } from 'viem/chains';
import { parseEther } from 'viem/utils';
import {
  useAccount,
  useDisconnect,
  usePrepareTransactionRequest,
  useSendTransaction,
  useSignMessage,
  useSwitchChain,
  type Config,
} from 'wagmi';
import type { SendTransactionVariables } from 'wagmi/query';

export const PrivyConnector = () => {
  // Privy hooks
  const {
    ready,
    user,
    authenticated,
    login,
    connectWallet,
    logout,
    linkWallet,
  } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  // WAGMI hooks
  const { address, isConnected, isConnecting, isDisconnected, chainId } =
    useAccount();
  const { disconnect } = useDisconnect();
  const { setActiveWallet } = useSetActiveWallet();
  const { switchChain } = useSwitchChain();

  if (!ready) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2">
      <div className="lg:w-1/2 border p-4">
        <h1 className="text-4xl">Privy</h1>
        {ready && !authenticated && (
          <>
            <p>You are not authenticated with Privy</p>
            <div className="flex items-center gap-4">
              <Button onClick={login}>Login with Privy</Button>
              <span>or</span>
              <Button onClick={connectWallet}>Connect only</Button>
            </div>
          </>
        )}

        {walletsReady &&
          wallets.map((wallet) => {
            return (
              <div
                key={wallet.address}
                className="flex min-w-full flex-row flex-wrap items-center justify-between gap-2 p-4"
              >
                <div>{wallet.address}</div>
                <Button
                  onClick={() => {
                    setActiveWallet(wallet);
                  }}
                >
                  Make Active
                </Button>
              </div>
            );
          })}

        {ready && authenticated && (
          <>
            <p className="mt-2">You are logged in with privy.</p>
            <Button onClick={connectWallet}>Connect another wallet</Button>
            <Button onClick={linkWallet}>Link another wallet</Button>
            <textarea
              value={JSON.stringify(wallets, null, 2)}
              className="mt-2 w-full rounded-md bg-slate-700 p-4 font-mono text-xs text-slate-50 sm:text-sm"
              rows={JSON.stringify(wallets, null, 2).split('\n').length}
              disabled
            />
            <br />
            <textarea
              value={JSON.stringify(user, null, 2)}
              className="mt-2 w-full rounded-md bg-slate-700 p-4 font-mono text-xs text-slate-50 sm:text-sm"
              rows={JSON.stringify(user, null, 2).split('\n').length}
              disabled
            />
            <br />
            <Button onClick={logout}>Logout from Privy</Button>
          </>
        )}
      </div>

      <div className="lg:w-1/2 border p-4">
        <h1 className="text-4xl">WAGMI</h1>
        {isDisconnected && <p>You are disconnected from WAGMI</p>}
        {isConnecting && <p>Connecting to WAGMI...</p>}
        {isConnected && (
          <>
            <p className="mt-2">You are connected to WAGMI</p>
            <p>Your address: {address}</p>
            <Button onClick={() => disconnect()}>Disconnect from WAGMI</Button>

            <hr className="my-4" />
            <SignMessage />

            <SendTransaction />

            <div className="mt-4">
              <p>Switch to another network: {chainId}</p>

              <Button
                onClick={() => switchChain({ chainId: rootstockTestnet.id })}
              >
                Switch to rootstock testnet
              </Button>

              <Button onClick={() => switchChain({ chainId: bobSepolia.id })}>
                Switch to bobSepolia
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SignMessage = () => {
  const { address } = useAccount();
  const { data, isPending, isSuccess, isError, signMessage } = useSignMessage({
    mutation: {
      onSuccess: () => {
        alert('Sign Message Success');
      },
    },
  });
  return (
    <>
      <h2 className="mt-6 text-2xl">useSignMessage</h2>
      <Button
        disabled={isPending}
        onClick={() => {
          signMessage({
            message: `Signing with WAGMI\nWAGMI address: ${address}`,
          });
        }}
      >
        Sign!
      </Button>
      {isSuccess && <div>Signature: {data}</div>}
      {isError && <div>Error signing message</div>}
    </>
  );
};

const SendTransaction = () => {
  const transactionRequest: SendTransactionVariables<Config, number> = {
    to: '0x2bD2201BFE156A71EB0D02837172ffc237218505'.toLowerCase() as `0x${string}`,
    value: parseEther('0.001'),
    data: '0x',
    // type: 'eip1559', // does not work for rootstock
  };

  const { data, isPending, isSuccess, sendTransaction, error } =
    useSendTransaction();

  usePrepareTransactionRequest();

  return (
    <>
      <h2 className="mt-6 text-2xl">useSendTransaction</h2>
      <div className="rounded bg-red-400 px-2 py-1 text-sm text-white">
        We recommend doing this on rootstock testnet (chainId 31).
      </div>
      <Button
        onClick={() => sendTransaction(transactionRequest as any)}
        disabled={!sendTransaction}
      >
        Send to victor
      </Button>
      {isPending && <div>Check wallet</div>}
      {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      {error && <div>Error: {error.message}</div>}
    </>
  );
};
