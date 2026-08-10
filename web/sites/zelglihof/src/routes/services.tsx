import {createFileRoute, Link} from '@tanstack/react-router'

export const Route = createFileRoute('/services')({
    component: RouteComponent,
})

function RouteComponent() {
    const services = [
        {
            name: "Pflanzenschutz",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum lacus in neque lobortis, quis vehicula massa accumsan. Morbi vel pretium ipsum. Nunc sed nulla nec ipsum commodo porta ac nec enim. Suspendisse ut massa libero.",
            image: "/images/demo/demo-pflanzenschutz.jpg"
        },
        {
            name: "Winterdienst",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum lacus in neque lobortis, quis vehicula massa accumsan. Morbi vel pretium ipsum. Nunc sed nulla nec ipsum commodo porta ac nec enim. Suspendisse ut massa libero.",
            image: "/images/demo/demo-winterdienst.jpg"
        },
        {
            name: "Saat",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum lacus in neque lobortis, quis vehicula massa accumsan. Morbi vel pretium ipsum. Nunc sed nulla nec ipsum commodo porta ac nec enim. Suspendisse ut massa libero.",
            image: "/images/demo/demo-saat.jpg"
        }
    ]

    return (
        <div className="flex flex-col max-w-5xl m-auto">
            <div className="p-8">
                <h1 className="text-4xl font-bold font-serif">Dienstleistungen</h1>
                <h2 className="text-lg font-semibold">Idk</h2>
            </div>
            <div className="p-8">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae placerat ligula, sed faucibus quam.
                    Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                <p>Nulla facilisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
                    Sed molestie non mauris tempus convallis. Vivamus a augue velit. Etiam a erat finibus, gravida magna ut, fringilla felis.</p>
            </div>
            <div className="flex flex-col gap-8 p-4">
                {
                    services.map((service) => (
                        <div className="overflow-hidden bg-stone-200 rounded-lg grid grid-cols-1 md:grid-cols-2 border border-stone-300 shadow-lg" key={service.name}>
                            <img src={service.image} alt={service.name} className="h-full w-full object-cover"/>
                            <div className="p-4 flex flex-col justify-between gap-4">
                                <div>
                                    <h3 className="font-serif text-2xl font-bold">{service.name}</h3>
                                    <p className="text-sm text-stone-700">{service.description}</p>
                                </div>
                                <Link to="/zelglihof/contact" className="px-3 py-2 bg-green-400 border border-green-500 rounded-md text-sm font-semibold">Kontakt aufnehmen</Link>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
