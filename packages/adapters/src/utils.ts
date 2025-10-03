export function extractNameFromMagnet(magnetLink: string): string | null {
  try {
    const url = new URL(magnetLink);
    const dn = url.searchParams.get("dn");
    return dn ? decodeURIComponent(dn.replace(/\+/g, " ")) : null;
  } catch {
    return null;
  }
}
