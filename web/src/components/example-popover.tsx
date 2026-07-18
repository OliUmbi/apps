import { Popover } from "@base-ui/react/popover";

export default function ExamplePopover() {
	return (
		<Popover.Root>
			<Popover.Trigger>Notifications</Popover.Trigger>
			<Popover.Portal>
				<Popover.Positioner sideOffset={8}>
					<Popover.Popup>
						<Popover.Arrow />
						<Popover.Title>Notifications</Popover.Title>
						<Popover.Description className="text-3xl font-bold underline font-serif">
							You are all caught up. Good job!
						</Popover.Description>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}
