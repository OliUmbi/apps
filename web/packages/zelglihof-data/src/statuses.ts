import { z } from "zod";

/*
 * Per-workflow status vocabularies, mirroring the per-workflow status domains
 * in database/README.md (plan decision D4). Shared spelling is not shared
 * meaning: each workflow owns its allowed states, so adding a state to one
 * workflow never widens another workflow's inputs. Review moderation carries
 * no status — it is the `visible` flag on unclet.review — and message delivery
 * states belong to the messaging service.
 */
export const inquiryStatusValues = [
	"new",
	"in-progress",
	"completed",
	"cancelled",
] as const;
export type InquiryStatus = (typeof inquiryStatusValues)[number];
export const inquiryStatusSchema = z.enum(inquiryStatusValues);

export const reservationStatusValues = [
	"new",
	"in-progress",
	"completed",
	"cancelled",
] as const;
export type ReservationStatus = (typeof reservationStatusValues)[number];
export const reservationStatusSchema = z.enum(reservationStatusValues);

export const subscriberStatusValues = [
	"pending",
	"active",
	"unsubscribed",
] as const;
export type SubscriberStatus = (typeof subscriberStatusValues)[number];

export const campaignStatusValues = ["draft", "queued"] as const;
export type CampaignStatus = (typeof campaignStatusValues)[number];
