import { m } from "@oliumbi/i18n/messages";
import { Mail, MapPin } from "lucide-react";

export function InquiryContact() {
	return (
		<aside className="lg:col-start-1 lg:row-start-1">
			<p className="eyebrow text-brass">{m.unclet_inquiry_contact_title()}</p>
			<div className="mt-8 space-y-6 text-bone/60">
				<a
					href="mailto:info@uncle-t.ch"
					className="flex items-center gap-3 hover:text-brass-light"
				>
					<Mail size={18} className="text-brass" />
					{m.unclet_inquiry_email_link()}
				</a>
				<div className="flex items-start gap-3">
					<MapPin size={18} className="mt-1 shrink-0 text-brass" />
					<p>
						{m.unclet_company_name()}
						<br />
						{m.unclet_street()}
						<br />
						{m.unclet_postal_address()}
					</p>
				</div>
			</div>
			<div className="rule mt-10" />
			<p className="mt-6 text-sm leading-relaxed text-bone/45">
				{m.unclet_inquiry_service_area_body()}
			</p>
		</aside>
	);
}
