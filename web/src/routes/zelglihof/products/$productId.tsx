import {createFileRoute} from '@tanstack/react-router'
import {Button, Field, Form, NumberField} from "@base-ui/react";
import {Minus, Plus} from "lucide-react";

export const Route = createFileRoute('/zelglihof/products/$productId')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className="flex flex-col gap-8">
            <img className="" src="/images/zelglihof/demo-rindfleisch.jpg" alt="Rindfleisch"/>
            <div className="p-8">
                <h1 className="text-3xl font-serif font-bold">Rindfleisch</h1>
                <h2 className="text-md">Mischpakete à kg xx</h2>
            </div>
            <div className="px-8">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae placerat ligula, sed faucibus quam.
                    Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <p>Nulla facilisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
                    Sed molestie non mauris tempus convallis. Vivamus a augue velit. Etiam a erat finibus, gravida magna ut, fringilla felis.</p>
            </div>
            <Form className="p-8 flex flex-col gap-4">
                <Field.Root className="flex flex-col gap-0.5">
                    <Field.Label className="font-semibold text-sm px-3 text-stone-600">Name</Field.Label>
                    <Field.Control className="font-bold border bg-stone-100 border-stone-950 rounded-md px-3 py-2"/>
                </Field.Root>
                <Field.Root className="flex flex-col gap-0.5">
                    <Field.Label className="font-semibold text-sm px-3 text-stone-600">Email</Field.Label>
                    <Field.Control className="font-bold border bg-stone-100 border-stone-950 rounded-md px-3 py-2"/>
                </Field.Root>
                <Field.Root className="flex flex-col gap-0.5">
                    <Field.Label className="font-semibold text-sm px-3 text-stone-600">Telefon</Field.Label>
                    <Field.Control className="font-bold border bg-stone-100 border-stone-950 rounded-md px-3 py-2"/>
                </Field.Root>
                <Field.Root>
                    <NumberField.Root defaultValue={1} min={1} max={100}>
                        <Field.Label className="font-semibold text-sm px-3 text-stone-600">Menge</Field.Label>
                        <NumberField.Group className="flex align-middle gap-2 border bg-stone-100 border-stone-950 rounded-md px-3 py-2">
                            <NumberField.Input className="w-full font-bold"/>
                            <NumberField.Decrement>
                                <Minus />
                            </NumberField.Decrement>
                            <NumberField.Increment>
                                <Plus />
                            </NumberField.Increment>
                        </NumberField.Group>
                    </NumberField.Root>
                    <Field.Error />
                </Field.Root>
                <p className="text-sm text-stone-700">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae placerat ligula, sed faucibus quam.</p>
                <Button className="text-stone-50 px-3 py-2 bg-amber-700 border border-amber-800 rounded-xl ">Bestellen</Button>
            </Form>
        </div>
    )
}
