import { m } from "@oliumbi/i18n/messages";

type Label = () => string;

const actions: Record<string, Label> = {
	"account.create": m.studio_audit_action_account_create,
	"account.update": m.studio_audit_action_account_update,
	"account.delete": m.studio_audit_action_account_delete,
	"account.password": m.studio_audit_action_account_password,
	"permission.grant": m.studio_audit_action_permission_grant,
	"permission.revoke": m.studio_audit_action_permission_revoke,
	"asset.visibility": m.studio_audit_action_asset_visibility,
	"asset.delete": m.studio_audit_action_asset_delete,
	"campaign.send": m.studio_audit_action_campaign_send,
	"subscriber.unsubscribe": m.studio_audit_action_subscriber_unsubscribe,
	"subscriber.correct-email": m.studio_audit_action_subscriber_correct_email,
	"inquiry.update": m.studio_audit_action_inquiry_update,
	"review.update": m.studio_audit_action_review_update,
	"reservation.update": m.studio_audit_action_reservation_update,
	"reservation.cancel": m.studio_audit_action_reservation_cancel,
	"product-variant.archive": m.studio_audit_action_product_variant_archive,
	"product.archive": m.studio_audit_action_product_archive,
};

const entities: Record<string, Label> = {
	account: m.studio_audit_entity_account,
	image: m.studio_audit_entity_image,
	document: m.studio_audit_entity_document,
	campaign: m.studio_audit_entity_campaign,
	subscriber: m.studio_audit_entity_subscriber,
	inquiry: m.studio_audit_entity_inquiry,
	review: m.studio_audit_entity_review,
	"product-reservation": m.studio_audit_entity_product_reservation,
	"product-variant": m.studio_audit_entity_product_variant,
	product: m.studio_audit_entity_product,
};

const summaries: Record<string, Label> = {
	enabled: m.studio_audit_summary_enabled,
	disabled: m.studio_audit_summary_disabled,
	public: m.studio_audit_summary_public,
	private: m.studio_audit_summary_private,
	hidden: m.studio_audit_summary_hidden,
	new: m.studio_status_new,
	"in-progress": m.studio_status_in_progress,
	completed: m.studio_status_completed,
	cancelled: m.studio_status_cancelled,
	draft: m.studio_status_draft,
	queued: m.studio_status_queued,
	active: m.studio_status_active,
	unsubscribed: m.studio_status_unsubscribed,
	pending: m.studio_status_pending,
};

export function auditActionLabel(action: string): string {
	return actions[action]?.() ?? action;
}

export function auditEntityLabel(entity: string): string {
	return entities[entity]?.() ?? entity;
}

export function auditSummaryLabel(summary: string | null): string | null {
	if (!summary) return null;
	const recipients = /^(\d+) recipients$/.exec(summary);
	if (recipients) {
		return m.studio_audit_summary_recipients({ count: recipients[1] });
	}
	return summaries[summary]?.() ?? summary;
}
