import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/components')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='container mx-3'>
    <div >
      <h1>Buttons</h1>
      <div className='flex gap-3 my-3'>
        <Button variant="default">Default</Button>
        <Button variant="default" disabled>Default</Button>

        <Button variant="secondary">Secondary</Button>
        <Button variant="secondary" disabled>Secondary</Button>

        <Button variant="outline">Outline</Button>
        <Button variant="outline" disabled>Outline</Button>

        <Button variant="destructive">Destructive</Button>
        <Button variant="destructive" disabled>Destructive</Button>

        <Button variant="ghost">Ghost</Button>
        <Button variant="ghost" disabled>Ghost</Button>

        <Button variant="link">Link</Button>
        <Button variant="link" disabled>Link</Button>
      </div>
    </div>
  </div>
}
