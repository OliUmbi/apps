import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ScanLine } from "lucide-react";
import { Brand } from "./ui/brand";
import { Button } from "./ui/button";
import { MessageScreen } from "./ui/message-screen";
import { Body, Kicker, Title } from "./ui/text";

export function NotFound() {
	return (
		<MessageScreen
			brand={<Brand name={m.studio_brand()} />}
			code={
				<>
					<ScanLine size={18} aria-hidden="true" />
					<span>ERR / 404</span>
				</>
			}
		>
			<Kicker>{m.studio_system()}</Kicker>
			<Title as="h1">{m.studio_not_found_title()}</Title>
			<Body>{m.studio_not_found_description()}</Body>
			<div>
				<Button
					variant="primary"
					render={
						<Link
							to="/"
							search={{
								site: "zelglihof",
								area: "site",
								section: "overview",
								mode: "list",
							}}
						/>
					}
				>
					<ArrowLeft size={15} aria-hidden="true" />
					{m.studio_back_to_studio()}
				</Button>
			</div>
		</MessageScreen>
	);
}
