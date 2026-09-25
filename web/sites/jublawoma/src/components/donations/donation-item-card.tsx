import { m } from "@oliumbi/i18n/messages";
import { type PublicDonationItem, roundQuantity } from "../../model/donations";

export function DonationItemCard({
	item,
	selected,
	onSelect,
}: {
	item: PublicDonationItem;
	selected: boolean;
	onSelect: () => void;
}) {
	const remaining = roundQuantity(item.remaining);
	const quantity = roundQuantity(item.quantity);
	const progress = quantity > 0 ? ((quantity - remaining) / quantity) * 100 : 0;
	return (
		<article className={`donation-item ${selected ? "is-selected" : ""}`}>
			<div className="donation-item-body">
				<h3>{item.name}</h3>
				{item.description ? <p>{item.description}</p> : null}
				<div className="donation-progress" aria-hidden="true">
					<span style={{ width: `${Math.min(100, progress)}%` }} />
				</div>
				<p className="donation-remaining">
					<strong>{remaining}</strong> von {quantity} {item.unit}{" "}
					{m.jublawoma_donation_remaining()}
				</p>
			</div>
			{remaining > 0 ? (
				<button className="button dark" type="button" onClick={onSelect}>
					{selected
						? m.jublawoma_donation_selected()
						: m.jublawoma_donation_choose()}
				</button>
			) : (
				<p className="donation-complete">{m.jublawoma_donation_complete()}</p>
			)}
		</article>
	);
}
