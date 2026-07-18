import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Home
});

function Home() {

	let links = [
		"jublawoma",
		"unclet",
		"zelglihof",
		"oliumbi"
	]

	return (
		<div className="flex flex-col gap-2 p-4">
			{
				links.map((value, index) => <a href={value} className="bg-fuchsia-400 hover:bg-fuchsia-500 p-2 rounded-md font-mono" key={index}>{value}</a>)
			}
		</div>
	);
}
