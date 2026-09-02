import { createFileRoute, Link } from "@tanstack/react-router";
import { NewsletterSignup } from "../components/newsletter-signup";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-col gap-8">
			<div className="w-full max-w-5xl p-2 m-auto">
				<div className="w-full h-128 relative rounded-3xl overflow-hidden">
					<img
						src="images/demo/demo-hof.jpg"
						alt="zelglihof"
						className="absolute w-full h-full object-cover"
					/>
					<div className="absolute w-full h-full bg-linear-to-t from-black/50 to-transparent p-8 flex flex-col justify-end gap-1">
						<h1 className="text-5xl text-stone-50 font-bold font-serif">
							Zelglihof
						</h1>
						<h2 className="text-lg text-stone-200 font-semibold">
							Dein Hof in Mägenwil
						</h2>
					</div>
				</div>
			</div>
			<div className="w-full max-w-4xl p-4 m-auto grid md:grid-cols-2 gap-4">
				<div className="flex flex-col justify-between gap-8">
					<div>
						<h2 className="text-3xl font-bold font-serif">Aktuell</h2>
						<h3 className="font-semibold text-stone-600">Das neuste vom Hof</h3>
					</div>
					<div className="flex flex-col">
						<h4 className="text-lg font-semibold">Rindfleisch ab XX.XX</h4>
						<p className="text-sm">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
							vitae placerat ligula, sed faucibus quam. Class aptent taciti
							sociosqu ad litora torquent per conubia nostra, per inceptos
							himenaeos.
						</p>
						<Link
							to="/products/$productId"
							params={{ productId: "1" }}
							className="text-sm font-semibold mt-4 px-2 py-1 bg-amber-200 rounded-md border border-amber-400"
						>
							Mehr erfahren
						</Link>
					</div>
				</div>
				<div>
					<img
						src="images/demo/demo-rindfleisch.jpg"
						alt="zelglihof"
						className="w-full aspect-square object-cover rounded-lg"
					/>
				</div>
			</div>
			<div className="w-full max-w-4xl p-4 m-auto">
				<div>
					<h2 className="text-3xl font-bold font-serif">Hofladen</h2>
					<h3 className="font-semibold text-stone-600">
						Frisch direkt vom Hof
					</h3>
				</div>
			</div>
			<div className="w-full max-w-4xl p-4 m-auto">
				<div>
					<h2 className="text-3xl font-bold font-serif">Über uns</h2>
					<h3 className="font-semibold text-stone-600">Lorem Ipsum</h3>
				</div>
			</div>
			<NewsletterSignup />
		</div>
	);
}
