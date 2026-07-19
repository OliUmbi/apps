import { NavigationMenu } from "@base-ui/react/navigation-menu";
import { Link } from "@tanstack/react-router";
import type { NavigationLink } from "../navigation";

interface Props {
	links: NavigationLink[];
}

const NavigationDesktop = (props: Props) => {
	return (
		<NavigationMenu.Root>
			<NavigationMenu.List className="min-w-max">
				{props.links.map((value, index) => (
					<NavigationMenu.Item key={index}>
						<Link to={value.to}>{value.label}</Link>
					</NavigationMenu.Item>
				))}
			</NavigationMenu.List>
		</NavigationMenu.Root>
	);
};

export default NavigationDesktop;
