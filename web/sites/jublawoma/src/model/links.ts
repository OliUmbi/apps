// Every document and contact target the site renders, defined once: the same
// registration PDF, address and Instagram profile are linked from the header,
// the join page, the footer and the legal pages.
export const registrationFormPdf = "/assets/documents/Anmeldung-Jubla-Woma.pdf";
export const calendarPdf = "/assets/documents/Jahreskalender-Jubla-Woma.pdf";
export const privacyPolicyPdf =
	"/assets/documents/Datenschutzerklärung-Jubla-Woma.pdf";
export const contactEmail = "scharleitung@jublawoma.ch";
export const contactMailto = `mailto:${contactEmail}`;
export const instagramUrl = "https://www.instagram.com/jubla_woma/";
// Canonical origin (also in public/sitemap.xml); social preview images must be
// absolute URLs, so relative asset paths are joined onto it.
export const siteOrigin = "https://jublawoma.ch";

export function absoluteUrl(path: string): string {
	return new URL(path, siteOrigin).href;
}
