import { usePrivy } from '@privy-io/react-auth';
import { Link } from '@tanstack/react-router';
import { LogOutIcon } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { Links } from './Header/Links';
import { SocialLinks } from './Header/SocialLinks';
import { ModeToggle } from './theme-toggle';
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className="px-4 py-6 flex flex-row items-center justify-between border-b border-b-stone-200 dark:border-b-stone-800">
      <div className="flex flex-row items-center justify-start gap-8">
        <Link to="/" className="flex flex-row items-center justify-start gap-4">
          <svg
            width="32"
            height="30"
            viewBox="0 0 32 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M32 19.7999C32 20.6836 31.2837 21.3999 30.4 21.3999H22.933C22.0494 21.3999 21.333 22.1162 21.333 22.9999V28.3331C21.333 29.2168 20.6167 29.9331 19.733 29.9331H1.6C0.716345 29.9331 0 29.2168 0 28.3331V10.2001C0 9.31644 0.716344 8.6001 1.6 8.6001H9.06699C9.95065 8.6001 10.667 7.88375 10.667 7.0001V1.66689C10.667 0.783239 11.3833 0.0668945 12.267 0.0668945H30.4C31.2837 0.0668945 32 0.783239 32 1.66689V19.7999Z"
              fill="#FF4500"
            />
          </svg>
          <span className="text-base text-black dark:text-white">
            Sovryn Dex
          </span>
        </Link>

        <SocialLinks />
      </div>

      <Links />

      <div className="flex flex-row items-center justify-end gap-4">
        <ModeToggle />
        <ConnectButton />
      </div>
    </header>
  );
}

function ConnectButton() {
  const { ready, authenticated, login, logout } = usePrivy();

  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    disconnect();
    logout();
  };

  if (!authenticated) {
    return (
      <Button onClick={login} disabled={!ready}>
        Connect Wallet
      </Button>
    );
  }

  if (authenticated) {
    return (
      <div className="flex flex-row gap-4 items-center">
        <div>
          {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
        </div>
        <Button
          variant="outline"
          onClick={handleDisconnect}
          disabled={!ready}
          size="icon"
        >
          <LogOutIcon />
        </Button>
      </div>
    );
  }

  return <></>;
}
