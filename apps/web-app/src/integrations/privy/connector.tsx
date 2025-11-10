import { Button } from '@/components/ui/button';
import { useSlayerTx } from '@/lib/transactions';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSetActiveWallet } from '@privy-io/wagmi';
import { bobSepolia, rootstockTestnet } from 'viem/chains';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';

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

  const { begin } = useSlayerTx({
    async onBeforeSign(tx) {
      console.log('onBeforeSign', tx);
      return tx.request.data;
    },
    onAfterSign(tx, res, next) {
      console.log('onAfterSign', tx, res, next);
    },
    onError(tx, error) {
      console.error('onError', tx, error);
    },
    onSuccess(tx, res) {
      console.log('onSuccess', tx, res);
    },
    onCompleted(count) {
      console.log('onCompleted', count);
    },
  });

  const onClick = async () => {
    begin(async () => {
      return [
        {
          id: 'sign-message-1',
          title: 'Sign Message 1',
          description: 'Please sign message 1',
          request: {
            type: 'message',
            data: {
              message: 'This is message 1',
              account: address!,
            },
          },
        },
      ];
    });
  };

  return (
    <>
      <h2 className="mt-6 text-2xl">useSignMessage</h2>
      <Button onClick={onClick}>Sign!</Button>
    </>
  );
};

const SendTransaction = () => {
  const { address } = useAccount();

  const { begin } = useSlayerTx();

  const onClick = async () => {
    begin(async () => {
      return [
        {
          id: 'tx1',
          title: 'Send on rootstock testnet',
          description: 'Send transaction to self on rootstock testnet',
          request: {
            type: 'transaction',
            data: {
              to: address!,
              value: 1n,
              chain: rootstockTestnet,
              account: address!,
            },
          },
        },
        {
          id: 'tx2',
          title: 'Send on bob sepolia testnet',
          description: 'Send transaction to self on bob sepolia testnet',
          request: {
            type: 'transaction',
            data: {
              to: address!,
              value: 1n,
              chain: bobSepolia,
              account: address!,
            },
          },
        },
      ];
    });
  };

  return (
    <>
      <h2 className="mt-6 text-2xl">Send Transactions</h2>
      <Button onClick={onClick}>Send to self</Button>
    </>
  );
};
