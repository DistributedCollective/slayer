import { PrivyConnector } from '@/integrations/privy/connector';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  return (
    <div className="text-center">
      <PrivyConnector />
    </div>
  );
}
