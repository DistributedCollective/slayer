import { useMemo } from 'react';
import type { Address, Chain, Hash } from 'viem';
import { useChains } from 'wagmi';

type ChainProps =
  | {
      chainId: number;
    }
  | {
      chain: Chain;
    };

type ValueProps =
  | {
      address: Address;
    }
  | {
      txHash: Hash;
    };

type LinkToExplorerProps = ValueProps &
  ChainProps & {
    className?: string;
  };

export const LinkToExplorer = (props: LinkToExplorerProps) => {
  const chains = useChains();

  const chain = useMemo(() => {
    if ('chain' in props) {
      return props.chain;
    }
    return chains.find((c) => c.id === props.chainId);
  }, [props, chains]);

  const path = useMemo(() => {
    if ('address' in props) {
      return `/address/${props.address}`;
    }
    if ('txHash' in props) {
      return `/tx/${props.txHash}`;
    }
    return '/';
  }, [props]);

  const title = useMemo(() => {
    if ('address' in props) {
      return props.address;
    }
    if ('txHash' in props) {
      return props.txHash;
    }
  }, [props, chain]);

  return (
    <a
      href={chain?.blockExplorers?.default.url + path}
      className={props.className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {title?.slice(0, 6)}...{title?.slice(-4)}
    </a>
  );
};
