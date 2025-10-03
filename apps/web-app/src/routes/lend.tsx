import { Hero } from '@/components/Hero/Hero';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/lend')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto my-8 px-4">
      <Hero title="Lend">
        Lorem bitcoinae dollar situs ametus, consensusium adipiscing elitum, sed
        do proofus-of-workium.
      </Hero>
      Hello "/lend"!
    </div>
  );
}
