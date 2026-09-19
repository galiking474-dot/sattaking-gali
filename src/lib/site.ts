export const SITE_NAME = "SattaKing-Gali";
export const SITE_URL = "https://sattaking-gali.com";

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${SITE_URL}/`).toString();
}
