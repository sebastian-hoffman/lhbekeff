export const BUYER_GROUPS = [
  "Shaiajut",
  "Mejafshim",
  "Teshuka",
  "Iejidim",
  "Jashuvim",
  "Shaluvim",
  "Taiasim",
  "Meiujadim",
  "Litufim",
  "Akebot",
  "Jiujim",
  "Amtabkim",
  "Jalutzim",
  "Balashim",
  "Netzaj",
  "Araiot",
  "Bardakim",
  "Nedarim",
  "Mesucan",
  "Iajad",
  "Ofek",
  "N/A",
] as const;

export type BuyerGroup = (typeof BUYER_GROUPS)[number];

export function isBuyerGroup(value: string): value is BuyerGroup {
  return (BUYER_GROUPS as readonly string[]).includes(value);
}