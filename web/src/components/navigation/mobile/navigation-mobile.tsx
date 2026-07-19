import { Drawer } from "@base-ui/react/drawer";
import { NavigationMenu } from "@base-ui/react/navigation-menu";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import type { NavigationLink } from "../navigation";

interface Props {
	links: NavigationLink[];
}

const NavigationMobile = (props: Props) => {
	return (
		<Drawer.Root swipeDirection="right">
			<Drawer.Trigger className="rounded-2xl px-4 py-3 bg-amber-300 focus:bg-amber-400 flex items-center gap-2 text-sm font-bold">
				Menu <Menu size={24} />
			</Drawer.Trigger>
			<Drawer.Portal>
				<Drawer.Backdrop className="fixed inset-0 min-h-dvh min-w-dvw bg-black opacity-25" />
				<Drawer.Viewport className="fixed inset-0 flex items-stretch justify-end p-(--viewport-padding)">
					<Drawer.Popup className="h-full w-96 max-w-[80%] bg-white p-6">
						<Drawer.Content className="h-full w-full max-w-[32rem] flex flex-col gap-4">
                            <Drawer.Close className="self-end"><X /></Drawer.Close>
                            <div className="h-full flex flex-col gap-4 justify-center">
                                <Drawer.Title>Menu</Drawer.Title>
                                <NavigationMenu.Root>
                                    <NavigationMenu.List className="flex flex-col gap-3">
                                        {props.links.map((value, index) => (
                                            <NavigationMenu.Item key={index}>
                                                <Link className="font-bold text-3xl" to={value.to}>{value.label}</Link>
                                            </NavigationMenu.Item>
                                        ))}
                                    </NavigationMenu.List>
                                </NavigationMenu.Root>
                            </div>
						</Drawer.Content>
					</Drawer.Popup>
				</Drawer.Viewport>
			</Drawer.Portal>
		</Drawer.Root>
	);
};

export default NavigationMobile;
