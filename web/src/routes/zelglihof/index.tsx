import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/zelglihof/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div>
            <p>hello world</p>
        </div>
    )
}
