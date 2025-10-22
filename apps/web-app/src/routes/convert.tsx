import { Convert } from '@/components/Convert/Convert';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

export const Route = createFileRoute('/convert')({
  component: RouteComponent,
  validateSearch: z.object({
    showChart: z.boolean().optional(),
  }),
});

function RouteComponent() {
  return (
    <div className="container mx-auto my-8 px-4">
      <Convert />
    </div>
  );
}
