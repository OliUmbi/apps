import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/latest")({
	component: RouteComponent,
});

function RouteComponent() {
	const promotions = [
		{
			title: "Rindfleisch ab XX.XX",
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae placerat ligula, sed faucibus quam. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
			image: "/images/demo/demo-rindfleisch.jpg",
			link: "/products/1",
		},
		{
			title: "Pflanzenschutz",
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae placerat ligula, sed faucibus quam. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
			image: "/images/demo/demo-pflanzenschutz.jpg",
		},
		{
			title: "Saison: Zuckermais",
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae placerat ligula, sed faucibus quam. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
			image: "/images/demo/demo-zuckermais.jpg",
			link: "/products/1",
		},
	];

	return (
		<div className="w-full max-w-4xl m-auto p-4">
			<div className="p-8">
				<h1 className="text-4xl font-bold font-serif">Aktuelles</h1>
				<h2 className="text-lg font-semibold">Lorem Ipsum</h2>
			</div>
			<div className="flex flex-col gap-8">
				{promotions.map((promotion) => (
					<div
						key={promotion.title}
						className="bg-stone-100 rounded-lg overflow-hidden shadow-md grid grid-cols-1 md:grid-cols-2"
					>
						<img
							src={promotion.image}
							alt={promotion.title}
							className="w-full aspect-video md:aspect-square object-cover"
						/>
						<div className="flex flex-col justify-between p-4">
							<div>
								<h2 className="text-lg font-semibold">{promotion.title}</h2>
								<p>{promotion.description}</p>
							</div>
							{promotion.link && (
								<Link
									to={promotion.link}
									className="font-semibold mt-4 border-b border-stone-600"
								>
									Mehr erfahren
								</Link>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
