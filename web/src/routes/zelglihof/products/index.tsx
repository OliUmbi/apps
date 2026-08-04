import {createFileRoute, Link} from '@tanstack/react-router'

export const Route = createFileRoute('/zelglihof/products/')({
    component: RouteComponent,
})

function RouteComponent() {

    const products = [
        {
            id: "1",
            title: "Rindfleisch",
            description: "Mischpakete à kg xx",
            button: "Vorbestellen per. XXXXXX",
            image: "/images/zelglihof/demo-rindfleisch.jpg"
        },
        {
            id: "2",
            title: "Zuckermais",
            description: "Ab XXXXXX erhältlich",
            button: "Vorbestellen",
            image: "/images/zelglihof/demo-zuckermais.jpg"
        },
        {
            id: "3",
            title: "Eier",
            description: "Immer ab Hof erhältlich",
            button: "Bestellen",
            image: "/images/zelglihof/demo-eier.jpg"
        },
        {
            id: "4",
            title: "Bohnen",
            description: "Ab XXXXXX erhältlich",
            button: "Vorbestellen",
            image: "/images/zelglihof/demo-bohnen.jpg"
        }
    ]

    return (
        <div className="flex flex-col">
            <div className="p-8">
                <h1 className="text-4xl font-bold font-serif">Produkte</h1>
                <h2 className="text-lg font-semibold">Frisch vom Hof</h2>
            </div>
            <div className="p-8">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae placerat ligula, sed faucibus quam.
                    Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <p>Nulla facilisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
                    Sed molestie non mauris tempus convallis. Vivamus a augue velit. Etiam a erat finibus, gravida magna ut, fringilla felis.</p>
            </div>
            <div className="flex flex-col gap-4 p-4">
                {
                    products.map(value => (
                        <div key={value.id} className="relative min-h-96 rounded-2xl overflow-hidden">
                            <img src={value.image} alt={value.title} className="absolute w-full h-full object-cover"/>
                            <div className="absolute w-full h-full flex flex-col justify-end p-4 gap-4 bg-linear-to-t from-black/60 to-black/10">
                                <div className="flex flex-col">
                                    <h3 className="text-4xl font-serif font-semibold text-stone-50">{value.title}</h3>
                                    <h4 className="text-sm text-stone-200">{value.description}</h4>
                                </div>
                                <Link to={value.id} className="text-stone-50 text-center px-3 py-2 bg-amber-700 border border-amber-800 rounded-xl ">{value.button}</Link>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
