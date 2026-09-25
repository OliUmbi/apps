import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { Award, MapPin, Users } from "lucide-react";
export function ChefIntroduction() {
	return (
		<section className="grid lg:grid-cols-2">
			<div className="image-treatment min-h-[520px]">
				<img
					src="/images/thomas.jpg"
					alt={m.unclet_home_chef_portrait_alt()}
					className="object-top"
				/>
			</div>
			<div className="flex items-center bg-coal px-6 py-20 md:px-16 lg:px-20">
				<div>
					<p className="eyebrow text-brass">{m.unclet_chef_name()}</p>
					<h2 className="display-title mt-7 text-5xl md:text-7xl">
						{m.unclet_home_chef_title()}
					</h2>
					<p className="mt-8 max-w-xl text-lg leading-relaxed text-bone/60">
						{m.unclet_home_chef_body()}
					</p>
					<div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-bone/65">
						<span className="flex items-center gap-2">
							<Award size={17} className="text-brass" />
							{m.unclet_home_gusto_award()}
						</span>
						<span className="flex items-center gap-2">
							<MapPin size={17} className="text-brass" />
							{m.unclet_home_chef_location()}
						</span>
						<span className="flex items-center gap-2">
							<Users size={17} className="text-brass" />
							{m.unclet_home_guest_capacity()}
						</span>
					</div>
					<Link to="/about" className="button-secondary mt-10">
						{m.unclet_home_meet_chef()}
					</Link>
				</div>
			</div>
		</section>
	);
}
