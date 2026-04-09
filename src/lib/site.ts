/**
 * Canonical site origin for metadata, OG URLs, and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://martinmroc.sk).
 */
export function getMetadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit && explicit.length > 0) {
    const trimmed = explicit.endsWith("/") ? explicit.slice(0, -1) : explicit;
    return new URL(trimmed);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL("http://localhost:3000");
}
