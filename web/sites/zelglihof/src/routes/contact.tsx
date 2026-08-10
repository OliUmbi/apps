import { Button, Field, Form, Select } from "@base-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

export const Route = createFileRoute("/contact")({
	component: RouteComponent,
});

function RouteComponent() {
	const types = [
		{ label: "Generell", value: "generell" },
		{ label: "Dienstleistung", value: "dienstleistung" },
		{ label: "Produkt", value: "produkt" },
		{ label: "Idk", value: "idk" },
	];

	return (
		<div className="flex flex-col items-center gap-8 md:gap-2">
			<div className="w-full max-w-2xl p-8">
				<h1 className="text-4xl font-bold font-serif">Kontakt</h1>
				<h2 className="text-lg font-semibold">Idk</h2>
			</div>
			<div className="w-full max-w-2xl p-8">
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae
					placerat ligula, sed faucibus quam. Class aptent taciti sociosqu ad
					litora torquent per conubia nostra, per inceptos himenaeos.
				</p>
				<p>
					Nulla facilisi. Vestibulum ante ipsum primis in faucibus orci luctus
					et ultrices posuere cubilia curae; Sed molestie non mauris tempus
					convallis. Vivamus a augue velit. Etiam a erat finibus, gravida magna
					ut, fringilla felis.
				</p>
			</div>
			<Form className="w-full max-w-2xl p-8 flex flex-col gap-4">
				<Field.Root className="flex flex-col gap-0.5">
					<Select.Root items={types}>
						<Select.Label className="font-semibold text-sm px-3 text-stone-600">
							Anfrage
						</Select.Label>
						<Select.Trigger className="flex align-middle justify-between gap-2 border bg-stone-100 border-stone-950 rounded-md px-3 py-2">
							<Select.Value className="font-bold" placeholder="Wählen" />
							<Select.Icon>
								<ChevronsUpDown />
							</Select.Icon>
						</Select.Trigger>
						<Select.Portal>
							<Select.Positioner
								className="outline-hidden select-none z-10"
								sideOffset={4}
							>
								<Select.Popup className="group min-w-(--anchor-width) origin-(--transform-origin) bg-stone-100 border border-stone-950">
									<Select.ScrollUpArrow className="">
										<ChevronUp />
									</Select.ScrollUpArrow>
									<Select.List className="relative">
										{types.map(({ label, value }) => (
											<Select.Item
												key={label}
												value={value}
												className="grid grid-cols-[2rem_1fr] p-0.5"
											>
												<Select.ItemIndicator className="">
													<Check size={20} />
												</Select.ItemIndicator>
												<Select.ItemText className="col-start-2">
													{label}
												</Select.ItemText>
											</Select.Item>
										))}
									</Select.List>
									<Select.ScrollDownArrow className="">
										<ChevronDown />
									</Select.ScrollDownArrow>
								</Select.Popup>
							</Select.Positioner>
						</Select.Portal>
					</Select.Root>
				</Field.Root>
				<Field.Root className="flex flex-col gap-0.5">
					<Field.Label className="font-semibold text-sm px-3 text-stone-600">
						Name
					</Field.Label>
					<Field.Control className="font-bold border bg-stone-100 border-stone-950 rounded-md px-3 py-2" />
				</Field.Root>
				<Field.Root className="flex flex-col gap-0.5">
					<Field.Label className="font-semibold text-sm px-3 text-stone-600">
						Email
					</Field.Label>
					<Field.Control className="font-bold border bg-stone-100 border-stone-950 rounded-md px-3 py-2" />
				</Field.Root>
				<Field.Root className="flex flex-col gap-0.5">
					<Field.Label className="font-semibold text-sm px-3 text-stone-600">
						Telefon
					</Field.Label>
					<Field.Control className="font-bold border bg-stone-100 border-stone-950 rounded-md px-3 py-2" />
				</Field.Root>
				<Field.Root className="flex flex-col gap-0.5">
					<Field.Label className="font-semibold text-sm px-3 text-stone-600">
						Anfrage
					</Field.Label>
					<Field.Control
						render={<textarea />}
						rows={5}
						className="font-bold border bg-stone-100 border-stone-950 rounded-md px-3 py-2"
					/>
				</Field.Root>

				<p className="text-sm text-stone-700">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae
					placerat ligula, sed faucibus quam.
				</p>
				<Button className="text-stone-50 px-3 py-2 bg-amber-700 border border-amber-800 rounded-xl ">
					Senden
				</Button>
			</Form>
		</div>
	);
}
