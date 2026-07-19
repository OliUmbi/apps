import NavigationDesktop from "./desktop/navigation-desktop";
import NavigationMobile from "./mobile/navigation-mobile";

export interface NavigationLink {
	label: string;
	to: string;
}

interface Props {
	links: NavigationLink[];
}

const Navigation = (props: Props) => {
	return (
		<>
			<div className="hidden md:flex">
				<NavigationDesktop links={props.links} />
			</div>
			<div className="md:hidden">
				<NavigationMobile links={props.links} />
			</div>
		</>
	);
};

export default Navigation;
