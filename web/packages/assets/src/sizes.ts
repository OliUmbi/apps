// The size vocabulary of the asset service; internal so consumers pass literal
// sizes through the public URL helpers instead of depending on this list.
export const publicImageSizes = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;
export type PublicImageSize = (typeof publicImageSizes)[number];
export const imageVariantSizes = [...publicImageSizes, "master"] as const;
export type ImageVariantSize = (typeof imageVariantSizes)[number];
