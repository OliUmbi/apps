import { Link } from "@tanstack/react-router";

const Footer = () => {
	const links = [
		{
			label: "Impressum",
			to: "/legal",
		},
		{
			label: "Datenschutz",
			to: "/privacy",
		},
		{
			label: "Geschäftsbedingungen",
			to: "/terms",
		},
	];

	return (
		<footer className="grid md:grid-cols-[auto_1fr_auto] gap-6 w-full max-w-4xl m-auto p-8">
			<div className="">
				<h5 className="font-serif font-bold text-lg">Zelglihof</h5>
				<h6 className="text-sm font-semibold text-stone-600">
					Dein Hof in Mägenwil
				</h6>
			</div>
			<div className="flex flex-col">
				{links.map((link) => (
					<Link to={link.to} key={link.label} className="text-sm font-semibold">
						{link.label}
					</Link>
				))}
			</div>
			<div className="flex flex-col justify-end">
				<h6 className="text-sm text-stone-600 font-bold">Made by oliumbi.ch</h6>
			</div>
		</footer>
	);
};

export default Footer;
