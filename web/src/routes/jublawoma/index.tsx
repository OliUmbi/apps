import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/jublawoma/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/jublawoma/"!</div>
}
